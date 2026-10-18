/**
 * @file trainerService.js
 * @description Trainer and mentor CRUD operations and photo uploads.
 */
import apiClient from './apiClient';

export const trainerService = {
  async getAllTrainers() {
    const response = await apiClient.get('/api/admin/trainers/all-trainers');
    return response.data;
  },

  async addTrainer(trainerData) {
    const response = await apiClient.post('/api/admin/trainers/add-trainer', trainerData);
    return response.data;
  },

  async updateTrainer(id, trainerData) {
    const response = await apiClient.put(`/api/admin/trainers/update-trainer/${id}`, trainerData);
    return response.data;
  },

  async deleteTrainer(id) {
    const response = await apiClient.delete(`/api/admin/trainers/delete-trainer/${id}`);
    return response.data;
  },

  async uploadTrainerImage(formData) {
    const response = await apiClient.post('/upload/trainer_file_upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};

export default trainerService;
