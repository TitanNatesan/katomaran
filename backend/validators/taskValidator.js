const { body } = require('express-validator');

const createTaskValidation = [
    body('title')
        .trim()
        .notEmpty()
        .withMessage('Title is required')
        .isLength({ min: 1, max: 200 })
        .withMessage('Title must be between 1 and 200 characters'),
    body('description')
        .optional()
        .trim()
        .isLength({ max: 1000 })
        .withMessage('Description must be less than 1000 characters'),
    body('dueDate')
        .optional()
        .isISO8601()
        .withMessage('Due date must be a valid date'),
    body('priority')
        .optional()
        .isIn(['low', 'medium', 'high'])
        .withMessage('Priority must be low, medium, or high'),
    body('status')
        .optional()
        .isIn(['pending', 'in progress', 'in_progress', 'completed'])
        .withMessage('Status must be pending, in progress, or completed'),
    body('sharedWith')
        .optional()
        .isArray()
        .withMessage('SharedWith must be an array')
        .custom((value) => {
            if (value && value.some(id => !id.match(/^[0-9a-fA-F]{24}$/))) {
                throw new Error('SharedWith must contain valid user IDs');
            }
            return true;
        })
];

const updateTaskValidation = [
    body('title')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('Title cannot be empty')
        .isLength({ min: 1, max: 200 })
        .withMessage('Title must be between 1 and 200 characters'),
    body('description')
        .optional()
        .trim()
        .isLength({ max: 1000 })
        .withMessage('Description must be less than 1000 characters'),
    body('dueDate')
        .optional()
        .isISO8601()
        .withMessage('Due date must be a valid date'),
    body('priority')
        .optional()
        .isIn(['low', 'medium', 'high'])
        .withMessage('Priority must be low, medium, or high'),
    body('status')
        .optional()
        .isIn(['pending', 'in progress', 'in_progress', 'completed'])
        .withMessage('Status must be pending, in progress, or completed'),
    body('sharedWith')
        .optional()
        .isArray()
        .withMessage('SharedWith must be an array')
        .custom((value) => {
            if (value && value.some(id => !id.match(/^[0-9a-fA-F]{24}$/))) {
                throw new Error('SharedWith must contain valid user IDs');
            }
            return true;
        })
];

const shareTaskValidation = [
    body('userIds')
        .isArray()
        .withMessage('User IDs must be an array')
        .notEmpty()
        .withMessage('User IDs array cannot be empty')
        .custom((value) => {
            if (!Array.isArray(value) || value.length === 0) {
                throw new Error('At least one user ID is required');
            }
            value.forEach(id => {
                if (!id.match(/^[0-9a-fA-F]{24}$/)) {
                    throw new Error('Invalid user ID format');
                }
            });
            return true;
        })
];

module.exports = {
    createTaskValidation,
    updateTaskValidation,
    shareTaskValidation
};
