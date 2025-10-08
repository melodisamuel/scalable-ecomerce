const Product = require('../models/product');

exports.createProduct = async (req, res, next) => {
  try {
    const newProduct = await Product.create(req.body);
    res.status(201).json({
      message: 'Product created successfully',
      product: newProduct
    });
  } catch (err) {
    next(err);
  }
};

