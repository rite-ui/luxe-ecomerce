import axios from 'axios';

// In development, Vite proxies /api to localhost. In production, use the
// deployed Render API URL from VITE_API_URL.
const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // If we decide to use cookies alongside header tokens
  withCredentials: true, 
});

// Interceptor to attach token automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('luxe_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Unified error extractor
export const getErrorMessage = (error) => {
  if (error.response && error.response.data) {
    return error.response.data.message || 'An error occurred';
  }
  return error.message || 'Server connection failed';
};

export default api;
