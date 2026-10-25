/**
 * @file successStoriesService.js
 * @description API service for Community Success Stories, portfolio journeys, stats KPIs, and avatar uploads.
 * @architecture Connects to `/api/success-stories` and `/upload/story_file_upload` via centralized apiClient.
 */

import apiClient from "./apiClient";

export const successStoriesService = {
  /**
   * Fetch all success stories with optional filtering (batch, search, pagination)
   * @param {Object} params - { page, limit, search, batch, all }
   * @returns {Promise<Object>} API response data with stories array and metadata
   */
  async getSuccessStories(params = {}) {
    const response = await apiClient.get("/api/success-stories", { params });
    return response.data;
  },

  /**
   * Fetch single success story by MongoDB ID or string slug
   * @param {string} id
   * @returns {Promise<Object>} API response data with story object
   */
  async getSuccessStoryById(id) {
    const response = await apiClient.get(`/api/success-stories/${id}`);
    return response.data;
  },

  /**
   * Fetch aggregated KPI metrics (totalStories, uniqueCompanies, activeBatches, verifiedPlacementRate)
   * @returns {Promise<Object>} API response data with stats
   */
  async getSuccessStoryStats() {
    const response = await apiClient.get("/api/success-stories/stats");
    return response.data;
  },

  /**
   * Fetch list of distinct batches present in success stories
   * @returns {Promise<Object>} API response data with batches array
   */
  async getSuccessStoryBatches() {
    const response = await apiClient.get("/api/success-stories/batches");
    return response.data;
  },

  /**
   * Create a new success story
   * @param {Object} storyData
   * @returns {Promise<Object>} API response data
   */
  async createSuccessStory(storyData) {
    const response = await apiClient.post("/api/success-stories", storyData);
    return response.data;
  },

  /**
   * Update an existing success story
   * @param {string} id
   * @param {Object} storyData
   * @returns {Promise<Object>} API response data
   */
  async updateSuccessStory(id, storyData) {
    const response = await apiClient.put(`/api/success-stories/${id}`, storyData);
    return response.data;
  },

  /**
   * Delete a success story
   * @param {string} id
   * @returns {Promise<Object>} API response data
   */
  async deleteSuccessStory(id) {
    const response = await apiClient.delete(`/api/success-stories/${id}`);
    return response.data;
  },

  /**
   * Upload candidate avatar / photo to Cloud Storage / Google Drive
   * @param {FormData} formData
   * @returns {Promise<Object>} Upload response with file metadata and proxyUrl
   */
  async uploadCandidateAvatar(formData) {
    const response = await apiClient.post("/upload/story_file_upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },
};

export default successStoriesService;
