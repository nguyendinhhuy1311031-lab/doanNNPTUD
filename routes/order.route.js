/**
 * @file order.route.js
 * @description Routes for Order CRUD operations
 */

var express = require('express');
var router = express.Router();
let order = require('../controllers/order.controller');
let middlewares = require('../middlewares');
let verifyToken = middlewares.verifyToken;
let roleAuthorization = middlewares.roleAuthorization;

// All routes require authentication
router.post('/', verifyToken, async function (req, res, next) {
    await order.createOrder(req, res, next);
});

router.get('/user/my-orders', verifyToken, async function (req, res, next) {
    await order.getUserOrders(req, res, next);
});

router.get('/:id', verifyToken, async function (req, res, next) {
    await order.getOrderById(req, res, next);
});

// Admin only routes
router.get('/', verifyToken, roleAuthorization(['admin']), async function (req, res, next) {
    await order.getAllOrders(req, res, next);
});

router.put('/:id/status', verifyToken, roleAuthorization(['admin']), async function (req, res, next) {
    await order.updateOrderStatus(req, res, next);
});

router.put('/:id/cancel', verifyToken, async function (req, res, next) {
    await order.cancelOrder(req, res, next);
});

module.exports = router;
