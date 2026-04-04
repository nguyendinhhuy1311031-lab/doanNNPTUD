/**
 * @file category.route.js
 * @description Routes for Category CRUD operations
 */

const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');
const { verifyToken, roleAuthorization } = require('../middlewares');
const upload = require('../config/multer.config');

// Public routes
router.get('/', categoryController.getAllCategories);
router.get('/:id', categoryController.getCategoryById);

// Admin only routes
router.post('/', verifyToken, roleAuthorization(['admin']), upload.single('image'), categoryController.createCategory);
router.put('/:id', verifyToken, roleAuthorization(['admin']), upload.single('image'), categoryController.updateCategory);
router.delete('/:id', verifyToken, roleAuthorization(['admin']), categoryController.deleteCategory);

module.exports = router;
