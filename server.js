require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Import routes
const userRoutes = require('./routes/user');
const searchRoutes = require('./routes/search');
const userBookRoutes = require('./routes/userBook');
const generateAnimationRoutes = require('./routes/generateAnimation');

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

// middleware
app.use(express.json());
app.use((req, res, next) => {
    console.log(req.path, req.method);
    next();
});

// Health check
app.get('/health', (req, res) => res.json({ ok: true }));

// Mount routes
app.use('/api/user', userRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/user-books', userBookRoutes);
app.use('/api/generate', generateAnimationRoutes);

// connecting to db
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        app.listen(process.env.PORT || 3001, () => {
            console.log('connected to db & listening on port', process.env.PORT || 3001);
        });
    })
    .catch((error) => {
        console.log(error);
    });