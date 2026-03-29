import api from './api';
import { setToken, logout } from '../utils/auth';

const AuthService = {
    login: async (email, password) => {
        const response = await api.post('/api/auth/login', { email, password });
        return response.data;
    },
    
    register: async (username, email, password, role, first_name, last_name) => {
        const response = await api.post('/api/auth/register', { username, email, password, role, first_name, last_name });
        return response.data;
    },
    
    logout: () => {
        logout();
    }
};

export default AuthService;
