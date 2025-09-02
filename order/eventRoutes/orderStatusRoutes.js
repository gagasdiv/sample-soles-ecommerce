const {
  handleInventoryChecked,
  handleInventoryRejected,
  handlePaymentFailed,
  handlePaymentCompleted,
  handleShippingStarted,
  handleShippingArrived,
} = require('../controllers/OrderController');
const OrderStatusConsumer = require('../services/OrderStatusConsumer');

// Handle event routing
const orderStatusRoutes = function () {
  OrderStatusConsumer.onMessage(async msg => {
    const topicName = msg.getDestination().getName();
    const payload = JSON.parse(msg.getBinaryAttachment());

    console.log('----- orderStatusRoutes', topicName, payload);

    if (topicName.startsWith('sample-ecommerce/inventory/checked')) {
      await handleInventoryChecked(payload);
    } else if (topicName.startsWith('sample-ecommerce/inventory/rejected')) {
      await handleInventoryRejected(payload);
    } else if (topicName.startsWith('sample-ecommerce/payment/processed')) {
      await handlePaymentCompleted(payload);
    } else if (topicName.startsWith('sample-ecommerce/payment/failed')) {
      await handlePaymentFailed(payload);
    } else if (topicName.startsWith('sample-ecommerce/shipping/started')) {
      await handleShippingStarted(payload);
    } else if (topicName.startsWith('sample-ecommerce/shipping/arrived')) {
      await handleShippingArrived(payload);
    }
  });
};

module.exports = orderStatusRoutes;
