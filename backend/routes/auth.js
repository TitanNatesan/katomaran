const express = require('express');
const passport = require('passport');
const router = express.Router();
const { register, login, googleAuth, getMe } = require('../controllers/authController');
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

// @route   GET /api/auth/github
// @desc    GitHub OAuth login
// @access  Public
router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));

// @route   GET /api/auth/github/callback
// @desc    GitHub OAuth callback
// @access  Public
router.get('/github/callback',
    passport.authenticate('github', { session: false }),
    async (req, res) => {
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

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', authMiddleware, getMe);

module.exports = router;
