const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const JWT_SECRET = process.env.JWT_SECRET;

// Register user
const registerUser = async (req, res) => {
    try{
        const { name, email, password, confirmPassword } = req.body;
        if (!email || !password || !confirmPassword) return res.status(400).json({ message: 'email and password required' });

        // Check password match 
        if (password !== confirmPassword) {
            return res.status(400).json({ message: 'Passwords do not match'})
        }

        const existing = await User.findOne({ email });
        if (existing) return res.status(409).json({ message: 'email already exists' });

        const hashed = await bcrypt.hash(password, 10);
        const user = new User({ name, email, password: hashed });
        await user.save();

        res.status(201).json({ id: user.id, email: user.email });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'server error' });
    }
}

// Login user 
const loginUser = async (req, res) => {
    try {
        const { email, password} = req.body; 
        const user = await User.findOne({ email });
        if (!user) return res.status(401).json({message: 'invalid credentials' }); 

        const ok = await bcrypt.compare(password, user.password);
        if(!ok) return res.status(401).json({ message: 'invalid credentials' });

        const token = jwt.sign(
            { sub: user.id, role: user.role },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({ token });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'server error'});
    }
};

module.exports= {
    registerUser,
    loginUser,
}