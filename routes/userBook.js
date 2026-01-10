const express = require('express');
const router = express.Router();
const userBookController = require('../controllers/userBookController');
const requireAuth = require('../middleware/requireAuth');

// All routes require auth
router.use(requireAuth);

// GET /api/user-books/
router.get('/', userBookController.listUserBooks);

// POST /api/user-books/
router.post('/', userBookController.addUserBook);

// PATCH /api/user-books/:id
router.patch('/:id', userBookController.updateUserBook);

// DELETE /api/user-books/:id
router.delete('/:id', userBookController.deleteUserBook);

module.exports = router;