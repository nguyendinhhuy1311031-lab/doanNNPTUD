/**
 * @file index.js
 * @description This file initializes the Mongoose ORM and sets up model relationships.
 * 
 * The file configures Mongoose using the database connection settings and defines references between models.
 * 
 * The following models are initialized:
 * 
 * - `User`: Represents users in the system.
 * - `Session`: Represents user sessions.
 * - `Log`: Represents system logs.
 * - `Role`: Represents roles that users can have.
 * - `UserRoles`: Represents the many-to-many relationship between users and roles.
 * 
 * Relationships are defined as follows:
 * 
 * - `Log` and `Session` models reference the `User` model through a `userId` field.
 * - The `User` model has a many-to-many relationship with the `Role` model through the `UserRoles` collection.
 * 
 * @module models/index
 */

const mongoose = require('mongoose');
const dbConfig = require('./../config/database.config');

// Connect to MongoDB
mongoose.connect(dbConfig.connectionString);

const db = {};

// Initialize models
db.mongoose = mongoose;

db.user = require("./user.model.js");
db.session = require("./session.model.js");
db.log = require("./log.model.js");
db.role = require("./role.model.js");
db.user_roles = require("./user_roles.model.js");
db.category = require("./category.model.js");
db.product = require("./product.model.js");
db.order = require("./order.model.js");
db.orderDetail = require("./orderDetail.model.js");
db.comment = require("./comment.model.js");
db.file = require("./file.model.js");

// Define relationships manually
db.userSchema = db.user.schema;
db.sessionSchema = db.session.schema;
db.logSchema = db.log.schema;
db.roleSchema = db.role.schema;
db.userRolesSchema = db.user_roles.schema;
db.categorySchema = db.category.schema;
db.productSchema = db.product.schema;
db.orderSchema = db.order.schema;
db.orderDetailSchema = db.orderDetail.schema;
db.commentSchema = db.comment.schema;
db.fileSchema = db.file.schema;

// Export the models and schemas
module.exports = db;
