/**
 * @file customMemberController.js
 * @description Controller managing CRUD operations for custom / showcase community member roster entries.
 * @architecture Interacts with CustomMember model and handles endpoints mounted at /api/custom-members.
 */

import { CustomMember } from "../../models/community/customMemberModel.js";

/**
 * Get all custom community members.
 * @route GET /api/custom-members
 */
export const getCustomMembers = async (req, res) => {
  try {
    const members = await CustomMember.find().sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      data: members,
    });
  } catch (error) {
    console.error("Error fetching custom members:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch custom members",
      error: error.message,
    });
  }
};

/**
 * Add or upsert a custom community member.
 * @route POST /api/custom-members/add
 */
export const addCustomMember = async (req, res) => {
  try {
    const payload = req.body;
    if (!payload || !payload.fullName) {
      return res.status(400).json({
        success: false,
        message: "Full name is required",
      });
    }

    if (!payload._id) {
      payload._id = `custom-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    }

    const existing = await CustomMember.findById(payload._id);
    if (existing) {
      Object.assign(existing, payload);
      const saved = await existing.save();
      return res.status(200).json({ success: true, data: saved });
    }

    const member = new CustomMember(payload);
    const saved = await member.save();
    return res.status(201).json({ success: true, data: saved });
  } catch (error) {
    console.error("Error adding custom member:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to add custom member",
      error: error.message,
    });
  }
};

/**
 * Update a custom community member by ID.
 * @route PUT /api/custom-members/:id
 */
export const updateCustomMember = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await CustomMember.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Custom member not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: updated,
    });
  } catch (error) {
    console.error("Error updating custom member:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update custom member",
      error: error.message,
    });
  }
};

/**
 * Delete a custom community member by ID.
 * @route DELETE /api/custom-members/:id
 */
export const deleteCustomMember = async (req, res) => {
  try {
    const { id } = req.params;
    await CustomMember.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Custom member deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting custom member:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete custom member",
      error: error.message,
    });
  }
};
