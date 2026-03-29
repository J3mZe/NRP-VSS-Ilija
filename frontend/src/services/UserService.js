import api from './api';

const UserService = {
    getProfile: async () => {
        const response = await api.get('/api/users/profile');
        return response.data;
    },
    updateProfile: async (profileData) => {
        const response = await api.put('/api/users/profile', profileData);
        return response.data;
    }
};

export default UserService;
