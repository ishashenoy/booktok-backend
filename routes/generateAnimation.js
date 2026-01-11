const express = require('express');
const router = express.Router();
const axios = require('axios');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:5001';

/**
 * POST /api/generate/video
 * 
 * Generate a complete video from a book summary
 * 
 * Request body:
 * {
 *   "summary": "Book summary text...",
 *   "title": "Book Title",
 *   "aesthetic": "dark-academia" | "cozy-fantasy" | etc.,
 *   "voiceType": "male" | "female" | "mysterious",
 *   "quality": "quick" | "standard" | "premium"
 * }
 */
router.post('/video', async (req, res) => {
    try {
        const { summary, title, aesthetic, voiceType, quality } = req.body;

        if (!summary) {
            return res.status(400).json({ 
                error: 'Summary is required',
                message: 'Please provide a book summary to generate a video',
            });
        }

        console.log(`🎬 Video generation request for: ${title || 'Untitled'}`);

        const response = await axios.post(
            `${AI_SERVICE_URL}/generate-video`,
            { summary, title, aesthetic, voiceType, quality },
            { 
                timeout: 300000, // 5 minute timeout for video generation
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                }
            }
        );

        res.json(response.data);
    } catch (err) {
        console.error('Video generation error:', err.message);
        
        if (err.response) {
            res.status(err.response.status).json(err.response.data);
        } else if (err.code === 'ECONNREFUSED') {
            res.status(503).json({ 
                error: 'AI service unavailable',
                message: 'The AI service is not running. Please start the ai-service.',
            });
        } else {
            res.status(500).json({ 
                error: 'Video generation failed', 
                details: err.message 
            });
        }
    }
});

/**
 * GET /api/generate/video/:filename
 * 
 * Stream/download a generated video file
 */
router.get('/video/:filename', async (req, res) => {
    try {
        const { filename } = req.params;
        
        const response = await axios.get(
            `${AI_SERVICE_URL}/videos/${filename}`,
            { responseType: 'stream' }
        );

        res.setHeader('Content-Type', 'video/mp4');
        response.data.pipe(res);
    } catch (err) {
        console.error('Video fetch error:', err.message);
        res.status(404).json({ error: 'Video not found' });
    }
});

// Proxy to AI service for analysis
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
        const response = await axios.get(`${AI_SERVICE_URL}/health`);
        res.json({ aiService: response.data });
    } catch (err) {
        res.status(503).json({ error: 'AI service unavailable' });
    }
});

module.exports = router;