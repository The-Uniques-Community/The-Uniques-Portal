/**
 * @file enquiryService.js
 * @description Public inquiry submission and admin inquiry management operations.
 */
import apiClient from './apiClient';

export const enquiryService = {
  async submitContact(data) {
    const response = await apiClient.post('/api/contact', data);
    return response.data;
  },

  async getEnquiries(params = {}) {
    const response = await apiClient.get('/api/admin/enquiry', { params });
    return response.data;
  },

  async getEnquiryById(id) {
    const response = await apiClient.get(`/api/admin/enquiry/${id}`);
    return response.data;
  },

  async replyEnquiry(id, replyData) {
    const response = await apiClient.post(`/api/admin/enquiry/${id}/reply`, replyData);
    return response.data;
  },

  async updateEnquiryStatus(id, status) {
    const response = await apiClient.patch(`/api/admin/enquiry/${id}/status`, { status });
    return response.data;
  },

  async deleteEnquiry(id) {
    const response = await apiClient.delete(`/api/admin/enquiry/${id}`);
    return response.data;
  },
};

export default enquiryService;
