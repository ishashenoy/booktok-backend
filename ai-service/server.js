/**
 * AI Service Server
 * 
 * Express server for AI-powered book video generation
 */

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

// Import services
import { generateVideoFromSummary, generateQuickVideo, generatePremiumVideo, checkPipelineHealth, cleanupVideo } from './services/bookVideoPipeline.js';
import { generateCharacterDrivenVideo, generateCompletePreview } from './services/videoGenerationService.js';
import { getAestheticRecommendations, generateSummary } from './services/geminiService.js';
import { analyzeBook } from './services/bookAnalysis.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.AI_SERVICE_PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Serve generated videos statically
app.use('/videos', express.static(path.join(__dirname, 'output')));

// Health check
app.get('/', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'BookTok AI Service',
    version: '1.0.0',
  });
});

// Pipeline health check
app.get('/health', async (req, res) => {
  try {
    const health = await checkPipelineHealth();
    res.json({
      status: health.ready ? 'healthy' : 'degraded',
      ...health,
    });
  } catch (error) {
    res.status(500).json({ status: 'error', error: error.message });
  }
});

/**
 * POST /generate-video
 * 
 * Main endpoint: Generate a complete video from a book summary
 * 
 * Request body:
 * {
 *   "summary": "Book summary or description text...",
 *   "title": "Book Title" (optional),
 *   "aesthetic": "dark-academia" | "cozy-fantasy" | "paranormal-romance" | etc. (optional),
 *   "voiceType": "male" | "female" | "mysterious" (optional, default: female),
 *   "numImages": 4 (optional, default: 4),
 *   "quality": "quick" | "standard" | "premium" (optional, default: standard)
 * }
 * 
 * Response:
 * - Video file (video/mp4) if Accept header includes video/*
 * - JSON with video URL otherwise
 */
app.post('/generate-video', async (req, res) => {
  try {
    const { 
      summary, 
      title, 
      aesthetic, 
      voiceType, 
      numImages, 
      quality = 'standard' 
    } = req.body;

    // Validate required fields
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
        generateFunc = generateQuickVideo;
        break;
      case 'premium':
        generateFunc = generatePremiumVideo;
        break;
      default:
        generateFunc = generateVideoFromSummary;
    }

    // Generate video
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
      // Send video file directly
      res.setHeader('Content-Type', 'video/mp4');
      res.setHeader('Content-Disposition', `attachment; filename="${title || 'video'}.mp4"`);
      res.send(result.videoBuffer);
      
      // Cleanup after sending
      setTimeout(() => cleanupVideo(result.videoPath), 60000);
    } else {
      // Send JSON with video URL
      const videoUrl = `/videos/${path.basename(result.videoPath)}`;
      res.json({
        success: true,
        videoUrl,
        duration: result.duration,
        metadata: result.metadata,
        message: 'Video generated successfully',
      });
    }
  } catch (error) {
    console.error('Error in /generate-video:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
});

/**
 * POST /generate-video-stream
 * 
 * Streaming endpoint with progress updates via SSE
 */
app.post('/generate-video-stream', async (req, res) => {
  const { summary, title, aesthetic, voiceType } = req.body;

  if (!summary) {
    return res.status(400).json({ error: 'Summary is required' });
  }

  // Set up SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const sendProgress = (step, message, progress) => {
    res.write(`data: ${JSON.stringify({ step, message, progress })}\n\n`);
  };

  try {
    sendProgress(1, 'Preparing narration script...', 10);
    
    sendProgress(2, 'Generating images from summary...', 25);
    
    sendProgress(3, 'Creating voiceover...', 50);
    
    sendProgress(4, 'Compiling video...', 75);
    
    const result = await generateVideoFromSummary({
      summary,
      title: title || 'Book Preview',
      aesthetic: aesthetic || 'cinematic',
      voiceType: voiceType || 'female',
    });

    if (result.success) {
      const videoUrl = `/videos/${path.basename(result.videoPath)}`;
      sendProgress(5, 'Complete!', 100);
      res.write(`data: ${JSON.stringify({ 
        complete: true, 
        videoUrl,
        duration: result.duration,
        metadata: result.metadata,
      })}\n\n`);
    } else {
      res.write(`data: ${JSON.stringify({ error: result.error })}\n\n`);
    }
  } catch (error) {
    res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
  }

  res.end();
});

/**
 * POST /analyze
 * 
 * Analyze a book and get aesthetic recommendations
 */
app.post('/analyze', async (req, res) => {
  try {
    const bookData = req.body;
    
    if (!bookData.title && !bookData.description) {
      return res.status(400).json({ error: 'Title or description required' });
    }

    const analysis = await analyzeBook(bookData);
    res.json(analysis);
  } catch (error) {
    console.error('Error in /analyze:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /generate-animation-spec
 * 
 * Generate animation specifications (Luma prompts, etc.)
 */
app.post('/generate-animation-spec', async (req, res) => {
  try {
    const bookData = req.body;
    
    const [videoPrompt, preview] = await Promise.all([
      generateCharacterDrivenVideo(bookData),
      generateCompletePreview(bookData),
    ]);

    res.json({
      videoPrompt,
      preview,
    });
  } catch (error) {
    console.error('Error in /generate-animation-spec:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /recommend-aesthetic
 * 
 * Get aesthetic recommendation for a book
 */
app.post('/recommend-aesthetic', async (req, res) => {
  try {
    const { title, description, genres } = req.body;
    
    const aesthetic = await getAestheticRecommendations({
      title,
      description,
      genres: genres || [],
    });

    res.json({ aesthetic });
  } catch (error) {
    console.error('Error in /recommend-aesthetic:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /generate-summary
 * 
 * Generate a compelling summary for a book
 */
app.post('/generate-summary', async (req, res) => {
  try {
    const { title, description } = req.body;
    
    const summary = await generateSummary({ title, description });
    res.json({ summary });
  } catch (error) {
    console.error('Error in /generate-summary:', error);
    res.status(500).json({ error: error.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n${'='.repeat(50)}`);
  console.log(`🚀 BookTok AI Service running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`🎬 Video generation: POST http://localhost:${PORT}/generate-video`);
  console.log(`${'='.repeat(50)}\n`);
});

export default app;
