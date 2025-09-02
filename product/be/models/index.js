const sequelize = require('../config/database');
const Product = require('./Product');

const db = {};
db.Sequelize = require('sequelize');
db.sequelize = sequelize;
db.Product = Product;

db.populate = async () => {
  // If products are empty, populate table
  const productsCount = await Product.count();
  if (productsCount == 0) {
    console.log('Populating products...');
    await Product.bulkCreate([
      { id: 1, name: 'Wireless Mouse', price: 25.99, stock: 50 },
      { id: 2, name: 'Mechanical Keyboard', price: 89.99, stock: 20 },
      { id: 3, name: 'Gaming Headset', price: 59.99, stock: 15 },
      { id: 4, name: '27-inch Monitor', price: 199.99, stock: 10 },
      { id: 5, name: 'USB-C Cable', price: 9.99, stock: 100 },
      { id: 6, name: 'External Hard Drive (1TB)', price: 69.99, stock: 25 },
      { id: 7, name: 'Webcam 1080p', price: 39.99, stock: 30 },
      { id: 8, name: 'Laptop Stand', price: 29.99, stock: 40 },
    ]);
  }

  console.log('Database populated.');
};

module.exports = db;
