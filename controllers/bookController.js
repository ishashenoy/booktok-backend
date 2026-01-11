const Book = require('../models/bookModel');
const cloudinaryService = require('../services/cloudinaryService');

// AI Services - loaded dynamically since they use ES modules
let aiServices = null;

async function getAIServices() {
    if (aiServices) return aiServices;
    
    try {
        const bookVideoPipeline = await import('../ai-service/services/bookVideoPipeline.js');
        
        aiServices = {
            generateVideoFromSummary: bookVideoPipeline.generateVideoFromSummary,
            generateQuickVideo: bookVideoPipeline.generateQuickVideo,
            cleanupVideo: bookVideoPipeline.cleanupVideo,
        };
        return aiServices;
    } catch (error) {
        console.error('Failed to load AI services:', error.message);
        return null;
    }
}

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

/**
 * Upload a book and automatically generate a video preview
 * POST /api/books/upload-with-video
 * 
 * Body: {
 *   title: string (required),
 *   summary: string (required for video),
 *   genre: string,
 *   keywords: string[],
 *   coverImage: string,
 *   aesthetic: string (optional - for video style),
 *   voiceType: string (optional - 'male' | 'female'),
 *   generateVideo: boolean (default: true)
 * }
 */
exports.uploadBookWithVideo = async (req, res) => {
    try {
        const userId = req.user?.id || req.user?._id || req.userId;
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const { 
            title, 
            summary, 
            genre, 
            keywords, 
            coverImage,
            aesthetic = 'cinematic',
            voiceType = 'female',
            generateVideo = true 
        } = req.body;

        if (!title) {
            return res.status(400).json({ error: 'Title is required' });
        }

        if (generateVideo && !summary) {
            return res.status(400).json({ error: 'Summary is required for video generation' });
        }

        // Create the book first
        const book = await Book.create({
            title,
            summary: summary || '',
            authorId: userId,
            genre: genre || '',
            keywords: keywords || [],
            coverImage: coverImage || '',
            source: 'author_uploaded',
            videoStatus: generateVideo ? 'pending' : 'none',
            videoAesthetic: aesthetic
        });

        console.log(`📚 Book created: ${book._id} - ${title}`);

        // If video generation requested, start it
        if (generateVideo && summary) {
            // Start video generation in background (don't await)
            generateVideoForBook(book._id, summary, title, aesthetic, voiceType);
            
            return res.status(201).json({
                book,
                message: 'Book created. Video generation started in background.',
                videoStatus: 'pending'
            });
        }

        res.status(201).json({ book });
    } catch (err) {
        console.error('Upload book error:', err);
        res.status(500).json({ error: 'Server error', details: err.message });
    }
};

/**
 * Background function to generate video for a book
 */
async function generateVideoForBook(bookId, summary, title, aesthetic, voiceType) {
    try {
        console.log(`\n🎬 Starting video generation for book: ${bookId}`);
        
        // Update status to generating
        await Book.findByIdAndUpdate(bookId, { videoStatus: 'generating' });

        const services = await getAIServices();
        if (!services) {
            throw new Error('AI services not available');
        }

        const result = await services.generateVideoFromSummary({
            summary,
            title,
            aesthetic,
            voiceType,
            numImages: 4
        });

        if (!result.success) {
            throw new Error(result.error || 'Video generation failed');
        }

        let videoUrl;
        let cloudinaryPublicId = null;

        // Try to upload to Cloudinary if configured
        if (cloudinaryService.isConfigured()) {
            console.log(`☁️ Uploading to Cloudinary...`);
            
            const uploadResult = await cloudinaryService.uploadVideo(result.videoPath, {
                folder: 'booktok-videos',
                publicId: `book_${bookId}`
            });

            if (uploadResult.success) {
                videoUrl = uploadResult.url;
                cloudinaryPublicId = uploadResult.publicId;
                
                // Clean up local file after successful upload
                try {
                    await services.cleanupVideo(result.videoPath);
                    console.log(`🧹 Local video file cleaned up`);
                } catch (e) {
                    console.log(`⚠️ Could not clean up local file: ${e.message}`);
                }
            } else {
                console.log(`⚠️ Cloudinary upload failed, using local URL`);
                const path = await import('path');
                const videoFilename = path.default.basename(result.videoPath);
                videoUrl = `/videos/${videoFilename}`;
            }
        } else {
            // Fallback to local storage
            console.log(`📁 Cloudinary not configured, using local storage`);
            const path = await import('path');
            const videoFilename = path.default.basename(result.videoPath);
            videoUrl = `/videos/${videoFilename}`;
        }

        // Update book with video info
        await Book.findByIdAndUpdate(bookId, {
            videoUrl,
            videoStatus: 'completed',
            videoGeneratedAt: new Date(),
            videoError: '',
            ...(cloudinaryPublicId && { cloudinaryPublicId })
        });

        console.log(`✅ Video generated successfully for book: ${bookId}`);
        console.log(`   Video URL: ${videoUrl}`);

    } catch (error) {
        console.error(`❌ Video generation failed for book ${bookId}:`, error.message);
        
        await Book.findByIdAndUpdate(bookId, {
            videoStatus: 'failed',
            videoError: error.message
        });
    }
}

/**
 * Get video status for a book
 * GET /api/books/:id/video-status
 */
exports.getVideoStatus = async (req, res) => {
    try {
        const book = await Book.findById(req.params.id).select('title videoUrl videoStatus videoGeneratedAt videoError');
        if (!book) return res.status(404).json({ error: 'Book not found' });
        
        res.json({
            bookId: book._id,
            title: book.title,
            videoStatus: book.videoStatus,
            videoUrl: book.videoUrl,
            videoGeneratedAt: book.videoGeneratedAt,
            videoError: book.videoError
        });
    } catch (err) {
        res.status(500).json({ error: 'Server error', details: err.message });
    }
};

/**
 * Regenerate video for an existing book
 * POST /api/books/:id/regenerate-video
 */
exports.regenerateVideo = async (req, res) => {
    try {
        const userId = req.user?.id || req.user?._id || req.userId;
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const book = await Book.findById(req.params.id);
        if (!book) return res.status(404).json({ error: 'Book not found' });

        // Check if user owns this book
        if (book.authorId.toString() !== userId.toString()) {
            return res.status(403).json({ error: 'Not authorized to modify this book' });
        }

        if (!book.summary) {
            return res.status(400).json({ error: 'Book has no summary for video generation' });
        }

        const { aesthetic, voiceType } = req.body;

        // Update status and start regeneration
        await Book.findByIdAndUpdate(book._id, { 
            videoStatus: 'pending',
            videoAesthetic: aesthetic || book.videoAesthetic || 'cinematic'
        });

        // Start video generation in background
        generateVideoForBook(
            book._id, 
            book.summary, 
            book.title, 
            aesthetic || book.videoAesthetic || 'cinematic',
            voiceType || 'female'
        );

        res.json({
            message: 'Video regeneration started',
            bookId: book._id,
            videoStatus: 'pending'
        });
    } catch (err) {
        res.status(500).json({ error: 'Server error', details: err.message });
    }
};