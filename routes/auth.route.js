/**
 * @file auth.route.js
 * @description Routes for authentication
 */

var express = require('express');
var router = express.Router();
let auth = require('../controllers/auth.controller');
let middlewares = require('../middlewares');
let verifyToken = middlewares.verifyToken;
let validationErrorHandler = middlewares.validationErrorHandler;
let validators = require('../middlewares/validators');
let validateSignup = validators.validateSignup;
let validateResendVerification = validators.validateResendVerification;
let validateVerificationToken = validators.validateVerificationToken;
let validateForgotPassword = validators.validateForgotPassword;
let validateResetPassword = validators.validateResetPassword;
let validateLogin = validators.validateLogin;

router.post('/login', [...validateLogin, validationErrorHandler], async function (req, res, next) {
    await auth.login(req, res, next);
});

router.post('/signup', [...validateSignup, validationErrorHandler], async function (req, res, next) {
    await auth.signup(req, res, next);
});

router.post('/resend-verification', [...validateResendVerification, validationErrorHandler], async function (req, res, next) {
    await auth.resendVerificationEmail(req, res, next);
});

router.post('/promote-admin', async function (req, res, next) {
    await auth.promoteToAdmin(req, res, next);
});

router.get('/verification/:token', [...validateVerificationToken, validationErrorHandler], async function (req, res, next) {
    await auth.verification(req, res, next);
});

router.get('/verify', [verifyToken], async function (req, res, next) {
    await auth.verifyUser(req, res, next);
});

router.get('/me', [verifyToken], async function (req, res, next) {
    await auth.getCurrentUser(req, res, next);
});

router.post('/forgot-password', [...validateForgotPassword, validationErrorHandler], async function (req, res, next) {
    await auth.forgotPassword(req, res, next);
});

router.post('/reset-password/:token', [...validateResetPassword, validationErrorHandler], async function (req, res, next) {
    await auth.resetPassword(req, res, next);
});

router.get('/logout', [verifyToken], async function (req, res, next) {
    await auth.logout(req, res, next);
});

module.exports = function(app) {
    app.use('/api/auth', router);
};
