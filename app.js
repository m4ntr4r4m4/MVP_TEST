const express = require('express');
const mariadb = require('mariadb');
const app = express();
const PORT = process.env.PORT;

const pool = mariadb.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectionLimit: 5
});

app.get('/', async (req, res) => {
 // const conn = await pool.getConnection();
 // const rows = await conn.query('SELECT * FROM your_table');
 // conn.release();
 // res.json(rows);
 console.log("connected");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

