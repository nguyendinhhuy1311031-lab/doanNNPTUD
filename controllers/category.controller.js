/**
 * @file category.controller.js
 * @description Controller for Category CRUD operations
 */

const db = require('../models');
const Category = db.category;

// Create Category
exports.createCategory = async (req, res) => {
    try {
        const { name, description } = req.body;

        if (!name) {
            return res.status(400).json({ message: 'Tên danh mục là bắt buộc' });
        }

        const category = new Category({
            name,
            description,
            image: req.file ? `/uploads/${req.file.filename}` : null
        });

        await category.save();
        res.status(201).json({
            message: 'Danh mục được tạo thành công',
            data: category
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all Categories
exports.getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find();
        res.status(200).json({
            message: 'Lấy danh sách danh mục thành công',
            data: categories
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get Category by ID
exports.getCategoryById = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ message: 'Danh mục không tìm thấy' });
        }
        res.status(200).json({
            message: 'Lấy danh mục thành công',
            data: category
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update Category
exports.updateCategory = async (req, res) => {
    try {
        const { name, description } = req.body;
        const updateData = { name, description };

        if (req.file) {
            updateData.image = `/uploads/${req.file.filename}`;
        }

        const category = await Category.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );

        if (!category) {
            return res.status(404).json({ message: 'Danh mục không tìm thấy' });
        }

        res.status(200).json({
            message: 'Cập nhật danh mục thành công',
            data: category
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete Category
exports.deleteCategory = async (req, res) => {
    try {
        const category = await Category.findByIdAndDelete(req.params.id);
        if (!category) {
            return res.status(404).json({ message: 'Danh mục không tìm thấy' });
        }
        res.status(200).json({ message: 'Xóa danh mục thành công' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
