/**
 * @file communityService.js
 * @description Community endpoints including blogs, stats calibration, batches, and community benefits.
 */
import apiClient from './apiClient';

export const communityService = {
  async getBlogs(params = {}) {
    const response = await apiClient.get('/api/blogs', { params });
    return response.data;
  },

  async createBlog(blogData) {
    const response = await apiClient.post('/api/blogs', blogData);
    return response.data;
  },

  async getStats() {
    const response = await apiClient.get('/api/stats');
    return response.data;
  },

  async updateStats(statsData) {
    const response = await apiClient.post('/api/stats', statsData);
    return response.data;
  },

  async getBatches() {
    const response = await apiClient.get('/api/batches');
    return response.data;
  },

  async updateBatches(batchesData) {
    const response = await apiClient.post('/api/batches', batchesData);
    return response.data;
  },

  async getCommunityBenefits() {
    const response = await apiClient.get('/api/community-benefits');
    return response.data;
  },

  async updateCommunityBenefits(benefitsData) {
    const response = await apiClient.post('/api/community-benefits', benefitsData);
    return response.data;
  },

  async applyCampusAmbassador(formData) {
    const response = await apiClient.post('/api/apply-campus-ambassador', formData);
    return response.data;
  },
};

export default communityService;
