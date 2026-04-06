/**
 * @file category.route.js
 * @description Routes for Category CRUD operations
 */

var express = require('express');
var router = express.Router();
let category = require('../controllers/category.controller');
let verifyToken = require('../middlewares').verifyToken;
let roleAuthorization = require('../middlewares').roleAuthorization;
let upload = require('../config/multer.config');

// Public routes
router.get('/', async function (req, res, next) {
    await category.getAllCategories(req, res, next);
});

router.get('/:id', async function (req, res, next) {
    await category.getCategoryById(req, res, next);
});

// Admin only routes
router.post('/', verifyToken, roleAuthorization(['admin']), upload.single('image'), async function (req, res, next) {
    await category.createCategory(req, res, next);
});

router.put('/:id', verifyToken, roleAuthorization(['admin']), upload.single('image'), async function (req, res, next) {
    await category.updateCategory(req, res, next);
});

router.delete('/:id', verifyToken, roleAuthorization(['admin']), async function (req, res, next) {
    await category.deleteCategory(req, res, next);
});

module.exports = router;
