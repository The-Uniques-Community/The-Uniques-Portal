import React, { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Grid,
  Snackbar,
  Alert,
  IconButton,
  Chip,
} from "@mui/material";
import { ArrowBack, CloudUpload, Delete } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import {
  addProject,
  PROJECT_BATCHES,
  PROJECT_CATEGORIES,
} from "./projectsData";

const ProjectForm = ({ onSuccess }) => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    batch: "Uniques 4.0",
    category: "Support & Mentorship",
    technologies: "REACT, NODE.JS, MONGODB",
    link: "",
    buttonColor: "#ea384c",
    image: "",
  });

  const [imagePreview, setImagePreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleImageFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setFormData((prev) => ({ ...prev, image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview("");
    setFormData((prev) => ({ ...prev, image: "" }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = "Project Name is required";
    if (!formData.description.trim()) newErrors.description = "Project Description is required";
    if (!formData.batch) newErrors.batch = "Batch is required";
    if (!formData.category) newErrors.category = "Category is required";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);

    try {
      const techArray = formData.technologies
        ? formData.technologies
            .split(",")
            .map((t) => t.trim().toUpperCase())
            .filter(Boolean)
        : [];

      const newProject = await addProject({
        title: formData.title.trim(),
        description: formData.description.trim(),
        batch: formData.batch,
        category: formData.category,
        technologies: techArray.length > 0 ? techArray : ["REACT", "WEB"],
        link: formData.link.trim() || "#",
        buttonColor: formData.buttonColor || "#ea384c",
        image: formData.image || "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80",
      });

      setSnackbar({
        open: true,
        message: "Project created successfully!",
        severity: "success",
      });

      setTimeout(() => {
        if (onSuccess) {
          onSuccess(newProject);
        } else {
          navigate(-1);
        }
      }, 1000);
    } catch (err) {
      console.error("Error creating project:", err);
      setSnackbar({
        open: true,
        message: "Failed to create project. Please try again.",
        severity: "error",
      });
      setLoading(false);
    }
  };

  return (
    <Box sx={{ mx: "auto", p: { xs: 2, md: 3 } }}>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate(-1)}
        sx={{ mb: 2, color: "text.secondary", "&:hover": { color: "#ca0019" } }}
      >
        Back to Projects
      </Button>

      <form onSubmit={handleSubmit}>
        <Card elevation={0} sx={{ mb: 4, borderRadius: 3, border: "1px solid", borderColor: "divider" }}>
          <CardContent sx={{ p: { xs: 2, md: 4 } }}>
            <Typography variant="h5" component="h2" sx={{ mb: 3, fontWeight: 600 }}>
              Create New Project
            </Typography>

            {/* Project Image Upload */}
            <Box
              sx={{
                mb: 3,
                border: "2px dashed",
                borderColor: imagePreview ? "divider" : "#ca001955",
                borderRadius: 2,
                p: 3,
                textAlign: "center",
                bgcolor: "background.default",
                position: "relative",
              }}
            >
              <input
                type="file"
                accept="image/*"
                id="project-image-upload"
                style={{ display: "none" }}
                onChange={handleImageFileChange}
              />

              {imagePreview ? (
                <Box sx={{ position: "relative", display: "inline-block" }}>
                  <img
                    src={imagePreview}
                    alt="Project Preview"
                    style={{
                      maxWidth: "100%",
                      maxHeight: "220px",
                      borderRadius: "8px",
                      objectFit: "cover",
                    }}
                  />
                  <IconButton
                    size="small"
                    sx={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      bgcolor: "rgba(0,0,0,0.6)",
                      color: "white",
                      "&:hover": { bgcolor: "rgba(202,0,25,0.9)" },
                    }}
                    onClick={handleRemoveImage}
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                </Box>
              ) : (
                <label htmlFor="project-image-upload" style={{ cursor: "pointer", display: "block" }}>
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<CloudUpload />}
                    sx={{
                      color: "#ca0019",
                      borderColor: "#ca0019",
                      "&:hover": { borderColor: "#a00015", bgcolor: "rgba(202,0,25,0.04)" },
                      mb: 1,
                    }}
                  >
                    Upload Banner
                  </Button>
                  <Typography variant="body2" color="text.secondary">
                    Drag and drop or click to upload a project banner image
                  </Typography>
                </label>
              )}
            </Box>

            <Grid container spacing={3}>
              {/* Project Name */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Project Name"
                  name="title"
                  placeholder="e.g. UNI CARE, Libraria, Ideajam 2026"
                  value={formData.title}
                  onChange={handleInputChange}
                  error={Boolean(errors.title)}
                  helperText={errors.title}
                  required
                />
              </Grid>

              {/* Project Description */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Project Description"
                  name="description"
                  placeholder="Provide an overview of the project, problem it solves, and key features..."
                  value={formData.description}
                  onChange={handleInputChange}
                  error={Boolean(errors.description)}
                  helperText={errors.description}
                  required
                />
              </Grid>

              {/* Batch */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required error={Boolean(errors.batch)}>
                  <InputLabel id="batch-select-label">Batch</InputLabel>
                  <Select
                    labelId="batch-select-label"
                    label="Batch"
                    name="batch"
                    value={formData.batch}
                    onChange={handleInputChange}
                  >
                    {PROJECT_BATCHES.map((batch) => (
                      <MenuItem key={batch} value={batch}>
                        {batch}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Category */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required error={Boolean(errors.category)}>
                  <InputLabel id="category-select-label">Category</InputLabel>
                  <Select
                    labelId="category-select-label"
                    label="Category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                  >
                    {PROJECT_CATEGORIES.map((cat) => (
                      <MenuItem key={cat} value={cat}>
                        {cat}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Technologies */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Technologies (comma separated)"
                  name="technologies"
                  placeholder="REACT, NODE.JS, MONGODB, TAILWIND"
                  value={formData.technologies}
                  onChange={handleInputChange}
                  helperText="Enter technologies separated by commas"
                />
              </Grid>

              {/* Project Live Link */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Project Live URL / Website Link"
                  name="link"
                  placeholder="https://..."
                  value={formData.link}
                  onChange={handleInputChange}
                  helperText="Full URL to the deployed website or repo"
                />
              </Grid>

              {/* Custom Image URL fallback */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Or Image URL (Optional)"
                  name="image"
                  placeholder="https://... or /projects/name.webp"
                  value={formData.image.startsWith("data:") ? "" : formData.image}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormData((prev) => ({ ...prev, image: val }));
                    if (val) setImagePreview(val);
                  }}
                  helperText="Direct image URL if not uploading a file"
                />
              </Grid>

              {/* Button Color */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Button Accent Color"
                  name="buttonColor"
                  value={formData.buttonColor}
                  onChange={handleInputChange}
                  helperText="Hex color code (e.g. #ea384c or #ca0019)"
                />
              </Grid>
            </Grid>

            {/* Buttons */}
            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 4 }}>
              <Button
                variant="outlined"
                onClick={() => navigate(-1)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                sx={{
                  bgcolor: "#ca0019",
                  "&:hover": { bgcolor: "#a00015" },
                  px: 4,
                  py: 1,
                  fontWeight: 600,
                }}
              >
                {loading ? "Creating..." : "Create Project"}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </form>
    </Box>
  );
};

export default ProjectForm;
