const express = require('express');
const router = express.Router();
const axios = require('axios');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:5001';

// Proxy to AI service
router.post('/analyze', async (req, res) => {
    try {
        const response = await axios.post(`${AI_SERVICE_URL}/analyze`, req.body);
        res.json(response.data);
    } catch (err) {
        console.error('AI analyze error:', err.message);
        res.status(500).json({ error: 'AI service error', details: err.message });
    }
});

router.post('/animation-spec', async (req, res) => {
    try {
        const response = await axios.post(`${AI_SERVICE_URL}/generate-animation-spec`, req.body);
        res.json(response.data);
    } catch (err) {
        console.error('AI animation-spec error:', err.message);
        res.status(500).json({ error: 'AI service error', details: err.message });
    }
});

// Health check for AI service
router.get('/health', async (req, res) => {
    try {
        const response = await axios.get(`${AI_SERVICE_URL}/`);
        res.json({ aiService: response.data });
    } catch (err) {
        res.status(503).json({ error: 'AI service unavailable' });
    }
});

module.exports = router;