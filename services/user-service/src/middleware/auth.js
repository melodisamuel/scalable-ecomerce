const jwt = require('jsonwebtoken');
module.exports = (secret) => (req, res, next) => {
    const auth = req.headers.authorization;
    if(!auth) return res.status(401).end();
    const token = auth.split(' ')[1];
    try {
        const payload = jwt.verify(token, secret);
        res.userId = payload.sub;
        req.userRole = payload.role;
        next();
    } catch (err) {
        return res.status(401).json({ message: 'invalid token'})
    }
};