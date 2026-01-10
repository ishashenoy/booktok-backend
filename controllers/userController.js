const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';

exports.register = async (req, res) => {
    try {
        const { username, email, password } = req.body;  // Changed: name -> username
        if (!email || !password || !username) return res.status(400).json({ error: 'Email, username and password required' });

        const existing = await User.findOne({ email });
        if (existing) return res.status(409).json({ error: 'User already exists' });

        const existingUsername = await User.findOne({ username });
        if (existingUsername) return res.status(409).json({ error: 'Username already taken' });

        const hashed = await bcrypt.hash(password, 10);
        const user = await User.create({ username, email, password: hashed });

        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
        res.status(201).json({ user: { id: user._id, username: user.username, email: user.email }, token });
    } catch (err) {
        res.status(500).json({ error: 'Server error', details: err.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

        const user = await User.findOne({ email });
        if (!user) return res.status(401).json({ error: 'Invalid credentials' });

        const ok = await bcrypt.compare(password, user.password);
        if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
        res.json({ user: { id: user._id, username: user.username, email: user.email }, token });
    } catch (err) {
        res.status(500).json({ error: 'Server error', details: err.message });
    }
};

exports.profile = async (req, res) => {
    try {
        const userId = req.user?.id || req.user?._id || req.userId;
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const user = await User.findById(userId).select('-password');
        if (!user) return res.status(404).json({ error: 'User not found' });

        res.json({ user });
    } catch (err) {
        res.status(500).json({ error: 'Server error', details: err.message });
    }
};