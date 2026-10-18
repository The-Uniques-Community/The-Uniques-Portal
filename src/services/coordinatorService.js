/**
 * @file coordinatorService.js
 * @description Dedicated service for coordinator profile operations, task management, and dashboard analytics.
 */
import apiClient from './apiClient.js';

export const coordinatorService = {
  /**
   * Fetch current authenticated coordinator's profile
   * Backend route: GET /api/member/getProfile
   * @returns {Promise<Object>} The coordinator member object
   */
  async getCoordinatorProfile() {
    const response = await apiClient.get('/api/member/getProfile');
    return response.data?.member || response.data;
  },

  /**
   * Update coordinator profile by member ID
   * Backend route: PUT /api/admin/member/:id
   * @param {string} id - Member document ID
   * @param {Object} updateData - Data fields to update
   * @returns {Promise<Object>} Updated profile object
   */
  async updateCoordinatorProfile(id, updateData) {
    const response = await apiClient.put(`/api/admin/member/${id}`, updateData);
    return response.data?.data || response.data;
  },

  /**
   * Fetch tasks assigned by or managed by current coordinator
   * Backend route: GET /api/uniques360/tasks/coordinator/current
   * @returns {Promise<Array>} Array of coordinator tasks
   */
  async getCoordinatorTasks() {
    const response = await apiClient.get('/api/uniques360/tasks/coordinator/current');
    return response.data;
  },

  /**
   * Aggregate dashboard statistics for coordinator
   * Fetches member counts (/api/admin/member/counts), event counts (/api/events/counts), and coordinator tasks (/api/uniques360/tasks/coordinator/current)
   * @returns {Promise<{memberCounts: Object, eventCounts: Object, tasks: Array}>}
   */
  async getCoordinatorDashboardStats() {
    const [memberCountsRes, eventCountsRes, tasksRes] = await Promise.all([
      apiClient.get('/api/admin/member/counts'),
      apiClient.get('/api/events/counts'),
      apiClient.get('/api/uniques360/tasks/coordinator/current'),
    ]);

    return {
      memberCounts: memberCountsRes.data?.data ?? memberCountsRes.data,
      eventCounts: eventCountsRes.data?.data ?? eventCountsRes.data,
      tasks: tasksRes.data ?? [],
    };
  },
};

export default coordinatorService;
