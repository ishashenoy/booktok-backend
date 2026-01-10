const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';

module.exports = async function requireAuth(req, res, next) {
    try {
        let token = null;

        if (req.headers && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
            token = req.headers.authorization.split(' ')[1];
        } else if (req.cookies && req.cookies.token) {
            token = req.cookies.token;
        } else if (req.query && req.query.token) {
            token = req.query.token;
        }

        if (!token) return res.status(401).json({ error: 'Unauthorized' });

        const decoded = jwt.verify(token, JWT_SECRET);
        const userId = decoded?.id || decoded?.userId || decoded?._id;
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        // Attach user id and full user (without password) if available
        req.userId = userId;
        try {
            const user = await User.findById(userId).select('-password');
            if (user) req.user = user;
            else req.user = { id: userId };
        } catch (e) {
            // If fetching user fails, still attach id so controllers can handle it
            req.user = { id: userId };
        }

        return next();
    } catch (err) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
};