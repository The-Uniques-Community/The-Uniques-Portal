/**
 * @file successStories.controller.js
 * @description Controller managing community success stories, aggregated placement stats, batch taxonomies, and CRUD operations.
 * @architecture Mounted at `/api/success-stories` and `/api/community/success-stories`. Interacts with `SuccessStory` model.
 */

import mongoose from "mongoose";
import SuccessStory from "../../models/community/successStoryModel.js";
import { paginateQuery, buildSearchQuery } from "../../utils/queryHelper.js";

/**
 * Normalizes batch labels to canonical "Uniques X.0" notation.
 * @param {string} batch
 * @returns {string}
 */
export const normalizeBatchName = (batch) => {
  if (!batch || typeof batch !== "string") return "Uniques 1.0";
  return batch
    .replace(/^the\s*uniques\s*/i, "Uniques ")
    .replace(/^theuniques\s*/i, "Uniques ")
    .replace(/the\s*uniques/i, "Uniques")
    .trim();
};

/**
 * @desc Retrieve all success stories with optional search, batch filter, and pagination
 * @route GET /api/success-stories
 * @access Public / Authenticated
 */
export const getAllSuccessStories = async (req, res) => {
  try {
    const { page, limit, search, batch, all } = req.query;

    const filter = {};

    // 1. Keyword search across name, role, company, summary, and skills
    if (search && search.trim()) {
      const searchFilter = buildSearchQuery(search.trim(), [
        "name",
        "role",
        "company",
        "summary",
        "skills.technologies",
      ]);
      Object.assign(filter, searchFilter);
    }

    // 2. Batch filter
    if (batch && batch !== "ALL" && batch !== "All Batches") {
      const normalizedBatch = normalizeBatchName(batch);
      filter.$or = [
        { batch: normalizedBatch },
        { batch: new RegExp(batch.replace(/the\s*/i, "").trim(), "i") },
      ];
    }

    // If client requests all records without pagination
    if (all === "true" || limit === "all") {
      const stories = await SuccessStory.find(filter)
        .sort({ displayOrder: 1, createdAt: -1 })
        .lean();

      return res.status(200).json({
        success: true,
        data: stories,
        total: stories.length,
      });
    }

    const result = await paginateQuery(SuccessStory, filter, {
      page,
      limit: limit ? parseInt(limit, 10) : 50,
      sort: { displayOrder: 1, createdAt: -1 },
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error("[SuccessStories] Error fetching success stories:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve success stories.",
      error: error.message,
    });
  }
};

/**
 * @desc Retrieve a single success story by MongoDB _id or string slug id
 * @route GET /api/success-stories/:id
 * @access Public / Authenticated
 */
export const getSuccessStoryById = async (req, res) => {
  try {
    const { id } = req.params;

    let story = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      story = await SuccessStory.findById(id).lean();
    }
    if (!story) {
      story = await SuccessStory.findOne({ id }).lean();
    }

    if (!story) {
      return res.status(404).json({
        success: false,
        message: "Success story not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: story,
    });
  } catch (error) {
    console.error("[SuccessStories] Error retrieving success story by ID:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve success story.",
      error: error.message,
    });
  }
};

/**
 * @desc Retrieve aggregated metrics for the 4 KPI stat cards
 * @route GET /api/success-stories/stats
 * @access Public / Authenticated
 */
export const getSuccessStoryStats = async (req, res) => {
  try {
    const [totalStories, distinctCompanies, distinctBatches] = await Promise.all([
      SuccessStory.countDocuments(),
      SuccessStory.distinct("company"),
      SuccessStory.distinct("batch"),
    ]);

    const activeCompaniesCount = distinctCompanies.filter(Boolean).length;
    const activeBatchesCount = distinctBatches.filter(Boolean).length;

    return res.status(200).json({
      success: true,
      stats: {
        totalStories,
        uniqueCompanies: activeCompaniesCount,
        activeBatches: activeBatchesCount,
        verifiedPlacementRate: 100,
      },
    });
  } catch (error) {
    console.error("[SuccessStories] Error computing stats:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to compute success story stats.",
      error: error.message,
    });
  }
};

/**
 * @desc Retrieve list of all registered batches from success stories
 * @route GET /api/success-stories/batches
 * @access Public / Authenticated
 */
export const getSuccessStoryBatches = async (req, res) => {
  try {
    const batches = await SuccessStory.distinct("batch");
    const normalizedList = Array.from(
      new Set(batches.filter(Boolean).map((b) => normalizeBatchName(b)))
    ).sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }));

    return res.status(200).json({
      success: true,
      data: normalizedList,
    });
  } catch (error) {
    console.error("[SuccessStories] Error fetching story batches:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch batches.",
      error: error.message,
    });
  }
};

/**
 * @desc Create a new success story document
 * @route POST /api/success-stories
 * @access Private (Admin & Coordinator)
 */
export const createSuccessStory = async (req, res) => {
  try {
    const {
      id: customId,
      name,
      role,
      company,
      batch,
      summary,
      image,
      video,
      officialUrl,
      isFeatured,
      displayOrder,
      timeline,
      education,
      experience,
      projects,
      skills,
      leadership,
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: "Student name is required." });
    }
    if (!role || !role.trim()) {
      return res.status(400).json({ success: false, message: "Role is required." });
    }
    if (!company || !company.trim()) {
      return res.status(400).json({ success: false, message: "Company is required." });
    }
    if (!batch || !batch.trim()) {
      return res.status(400).json({ success: false, message: "Batch is required." });
    }

    // Generate unique slug id if not supplied
    const generatedId =
      customId && customId.trim()
        ? customId.trim()
        : name.replace(/[^a-zA-Z0-9]/g, "") + "_" + Date.now().toString().slice(-6);

    // Format skills if array or comma string
    let parsedSkills = skills;
    if (typeof skills === "string") {
      parsedSkills = {
        technologies: skills.split(",").map((s) => s.trim()).filter(Boolean),
      };
    }

    const newStory = new SuccessStory({
      id: generatedId,
      name: name.trim(),
      role: role.trim(),
      company: company.trim(),
      batch: normalizeBatchName(batch),
      summary: summary || "",
      image: image || "",
      video: video || "",
      officialUrl: officialUrl || "",
      isFeatured: Boolean(isFeatured),
      displayOrder: typeof displayOrder === "number" ? displayOrder : 0,
      timeline: Array.isArray(timeline) ? timeline : [],
      education: education || {},
      experience: Array.isArray(experience) ? experience : [],
      projects: Array.isArray(projects) ? projects : [],
      skills: parsedSkills || { languages: [], technologies: [], tools: [] },
      leadership: leadership || {},
    });

    const savedStory = await newStory.save();

    return res.status(201).json({
      success: true,
      message: "Success story created successfully.",
      data: savedStory,
    });
  } catch (error) {
    console.error("[SuccessStories] Error creating success story:", error);
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "A success story with this identifier already exists.",
      });
    }
    return res.status(500).json({
      success: false,
      message: "Failed to create success story.",
      error: error.message,
    });
  }
};

/**
 * @desc Update an existing success story document
 * @route PUT /api/success-stories/:id
 * @access Private (Admin & Coordinator)
 */
export const updateSuccessStory = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    if (updates.batch) {
      updates.batch = normalizeBatchName(updates.batch);
    }
    if (typeof updates.skills === "string") {
      updates.skills = {
        technologies: updates.skills.split(",").map((s) => s.trim()).filter(Boolean),
      };
    }

    let story = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      story = await SuccessStory.findByIdAndUpdate(id, { $set: updates }, { new: true, runValidators: true });
    }
    if (!story) {
      story = await SuccessStory.findOneAndUpdate({ id }, { $set: updates }, { new: true, runValidators: true });
    }

    if (!story) {
      return res.status(404).json({
        success: false,
        message: "Success story not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Success story updated successfully.",
      data: story,
    });
  } catch (error) {
    console.error("[SuccessStories] Error updating success story:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update success story.",
      error: error.message,
    });
  }
};

/**
 * @desc Delete a success story document
 * @route DELETE /api/success-stories/:id
 * @access Private (Admin & Coordinator)
 */
export const deleteSuccessStory = async (req, res) => {
  try {
    const { id } = req.params;

    let story = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      story = await SuccessStory.findByIdAndDelete(id);
    }
    if (!story) {
      story = await SuccessStory.findOneAndDelete({ id });
    }

    if (!story) {
      return res.status(404).json({
        success: false,
        message: "Success story not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: `Success story for ${story.name} deleted successfully.`,
      deletedId: story._id,
    });
  } catch (error) {
    console.error("[SuccessStories] Error deleting success story:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete success story.",
      error: error.message,
    });
  }
};
