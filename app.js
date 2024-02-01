const express = require('express');
const session = require('express-session');
const mariadb = require('mariadb');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const MySQLStore = require('express-mysql-session')(session);
const retry = require('retry');
const logger = require('./logger');

const app = express();
const PORT = process.env.PORT || 3000;

// Set the view engine to EJS
app.set('view engine', 'ejs');

const sessionStore = new MySQLStore({
  host: process.env.DB_HOST ,
  port: process.env.DB_PORT,
  user: process.env.DB_USER ,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  clearExpired: true,
  checkExpirationInterval: 900000, // Check every 15 minutes
  expiration: 86400000, // Session expiration in 1 day
});

// Middleware to parse incoming request bodies
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(session({
  store: sessionStore,
  secret: 'u5289LVn4C3oBwGaccix2E572bcPF8H2It5X00aktFRCl27bxGlM28U34E4eL2sz3Eu8o',
  resave: false,
  saveUninitialized: true,
}));

const pool = mariadb.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'your_database',
  connectionLimit: 5
});

app.get('/', async (req, res) => {
  // Check if there is a user session
  if (req.session.user) {
    // If a session exists, redirect to the profile page
    return res.redirect('/profile');
  }

  // If no session exists, render the home page
  res.render('/usr/src/app/views/index.ejs');
});
// Sign-up route
app.post('/api/signup', async (req, res) => {
  const { username, password, email } = req.body;

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  const conn = await pool.getConnection();
  try {
    // Check if the username is already taken
    const existingUser = await conn.query('SELECT * FROM users WHERE username = ?', [username]);
    if (existingUser.length > 0) {
      logger.warn(`[${new Date().toISOString()}] Signup failed - Username '${username}' is already taken`);
      return res.status(400).json({ error: 'Username is already taken' });
    }

    // Check if the username is already taken
    const existingEmail = await conn.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existingEmail.length > 0) {
      logger.warn(`[${new Date().toISOString()}] Signup failed - Email '${email}' is already used`);
      return res.status(400).json({ error: 'Email is already used' });
    }

    // Insert the new user into the database
    await conn.query('INSERT INTO users (username, password, email) VALUES (?, ?, ?)', [username, hashedPassword, email]);

    logger.info(`[${new Date().toISOString()}] User signed up: ${username}`);
    res.status(201).json({ success: true, message: 'User created successfully' });
  } catch (error) {
    logger.error(`[${new Date().toISOString()}] Error during signup:`, error);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    conn.release();
  }
});

// Sign-in route
app.post('/api/signin', async (req, res) => {
  const { username, password } = req.body;

  const conn = await pool.getConnection();
  try {
    // Retrieve user from the database
    const users = await conn.query('SELECT * FROM users WHERE username = ?', [username]);

    // Check if a user with the given username exists
    if (users.length === 0) {
      logger.warn(`[${new Date().toISOString()}] Signin failed - Invalid username: ${username}`);
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Compare the provided password with the hashed password in the database
    const user = users[0];
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      logger.warn(`[${new Date().toISOString()}] Signin failed - Invalid password for username: ${username}`);
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    req.session.user = {
      id: user.id,
      username: user.username,
      email: user.email,
    };

    logger.info(`[${new Date().toISOString()}] User signed in: ${username}`);
    res.redirect('/profile');
  } catch (error) {
    logger.error(`[${new Date().toISOString()}] Error during signin:`, error);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    conn.release();
  }
});

app.get('/profile', async (req, res) => {
  // Check if the user is authenticated
  if (!req.session.user) {
    return res.status(401).json({ error: 'Unauthorized access' });
  }

  const conn = await pool.getConnection();
  try {
    // Fetch total karma points
    const totalPoints = await getUserTotalPoints(req.session.user.id);

    // Return user profile information including total points
    //   res.status(200).json({ user, totalPoints });

    // Render the profile page with user information and total points
    res.render('profile', { user: { ...req.session.user, totalPoints } });

   //s res.render('profile', { user, totalPoints });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    conn.release();
  }
});

app.post('/api/reward/like', async (req, res) => {
  const userId = req.session.user.id;
  const actionType = 'like';
  const points = 1;

  await rewardUser(userId, actionType, points);
  res.redirect('/profile');
});

// Import your database functions (e.g., rewardUser, getUserTotalPoints, etc.)

// Assume `pool` is your database connection pool

async function rewardUser(userId, actionType, points) {
  const conn = await pool.getConnection();

  try {
    // Create a new record for the rewarded action in UserInteractions
    await conn.query('INSERT INTO UserInteractions (user_id, action_type) VALUES (?, ?)', [userId, actionType]);

    logger.info(`[${new Date().toISOString()}] User rewarded with points - UserID: ${userId}, ActionType: ${actionType}, Points: ${points}`);

    // Update the total_points in KarmaPoints
    await conn.query('INSERT INTO KarmaPoints (user_id, total_points) VALUES (?, ?) ON DUPLICATE KEY UPDATE total_points = total_points + VALUES(total_points)', [userId, points]);
  } catch (error) {
    logger.error(`[${new Date().toISOString()}] Error during rewardUser:`, error);
  } finally {
    conn.release(); // Release the connection back to the pool
  }
}

// Example: Function to get a user's total points
async function getUserTotalPoints(userId) {
  const conn = await pool.getConnection();

  try {
    const result = await conn.query('SELECT total_points FROM KarmaPoints WHERE user_id = ?', [userId]);
    return result[0] ? result[0].total_points : 0;
  } finally {
    conn.release(); // Release the connection back to the pool
  }
}

// Example: Function to update points for a specific action type
async function updatePointsForAction(userId, newPoints) {
  const conn = await pool.getConnection();

  try {
    await conn.query('UPDATE KarmaPoints SET total_points = ? WHERE user_id = ?', [newPoints, userId]);
  } finally {
    conn.release(); // Release the connection back to the pool
  }
}

// Example: Function to undo a rewarded action
async function undoRewardedAction(userId, actionType) {
  const conn = await pool.getConnection();

  try {
    // Delete the record from UserInteractions
    await conn.query('DELETE FROM UserInteractions WHERE user_id = ? AND action_type = ?', [userId, actionType]);

    // Update the total_points in KarmaPoints
    const newPoints = await getUserTotalPoints(userId);
    await conn.query('UPDATE KarmaPoints SET total_points = ? WHERE user_id = ?', [newPoints, userId]);
  } finally {
    conn.release(); // Release the connection back to the pool
  }
}

// API endpoint to reward users with points for posting
app.post('/api/reward/post', async (req, res) => {
  const userId = req.session.user.id;
  const actionType = 'post';
  const points = 2;

  await rewardUser(userId, actionType, points);
  res.redirect('/profile');
});

// Logout route
app.get('/logout', (req, res) => {
  // Destroy the user's session
  req.session.destroy((err) => {
    if (err) {
      console.error('Error during logout:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    // Redirect the user to the homepage or any other desired page
    res.redirect('/');
  });
});


// Function to check if the database is ready
async function isDatabaseReady() {
  try {
    const conn = await pool.getConnection();
    conn.release();
    return true;
  } catch (error) {
    console.log('Database not ready. Retrying...');
    return false;
  }
}

// Retry options
const retryOptions = {
  retries: 10,
  factor: 2,
  minTimeout: 1000,
  maxTimeout: 10000,
};

// Use retry to wait for the database to be ready
const operation = retry.operation(retryOptions);
operation.attempt(async function() {
  if (await isDatabaseReady()) {
    // Start your application
    app.listen(PORT, () => {
      logger.info(`[${new Date().toISOString()}] Server is running on port ${PORT}`);
    });
  } else {
    operation.retry(new Error('Database not ready'));
  }
});
