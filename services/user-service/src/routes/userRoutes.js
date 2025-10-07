const express = require('express');
const authMiddleware = require('../middleware/auth');
const { registerUser, loginUser } = require('../controllers/userController');
const router = express.Router();

const protect = authMiddleware(process.env.JWT_SECRET)

router.post('/register', registerUser);
router.post('/login', loginUser);

module.exports = router;