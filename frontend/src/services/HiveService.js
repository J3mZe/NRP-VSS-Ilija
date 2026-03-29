import api from './api';

const HiveService = {
    getAllHives: async () => {
        const response = await api.get('/api/hives');
        return response.data;
    },

    getHive: async (id) => {
        const response = await api.get(`/api/hives/${id}`);
        return response.data;
    },

    createHive: async (hiveData) => {
        const response = await api.post('/api/hives', hiveData);
        return response.data;
    },

    updateHive: async (id, hiveData) => {
        const response = await api.put(`/api/hives/${id}`, hiveData);
        return response.data;
    },

    deleteHive: async (id) => {
        const response = await api.delete(`/api/hives/${id}`);
        return response.data;
    },

    addRecord: async (id, recordData) => {
        const response = await api.post(`/api/hives/${id}/records`, recordData);
        return response.data;
    }
};

export default HiveService;
