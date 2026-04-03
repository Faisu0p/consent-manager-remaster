import api from './api';

// Login API request
export const login = async (email, password) => {
  try {
    const response = await api.post('login', { email, password });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Logout API request
export const logout = async () => {
  try {
    await api.post('users/logout');
    localStorage.removeItem('authToken');
  } catch (error) {
    console.error('Logout failed:', error);
  }
};
