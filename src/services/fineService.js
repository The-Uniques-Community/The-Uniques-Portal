/**
 * @file fineService.js
 * @description Fine accounting, payment status, receipts, and member fine records.
 */
import apiClient from './apiClient';

export const fineService = {
  async getFineStatistics() {
    const response = await apiClient.get('/api/admin/fine/fines/statistics');
    return response.data;
  },

  async getFineMembers(params = {}) {
    const response = await apiClient.get('/api/admin/fine/fines/members', { params });
    return response.data;
  },

  async getPendingFineMembers(params = {}) {
    const response = await apiClient.get('/api/admin/fine/fines/pending/members', { params });
    return response.data;
  },

  async getMemberFines(memberId) {
    const response = await apiClient.get(`/api/admin/fine/members/${memberId}/fines`);
    return response.data;
  },

  async addMemberFine(memberId, fineData) {
    const response = await apiClient.post(`/api/admin/fine/members/${memberId}/fines`, fineData);
    return response.data;
  },

  async updateFineStatus(memberId, fineId, payload) {
    const response = await apiClient.patch(`/api/admin/fine/members/${memberId}/fines/${fineId}`, payload);
    return response.data;
  },

  async deleteFine(memberId, fineId) {
    const response = await apiClient.delete(`/api/admin/fine/members/${memberId}/fines/${fineId}`);
    return response.data;
  },

  async uploadFineReceipt(formData) {
    const response = await apiClient.post('/upload/fine_file_upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  async getMyFines() {
    const response = await apiClient.get('/api/fine');
    return response.data;
  },
};

export default fineService;
