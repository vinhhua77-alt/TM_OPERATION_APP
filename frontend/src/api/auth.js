/**
 * Auth API
 */

import apiClient from './client.js';

export const authAPI = {
  login: async (staffId, password) => {
    return apiClient.post('/auth/login', { staffId, password });
  },

  register: async (formData) => {
    return apiClient.post('/auth/register', formData);
  },

  getMe: async () => {
    return apiClient.get('/auth/me');
  }
};

export const passwordResetAPI = {
  requestReset: async (staffId) => {
    return apiClient.post('/password-reset/request', { staffId });
  },

  resetPassword: async (staffId, token, newPassword) => {
    return apiClient.post('/password-reset/reset', { staffId, token, newPassword });
  }
};
