const logger = require('../config/logger');

/**
 * Emit real-time task events to relevant users
 * @param {Object} io - Socket.io instance
 * @param {string} eventName - Event name
 * @param {Object} data - Event data
 * @param {Array} recipients - Array of user IDs to notify
 */
const emitTaskEvent = (io, eventName, data, recipients) => {
    try {
        if (!recipients || recipients.length === 0) {
            return;
        }

        recipients.forEach(userId => {
            io.to(userId.toString()).emit(eventName, data);
        });

        logger.info(`Task event emitted: ${eventName} to ${recipients.length} users`);
    } catch (error) {
        logger.error(`Error emitting task event: ${error.message}`);
    }
};

/**
 * Check if user has access to a task
 * @param {Object} task - Task object
 * @param {string} userId - User ID
 * @returns {boolean} - Whether user has access
 */
const hasTaskAccess = (task, userId) => {
    if (!task || !userId) return false;

    const userIdStr = userId.toString();
    const creatorId = task.creator?._id?.toString() || task.creator?.toString();
    const sharedWith = task.sharedWith?.map(id => id._id?.toString() || id.toString()) || [];

    return creatorId === userIdStr || sharedWith.includes(userIdStr);
};

/**
 * Check if user is the creator of a task
 * @param {Object} task - Task object
 * @param {string} userId - User ID
 * @returns {boolean} - Whether user is the creator
 */
const isTaskCreator = (task, userId) => {
    if (!task || !userId) return false;

    const userIdStr = userId.toString();
    const creatorId = task.creator?._id?.toString() || task.creator?.toString();

    return creatorId === userIdStr;
};

/**
 * Get task due date status
 * @param {Object} task - Task object
 * @returns {string} - Due date status
 */
const getTaskDueDateStatus = (task) => {
    if (!task.dueDate) return 'no-due-date';

    const now = new Date();
    const dueDate = new Date(task.dueDate);
    const diffTime = dueDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'overdue';
    if (diffDays === 0) return 'due-today';
    if (diffDays === 1) return 'due-tomorrow';
    if (diffDays <= 7) return 'due-this-week';

    return 'due-later';
};

/**
 * Filter tasks based on search criteria
 * @param {Array} tasks - Array of tasks
 * @param {Object} filters - Filter criteria
 * @returns {Array} - Filtered tasks
 */
const filterTasks = (tasks, filters) => {
    let filtered = [...tasks];

    if (filters.status) {
        filtered = filtered.filter(task => task.status === filters.status);
    }

    if (filters.priority) {
        filtered = filtered.filter(task => task.priority === filters.priority);
    }

    if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        filtered = filtered.filter(task =>
            task.title.toLowerCase().includes(searchTerm) ||
            (task.description && task.description.toLowerCase().includes(searchTerm))
        );
    }

    if (filters.dueDateStatus) {
        filtered = filtered.filter(task =>
            getTaskDueDateStatus(task) === filters.dueDateStatus
        );
    }

    return filtered;
};

module.exports = {
    emitTaskEvent,
    hasTaskAccess,
    isTaskCreator,
    getTaskDueDateStatus,
    filterTasks
};
