import api from './api';

export const taskService = {
    // Get all tasks
    async getTasks(params = {}) {
        try {
            const response = await api.get('/tasks', { params });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to fetch tasks' };
        }
    },

    // Get single task
    async getTask(id) {
        try {
            const response = await api.get(`/tasks/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to fetch task' };
        }
    },

    // Create new task
    async createTask(taskData) {
        try {
            const response = await api.post('/tasks', taskData);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to create task' };
        }
    },

    // Update task
    async updateTask(id, taskData) {
        try {
            const response = await api.put(`/tasks/${id}`, taskData);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to update task' };
        }
    },

    // Delete task
    async deleteTask(id) {
        try {
            const response = await api.delete(`/tasks/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to delete task' };
        }
    },

    // Share task
    async shareTask(id, emails) {
        try {
            const response = await api.post(`/tasks/${id}/share`, { emails });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to share task' };
        }
    },
};
