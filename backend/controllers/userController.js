const User = require('../models/User');
const logger = require('../config/logger');

// @desc    Get user by email
// @route   GET /api/users/email/:email
// @access  Private
const getUserByEmail = async (req, res, next) => {
    try {
        const user = await User.findOne({ email: req.params.email }).select('_id');

        if (!user) {
            logger.warn(`User not found with email: ${req.params.email}`);
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            user
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getUserByEmail
};
