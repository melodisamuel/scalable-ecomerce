const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;

router.post('/register', async (req, res) => {
    
})