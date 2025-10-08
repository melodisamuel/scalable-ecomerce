const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/productController');

// CRUD
router.post('/create', ctrl.createProduct);