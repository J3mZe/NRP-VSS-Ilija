import api from './api';

const AIService = {
    ask: async (message, context = {}) => {
        const response = await api.post('/api/ai/ask', { message, context });
        return response.data;
    }
};

export default AIService;
