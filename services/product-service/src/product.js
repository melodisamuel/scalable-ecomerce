const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true, index: true },
    description: { type: String, default: '' },
    price: { type: Number, required: true },
    category: { type: String, index: true },
    sku: { type: String, index: true },
    stock: { type: Number, default: 0 },
    CreatedAt: { type: Date, default: Date.now },
    UpdatedAt: { type: Date, default: Date.now }
});

productSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Product', productSchema);