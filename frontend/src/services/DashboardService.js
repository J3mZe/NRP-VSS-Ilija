import api from './api';

const DashboardService = {
    getStats: async () => {
        const response = await api.get('/api/dashboard');
        return response.data;
    }
};

export default DashboardService;
