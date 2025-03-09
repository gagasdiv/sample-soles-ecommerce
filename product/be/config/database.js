require('dotenv').config();

const { Sequelize } = require('sequelize');
// const SQLite = require('sqlite3');

const sequelize = new Sequelize({
  dialect: process.env.DB_DIALECT || 'sqlite',
  storage: process.env.DB_STORAGE || './database.sqlite',
});

module.exports = sequelize;
