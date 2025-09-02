// models/index.js
const sequelize = require('../config/database');
const Stock = require('./Stock');

const db = {};
db.Sequelize = require('sequelize');
db.sequelize = sequelize;
db.Stock = Stock;

db.populate = async () => {
  // If products are empty, populate table
  const stocksCount = await Stock.count();
  if (stocksCount == 0) {
    console.log('Populating product stocks...');
    await Stock.bulkCreate([
      { productId: 1, stock: 50 },
      { productId: 2, stock: 20 },
      { productId: 3, stock: 15 },
      { productId: 4, stock: 10 },
      { productId: 5, stock: 100 },
      { productId: 6, stock: 25 },
      { productId: 7, stock: 30 },
      { productId: 8, stock: 40 },
    ]);
  }

  console.log('Database populated.');
};

module.exports = db;
