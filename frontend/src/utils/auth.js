export const setToken = (token) => {
    localStorage.setItem('accessToken', token);
};

export const getToken = () => {
    return localStorage.getItem('accessToken');
};

export const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('role');
};

export const isAuthenticated = () => {
    return !!getToken();
};
