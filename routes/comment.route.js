/**
 * @file comment.route.js
 * @description Routes for Comment CRUD operations
 */

var express = require('express');
var router = express.Router();
let comment = require('../controllers/comment.controller');
let { verifyToken } = require('../middlewares');

// Public routes
router.get('/product/:productId', async function (req, res, next) {
    await comment.getProductComments(req, res, next);
});

router.get('/:id', async function (req, res, next) {
    await comment.getCommentById(req, res, next);
});

// Authenticated user routes
router.post('/', verifyToken, async function (req, res, next) {
    await comment.createComment(req, res, next);
});

router.put('/:id', verifyToken, async function (req, res, next) {
    await comment.updateComment(req, res, next);
});

router.delete('/:id', verifyToken, async function (req, res, next) {
    await comment.deleteComment(req, res, next);
});

router.put('/:id/like', verifyToken, async function (req, res, next) {
    await comment.likeComment(req, res, next);
});

module.exports = router;
