import api from './api';

const HealthService = {
    getOverview: async () => {
        const response = await api.get('/api/health/overview');
        return response.data;
    },
    
    getTrend: async () => {
        const response = await api.get('/api/health/trend');
        return response.data;
    },
    
    getHiveHealth: async (id) => {
        const response = await api.get(`/api/health/hives/${id}`);
        return response.data;
    }
};

export default HealthService;
