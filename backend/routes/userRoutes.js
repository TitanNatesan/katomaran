const express = require('express');
const router = express.Router();
const { getUserByEmail } = require('../controllers/userController');
const authMiddleware = require('../middleware/auth');

// Apply auth middleware
router.use(authMiddleware);

// @route   GET /api/users/email/:email
// @desc    Get user by email
// @access  Private
router.get('/email/:email', getUserByEmail);

module.exports = router;
