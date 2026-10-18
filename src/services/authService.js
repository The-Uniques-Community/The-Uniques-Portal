/**
 * @file authService.js
 * @description Authentication and session management operations.
 */
import apiClient from './apiClient';

export const authService = {
  async emailLogin(credentials) {
    const response = await apiClient.post('/auth/emaillogin', credentials);
    return response.data;
  },

  async verifyRole(role) {
    const response = await apiClient.get('/auth/verify_role', { params: { role } });
    return response.data;
  },

  async logout() {
    try {
      await apiClient.post('/auth/logout');
    } catch (e) {
      console.warn('Backend logout failed:', e.message);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('role');
    }
  },

  async sendPasswordResetOtp(email) {
    const response = await apiClient.post('/auth/password-reset/send-otp', { email });
    return response.data;
  },

  async verifyPasswordResetOtp(email, otp) {
    const response = await apiClient.post('/auth/password-reset/verify-otp', { email, otp });
    return response.data;
  },

  async resetPassword(payload) {
    const response = await apiClient.post('/auth/password-reset/reset-password', payload);
    return response.data;
  },
};

export default authService;
