// routes/orderRoutes.js
const express = require('express');
const router = express.Router();
const orderController = require('../controllers/OrderController');
const { Order, OrderItem } = require('../models');

// POST /order to create a new order
router.post('/', orderController.createOrder);

router.get('/', async (req, res) => {
  try {
    const orders = await Order.findAll({
      order: [['createdAt', 'DESC']],
      include: [{ model: OrderItem, as: 'items' }],
    });
    // console.log('le orders', orders);
    res.json(orders);
  } catch (error) {
    console.error('Failed to fetch orders:', error);
    res.status(500).json({ error: 'Failed to retrieve orders' });
  }
});

module.exports = router;
