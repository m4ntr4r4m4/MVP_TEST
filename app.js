const express = require('express');
const mariadb = require('mariadb');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// Set the view engine to EJS
app.set('view engine', 'ejs');

// Middleware to parse incoming request bodies
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const pool = mariadb.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'your_database',
  connectionLimit: 5
});

app.get('/', (req, res) => {
  res.render('/usr/src/app/views/index.ejs');
});

// Sign-up route
app.post('/signup', async (req, res) => {
  const { username, password, email } = req.body;

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  const conn = await pool.getConnection();
  try {
    // Check if the username is already taken
    const existingUser = await conn.query('SELECT * FROM users WHERE username = ?', [username]);
    if (existingUser.length > 0) {
      return res.status(400).json({ error: 'Username is already taken' });
    }

    // Check if the username is already taken
    const existingEmail = await conn.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existingEmail.length > 0) {
      return res.status(400).json({ error: 'Email is already used' });
    }


    // Insert the new user into the database
    await conn.query('INSERT INTO users (username, password, email) VALUES (?, ?, ?)', [username, hashedPassword, email]);

    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    console.error('Error during signup:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    conn.release();
  }
});

// Sign-in route
app.post('/signin', async (req, res) => {
  const { username, password } = req.body;

  const conn = await pool.getConnection();
  try {
    // Retrieve user from the database
    const users = await conn.query('SELECT * FROM users WHERE username = ?', [username]);

    // Check if a user with the given username exists
    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Compare the provided password with the hashed password in the database
    const user = users[0]; // Assuming you're only expecting one user with the given username
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // You can customize the response based on your requirements
  //  res.status(200).json({ message: 'Sign-in successful', user: { username: user.username, email: user.email } });
    res.redirect('/profile');
  } catch (error) {
    console.error('Error during signin:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    conn.release();
  }
});


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

