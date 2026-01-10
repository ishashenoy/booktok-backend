const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');

// GET /api/search/books?q=...
router.get('/books', bookController.searchBooks);

// GET /api/search/books/:id
router.get('/books/:id', bookController.getBookById);

module.exports = router;