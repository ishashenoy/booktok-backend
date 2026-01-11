require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

// Import routes
const userRoutes = require('./routes/user');
const searchRoutes = require('./routes/search');
const userBookRoutes = require('./routes/userBook');
const generateAnimationRoutes = require('./routes/generateAnimation');
const bookRoutes = require('./routes/books');

const app = express();

const corsOptions = {
  origin: [
    'http://localhost:3000'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));

app.set('trust proxy', 1);

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use((req, res, next) => {
    console.log(req.path, req.method);
    next();
});

// Serve generated videos statically with proper headers
app.use('/videos', (req, res, next) => {
    // Set CORS headers for video files
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Range');
    res.setHeader('Access-Control-Expose-Headers', 'Content-Length, Content-Range');
    
    // Handle video range requests for seeking
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
}, express.static(path.join(__dirname, 'ai-service', 'output'), {
    setHeaders: (res, filePath) => {
        if (filePath.endsWith('.mp4')) {
            res.setHeader('Content-Type', 'video/mp4');
            res.setHeader('Accept-Ranges', 'bytes');
        }
    }
}));

// Health check
app.get('/health', (req, res) => {
  res.json({ ok: true, db: mongoose.connection.readyState === 1 });
});

// Mount routes
app.use('/api/user', userRoutes);
// app.use('/api/search', searchRoutes);
app.use('/api/user-books', userBookRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/generate', generateAnimationRoutes);

// Connect to MongoDB and start server
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        app.listen(process.env.PORT || 3001, () => {
            console.log('\n' + '='.repeat(50));
            console.log('BookTok Server running on port', process.env.PORT || 3001);
            console.log('Health: http://localhost:' + (process.env.PORT || 3001) + '/health');
            console.log('Video: POST /api/generate/video');
            console.log('='.repeat(50) + '\n');
        });
    })
    .catch((error) => {
        console.log('MongoDB connection error:', error);
    });
