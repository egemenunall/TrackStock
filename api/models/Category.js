const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Kategori adı zorunludur'],
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    parentCategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        default: null
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Alt kategorileri getirmek için virtual field
categorySchema.virtual('subCategories', {
    ref: 'Category',
    localField: '_id',
    foreignField: 'parentCategory'
});

const Category = mongoose.model('Category', categorySchema);

module.exports = Category; 