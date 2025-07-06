const { validationResult } = require('express-validator');
const User = require('../models/User');
const { generateToken } = require('../utils/jwt');
const axios = require('axios');
const logger = require('../config/logger');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation errors',
                errors: errors.array()
            });
        }

        const { email, password, name } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create user
        const user = new User({
            email,
            password,
            name: name || email.split('@')[0] // Use email prefix if no name provided
        });

        await user.save();

        // Generate token
        const token = generateToken(user._id);

        logger.info(`User registered: ${email}`);

        res.status(201).json({
            success: true,
            token,
            user: {
                id: user._id,
                email: user.email,
                name: user.name
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation errors',
                errors: errors.array()
            });
        }

        const { email, password } = req.body;

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate token
        const token = generateToken(user._id);

        logger.info(`User logged in: ${email}`);

        res.json({
            success: true,
            token,
            user: {
                id: user._id,
                email: user.email,
                name: user.name
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    GitHub OAuth login
// @route   POST /api/auth/github
// @access  Public
const githubAuth = async (req, res, next) => {
    try {
        const { accessToken, user: githubUser } = req.body;

        if (!accessToken || !githubUser) {
            return res.status(400).json({
                success: false,
                message: 'Access token and user data are required'
            });
        }

        // Verify the GitHub access token by fetching user data from GitHub API
        let githubUserData;
        try {
            const response = await axios.get('https://api.github.com/user', {
                headers: {
                    Authorization: `token ${accessToken}`,
                    'User-Agent': 'Katomaran-App'
                }
            });
            githubUserData = response.data;

            // Get user email if not public
            if (!githubUserData.email) {
                const emailResponse = await axios.get('https://api.github.com/user/emails', {
                    headers: {
                        Authorization: `token ${accessToken}`,
                        'User-Agent': 'Katomaran-App'
                    }
                });
                const primaryEmail = emailResponse.data.find(email => email.primary);
                githubUserData.email = primaryEmail ? primaryEmail.email : null;
            }
        } catch (error) {
            logger.error(`GitHub API verification failed: ${error.message}`);
            return res.status(401).json({
                success: false,
                message: 'Invalid GitHub access token'
            });
        }

        // Use verified email from GitHub or fallback to provided email
        const email = githubUserData.email || githubUser.email;
        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email address is required but not available from GitHub'
            });
        }

        // Check if user exists
        let user = await User.findOne({
            $or: [
                { email: email },
                { githubId: githubUserData.id.toString() }
            ]
        });

        if (user) {
            // Update existing user with GitHub info if not already set
            if (!user.githubId) {
                user.githubId = githubUserData.id.toString();
                user.avatar = user.avatar || githubUserData.avatar_url;
                user.name = user.name || githubUserData.name || githubUserData.login;
                await user.save();
            }
        } else {
            // Create new user
            user = new User({
                email: email,
                githubId: githubUserData.id.toString(),
                name: githubUserData.name || githubUserData.login || email.split('@')[0],
                avatar: githubUserData.avatar_url
            });
            await user.save();
        }

        // Generate token
        const token = generateToken(user._id);

        logger.info(`GitHub OAuth successful for user: ${email}`);

        res.json({
            success: true,
            token,
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                avatar: user.avatar
            }
        });
    } catch (error) {
        logger.error(`GitHub OAuth error: ${error.message}`);
        next(error);
    }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json({
            success: true,
            user
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    register,
    login,
    githubAuth,
    getMe
};
