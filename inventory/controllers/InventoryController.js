const { Stock } = require('../models');
const solaceClient = require('../integrations/solaceClient');
const sequelize = require('../config/database');
const {
  sendInventoryEvent,
  sendArbitraryEvent,
} = require('../services/InventoryPublisher');
const { Op } = require('sequelize');
const { waitRandom } = require('../utils/timing');

async function handleAdminProductCreated(product) {
  await Stock.findOrCreate({
    where: { productId: product.id },
    defaults: { stock: product.initialStock || 0 },
  });

  console.log(`Stock entry created for product ID ${product.id}`);
}

async function handleOrderCreated(order) {
  console.log('Received OrderCreated:', order);

  const transaction = await sequelize.transaction();

  try {
    let unavailableItems = [];
    const stockEntries = {};

    for (const item of order.items) {
      const stockEntry = await Stock.findOne({
        where: { productId: item.productId },
        transaction,
        lock: transaction.LOCK.UPDATE, // 🔒 Prevent race conditions
      });
      stockEntries[item.productId] = stockEntry;

      if (!stockEntry || stockEntry.stock < item.quantity) {
        unavailableItems.push(item);
      }
    }

    if (unavailableItems.length > 0) {
      await transaction.rollback();

      sendInventoryEvent(`rejected/${order.orderId}`, {
        orderId: order.orderId,
        status: 'failed',
        unavailableItems,
        timestamp: new Date().toISOString(),
      });

      return;
    }

    // ✅ Deduct stock if all items are available
    for (const item of order.items) {
      const newStock = stockEntries[item.productId].stock - item.quantity;

      await Stock.update(
        { stock: newStock },
        { where: { productId: item.productId }, transaction },
      );

      // 🔹 Emit `StockUpdated` for each updated product
      sendInventoryEvent(`stock-updated/${item.productId}`, {
        productId: item.productId,
        change: -item.quantity,
        timestamp: new Date().toISOString(),
      });
    }

    await transaction.commit();

    sendInventoryEvent(`checked/${order.orderId}`, {
      orderId: order.orderId,
      status: 'success',
      timestamp: new Date().toISOString(),
    });

    // ===== SIMULATE SUCCESS PROGRESSION ===== //
    simulateSuccess(order.orderId); // no await
  } catch (error) {
    await transaction.rollback();
    console.error('Error processing order:', error);
  }
}

async function handleAdminStockUpdated(stockUpdate) {
  const { productId, change } = stockUpdate;
  console.log(`===== ADMIN STOCK UPDATE =====`);
  console.log(`payload:`, stockUpdate);

  const stockEntry = await Stock.findOne({ where: { productId } });

  if (stockEntry) {
    await Stock.update(
      { stock: sequelize.literal(`stock + ${change}`) },
      { where: { productId } },
    );
    console.log(
      `Stock updated by admin for product ${productId}, change: ${change}`,
    );

    const stockEntry = await Stock.findOne({ where: { productId } });
    console.log('Stock is now:', stockEntry.stock);
  } else {
    console.log(`Product not found: ${productId}`);
  }

  console.log(`===== END ADMIN STOCK UPDATE =====`);
}

async function simulateSuccess(orderId) {
  const payload = { orderId };

  console.log(`--- Simulating order progression, id: ${orderId} ---`);

  // Simulate payment success
  await waitRandom(2500, 3000);
  sendArbitraryEvent(`payment/processed/${orderId}`, payload);

  // Simulate shipping started
  await waitRandom(1000, 2500);
  sendArbitraryEvent(`shipping/started/${orderId}`, payload);

  // Simulate shipping arrived
  await waitRandom(4000, 8000);
  sendArbitraryEvent(`shipping/arrived/${orderId}`, payload);

  console.log(`--- END: Order progression completed, id: ${orderId} ---`);
}

module.exports = {
  handleAdminProductCreated,
  handleAdminStockUpdated,
  handleOrderCreated,
};
