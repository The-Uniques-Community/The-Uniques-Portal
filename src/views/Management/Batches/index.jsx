import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Snackbar,
  Alert,
  IconButton,
  Divider,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import ClassIcon from "@mui/icons-material/Class";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import SaveIcon from "@mui/icons-material/Save";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { useThemeContext } from "@/theme/ThemeProvider";
import {
  getStoredBatchProfiles,
  fetchBatchProfiles,
  saveStoredBatchProfiles,
  resetStoredBatchProfiles,
  deleteStoredBatchProfile,
  updateSingleBatchProfile,
  uploadBatchImage,
} from "@/utils/batch/batchProfilesData";
import { getSafeImageUrl } from "@/utils/imageHelper";
import uniques4 from "@/assets/img/About/uniques4.webp";
import { addStoredBatch, fetchBatches, deleteStoredBatch } from "@/utils/batch/batchesData";
import {
  FILE_VALIDATION_PRESETS,
  validateFile,
  resetFileInput,
} from "@/utils/fileValidation";

// Fast client-side image optimizer to prevent localStorage quota issues and speed up rendering
const optimizeImageForStorage = (file, maxWidth = 1000, quality = 0.75) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        // Try webp first for minimal payload, falling back to jpeg
        let dataUrl = canvas.toDataURL("image/webp", quality);
        if (!dataUrl.startsWith("data:image/webp")) {
          dataUrl = canvas.toDataURL("image/jpeg", quality);
        }
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error("Unable to parse image data"));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error("Failed to read image file"));
    reader.readAsDataURL(file);
  });
};

const CoordinatorBatches = () => {
  const { isDarkMode } = useThemeContext();
  const fileInputRef = useRef(null);
  const [profiles, setProfiles] = useState(() => getStoredBatchProfiles());
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Form states for the currently selected batch
  const [label, setLabel] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

  // Notification state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // New batch modal state
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newBatchName, setNewBatchName] = useState("");

  // Delete batch modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load profiles from backend with local cache fallback and live update subscription
  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      try {
        await fetchBatches();
        const loaded = await fetchBatchProfiles();
        if (isMounted && Array.isArray(loaded)) {
          setProfiles(loaded);
        }
      } catch (err) {
        console.warn("Could not load batch profiles from backend:", err);
      }
    };
    loadData();

    const handleProfilesUpdate = (e) => {
      if (Array.isArray(e.detail)) {
        setProfiles(e.detail);
      }
    };

    window.addEventListener("batch-profiles-updated", handleProfilesUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener("batch-profiles-updated", handleProfilesUpdate);
    };
  }, []);

  useEffect(() => {
    if (selectedIndex >= profiles.length && profiles.length > 0) {
      setSelectedIndex(0);
    }
  }, [profiles.length, selectedIndex]);

  useEffect(() => {
    if (profiles.length > 0 && profiles[selectedIndex]) {
      const current = profiles[selectedIndex];
      setLabel(current.label || "");
      setTitle(current.title || "");
      setDescription(current.description || "");
      setImage(current.image || "");
      setSelectedFile(null);
    } else {
      setLabel("");
      setTitle("");
      setDescription("");
      setImage("");
      setSelectedFile(null);
    }
  }, [selectedIndex, profiles]);

  const [isDragging, setIsDragging] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [imageUrlValue, setImageUrlValue] = useState("");

  // Process selected image file with instant local object URL preview
  const processSelectedFile = (file) => {
    if (!file) return;

    if (!validateFile(file, FILE_VALIDATION_PRESETS.AVATAR, { inputTarget: fileInputRef })) {
      return;
    }

    try {
      setSelectedFile(file);
      const localPreview = URL.createObjectURL(file);
      setImage(localPreview);
      setSnackbar({
        open: true,
        message: "Photo selected! Click 'Save Changes' to upload to cloud storage and update the batch.",
        severity: "info",
      });
    } catch (err) {
      console.error("Error setting image preview:", err);
      setSnackbar({
        open: true,
        message: "Failed to read image file. Please select a valid JPG, PNG, or WEBP under 5MB.",
        severity: "error",
      });
    }
  };

  // Handle file picker selection
  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      processSelectedFile(file);
    }
    resetFileInput(event);
  };

  // Drag and Drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processSelectedFile(file);
    }
  };

  // Clipboard paste handler
  useEffect(() => {
    const handleGlobalPaste = (e) => {
      const items = e.clipboardData?.items;
      if (items) {
        for (let i = 0; i < items.length; i++) {
          if (items[i].type.indexOf("image") !== -1) {
            const file = items[i].getAsFile();
            if (file) {
              processSelectedFile(file);
              break;
            }
          }
        }
      }
    };
    window.addEventListener("paste", handleGlobalPaste);
    return () => window.removeEventListener("paste", handleGlobalPaste);
  }, []);

  const handleApplyUrl = () => {
    if (!imageUrlValue.trim()) return;
    setImage(imageUrlValue.trim());
    setSelectedFile(null);
    setImageUrlValue("");
    setShowUrlInput(false);
    setSnackbar({
      open: true,
      message: "Image URL applied! Click 'Save Changes' to update the batch.",
      severity: "info",
    });
  };

  // Save changes to the selected batch profile
  const handleSave = async () => {
    if (!profiles[selectedIndex] || isSaving) return;

    setIsSaving(true);
    try {
      let finalImageUrl = image;

      // 1. If a new binary file was chosen, upload directly via multipart stream to cloud storage
      if (selectedFile) {
        try {
          const targetName = title.trim() || profiles[selectedIndex].title || label.trim();
          const uploadRes = await uploadBatchImage(selectedFile, targetName, profiles[selectedIndex].id);
          if (uploadRes?.proxyUrl) {
            finalImageUrl = uploadRes.proxyUrl;
          }
        } catch (uploadErr) {
          console.warn("Cloud storage upload failed, attempting local fallback compression:", uploadErr);
          // If cloud upload is unavailable in current environment, fallback to a tiny thumbnail (< 30KB)
          try {
            finalImageUrl = await optimizeImageForStorage(selectedFile, 500, 0.55);
          } catch (optErr) {
            setSnackbar({
              open: true,
              message: "Failed to upload photo: " + (uploadErr.response?.data?.message || uploadErr.message),
              severity: "error",
            });
            setIsSaving(false);
            return;
          }
        }
      }

      const updatedProfile = {
        ...profiles[selectedIndex],
        label: label.trim() || profiles[selectedIndex].label,
        title: title.trim() || profiles[selectedIndex].title,
        description: description.trim(),
        image: finalImageUrl || profiles[selectedIndex].image || "",
        customImage: Boolean(finalImageUrl),
      };

      // 2. Save ONLY this single modified profile (< 1 KB payload!)
      const success = await updateSingleBatchProfile(updatedProfile);
      if (success) {
        setSelectedFile(null);
        setImage(finalImageUrl);
        const updatedList = [...profiles];
        updatedList[selectedIndex] = updatedProfile;
        setProfiles(updatedList);
        setSnackbar({
          open: true,
          message: `Batch "${updatedProfile.label}" updated successfully! Changes are live on the website.`,
          severity: "success",
        });
      } else {
        setSnackbar({
          open: true,
          message: `Failed to save batch "${updatedProfile.label}". Please check your network connection.`,
          severity: "error",
        });
      }
    } catch (err) {
      console.error("Error saving batch:", err);
      setSnackbar({
        open: true,
        message: `Failed to save batch: ${err.message || "Request failed"}`,
        severity: "error",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Discard unsaved changes and reset current batch form to saved values
  const handleResetCurrent = () => {
    if (profiles[selectedIndex]) {
      const current = profiles[selectedIndex];
      setLabel(current.label || "");
      setTitle(current.title || "");
      setDescription(current.description || "");
      setImage(current.image || "");
      setSelectedFile(null);

      setSnackbar({
        open: true,
        message: `Discarded unsaved changes for batch "${current.label}".`,
        severity: "info",
      });
    }
  };

  // Create a new batch
  const handleAddNewBatch = () => {
    if (!newBatchName.trim()) return;

    const trimmed = newBatchName.trim();
    // Normalize label (e.g., "5.0" -> "Uniques 5.0", "The Uniques 5.0" -> "Uniques 5.0")
    let batchLabel = trimmed;
    if (batchLabel.toLowerCase().startsWith("the uniques")) {
      batchLabel = batchLabel.replace(/^the\s+/i, "");
    } else if (!batchLabel.toLowerCase().startsWith("uniques")) {
      batchLabel = `Uniques ${batchLabel}`;
    }

    const batchTitle = batchLabel.toLowerCase().startsWith("the ")
      ? batchLabel
      : `The ${batchLabel}`;

    const newProfile = {
      id: `batch-${Date.now()}`,
      label: batchLabel,
      title: batchTitle,
      description: `${batchTitle} is actively engaged in advanced skills training, projects, and innovation within The Uniques Community.`,
      image: profiles[0]?.image || "",
      customImage: false,
    };

    // Also register in member batches list
    addStoredBatch(batchTitle);

    const updated = [...profiles, newProfile];
    saveStoredBatchProfiles(updated);
    setProfiles(updated);
    setSelectedIndex(updated.length - 1);
    setNewBatchName("");
    setAddModalOpen(false);

    setSnackbar({
      open: true,
      message: `New batch "${batchLabel}" added successfully!`,
      severity: "success",
    });
  };

  // Delete the currently selected batch completely
  const handleDeleteBatch = async () => {
    if (!profiles[selectedIndex]) return;
    const current = profiles[selectedIndex];
    const batchName = current.title || current.label;

    setIsDeleting(true);
    try {
      await deleteStoredBatch(batchName);
      await deleteStoredBatchProfile(current.id || current.label);

      const remaining = profiles.filter((_, idx) => idx !== selectedIndex);
      setProfiles(remaining.length > 0 ? remaining : []);
      setSelectedIndex(0);
      setDeleteModalOpen(false);

      setSnackbar({
        open: true,
        message: `Batch "${current.label}" deleted completely from the system.`,
        severity: "success",
      });
    } catch (err) {
      console.error("Error deleting batch:", err);
      setSnackbar({
        open: true,
        message: "Failed to delete batch. Please try again.",
        severity: "error",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const currentProfile = profiles[selectedIndex] || {};

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, minHeight: "100vh" }}>
      {/* Top Page Header */}
      <Box sx={{ mb: 4 }}>
        <Stack direction={{ xs: "column", sm: "row" }} alignItems={{ xs: "flex-start", sm: "center" }} spacing={1.5} sx={{ mb: 1 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 48,
              height: 48,
              borderRadius: "12px",
              backgroundColor: "rgba(202, 0, 25, 0.12)",
              color: "#CA0019",
            }}
          >
            <ClassIcon sx={{ fontSize: 28 }} />
          </Box>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              Batch Profiles Management
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Select and update batch details, photos, and descriptions shown dynamically on the landing page.
            </Typography>
          </Box>
        </Stack>
      </Box>

      {/* Batch Selector Bar */}
      <Card
        sx={{
          mb: 4,
          p: 2.5,
          borderRadius: "14px",
          backgroundColor: isDarkMode ? "#1e1e1e" : "#ffffff",
          border: isDarkMode ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.08)",
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={8} md={6}>
            <FormControl fullWidth size="small">
              <InputLabel id="select-batch-label">Select Batch</InputLabel>
              <Select
                labelId="select-batch-label"
                value={profiles.length > 0 ? selectedIndex : ""}
                label="Select Batch"
                disabled={profiles.length === 0}
                onChange={(e) => setSelectedIndex(Number(e.target.value))}
                sx={{ borderRadius: "10px" }}
              >
                {profiles.length === 0 ? (
                  <MenuItem value="" disabled>
                    No batches available
                  </MenuItem>
                ) : (
                  profiles.map((p, idx) => (
                    <MenuItem key={p.id || idx} value={idx}>
                      {p.label || `Batch ${idx + 1}`} - {p.title}
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4} md={6}>
            <Stack direction="row" spacing={1.5} justifyContent={{ xs: "flex-start", sm: "flex-end" }}>
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteOutlineIcon />}
                onClick={() => setDeleteModalOpen(true)}
                disabled={profiles.length === 0}
                sx={{
                  borderColor: "#d32f2f",
                  color: "#d32f2f",
                  borderRadius: "10px",
                  textTransform: "none",
                  fontWeight: 600,
                  "&:hover": {
                    borderColor: "#9a0007",
                    backgroundColor: "rgba(211, 47, 47, 0.08)",
                  },
                }}
              >
                Delete Batch
              </Button>
              <Button
                variant="outlined"
                startIcon={<AddCircleOutlineIcon />}
                onClick={() => setAddModalOpen(true)}
                sx={{
                  borderColor: "#CA0019",
                  color: "#CA0019",
                  borderRadius: "10px",
                  textTransform: "none",
                  fontWeight: 600,
                  "&:hover": {
                    borderColor: "#a60014",
                    backgroundColor: "rgba(202, 0, 25, 0.08)",
                  },
                }}
              >
                Add New Batch
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Card>

      {/* Main Content Grid: Editor on Left, Live Preview on Right OR Empty State */}
      {profiles.length === 0 ? (
        <Card
          sx={{
            borderRadius: "16px",
            p: 6,
            textAlign: "center",
            backgroundColor: isDarkMode ? "#1e1e1e" : "#ffffff",
            border: isDarkMode ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.08)",
          }}
        >
          <Box
            sx={{
              width: 64,
              height: 64,
              mx: "auto",
              mb: 2,
              borderRadius: "50%",
              backgroundColor: "rgba(202, 0, 25, 0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#CA0019",
            }}
          >
            <ClassIcon sx={{ fontSize: 32 }} />
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
            No Batch Profiles Found
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 480, mx: "auto", mb: 3 }}>
            There are currently no community batch profiles configured or data fetching returned no cohorts. Click below to add your first cohort batch.
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddCircleOutlineIcon />}
            onClick={() => setAddModalOpen(true)}
            sx={{
              backgroundColor: "#CA0019",
              borderRadius: "10px",
              px: 3,
              py: 1.2,
              textTransform: "none",
              fontWeight: 600,
              "&:hover": {
                backgroundColor: "#a60014",
              },
            }}
          >
            Add New Batch
          </Button>
        </Card>
      ) : (
        <Grid container spacing={3}>
        {/* Editor Form */}
        <Grid item xs={12} lg={6}>
          <Card
            sx={{
              borderRadius: "16px",
              p: 3,
              backgroundColor: isDarkMode ? "#1e1e1e" : "#ffffff",
              border: isDarkMode ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.08)",
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
              Edit Batch Details
            </Typography>

            <Stack spacing={2.5}>
              <TextField
                label="Batch Short Label"
                fullWidth
                size="small"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                helperText="Used in dropdowns (e.g., Uniques 4.0)"
              />

              <TextField
                label="Batch Heading / Title"
                fullWidth
                size="small"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                helperText="Main title displayed on the profile (e.g., The Uniques Batch 4.0)"
              />

              {/* Photo Upload Section */}
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  Batch Photo
                </Typography>
                <Box
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 1.5,
                    p: 2,
                    borderRadius: "12px",
                    border: isDragging
                      ? "2px dashed #CA0019"
                      : isDarkMode
                      ? "1px dashed rgba(255,255,255,0.2)"
                      : "1px dashed rgba(0,0,0,0.15)",
                    backgroundColor: isDragging
                      ? "rgba(202, 0, 25, 0.08)"
                      : isDarkMode
                      ? "rgba(255,255,255,0.02)"
                      : "rgba(0,0,0,0.02)",
                    transition: "all 0.2s ease",
                  }}
                >
                  {/* File input with explicit extension/mime accept string to prevent OS explorer lag */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={FILE_VALIDATION_PRESETS.IMAGE.accept}
                    style={{ display: "none" }}
                    onChange={handleImageUpload}
                  />

                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Box
                      onClick={() => fileInputRef.current?.click()}
                      sx={{
                        width: 90,
                        height: 70,
                        borderRadius: "8px",
                        overflow: "hidden",
                        backgroundColor: "rgba(0,0,0,0.1)",
                        flexShrink: 0,
                        cursor: "pointer",
                        border: "2px solid transparent",
                        transition: "border-color 0.2s, transform 0.2s",
                        "&:hover": {
                          borderColor: "#CA0019",
                          transform: "scale(1.04)",
                        },
                      }}
                      title="Click to browse photo"
                    >
                      <img
                        src={getSafeImageUrl(image, uniques4)}
                        alt={title}
                        onError={(e) => {
                          if (e.currentTarget.src !== uniques4) {
                            e.currentTarget.src = uniques4;
                          }
                        }}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    </Box>

                    <Box sx={{ flexGrow: 1 }}>
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                        <Button
                          variant="contained"
                          onClick={() => fileInputRef.current?.click()}
                          startIcon={<CloudUploadIcon />}
                          size="small"
                          sx={{
                            backgroundColor: "#CA0019",
                            textTransform: "none",
                            fontWeight: 600,
                            borderRadius: "8px",
                            "&:hover": { backgroundColor: "#a60014" },
                          }}
                        >
                          Upload New Photo
                        </Button>

                        <Button
                          variant="text"
                          size="small"
                          onClick={() => setShowUrlInput((prev) => !prev)}
                          sx={{
                            color: "#CA0019",
                            textTransform: "none",
                            fontSize: "0.8rem",
                            fontWeight: 500,
                          }}
                        >
                          {showUrlInput ? "Hide URL" : "Enter Image URL"}
                        </Button>
                      </Stack>

                      <Typography variant="caption" display="block" color="text.secondary">
                        Drag & drop picture here, paste (Ctrl+V), or click to upload
                      </Typography>
                    </Box>
                  </Box>

                  {/* Optional Image URL Input */}
                  {showUrlInput && (
                    <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                      <TextField
                        size="small"
                        fullWidth
                        placeholder="https://example.com/batch-photo.jpg"
                        value={imageUrlValue}
                        onChange={(e) => setImageUrlValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleApplyUrl();
                          }
                        }}
                      />
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={handleApplyUrl}
                        disabled={!imageUrlValue.trim()}
                        sx={{
                          borderColor: "#CA0019",
                          color: "#CA0019",
                          textTransform: "none",
                          fontWeight: 600,
                        }}
                      >
                        Apply
                      </Button>
                    </Stack>
                  )}
                </Box>
              </Box>

              {/* Description TextArea */}
              <TextField
                label="Description About the Batch"
                fullWidth
                multiline
                rows={6}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                helperText="Enter detailed achievements, skills, and projects of this batch (supports paragraphs)."
              />

              {/* Action Buttons */}
              <Divider sx={{ my: 1 }} />
              <Stack direction="row" spacing={2} justifyContent="space-between" alignItems="center">
                <Stack direction="row" spacing={1.5}>
                  <Button
                    variant="outlined"
                    color="inherit"
                    startIcon={<RestartAltIcon />}
                    onClick={handleResetCurrent}
                    sx={{ textTransform: "none", borderRadius: "10px" }}
                  >
                    Discard Changes
                  </Button>

                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteOutlineIcon />}
                    onClick={() => setDeleteModalOpen(true)}
                    disabled={profiles.length === 0}
                    sx={{
                      borderColor: "#d32f2f",
                      color: "#d32f2f",
                      borderRadius: "10px",
                      textTransform: "none",
                      fontWeight: 600,
                      "&:hover": {
                        borderColor: "#9a0007",
                        backgroundColor: "rgba(211, 47, 47, 0.08)",
                      },
                    }}
                  >
                    Delete Batch
                  </Button>
                </Stack>

                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleSave}
                  disabled={isSaving}
                  sx={{
                    backgroundColor: "#CA0019",
                    color: "#fff",
                    fontWeight: 600,
                    textTransform: "none",
                    borderRadius: "10px",
                    px: 3,
                    "&:hover": { backgroundColor: "#a60014" },
                    "&.Mui-disabled": { backgroundColor: "#e0e0e0" },
                  }}
                >
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </Stack>
            </Stack>
          </Card>
        </Grid>

        {/* Live Website Preview Card */}
        <Grid item xs={12} lg={6}>
          <Card
            sx={{
              borderRadius: "16px",
              p: 3,
              backgroundColor: isDarkMode ? "#1e1e1e" : "#ffffff",
              border: isDarkMode ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.08)",
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <VisibilityIcon sx={{ color: "#CA0019", fontSize: 20 }} />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Live Website Preview
              </Typography>
            </Stack>

            <Box
              sx={{
                p: { xs: 2, sm: 3 },
                borderRadius: "14px",
                backgroundColor: isDarkMode ? "#121212" : "#fbfbfb",
                border: isDarkMode ? "1px solid rgba(255,255,255,0.05)" : "1px solid rgba(0,0,0,0.06)",
              }}
            >
              {/* Batch image */}
              <Box
                sx={{
                  width: "100%",
                  maxHeight: 280,
                  borderRadius: "12px",
                  overflow: "hidden",
                  mb: 2.5,
                  backgroundColor: "rgba(0,0,0,0.05)",
                }}
              >
                <img
                  src={getSafeImageUrl(image, uniques4)}
                  alt={title}
                  onError={(e) => {
                    if (e.currentTarget.src !== uniques4) {
                      e.currentTarget.src = uniques4;
                    }
                  }}
                  style={{
                    width: "100%",
                    height: "100%",
                    maxHeight: 280,
                    objectFit: "cover",
                    display: "block",
                  }}
                />
              </Box>

              {/* Title */}
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  mb: 1.5,
                  color: isDarkMode ? "#ffffff" : "#111827",
                }}
              >
                {title || "The Uniques Batch"}
              </Typography>

              {/* Description */}
              <Typography
                variant="body2"
                sx={{
                  color: isDarkMode ? "rgba(255,255,255,0.7)" : "#4b5563",
                  lineHeight: 1.8,
                  whiteSpace: "pre-line",
                  fontSize: "0.95rem",
                }}
              >
                {description || "No description provided yet."}
              </Typography>

              {/* Mock Know More Button */}
              <Box sx={{ mt: 3 }}>
                <Button
                  variant="contained"
                  disabled
                  sx={{
                    backgroundColor: "#CA0019 !important",
                    color: "#fff !important",
                    opacity: "1 !important",
                    borderRadius: "8px",
                    textTransform: "none",
                    fontWeight: 600,
                    px: 3,
                  }}
                >
                  Know More ↗
                </Button>
              </Box>
            </Box>
          </Card>
        </Grid>
      </Grid>
      )}

      {/* Add New Batch Modal */}
      <Dialog
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "14px",
            backgroundColor: isDarkMode ? "#1e1e1e" : "#ffffff",
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Add New Batch</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Enter the name of the new cohort batch (e.g. Uniques 5.0 or 5.0):
          </Typography>
          <TextField
            autoFocus
            fullWidth
            label="Batch Name"
            placeholder="e.g. Uniques 5.0"
            value={newBatchName}
            onChange={(e) => setNewBatchName(e.target.value)}
            size="small"
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setAddModalOpen(false)}
            sx={{ color: "text.secondary", textTransform: "none" }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleAddNewBatch}
            disabled={!newBatchName.trim()}
            sx={{
              backgroundColor: "#CA0019",
              "&:hover": { backgroundColor: "#a60014" },
              textTransform: "none",
              fontWeight: 600,
            }}
          >
            Create Batch
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Batch Confirmation Dialog */}
      <Dialog
        open={deleteModalOpen}
        onClose={() => !isDeleting && setDeleteModalOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "16px",
            backgroundColor: isDarkMode ? "#1e1e1e" : "#ffffff",
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 700,
            color: "#d32f2f",
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <DeleteOutlineIcon color="error" />
          Delete Batch
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 1, fontWeight: 600 }}>
            Are you sure you want to delete &ldquo;{currentProfile.label || currentProfile.title}&rdquo;?
          </Typography>
          <Typography variant="body2" color="text.secondary">
            This will request the backend endpoint to delete the batch and its showcase profile completely from the database, portal, and community website.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 0 }}>
          <Button
            onClick={() => setDeleteModalOpen(false)}
            disabled={isDeleting}
            sx={{ color: "text.secondary", textTransform: "none" }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteBatch}
            disabled={isDeleting}
            sx={{
              backgroundColor: "#d32f2f",
              "&:hover": { backgroundColor: "#9a0007" },
              textTransform: "none",
              fontWeight: 600,
            }}
          >
            {isDeleting ? "Deleting..." : "Delete Completely"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%", borderRadius: "10px" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CoordinatorBatches;
