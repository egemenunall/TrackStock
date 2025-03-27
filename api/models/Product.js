const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    barcode: {
        type: String,
        unique: true,
        sparse: true,
        trim: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    },
    description: {
        type: String,
        trim: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    purchasePrice: {
        type: Number,
        required: true,
        min: 0
    },
    stock: {
        type: Number,
        default: 0,
        min: 0
    },
    unit: {
        type: String,
        required: true,
        enum: ['adet', 'kg', 'lt', 'mt']
    },
    minStock: {
        type: Number,
        default: 0,
        min: 0
    },
    isActive: {
        type: Boolean,
        default: true
    },
    imageUrl: {
        type: String
    },
    woocommerceId: {
        type: String,
        sparse: true
    }
}, {
    timestamps: true
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
