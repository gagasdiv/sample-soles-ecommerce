const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Stock = sequelize.define('Stock', {
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true, // Ensure one entry per product
  },
  stock: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

module.exports = Stock;
