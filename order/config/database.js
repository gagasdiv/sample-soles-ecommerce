// config/database.js
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
  // dialect: process.env.DB_DIALECT || 'sqlite',
  // storage: process.env.DB_STORAGE || './order.sqlite',
  dialect: process.env.DB_DIALECT || 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  logging: false, // Optional: Disable Sequelize logs for cleaner output
  pool: {
    max: 10, // Maximum connections
    min: 0,
    acquire: 30000, // Maximum time (ms) to try to get a connection
    idle: 10000, // Maximum idle time before connection release
  },
});

module.exports = sequelize;
