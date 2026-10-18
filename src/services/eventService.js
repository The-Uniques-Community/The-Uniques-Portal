/**
 * @file eventService.js
 * @description Event management, team assignment, budget tracking, and guest speaker operations.
 */
import apiClient from './apiClient';

export const eventService = {
  async getEvents(params = {}) {
    const response = await apiClient.get('/api/events', { params });
    return response.data;
  },

  async getEventById(id) {
    const response = await apiClient.get(`/api/events/${id}`);
    return response.data;
  },

  async createEvent(eventData) {
    const response = await apiClient.post('/api/events', eventData);
    return response.data;
  },

  async updateEvent(id, eventData) {
    const response = await apiClient.put(`/api/events/${id}`, eventData);
    return response.data;
  },

  async deleteEvent(id) {
    const response = await apiClient.delete(`/api/events/${id}`);
    return response.data;
  },

  async getEventMembers(eventId) {
    const response = await apiClient.get(`/api/events/${eventId}/members`);
    return response.data;
  },

  async addEventMembers(eventId, members) {
    const response = await apiClient.post(`/api/events/${eventId}/members`, { members });
    return response.data;
  },

  async removeEventMember(eventId, memberId) {
    const response = await apiClient.delete(`/api/events/${eventId}/members/${memberId}`);
    return response.data;
  },

  async uploadEventFile(formData) {
    const response = await apiClient.post('/upload/event_file_upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  async getGuests(params = {}) {
    const response = await apiClient.get('/api/guest', { params });
    return response.data;
  },

  async addGuest(guestData) {
    const response = await apiClient.post('/api/guest', guestData);
    return response.data;
  },

  async updateGuest(id, guestData) {
    const response = await apiClient.put(`/api/guest/${id}`, guestData);
    return response.data;
  },

  async deleteGuest(id) {
    const response = await apiClient.delete(`/api/guest/${id}`);
    return response.data;
  },
};

export default eventService;
