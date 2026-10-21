/**
 * @file batchController.js
 * @description Controller managing Uniques batch cohorts, batch name registrations, and batch profile descriptions with fallback seeding.
 * @architecture Mounted at `/api/batches` via `batchRoute.js`. Interacts with `BatchName` and `BatchProfile` models.
 * @agent_note Automatically seeds default batch cohorts (1.0 to 6.0) and descriptive batch profile cards when database collections are initially empty.
 */
import mongoose from "mongoose";
import { BatchProfile, BatchName } from "../../models/community/batchModel.js";

const DEFAULT_BATCHES = [
  "The Uniques 1.0",
  "The Uniques 2.0",
  "The Uniques 3.0",
  "The Uniques 4.0",
  "The Uniques 5.0",
  "The Uniques 6.0",
];

const DEFAULT_PROFILES = [
  {
    id: "uniques-1.0",
    label: "Uniques 1.0",
    title: "The Uniques Batch 1.0",
    description:
      "The Uniques 1.0 batch is the pioneering group within The Uniques Community. These senior members have successfully completed their journey and are now placed in various esteemed organizations.\n\nThey have contributed immensely to the growth of the community and continue to mentor and inspire the upcoming batches.\n\nWith a strong foundation of innovation and leadership, Batch 1.0 has set high standards for excellence, paving the way for future cohorts to follow in their footsteps.",
    image: "/src/assets/img/About/uniques1.webp",
    customImage: false,
  },
  {
    id: "uniques-2.0",
    label: "Uniques 2.0",
    title: "The Uniques Batch 2.0",
    description:
      "The Uniques 2.0 batch consists of highly driven junior members who are actively enhancing their skills in modern technologies.\n\nWith a focus on collaboration and hands-on learning, they engage in real-world projects and hackathons, ensuring they are industry-ready.\n\nBatch 2.0 members benefit from mentorship programs, networking opportunities, and workshops to sharpen their expertise. They are on the path to becoming future innovators, following the footsteps of their predecessors while bringing fresh perspectives to the community.",
    image: "/src/assets/img/About/uniques2.webp",
    customImage: false,
  },
  {
    id: "uniques-3.0",
    label: "Uniques 3.0",
    title: "The Uniques Batch 3.0",
    description:
      "The latest addition to The Uniques Community, Batch 3.0, is a dynamic and ambitious group of individuals passionate about pushing boundaries.\n\nAs they embark on their journey, they are exposed to cutting-edge technologies, problem-solving challenges, and research-driven initiatives.\n\nWith an eagerness to learn and innovate, Batch 3.0 aims to make a lasting impact, bringing new ideas and energy to the community. They are being nurtured to be future leaders and trailblazers in their respective fields.",
    image: "/src/assets/img/About/uniques3.webp",
    customImage: false,
  },
  {
    id: "uniques-4.0",
    label: "Uniques 4.0",
    title: "The Uniques Batch 4.0",
    description:
      "The Uniques 4.0 batch is the newest cohort carrying forward the legacy of innovation. They are actively engaged in advanced skills training across Python, Full-Stack Development, DSA, and Salesforce CRM modules.\n\nFocused on real-world implementation, Batch 4.0 is collaborating with community mentors on modern engineering challenges to prepare for elite placements.",
    image: "/src/assets/img/About/uniques4.webp",
    customImage: false,
  },
  {
    id: "uniques-5.0",
    label: "Uniques 5.0",
    title: "The Uniques Batch 5.0",
    description:
      "The Uniques 5.0 batch accelerates modern engineering, working across full-stack applications, distributed architectures, and AI-driven workflows.\n\nCommitted to technical excellence, Batch 5.0 is building impactful software and leading collaborative community initiatives.",
    image: "/src/assets/img/About/uniques4.webp",
    customImage: false,
  },
  {
    id: "uniques-6.0",
    label: "Uniques 6.0",
    title: "The Uniques Batch 6.0",
    description:
      "The Uniques 6.0 batch represents the newest cohort of ambitious builders and innovators. Embracing emerging technologies and real-world problem-solving, Batch 6.0 is carrying the community forward.",
    image: "/src/assets/img/About/uniques4.webp",
    customImage: false,
  },
];

/**
 * @desc Retrieve all registered batch cohort names, seeding defaults if empty
 * @route GET /api/batches/all
 * @access Public
 * @returns {Object} 200 - Array of batch name strings
 * @returns {Object} 500 - Server error
 */
// Get all batch names
export const getAllBatches = async (req, res) => {
  try {
    let batches = await BatchName.find().sort({ createdAt: 1 });
    if (!batches || batches.length === 0) {
      await BatchName.insertMany(DEFAULT_BATCHES.map((name) => ({ name })));
      batches = await BatchName.find().sort({ createdAt: 1 });
    }
    const names = batches.map((b) => b.name);
    res.status(200).json({ success: true, data: names });
  } catch (error) {
    console.error("Error fetching batch names:", error);
    res.status(500).json({ success: false, message: "Error fetching batch names", error: error.message });
  }
};

/**
 * @desc Register a new batch cohort name with automatic prefix normalization
 * @route POST /api/batches/add
 * @access Public/Admin
 * @body {string} name - Raw batch name string (e.g., '7.0' or 'The Uniques 7.0')
 * @returns {Object} 200 - Success message and normalized batch name
 * @returns {Object} 400 - If batch name is missing
 * @returns {Object} 500 - Server error
 */
// Add new batch name
export const addBatch = async (req, res) => {
  try {
    let name = req.body.name || req.body.batchName;
    if (typeof name !== "string" || !name.trim()) {
      return res.status(400).json({ success: false, message: "Batch name is required and must be a non-empty string" });
    }
    name = name.trim();
    if (!name.toLowerCase().startsWith("the uniques") && !name.toLowerCase().startsWith("uniques")) {
      name = `The Uniques ${name}`;
    } else if (name.toLowerCase().startsWith("uniques")) {
      name = `The ${name}`;
    }

    let existing = await BatchName.findOne({ name });
    if (!existing) {
      existing = await BatchName.create({ name });
    }

    res.status(200).json({ success: true, message: "Batch added successfully", data: existing.name });
  } catch (error) {
    console.error("Error adding batch:", error);
    res.status(500).json({ success: false, message: "Error adding batch", error: error.message });
  }
};

/**
 * @desc Retrieve all descriptive batch profile cards, seeding defaults if empty
 * @route GET /api/batches/profiles
 * @access Public
 * @returns {Object} 200 - Array of batch profile objects
 * @returns {Object} 500 - Server error
 */
// Get all batch profiles
export const getBatchProfiles = async (req, res) => {
  try {
    let profiles = await BatchProfile.find().sort({ createdAt: 1 });
    if (!profiles || profiles.length === 0) {
      await BatchProfile.insertMany(DEFAULT_PROFILES);
      profiles = await BatchProfile.find().sort({ createdAt: 1 });
    }
    res.status(200).json({ success: true, data: profiles });
  } catch (error) {
    console.error("Error fetching batch profiles:", error);
    res.status(500).json({ success: false, message: "Error fetching batch profiles", error: error.message });
  }
};

/**
 * @desc Upsert multiple batch profile configuration objects
 * @route POST /api/batches/profiles/update
 * @route PUT /api/batches/profiles/update
 * @access Public/Admin
 * @body {Object[]} profiles - Array of batch profile configuration objects
 * @returns {Object} 200 - Success message and full updated profiles array
 * @returns {Object} 400 - If profiles payload is not an array
 * @returns {Object} 500 - Server error
 */
// Update/Save batch profiles
export const saveBatchProfiles = async (req, res) => {
  try {
    const { profiles } = req.body;
    if (!Array.isArray(profiles)) {
      return res.status(400).json({ success: false, message: "Profiles must be an array" });
    }

    for (const p of profiles) {
      if (!p.id) continue;
      await BatchProfile.findOneAndUpdate(
        { id: p.id },
        {
          id: p.id,
          label: p.label,
          title: p.title,
          description: p.description,
          image: p.image || "",
          customImage: Boolean(p.customImage),
        },
        { upsert: true, new: true }
      );
    }

    const allProfiles = await BatchProfile.find().sort({ createdAt: 1 });
    res.status(200).json({ success: true, message: "Batch profiles updated", data: allProfiles });
  } catch (error) {
    console.error("Error saving batch profiles:", error);
    res.status(500).json({ success: false, message: "Error saving batch profiles", error: error.message });
  }
};

/**
 * @desc Delete a registered batch by document ID
 * @route DELETE /api/batches/:id
 * @access Private (Admin / Coordinator)
 * @params {string} id - Batch ObjectId
 * @returns {Object} 200 - Confirmation and deleted document
 */
export const deleteBatchById = async (req, res) => {
  try {
    const { id } = req.params;
    let deleted = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      deleted = await BatchName.findByIdAndDelete(id);
    }
    if (!deleted) {
      deleted = await BatchName.findOneAndDelete({ _id: id }).catch(() => null);
    }
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Batch not found" });
    }
    return res.status(200).json({
      success: true,
      message: "Batch deleted successfully",
      data: deleted,
    });
  } catch (error) {
    console.error("Error deleting batch by ID:", error);
    return res.status(500).json({ success: false, message: "Error deleting batch", error: error.message });
  }
};

/**
 * @desc Delete a registered batch by name
 * @route DELETE /api/batches/name/:name
 * @access Private (Admin / Coordinator)
 * @params {string} name - Batch cohort name
 * @returns {Object} 200 - Confirmation and deleted document
 */
export const deleteBatchByName = async (req, res) => {
  try {
    const { name } = req.params;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: "Batch name is required" });
    }

    const decodedName = decodeURIComponent(name).trim();
    let normalizedName = decodedName;
    if (!normalizedName.toLowerCase().startsWith("the uniques") && !normalizedName.toLowerCase().startsWith("uniques")) {
      normalizedName = `The Uniques ${normalizedName}`;
    } else if (normalizedName.toLowerCase().startsWith("uniques")) {
      normalizedName = `The ${normalizedName}`;
    }

    const escapedDecoded = decodedName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const deleted = await BatchName.findOneAndDelete({
      $or: [
        { name: decodedName },
        { name: normalizedName },
        { name: new RegExp(`^${escapedDecoded}$`, 'i') },
      ],
    });

    if (!deleted) {
      return res.status(404).json({ success: false, message: "Batch not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Batch deleted successfully",
      data: deleted,
    });
  } catch (error) {
    console.error("Error deleting batch by name:", error);
    return res.status(500).json({ success: false, message: "Error deleting batch by name", error: error.message });
  }
};
