const express = require('express');
const router = express.Router();
const {
    getTasks,
    getTask,
    createTask,
    updateTask,
    deleteTask,
    shareTask
} = require('../controllers/taskController');
const {
    createTaskValidation,
    updateTaskValidation,
    shareTaskValidation
} = require('../validators/taskValidator');
const authMiddleware = require('../middleware/auth');

// Apply auth middleware to all task routes
router.use(authMiddleware);

// @route   GET /api/tasks
// @desc    Get all tasks for authenticated user
// @access  Private
router.get('/', getTasks);

// @route   POST /api/tasks
// @desc    Create a new task
// @access  Private
router.post('/', createTaskValidation, createTask);

// @route   GET /api/tasks/:id
// @desc    Get single task
// @access  Private
router.get('/:id', getTask);

// @route   PUT /api/tasks/:id
// @desc    Update task
// @access  Private
router.put('/:id', updateTaskValidation, updateTask);

// @route   DELETE /api/tasks/:id
// @desc    Delete task
// @access  Private
router.delete('/:id', deleteTask);

// @route   POST /api/tasks/:id/share
// @desc    Share task with users
// @access  Private
router.post('/:id/share', shareTaskValidation, shareTask);

module.exports = router;
