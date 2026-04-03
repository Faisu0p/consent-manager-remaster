import api from './api';

export const getAllUsers = async () => {
  try {
    const response = await api.get('/users/all-users');
    return response.data;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error; 
  }
};

export const deleteUser = async (userId) => {
  try {
    const response = await api.delete(`/users/delete/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

export const createUser = async (userData) => {
  try {
    const response = await api.post('/users/create', userData);
    return response.data;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

