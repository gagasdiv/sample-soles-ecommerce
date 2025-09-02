const { Product, sequelize } = require('../models');
const { sendProductEvent } = require('../services/ProductPublisher');

exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.findAll({ order: [['id', 'ASC']] });
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching products' });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching product' });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const { name, price, stock } = req.body;
    const newProduct = await Product.create({ name, price, stock });

    sendProductEvent(`created/${newProduct.id}`, {
      productId: newProduct.id,
      initialStock: stock,
      adminId: req.user?.id || 'unknown',
      timestamp: new Date().toISOString(),
    });

    res.status(201).json(newProduct);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error creating product' });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { name, price, stock } = req.body;
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    const stockDiff = stock - product.stock;

    product.name = name || product.name;
    product.price = price || product.price;
    product.stock = stock !== undefined ? stock : product.stock;
    await product.save();

    sendProductEvent(`stock-updated/${product.id}`, {
      productId: product.id,
      change: stockDiff,
      reason: 'AdminStockUpdate',
      adminId: req.user?.id || 'unknown',
      timestamp: new Date().toISOString(),
    });

    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error updating product' });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    await product.destroy();
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error deleting product' });
  }
};

exports.handleStockUpdated = async function (stockUpdate) {
  const { productId, change } = stockUpdate;
  console.log('===== STOCK UPDATE =====');
  console.log('Product id:', productId, ', stock change:', change);

  const product = await Product.findByPk(productId);

  if (product) {
    await Product.update(
      { stock: sequelize.literal(`stock + ${change}`) },
      { where: { id: productId } },
    );
    console.log(`Stock updated for product ${productId}, change: ${change}`);

    const product = await Product.findByPk(productId);
    console.log(`Stock is now: ${product.stock}`);
  } else {
    console.log('Product not found');
  }

  console.log('===== END STOCK UPDATE =====');
};
