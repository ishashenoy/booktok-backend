const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const requireAuth = require('../middleware/requireAuth');

// POST /api/user/register
router.post('/register', userController.register);

// POST /api/user/login
router.post('/login', userController.login);

// GET /api/user/profile
router.get('/profile', requireAuth, userController.profile);

module.exports = router;