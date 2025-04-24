const mysql = require('mysql2/promise');

async function createDatabaseConnection() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
  });
  console.log('✅ Connected to MySQL database.');
  return connection;
}

module.exports = createDatabaseConnection;
