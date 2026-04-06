/**
 * @file product.controller.js
 * @description Controller for Product CRUD operations
 */

var db = require('../models');
var Product = db.product;
var Category = db.category;

module.exports = {

    createProduct: async function (req, res) {
        try {
            var name = req.body.name;
            var description = req.body.description;
            var price = req.body.price;
            var discount = req.body.discount;
            var stock = req.body.stock;
            var category = req.body.category;

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

            var images = req.files ? req.files.map(f => `/uploads/${f.filename}`) : [];

            var product = new Product({
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
    },

    getAllProducts: async function (req, res) {
        try {
            var category = req.query.category;
            var search = req.query.search;
            var sort = req.query.sort;
            var query = {};

            if (category) {
                query.category = category;
            }

            if (search) {
                query.$or = [
                    { name: { $regex: search, $options: 'i' } },
                    { description: { $regex: search, $options: 'i' } }
                ];
            }

            var products = Product.find(query)
                .populate('category', 'name')
                .populate('createdBy', 'name email');

            if (sort === 'price_asc') {
                products = products.sort({ price: 1 });
            } else if (sort === 'price_desc') {
                products = products.sort({ price: -1 });
            } else if (sort === 'rating') {
                products = products.sort({ rating: -1 });
            }

            var result = await products.exec();

            res.status(200).json({
                message: 'Lấy danh sách sản phẩm thành công',
                data: result
            });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    getProductById: async function (req, res) {
        try {
            var product = await Product.findById(req.params.id)
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
    },

    updateProduct: async function (req, res) {
        try {
            var name = req.body.name;
            var description = req.body.description;
            var price = req.body.price;
            var discount = req.body.discount;
            var stock = req.body.stock;
            var category = req.body.category;
            var updateData = { name, description, price, discount, stock, category };

            if (req.files && req.files.length > 0) {
                updateData.images = req.files.map(f => `/uploads/${f.filename}`);
            }

            var product = await Product.findByIdAndUpdate(
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
    },

    deleteProduct: async function (req, res) {
        try {
            var product = await Product.findByIdAndDelete(req.params.id);
            if (!product) {
                return res.status(404).json({ message: 'Sản phẩm không tìm thấy' });
            }
            res.status(200).json({ message: 'Xóa sản phẩm thành công' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    updateProductRating: async function (req, res) {
        try {
            var rating = req.body.rating;

            if (!rating || rating < 1 || rating > 5) {
                return res.status(400).json({ message: 'Đánh giá phải từ 1 đến 5' });
            }

            var product = await Product.findById(req.params.id);
            if (!product) {
                return res.status(404).json({ message: 'Sản phẩm không tìm thấy' });
            }

            // Calculate new rating
            var totalRating = (product.rating * product.totalReviews) + rating;
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
    }
};
