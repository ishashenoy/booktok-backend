const express = require('express');
const router = express.Router();
const path = require('path');

// AI Services - loaded dynamically since they use ES modules
let aiServices = null;

async function getAIServices() {
    if (aiServices) return aiServices;
    
    try {
        const bookVideoPipeline = await import('../ai-service/services/bookVideoPipeline.js');
        const videoGenerationService = await import('../ai-service/services/videoGenerationService.js');
        const geminiService = await import('../ai-service/services/geminiService.js');
        const bookAnalysis = await import('../ai-service/services/bookAnalysis.js');
        
        aiServices = {
            generateVideoFromSummary: bookVideoPipeline.generateVideoFromSummary,
            generateQuickVideo: bookVideoPipeline.generateQuickVideo,
            generatePremiumVideo: bookVideoPipeline.generatePremiumVideo,
            checkPipelineHealth: bookVideoPipeline.checkPipelineHealth,
            cleanupVideo: bookVideoPipeline.cleanupVideo,
            generateCharacterDrivenVideo: videoGenerationService.generateCharacterDrivenVideo,
            generateCompletePreview: videoGenerationService.generateCompletePreview,
            getAestheticRecommendations: geminiService.getAestheticRecommendations,
            generateSummary: geminiService.generateSummary,
            analyzeBook: bookAnalysis.analyzeBook,
        };
        return aiServices;
    } catch (error) {
        console.error('Failed to load AI services:', error.message);
        throw new Error('AI services not available');
    }
}

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
        const services = await getAIServices();
        const { summary, title, aesthetic, voiceType, numImages, quality = 'standard' } = req.body;

        if (!summary) {
            return res.status(400).json({ 
                error: 'Summary is required',
                message: 'Please provide a book summary to generate a video',
            });
        }

        console.log(`\n${'='.repeat(50)}`);
        console.log(`📚 New video generation request`);
        console.log(`📖 Title: ${title || 'Untitled'}`);
        console.log(`📝 Summary length: ${summary.length} characters`);
        console.log(`🎨 Aesthetic: ${aesthetic || 'auto'}`);
        console.log(`🔊 Voice: ${voiceType || 'female'}`);
        console.log(`⚡ Quality: ${quality}`);
        console.log(`${'='.repeat(50)}\n`);

        // Select generation function based on quality
        let generateFunc;
        switch (quality) {
            case 'quick':
                generateFunc = services.generateQuickVideo;
                break;
            case 'premium':
                generateFunc = services.generatePremiumVideo;
                break;
            default:
                generateFunc = services.generateVideoFromSummary;
        }

        const result = await generateFunc({
            summary,
            title: title || 'Book Preview',
            aesthetic: aesthetic || 'cinematic',
            voiceType: voiceType || 'female',
            numImages: numImages || 4,
        });

        if (!result.success) {
            return res.status(500).json({
                error: 'Video generation failed',
                message: result.error,
            });
        }

        // Check if client wants video binary or JSON
        const acceptHeader = req.headers.accept || '';
        
        if (acceptHeader.includes('video/') || acceptHeader.includes('application/octet-stream')) {
            res.setHeader('Content-Type', 'video/mp4');
            res.setHeader('Content-Disposition', `attachment; filename="${title || 'video'}.mp4"`);
            res.send(result.videoBuffer);
            setTimeout(() => services.cleanupVideo(result.videoPath), 60000);
        } else {
            const videoUrl = `/videos/${path.basename(result.videoPath)}`;
            res.json({
                success: true,
                videoUrl,
                duration: result.duration,
                metadata: result.metadata,
                message: 'Video generated successfully',
            });
        }
    } catch (err) {
        console.error('Video generation error:', err.message);
        res.status(500).json({ 
            error: 'Video generation failed', 
            details: err.message 
        });
    }
});

/**
 * GET /api/generate/video/:filename
 * 
 * Stream/download a generated video file
 */
router.get('/video/:filename', (req, res) => {
    const { filename } = req.params;
    const videoPath = path.join(__dirname, '..', 'ai-service', 'output', filename);
    
    res.sendFile(videoPath, (err) => {
        if (err) {
            console.error('Video fetch error:', err.message);
            res.status(404).json({ error: 'Video not found' });
        }
    });
});

// Analyze book for aesthetic recommendations
router.post('/analyze', async (req, res) => {
    try {
        const services = await getAIServices();
        const bookData = req.body;
        
        if (!bookData.title && !bookData.description) {
            return res.status(400).json({ error: 'Title or description required' });
        }

        const analysis = await services.analyzeBook(bookData);
        res.json(analysis);
    } catch (err) {
        console.error('AI analyze error:', err.message);
        res.status(500).json({ error: 'AI service error', details: err.message });
    }
});

// Generate animation specifications
router.post('/animation-spec', async (req, res) => {
    try {
        const services = await getAIServices();
        const bookData = req.body;
        
        const [videoPrompt, preview] = await Promise.all([
            services.generateCharacterDrivenVideo(bookData),
            services.generateCompletePreview(bookData),
        ]);

        res.json({ videoPrompt, preview });
    } catch (err) {
        console.error('AI animation-spec error:', err.message);
        res.status(500).json({ error: 'AI service error', details: err.message });
    }
});

// Health check for AI services
router.get('/health', async (req, res) => {
    try {
        const services = await getAIServices();
        const health = await services.checkPipelineHealth();
        res.json({ aiService: health });
    } catch (err) {
        res.status(503).json({ error: 'AI service unavailable', details: err.message });
    }
});

module.exports = router;