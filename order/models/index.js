// models/index.js
const sequelize = require('../config/database');
const Order = require('./Order');
const OrderItem = require('./OrderItem');

// An Order has many OrderItems, and an OrderItem belongs to an Order
Order.hasMany(OrderItem, { as: 'items' });
OrderItem.belongsTo(Order);

module.exports = { sequelize, Order, OrderItem };
