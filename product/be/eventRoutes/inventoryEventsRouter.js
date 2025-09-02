const { handleStockUpdated } = require('../controllers/ProductController');
const InventoryConsumer = require('../services/InventoryConsumer');

// Handle event routing
const inventoryEventsRoutes = function () {
  InventoryConsumer.onMessage(msg => {
    const topicName = msg.getDestination().getName();
    const payload = JSON.parse(msg.getBinaryAttachment());

    if (topicName.startsWith('sample-ecommerce/inventory/stock-updated')) {
      handleStockUpdated(payload);
    }
  });
};

module.exports = inventoryEventsRoutes;
