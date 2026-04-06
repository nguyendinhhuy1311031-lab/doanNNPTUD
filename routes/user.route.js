/**
 * @file user.route.js
 * @description Routes for user management
 */

var express = require('express');
var router = express.Router();
let user = require('../controllers/user.controller');
let middlewares = require('../middlewares');
let verifyToken = middlewares.verifyToken;
let validationErrorHandler = middlewares.validationErrorHandler;
let validators = require('../middlewares/validators');
let validateUserUpdate = validators.validateUserUpdate;
let validateChangePassword = validators.validateChangePassword;
console.log('verifyToken:', verifyToken);
console.log('validationErrorHandler:', validationErrorHandler);
console.log('validateUserUpdate:', validateUserUpdate);

router.get('/user', [/*verifyToken*/], async function (req, res, next) {
    await user.getUser(req, res, next);
});

router.put('/user', [verifyToken, ...validateUserUpdate, validationErrorHandler], async function (req, res, next) {
    await user.updateUser(req, res, next);
});

router.post('/user/change-password', [verifyToken, ...validateChangePassword, validationErrorHandler], async function (req, res, next) {
    await user.changePassword(req, res, next);
});

module.exports = function(app) {
    app.use('/api/user', router);
};
