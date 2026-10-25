/**
 * @file batchController.js
 * @description Unified controller managing Uniques batch cohorts and batch profile metadata.
 * @architecture Mounted at `/api/batches` via `batchRoute.js`. Interacts with the unified `Batch` model (mapped to `batchprofiles`).
 * @agent_note Single Source of Truth architecture: both `/api/batches/all` and `/api/batches/profiles` derive from the unified Batch model.
 */
import mongoose from "mongoose";
import { Batch } from "../../models/community/batchModel.js";

const DEFAULT_BATCHES = [
  "The Uniques 1.0",
  "The Uniques 2.0",
  "The Uniques 3.0",
  "The Uniques 4.0",
  "The Uniques 5.0",
  "The Uniques 6.0",
];

const sortBatchesNaturally = (items, keyExtractor = (x) => x) => {
  return [...items].sort((a, b) => {
    const valA = keyExtractor(a);
    const valB = keyExtractor(b);
    const numA = parseFloat(String(valA).match(/(\d+(\.\d+)?)/)?.[1] || 9999);
    const numB = parseFloat(String(valB).match(/(\d+(\.\d+)?)/)?.[1] || 9999);
    if (numA !== numB) return numA - numB;
    return String(valA).localeCompare(String(valB));
  });
};

const formatCanonicalBatchName = (p) => {
  if (p.label) {
    const clean = p.label.trim();
    if (clean.toLowerCase().startsWith("the uniques")) return clean;
    if (clean.toLowerCase().startsWith("uniques")) return `The ${clean}`;
    return `The Uniques ${clean}`;
  }
  if (p.title) {
    return p.title.replace(/\s*batch\s*/i, " ").trim();
  }
  return p.id;
};

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
 * @desc Retrieve all registered batch cohort names (derived from the single unified Batch model)
 * @route GET /api/batches/all
 * @access Public
 * @returns {Object} 200 - Array of batch name strings
 * @returns {Object} 500 - Server error
 */
export const getAllBatches = async (req, res) => {
  try {
    let profiles = await Batch.find().sort({ createdAt: 1 });
    if (!profiles || profiles.length === 0) {
      await Batch.insertMany(DEFAULT_PROFILES);
      profiles = await Batch.find().sort({ createdAt: 1 });
    }
    const validProfiles = profiles.filter(
      (p) => !/-\d{10,}/.test(p.title || "") && !/-\d{10,}/.test(p.label || "")
    );
    const sortedProfiles = sortBatchesNaturally(validProfiles, (p) => p.label || p.title);
    const names = sortedProfiles.map((p) => formatCanonicalBatchName(p));
    res.status(200).json({ success: true, data: names });
  } catch (error) {
    console.error("Error fetching batch names:", error);
    res.status(500).json({ success: false, message: "Error fetching batch names", error: error.message });
  }
};

/**
 * @desc Register a new batch cohort with automatic prefix normalization and single-collection persistence
 * @route POST /api/batches/add
 * @access Public/Admin
 * @body {string} name - Raw batch name string (e.g., '7.0' or 'The Uniques 7.0')
 * @returns {Object} 200 - Success message and normalized batch name
 * @returns {Object} 400 - If batch name is missing
 * @returns {Object} 500 - Server error
 */
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

    const cleanLabel = name.replace(/^the\s+/i, "").trim();
    const cleanId = cleanLabel.toLowerCase().replace(/[^a-z0-9.]+/g, "-");

    let existing = await Batch.findOne({
      $or: [{ id: cleanId }, { label: cleanLabel }, { title: name }],
    });

    if (!existing) {
      existing = await Batch.create({
        id: cleanId,
        label: cleanLabel,
        title: name,
        description: `${name} is actively engaged in advanced skills training, projects, and innovation within The Uniques Community.`,
        image: "",
        customImage: false,
      });
    }

    res.status(200).json({ success: true, message: "Batch added successfully", data: existing.title || existing.name });
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
export const getBatchProfiles = async (req, res) => {
  try {
    let profiles = await Batch.find().sort({ createdAt: 1 });
    if (!profiles || profiles.length === 0) {
      await Batch.insertMany(DEFAULT_PROFILES);
      profiles = await Batch.find().sort({ createdAt: 1 });
    }
    const validProfiles = profiles.filter(
      (p) => !/-\d{10,}/.test(p.title || "") && !/-\d{10,}/.test(p.label || "")
    );
    const sortedProfiles = sortBatchesNaturally(validProfiles, (p) => p.label || p.title);
    res.status(200).json({ success: true, data: sortedProfiles });
  } catch (error) {
    console.error("Error fetching batch profiles:", error);
    res.status(500).json({ success: false, message: "Error fetching batch profiles", error: error.message });
  }
};

/**
 * @desc Upsert multiple batch profile configuration objects directly in the unified collection
 * @route POST /api/batches/profiles/update
 * @route PUT /api/batches/profiles/update
 * @access Public/Admin
 * @body {Object[]} profiles - Array of batch profile configuration objects
 * @returns {Object} 200 - Success message and full updated profiles array
 * @returns {Object} 400 - If profiles payload is not an array
 * @returns {Object} 500 - Server error
 */
export const saveBatchProfiles = async (req, res) => {
  try {
    const rawProfiles = req.body?.profiles || (req.body?.profile ? [req.body.profile] : null);
    if (!Array.isArray(rawProfiles)) {
      return res.status(400).json({ success: false, message: "Profiles must be an array" });
    }

    for (const p of rawProfiles) {
      if (!p || !p.id) continue;
      const updateDoc = {
        id: p.id,
        label: p.label,
        title: p.title,
        description: p.description,
      };
      if (p.image !== undefined) {
        updateDoc.image = p.image || "";
        updateDoc.customImage = Boolean(p.customImage);
      }
      await Batch.findOneAndUpdate(
        { id: p.id },
        updateDoc,
        { upsert: true, new: true }
      );
    }

    const allProfiles = await Batch.find().sort({ createdAt: 1 });
    const validProfiles = allProfiles.filter(
      (p) => !/-\d{10,}/.test(p.title || "") && !/-\d{10,}/.test(p.label || "")
    );
    const sortedProfiles = sortBatchesNaturally(validProfiles, (p) => p.label || p.title);
    res.status(200).json({ success: true, message: "Batch profiles updated", data: sortedProfiles });
  } catch (error) {
    console.error("Error saving batch profiles:", error);
    res.status(500).json({ success: false, message: "Error saving batch profiles", error: error.message });
  }
};

/**
 * @desc Delete a registered batch atomically by document ID or string ID
 * @route DELETE /api/batches/:id
 * @access Private (Admin / Coordinator)
 * @params {string} id - Batch ObjectId or string id
 * @returns {Object} 200 - Confirmation and deleted document
 */
export const deleteBatchById = async (req, res) => {
  try {
    const { id } = req.params;
    let query = {};
    if (mongoose.Types.ObjectId.isValid(id)) {
      query = { $or: [{ _id: id }, { id }] };
    } else {
      query = { id };
    }

    const deleted = await Batch.findOneAndDelete(query);
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
 * @desc Delete a registered batch atomically by cohort name
 * @route DELETE /api/batches/name/:name
 * @access Private (Admin / Coordinator)
 * @params {string} name - Batch cohort name
 * @returns {Object} 200 - Confirmation and deleted details
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

    const cleanLabel = decodedName.replace(/^the\s+/i, "").trim();
    const cleanId = cleanLabel.toLowerCase().replace(/[^a-z0-9.]+/g, "-");
    const escapedDecoded = decodedName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const escapedLabel = cleanLabel.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const deleted = await Batch.findOneAndDelete({
      $or: [
        { id: cleanId },
        { id: `uniques-${cleanId}` },
        { label: cleanLabel },
        { label: new RegExp(`^${escapedLabel}$`, "i") },
        { title: decodedName },
        { title: normalizedName },
        { title: new RegExp(`^${escapedDecoded}$`, "i") },
      ],
    });

    if (!deleted) {
      return res.status(404).json({ success: false, message: "Batch not found" });
    }

    return res.status(200).json({
      success: true,
      message: `Batch "${decodedName}" deleted completely`,
      data: {
        batch: deleted,
      },
    });
  } catch (error) {
    console.error("Error deleting batch by name:", error);
    return res.status(500).json({ success: false, message: "Error deleting batch by name", error: error.message });
  }
};
