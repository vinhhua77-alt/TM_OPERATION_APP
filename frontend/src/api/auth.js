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
  },

  logout: async () => {
    return apiClient.post('/auth/logout');
  },

  changePassword: async (oldPassword, newPassword) => {
    return apiClient.post('/auth/change-password', { oldPassword, newPassword });
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
