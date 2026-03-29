import api from './api';

const TaskService = {
    getAllTasks: async () => {
        const response = await api.get('/api/tasks');
        return response.data;
    },

    createTask: async (taskData) => {
        const response = await api.post('/api/tasks', taskData);
        return response.data;
    },

    updateTask: async (id, taskData) => {
        const response = await api.put(`/api/tasks/${id}`, taskData);
        return response.data;
    },

    deleteTask: async (id) => {
        const response = await api.delete(`/api/tasks/${id}`);
        return response.data;
    }
};

export default TaskService;
