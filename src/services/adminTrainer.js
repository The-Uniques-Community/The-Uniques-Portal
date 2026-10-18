/**
 * @file adminTrainer.js
 * @description Backward-compatible wrapper for trainer operations delegating to trainerService.
 */
import trainerService from "./trainerService";

// Get all trainers
export const getAllTrainers = async () => {
  return trainerService.getAllTrainers();
};

// Add a new trainer
export const addTrainer = async (trainerData) => {
  return trainerService.addTrainer(trainerData);
};

// Update a trainer
export const updateTrainer = async (id, trainerData) => {
  return trainerService.updateTrainer(id, trainerData);
};

// Delete a trainer
export const deleteTrainer = async (id) => {
  return trainerService.deleteTrainer(id);
};

// Upload trainer image
export const uploadTrainerImage = async (trainerId, trainerName, file) => {
  const formData = new FormData();
  formData.append("trainerId", trainerId);
  formData.append("trainerName", trainerName);
  formData.append("file", file);
  return trainerService.uploadTrainerImage(formData);
};

export default trainerService;
