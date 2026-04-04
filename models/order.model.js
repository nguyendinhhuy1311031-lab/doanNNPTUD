/**
 * @file order.model.js
 * @description Mongoose model for Order collection
 */

const mongoose = require('mongoose');
const { Schema } = mongoose;

const orderSchema = new Schema({
    orderNumber: {
        type: String,
        required: true,
        unique: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [{
        type: Schema.Types.ObjectId,
        ref: 'OrderDetail'
    }],
    totalPrice: {
        type: Number,
        required: true,
        default: 0
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
        default: 'pending'
    },
    shippingAddress: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: String,
        required: true
    },
    notes: {
        type: String,
        required: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
