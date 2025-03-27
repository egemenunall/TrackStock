const mongoose = require('mongoose');

const InventoryCountSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['draft', 'in_progress', 'completed'],
        default: 'draft'
    },
    items: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        systemQuantity: {
            type: Number,
            required: true
        },
        countedQuantity: {
            type: Number,
            default: 0
        },
        difference: {
            type: Number,
            default: 0
        },
        counted: {
            type: Boolean,
            default: false
        },
        countedAt: {
            type: Date
        }
    }],
    notes: {
        type: String
    },
    completedAt: {
        type: Date
    },
    createdBy: {
        type: String
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('InventoryCount', InventoryCountSchema); 