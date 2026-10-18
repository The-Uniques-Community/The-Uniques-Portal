/**
 * @file projectService.js
 * @description Project portfolio, showcases, and media uploads.
 */
import apiClient from './apiClient';

export const projectService = {
  async getProjects(params = {}) {
    const response = await apiClient.get('/api/projects', { params });
    return response.data;
  },

  async getProjectById(id) {
    const response = await apiClient.get(`/api/projects/${id}`);
    return response.data;
  },

  async createProject(projectData) {
    const response = await apiClient.post('/api/projects', projectData);
    return response.data;
  },

  async updateProject(id, projectData) {
    const response = await apiClient.put(`/api/projects/${id}`, projectData);
    return response.data;
  },

  async deleteProject(id) {
    const response = await apiClient.delete(`/api/projects/${id}`);
    return response.data;
  },

  async uploadProjectThumbnail(formData) {
    const response = await apiClient.post('/upload/project_file_upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};

export default projectService;
