const mongoose = require('mongoose');

const SaleSchema = new mongoose.Schema({
    product: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Product', 
        required: true 
    },
    platform: { 
        type: String, 
        enum: ['pharmacy', 'farmazon', 'woocommerce'], 
        required: true 
    },
    quantity: { 
        type: Number, 
        required: true 
    },
    date: { 
        type: Date, 
        default: Date.now 
    },
    isCancelled: {
        type: Boolean,
        default: false
    },
    cancelledAt: {
        type: Date,
        default: null
    },
    cancelReason: {
        type: String,
        trim: true
    },
    woocommerceOrderId: {
        type: String,
        sparse: true
    }
}, { 
    timestamps: true 
});

module.exports = mongoose.model('Sale', SaleSchema);
