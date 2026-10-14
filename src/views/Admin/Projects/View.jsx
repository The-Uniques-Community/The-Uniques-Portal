import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Card,
  CardContent,
  Chip,
  Tabs,
  Tab,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  CircularProgress,
  Snackbar,
  Alert,
  useTheme,
  alpha,
  Divider,
} from "@mui/material";
import {
  Edit,
  ArrowBack,
  Launch,
  CheckCircle,
  AccountTree,
  Code,
  Layers,
  Public,
  ZoomIn,
  ZoomOut,
  RestartAlt,
  CloudUpload,
  Delete,
  Close,
  Save,
  Check,
  OpenInNew,
  Lightbulb,
  TrackChanges,
} from "@mui/icons-material";
import {
  getProjectById,
  updateProject,
  fetchProjects,
  PROJECT_BATCHES,
  PROJECT_CATEGORIES,
} from "@/utils/project/projectsData";

const ProjectView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();

  // Determine back navigation route based on whether inside admin or coordinator
  const isCoordinator = location.pathname.startsWith("/coordinator");
  const backRoute = isCoordinator
    ? "/coordinator/projects-overview"
    : "/admin/projects-overview";

  const [project, setProject] = useState(() => getProjectById(id));
  const [loading, setLoading] = useState(!project);
  const [activeTab, setActiveTab] = useState("details");
  const [zoomLevel, setZoomLevel] = useState(1);

  // Edit Dialog State
  const [editOpen, setEditOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    overview: "",
    batch: "Uniques 4.0",
    category: "Support & Mentorship",
    technologies: "",
    status: "Completed",
    link: "",
    githubUrl: "",
    image: "",
  });
  const [imagePreview, setImagePreview] = useState("");
  const [formErrors, setFormErrors] = useState({});

  // Notification Snackbar
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Dynamically load project when id changes
  useEffect(() => {
    const current = getProjectById(id);
    if (current) {
      setProject(current);
      setLoading(false);
    } else {
      setLoading(true);
      fetchProjects()
        .then(() => {
          const fresh = getProjectById(id);
          setProject(fresh || null);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [id]);

  // Sync edit form with current project details
  const handleOpenEdit = () => {
    if (!project) return;
    const techString = Array.isArray(project.technologies)
      ? project.technologies.join(", ")
      : project.technologies || "";

    setEditForm({
      title: project.title || "",
      description: project.description || "",
      overview: project.overview || project.description || "",
      batch: project.batch || "Uniques 4.0",
      category: project.category || "Support & Mentorship",
      technologies: techString,
      status: project.status || "Completed",
      link: project.link || project.liveUrl || "",
      githubUrl: project.githubUrl || "https://github.com/theuniquesofflicial",
      image: project.image || "",
    });
    setImagePreview(project.image || "");
    setFormErrors({});
    setEditOpen(true);
  };

  const handleCloseEdit = () => {
    setEditOpen(false);
    setFormErrors({});
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleImageFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setEditForm((prev) => ({ ...prev, image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview("");
    setEditForm((prev) => ({ ...prev, image: "" }));
  };

  const validateEditForm = () => {
    const errors = {};
    if (!editForm.title.trim()) errors.title = "Project Name is required";
    if (!editForm.description.trim()) errors.description = "Description is required";
    if (!editForm.batch) errors.batch = "Batch is required";
    if (!editForm.category) errors.category = "Category is required";
    return errors;
  };

  const handleSaveProject = async (e) => {
    e.preventDefault();
    const errors = validateEditForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      setEditLoading(true);
      const techArray = editForm.technologies
        ? editForm.technologies
            .split(",")
            .map((t) => t.trim().toUpperCase())
            .filter(Boolean)
        : ["REACT", "WEB"];

      const payload = {
        title: editForm.title.trim(),
        description: editForm.description.trim(),
        overview: editForm.overview.trim() || editForm.description.trim(),
        batch: editForm.batch,
        category: editForm.category,
        technologies: techArray,
        status: editForm.status,
        link: editForm.link.trim() || "#",
        liveUrl: editForm.link.trim() || "#",
        githubUrl: editForm.githubUrl.trim() || "https://github.com/theuniquesofflicial",
        image: editForm.image || project.image || "/projects/unicare.webp",
      };

      await updateProject(project.id || project._id, payload);

      setProject((prev) => ({
        ...prev,
        ...payload,
        id: prev?.id,
        _id: prev?._id,
      }));

      setSnackbar({
        open: true,
        message: "Project updated successfully!",
        severity: "success",
      });
      setEditOpen(false);
    } catch (err) {
      console.error("Error updating project:", err);
      setSnackbar({
        open: true,
        message: "Failed to update project. Please try again.",
        severity: "error",
      });
    } finally {
      setEditLoading(false);
    }
  };

  // Quick Status change from sidebar dropdown (matches screenshot)
  const handleQuickStatusChange = async (newStatus) => {
    if (!project || project.status === newStatus) return;
    try {
      await updateProject(project.id || project._id, {
        status: newStatus,
      });
      setProject((prev) => ({ ...prev, status: newStatus }));
      setSnackbar({
        open: true,
        message: `Status updated to ${newStatus}`,
        severity: "success",
      });
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.25, 2.5));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.25, 0.75));
  const handleResetZoom = () => setZoomLevel(1);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "70vh",
        }}
      >
        <CircularProgress sx={{ color: "#1976d2" }} />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Loading project details...
        </Typography>
      </Box>
    );
  }

  if (!project) {
    return (
      <Box sx={{ p: { xs: 1.5, sm: 3, md: 4 } }}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, sm: 4, md: 5 },
            textAlign: "center",
            borderRadius: 3,
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Typography variant="h5" color="error" gutterBottom fontWeight="bold">
            Project Not Found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            The requested project could not be found.
          </Typography>
          <Button
            variant="contained"
            startIcon={<ArrowBack />}
            onClick={() => navigate(backRoute)}
            sx={{
              bgcolor: "#1976d2",
              textTransform: "none",
              borderRadius: 2,
              px: 3,
              py: 1,
              width: { xs: "100%", sm: "auto" },
            }}
          >
            Back to Projects List
          </Button>
        </Paper>
      </Box>
    );
  }

  // Prepared data
  const status = project.status || "Completed";
  const technologies = Array.isArray(project.technologies)
    ? project.technologies
    : (project.technologies || "").split(",").map((t) => t.trim()).filter(Boolean);

  const team =
    Array.isArray(project.team) && project.team.length > 0
      ? project.team
      : [
          { name: "Ankur Gill", role: "Director of Operations, SVGOI", initials: "A" },
          { name: "Mr. Ashwani Garg", role: "Chairman, SVGOI", initials: "M" },
          { name: "The Uniques Core Team", role: "Engineering Lead", initials: "TU" },
        ];

  const features =
    Array.isArray(project.features) && project.features.length > 0
      ? project.features
      : [
          "Interactive and responsive interface built for modern devices",
          "Real-time state synchronization and automated workflows",
          "Role-based access control and community data verification",
          "Seamless analytics tracking and instant feedback mechanism",
        ];

  const liveLink =
    project.liveUrl || (project.link && project.link !== "#" ? project.link : null);

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: "100%",
        boxSizing: "border-box",
        overflowX: "hidden",
        p: { xs: 0, sm: 1, md: 3.5 },
      }}
    >
      {/* Toast Notification */}
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

      {/* Top Header Card (Matches Screenshot Style Exactly) */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" },
          gap: { xs: 2, sm: 2 },
          mb: { xs: 2.5, sm: 3, md: 3.5 },
          p: { xs: 2, sm: 2.5, md: 3 },
          borderRadius: { xs: 2, sm: 3 },
          bgcolor: "background.paper",
          border: "1px solid",
          borderColor: "divider",
          boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        {/* Title and Subtitle */}
        <Box sx={{ minWidth: 0, flex: 1, width: { xs: "100%", sm: "auto" } }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              fontSize: { xs: "1.25rem", sm: "1.65rem", md: "2.1rem" },
              color: "#1976d2",
              letterSpacing: "-0.02em",
              mb: 0.5,
              wordBreak: "break-word",
              overflowWrap: "anywhere",
              lineHeight: 1.25,
            }}
          >
            {project.title}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              wordBreak: "break-word",
              lineHeight: 1.4,
              fontSize: { xs: "0.8rem", sm: "0.875rem" },
            }}
          >
            {project.category || "Web Application"} • {project.batch || "Uniques 4.0"}
            {project.createdAt && ` • Initiated: ${project.createdAt}`}
          </Typography>
        </Box>

        {/* Action Buttons: Edit Project & Back to Projects */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            flexWrap: { xs: "wrap", sm: "nowrap" },
            width: { xs: "100%", sm: "auto" },
          }}
        >
          <Button
            variant="contained"
            startIcon={<Edit />}
            onClick={handleOpenEdit}
            sx={{
              bgcolor: "#1976d2",
              "&:hover": { bgcolor: "#1565c0" },
              borderRadius: 2,
              px: { xs: 2, sm: 2.5 },
              py: { xs: 1.1, sm: 1 },
              fontWeight: 600,
              textTransform: "none",
              boxShadow: "0 2px 8px rgba(25, 118, 210, 0.25)",
              flex: { xs: "1 1 100%", sm: "none" },
              justifyContent: "center",
              fontSize: { xs: "0.875rem", sm: "0.925rem" },
              minHeight: 42,
            }}
          >
            Edit Project
          </Button>

          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={() => navigate(backRoute)}
            sx={{
              borderRadius: 2,
              px: { xs: 2, sm: 2.5 },
              py: { xs: 1.1, sm: 1 },
              fontWeight: 600,
              textTransform: "none",
              borderColor: "divider",
              color: "text.primary",
              "&:hover": {
                borderColor: "#1976d2",
                bgcolor: alpha("#1976d2", 0.04),
              },
              flex: { xs: "1 1 100%", sm: "none" },
              justifyContent: "center",
              fontSize: { xs: "0.875rem", sm: "0.925rem" },
              minHeight: 42,
            }}
          >
            Back to Projects
          </Button>
        </Box>
      </Box>

      {/* Main Content Grid: Left Column (~68%) + Right Column (~32%) */}
      <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }}>
        {/* Left Column: Banner, Navigation Tabs, and Deep Details */}
        <Grid item xs={12} md={8}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 1.75, sm: 2.5, md: 3 },
              borderRadius: { xs: 2, sm: 2.5, md: 3 },
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "background.paper",
            }}
          >
            {/* Banner Container */}
            <Box
              sx={{
                position: "relative",
                width: "100%",
                height: { xs: 200, sm: 280, md: 380 },
                bgcolor: theme.palette.mode === "dark" ? "#121214" : "#1e1e24",
                borderRadius: { xs: 2, sm: 2.5 },
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mb: { xs: 2, sm: 2.5, md: 3 },
                boxShadow: "inset 0 0 20px rgba(0,0,0,0.4)",
              }}
            >
              {/* External Link Overlay Button (Top Right of Banner like in Screenshot) */}
              {liveLink && (
                <Tooltip title="Open Live Project in New Tab">
                  <IconButton
                    component="a"
                    href={liveLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    size="small"
                    sx={{
                      position: "absolute",
                      top: { xs: 10, sm: 14 },
                      right: { xs: 10, sm: 14 },
                      bgcolor: "rgba(0,0,0,0.6)",
                      color: "white",
                      border: "1px solid rgba(255,255,255,0.2)",
                      "&:hover": { bgcolor: "rgba(0,0,0,0.85)" },
                      zIndex: 3,
                    }}
                  >
                    <OpenInNew fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}

              {/* Centered Image with Zoom Control */}
              <Box
                component="img"
                src={project.image || "/projects/unicare.webp"}
                alt={project.title}
                onError={(e) => {
                  e.currentTarget.src =
                    "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80";
                }}
                sx={{
                  maxWidth: "92%",
                  maxHeight: "88%",
                  objectFit: "contain",
                  transform: `scale(${zoomLevel})`,
                  transition: "transform 0.25s ease-out",
                  userSelect: "none",
                  display: "block",
                }}
              />

              {/* Zoom Toolbar (Matches Screenshot Toolbar at Bottom of Banner) */}
              <Box
                sx={{
                  position: "absolute",
                  bottom: { xs: 8, sm: 14 },
                  display: "flex",
                  alignItems: "center",
                  gap: { xs: 0.25, sm: 0.5 },
                  bgcolor: "rgba(0, 0, 0, 0.75)",
                  backdropFilter: "blur(6px)",
                  px: { xs: 1, sm: 1.5 },
                  py: { xs: 0.25, sm: 0.4 },
                  borderRadius: 5,
                  border: "1px solid rgba(255,255,255,0.15)",
                  zIndex: 3,
                  maxWidth: "90%",
                }}
              >
                <IconButton
                  size="small"
                  onClick={handleZoomOut}
                  disabled={zoomLevel <= 0.75}
                  sx={{ color: "white", p: { xs: 0.4, sm: 0.5 } }}
                  title="Zoom Out"
                >
                  <ZoomOut sx={{ fontSize: { xs: 16, sm: 18 } }} />
                </IconButton>
                <Typography
                  variant="caption"
                  sx={{
                    color: "white",
                    px: { xs: 0.4, sm: 0.8 },
                    fontWeight: 600,
                    minWidth: { xs: 34, sm: 42 },
                    textAlign: "center",
                    fontSize: { xs: "0.7rem", sm: "0.75rem" },
                  }}
                >
                  {Math.round(zoomLevel * 100)}%
                </Typography>
                <IconButton
                  size="small"
                  onClick={handleZoomIn}
                  disabled={zoomLevel >= 2.5}
                  sx={{ color: "white", p: { xs: 0.4, sm: 0.5 } }}
                  title="Zoom In"
                >
                  <ZoomIn sx={{ fontSize: { xs: 16, sm: 18 } }} />
                </IconButton>
                <Divider orientation="vertical" flexItem sx={{ bgcolor: "rgba(255,255,255,0.2)", mx: { xs: 0.25, sm: 0.5 } }} />
                <IconButton
                  size="small"
                  onClick={handleResetZoom}
                  sx={{ color: "white", p: { xs: 0.4, sm: 0.5 } }}
                  title="Reset Zoom"
                >
                  <RestartAlt sx={{ fontSize: { xs: 16, sm: 18 } }} />
                </IconButton>
              </Box>
            </Box>

            {/* Content Tabs (Matches Screenshot Red Underline Tab Bar) */}
            <Tabs
              value={activeTab}
              onChange={(e, val) => setActiveTab(val)}
              variant="scrollable"
              scrollButtons="auto"
              allowScrollButtonsMobile
              sx={{
                borderBottom: 1,
                borderColor: "divider",
                mb: { xs: 2.5, sm: 3 },
                minHeight: { xs: 44, sm: 48 },
                "& .MuiTabs-indicator": {
                  bgcolor: "#ca0019",
                  height: 3,
                  borderRadius: "3px 3px 0 0",
                },
                "& .MuiTab-root": {
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: { xs: "0.85rem", sm: "0.95rem" },
                  px: { xs: 1.5, sm: 2.5 },
                  minHeight: { xs: 44, sm: 48 },
                  minWidth: "auto",
                  color: "text.secondary",
                  whiteSpace: "nowrap",
                  "&.Mui-selected": {
                    color: "#ca0019",
                  },
                },
              }}
            >
              <Tab label="Details" value="details" />
              <Tab label="Tech Stack & Features" value="tech" />
              <Tab label="Team & Contributors" value="team" />
            </Tabs>

            {/* Tab Panel 1: Details */}
            {activeTab === "details" && (
              <Box sx={{ display: "flex", flexDirection: "column", gap: { xs: 2.5, sm: 3 } }}>
                {/* About Section */}
                <Box>
                  <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1, fontSize: { xs: "1.1rem", sm: "1.25rem" } }}>
                    <Layers sx={{ color: "#ca0019", fontSize: 22 }} />
                    About This Project
                  </Typography>
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{
                      lineHeight: 1.8,
                      whiteSpace: "pre-line",
                      wordBreak: "break-word",
                      overflowWrap: "anywhere",
                      fontSize: { xs: "0.875rem", sm: "1rem" },
                    }}
                  >
                    {project.detailedDescription || project.description}
                  </Typography>
                </Box>

                {/* Overview */}
                {project.overview && project.overview !== project.description && (
                  <Box>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom color="text.primary" sx={{ fontSize: { xs: "0.95rem", sm: "1rem" } }}>
                      Project Overview
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        lineHeight: 1.7,
                        wordBreak: "break-word",
                        overflowWrap: "anywhere",
                      }}
                    >
                      {project.overview}
                    </Typography>
                  </Box>
                )}

                {/* Problem & Solution Cards */}
                {(project.problemStatement || project.solution) && (
                  <Grid container spacing={2} sx={{ mt: 0.5 }}>
                    {project.problemStatement && (
                      <Grid item xs={12} sm={6}>
                        <Card
                          variant="outlined"
                          sx={{
                            borderRadius: 2.5,
                            bgcolor: alpha("#ca0019", 0.03),
                            borderColor: alpha("#ca0019", 0.2),
                            height: "100%",
                          }}
                        >
                          <CardContent sx={{ p: { xs: 2, sm: 2.5 }, "&:last-child": { pb: { xs: 2, sm: 2.5 } } }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                              <TrackChanges sx={{ color: "#ca0019", fontSize: 20 }} />
                              <Typography variant="subtitle2" fontWeight="bold" color="#ca0019">
                                Problem Statement
                              </Typography>
                            </Box>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{
                                lineHeight: 1.6,
                                wordBreak: "break-word",
                                overflowWrap: "anywhere",
                              }}
                            >
                              {project.problemStatement}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    )}

                    {project.solution && (
                      <Grid item xs={12} sm={6}>
                        <Card
                          variant="outlined"
                          sx={{
                            borderRadius: 2.5,
                            bgcolor: alpha("#4caf50", 0.04),
                            borderColor: alpha("#4caf50", 0.25),
                            height: "100%",
                          }}
                        >
                          <CardContent sx={{ p: { xs: 2, sm: 2.5 }, "&:last-child": { pb: { xs: 2, sm: 2.5 } } }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                              <Lightbulb sx={{ color: "#4caf50", fontSize: 20 }} />
                              <Typography variant="subtitle2" fontWeight="bold" color="#2e7d32">
                                The Solution
                              </Typography>
                            </Box>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{
                                lineHeight: 1.6,
                                wordBreak: "break-word",
                                overflowWrap: "anywhere",
                              }}
                            >
                              {project.solution}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    )}
                  </Grid>
                )}
              </Box>
            )}

            {/* Tab Panel 2: Tech Stack & Features */}
            {activeTab === "tech" && (
              <Box sx={{ display: "flex", flexDirection: "column", gap: { xs: 2.5, sm: 3 } }}>
                {/* Technologies */}
                <Box>
                  <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1, fontSize: { xs: "1.1rem", sm: "1.25rem" } }}>
                    <Code sx={{ color: "#1976d2", fontSize: 22 }} />
                    Technologies & Architecture
                  </Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1 }}>
                    {technologies.map((tech, idx) => (
                      <Chip
                        key={idx}
                        label={tech}
                        sx={{
                          fontWeight: 600,
                          fontSize: { xs: "0.775rem", sm: "0.825rem" },
                          borderRadius: 2,
                          bgcolor: alpha("#1976d2", 0.08),
                          color: "#1976d2",
                          border: "1px solid",
                          borderColor: alpha("#1976d2", 0.2),
                          px: 0.5,
                          maxWidth: "100%",
                        }}
                      />
                    ))}
                  </Box>
                </Box>

                {/* Key Features */}
                <Box>
                  <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1, fontSize: { xs: "1.1rem", sm: "1.25rem" } }}>
                    <CheckCircle sx={{ color: "#ca0019", fontSize: 22 }} />
                    Key Capabilities & Features
                  </Typography>
                  <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
                    {features.map((feat, idx) => (
                      <Grid item xs={12} sm={6} key={idx}>
                        <Paper
                          variant="outlined"
                          sx={{
                            p: { xs: 1.5, sm: 2 },
                            borderRadius: 2,
                            display: "flex",
                            alignItems: "flex-start",
                            gap: 1.25,
                            bgcolor: "background.default",
                          }}
                        >
                          <Check sx={{ color: "#ca0019", fontSize: 18, mt: 0.3, flexShrink: 0 }} />
                          <Typography
                            variant="body2"
                            fontWeight={500}
                            sx={{
                              wordBreak: "break-word",
                              overflowWrap: "anywhere",
                              fontSize: { xs: "0.825rem", sm: "0.875rem" },
                            }}
                          >
                            {feat}
                          </Typography>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              </Box>
            )}

            {/* Tab Panel 3: Team & Contributors */}
            {activeTab === "team" && (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1, fontSize: { xs: "1.1rem", sm: "1.25rem" } }}>
                  <AccountTree sx={{ color: "#ca0019", fontSize: 22 }} />
                  Project Leadership & Contributors
                </Typography>
                <Grid container spacing={2}>
                  {team.map((member, idx) => (
                    <Grid item xs={12} sm={6} key={idx}>
                      <Card variant="outlined" sx={{ borderRadius: 2.5, p: { xs: 1.5, sm: 2 } }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                          <Avatar
                            sx={{
                              bgcolor: "#ca0019",
                              color: "white",
                              fontWeight: 700,
                              width: { xs: 40, sm: 46 },
                              height: { xs: 40, sm: 46 },
                              flexShrink: 0,
                            }}
                          >
                            {member.initials || "TU"}
                          </Avatar>
                          <Box sx={{ minWidth: 0, flex: 1 }}>
                            <Typography
                              variant="subtitle1"
                              fontWeight="bold"
                              sx={{
                                wordBreak: "break-word",
                                overflowWrap: "anywhere",
                                fontSize: { xs: "0.925rem", sm: "1rem" },
                              }}
                            >
                              {member.name}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{
                                wordBreak: "break-word",
                                overflowWrap: "anywhere",
                                display: "block",
                              }}
                            >
                              {member.role || "Developer & Contributor"}
                            </Typography>
                          </Box>
                        </Box>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Right Column: Status Card, Project Quick Info, Team Card */}
        <Grid item xs={12} md={4}>
          <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }}>
            {/* Card 1: Project Status (Matches Screenshot Exactly) */}
            <Grid item xs={12} sm={6} md={12}>
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 2, sm: 2.5, md: 3 },
                  borderRadius: { xs: 2, sm: 2.5, md: 3 },
                  border: "1px solid",
                  borderColor: "divider",
                  bgcolor: "background.paper",
                  height: "100%",
                  boxSizing: "border-box",
                }}
              >
                <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mb: 2 }}>
                  Project Status
                </Typography>

                {/* Active Status Display with colored dot */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2.5 }}>
                  <Box
                    sx={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      bgcolor:
                        status === "Completed" || status === "Live / Production"
                          ? "#4caf50"
                          : status === "In Progress"
                          ? "#ff9800"
                          : "#2196f3",
                      boxShadow:
                        status === "Completed" || status === "Live / Production"
                          ? "0 0 8px #4caf50"
                          : "0 0 8px #ff9800",
                    }}
                  />
                  <Typography
                    variant="subtitle1"
                    fontWeight="600"
                    sx={{
                      color:
                        status === "Completed" || status === "Live / Production"
                          ? "#2e7d32"
                          : status === "In Progress"
                          ? "#e65100"
                          : "primary.main",
                    }}
                  >
                    {status}
                  </Typography>
                </Box>

                {/* Update Status Select (Matches Screenshot Dropdown) */}
                <FormControl fullWidth size="small">
                  <InputLabel id="update-status-label">Update Status</InputLabel>
                  <Select
                    labelId="update-status-label"
                    label="Update Status"
                    value={status}
                    onChange={(e) => handleQuickStatusChange(e.target.value)}
                  >
                    <MenuItem value="Completed">Completed</MenuItem>
                    <MenuItem value="Live / Production">Live / Production</MenuItem>
                    <MenuItem value="In Progress">In Progress</MenuItem>
                    <MenuItem value="Planning">Planning</MenuItem>
                  </Select>
                </FormControl>
              </Paper>
            </Grid>

            {/* Card 2: Project Details / Quick Info */}
            <Grid item xs={12} sm={6} md={12}>
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 2, sm: 2.5, md: 3 },
                  borderRadius: { xs: 2, sm: 2.5, md: 3 },
                  border: "1px solid",
                  borderColor: "divider",
                  bgcolor: "background.paper",
                  height: "100%",
                  boxSizing: "border-box",
                }}
              >
                <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mb: 2.5 }}>
                  Project Information
                </Typography>

                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {/* Batch */}
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Batch
                    </Typography>
                    <Chip
                      label={project.batch || "Uniques 4.0"}
                      size="small"
                      sx={{
                        fontWeight: 600,
                        bgcolor: alpha("#ca0019", 0.08),
                        color: "#ca0019",
                        border: "1px solid",
                        borderColor: alpha("#ca0019", 0.2),
                      }}
                    />
                  </Box>
                  <Divider />

                  {/* Category */}
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Category
                    </Typography>
                    <Typography
                      variant="body2"
                      fontWeight="600"
                      sx={{ wordBreak: "break-word", textAlign: "right" }}
                    >
                      {project.category || "General"}
                    </Typography>
                  </Box>
                  <Divider />

                  {/* Live URL */}
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Live Demo Link
                    </Typography>
                    {liveLink ? (
                      <Button
                        variant="outlined"
                        size="small"
                        fullWidth
                        component="a"
                        href={liveLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        startIcon={<Public />}
                        endIcon={<Launch sx={{ fontSize: 16 }} />}
                        sx={{
                          justifyContent: "space-between",
                          textTransform: "none",
                          borderRadius: 2,
                          px: { xs: 1.5, sm: 2 },
                          fontSize: { xs: "0.82rem", sm: "0.875rem" },
                        }}
                      >
                        Open Live Portal
                      </Button>
                    ) : (
                      <Typography variant="caption" color="text.secondary">
                        No live deployment link set
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Paper>
            </Grid>

            {/* Card 3: Team / Members (Matches Screenshot Event Guests Section) */}
            <Grid item xs={12} md={12}>
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 2, sm: 2.5, md: 3 },
                  borderRadius: { xs: 2, sm: 2.5, md: 3 },
                  border: "1px solid",
                  borderColor: "divider",
                  bgcolor: "background.paper",
                  boxSizing: "border-box",
                }}
              >
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                  <Typography variant="h6" fontWeight="bold">
                    Project Team
                  </Typography>
                  <Chip
                    label={`${team.length} members`}
                    size="small"
                    sx={{
                      bgcolor: "#ca0019",
                      color: "white",
                      fontWeight: 600,
                      fontSize: "0.75rem",
                      height: 22,
                    }}
                  />
                </Box>

                <Grid container spacing={1.5}>
                  {team.map((member, idx) => (
                    <Grid item xs={12} sm={6} md={12} key={idx}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1.5,
                          p: { xs: 1.25, sm: 1.5 },
                          borderRadius: 2,
                          bgcolor: "background.default",
                          height: "100%",
                          boxSizing: "border-box",
                        }}
                      >
                        <Avatar
                          sx={{
                            width: { xs: 36, sm: 40 },
                            height: { xs: 36, sm: 40 },
                            bgcolor: "grey.400",
                            color: "white",
                            fontSize: { xs: "0.8rem", sm: "0.9rem" },
                            fontWeight: 600,
                            flexShrink: 0,
                          }}
                        >
                          {member.initials || member.name?.charAt(0) || "T"}
                        </Avatar>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography
                            variant="subtitle2"
                            fontWeight="600"
                            sx={{
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              fontSize: { xs: "0.85rem", sm: "0.875rem" },
                            }}
                          >
                            {member.name}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              display: "block",
                            }}
                          >
                            {member.role || "Member"}
                          </Typography>
                          <Chip
                            label="core"
                            size="small"
                            sx={{
                              fontSize: "0.65rem",
                              height: 18,
                              mt: 0.5,
                              bgcolor: "action.hover",
                            }}
                          />
                        </Box>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      {/* Edit Project Dialog (Full Functional Edit with API persistence) */}
      <Dialog
        open={editOpen}
        onClose={handleCloseEdit}
        maxWidth="md"
        fullWidth
        sx={{
          zIndex: 2500,
        }}
        PaperProps={{
          "data-lenis-prevent": "true",
          sx: {
            borderRadius: { xs: 2, sm: 3 },
            p: { xs: 0.5, sm: 1 },
            m: { xs: 1, sm: 2 },
            width: { xs: "calc(100% - 16px)", sm: "auto" },
            maxHeight: { xs: "94vh", sm: "90vh" },
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            boxSizing: "border-box",
          },
        }}
      >
        <DialogTitle
          sx={{
            flexShrink: 0,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            p: { xs: 1.5, sm: 2 },
          }}
        >
          <Typography
            variant="h6"
            fontWeight="bold"
            sx={{
              fontSize: { xs: "1.05rem", sm: "1.35rem" },
              wordBreak: "break-word",
              pr: 1,
            }}
          >
            Edit Project: {project.title}
          </Typography>
          <IconButton onClick={handleCloseEdit} size="small">
            <Close />
          </IconButton>
        </DialogTitle>

        <Box
          component="form"
          onSubmit={handleSaveProject}
          data-lenis-prevent
          sx={{
            display: "flex",
            flexDirection: "column",
            flex: "1 1 auto",
            minHeight: 0,
            overflow: "hidden",
          }}
        >
          <DialogContent
            dividers
            data-lenis-prevent
            sx={{
              p: { xs: 1.5, sm: 2.5, md: 3 },
              flex: "1 1 auto",
              minHeight: 0,
              overflowY: "auto",
              overflowX: "hidden",
              overscrollBehavior: "contain",
              touchAction: "pan-y",
              WebkitOverflowScrolling: "touch",
            }}
            onWheel={(e) => {
              e.stopPropagation();
            }}
          >
            {/* Banner Preview & Upload */}
            <Box
              sx={{
                mb: 3,
                border: "2px dashed",
                borderColor: imagePreview ? "divider" : alpha("#ca0019", 0.3),
                borderRadius: 2.5,
                p: { xs: 1.5, sm: 2.5 },
                textAlign: "center",
                bgcolor: "background.default",
              }}
            >
              <input
                type="file"
                accept="image/*"
                id="edit-project-image-upload"
                style={{ display: "none" }}
                onChange={handleImageFileChange}
              />

              {imagePreview ? (
                <Box sx={{ position: "relative", display: "inline-block", maxWidth: "100%" }}>
                  <Box
                    component="img"
                    src={imagePreview}
                    alt="Preview"
                    sx={{
                      maxWidth: "100%",
                      maxHeight: { xs: 150, sm: 200 },
                      borderRadius: 2,
                      objectFit: "contain",
                    }}
                  />
                  <IconButton
                    size="small"
                    onClick={handleRemoveImage}
                    sx={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      bgcolor: "rgba(0,0,0,0.6)",
                      color: "white",
                      "&:hover": { bgcolor: "#ca0019" },
                    }}
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                </Box>
              ) : (
                <label htmlFor="edit-project-image-upload" style={{ cursor: "pointer", display: "block" }}>
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<CloudUpload />}
                    sx={{
                      color: "#ca0019",
                      borderColor: "#ca0019",
                      mb: 1,
                      textTransform: "none",
                      fontSize: { xs: "0.85rem", sm: "0.9rem" },
                    }}
                  >
                    Upload Banner Image
                  </Button>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>
                    PNG, JPG, or WEBP banner image
                  </Typography>
                </label>
              )}
            </Box>

            <Grid container spacing={{ xs: 1.5, sm: 2, md: 2.5 }}>
              {/* Project Name */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Project Name"
                  name="title"
                  value={editForm.title}
                  onChange={handleInputChange}
                  error={Boolean(formErrors.title)}
                  helperText={formErrors.title}
                  required
                  size="small"
                />
              </Grid>

              {/* Description */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Description"
                  name="description"
                  value={editForm.description}
                  onChange={handleInputChange}
                  error={Boolean(formErrors.description)}
                  helperText={formErrors.description}
                  required
                  size="small"
                />
              </Grid>

              {/* Overview */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Project Overview (Detailed)"
                  name="overview"
                  value={editForm.overview}
                  onChange={handleInputChange}
                  helperText="Extended overview for the project details view"
                  size="small"
                />
              </Grid>

              {/* Batch */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required size="small" error={Boolean(formErrors.batch)}>
                  <InputLabel id="edit-batch-label">Batch</InputLabel>
                  <Select
                    labelId="edit-batch-label"
                    label="Batch"
                    name="batch"
                    value={editForm.batch}
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
                <FormControl fullWidth required size="small" error={Boolean(formErrors.category)}>
                  <InputLabel id="edit-cat-label">Category</InputLabel>
                  <Select
                    labelId="edit-cat-label"
                    label="Category"
                    name="category"
                    value={editForm.category}
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
                  size="small"
                  label="Technologies (comma separated)"
                  name="technologies"
                  value={editForm.technologies}
                  onChange={handleInputChange}
                  helperText="e.g. REACT, NODE.JS, MONGODB, TAILWIND"
                />
              </Grid>

              {/* Status */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small">
                  <InputLabel id="edit-status-label">Project Status</InputLabel>
                  <Select
                    labelId="edit-status-label"
                    label="Project Status"
                    name="status"
                    value={editForm.status}
                    onChange={handleInputChange}
                  >
                    <MenuItem value="Completed">Completed</MenuItem>
                    <MenuItem value="Live / Production">Live / Production</MenuItem>
                    <MenuItem value="In Progress">In Progress</MenuItem>
                    <MenuItem value="Planning">Planning</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Live URL */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Live Website URL"
                  name="link"
                  placeholder="https://..."
                  value={editForm.link}
                  onChange={handleInputChange}
                />
              </Grid>

              {/* GitHub URL */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="GitHub Repository URL"
                  name="githubUrl"
                  placeholder="https://github.com/..."
                  value={editForm.githubUrl}
                  onChange={handleInputChange}
                />
              </Grid>

              {/* Image URL fallback */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  size="small"
                  label="Image URL (Alternative to file upload)"
                  name="image"
                  value={editForm.image.startsWith("data:") ? "" : editForm.image}
                  onChange={(e) => {
                    const val = e.target.value;
                    setEditForm((prev) => ({ ...prev, image: val }));
                    if (val) setImagePreview(val);
                  }}
                  helperText="Direct image URL or path e.g. /projects/unicare.webp"
                />
              </Grid>
            </Grid>
          </DialogContent>

          <DialogActions
            sx={{
              flexShrink: 0,
              p: { xs: 1.5, sm: 2.5 },
              gap: 1,
            }}
          >
            <Button
              onClick={handleCloseEdit}
              variant="outlined"
              disabled={editLoading}
              sx={{ flex: { xs: 1, sm: "none" } }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={editLoading}
              startIcon={<Save />}
              sx={{
                bgcolor: "#1976d2",
                "&:hover": { bgcolor: "#1565c0" },
                px: 3,
                fontWeight: 600,
                textTransform: "none",
                flex: { xs: 1, sm: "none" },
              }}
            >
              {editLoading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
};

export default ProjectView;
