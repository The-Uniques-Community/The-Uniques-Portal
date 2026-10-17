import axios from "axios";
import { BASE_URL } from "@/config";

const API_URL = `${BASE_URL}/api/admin`;
const UPLOAD_URL = `${BASE_URL}/api`;

// Get all trainers
export const getAllTrainers = async () => {
  try {
    const response = await axios.get(`${API_URL}/all-trainers`);
    return response.data;
  } catch (error) {
    console.error("Error fetching trainers:", error);
    throw error;
  }
};

// Add a new trainer
export const addTrainer = async (trainerData) => {
  try {
    const response = await axios.post(`${API_URL}/add-trainer`, trainerData);
    return response.data;
  } catch (error) {
    console.error("Error adding trainer:", error);
    throw error;
  }
};

// Update a trainer
export const updateTrainer = async (id, trainerData) => {
  try {
    const response = await axios.put(`${API_URL}/update-trainer/${id}`, trainerData);
    return response.data;
  } catch (error) {
    console.error("Error updating trainer:", error);
    throw error;
  }
};

// Delete a trainer
export const deleteTrainer = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/delete-trainer/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting trainer:", error);
    throw error;
  }
};

// Upload trainer image
export const uploadTrainerImage = async (trainerId, trainerName, file) => {
  try {
    const formData = new FormData();
    formData.append("trainerId", trainerId);
    formData.append("trainerName", trainerName);
    formData.append("file", file);

    const response = await axios.post(`${BASE_URL}/upload/trainer_file_upload`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error uploading trainer image:", error);
    throw error;
  }
};
