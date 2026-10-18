/**
 * @file uniques360Service.js
 * @description Uniques360 task delegation, status tracking, member assignments, and reporting.
 */
import apiClient from './apiClient';

export const uniques360Service = {
  async createTask(taskData) {
    const response = await apiClient.post('/api/uniques360/tasks', taskData);
    return response.data;
  },

  async getMemberTasks(memberId) {
    const response = await apiClient.get(`/api/uniques360/tasks/member/${memberId}`);
    return response.data;
  },

  async getCoordinatorTasks(coordinatorId) {
    const response = await apiClient.get(`/api/uniques360/tasks/coordinator/${coordinatorId}`);
    return response.data;
  },

  async updateTaskStatus(taskId, status) {
    const response = await apiClient.patch(`/api/uniques360/tasks/${taskId}`, { status });
    return response.data;
  },

  async updateTask(taskId, taskData) {
    const response = await apiClient.put(`/api/uniques360/tasks/${taskId}`, taskData);
    return response.data;
  },

  async deleteTask(taskId) {
    const response = await apiClient.delete(`/api/uniques360/tasks/${taskId}`);
    return response.data;
  },

  async addMemberToTask(taskId, memberId) {
    const response = await apiClient.post(`/api/uniques360/tasks/${taskId}/members`, { memberId });
    return response.data;
  },

  async removeMemberFromTask(taskId, memberId) {
    const response = await apiClient.post(`/api/uniques360/tasks/${taskId}/members/remove`, { memberId });
    return response.data;
  },

  async submitReport(reportData) {
    const response = await apiClient.post('/api/uniques360/reports', reportData);
    return response.data;
  },

  async getTaskReports(taskId) {
    const response = await apiClient.get(`/api/uniques360/reports/task/${taskId}`);
    return response.data;
  },
};

export default uniques360Service;
