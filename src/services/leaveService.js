/**
 * @file leaveService.js
 * @description Member leave submission and admin/coordinator leave management operations.
 */
import apiClient from './apiClient';

export const leaveService = {
  async submitLeaveRequest(payload) {
    const response = await apiClient.post('/api/leave/submit', payload);
    return response.data;
  },

  async getMyLeaves() {
    const response = await apiClient.get('/api/leave/my-leaves');
    return response.data;
  },

  async getAllLeaves(params = {}) {
    const response = await apiClient.get('/api/leave/all', { params });
    return response.data;
  },

  async getPendingLeaves(params = {}) {
    const response = await apiClient.get('/api/leave/pending', { params });
    return response.data;
  },

  async approveLeave(id, remarks = '') {
    const response = await apiClient.put(`/api/leave/${id}/approve`, { remarks });
    return response.data;
  },

  async rejectLeave(id, remarks = '') {
    const response = await apiClient.put(`/api/leave/${id}/reject`, { remarks });
    return response.data;
  },

  async getLeaveById(id) {
    const response = await apiClient.get(`/api/leave/${id}`);
    return response.data;
  },

  async updateLeaveRequest(id, payload) {
    const response = await apiClient.put(`/api/leave/${id}`, payload);
    return response.data;
  },

  async deleteLeaveRequest(id) {
    const response = await apiClient.delete(`/api/leave/${id}`);
    return response.data;
  },
};

export default leaveService;
