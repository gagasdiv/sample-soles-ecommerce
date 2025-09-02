// models/order.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const OrderStatus = require('../constants/OrderStatus');

const Order = sequelize.define('Order', {
  customerName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM(...Object.values(OrderStatus)),
    allowNull: false,
    defaultValue: 'created',
  },
});

module.exports = Order;
