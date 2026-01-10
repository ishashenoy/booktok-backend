const UserBook = require('../models/userBookModel');

exports.listUserBooks = async (req, res) => {
    try {
        const userId = req.user?.id || req.user?._id || req.userId;
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const userBooks = await UserBook.find({ user: userId }).populate('book');
        res.json({ userBooks });
    } catch (err) {
        res.status(500).json({ error: 'Server error', details: err.message });
    }
};

exports.addUserBook = async (req, res) => {
    try {
        const userId = req.user?.id || req.user?._id || req.userId;
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const { book, status, progress } = req.body;
        if (!book) return res.status(400).json({ error: 'book id required' });

        // prevent duplicates
        const existing = await UserBook.findOne({ user: userId, book });
        if (existing) return res.status(409).json({ error: 'Book already in collection' });

        const newUB = await UserBook.create({ user: userId, book, status: status || 'to-read', progress: progress || 0 });
        res.status(201).json({ userBook: newUB });
    } catch (err) {
        res.status(500).json({ error: 'Server error', details: err.message });
    }
};

exports.updateUserBook = async (req, res) => {
    try {
        const userId = req.user?.id || req.user?._id || req.userId;
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const ub = await UserBook.findOneAndUpdate(
            { _id: req.params.id, user: userId },
            req.body,
            { new: true }
        );
        if (!ub) return res.status(404).json({ error: 'UserBook not found' });
        res.json({ userBook: ub });
    } catch (err) {
        res.status(500).json({ error: 'Server error', details: err.message });
    }
};

exports.deleteUserBook = async (req, res) => {
    try {
        const userId = req.user?.id || req.user?._id || req.userId;
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const removed = await UserBook.findOneAndDelete({ _id: req.params.id, user: userId });
        if (!removed) return res.status(404).json({ error: 'UserBook not found' });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Server error', details: err.message });
    }
};