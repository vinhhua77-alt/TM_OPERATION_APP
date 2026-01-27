/**
 * API Client
 * Thay thế google.script.run bằng HTTP requests
 */

import axios from 'axios';
import axiosRetry from 'axios-retry';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://tm-operation-app.onrender.com/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, // 15 seconds timeout
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true // SECURITY: Send HttpOnly cookies with requests
});

// Configure Retry Logic
axiosRetry(apiClient, {
  retries: 3, // Retry 3 times
  retryDelay: (retryCount) => {
    return retryCount * 2000; // 2s, 4s, 6s wait time (Linear backoff is safer for server than Exponential in high load)
    // Or use axiosRetry.exponentialDelay for 1s, 2s, 4s
  },
  retryCondition: (error) => {
    // Retry on Network Error or 5xx status codes
    // NOT retry on 4xx (Client Error) e.g. 401 Unauthorized, 403 Forbidden
    return axiosRetry.isNetworkOrIdempotentRequestError(error) || (error.response?.status >= 500 && error.response?.status <= 599);
  },
  shouldResetTimeout: true // Reset timeout between retries
});

// 1. DEDUPLICATION LOGIC
const pendingRequests = new Map();

function getRequestKey(config) {
  return `${config.method}:${config.url}:${JSON.stringify(config.params)}:${config.data}`;
}

// Request interceptor: Attach Bearer Token (Cross-Domain Support) & Deduplication
apiClient.interceptors.request.use((config) => {
  // Deduplicate GET requests only (Safe and most common)
  if (config.method === 'get') {
    const key = getRequestKey(config);
    if (pendingRequests.has(key)) {
      // Return a special error to be caught by response interceptor
      config.adapter = () => Promise.reject({ isDeduplicated: true, key });
    } else {
      pendingRequests.set(key, true);
    }
  }

  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Add sandbox mode header
  const sandboxMode = localStorage.getItem('sandbox_mode');
  if (sandboxMode === 'true') {
    config.headers['X-Sandbox-Mode'] = 'true';
  }

  return config;
});

// Response interceptor: Xử lý lỗi
apiClient.interceptors.response.use(
  (response) => {
    // Cleanup pending request key
    const key = getRequestKey(response.config);
    pendingRequests.delete(key);
    return response.data;
  },
  (error) => {
    // Handle Deduplicated request
    if (error.isDeduplicated) {
      // For simplicity, we just return a never-resolving promise or a special state
      // This prevents the duplicate UI state/logic from executing
      return new Promise(() => { });
    }

    // Cleanup key even on error
    if (error.config) {
      const key = getRequestKey(error.config);
      pendingRequests.delete(key);
    }

    // Handle timeout specifically
    if (error.code === 'ECONNABORTED') {
      return Promise.reject({ message: 'Kết nối mạng quá chậm, vui lòng thử lại sau.' });
    }

    const message = error.response?.data?.message || error.message || 'Có lỗi xảy ra';

    // Auto-logout on 401 (Optional but good practice)
    // if (error.response?.status === 401) { localStorage.removeItem('token'); window.location.href = '/login'; }

    return Promise.reject({ message, ...error.response?.data });
  }
);

export default apiClient;
