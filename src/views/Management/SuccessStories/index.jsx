/* eslint-disable no-unused-vars */
/**
 * @file index.jsx
 * @description Success Stories Dashboard View for The Uniques Portal.
 * Sourced from https://www.theuniques.in/success-stories/
 * Features aligned KPI stat cards, debounced search & batch filtering,
 * arranged responsive card grid preventing element collisions,
 * full journey detail modals matching the live site, and coordinator CRUD.
 */

import React, { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { useLocation, useNavigate, Link as RouterLink } from "react-router-dom";
import {
  Box,
  Typography,
  Grid,
  Card,
  Avatar,
  Chip,
  Button,
  TextField,
  InputAdornment,
  Breadcrumbs,
  Link,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tabs,
  Tab,
  Divider,
  Paper,
  Tooltip,
  Menu,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Skeleton,
  CircularProgress,
} from "@mui/material";
import { useTheme, alpha } from "@mui/material/styles";
import { useThemeContext } from "@/theme/ThemeProvider";
import { toast } from "react-toastify";
import { useAuth } from "@/hooks/useAuth";
import { normalizeRole } from "@/utils/authUtils";
import { FaEye } from "react-icons/fa";
import ModernStatCard from "@/components/cards/ModernStatCard";
import successStoriesService from "@/services/successStoriesService";

// Icons
import DashboardIcon from "@mui/icons-material/Dashboard";
import AutoStoriesIcon from "@mui/icons-material/AutoStories";
import SearchIcon from "@mui/icons-material/Search";
import SchoolIcon from "@mui/icons-material/School";
import BusinessIcon from "@mui/icons-material/Business";
import WorkIcon from "@mui/icons-material/Work";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import CloseIcon from "@mui/icons-material/Close";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import VerifiedIcon from "@mui/icons-material/Verified";
import CodeIcon from "@mui/icons-material/Code";
import TimelineIcon from "@mui/icons-material/Timeline";
import PersonIcon from "@mui/icons-material/Person";
import MilitaryTechIcon from "@mui/icons-material/MilitaryTech";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import FormatQuoteIcon from "@mui/icons-material/FormatQuote";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ClearIcon from "@mui/icons-material/Clear";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { useBatches } from "@/hooks/useBatches";

/**
 * Normalizes batch strings to use "Uniques X.0" (e.g. "Uniques 4.0") instead of "The Uniques"
 */
const formatBatchLabel = (batch) => {
  if (!batch) return "Uniques 1.0";
  return batch
    .replace(/^the\s*uniques\s*/i, "Uniques ")
    .replace(/^theuniques\s*/i, "Uniques ")
    .replace(/the\s*uniques/i, "Uniques")
    .trim();
};

export default function SuccessStoriesView() {
  const theme = useTheme();
  const { isDarkMode } = useThemeContext();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, role: authRole, isAuthenticated } = useAuth();
  const activeRole = normalizeRole(
    authRole ||
    (typeof window !== "undefined" ? localStorage.getItem("role") : null) ||
    user?.role
  );
  const isCoordinator = activeRole === "coordinator" || location.pathname.startsWith("/coordinator");
  const isAdmin = activeRole === "admin" || location.pathname.startsWith("/admin");
  const basePath = isCoordinator ? "/coordinator" : "/admin";

  // Only Admin or Coordinator logged in with credentials can perform CRUD operations
  const canPerformCrud = Boolean(
    (isAdmin || isCoordinator) &&
    (isAuthenticated || (typeof window !== "undefined" && Boolean(localStorage.getItem("token"))))
  );

  // Data State with backend synchronization
  const [stories, setStories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [stats, setStats] = useState({
    totalStories: 0,
    uniqueCompanies: 0,
    activeBatches: 0,
    verifiedPlacementRate: 100,
  });

  const fileInputRef = useRef(null);

  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBatch, setSelectedBatch] = useState("ALL");
  const [moreBatchAnchor, setMoreBatchAnchor] = useState(null);

  // Modal States
  const [selectedStory, setSelectedStory] = useState(null);
  const [modalTab, setModalTab] = useState(0);
  const [profileSubTab, setProfileSubTab] = useState(0);

  // CRUD Dialog States
  const [storyFormOpen, setStoryFormOpen] = useState(false);
  const [formTab, setFormTab] = useState(0);
  const [editingStory, setEditingStory] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [storyToDelete, setStoryToDelete] = useState(null);

  // Dynamic batches fetched from backend API
  const { labels: dynamicBatchLabels } = useBatches();

  // Empty form generator
  const getEmptyFormData = useCallback((defaultBatch = "Uniques 4.0") => ({
    name: "",
    role: "",
    company: "",
    batch: defaultBatch,
    summary: "",
    image: "",
    video: "",
    officialUrl: "",
    education: {
      institution: "",
      degree: "",
      duration: "",
      location: "",
      details: "",
    },
    skillsLanguages: "",
    skillsTechnologies: "",
    skillsTools: "",
    timeline: [],
    experience: [],
    projects: [],
    leadership: {
      organization: "",
      role: "",
      duration: "",
      achievements: "",
    },
  }), []);

  // Form Fields State
  const [formData, setFormData] = useState(() => getEmptyFormData());

  // Fetch stats from backend
  const loadStats = useCallback(async () => {
    try {
      const statsRes = await successStoriesService.getSuccessStoryStats();
      if (statsRes?.stats) {
        setStats(statsRes.stats);
      }
    } catch (err) {
      console.warn("[SuccessStories] Could not load backend stats, falling back to local calculation:", err);
    }
  }, []);

  // Fetch stories from backend
  const loadStories = useCallback(async () => {
    setIsLoading(true);
    try {
      const [storiesRes, statsRes] = await Promise.all([
        successStoriesService.getSuccessStories({ all: "true" }),
        successStoriesService.getSuccessStoryStats().catch(() => null),
      ]);

      const storyData =
        storiesRes?.data ||
        storiesRes?.items ||
        (Array.isArray(storiesRes) ? storiesRes : []);

      setStories(storyData);

      if (statsRes?.stats) {
        setStats(statsRes.stats);
      } else if (storyData.length > 0) {
        const distinctComp = new Set(storyData.map((s) => s.company).filter(Boolean)).size;
        const distinctBatch = new Set(storyData.map((s) => formatBatchLabel(s.batch)).filter(Boolean)).size;
        setStats({
          totalStories: storyData.length,
          uniqueCompanies: distinctComp,
          activeBatches: distinctBatch,
          verifiedPlacementRate: 100,
        });
      } else {
        setStats({
          totalStories: 0,
          uniqueCompanies: 0,
          activeBatches: 0,
          verifiedPlacementRate: 0,
        });
      }
    } catch (err) {
      console.error("[SuccessStories] Failed to load success stories data:", err);
      toast.error("Failed to load success stories.");
      setStories([]);
      setStats({
        totalStories: 0,
        uniqueCompanies: 0,
        activeBatches: 0,
        verifiedPlacementRate: 0,
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStories();
  }, [loadStories]);

  // Batch navigation pills dynamically computed
  const primaryBatches = useMemo(() => [
    { id: "ALL", label: "All Batches" },
    ...dynamicBatchLabels.slice(0, 4).map((label) => ({ id: label, label })),
  ], [dynamicBatchLabels]);
  const moreBatches = useMemo(() => dynamicBatchLabels.slice(4), [dynamicBatchLabels]);
  const isMoreBatchSelected = moreBatches.includes(selectedBatch);

  // Helper to extract skills cleanly
  const getSkillsList = (story) => {
    if (!story.skills) return [];
    if (Array.isArray(story.skills)) return story.skills;
    if (Array.isArray(story.skills?.technologies)) return story.skills.technologies;
    if (typeof story.skills === "string") {
      return story.skills.split(",").map((s) => s.trim()).filter(Boolean);
    }
    return [];
  };

  // Filtered Stories
  const filteredStories = useMemo(() => {
    return stories.filter((story) => {
      // Batch filter matching both "Uniques X.0" and legacy "The Uniques X.0"
      if (selectedBatch !== "ALL") {
        const formattedBatch = formatBatchLabel(story.batch).toLowerCase();
        const targetBatch = selectedBatch.toLowerCase();
        if (formattedBatch !== targetBatch && !story.batch?.toLowerCase().includes(targetBatch.replace("uniques", "").trim())) {
          return false;
        }
      }

      // Search term
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase().trim();
        const nameMatch = (story.name || "").toLowerCase().includes(query);
        const companyMatch = (story.company || "").toLowerCase().includes(query);
        const roleMatch = (story.role || "").toLowerCase().includes(query);
        const summaryMatch = (story.summary || "").toLowerCase().includes(query);
        const skills = getSkillsList(story);
        const skillsMatch = skills.some((s) => s.toLowerCase().includes(query));
        return nameMatch || companyMatch || roleMatch || summaryMatch || skillsMatch;
      }

      return true;
    });
  }, [stories, searchTerm, selectedBatch]);

  // Modal Handlers
  const handleOpenModal = (story) => {
    setSelectedStory(story);
    setModalTab(0);
    setProfileSubTab(0);
  };

  const handleCloseModal = () => {
    setSelectedStory(null);
  };

  // CRUD Handlers
  const handleOpenAddForm = () => {
    if (!canPerformCrud) {
      toast.error("Unauthorized: Only Admin or Coordinator can add success stories.");
      return;
    }
    setEditingStory(null);
    setFormTab(0);
    setFormData(getEmptyFormData(dynamicBatchLabels[0] || "Uniques 4.0"));
    setStoryFormOpen(true);
  };

  const handleEditStory = (story) => {
    if (!canPerformCrud) {
      toast.error("Unauthorized: Only Admin or Coordinator can edit success stories.");
      return;
    }
    setEditingStory(story);
    setFormTab(0);
    setFormData({
      name: story.name || "",
      role: story.role || "",
      company: story.company || "",
      batch: formatBatchLabel(story.batch) || "Uniques 4.0",
      summary: story.summary || "",
      image: story.image || "",
      video: story.video || "",
      officialUrl: story.officialUrl || "",
      education: {
        institution: story.education?.institution || "",
        degree: story.education?.degree || "",
        duration: story.education?.duration || "",
        location: story.education?.location || "",
        details: story.education?.details || "",
      },
      skillsLanguages: Array.isArray(story.skills?.languages)
        ? story.skills.languages.join(", ")
        : "",
      skillsTechnologies: Array.isArray(story.skills?.technologies)
        ? story.skills.technologies.join(", ")
        : Array.isArray(story.skills)
        ? story.skills.join(", ")
        : typeof story.skills === "string"
        ? story.skills
        : "",
      skillsTools: Array.isArray(story.skills?.tools)
        ? story.skills.tools.join(", ")
        : "",
      timeline: Array.isArray(story.timeline)
        ? story.timeline.map((t) => ({
            year: t.year || new Date().getFullYear(),
            achievements: Array.isArray(t.achievements)
              ? t.achievements.join("\n")
              : t.achievements || "",
          }))
        : [],
      experience: Array.isArray(story.experience)
        ? story.experience.map((e) => ({
            company: e.company || "",
            role: e.role || "",
            duration: e.duration || "",
            location: e.location || "",
            responsibilities: Array.isArray(e.responsibilities)
              ? e.responsibilities.join("\n")
              : e.responsibilities || "",
          }))
        : [],
      projects: Array.isArray(story.projects)
        ? story.projects.map((p) => ({
            name: p.name || "",
            technologies: p.technologies || "",
            date: p.date || "",
            description: p.description || "",
            achievements: Array.isArray(p.achievements)
              ? p.achievements.join("\n")
              : p.achievements || "",
            projectUrl: p.projectUrl || "",
          }))
        : [],
      leadership: {
        organization: story.leadership?.organization || "",
        role: story.leadership?.role || "",
        duration: story.leadership?.duration || "",
        achievements: Array.isArray(story.leadership?.achievements)
          ? story.leadership.achievements.join("\n")
          : story.leadership?.achievements || "",
      },
    });
    setStoryFormOpen(true);
  };

  const handleAvatarFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file (PNG, JPG, WEBP).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image file size exceeds 5MB limit.");
      return;
    }

    const uploadFormData = new FormData();
    uploadFormData.append("file", file);
    uploadFormData.append("name", formData.name || "Candidate");
    uploadFormData.append("batch", formData.batch || "General Stories");
    if (editingStory) {
      uploadFormData.append("storyId", editingStory._id || editingStory.id);
    }

    try {
      setIsUploading(true);
      const res = await successStoriesService.uploadCandidateAvatar(uploadFormData);
      if (res?.file?.proxyUrl) {
        setFormData((prev) => ({ ...prev, image: res.file.proxyUrl }));
        toast.success("Avatar image uploaded successfully!");
      } else if (res?.file?.fileUrl) {
        setFormData((prev) => ({ ...prev, image: res.file.fileUrl }));
        toast.success("Avatar image uploaded successfully!");
      }
    } catch (err) {
      console.error("[SuccessStories] Avatar upload error:", err);
      toast.error(err.response?.data?.message || "Failed to upload avatar image.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleAddTimelineItem = () => {
    setFormData((prev) => ({
      ...prev,
      timeline: [...prev.timeline, { year: new Date().getFullYear(), achievements: "" }],
    }));
  };

  const handleUpdateTimelineItem = (index, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.timeline];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, timeline: updated };
    });
  };

  const handleRemoveTimelineItem = (index) => {
    setFormData((prev) => ({
      ...prev,
      timeline: prev.timeline.filter((_, i) => i !== index),
    }));
  };

  const handleAddExperienceItem = () => {
    setFormData((prev) => ({
      ...prev,
      experience: [
        ...prev.experience,
        { company: "", role: "", duration: "", location: "", responsibilities: "" },
      ],
    }));
  };

  const handleUpdateExperienceItem = (index, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.experience];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, experience: updated };
    });
  };

  const handleRemoveExperienceItem = (index) => {
    setFormData((prev) => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index),
    }));
  };

  const handleAddProjectItem = () => {
    setFormData((prev) => ({
      ...prev,
      projects: [
        ...prev.projects,
        { name: "", technologies: "", date: "", description: "", achievements: "", projectUrl: "" },
      ],
    }));
  };

  const handleUpdateProjectItem = (index, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.projects];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, projects: updated };
    });
  };

  const handleRemoveProjectItem = (index) => {
    setFormData((prev) => ({
      ...prev,
      projects: prev.projects.filter((_, i) => i !== index),
    }));
  };

  const handleSaveStoryForm = async () => {
    if (!canPerformCrud) {
      toast.error("Unauthorized: Only Admin or Coordinator can save success stories.");
      return;
    }
    if (!formData.name.trim() || !formData.role.trim() || !formData.company.trim()) {
      toast.error("Please fill in Name, Role, and Company.");
      return;
    }

    const parsedLanguages = formData.skillsLanguages
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const parsedTechnologies = formData.skillsTechnologies
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const parsedTools = formData.skillsTools
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const parsedTimeline = formData.timeline
      .map((t) => ({
        year: Number(t.year) || new Date().getFullYear(),
        achievements: (typeof t.achievements === "string" ? t.achievements.split("\n") : t.achievements || [])
          .map((a) => a.trim())
          .filter(Boolean),
      }))
      .filter((t) => t.year && t.achievements.length > 0);

    const parsedExperience = formData.experience
      .map((e) => ({
        company: e.company.trim(),
        role: e.role.trim(),
        duration: e.duration.trim(),
        location: e.location.trim(),
        responsibilities: (typeof e.responsibilities === "string"
          ? e.responsibilities.split("\n")
          : e.responsibilities || []
        )
          .map((r) => r.trim())
          .filter(Boolean),
      }))
      .filter((e) => e.company && e.role);

    const parsedProjects = formData.projects
      .map((p) => ({
        name: p.name.trim(),
        technologies: p.technologies.trim(),
        date: p.date.trim(),
        description: p.description.trim(),
        projectUrl: p.projectUrl.trim(),
        achievements: (typeof p.achievements === "string" ? p.achievements.split("\n") : p.achievements || [])
          .map((a) => a.trim())
          .filter(Boolean),
      }))
      .filter((p) => p.name);

    const parsedLeadershipAchievements = (
      typeof formData.leadership?.achievements === "string"
        ? formData.leadership.achievements.split("\n")
        : formData.leadership?.achievements || []
    )
      .map((a) => a.trim())
      .filter(Boolean);

    const payload = {
      name: formData.name.trim(),
      role: formData.role.trim(),
      company: formData.company.trim(),
      batch: formatBatchLabel(formData.batch),
      summary: formData.summary.trim(),
      image: formData.image.trim(),
      video: formData.video.trim(),
      officialUrl: formData.officialUrl.trim(),
      education: {
        institution: formData.education.institution.trim(),
        degree: formData.education.degree.trim(),
        duration: formData.education.duration.trim(),
        location: formData.education.location.trim(),
        details: formData.education.details.trim(),
      },
      skills: {
        languages: parsedLanguages,
        technologies: parsedTechnologies,
        tools: parsedTools,
      },
      timeline: parsedTimeline,
      experience: parsedExperience,
      projects: parsedProjects,
      leadership: {
        organization: formData.leadership?.organization?.trim() || "",
        role: formData.leadership?.role?.trim() || "",
        duration: formData.leadership?.duration?.trim() || "",
        achievements: parsedLeadershipAchievements,
      },
    };

    try {
      setIsSaving(true);
      if (editingStory) {
        const idToUpdate = editingStory._id || editingStory.id;
        const res = await successStoriesService.updateSuccessStory(idToUpdate, payload);
        const updatedStory = res?.data || res?.story || { ...editingStory, ...payload };
        setStories((prev) =>
          prev.map((item) =>
            (item._id && item._id === idToUpdate) || item.id === idToUpdate ? updatedStory : item
          )
        );
        toast.success("Success story updated successfully.");
      } else {
        const res = await successStoriesService.createSuccessStory(payload);
        const newStory = res?.data || res?.story || payload;
        setStories((prev) => [newStory, ...prev]);
        toast.success("New success story created successfully.");
      }
      setStoryFormOpen(false);
      loadStats();
    } catch (err) {
      console.error("[SuccessStories] Save story error:", err);
      toast.error(err.response?.data?.message || "Failed to save success story.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteStory = (story) => {
    if (!canPerformCrud) {
      toast.error("Unauthorized: Only Admin or Coordinator can delete success stories.");
      return;
    }
    setStoryToDelete(story);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!canPerformCrud) {
      toast.error("Unauthorized: Only Admin or Coordinator can delete success stories.");
      return;
    }
    if (!storyToDelete) return;

    try {
      setIsDeleting(true);
      const idToDelete = storyToDelete._id || storyToDelete.id;
      await successStoriesService.deleteSuccessStory(idToDelete);
      setStories((prev) =>
        prev.filter((item) => (item._id ? item._id !== idToDelete : item.id !== idToDelete))
      );
      toast.success(`Removed story for ${storyToDelete.name}.`);
      setDeleteDialogOpen(false);
      setStoryToDelete(null);
      loadStats();
    } catch (err) {
      console.error("[SuccessStories] Delete story error:", err);
      toast.error(err.response?.data?.message || "Failed to delete success story.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Box sx={{ width: "100%", p: { xs: 2, md: 3 }, boxSizing: "border-box" }}>
      {/* 1. TOP SECTION: Dashboard Navigation & Breadcrumbs */}
      <Box
        sx={{
          position: "relative",
          mb: 4,
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" },
          gap: 2.5,
          overflow: "hidden",
        }}
      >


        {/* Left Side: Breadcrumb, Title with Red Underline, and Subtitle */}
        <Box sx={{ position: "relative", zIndex: 1, maxWidth: 820 }}>
          {/* Breadcrumbs */}
          <Breadcrumbs
            aria-label="breadcrumb"
            separator={<Typography sx={{ color: "text.disabled", mx: 0.25, fontSize: "0.85rem" }}>/</Typography>}
            sx={{ mb: 1 }}
          >
            <Link
              component={RouterLink}
              to={`${basePath}/dashboard`}
              underline="hover"
              color="text.secondary"
              sx={{
                display: "inline-flex",
                alignItems: "center",
                fontSize: "0.85rem",
                gap: 0.6,
                fontWeight: 500,
                transition: "color 0.2s ease",
                "&:hover": { color: "#ca0019" },
              }}
            >
              <DashboardIcon sx={{ fontSize: "1.05rem" }} />
              Dashboard
            </Link>
            <Typography
              sx={{
                display: "inline-flex",
                alignItems: "center",
                fontSize: "0.85rem",
                fontWeight: 700,
                gap: 0.6,
                color: "text.primary",
              }}
            >
              <AutoStoriesIcon sx={{ fontSize: "1rem", color: "#ca0019" }} />
              Success Stories
            </Typography>
          </Breadcrumbs>

          {/* Title */}
          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontWeight: 900,
              color: "text.primary",
              letterSpacing: "-0.6px",
              fontSize: { xs: "1.85rem", sm: "2.15rem", md: "2.4rem" },
              lineHeight: 1.15,
            }}
          >
            Success Stories
          </Typography>

          {/* Red Underline Accent Bar */}
          <Box
            sx={{
              width: 44,
              height: 3.5,
              borderRadius: "2px",
              bgcolor: "#ca0019",
              mt: 0.75,
              mb: 1.25,
            }}
          />

          {/* Subtitle */}
          <Typography
            variant="body2"
            sx={{
              color: "text.secondary",
              fontSize: { xs: "0.88rem", sm: "0.93rem" },
              fontWeight: 450,
              lineHeight: 1.55,
              letterSpacing: "0.1px",
            }}
          >
            Inspiring journeys and verified achievements of The Uniques Community graduates across global tech leaders.
          </Typography>
        </Box>

        {/* Right Side: Pill Action Buttons */}
        <Box
          sx={{
            display: "flex",
            gap: 1.5,
            flexWrap: "wrap",
            alignItems: "center",
            position: "relative",
            zIndex: 1,
            flexShrink: 0,
          }}
        >
          {/* Dashboard Pill Button */}
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon sx={{ fontSize: 18, transition: "transform 0.2s ease" }} />}
            onClick={() => navigate(`${basePath}/dashboard`)}
            sx={{
              borderRadius: "9999px",
              textTransform: "none",
              fontWeight: 700,
              fontSize: "0.875rem",
              borderColor: isDarkMode ? "rgba(255, 255, 255, 0.15)" : "#e2e8f0",
              color: "text.primary",
              px: 2.75,
              py: 0.9,
              bgcolor: isDarkMode ? "rgba(255, 255, 255, 0.04)" : "#ffffff",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
              transition: "all 0.2s ease",
              "&:hover": {
                borderColor: isDarkMode ? "rgba(255, 255, 255, 0.3)" : "#cbd5e1",
                bgcolor: isDarkMode ? "rgba(255, 255, 255, 0.08)" : "#f8fafc",
                boxShadow: "0 3px 10px rgba(0, 0, 0, 0.06)",
                "& .MuiButton-startIcon": {
                  transform: "translateX(-3px)",
                },
              },
            }}
          >
            Dashboard
          </Button>

          {/* Live Site Pill Button */}
          <Button
            variant="contained"
            startIcon={<OpenInNewIcon sx={{ fontSize: 17 }} />}
            onClick={() => window.open("https://www.theuniques.in/success-stories", "_blank")}
            sx={{
              borderRadius: "9999px",
              textTransform: "none",
              fontWeight: 700,
              fontSize: "0.875rem",
              background: "linear-gradient(135deg, #ca0019 0%, #b91c1c 100%)",
              color: "#ffffff",
              px: 3,
              py: 0.9,
              boxShadow: "0 4px 14px rgba(202, 0, 25, 0.32)",
              transition: "all 0.2s ease",
              "&:hover": {
                background: "linear-gradient(135deg, #dc2626 0%, #ca0019 100%)",
                boxShadow: "0 6px 18px rgba(202, 0, 25, 0.45)",
                transform: "translateY(-1px)",
              },
            }}
          >
            Live Site
          </Button>
        </Box>
      </Box>

      {/* 2. DASHBOARD KPI STAT CARDS */}
      <Box sx={{ mb: 3.5 }}>
        <Grid container spacing={2.5} alignItems="stretch">
          <Grid item xs={12} sm={6} md={3} sx={{ display: "flex" }}>
            <ModernStatCard
              icon={<AutoStoriesIcon fontSize="small" />}
              label="Total Success Stories"
              value={stats.totalStories}
              color="#ca0019"
              progress={65}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3} sx={{ display: "flex" }}>
            <ModernStatCard
              icon={<BusinessIcon fontSize="small" />}
              label="Top Tech Companies"
              value={`${stats.uniqueCompanies}+`}
              color="#2e7d32"
              progress={65}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3} sx={{ display: "flex" }}>
            <ModernStatCard
              icon={<SchoolIcon fontSize="small" />}
              label="Active Batches"
              value={`${stats.activeBatches} Batches`}
              color="#2196F3"
              progress={65}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3} sx={{ display: "flex" }}>
            <ModernStatCard
              icon={<WorkIcon fontSize="small" />}
              label="Verified Placement"
              value={`${stats.verifiedPlacementRate}%`}
              color="#f59e0b"
              progress={65}
            />
          </Grid>
        </Grid>
      </Box>

      {/* 3. FILTER & SEARCH CONTROL TOOLBAR (Minimal, Crisp SaaS Toolbar) */}
      <Paper
        elevation={0}
        sx={{
          p: 1.5,
          mb: 3.5,
          borderRadius: "14px",
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.03)",
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          alignItems: { xs: "stretch", md: "center" },
          justifyContent: "space-between",
          gap: 1.5,
        }}
      >
        {/* Search Input */}
        <TextField
          size="small"
          placeholder="Search by name, role, company, or skills..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: "text.secondary", fontSize: 20 }} />
              </InputAdornment>
            ),
            endAdornment: searchTerm && (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => setSearchTerm("")}>
                  <ClearIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{
            width: { xs: "100%", md: 350 },
            flexShrink: 0,
            "& .MuiOutlinedInput-root": {
              borderRadius: "10px",
              height: 40,
              fontSize: "0.88rem",
              bgcolor: isDarkMode ? "rgba(255,255,255,0.03)" : "#f8fafc",
              "& fieldset": {
                borderColor: isDarkMode ? "rgba(255,255,255,0.08)" : "#e2e8f0",
              },
              "&:hover fieldset": {
                borderColor: isDarkMode ? "rgba(255,255,255,0.2)" : "#cbd5e1",
              },
              "&.Mui-focused fieldset": {
                borderColor: "#ca0019",
                borderWidth: "1.5px",
              },
            },
          }}
        />

        {/* Batch Filter Segment */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.75,
            flexWrap: "wrap",
            overflowX: "auto",
          }}
        >
          <Typography
            variant="body2"
            sx={{
              fontWeight: 600,
              color: "text.secondary",
              fontSize: "0.82rem",
              mr: 0.5,
              display: { xs: "none", sm: "block" },
            }}
          >
            Batch:
          </Typography>

          {primaryBatches.map((batch) => {
            const isSelected = selectedBatch === batch.id;
            return (
              <Button
                key={batch.id}
                onClick={() => setSelectedBatch(batch.id)}
                size="small"
                sx={{
                  borderRadius: "8px",
                  textTransform: "none",
                  fontWeight: isSelected ? 700 : 500,
                  fontSize: "0.82rem",
                  px: 1.6,
                  py: 0.5,
                  minHeight: 32,
                  bgcolor: isSelected
                    ? "#ca0019"
                    : isDarkMode
                    ? "rgba(255,255,255,0.03)"
                    : "#f8fafc",
                  color: isSelected ? "#ffffff" : "text.secondary",
                  border: "1px solid",
                  borderColor: isSelected
                    ? "#ca0019"
                    : isDarkMode
                    ? "rgba(255,255,255,0.08)"
                    : "#e2e8f0",
                  boxShadow: isSelected ? "0 2px 8px rgba(202, 0, 25, 0.2)" : "none",
                  transition: "all 0.15s ease",
                  "&:hover": {
                    bgcolor: isSelected
                      ? "#a30014"
                      : isDarkMode
                      ? "rgba(255,255,255,0.07)"
                      : "#f1f5f9",
                    color: isSelected ? "#ffffff" : "text.primary",
                  },
                }}
              >
                {batch.label}
              </Button>
            );
          })}

          {/* More batches dropdown */}
          {moreBatches.length > 0 && (
            <>
              <Button
                size="small"
                onClick={(e) => setMoreBatchAnchor(e.currentTarget)}
                endIcon={<KeyboardArrowDownIcon sx={{ fontSize: 16 }} />}
                sx={{
                  borderRadius: "8px",
                  border: "1px solid",
                  borderColor: isMoreBatchSelected
                    ? "#ca0019"
                    : isDarkMode
                    ? "rgba(255,255,255,0.08)"
                    : "#e2e8f0",
                  textTransform: "none",
                  fontWeight: isMoreBatchSelected ? 700 : 500,
                  fontSize: "0.82rem",
                  color: isMoreBatchSelected ? "#ffffff" : "text.secondary",
                  bgcolor: isMoreBatchSelected
                    ? "#ca0019"
                    : isDarkMode
                    ? "rgba(255,255,255,0.03)"
                    : "#f8fafc",
                  px: 1.5,
                  py: 0.5,
                  minHeight: 32,
                  "&:hover": {
                    bgcolor: isMoreBatchSelected
                      ? "#a30014"
                      : isDarkMode
                      ? "rgba(255,255,255,0.07)"
                      : "#f1f5f9",
                    color: isMoreBatchSelected ? "#ffffff" : "text.primary",
                  },
                }}
              >
                {isMoreBatchSelected ? selectedBatch : "More"}
              </Button>

              <Menu
                anchorEl={moreBatchAnchor}
                open={Boolean(moreBatchAnchor)}
                onClose={() => setMoreBatchAnchor(null)}
                PaperProps={{
                  sx: {
                    borderRadius: "10px",
                    mt: 0.5,
                    border: "1px solid",
                    borderColor: "divider",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                  },
                }}
              >
                {moreBatches.map((batch) => (
                  <MenuItem
                    key={batch}
                    onClick={() => {
                      setSelectedBatch(batch);
                      setMoreBatchAnchor(null);
                    }}
                    selected={selectedBatch === batch}
                    sx={{ fontSize: "0.85rem", fontWeight: 500, py: 0.8, px: 2 }}
                  >
                    {batch}
                  </MenuItem>
                ))}
              </Menu>
            </>
          )}
        </Box>
      </Paper>

      {/* 4. SECTION HEADER WITH TITLE & CRUD ACTION */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2.5,
          flexWrap: "wrap",
          gap: 1.5,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
          <Typography
            variant="h5"
            sx={{ fontWeight: 800, color: "text.primary", fontSize: "1.25rem", letterSpacing: "-0.3px" }}
          >
            Community Success Stories
          </Typography>
          <Chip
            label={filteredStories.length}
            size="small"
            sx={{
              fontWeight: 700,
              fontSize: "0.78rem",
              height: 24,
              borderRadius: "6px",
              bgcolor: isDarkMode ? "rgba(255,255,255,0.08)" : "#f1f5f9",
              color: "text.secondary",
            }}
          />
        </Box>

        {canPerformCrud && (
          <Button
            variant="contained"
            size="small"
            startIcon={<AddIcon />}
            onClick={handleOpenAddForm}
            sx={{
              bgcolor: "#ca0019",
              color: "#ffffff",
              fontWeight: 600,
              fontSize: "0.85rem",
              textTransform: "none",
              borderRadius: "9px",
              px: 2,
              py: 0.7,
              boxShadow: "none",
              "&:hover": {
                bgcolor: "#a30014",
                boxShadow: "0 2px 8px rgba(202, 0, 25, 0.25)",
              },
            }}
          >
            Add Story
          </Button>
        )}
      </Box>

      {/* 5. SUCCESS STORIES CARDS GRID (Minimal, Spacious 3-Column Layout) */}
      {isLoading ? (
        <Grid container spacing={3}>
          {[1, 2, 3, 4, 5, 6].map((sk) => (
            <Grid item xs={12} sm={6} lg={4} key={sk}>
              <Card
                elevation={0}
                sx={{
                  height: "100%",
                  minHeight: 380,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  borderRadius: "20px",
                  border: "1px solid",
                  borderColor: isDarkMode ? "rgba(255, 255, 255, 0.08)" : "#e2e8f0",
                  bgcolor: isDarkMode ? "background.paper" : "#ffffff",
                  p: 3,
                }}
              >
                <Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                    <Skeleton variant="rounded" width={84} height={26} sx={{ borderRadius: "6px" }} />
                    <Skeleton variant="rounded" width={92} height={26} sx={{ borderRadius: "6px" }} />
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2.2 }}>
                    <Skeleton variant="circular" width={62} height={62} />
                    <Box sx={{ flex: 1 }}>
                      <Skeleton variant="text" width="75%" height={26} />
                      <Skeleton variant="text" width="55%" height={20} />
                    </Box>
                  </Box>
                  <Skeleton variant="rounded" width="100%" height={68} sx={{ borderRadius: "10px", mb: 2 }} />
                  <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
                    <Skeleton variant="rounded" width={65} height={24} sx={{ borderRadius: "6px" }} />
                    <Skeleton variant="rounded" width={80} height={24} sx={{ borderRadius: "6px" }} />
                    <Skeleton variant="rounded" width={70} height={24} sx={{ borderRadius: "6px" }} />
                  </Box>
                </Box>
                <Skeleton variant="rounded" width="100%" height={40} sx={{ borderRadius: "10px" }} />
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : filteredStories.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            p: 6,
            textAlign: "center",
            borderRadius: "16px",
            border: "1px dashed",
            borderColor: "divider",
            bgcolor: "background.paper",
          }}
        >
          <AutoStoriesIcon sx={{ fontSize: 44, color: "text.secondary", mb: 1, opacity: 0.5 }} />
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            No success stories found
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Try adjusting your search query or selecting a different batch.
          </Typography>
          <Button
            variant="outlined"
            size="small"
            onClick={() => {
              setSearchTerm("");
              setSelectedBatch("ALL");
            }}
            sx={{ borderRadius: "8px", textTransform: "none", fontWeight: 600 }}
          >
            Clear Filters
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {filteredStories.map((story) => (
            <Grid item xs={12} sm={6} lg={4} key={story.id || story._id}>
              <Card
                elevation={0}
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  borderRadius: "20px",
                  border: "1px solid",
                  borderColor: isDarkMode ? "rgba(255, 255, 255, 0.08)" : "#e2e8f0",
                  bgcolor: isDarkMode ? "background.paper" : "#ffffff",
                  boxShadow: isDarkMode
                    ? "0 4px 20px -2px rgba(0, 0, 0, 0.5)"
                    : "0 4px 20px -2px rgba(15, 23, 42, 0.04), 0 1px 3px rgba(0, 0, 0, 0.02)",
                  p: { xs: 2.25, sm: 2.75 },
                  boxSizing: "border-box",
                  position: "relative",
                  overflow: "hidden",
                  transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
                  "&:hover": {
                    transform: "translateY(-5px)",
                    boxShadow: isDarkMode
                      ? "0 20px 35px -8px rgba(0,0,0,0.7), 0 0 25px -4px rgba(202, 0, 25, 0.22)"
                      : "0 20px 35px -8px rgba(202, 0, 25, 0.09), 0 12px 24px -6px rgba(15, 23, 42, 0.06)",
                    borderColor: isDarkMode ? "rgba(202, 0, 25, 0.35)" : "rgba(202, 0, 25, 0.25)",
                    "& .card-accent-pill": {
                      width: "5px",
                      opacity: 1,
                    },
                  },
                }}
              >
                {/* 1. Left Edge Brand Accent Pill */}
                <Box
                  className="card-accent-pill"
                  sx={{
                    position: "absolute",
                    left: 0,
                    top: 24,
                    bottom: 24,
                    width: 4,
                    borderRadius: "0 4px 4px 0",
                    background: "linear-gradient(180deg, #ca0019 0%, #ff4d6d 100%)",
                    opacity: 0.85,
                    transition: "all 0.3s ease",
                    zIndex: 2,
                  }}
                />

                <Box sx={{ position: "relative", zIndex: 1 }}>
                  {/* Top Status & Batch Row */}
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 2.2,
                    }}
                  >
                    {/* Left: Batch & Active Status Pill */}
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                      {/* Batch Tag */}
                      <Box
                        sx={{
                          display: "inline-flex",
                          alignItems: "center",
                          bgcolor: isDarkMode ? "rgba(255, 255, 255, 0.05)" : "#f8fafc",
                          borderRadius: "8px",
                          px: 1.25,
                          py: 0.4,
                          border: "1px solid",
                          borderColor: isDarkMode ? "rgba(255, 255, 255, 0.08)" : "#e2e8f0",
                        }}
                      >
                        <Typography
                          sx={{
                            fontWeight: 700,
                            fontSize: "0.75rem",
                            color: isDarkMode ? "#e2e8f0" : "#334155",
                            letterSpacing: "0.2px",
                          }}
                        >
                          {formatBatchLabel(story.batch)}
                        </Typography>
                      </Box>

                      {/* Active / Alumni Status Indicator */}
                      <Box
                        sx={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 0.6,
                          px: 1.2,
                          py: 0.35,
                          borderRadius: "20px",
                          bgcolor: isDarkMode ? "rgba(16, 185, 129, 0.12)" : "#ecfdf5",
                          border: "1px solid",
                          borderColor: isDarkMode ? "rgba(16, 185, 129, 0.25)" : "#d1fae5",
                        }}
                      >
                        <Box
                          sx={{
                            width: 6,
                            height: 6,
                            borderRadius: "50%",
                            bgcolor: "#10b981",
                            boxShadow: "0 0 6px #10b981",
                          }}
                        />
                        <Typography
                          sx={{
                            fontSize: "0.72rem",
                            fontWeight: 700,
                            color: isDarkMode ? "#34d399" : "#059669",
                            letterSpacing: "0.2px",
                          }}
                        >
                          Active
                        </Typography>
                      </Box>
                    </Box>

                    {/* Right: Circular Ghost Actions (Edit & Delete) - Only visible to Admin and Coordinator */}
                    {canPerformCrud && (
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                        <Tooltip title="Edit Story">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditStory(story);
                            }}
                            sx={{
                              width: 32,
                              height: 32,
                              borderRadius: "50%",
                              bgcolor: isDarkMode ? "rgba(37, 99, 235, 0.12)" : "#eff6ff",
                              color: isDarkMode ? "#60a5fa" : "#2563eb",
                              border: "1px solid",
                              borderColor: isDarkMode ? "rgba(37, 99, 235, 0.25)" : "#dbeafe",
                              transition: "all 0.2s ease",
                              "&:hover": {
                                bgcolor: "#2563eb",
                                color: "#ffffff",
                                transform: "scale(1.08)",
                                boxShadow: "0 2px 8px rgba(37, 99, 235, 0.3)",
                              },
                            }}
                          >
                            <EditIcon sx={{ fontSize: 15 }} />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Delete Story">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteStory(story);
                            }}
                            sx={{
                              width: 32,
                              height: 32,
                              borderRadius: "50%",
                              bgcolor: isDarkMode ? "rgba(220, 38, 38, 0.12)" : "#fef2f2",
                              color: isDarkMode ? "#f87171" : "#dc2626",
                              border: "1px solid",
                              borderColor: isDarkMode ? "rgba(220, 38, 38, 0.25)" : "#fee2e2",
                              transition: "all 0.2s ease",
                              "&:hover": {
                                bgcolor: "#dc2626",
                                color: "#ffffff",
                                transform: "scale(1.08)",
                                boxShadow: "0 2px 8px rgba(220, 38, 38, 0.3)",
                              },
                            }}
                          >
                            <DeleteIcon sx={{ fontSize: 15 }} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    )}
                  </Box>

                  {/* Candidate Identity: Circular Glowing Avatar + Clean Name & Role */}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      mb: 2.2,
                    }}
                  >
                    <Avatar
                      src={story.image}
                      alt={story.name}
                      sx={{
                        width: 62,
                        height: 62,
                        flexShrink: 0,
                        borderRadius: "50%",
                        border: "2.5px solid",
                        borderColor: isDarkMode ? "#1e293b" : "#ffffff",
                        boxShadow: isDarkMode
                          ? "0 0 0 2.5px #ca0019, 0 6px 16px rgba(0, 0, 0, 0.5)"
                          : "0 0 0 2.5px #ca0019, 0 6px 16px rgba(202, 0, 25, 0.18)",
                        bgcolor: isDarkMode ? "rgba(255,255,255,0.05)" : "#f8fafc",
                        overflow: "hidden",
                        "& img": {
                          objectFit: "cover",
                          objectPosition: "center center",
                          transform: "scale(1.15)",
                        },
                      }}
                    >
                      {story.name ? story.name.charAt(0) : "U"}
                    </Avatar>

                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        variant="subtitle1"
                        title={story.name}
                        sx={{
                          fontWeight: 800,
                          fontSize: "1.12rem",
                          lineHeight: 1.25,
                          color: "text.primary",
                          letterSpacing: "-0.3px",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {story.name}
                      </Typography>

                      <Typography
                        variant="body2"
                        title={`${story.role || "Developer"} at ${story.company || "Company"}`}
                        sx={{
                          color: "text.secondary",
                          fontSize: "0.85rem",
                          mt: 0.4,
                          lineHeight: 1.35,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        <span style={{ color: isDarkMode ? "#f1f5f9" : "#1e293b", fontWeight: 600 }}>
                          {story.role || "Developer"}
                        </span>
                        {" at "}
                        <span style={{ color: "#ca0019", fontWeight: 600 }}>
                          {story.company || "Company"}
                        </span>
                      </Typography>
                    </Box>
                  </Box>

                  {/* Clean Testimonial Summary Quote Box with Left Crimson Accent */}
                  <Box
                    sx={{
                      p: 1.6,
                      borderRadius: "12px",
                      bgcolor: isDarkMode ? "rgba(255, 255, 255, 0.025)" : "#f8fafc",
                      border: "1px solid",
                      borderColor: isDarkMode ? "rgba(255, 255, 255, 0.06)" : "#f1f5f9",
                      borderLeft: "3.5px solid #ca0019",
                      mb: 2,
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        color: isDarkMode ? "#cbd5e1" : "#475569",
                        fontSize: "0.84rem",
                        fontStyle: "italic",
                        lineHeight: 1.6,
                        minHeight: 54,
                        display: "-webkit-box",
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      “{story.summary}”
                    </Typography>
                  </Box>

                  {/* Skill Chips */}
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, mb: 2.25, minHeight: 26 }}>
                    {getSkillsList(story)
                      .slice(0, 3)
                      .map((skill, idx) => (
                        <Chip
                          key={idx}
                          label={skill}
                          size="small"
                          sx={{
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            height: 25,
                            borderRadius: "8px",
                            bgcolor: isDarkMode ? "rgba(255, 255, 255, 0.05)" : "#f1f5f9",
                            color: isDarkMode ? "#e2e8f0" : "#334155",
                            border: "1px solid",
                            borderColor: isDarkMode ? "rgba(255, 255, 255, 0.09)" : "#e2e8f0",
                            transition: "all 0.15s ease",
                            "&:hover": {
                              borderColor: isDarkMode ? "rgba(255, 255, 255, 0.2)" : "#cbd5e1",
                            },
                          }}
                        />
                      ))}
                    {getSkillsList(story).length > 3 && (
                      <Chip
                        label={`+${getSkillsList(story).length - 3}`}
                        size="small"
                        sx={{
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          height: 25,
                          borderRadius: "8px",
                          bgcolor: isDarkMode ? "rgba(202, 0, 25, 0.15)" : "#fef2f2",
                          color: "#ca0019",
                          border: "1px solid",
                          borderColor: isDarkMode ? "rgba(202, 0, 25, 0.3)" : "#fecaca",
                        }}
                      />
                    )}
                  </Box>
                </Box>

                {/* View Details Button: High-Impact Brand Crimson Interactive CTA */}
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<VisibilityIcon sx={{ fontSize: 18, transition: "transform 0.2s ease" }} />}
                  endIcon={<ArrowForwardIcon sx={{ fontSize: 16, transition: "transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)" }} />}
                  onClick={() => handleOpenModal(story)}
                  sx={{
                    background: "linear-gradient(135deg, #ca0019 0%, #b91c1c 100%)",
                    color: "#ffffff",
                    fontWeight: 700,
                    fontSize: "0.875rem",
                    letterSpacing: "0.2px",
                    textTransform: "none",
                    borderRadius: "12px",
                    py: 1.05,
                    boxShadow: "0 4px 14px rgba(202, 0, 25, 0.28)",
                    transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                    "&:hover": {
                      background: "linear-gradient(135deg, #dc2626 0%, #ca0019 100%)",
                      boxShadow: "0 8px 22px rgba(202, 0, 25, 0.45)",
                      transform: "translateY(-1px)",
                      "& .MuiButton-endIcon": {
                        transform: "translateX(4px)",
                      },
                      "& .MuiButton-startIcon": {
                        transform: "scale(1.1)",
                      },
                    },
                  }}
                >
                  View Details
                </Button>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* 6. IN-DEPTH STORY DETAILS MODAL (Matching https://www.theuniques.in/success-stories/ Design) */}
      {/* 6. IN-DEPTH STORY DETAILS MODAL (Matching https://www.theuniques.in/success-stories/ Exact Layout) */}
      {selectedStory && (() => {
        const languagesList = Array.isArray(selectedStory.skills?.languages)
          ? selectedStory.skills.languages
          : [];
        const technologiesList = Array.isArray(selectedStory.skills?.technologies)
          ? selectedStory.skills.technologies
          : Array.isArray(selectedStory.skills)
          ? selectedStory.skills
          : typeof selectedStory.skills === "string"
          ? selectedStory.skills.split(",").map((s) => s.trim()).filter(Boolean)
          : [];
        const toolsList = Array.isArray(selectedStory.skills?.tools)
          ? selectedStory.skills.tools
          : [];

        const firstName = (selectedStory.name || "").split(" ")[0] || "Alumni";

        return (
          <Dialog
            open={Boolean(selectedStory)}
            onClose={handleCloseModal}
            fullWidth
            maxWidth="lg"
            PaperProps={{
              sx: {
                borderRadius: "20px",
                bgcolor: "background.paper",
                backgroundImage: "none",
                overflow: "hidden",
                maxHeight: "92vh",
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              },
            }}
          >
            {/* 1. Official Executive Hero Banner with In-Flow Glowing Avatar */}
            <Box
              sx={{
                position: "relative",
                p: { xs: 3, sm: 4, md: 4.5 },
                background:
                  "linear-gradient(108deg, #0b1120 0%, #151935 20%, #2e1065 48%, #581c87 72%, #7e22ce 88%, #9333ea 100%)",
                color: "white",
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                alignItems: { xs: "center", sm: "center" },
                gap: { xs: 2.5, sm: 3.5, md: 4 },
              }}
            >
              {/* Header Action Buttons (Top-Right) */}
              <Box
                sx={{
                  position: "absolute",
                  top: 16,
                  right: 16,
                  display: "flex",
                  gap: 1.25,
                  alignItems: "center",
                  zIndex: 10,
                }}
              >
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<OpenInNewIcon sx={{ fontSize: 16 }} />}
                  onClick={() =>
                    window.open(
                      selectedStory.officialUrl || "https://www.theuniques.in/success-stories",
                      "_blank"
                    )
                  }
                  sx={{
                    color: "#ffffff",
                    borderColor: "rgba(255, 255, 255, 0.25)",
                    bgcolor: "rgba(0, 0, 0, 0.35)",
                    backdropFilter: "blur(6px)",
                    borderRadius: "8px",
                    textTransform: "none",
                    fontSize: "0.82rem",
                    fontWeight: 600,
                    px: 1.8,
                    py: 0.6,
                    display: { xs: "none", sm: "inline-flex" },
                    "&:hover": {
                      borderColor: "rgba(255, 255, 255, 0.5)",
                      bgcolor: "rgba(255, 255, 255, 0.15)",
                    },
                  }}
                >
                  Live Profile
                </Button>

                <IconButton
                  onClick={handleCloseModal}
                  size="small"
                  sx={{
                    color: "#ffffff",
                    bgcolor: "rgba(0, 0, 0, 0.4)",
                    backdropFilter: "blur(6px)",
                    borderRadius: "8px",
                    width: 34,
                    height: 34,
                    "&:hover": { bgcolor: "rgba(255, 255, 255, 0.2)" },
                  }}
                >
                  <CloseIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Box>

              {/* Circular Avatar with Glowing Crimson Border */}
              <Box
                sx={{
                  flexShrink: 0,
                  zIndex: 2,
                  width: { xs: 110, sm: 125, md: 135 },
                  height: { xs: 110, sm: 125, md: 135 },
                  borderRadius: "50%",
                  border: "3.5px solid #ca0019",
                  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.5), 0 0 0 2px rgba(202, 0, 25, 0.35)",
                  bgcolor: "#111111",
                  overflow: "hidden",
                  transition: "transform 0.3s ease, box-shadow 0.3s ease",
                  "&:hover": {
                    transform: "scale(1.03)",
                    boxShadow: "0 10px 28px rgba(0, 0, 0, 0.5), 0 0 0 3px rgba(202, 0, 25, 0.5)",
                  },
                }}
              >
                <Box
                  component="img"
                  src={selectedStory.image}
                  alt={selectedStory.name}
                  sx={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    objectPosition: "center center",
                  }}
                />
              </Box>

              {/* Candidate Info */}
              <Box
                sx={{
                  flex: 1,
                  minWidth: 0,
                  textAlign: { xs: "center", sm: "left" },
                  zIndex: 2,
                }}
              >
                {selectedStory.name && (
                  <Typography
                    variant="h3"
                    component="h1"
                    sx={{
                      fontWeight: 800,
                      color: "#ffffff",
                      fontSize: { xs: "1.6rem", sm: "2rem", md: "2.3rem" },
                      letterSpacing: "-0.4px",
                      lineHeight: 1.2,
                      mb: 0.6,
                    }}
                  >
                    {selectedStory.name}
                  </Typography>
                )}

                <Typography
                  variant="h6"
                  sx={{
                    color: "rgba(255, 255, 255, 0.88)",
                    fontSize: { xs: "0.95rem", sm: "1.08rem" },
                    fontWeight: 500,
                    lineHeight: 1.35,
                    mb: 1.5,
                  }}
                >
                  {selectedStory.role} at{" "}
                  <strong style={{ color: "#ffffff", fontWeight: 700 }}>
                    {selectedStory.company}
                  </strong>
                </Typography>

                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.25,
                    flexWrap: "wrap",
                    justifyContent: { xs: "center", sm: "flex-start" },
                  }}
                >
                  <Chip
                    label={formatBatchLabel(selectedStory.batch)}
                    size="small"
                    sx={{
                      bgcolor: "#ca0019",
                      color: "#ffffff",
                      fontWeight: 700,
                      fontSize: "0.75rem",
                      borderRadius: "9999px",
                      px: 1.4,
                      height: 25,
                    }}
                  />

                  <Box
                    sx={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 0.6,
                      px: 1.4,
                      py: 0.35,
                      borderRadius: "9999px",
                      bgcolor: "#064e3b",
                      border: "1px solid rgba(16, 185, 129, 0.35)",
                    }}
                  >
                    <CheckCircleOutlineIcon
                      sx={{
                        fontSize: 14,
                        color: "#10b981",
                      }}
                    />
                    <Typography
                      sx={{
                        fontSize: "0.74rem",
                        fontWeight: 700,
                        color: "#34d399",
                        letterSpacing: "0.2px",
                      }}
                    >
                      Verified Alumni
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>

            {/* 2. Navigation Tabs (Clean, unobstructed, zero overlap) */}
            <Box
              sx={{
                borderBottom: "1px solid",
                borderColor: "divider",
                px: { xs: 2, sm: 4, md: 5 },
                bgcolor: isDarkMode ? "background.paper" : "#ffffff",
                display: "flex",
                alignItems: "center",
                minHeight: 52,
              }}
            >
              <Tabs
                value={modalTab}
                onChange={(e, val) => setModalTab(val)}
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                  minHeight: 52,
                  "& .MuiTabs-indicator": {
                    bgcolor: "#ca0019",
                    height: 3,
                  },
                  "& .MuiTab-root": {
                    textTransform: "none",
                    fontWeight: 600,
                    fontSize: { xs: "0.88rem", sm: "0.95rem" },
                    minHeight: 52,
                    mr: { xs: 1.5, sm: 3 },
                    color: isDarkMode ? "#94a3b8" : "#4b5563",
                    gap: 1,
                    transition: "all 0.2s ease",
                    "&:hover": {
                      color: "#ca0019",
                    },
                    "&.Mui-selected": {
                      color: "#ca0019 !important",
                      fontWeight: 700,
                    },
                  },
                }}
              >
                <Tab
                  icon={<SchoolIcon sx={{ fontSize: 20 }} />}
                  iconPosition="start"
                  label="Profile Information"
                />
                <Tab
                  icon={<TimelineIcon sx={{ fontSize: 20 }} />}
                  iconPosition="start"
                  label="Success Timeline"
                />
              </Tabs>
            </Box>

            {/* 3. Main Modal Content */}
            <DialogContent sx={{ p: { xs: 2.5, sm: 4, md: 5 }, bgcolor: isDarkMode ? "#09090b" : "#f1f5f9", overflowY: "auto" }}>
              {/* TAB 0: Profile Information */}
              {modalTab === 0 && (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 3.5 }}>
                  {/* Journey Overview Section (Matching Reference Image) */}
                  <Paper
                    elevation={0}
                    sx={{
                      p: { xs: 2.5, sm: 3.5, md: 4 },
                      borderRadius: "16px",
                      border: "1px solid",
                      borderColor: isDarkMode ? "rgba(255,255,255,0.08)" : "#e2e8f0",
                      bgcolor: isDarkMode ? "#18181b" : "#ffffff",
                      boxShadow: isDarkMode ? "none" : "0 1px 3px rgba(0, 0, 0, 0.04)",
                    }}
                  >
                    <Box sx={{ mb: 1.5 }}>
                      <Typography
                        variant="h5"
                        sx={{
                          fontWeight: 800,
                          fontSize: { xs: "1.25rem", sm: "1.4rem" },
                          color: isDarkMode ? "#ffffff" : "#0f172a",
                          position: "relative",
                          display: "inline-block",
                          "&:after": {
                            content: '""',
                            position: "absolute",
                            bottom: "-8px",
                            left: 0,
                            width: "44px",
                            height: "3.5px",
                            backgroundColor: "#ca0019",
                            borderRadius: "2px",
                          },
                        }}
                      >
                        Journey Overview
                      </Typography>
                    </Box>

                    <Typography
                      variant="body1"
                      sx={{
                        color: isDarkMode ? "#94a3b8" : "#475569",
                        lineHeight: 1.7,
                        fontSize: "0.93rem",
                        mb: 3.5,
                        mt: 2,
                      }}
                    >
                      {selectedStory.summary}
                    </Typography>

                    {/* 3 Overview Quick Cards with Distinct Colored Bottom Borders */}
                    <Grid container spacing={2.5}>
                      {/* Card 1: Current Role (Rose Red Accent) */}
                      <Grid item xs={12} sm={4}>
                        <Card
                          elevation={0}
                          sx={{
                            p: 2.5,
                            height: "100%",
                            borderRadius: "14px",
                            border: "1px solid",
                            borderColor: isDarkMode ? "rgba(255,255,255,0.08)" : "#e2e8f0",
                            borderBottom: "3.5px solid #f43f5e",
                            bgcolor: isDarkMode ? "#18181b" : "#ffffff",
                            boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
                            transition: "all 0.2s ease",
                            "&:hover": {
                              transform: "translateY(-2px)",
                              boxShadow: isDarkMode ? "0 8px 20px rgba(0,0,0,0.4)" : "0 8px 20px rgba(0,0,0,0.05)",
                            },
                          }}
                        >
                          <Box sx={{ display: "flex", alignItems: "center", mb: 1.75 }}>
                            <Box
                              sx={{
                                width: 40,
                                height: 40,
                                borderRadius: "10px",
                                bgcolor: "#fef2f2",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                mr: 1.75,
                                flexShrink: 0,
                              }}
                            >
                              <WorkIcon sx={{ color: "#ca0019", fontSize: 20 }} />
                            </Box>
                            <Typography
                              sx={{
                                fontWeight: 800,
                                fontSize: "1.02rem",
                                color: isDarkMode ? "#ffffff" : "#0f172a",
                              }}
                            >
                              Current Role
                            </Typography>
                          </Box>
                          <Typography
                            variant="body2"
                            sx={{
                              color: isDarkMode ? "#94a3b8" : "#475569",
                              fontWeight: 500,
                              fontSize: "0.88rem",
                              lineHeight: 1.5,
                            }}
                          >
                            {selectedStory.role} at {selectedStory.company}
                          </Typography>
                        </Card>
                      </Grid>

                      {/* Card 2: Education (Emerald Green Accent) */}
                      <Grid item xs={12} sm={4}>
                        <Card
                          elevation={0}
                          sx={{
                            p: 2.5,
                            height: "100%",
                            borderRadius: "14px",
                            border: "1px solid",
                            borderColor: isDarkMode ? "rgba(255,255,255,0.08)" : "#e2e8f0",
                            borderBottom: "3.5px solid #10b981",
                            bgcolor: isDarkMode ? "#18181b" : "#ffffff",
                            boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
                            transition: "all 0.2s ease",
                            "&:hover": {
                              transform: "translateY(-2px)",
                              boxShadow: isDarkMode ? "0 8px 20px rgba(0,0,0,0.4)" : "0 8px 20px rgba(0,0,0,0.05)",
                            },
                          }}
                        >
                          <Box sx={{ display: "flex", alignItems: "center", mb: 1.75 }}>
                            <Box
                              sx={{
                                width: 40,
                                height: 40,
                                borderRadius: "10px",
                                bgcolor: "#fef2f2",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                mr: 1.75,
                                flexShrink: 0,
                              }}
                            >
                              <SchoolIcon sx={{ color: "#ca0019", fontSize: 20 }} />
                            </Box>
                            <Typography
                              sx={{
                                fontWeight: 800,
                                fontSize: "1.02rem",
                                color: isDarkMode ? "#ffffff" : "#0f172a",
                              }}
                            >
                              Education
                            </Typography>
                          </Box>
                          <Typography
                            variant="body2"
                            sx={{
                              color: isDarkMode ? "#94a3b8" : "#475569",
                              fontWeight: 500,
                              fontSize: "0.88rem",
                              lineHeight: 1.5,
                            }}
                          >
                            {selectedStory.education?.degree || "Bachelor of Technology in Computer Science Engineering"}
                          </Typography>
                        </Card>
                      </Grid>

                      {/* Card 3: Key Achievement (Sky Blue Accent) */}
                      <Grid item xs={12} sm={4}>
                        <Card
                          elevation={0}
                          sx={{
                            p: 2.5,
                            height: "100%",
                            borderRadius: "14px",
                            border: "1px solid",
                            borderColor: isDarkMode ? "rgba(255,255,255,0.08)" : "#e2e8f0",
                            borderBottom: "3.5px solid #0ea5e9",
                            bgcolor: isDarkMode ? "#18181b" : "#ffffff",
                            boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
                            transition: "all 0.2s ease",
                            "&:hover": {
                              transform: "translateY(-2px)",
                              boxShadow: isDarkMode ? "0 8px 20px rgba(0,0,0,0.4)" : "0 8px 20px rgba(0,0,0,0.05)",
                            },
                          }}
                        >
                          <Box sx={{ display: "flex", alignItems: "center", mb: 1.75 }}>
                            <Box
                              sx={{
                                width: 40,
                                height: 40,
                                borderRadius: "10px",
                                bgcolor: "#fef2f2",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                mr: 1.75,
                                flexShrink: 0,
                              }}
                            >
                              <EmojiEventsIcon sx={{ color: "#ca0019", fontSize: 20 }} />
                            </Box>
                            <Typography
                              sx={{
                                fontWeight: 800,
                                fontSize: "1.02rem",
                                color: isDarkMode ? "#ffffff" : "#0f172a",
                              }}
                            >
                              Key Achievement
                            </Typography>
                          </Box>
                          <Typography
                            variant="body2"
                            sx={{
                              color: isDarkMode ? "#94a3b8" : "#475569",
                              fontWeight: 500,
                              fontSize: "0.88rem",
                              lineHeight: 1.5,
                            }}
                          >
                            {selectedStory.education?.details || "Coursework: Data Structures, Algorithms, AI, Database Management"}
                          </Typography>
                        </Card>
                      </Grid>
                    </Grid>
                  </Paper>

                  {/* Interactive Sub-Tabs Section (Education / Experience / Notable Projects) */}
                  <Paper
                    elevation={0}
                    sx={{
                      p: { xs: 2.5, sm: 3.5 },
                      borderRadius: "16px",
                      border: "1px solid",
                      borderColor: "divider",
                      bgcolor: isDarkMode ? "rgba(255,255,255,0.02)" : "#ffffff",
                    }}
                  >
                    <Tabs
                      value={profileSubTab}
                      onChange={(e, val) => setProfileSubTab(val)}
                      variant="scrollable"
                      scrollButtons="auto"
                      sx={{
                        borderBottom: 1,
                        borderColor: "divider",
                        mb: 3,
                        minHeight: 44,
                        "& .MuiTab-root": {
                          textTransform: "none",
                          fontWeight: 700,
                          fontSize: "0.92rem",
                          minHeight: 44,
                          px: 2,
                        },
                        "& .Mui-selected": {
                          color: "#ca0019 !important",
                        },
                        "& .MuiTabs-indicator": {
                          bgcolor: "#ca0019",
                          height: 3,
                        },
                      }}
                    >
                      <Tab
                        icon={<SchoolIcon sx={{ fontSize: 18 }} />}
                        iconPosition="start"
                        label="Education"
                      />
                      <Tab
                        icon={<WorkIcon sx={{ fontSize: 18 }} />}
                        iconPosition="start"
                        label="Professional Experience"
                      />
                      <Tab
                        icon={<CodeIcon sx={{ fontSize: 18 }} />}
                        iconPosition="start"
                        label="Notable Projects"
                      />
                    </Tabs>

                    {/* SubTab 0: Education */}
                    {profileSubTab === 0 && (
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 800, color: "text.primary" }}>
                          {selectedStory.education?.institution || "Swami Vivekananda Institute of Technology"}
                        </Typography>
                        <Typography variant="subtitle2" sx={{ color: "text.secondary", mt: 0.3, fontWeight: 600 }}>
                          {selectedStory.education?.degree || "Bachelor of Technology in Computer Science Engineering"}
                        </Typography>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            mt: 1.5,
                            flexWrap: "wrap",
                            gap: 1,
                          }}
                        >
                          <Typography variant="body2" sx={{ fontWeight: 600, color: "text.secondary" }}>
                            {selectedStory.education?.duration || "2021-2025"}
                          </Typography>
                          {selectedStory.education?.location && (
                            <Typography variant="body2" sx={{ fontWeight: 600, color: "text.secondary" }}>
                              {selectedStory.education.location}
                            </Typography>
                          )}
                        </Box>
                        {selectedStory.education?.details && (
                          <Typography variant="body2" sx={{ color: "text.primary", mt: 1.2, fontWeight: 700 }}>
                            {selectedStory.education.details}
                          </Typography>
                        )}
                      </Box>
                    )}

                    {/* SubTab 1: Professional Experience */}
                    {profileSubTab === 1 && (
                      <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                        {(selectedStory.experience && selectedStory.experience.length > 0
                          ? selectedStory.experience
                          : [
                              {
                                company: selectedStory.company,
                                role: selectedStory.role,
                                duration: "Present",
                                location: "Full-Time",
                                responsibilities: [
                                  `Delivering high impact engineering solutions as ${selectedStory.role}.`,
                                  "Mentoring junior cohort members and conducting peer code reviews.",
                                ],
                              },
                            ]
                        ).map((exp, idx) => (
                          <Box key={idx}>
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "flex-start",
                                flexWrap: "wrap",
                                gap: 1,
                                mb: 0.5,
                              }}
                            >
                              <Box>
                                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "text.primary" }}>
                                  {exp.role}
                                </Typography>
                                <Typography variant="body2" sx={{ color: "#ca0019", fontWeight: 700 }}>
                                  {exp.company}
                                </Typography>
                              </Box>
                              <Box sx={{ textAlign: { xs: "left", sm: "right" } }}>
                                <Chip
                                  label={exp.duration}
                                  size="small"
                                  sx={{ height: 22, fontSize: "0.72rem", fontWeight: 600 }}
                                />
                                {exp.location && (
                                  <Typography
                                    variant="caption"
                                    sx={{ display: "block", color: "text.secondary", mt: 0.3 }}
                                  >
                                    {exp.location}
                                  </Typography>
                                )}
                              </Box>
                            </Box>

                            {exp.responsibilities && (
                              <Box sx={{ pl: 0.5, mt: 1.5 }}>
                                {exp.responsibilities.map((resp, rIdx) => (
                                  <Box key={rIdx} sx={{ display: "flex", alignItems: "flex-start", gap: 1, mb: 0.8 }}>
                                    <CheckCircleOutlineIcon
                                      sx={{ color: "#ca0019", fontSize: 16, mt: 0.3, flexShrink: 0 }}
                                    />
                                    <Typography
                                      variant="body2"
                                      sx={{ color: "text.secondary", lineHeight: 1.6, fontSize: "0.88rem" }}
                                    >
                                      {resp}
                                    </Typography>
                                  </Box>
                                ))}
                              </Box>
                            )}
                            {idx < (selectedStory.experience?.length || 1) - 1 && (
                              <Divider sx={{ my: 2 }} />
                            )}
                          </Box>
                        ))}
                      </Box>
                    )}

                    {/* SubTab 2: Notable Projects */}
                    {profileSubTab === 2 && (
                      <Grid container spacing={2}>
                        {(selectedStory.projects && selectedStory.projects.length > 0
                          ? selectedStory.projects
                          : [
                              {
                                name: "Uniques Innovation Platform",
                                date: "2024",
                                description: "Production ecosystem supporting community learners and cohorts.",
                                technologies: "React, Node.js, MongoDB",
                              },
                            ]
                        ).map((proj, idx) => (
                          <Grid item xs={12} md={6} key={idx}>
                            <Paper
                              elevation={0}
                              sx={{
                                p: 2.5,
                                height: "100%",
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "space-between",
                                borderRadius: "12px",
                                border: "1px solid",
                                borderColor: "divider",
                                bgcolor: isDarkMode ? "rgba(255,255,255,0.02)" : "#fafafa",
                              }}
                            >
                              <Box>
                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "text.primary" }}>
                                    {proj.name}
                                  </Typography>
                                  {proj.date && (
                                    <Chip
                                      label={proj.date}
                                      size="small"
                                      sx={{ height: 20, fontSize: "0.68rem" }}
                                    />
                                  )}
                                </Box>

                                <Typography variant="body2" sx={{ color: "text.secondary", mb: 1.5, fontSize: "0.85rem", lineHeight: 1.6 }}>
                                  {proj.description}
                                </Typography>

                                {proj.technologies && (
                                  <Box sx={{ display: "flex", gap: 0.6, flexWrap: "wrap", mb: 1.5 }}>
                                    {(typeof proj.technologies === "string"
                                      ? proj.technologies.split(",")
                                      : proj.technologies
                                    ).map((tech, tIdx) => (
                                      <Chip
                                        key={tIdx}
                                        label={tech.trim()}
                                        size="small"
                                        sx={{
                                          height: 20,
                                          fontSize: "0.68rem",
                                          borderRadius: "4px",
                                          bgcolor: isDarkMode ? "rgba(255,255,255,0.06)" : "#f1f5f9",
                                        }}
                                      />
                                    ))}
                                  </Box>
                                )}

                                {proj.achievements && (
                                  <Box sx={{ mt: 1 }}>
                                    {proj.achievements.map((ach, aIdx) => (
                                      <Box key={aIdx} sx={{ display: "flex", alignItems: "flex-start", gap: 0.8, mb: 0.5 }}>
                                        <Box sx={{ width: 4, height: 4, borderRadius: "50%", bgcolor: "#ca0019", mt: 1, flexShrink: 0 }} />
                                        <Typography variant="caption" sx={{ color: "text.secondary", lineHeight: 1.5 }}>
                                          {ach}
                                        </Typography>
                                      </Box>
                                    ))}
                                  </Box>
                                )}
                              </Box>
                            </Paper>
                          </Grid>
                        ))}
                      </Grid>
                    )}
                  </Paper>

                  {/* Technical Skills Matrix */}
                  <Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography
                        variant="h6"
                        sx={{ fontWeight: 800, fontSize: "1.15rem", display: "flex", alignItems: "center", gap: 0.8 }}
                      >
                        <Box component="span" sx={{ color: "#ca0019", fontWeight: 900 }}>
                          {"< >"}
                        </Box>
                        Technical Skills
                      </Typography>
                      <Box sx={{ width: 32, height: 3, bgcolor: "#ca0019", borderRadius: 2, mt: 0.5 }} />
                    </Box>

                    <Grid container spacing={2.5}>
                      {/* Languages: Black Pills */}
                      <Grid item xs={12} md={4}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "text.primary", mb: 1.5 }}>
                          Languages
                        </Typography>
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.8 }}>
                          {(languagesList.length > 0 ? languagesList : ["Python", "JavaScript", "C", "C++", "PHP", "SQL"]).map(
                            (lang, lIdx) => (
                              <Chip
                                key={lIdx}
                                label={lang}
                                size="small"
                                sx={{
                                  fontWeight: 700,
                                  fontSize: "0.75rem",
                                  borderRadius: "9999px",
                                  bgcolor: "#000000",
                                  color: "#ffffff",
                                  px: 0.5,
                                  height: 26,
                                }}
                              />
                            )
                          )}
                        </Box>
                      </Grid>

                      {/* Technologies & Frameworks: White pills with Red Border & Red Text */}
                      <Grid item xs={12} md={5}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "text.primary", mb: 1.5 }}>
                          Technologies & Frameworks
                        </Typography>
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.8 }}>
                          {(technologiesList.length > 0
                            ? technologiesList
                            : ["React.js", "Node.js", "Next.js", "Angular", "Express", "Redux", "Bootstrap", "Tailwind", "HTML", "CSS"]
                          ).map((tech, tIdx) => (
                            <Chip
                              key={tIdx}
                              label={tech}
                              size="small"
                              sx={{
                                fontWeight: 700,
                                fontSize: "0.75rem",
                                borderRadius: "9999px",
                                bgcolor: isDarkMode ? "rgba(202, 0, 25, 0.08)" : "#ffffff",
                                color: "#ca0019",
                                border: "1px solid #ca0019",
                                px: 0.5,
                                height: 26,
                              }}
                            />
                          ))}
                        </Box>
                      </Grid>

                      {/* Developer Tools: Solid Red Pills */}
                      <Grid item xs={12} md={3}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "text.primary", mb: 1.5 }}>
                          Developer Tools
                        </Typography>
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.8 }}>
                          {(toolsList.length > 0 ? toolsList : ["MongoDB", "ThreeJs", "WordPress", "Git", "VS Code", "MySQL"]).map(
                            (tool, tlIdx) => (
                              <Chip
                                key={tlIdx}
                                label={tool}
                                size="small"
                                sx={{
                                  fontWeight: 700,
                                  fontSize: "0.75rem",
                                  borderRadius: "9999px",
                                  bgcolor: "#ca0019",
                                  color: "#ffffff",
                                  px: 0.5,
                                  height: 26,
                                }}
                              />
                            )
                          )}
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>

                  {/* Leadership & Extracurricular Activities */}
                  {selectedStory.leadership && (
                    <Box>
                      <Box sx={{ mb: 2 }}>
                        <Typography
                          variant="h6"
                          sx={{ fontWeight: 800, fontSize: "1.15rem", display: "flex", alignItems: "center", gap: 0.8 }}
                        >
                          <EmojiEventsIcon sx={{ color: "#ca0019", fontSize: 22 }} />
                          Leadership & Extracurricular
                        </Typography>
                        <Box sx={{ width: 32, height: 3, bgcolor: "#ca0019", borderRadius: 2, mt: 0.5 }} />
                      </Box>

                      <Paper
                        elevation={0}
                        sx={{
                          p: 3,
                          borderRadius: "14px",
                          border: "1px solid",
                          borderColor: "divider",
                          bgcolor: isDarkMode ? "rgba(255,255,255,0.02)" : "#ffffff",
                        }}
                      >
                        <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "text.primary" }}>
                          {selectedStory.leadership.organization}
                        </Typography>
                        <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.3, fontWeight: 600 }}>
                          {selectedStory.leadership.role}
                        </Typography>
                        {selectedStory.leadership.duration && (
                          <Typography
                            variant="caption"
                            sx={{ color: "text.secondary", display: "block", mt: 0.5, mb: 2, fontWeight: 500 }}
                          >
                            {selectedStory.leadership.duration}
                          </Typography>
                        )}

                        {selectedStory.leadership.achievements && (
                          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.2 }}>
                            {selectedStory.leadership.achievements.map((ach, aIdx) => (
                              <Box key={aIdx} sx={{ display: "flex", alignItems: "flex-start", gap: 1.2 }}>
                                <EmojiEventsIcon sx={{ color: "#ca0019", fontSize: 18, mt: 0.2, flexShrink: 0 }} />
                                <Typography
                                  variant="body2"
                                  sx={{ color: "text.primary", lineHeight: 1.6, fontSize: "0.88rem" }}
                                >
                                  {ach}
                                </Typography>
                              </Box>
                            ))}
                          </Box>
                        )}
                      </Paper>
                    </Box>
                  )}
                </Box>
              )}

              {/* TAB 1: Success Timeline */}
              {modalTab === 1 && (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 3.5 }}>
                  <Box>
                    <Typography
                      variant="caption"
                      sx={{ color: "#ca0019", fontWeight: 800, letterSpacing: 1, textTransform: "uppercase" }}
                    >
                      JOURNEY & ACHIEVEMENTS
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 800, mt: 0.5 }}>
                      Success Timeline
                    </Typography>
                    <Box sx={{ width: 32, height: 3, bgcolor: "#ca0019", borderRadius: 2, mt: 0.5, mb: 1.5 }} />
                    <Typography variant="body2" color="text.secondary">
                      Follow {selectedStory.name}'s journey through key milestones, from early learning to
                      professional growth, and the achievements that shaped each step.
                    </Typography>
                  </Box>

                  {/* Horizontal Timeline Track */}
                  <Box
                    sx={{
                      position: "relative",
                      py: 3,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      px: { xs: 2, sm: 6 },
                    }}
                  >
                    {/* Connecting Line */}
                    <Box
                      sx={{
                        position: "absolute",
                        left: { xs: "8%", sm: "10%" },
                        right: { xs: "8%", sm: "10%" },
                        top: "50%",
                        height: 2,
                        bgcolor: "#ca0019",
                        zIndex: 0,
                      }}
                    />

                    {(selectedStory.timeline || []).map((entry, idx) => (
                      <Box
                        key={idx}
                        sx={{
                          position: "relative",
                          zIndex: 1,
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                        }}
                      >
                        <Chip
                          label={entry.year}
                          size="small"
                          sx={{
                            mb: 1,
                            fontWeight: 800,
                            fontSize: "0.75rem",
                            borderRadius: "9999px",
                            bgcolor: isDarkMode ? "#1f2937" : "#ffffff",
                            border: "1px solid",
                            borderColor: "divider",
                            color: "text.primary",
                          }}
                        />
                        <Box
                          sx={{
                            width: 18,
                            height: 18,
                            borderRadius: "50%",
                            bgcolor: "#ffffff",
                            border: "4px solid #ca0019",
                            boxShadow: "0 0 10px rgba(202, 0, 25, 0.4)",
                          }}
                        />
                      </Box>
                    ))}
                  </Box>

                  {/* Milestone Detail Cards Grid */}
                  <Grid container spacing={2}>
                    {(selectedStory.timeline || []).map((entry, idx) => (
                      <Grid item xs={12} sm={6} md={3} key={idx}>
                        <Paper
                          elevation={0}
                          sx={{
                            p: 2.5,
                            height: "100%",
                            borderRadius: "14px",
                            border: "1px solid",
                            borderColor: "divider",
                            borderTop: "3px solid #ca0019",
                            bgcolor: isDarkMode ? "rgba(255,255,255,0.02)" : "#ffffff",
                          }}
                        >
                          <Chip
                            label={`${entry.achievements?.length || 0} Milestones`}
                            size="small"
                            sx={{
                              height: 22,
                              fontSize: "0.7rem",
                              fontWeight: 700,
                              color: "#ca0019",
                              border: "1px solid #ca0019",
                              bgcolor: isDarkMode ? "rgba(202,0,25,0.08)" : "#ffffff",
                              mb: 1.5,
                            }}
                          />
                          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "text.primary", mb: 1.5 }}>
                            Key Achievements
                          </Typography>
                          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                            {(entry.achievements || []).map((ach, aIdx) => (
                              <Box key={aIdx} sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
                                <Box
                                  sx={{
                                    width: 18,
                                    height: 18,
                                    borderRadius: "50%",
                                    bgcolor: "rgba(202, 0, 25, 0.1)",
                                    color: "#ca0019",
                                    fontSize: "0.68rem",
                                    fontWeight: 800,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    flexShrink: 0,
                                    mt: 0.2,
                                  }}
                                >
                                  {aIdx + 1}
                                </Box>
                                <Typography
                                  variant="caption"
                                  sx={{ color: "text.secondary", lineHeight: 1.5, fontSize: "0.78rem" }}
                                >
                                  {ach}
                                </Typography>
                              </Box>
                            ))}
                          </Box>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>

                  {/* Follow in Footsteps CTA Banner */}
                  <Paper
                    elevation={0}
                    sx={{
                      p: { xs: 3, sm: 4 },
                      borderRadius: "16px",
                      bgcolor: "#18181b",
                      color: "#ffffff",
                      textAlign: "left",
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
                      Follow in {firstName}'s Footsteps
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8, maxWidth: 650, mb: 2.5, lineHeight: 1.7 }}>
                      Join The Uniques Community today and embark on your journey to professional excellence. Our
                      comprehensive programs, mentorship opportunities, and vibrant network await you.
                    </Typography>
                    <Button
                      variant="contained"
                      onClick={() =>
                        window.open(
                          selectedStory.officialUrl || "https://www.theuniques.in/success-stories",
                          "_blank"
                        )
                      }
                      sx={{
                        bgcolor: "#ca0019",
                        color: "#ffffff",
                        fontWeight: 700,
                        textTransform: "none",
                        borderRadius: "8px",
                        px: 3,
                        py: 1,
                        "&:hover": { bgcolor: "#a30014" },
                      }}
                    >
                      Join The Community
                    </Button>
                  </Paper>
                </Box>
              )}
            </DialogContent>

            <DialogActions
              sx={{
                p: 2,
                px: 3.5,
                borderTop: "1px solid",
                borderColor: isDarkMode ? "rgba(255,255,255,0.08)" : "#e2e8f0",
                justifyContent: "space-between",
                bgcolor: isDarkMode ? "#18181b" : "#ffffff",
              }}
            >
              <Button
                variant="text"
                startIcon={<OpenInNewIcon sx={{ fontSize: 18, color: "#ca0019" }} />}
                onClick={() =>
                  window.open(
                    selectedStory.officialUrl || "https://www.theuniques.in/success-stories",
                    "_blank"
                  )
                }
                sx={{
                  textTransform: "none",
                  fontWeight: 700,
                  color: "#ca0019",
                  fontSize: "0.88rem",
                  "&:hover": { bgcolor: "rgba(202, 0, 25, 0.05)" },
                }}
              >
                Open on Uniques 4.0
              </Button>

              <Button
                onClick={handleCloseModal}
                variant="contained"
                sx={{
                  borderRadius: "8px",
                  textTransform: "none",
                  fontWeight: 700,
                  bgcolor: "#ca0019",
                  color: "#ffffff",
                  px: 3.5,
                  py: 0.8,
                  boxShadow: "none",
                  "&:hover": { bgcolor: "#a30014", boxShadow: "none" },
                }}
              >
                Close
              </Button>
            </DialogActions>
          </Dialog>
        );
      })()}

      {/* 7. ENHANCED ADD / EDIT STORY FORM DIALOG */}
      {canPerformCrud && (
        <Dialog
          open={storyFormOpen}
          onClose={() => !isSaving && setStoryFormOpen(false)}
          fullWidth
          maxWidth="md"
          PaperProps={{
            sx: { borderRadius: "18px", p: 0.5, maxHeight: "90vh" },
          }}
        >
          <DialogTitle sx={{ fontWeight: 800, pb: 1, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>{editingStory ? "Edit Success Story" : "Add New Success Story"}</span>
            <IconButton size="small" onClick={() => setStoryFormOpen(false)} disabled={isSaving}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </DialogTitle>

          <Tabs
            value={formTab}
            onChange={(_, val) => setFormTab(val)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              px: 3,
              borderBottom: "1px solid",
              borderColor: "divider",
              minHeight: 44,
              "& .MuiTab-root": {
                textTransform: "none",
                fontWeight: 600,
                fontSize: "0.85rem",
                minHeight: 44,
              },
              "& .Mui-selected": { color: "#ca0019 !important" },
              "& .MuiTabs-indicator": { bgcolor: "#ca0019" },
            }}
          >
            <Tab icon={<PersonIcon sx={{ fontSize: 17 }} />} iconPosition="start" label="Basic Info" />
            <Tab icon={<SchoolIcon sx={{ fontSize: 17 }} />} iconPosition="start" label="Education & Skills" />
            <Tab icon={<TimelineIcon sx={{ fontSize: 17 }} />} iconPosition="start" label={`Timeline (${formData.timeline.length})`} />
            <Tab icon={<WorkIcon sx={{ fontSize: 17 }} />} iconPosition="start" label={`Experience & Projects (${formData.experience.length + formData.projects.length})`} />
          </Tabs>

          <DialogContent dividers sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2.5 }}>
            {/* TAB 0: BASIC INFO */}
            {formTab === 0 && (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Student Full Name *"
                      fullWidth
                      size="small"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Ronit Jaiprakash"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Batch *</InputLabel>
                      <Select
                        value={formData.batch}
                        label="Batch *"
                        onChange={(e) => setFormData({ ...formData, batch: e.target.value })}
                      >
                        {(dynamicBatchLabels.length > 0
                          ? dynamicBatchLabels
                          : ["Uniques 1.0", "Uniques 2.0", "Uniques 3.0", "Uniques 4.0", "Uniques 5.0", "Uniques 6.0", "Uniques 7.0"]
                        ).map((batchLabel) => (
                          <MenuItem key={batchLabel} value={batchLabel}>
                            {batchLabel}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Role / Designation *"
                      fullWidth
                      size="small"
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      placeholder="e.g. Software Engineer"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Company Name *"
                      fullWidth
                      size="small"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      placeholder="e.g. Google, Microsoft, Adobe"
                    />
                  </Grid>
                </Grid>

                {/* Avatar Image URL & Upload Button */}
                <Box sx={{ p: 2, borderRadius: "12px", border: "1px solid", borderColor: "divider", bgcolor: isDarkMode ? "rgba(255,255,255,0.02)" : "#f8fafc" }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, display: "flex", alignItems: "center", gap: 1 }}>
                    <PersonIcon sx={{ fontSize: 18, color: "#ca0019" }} />
                    Candidate Avatar / Photo
                  </Typography>

                  <Grid container spacing={2} alignItems="center">
                    <Grid item>
                      <Avatar
                        src={formData.image}
                        alt={formData.name || "Preview"}
                        sx={{ width: 56, height: 56, border: "2px solid #ca0019" }}
                      />
                    </Grid>
                    <Grid item xs>
                      <TextField
                        label="Image URL (CDN, Cloudinary, or Google Drive proxy)"
                        fullWidth
                        size="small"
                        value={formData.image}
                        onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                        placeholder="https://..."
                      />
                    </Grid>
                    <Grid item>
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        style={{ display: "none" }}
                        onChange={handleAvatarFileUpload}
                      />
                      <Button
                        variant="outlined"
                        size="small"
                        disabled={isUploading}
                        startIcon={isUploading ? <CircularProgress size={16} /> : <CloudUploadIcon />}
                        onClick={() => fileInputRef.current?.click()}
                        sx={{
                          borderRadius: "8px",
                          textTransform: "none",
                          fontWeight: 600,
                          borderColor: "#ca0019",
                          color: "#ca0019",
                          "&:hover": { borderColor: "#a30014", bgcolor: "rgba(202,0,25,0.04)" },
                        }}
                      >
                        {isUploading ? "Uploading..." : "Upload Photo"}
                      </Button>
                    </Grid>
                  </Grid>
                </Box>

                <TextField
                  label="Summary / Inspirational Quote"
                  fullWidth
                  size="small"
                  multiline
                  rows={3}
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  placeholder="Share a short inspiring excerpt or summary of their transformation and accomplishments in The Uniques..."
                />

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Video Journey URL (YouTube / Drive - Optional)"
                      fullWidth
                      size="small"
                      value={formData.video}
                      onChange={(e) => setFormData({ ...formData, video: e.target.value })}
                      placeholder="https://www.youtube.com/watch?v=..."
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Official Profile / LinkedIn URL (Optional)"
                      fullWidth
                      size="small"
                      value={formData.officialUrl}
                      onChange={(e) => setFormData({ ...formData, officialUrl: e.target.value })}
                      placeholder="https://linkedin.com/in/..."
                    />
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* TAB 1: EDUCATION & SKILLS */}
            {formTab === 1 && (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "text.primary" }}>
                  Academic Credentials
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Degree / Major"
                      fullWidth
                      size="small"
                      value={formData.education.degree}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          education: { ...formData.education, degree: e.target.value },
                        })
                      }
                      placeholder="e.g. B.Tech Computer Science"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Institution / University"
                      fullWidth
                      size="small"
                      value={formData.education.institution}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          education: { ...formData.education, institution: e.target.value },
                        })
                      }
                      placeholder="e.g. SVIET / Chandigarh University"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Duration / Batch Years"
                      fullWidth
                      size="small"
                      value={formData.education.duration}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          education: { ...formData.education, duration: e.target.value },
                        })
                      }
                      placeholder="e.g. 2020 - 2024"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Location / Campus"
                      fullWidth
                      size="small"
                      value={formData.education.location}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          education: { ...formData.education, location: e.target.value },
                        })
                      }
                      placeholder="e.g. Mohali, Punjab"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Academic Details / Highlights"
                      fullWidth
                      size="small"
                      value={formData.education.details}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          education: { ...formData.education, details: e.target.value },
                        })
                      }
                      placeholder="e.g. Graduated with Honors; 8.8 CGPA"
                    />
                  </Grid>
                </Grid>

                <Divider sx={{ my: 1 }} />

                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "text.primary" }}>
                  Technical Skills & Proficiencies
                </Typography>

                <TextField
                  label="Programming Languages (comma-separated)"
                  fullWidth
                  size="small"
                  value={formData.skillsLanguages}
                  onChange={(e) => setFormData({ ...formData, skillsLanguages: e.target.value })}
                  placeholder="e.g. JavaScript, TypeScript, Python, C++, Java"
                />

                <TextField
                  label="Frameworks & Technologies (comma-separated)"
                  fullWidth
                  size="small"
                  value={formData.skillsTechnologies}
                  onChange={(e) => setFormData({ ...formData, skillsTechnologies: e.target.value })}
                  placeholder="e.g. React.js, Next.js, Node.js, Express, MongoDB, Tailwind CSS"
                />

                <TextField
                  label="Developer Tools, Platforms & DevOps (comma-separated)"
                  fullWidth
                  size="small"
                  value={formData.skillsTools}
                  onChange={(e) => setFormData({ ...formData, skillsTools: e.target.value })}
                  placeholder="e.g. Git, Docker, Kubernetes, AWS, Postman, Figma"
                />
              </Box>
            )}

            {/* TAB 2: TIMELINE MILESTONES */}
            {formTab === 2 && (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      Yearly Growth Milestones
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Document key milestones from first joining The Uniques through placements.
                    </Typography>
                  </Box>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={handleAddTimelineItem}
                    sx={{
                      borderRadius: "8px",
                      textTransform: "none",
                      fontWeight: 600,
                      borderColor: "#ca0019",
                      color: "#ca0019",
                    }}
                  >
                    Add Milestone
                  </Button>
                </Box>

                {formData.timeline.length === 0 ? (
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      textAlign: "center",
                      borderRadius: "12px",
                      border: "1px dashed",
                      borderColor: "divider",
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      No milestones recorded. Click <strong>Add Milestone</strong> to add yearly accomplishments.
                    </Typography>
                  </Paper>
                ) : (
                  formData.timeline.map((item, index) => (
                    <Paper
                      key={index}
                      elevation={0}
                      sx={{
                        p: 2,
                        borderRadius: "12px",
                        border: "1px solid",
                        borderColor: "divider",
                        bgcolor: isDarkMode ? "rgba(255,255,255,0.02)" : "#f8fafc",
                        display: "flex",
                        flexDirection: "column",
                        gap: 1.5,
                      }}
                    >
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <TextField
                          label="Year"
                          type="number"
                          size="small"
                          sx={{ width: 140 }}
                          value={item.year}
                          onChange={(e) => handleUpdateTimelineItem(index, "year", e.target.value)}
                        />
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleRemoveTimelineItem(index)}
                          title="Remove milestone"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                      <TextField
                        label="Achievements & Highlights (one per line)"
                        fullWidth
                        size="small"
                        multiline
                        rows={2}
                        value={item.achievements}
                        onChange={(e) => handleUpdateTimelineItem(index, "achievements", e.target.value)}
                        placeholder="Joined The Uniques Community&#10;Built first full-stack web application&#10;Won regional hackathon"
                      />
                    </Paper>
                  ))
                )}
              </Box>
            )}

            {/* TAB 3: EXPERIENCE & PROJECTS */}
            {formTab === 3 && (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                {/* Work Experience */}
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      Work & Internship Experience
                    </Typography>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<AddIcon />}
                      onClick={handleAddExperienceItem}
                      sx={{
                        borderRadius: "8px",
                        textTransform: "none",
                        fontWeight: 600,
                        borderColor: "#ca0019",
                        color: "#ca0019",
                      }}
                    >
                      Add Experience
                    </Button>
                  </Box>

                  {formData.experience.length === 0 ? (
                    <Typography variant="caption" color="text.secondary" sx={{ fontStyle: "italic" }}>
                      No work experience added yet.
                    </Typography>
                  ) : (
                    formData.experience.map((exp, index) => (
                      <Paper
                        key={index}
                        elevation={0}
                        sx={{
                          p: 2,
                          borderRadius: "12px",
                          border: "1px solid",
                          borderColor: "divider",
                          bgcolor: isDarkMode ? "rgba(255,255,255,0.02)" : "#f8fafc",
                          display: "flex",
                          flexDirection: "column",
                          gap: 1.5,
                        }}
                      >
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary" }}>
                            Experience #{index + 1}
                          </Typography>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleRemoveExperienceItem(index)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              label="Company"
                              fullWidth
                              size="small"
                              value={exp.company}
                              onChange={(e) => handleUpdateExperienceItem(index, "company", e.target.value)}
                              placeholder="e.g. Microsoft"
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              label="Role"
                              fullWidth
                              size="small"
                              value={exp.role}
                              onChange={(e) => handleUpdateExperienceItem(index, "role", e.target.value)}
                              placeholder="e.g. SDE Intern"
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              label="Duration"
                              fullWidth
                              size="small"
                              value={exp.duration}
                              onChange={(e) => handleUpdateExperienceItem(index, "duration", e.target.value)}
                              placeholder="e.g. Jan 2024 - Present"
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              label="Location"
                              fullWidth
                              size="small"
                              value={exp.location}
                              onChange={(e) => handleUpdateExperienceItem(index, "location", e.target.value)}
                              placeholder="e.g. Hyderabad, India"
                            />
                          </Grid>
                        </Grid>
                        <TextField
                          label="Key Responsibilities (one per line)"
                          fullWidth
                          size="small"
                          multiline
                          rows={2}
                          value={exp.responsibilities}
                          onChange={(e) => handleUpdateExperienceItem(index, "responsibilities", e.target.value)}
                          placeholder="Architected backend APIs&#10;Reduced query latency by 35%"
                        />
                      </Paper>
                    ))
                  )}
                </Box>

                <Divider />

                {/* Key Projects */}
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      Featured Portfolio Projects
                    </Typography>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<AddIcon />}
                      onClick={handleAddProjectItem}
                      sx={{
                        borderRadius: "8px",
                        textTransform: "none",
                        fontWeight: 600,
                        borderColor: "#ca0019",
                        color: "#ca0019",
                      }}
                    >
                      Add Project
                    </Button>
                  </Box>

                  {formData.projects.length === 0 ? (
                    <Typography variant="caption" color="text.secondary" sx={{ fontStyle: "italic" }}>
                      No projects added yet.
                    </Typography>
                  ) : (
                    formData.projects.map((proj, index) => (
                      <Paper
                        key={index}
                        elevation={0}
                        sx={{
                          p: 2,
                          borderRadius: "12px",
                          border: "1px solid",
                          borderColor: "divider",
                          bgcolor: isDarkMode ? "rgba(255,255,255,0.02)" : "#f8fafc",
                          display: "flex",
                          flexDirection: "column",
                          gap: 1.5,
                        }}
                      >
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary" }}>
                            Project #{index + 1}
                          </Typography>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleRemoveProjectItem(index)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              label="Project Name"
                              fullWidth
                              size="small"
                              value={proj.name}
                              onChange={(e) => handleUpdateProjectItem(index, "name", e.target.value)}
                              placeholder="e.g. Uniques Portal"
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              label="Technologies"
                              fullWidth
                              size="small"
                              value={proj.technologies}
                              onChange={(e) => handleUpdateProjectItem(index, "technologies", e.target.value)}
                              placeholder="e.g. React, Node.js, MongoDB"
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              label="Date / Period"
                              fullWidth
                              size="small"
                              value={proj.date}
                              onChange={(e) => handleUpdateProjectItem(index, "date", e.target.value)}
                              placeholder="e.g. 2023"
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              label="Live / Demo URL"
                              fullWidth
                              size="small"
                              value={proj.projectUrl}
                              onChange={(e) => handleUpdateProjectItem(index, "projectUrl", e.target.value)}
                              placeholder="https://..."
                            />
                          </Grid>
                        </Grid>
                        <TextField
                          label="Project Description"
                          fullWidth
                          size="small"
                          multiline
                          rows={2}
                          value={proj.description}
                          onChange={(e) => handleUpdateProjectItem(index, "description", e.target.value)}
                          placeholder="Brief description of architecture and features..."
                        />
                      </Paper>
                    ))
                  )}
                </Box>
              </Box>
            )}
          </DialogContent>

          <DialogActions sx={{ p: 2, px: 3, justifyContent: "space-between" }}>
            <Button
              onClick={() => setStoryFormOpen(false)}
              variant="outlined"
              disabled={isSaving}
              sx={{ borderRadius: "8px", textTransform: "none", fontWeight: 600 }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveStoryForm}
              variant="contained"
              disabled={isSaving}
              startIcon={isSaving ? <CircularProgress size={16} color="inherit" /> : null}
              sx={{
                borderRadius: "8px",
                textTransform: "none",
                fontWeight: 700,
                bgcolor: "#ca0019",
                "&:hover": { bgcolor: "#a30014" },
              }}
            >
              {isSaving ? "Saving..." : editingStory ? "Save Changes" : "Create Story"}
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* 8. DELETE CONFIRMATION DIALOG */}
      {canPerformCrud && (
        <Dialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          maxWidth="xs"
          fullWidth
          PaperProps={{ sx: { borderRadius: "14px", p: 1 } }}
        >
          <DialogTitle sx={{ fontWeight: 800 }}>Delete Success Story?</DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary">
              Are you sure you want to remove the success story for{" "}
              <strong>{storyToDelete?.name}</strong>? This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button
              onClick={() => setDeleteDialogOpen(false)}
              variant="outlined"
              size="small"
              disabled={isDeleting}
              sx={{ borderRadius: "8px", textTransform: "none" }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmDelete}
              variant="contained"
              color="error"
              size="small"
              disabled={isDeleting}
              startIcon={isDeleting ? <CircularProgress size={14} color="inherit" /> : null}
              sx={{ borderRadius: "8px", textTransform: "none", fontWeight: 700 }}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
}
