const express = require('express');
const router = express.Router();
const productController = require('../controllers/ProductController');

// GET all products
router.get('/', productController.getAllProducts);

// GET single product by id
router.get('/:id', productController.getProductById);

// POST create a new product
router.post('/', productController.createProduct);

// PUT update a product by id
router.put('/:id', productController.updateProduct);

// DELETE a product by id
router.delete('/:id', productController.deleteProduct);

module.exports = router;
