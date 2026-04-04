/**
 * @file comment.route.js
 * @description Routes for Comment CRUD operations
 */

const express = require('express');
const router = express.Router();
const commentController = require('../controllers/comment.controller');
const { verifyToken } = require('../middlewares');

// Public routes
router.get('/product/:productId', commentController.getProductComments);
router.get('/:id', commentController.getCommentById);

// Authenticated user routes
router.post('/', verifyToken, commentController.createComment);
router.put('/:id', verifyToken, commentController.updateComment);
router.delete('/:id', verifyToken, commentController.deleteComment);
router.put('/:id/like', verifyToken, commentController.likeComment);

module.exports = router;

module.exports = router;
