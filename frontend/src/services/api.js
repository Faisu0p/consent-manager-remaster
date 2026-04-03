import axios from 'axios';

const baseURL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api/').replace(/\/$/, '') + '/';

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
