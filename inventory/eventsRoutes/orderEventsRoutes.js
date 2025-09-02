const { handleOrderCreated } = require('../controllers/InventoryController');
const OrderConsumer = require('../services/OrderConsumer');

// Handle event routing
const orderEventsRoutes = function () {
  OrderConsumer.onMessage(async msg => {
    const topicName = msg.getDestination().getName();
    const payload = JSON.parse(msg.getBinaryAttachment());

    if (topicName.startsWith('sample-ecommerce/orders/created')) {
      await handleOrderCreated(payload);
    }
  });
};

module.exports = orderEventsRoutes;
