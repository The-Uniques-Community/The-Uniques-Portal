import CustomMember from "../../models/community/customMemberModel.js";

const DEFAULT_CUSTOM_MEMBERS = [
  {
    fullName: "Deo",
    email: "deo@theuniques.org",
    admno: "2024BTCS501",
    batch: "The Uniques 5.0",
    course: "B.Tech CSE",
    profileStatus: "active",
    isSuspended: false,
    bio: "Passionate developer and innovator in The Uniques 5.0 batch.",
    skills: ["JavaScript", "Python", "Web Development", "DSA"],
  },
];

export const getCustomMembers = async (req, res) => {
  try {
    let members = await CustomMember.find().sort({ createdAt: -1 });
    if (!members || members.length === 0) {
      await CustomMember.insertMany(DEFAULT_CUSTOM_MEMBERS);
      members = await CustomMember.find().sort({ createdAt: -1 });
    }
    res.status(200).json({ success: true, data: members });
  } catch (error) {
    console.error("Error fetching custom members:", error);
    res.status(500).json({ success: false, message: "Error fetching custom members", error: error.message });
  }
};

export const addCustomMember = async (req, res) => {
  try {
    const memberData = req.body;
    const isLegacy = /1\.0|2\.0|3\.0/.test(memberData.batch || "");
    const initialStatus = isLegacy ? "inactive" : "active";

    const newMember = new CustomMember({
      fullName: memberData.fullName || "Member",
      email: memberData.email || "",
      admno: memberData.admno || "",
      batch: memberData.batch || "The Uniques 5.0",
      course: memberData.course || "B.Tech CSE",
      profileStatus: memberData.isSuspended ? "inactive" : (memberData.profileStatus || initialStatus),
      isSuspended: Boolean(memberData.isSuspended),
      bio: memberData.bio || "Member of The Uniques Community.",
      skills: Array.isArray(memberData.skills) ? memberData.skills : ["Developer"],
      projects: Array.isArray(memberData.projects) ? memberData.projects : [],
      achievements: Array.isArray(memberData.achievements) ? memberData.achievements : [],
      certifications: Array.isArray(memberData.certifications) ? memberData.certifications : [],
    });

    const saved = await newMember.save();
    res.status(201).json({ success: true, message: "Member added successfully", data: saved });
  } catch (error) {
    console.error("Error adding custom member:", error);
    res.status(500).json({ success: false, message: "Error adding custom member", error: error.message });
  }
};

export const updateCustomMember = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const updated = await CustomMember.findByIdAndUpdate(id, updates, { new: true });
    if (!updated) {
      return res.status(404).json({ success: false, message: "Member not found" });
    }
    res.status(200).json({ success: true, message: "Member updated successfully", data: updated });
  } catch (error) {
    console.error("Error updating custom member:", error);
    res.status(500).json({ success: false, message: "Error updating custom member", error: error.message });
  }
};

export const deleteCustomMember = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await CustomMember.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Member not found" });
    }
    res.status(200).json({ success: true, message: "Member deleted successfully", data: deleted });
  } catch (error) {
    console.error("Error deleting custom member:", error);
    res.status(500).json({ success: false, message: "Error deleting custom member", error: error.message });
  }
};
