const Book = require('../models/bookModel');

exports.searchBooks = async (req, res) => {
    try {
        const q = (req.query.q || '').trim();
        const filter = {};
        if (q) {
            // basic text/regex search across title and author
            const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
            filter.$or = [{ title: regex }, { author: regex }, { description: regex }];
        }

        const books = await Book.find(filter).limit(50);
        res.json({ books });
    } catch (err) {
        res.status(500).json({ error: 'Server error', details: err.message });
    }
};

exports.getBookById = async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) return res.status(404).json({ error: 'Book not found' });
        res.json({ book });
    } catch (err) {
        res.status(500).json({ error: 'Server error', details: err.message });
    }
};

// admin endpoints to create/update books
exports.createBook = async (req, res) => {
    try {
        const payload = req.body;
        const book = await Book.create(payload);
        res.status(201).json({ book });
    } catch (err) {
        res.status(500).json({ error: 'Server error', details: err.message });
    }
};

exports.updateBook = async (req, res) => {
    try {
        const book = await Book.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!book) return res.status(404).json({ error: 'Book not found' });
        res.json({ book });
    } catch (err) {
        res.status(500).json({ error: 'Server error', details: err.message });
    }
};