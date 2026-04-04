/**
 * @file orderDetail.model.js
 * @description Mongoose model for OrderDetail collection
 */

const mongoose = require('mongoose');
const { Schema } = mongoose;

const orderDetailSchema = new Schema({
    product: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    totalPrice: {
        type: Number,
        required: true,
        min: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

module.exports = mongoose.model('OrderDetail', orderDetailSchema);
