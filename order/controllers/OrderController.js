// controllers/OrderController.js
const OrderStatus = require('../constants/OrderStatus');
const { Order, OrderItem } = require('../models');
const orderPublisher = require('../services/OrderPublisher');

// Stub function for publishing events (replace with actual Solace integration)
async function publishOrderCreatedEvent(data) {
  console.log(`Publishing event: orderCreated`, data);
  await orderPublisher.sendOrderCreatedEvent(data);
}

exports.createOrder = async (req, res) => {
  try {
    const { customerName, items } = req.body;

    // Basic validation
    if (!customerName || !Array.isArray(items) || items.length === 0) {
      return res
        .status(400)
        .json({ error: 'Missing or invalid order details' });
    }

    // Create the order record
    const order = await Order.create({
      customerName,
      status: OrderStatus.CREATED,
    });

    // Create associated order items (linking via the foreign key OrderId)
    const orderItems = items.map(item => ({
      productId: item.productId,
      quantity: item.quantity,
      OrderId: order.id,
    }));
    await OrderItem.bulkCreate(orderItems);

    // Build event payload
    const eventPayload = {
      orderId: order.id,
      customerName: order.customerName,
      items,
      timestamp: new Date().toISOString(),
    };

    // Publish the OrderCreated event
    await publishOrderCreatedEvent(eventPayload);

    res.status(201).json({
      message: 'Order created and event published',
      orderId: order.id,
    });
  } catch (error) {
    console.error('Error processing order:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.updateOrderStatus = async (orderId, status) => {
  try {
    await Order.update({ status }, { where: { id: orderId } });
    console.log(`Order ${orderId} status updated to ${status}`);
  } catch (error) {
    console.error(
      `Failed to update order ${orderId} status to ${status}:`,
      error,
    );
  }
};

exports.handleInventoryChecked = async ({ orderId }) => {
  await exports.updateOrderStatus(orderId, OrderStatus.CHECKED);
};
exports.handleInventoryRejected = async ({ orderId }) => {
  await exports.updateOrderStatus(orderId, OrderStatus.REJECTED);
};
exports.handlePaymentCompleted = async ({ orderId }) => {
  await exports.updateOrderStatus(orderId, OrderStatus.PAID);
};
exports.handlePaymentFailed = async ({ orderId }) => {
  await exports.updateOrderStatus(orderId, OrderStatus.REJECTED);
};
exports.handleShippingStarted = async ({ orderId }) => {
  await exports.updateOrderStatus(orderId, OrderStatus.SHIPPED);
};
exports.handleShippingArrived = async ({ orderId }) => {
  await exports.updateOrderStatus(orderId, OrderStatus.COMPLETED);
};
