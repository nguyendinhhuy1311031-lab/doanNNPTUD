/**
 * @file file.model.js
 * @description Mongoose model for File collection (uploads)
 */

const mongoose = require('mongoose');
const { Schema } = mongoose;

const fileSchema = new Schema({
    filename: {
        type: String,
        required: true
    },
    originalName: {
        type: String,
        required: true
    },
    path: {
        type: String,
        required: true
    },
    size: {
        type: Number,
        required: true
    },
    mimetype: {
        type: String,
        required: true
    },
    uploadedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    uploadedFor: {
        type: String,
        enum: ['avatar', 'product', 'category'],
        required: true
    },
    relatedId: {
        type: Schema.Types.ObjectId,
        required: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

module.exports = mongoose.model('File', fileSchema);
