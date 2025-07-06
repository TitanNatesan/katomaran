const express = require('express');
const passport = require('passport');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { register, login, githubAuth, getMe } = require('../controllers/authController');
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

// @route   POST /api/auth/github
// @desc    GitHub OAuth authentication
// @access  Public
router.post('/github', githubAuth);

// @route   GET /api/auth/github
// @desc    GitHub OAuth login
// @access  Public
router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));

// @route   GET /api/auth/github/callback
// @desc    GitHub OAuth callback
// @access  Public
router.get('/github/callback',
    passport.authenticate('github', { failureRedirect: '/', session: false }),
    async (req, res) => {
        try {
            if (!req.user) {
                logger.error('GitHub OAuth callback: No user found')
                return res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`)
            }

            // Generate JWT token with proper payload
            const token = jwt.sign(
                {
                    userId: req.user._id,
                    email: req.user.email,
                    provider: 'github'
                },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            )

            logger.info('GitHub OAuth successful', {
                userId: req.user._id,
                email: req.user.email
            })

            // Redirect to dashboard with token
            const redirectUrl = `${process.env.FRONTEND_URL}/dashboard?token=${token}`
            res.redirect(redirectUrl)
        } catch (err) {
            logger.error('GitHub callback error', { error: err.message })
            res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`)
        }
    }
);

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', authMiddleware, getMe);

module.exports = router;
