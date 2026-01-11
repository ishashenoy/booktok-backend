const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const requireAuth = require('../middleware/requireAuth');

// Available aesthetic options for video generation
const AESTHETIC_OPTIONS = [
    { value: 'dark-academia', label: 'Dark Academia', description: 'Moody lighting, vintage academic setting, gothic architecture' },
    { value: 'paranormal-romance', label: 'Paranormal Romance', description: 'Ethereal lighting, magical atmosphere, supernatural romance' },
    { value: 'paranormal-cozy', label: 'Paranormal Cozy', description: 'Warm magical lighting, cozy interior, whimsical atmosphere' },
    { value: 'paranormal-dark', label: 'Paranormal Dark', description: 'Dark supernatural atmosphere, horror elements, gothic' },
    { value: 'cozy-fantasy', label: 'Cozy Fantasy', description: 'Warm golden lighting, fantasy village, enchanted forest' },
    { value: 'contemporary', label: 'Contemporary', description: 'Modern realistic setting, natural lighting, urban backdrop' },
    { value: 'mystery-thriller', label: 'Mystery/Thriller', description: 'Dramatic shadows, noir lighting, suspenseful atmosphere' },
    { value: 'romantasy', label: 'Romantasy', description: 'Romantic fantasy blend, soft magical lighting, epic romance' },
    { value: 'cinematic', label: 'Cinematic', description: 'Film-like quality, dramatic lighting, professional cinematography' },
];

// GET /api/books/aesthetics - Get available aesthetic options for video generation
router.get('/aesthetics', (req, res) => {
    res.json({ aesthetics: AESTHETIC_OPTIONS });
});

// Public routes
// GET /api/books - Search books
router.get('/', bookController.searchBooks);

// GET /api/books/:id - Get book by ID
router.get('/:id', bookController.getBookById);

// GET /api/books/:id/video-status - Get video generation status
router.get('/:id/video-status', bookController.getVideoStatus);

// Protected routes (require authentication)
// POST /api/books - Create a book (admin/author)
router.post('/', requireAuth, bookController.createBook);

// POST /api/books/upload-with-video - Upload book and generate video
router.post('/upload-with-video', requireAuth, bookController.uploadBookWithVideo);

// POST /api/books/:id/regenerate-video - Regenerate video for existing book
router.post('/:id/regenerate-video', requireAuth, bookController.regenerateVideo);

// PATCH /api/books/:id - Update a book
router.patch('/:id', requireAuth, bookController.updateBook);

module.exports = router;
