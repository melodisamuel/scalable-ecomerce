const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/productController');

// POST /api/v1/product/create
router.post('/create', ctrl.createProduct);

module.exports = router;
