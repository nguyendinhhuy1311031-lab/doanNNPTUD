/**
 * @file product.route.js
 * @description Routes for Product CRUD operations
 */

const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const { verifyToken, roleAuthorization } = require('../middlewares');
const upload = require('../config/multer.config');

// Public routes
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);

// Admin only routes
router.post('/', verifyToken, roleAuthorization(['admin']), upload.array('images', 5), productController.createProduct);
router.put('/:id', verifyToken, roleAuthorization(['admin']), upload.array('images', 5), productController.updateProduct);
router.delete('/:id', verifyToken, roleAuthorization(['admin']), productController.deleteProduct);

// Rating route (for any authenticated user)
router.put('/:id/rating', verifyToken, productController.updateProductRating);

module.exports = router;
