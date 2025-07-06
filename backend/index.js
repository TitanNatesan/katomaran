const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const winston = require('winston');
const passport = require('passport');

// Load environment variables
dotenv.config();

// Import configurations
const connectDB = require('./config/database');
const logger = require('./config/logger');

// Import middleware
const errorHandler = require('./middleware/errorHandler');
const { generalLimiter } = require('./middleware/rateLimiter');

// Import routes
const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');
const userRoutes = require('./routes/users'); // Import users routes

// Initialize Express app
const app = express();

// Connect to database
connectDB();

// Enable trust proxy for Render's X-Forwarded-For header (fixes rate limit issue)
app.set('trust proxy', 1);

// Initialize Passport
require('./config/passportConfig')(passport);
app.use(passport.initialize());

// CORS configuration
const corsOptions = {
    origin: [
        process.env.FRONTEND_URL || 'http://localhost:3000',
        'https://katomaran-todo-josh.vercel.app',
        'https://katamaran-todo-josh.vercel.app', // Added the corrected URL from your prompt
        'http://localhost:5173',
        'http://localhost:3000'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    credentials: true,
    optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Apply rate limiting
app.use(generalLimiter);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV
    });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/users', userRoutes); // Register userRoutes

// Handle 404 errors
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Error handling middleware (should be last)
app.use(errorHandler);

// Start server only if not in test environment
const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    });
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    logger.error(`Unhandled Rejection: ${err.message}`);
    process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    logger.error(`Uncaught Exception: ${err.message}`);
    process.exit(1);
});

module.exports = app;
