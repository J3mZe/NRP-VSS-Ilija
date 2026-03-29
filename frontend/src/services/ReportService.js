import api from './api';

const ReportService = {
    getAnnualReport: async () => {
        const response = await api.get('/api/reports/annual');
        return response.data;
    },
    getHealthReport: async () => {
        const response = await api.get('/api/reports/health');
        return response.data;
    },
    getHoneyReservesOverview: async () => {
        const response = await api.get('/api/reports/honey-reserves');
        return response.data;
    },
    getHoneyReservesTrend: async (hiveId) => {
        const response = await api.get(`/api/reports/honey-reserves/${hiveId}/trend`);
        return response.data;
    }
};

export default ReportService;
