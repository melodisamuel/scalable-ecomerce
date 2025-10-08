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

// List + filters + pagination 
exports.listProducts = async (req, res, next) => {
    try {
        const { page = 1, limit = 20, q, category } = req.query;
        const filter = {};
        if (q) filter.name = { $regex: q, $options: 'i' };
        if (category) filter.category = category;
        const skip = (page -1) * limit;
        const [items, total] = await Promise.all([
            Product.find(filter).skip(skip).limit(parseInt(limit, 10)).lean(),
            Product.countDocuments(filter)
        ]);
        res.json({ items, total, page: Number(page), limit: Number(limit) });
    } catch (err) {
        next(err);
    }

};

