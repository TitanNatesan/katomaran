import api from './api';

export const taskService = {
    async getTasks(filters = {}) {
        const params = new URLSearchParams();
        Object.keys(filters).forEach(key => {
            if (filters[key]) {
                params.append(key, filters[key]);
            }
        });

        const response = await api.get(`/tasks?${params.toString()}`);
        return response.data;
    },

    async getTask(id) {
        const response = await api.get(`/tasks/${id}`);
        return response.data.task;
    },

    async createTask(taskData) {
        const response = await api.post('/tasks', taskData);
        return response.data.task;
    },

    async updateTask(id, taskData) {
        const response = await api.put(`/tasks/${id}`, taskData);
        return response.data.task;
    },

    async deleteTask(id) {
        await api.delete(`/tasks/${id}`);
    },

    async shareTask(id, userEmails) {
        const response = await api.post(`/tasks/${id}/share`, { userEmails });
        return response.data.task;
    },
};
