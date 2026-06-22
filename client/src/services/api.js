import axios from 'axios';

// Backend Base URL — Vite dev server proxies /api to http://localhost:5000
const API_URL = '/api';

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
