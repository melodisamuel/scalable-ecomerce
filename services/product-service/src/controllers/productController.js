const product = require('../models/product')

// create product
exports.createProduct = async (req, res, next) => {
    try {
        const p = await product.create(req.body);
        res.status(201).json(p);
    } catch (err) {
        next(err);
    }
}