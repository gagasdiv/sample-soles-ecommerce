const {
  handleAdminProductCreated,
  handleAdminStockUpdated,
} = require('../controllers/InventoryController');
const ProductConsumer = require('../services/ProductConsumer');

// Handle event routing
const productEventsRoutes = function () {
  ProductConsumer.onMessage(async msg => {
    const topicName = msg.getDestination().getName();
    const payload = JSON.parse(msg.getBinaryAttachment());

    if (topicName.startsWith('sample-ecommerce/products/created')) {
      await handleAdminProductCreated(payload);
    } else if (
      topicName.startsWith('sample-ecommerce/products/stock-updated')
    ) {
      await handleAdminStockUpdated(payload);
    }
  });
};

module.exports = productEventsRoutes;
