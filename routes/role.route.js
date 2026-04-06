/**
 * @file role.route.js
 * @description Routes for role management
 */

var express = require('express');
var router = express.Router();
let role = require('../controllers/role.controller');
let middlewares = require('../middlewares');
let verifyToken = middlewares.verifyToken;
let roleAuthorization = middlewares.roleAuthorization;
let validationErrorHandler = middlewares.validationErrorHandler;
let validators = require('../middlewares/validators');
let validateAssignRoleToUser = validators.validateAssignRoleToUser;
let validateCreateRole = validators.validateCreateRole;
let validateGetUserRoles = validators.validateGetUserRoles;

router.post('/roles', [...validateCreateRole, validationErrorHandler, verifyToken, roleAuthorization(['admin'])], async function (req, res, next) {
    await role.createRole(req, res, next);
});

router.post('/assign-role', [...validateAssignRoleToUser, validationErrorHandler, verifyToken, roleAuthorization(['admin'])], async function (req, res, next) {
    await role.assignRoleToUser(req, res, next);
});

router.get('/user/:userId/roles', [...validateGetUserRoles, validationErrorHandler, verifyToken, roleAuthorization(['admin'])], async function (req, res, next) {
    await role.getUserRoles(req, res, next);
});

module.exports = function(app) {
    app.use('/api/role', router);
};
