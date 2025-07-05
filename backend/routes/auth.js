const express = require('express');
const passport = require('passport');
const router = express.Router();
const { register, login, googleAuth, githubAuth, getMe } = require('../controllers/authController');
const { registerValidation, loginValidation } = require('../validators/authValidator');
const authMiddleware = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');
const { generateToken } = require('../utils/jwt');
const logger = require('../config/logger');

// Apply auth rate limiter to all auth routes
router.use(authLimiter);

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', registerValidation, register);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', loginValidation, login);

// @route   POST /api/auth/google
// @desc    Google OAuth login
// @access  Public
router.post('/google', googleAuth);

// @route   POST /api/auth/github
// @desc    GitHub OAuth login
// @access  Public
router.post('/github', githubAuth);

// @route   GET /api/auth/github
// @desc    GitHub OAuth login
// @access  Public
router.get('/github', (req, res, next) => {
    // Check if GitHub OAuth is configured
    if (!process.env.GITHUB_CLIENT_ID || !process.env.GITHUB_CLIENT_SECRET ||
        process.env.GITHUB_CLIENT_ID === 'your_github_client_id_here' ||
        process.env.GITHUB_CLIENT_SECRET === 'your_github_client_secret_here') {
        return res.status(503).json({
            success: false,
            message: 'GitHub OAuth is not configured on this server'
        });
    }
    passport.authenticate('github', { scope: ['user:email'] })(req, res, next);
});

// @route   GET /api/auth/github/callback
// @desc    GitHub OAuth callback
// @access  Public
router.get('/github/callback', (req, res, next) => {
    // Check if GitHub OAuth is configured
    if (!process.env.GITHUB_CLIENT_ID || !process.env.GITHUB_CLIENT_SECRET ||
        process.env.GITHUB_CLIENT_ID === 'your_github_client_id_here' ||
        process.env.GITHUB_CLIENT_SECRET === 'your_github_client_secret_here') {
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        return res.redirect(`${frontendUrl}/auth/callback?error=github_not_configured`);
    }
    passport.authenticate('github', { session: false })(req, res, next);
}, async (req, res) => {
    try {
        const user = req.user;

        // Generate JWT token
        const token = generateToken(user._id);

        // Log successful authentication
        logger.info('GitHub OAuth successful', {
            userId: user._id,
            email: user.email
        });

        // Redirect to frontend with token
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        res.redirect(`${frontendUrl}/auth/callback?token=${token}`);

    } catch (error) {
        logger.error('GitHub OAuth callback error', {
            error: error.message,
            stack: error.stack
        });

        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        res.redirect(`${frontendUrl}/auth/callback?error=auth_failed`);
    }
}
);

// @route   GET /api/auth/google
// @desc    Google OAuth login
// @access  Public
router.get('/google', (req, res, next) => {
    // Check if Google OAuth is configured
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET ||
        process.env.GOOGLE_CLIENT_ID === 'your_google_client_id_here' ||
        process.env.GOOGLE_CLIENT_SECRET === 'your_google_client_secret_here') {
        return res.status(503).json({
            success: false,
            message: 'Google OAuth is not configured on this server'
        });
    }
    passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
});

// @route   GET /api/auth/google/callback
// @desc    Google OAuth callback
// @access  Public
router.get('/google/callback', (req, res, next) => {
    // Check if Google OAuth is configured
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET ||
        process.env.GOOGLE_CLIENT_ID === 'your_google_client_id_here' ||
        process.env.GOOGLE_CLIENT_SECRET === 'your_google_client_secret_here') {
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        return res.redirect(`${frontendUrl}/auth/callback?error=google_not_configured`);
    }
    passport.authenticate('google', { session: false })(req, res, next);
}, async (req, res) => {
    try {
        const user = req.user;

        // Generate JWT token
        const token = generateToken(user._id);

        // Log successful authentication
        logger.info('Google OAuth successful', {
            userId: user._id,
            email: user.email
        });

        // Redirect to frontend with token
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        res.redirect(`${frontendUrl}/auth/callback?token=${token}`);

    } catch (error) {
        logger.error('Google OAuth callback error', {
            error: error.message,
            stack: error.stack
        });

        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        res.redirect(`${frontendUrl}/auth/callback?error=auth_failed`);
    }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', authMiddleware, getMe);

module.exports = router;
