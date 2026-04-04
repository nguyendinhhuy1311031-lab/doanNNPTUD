/**
 * @file comment.controller.js
 * @description Controller for Comment CRUD operations
 */

const db = require('../models');
const Comment = db.comment;
const Product = db.product;

// Create Comment
exports.createComment = async (req, res) => {
    try {
        const { productId, rating, text } = req.body;

        if (!productId || !rating || !text) {
            return res.status(400).json({ 
                message: 'Sản phẩm, đánh giá và nội dung bình luận là bắt buộc' 
            });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({ message: 'Đánh giá phải từ 1 đến 5' });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Sản phẩm không tìm thấy' });
        }

        const comment = new Comment({
            product: productId,
            user: req.user.id,
            rating,
            text
        });

        await comment.save();
        await comment.populate('user', 'name email');
        await comment.populate('product', 'name');

        res.status(201).json({
            message: 'Bình luận được tạo thành công',
            data: comment
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all Comments for a Product
exports.getProductComments = async (req, res) => {
    try {
        const comments = await Comment.find({ product: req.params.productId })
            .populate('user', 'name email')
            .sort({ createdAt: -1 });

        res.status(200).json({
            message: 'Lấy danh sách bình luận thành công',
            data: comments
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get Comment by ID
exports.getCommentById = async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id)
            .populate('user', 'name email')
            .populate('product', 'name');

        if (!comment) {
            return res.status(404).json({ message: 'Bình luận không tìm thấy' });
        }

        res.status(200).json({
            message: 'Lấy bình luận thành công',
            data: comment
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update Comment
exports.updateComment = async (req, res) => {
    try {
        const { rating, text } = req.body;

        const comment = await Comment.findById(req.params.id);
        if (!comment) {
            return res.status(404).json({ message: 'Bình luận không tìm thấy' });
        }

        if (comment.user.toString() !== req.user.id.toString() && !req.user.role.includes('admin')) {
            return res.status(403).json({ message: 'Bạn không có quyền chỉnh sửa bình luận này' });
        }

        if (rating && (rating < 1 || rating > 5)) {
            return res.status(400).json({ message: 'Đánh giá phải từ 1 đến 5' });
        }

        if (rating) comment.rating = rating;
        if (text) comment.text = text;

        await comment.save();
        await comment.populate('user', 'name email');
        await comment.populate('product', 'name');

        res.status(200).json({
            message: 'Cập nhật bình luận thành công',
            data: comment
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete Comment
exports.deleteComment = async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);
        if (!comment) {
            return res.status(404).json({ message: 'Bình luận không tìm thấy' });
        }

        if (comment.user.toString() !== req.user.id.toString() && !req.user.role.includes('admin')) {
            return res.status(403).json({ message: 'Bạn không có quyền xóa bình luận này' });
        }

        await Comment.findByIdAndDelete(req.params.id);

        res.status(200).json({ message: 'Xóa bình luận thành công' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Like Comment
exports.likeComment = async (req, res) => {
    try {
        const comment = await Comment.findByIdAndUpdate(
            req.params.id,
            { $inc: { likes: 1 } },
            { new: true }
        ).populate('user', 'name email')
            .populate('product', 'name');

        if (!comment) {
            return res.status(404).json({ message: 'Bình luận không tìm thấy' });
        }

        res.status(200).json({
            message: 'Thích bình luận thành công',
            data: comment
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
