const { validationResult } = require('express-validator');
const Task = require('../models/Task');
const logger = require('../config/logger');
const { hasTaskAccess, isTaskCreator } = require('../utils/taskUtils');

// @desc    Get all tasks for authenticated user
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, status, priority, search } = req.query;
        const query = {
            $or: [
                { creator: req.user.id },
                { sharedWith: req.user.id }
            ]
        };

        // Add filters
        if (status) query.status = status;
        if (priority) query.priority = priority;
        if (search) {
            query.$and = [{
                $or: [
                    { title: { $regex: search, $options: 'i' } },
                    { description: { $regex: search, $options: 'i' } }
                ]
            }];
        }

        const tasks = await Task.find(query)
            .populate('creator', 'name email')
            .populate('sharedWith', 'name email')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Task.countDocuments(query);

        res.json({
            success: true,
            tasks,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Private
const getTask = async (req, res, next) => {
    try {
        const task = await Task.findOne({
            _id: req.params.id,
            $or: [
                { creator: req.user.id },
                { sharedWith: req.user.id }
            ]
        })
            .populate('creator', 'name email')
            .populate('sharedWith', 'name email');

        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }

        res.json({
            success: true,
            task
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Create new task
// @route   POST /api/tasks
// @access  Private
const createTask = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation errors',
                errors: errors.array()
            });
        }

        const taskData = {
            ...req.body,
            creator: req.user.id
        };

        const task = new Task(taskData);
        await task.save();

        await task.populate('creator', 'name email');

        logger.info(`Task created: ${task.title} by ${req.user.email}`);

        res.status(201).json({
            success: true,
            task
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation errors',
                errors: errors.array()
            });
        }

        // Enhanced input validation
        if (!req.params.id || !req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid task ID format'
            });
        }

        // First check if task exists and user has access
        const task = await Task.findOne({
            _id: req.params.id,
            $or: [
                { creator: req.user.id },
                { sharedWith: req.user.id }
            ]
        });

        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found or you do not have permission to access this task'
            });
        }

        // Check if user is the creator or has shared access
        const isCreator = task.creator.toString() === req.user.id.toString();
        const hasSharedAccess = task.sharedWith.some(userId => userId.toString() === req.user.id.toString());

        if (!isCreator && !hasSharedAccess) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to update this task'
            });
        }

        // Only creators can modify sharing settings
        const allowedUpdates = ['title', 'description', 'dueDate', 'priority', 'status'];
        if (isCreator) {
            allowedUpdates.push('sharedWith');
        }

        const updates = {};
        allowedUpdates.forEach(field => {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        });

        // Validate specific fields
        if (updates.priority && !['low', 'medium', 'high'].includes(updates.priority)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid priority value. Must be low, medium, or high'
            });
        }

        if (updates.status && !['pending', 'in progress', 'completed'].includes(updates.status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status value. Must be pending, in progress, or completed'
            });
        }

        const updatedTask = await Task.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true, runValidators: true }
        )
            .populate('creator', 'name email')
            .populate('sharedWith', 'name email');

        if (!updatedTask) {
            return res.status(404).json({
                success: false,
                message: 'Task not found after update'
            });
        }

        logger.info(`Task updated: ${updatedTask.title} by ${req.user.email} (Creator: ${isCreator})`);

        res.json({
            success: true,
            message: 'Task updated successfully',
            task: updatedTask
        });
    } catch (error) {
        logger.error(`Task update error: ${error.message}`);

        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: Object.values(error.errors).map(err => ({
                    field: err.path,
                    message: err.message
                }))
            });
        }

        next(error);
    }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = async (req, res, next) => {
    try {
        // Enhanced input validation
        if (!req.params.id || !req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid task ID format'
            });
        }

        // First check if task exists and user has access
        const task = await Task.findOne({
            _id: req.params.id,
            $or: [
                { creator: req.user.id },
                { sharedWith: req.user.id }
            ]
        });

        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found or you do not have permission to access this task'
            });
        }

        // Check if user is the creator
        const isCreator = task.creator.toString() === req.user.id.toString();

        // Only creators can delete tasks
        if (!isCreator) {
            return res.status(403).json({
                success: false,
                message: 'Only the task creator can delete this task'
            });
        }

        const deletedTask = await Task.findByIdAndDelete(req.params.id);

        if (!deletedTask) {
            return res.status(404).json({
                success: false,
                message: 'Task not found or already deleted'
            });
        }

        logger.info(`Task deleted: ${task.title} by ${req.user.email}`);

        res.json({
            success: true,
            message: 'Task deleted successfully'
        });
    } catch (error) {
        logger.error(`Task deletion error: ${error.message}`);
        next(error);
    }
};

// @desc    Share task with users
// @route   POST /api/tasks/:id/share
// @access  Private
const shareTask = async (req, res, next) => {
    try {
        const { userIds } = req.body;

        if (!Array.isArray(userIds) || userIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'User IDs array is required'
            });
        }

        const task = await Task.findOne({
            _id: req.params.id,
            creator: req.user.id
        });

        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found or not authorized'
            });
        }

        // Verify that all user IDs exist
        const User = require('../models/User');
        const validUsers = await User.find({ _id: { $in: userIds } }).select('_id');
        const validUserIds = validUsers.map(user => user._id.toString());

        if (validUserIds.length !== userIds.length) {
            return res.status(400).json({
                success: false,
                message: 'Some user IDs are invalid'
            });
        }

        // Add unique user IDs to sharedWith array
        const uniqueUserIds = [...new Set([...task.sharedWith.map(id => id.toString()), ...validUserIds])];
        task.sharedWith = uniqueUserIds;

        await task.save();
        await task.populate('creator', 'name email');
        await task.populate('sharedWith', 'name email');

        logger.info(`Task shared: ${task.title} by ${req.user.email}`);

        res.json({
            success: true,
            task
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Partially update task (without validation)
// @route   PATCH /api/tasks/:id
// @access  Private
const patchTask = async (req, res, next) => {
    try {
        // Enhanced input validation
        if (!req.params.id || !req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid task ID format'
            });
        }

        // First check if task exists and user has access
        const task = await Task.findOne({
            _id: req.params.id,
            $or: [
                { creator: req.user.id },
                { sharedWith: req.user.id }
            ]
        });

        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found or you do not have permission to access this task'
            });
        }

        // Check if user is the creator or has shared access
        const isCreator = task.creator.toString() === req.user.id.toString();
        const hasSharedAccess = task.sharedWith.some(userId => userId.toString() === req.user.id.toString());

        if (!isCreator && !hasSharedAccess) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to update this task'
            });
        }

        // Only creators can modify sharing settings
        const allowedUpdates = ['title', 'description', 'dueDate', 'priority', 'status'];
        if (isCreator) {
            allowedUpdates.push('sharedWith');
        }

        const updates = {};
        allowedUpdates.forEach(field => {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        });

        // Validate specific fields
        if (updates.priority && !['low', 'medium', 'high'].includes(updates.priority)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid priority value. Must be low, medium, or high'
            });
        }

        if (updates.status && !['pending', 'in progress', 'completed'].includes(updates.status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status value. Must be pending, in progress, or completed'
            });
        }

        const updatedTask = await Task.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true, runValidators: false } // Skip validation for PATCH
        )
            .populate('creator', 'name email')
            .populate('sharedWith', 'name email');

        if (!updatedTask) {
            return res.status(404).json({
                success: false,
                message: 'Task not found after update'
            });
        }

        logger.info(`Task patched: ${updatedTask.title} by ${req.user.email} (Creator: ${isCreator})`);

        res.json({
            success: true,
            message: 'Task updated successfully',
            task: updatedTask
        });
    } catch (error) {
        logger.error(`Task patch error: ${error.message}`);
        next(error);
    }
};

module.exports = {
    getTasks,
    getTask,
    createTask,
    updateTask,
    deleteTask,
    shareTask,
    patchTask
};
