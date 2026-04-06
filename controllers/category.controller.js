/**
 * @file category.controller.js
 * @description Controller for Category CRUD operations
 */

var db = require('../models');
var Category = db.category;

module.exports = {
    createCategory: async function (req, res) {
        try {
            var name = req.body.name;
            var description = req.body.description;

            if (!name) {
                return res.status(400).json({ message: 'Tên danh mục là bắt buộc' });
            }

            var category = new Category({
                name: name,
                description: description,
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
    },

    getAllCategories: async function (req, res) {
        try {
            var categories = await Category.find();
            res.status(200).json({
                message: 'Lấy danh sách danh mục thành công',
                data: categories
            });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    getCategoryById: async function (req, res) {
        try {
            var category = await Category.findById(req.params.id);
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
    },

    updateCategory: async function (req, res) {
        try {
            var name = req.body.name;
            var description = req.body.description;
            var updateData = { name: name, description: description };

            if (req.file) {
                updateData.image = `/uploads/${req.file.filename}`;
            }

            var category = await Category.findByIdAndUpdate(
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
    },

    deleteCategory: async function (req, res) {
        try {
            var category = await Category.findByIdAndDelete(req.params.id);
            if (!category) {
                return res.status(404).json({ message: 'Danh mục không tìm thấy' });
            }
            res.status(200).json({ message: 'Xóa danh mục thành công' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
};
