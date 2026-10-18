/**
 * @file memberService.js
 * @description Member management and profile operations across public, member, and admin domains.
 */
import apiClient from './apiClient';

export const memberService = {
  async getPublicMembers(params = {}) {
    const response = await apiClient.get('/api/public/members', { params });
    return response.data;
  },

  async getPublicMemberCounts() {
    const response = await apiClient.get('/api/public/members/counts');
    return response.data;
  },

  async getAdminMembers(params = {}) {
    const response = await apiClient.get('/api/admin/member', { params });
    return response.data;
  },

  async getAdminMemberCounts() {
    const response = await apiClient.get('/api/admin/member/counts');
    return response.data;
  },

  async addMember(memberData) {
    const response = await apiClient.post('/api/admin/member/add', memberData);
    return response.data;
  },

  async updateMember(id, memberData) {
    const response = await apiClient.put(`/api/admin/member/${id}`, memberData);
    return response.data;
  },

  async deleteMember(id) {
    const response = await apiClient.delete(`/api/admin/member/${id}`);
    return response.data;
  },

  async blockMember(id) {
    const response = await apiClient.patch(`/api/admin/member/${id}/block`);
    return response.data;
  },

  async suspendMember(id, suspendUntil = null) {
    const response = await apiClient.patch(`/api/admin/member/${id}/suspend`, { suspendUntil });
    return response.data;
  },

  async getSupplementaryBySemester(semester) {
    const response = await apiClient.get(`/api/admin/member/supplementary/semester/${semester}`);
    return response.data;
  },

  async getAllMemberFines() {
    const response = await apiClient.get('/api/admin/member/fines/all');
    return response.data;
  },

  async getMemberProfile() {
    const response = await apiClient.get('/api/member/getProfile');
    return response.data;
  },

  async updateMemberProfile(id, profileData) {
    let targetId = id;
    let payload = profileData;
    if (typeof id === 'object' && id !== null && !profileData) {
      targetId = id._id || id.id;
      payload = id;
    }
    const response = await apiClient.put(`/api/admin/member/${targetId}`, payload);
    return response.data;
  },
};

export default memberService;
