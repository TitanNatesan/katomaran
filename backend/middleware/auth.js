const jwt = require('jsonwebtoken');
const User = require('../models/User');
const winston = require('winston');

const authMiddleware = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No token provided'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Support both formats: { id: '...' } (from OAuth) and { userId: '...' } (from login endpoint)
        const userId = decoded.userId || decoded.id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token format'
            });
        }

        const user = await User.findById(userId).select('-password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found'
            });
        }

        req.user = user;
        next();
    } catch (error) {
        winston.error(`Authentication error: ${error.message}`);

        let message = 'Token is not valid';

        if (error.name === 'JsonWebTokenError') {
            message = 'Invalid token';
        } else if (error.name === 'TokenExpiredError') {
            message = 'Token expired';
        }

        res.status(401).json({
            success: false,
            message
        });
    }
};

module.exports = authMiddleware;
