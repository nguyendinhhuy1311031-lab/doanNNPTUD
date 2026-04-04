/**
 * @file product.controller.js
 * @description Controller for Product CRUD operations
 */

const db = require('../models');
const Product = db.product;
const Category = db.category;

// Create Product
exports.createProduct = async (req, res) => {
    try {
        const { name, description, price, discount, stock, category } = req.body;

        if (!name || !price || !category) {
            return res.status(400).json({ 
                message: 'Tên sản phẩm, giá và danh mục là bắt buộc' 
            });
        }

        // Check category exists
        const categoryExists = await Category.findById(category);
        if (!categoryExists) {
            return res.status(404).json({ message: 'Danh mục không tìm thấy' });
        }

        const images = req.files ? req.files.map(f => `/uploads/${f.filename}`) : [];

        const product = new Product({
            name,
            description,
            price,
            discount: discount || 0,
            stock: stock || 0,
            category,
            images,
            createdBy: req.user.id
        });

        await product.save();
        await product.populate('category createdBy', 'name email');

        res.status(201).json({
            message: 'Sản phẩm được tạo thành công',
            data: product
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all Products
exports.getAllProducts = async (req, res) => {
    try {
        const { category, search, sort } = req.query;
        let query = {};

        if (category) {
            query.category = category;
        }

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        let products = Product.find(query)
            .populate('category', 'name')
            .populate('createdBy', 'name email');

        if (sort === 'price_asc') {
            products = products.sort({ price: 1 });
        } else if (sort === 'price_desc') {
            products = products.sort({ price: -1 });
        } else if (sort === 'rating') {
            products = products.sort({ rating: -1 });
        }

        const result = await products.exec();

        res.status(200).json({
            message: 'Lấy danh sách sản phẩm thành công',
            data: result
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get Product by ID
exports.getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate('category', 'name')
            .populate('createdBy', 'name email');

        if (!product) {
            return res.status(404).json({ message: 'Sản phẩm không tìm thấy' });
        }

        res.status(200).json({
            message: 'Lấy sản phẩm thành công',
            data: product
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update Product
exports.updateProduct = async (req, res) => {
    try {
        const { name, description, price, discount, stock, category } = req.body;
        const updateData = { name, description, price, discount, stock, category };

        if (req.files && req.files.length > 0) {
            updateData.images = req.files.map(f => `/uploads/${f.filename}`);
        }

        const product = await Product.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        ).populate('category', 'name')
            .populate('createdBy', 'name email');

        if (!product) {
            return res.status(404).json({ message: 'Sản phẩm không tìm thấy' });
        }

        res.status(200).json({
            message: 'Cập nhật sản phẩm thành công',
            data: product
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete Product
exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Sản phẩm không tìm thấy' });
        }
        res.status(200).json({ message: 'Xóa sản phẩm thành công' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update Product Rating
exports.updateProductRating = async (req, res) => {
    try {
        const { rating } = req.body;

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ message: 'Đánh giá phải từ 1 đến 5' });
        }

        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Sản phẩm không tìm thấy' });
        }

        // Calculate new rating
        const totalRating = (product.rating * product.totalReviews) + rating;
        product.totalReviews += 1;
        product.rating = totalRating / product.totalReviews;

        await product.save();

        res.status(200).json({
            message: 'Cập nhật đánh giá thành công',
            data: product
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
