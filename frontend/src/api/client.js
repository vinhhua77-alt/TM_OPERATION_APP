/**
 * API Client
 * Thay thế google.script.run bằng HTTP requests
 */

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://tm-operation-app.onrender.com/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true // SECURITY: Send HttpOnly cookies with requests
});

// Request interceptor: Attach Bearer Token (Cross-Domain Support)
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: Xử lý lỗi
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || error.message || 'Có lỗi xảy ra';
    return Promise.reject({ message, ...error.response?.data });
  }
);

export default apiClient;
