/**
 * @file order.route.js
 * @description Routes for Order CRUD operations
 */

const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const { verifyToken, roleAuthorization } = require('../middlewares');

// All routes require authentication
router.post('/', verifyToken, orderController.createOrder);
router.get('/user/my-orders', verifyToken, orderController.getUserOrders);
router.get('/:id', verifyToken, orderController.getOrderById);

// Admin only routes
router.get('/', verifyToken, roleAuthorization(['admin']), orderController.getAllOrders);
router.put('/:id/status', verifyToken, roleAuthorization(['admin']), orderController.updateOrderStatus);
router.put('/:id/cancel', verifyToken, orderController.cancelOrder);

module.exports = router;
