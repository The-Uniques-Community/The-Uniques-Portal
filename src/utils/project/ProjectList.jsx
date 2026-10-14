import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  CircularProgress,
  useTheme,
  Pagination,
  alpha,
  Chip,
  Tooltip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar,
  Alert,
  Avatar,
} from "@mui/material";
import {
  AddCircleOutline,
  AccountTree,
  Public,
  Layers,
  Category as CategoryIcon,
  Delete,
  Visibility,
  Launch,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { getStoredProjects, fetchProjects, deleteProject } from "./projectsData";

const ProjectList = ({ createRoutePrefix = "/coordinator/projects-overview" }) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const navigate = useNavigate();
  const theme = useTheme();

  const loadProjects = async () => {
    try {
      setLoading(true);
      const cached = getStoredProjects();
      if (cached && cached.length > 0) {
        setProjects(cached);
      }
      const data = await fetchProjects();
      if (data && Array.isArray(data)) {
        setProjects(data);
      }
    } catch (err) {
      console.error("Error loading projects:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();

    const handleUpdate = () => {
      const current = getStoredProjects();
      if (current && current.length > 0) {
        setProjects(current);
      }
    };

    window.addEventListener("projects-updated", handleUpdate);
    return () => {
      window.removeEventListener("projects-updated", handleUpdate);
    };
  }, []);

  // Stats calculation
  const totalProjects = projects.length;
  const uniques4Projects = projects.filter(
    (p) => p.batch && p.batch.includes("4.0")
  ).length;
  const liveProjects = projects.filter(
    (p) => p.link && p.link !== "#" && p.link.startsWith("http")
  ).length;
  const totalCategories = new Set(projects.map((p) => p.category).filter(Boolean)).size;

  const handleCreateProject = () => {
    navigate(`${createRoutePrefix}/create`);
  };

  const handleDeleteClick = (project) => {
    setProjectToDelete(project);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!projectToDelete) return;
    try {
      setDeleteLoading(true);
      await deleteProject(projectToDelete._id || projectToDelete.id);
      setSnackbar({
        open: true,
        message: "Project deleted successfully",
        severity: "success",
      });
      await loadProjects();
    } catch (error) {
      console.error("Error deleting project:", error);
      setSnackbar({
        open: true,
        message: "Failed to delete project",
        severity: "error",
      });
    } finally {
      setDeleteLoading(false);
      setDeleteDialogOpen(false);
      setProjectToDelete(null);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleViewProject = (project) => {
    const projectId =
      project?.id ??
      project?._id ??
      (project?.title
        ? project.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "")
        : null);
    if (projectId) {
      navigate(`${createRoutePrefix}/view/${projectId}`);
    }
  };

  // Pagination slice
  const totalPages = Math.ceil(projects.length / rowsPerPage) || 1;
  const paginatedProjects = projects.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: "bold" }}>
        Project Management
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Total Projects */}
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2} sx={{ borderRadius: 2, boxShadow: "none" }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Projects
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <AccountTree sx={{ mr: 1, color: theme.palette.primary.main }} />
                <Typography variant="h4">{totalProjects}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Uniques 4.0 Projects */}
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2} sx={{ borderRadius: 2, boxShadow: "none" }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Uniques 4.0 Projects
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Layers sx={{ mr: 1, color: "#1890ff" }} />
                <Typography variant="h4">{uniques4Projects}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Live Portals */}
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2} sx={{ borderRadius: 2, boxShadow: "none" }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Live Web Portals
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Public sx={{ mr: 1, color: "#52c41a" }} />
                <Typography variant="h4">{liveProjects}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Categories */}
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2} sx={{ borderRadius: 2, boxShadow: "none" }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Project Domains
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <CategoryIcon sx={{ mr: 1, color: "#faad14" }} />
                <Typography variant="h4">{totalCategories}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Projects Table with Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h5">Projects List</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddCircleOutline />}
          onClick={handleCreateProject}
          sx={{ borderRadius: 2 }}
        >
          Create New Project
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : projects.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: "center", borderRadius: 2 }}>
          <Typography variant="h6" sx={{ mb: 2, color: "text.secondary" }}>
            No projects found
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddCircleOutline />}
            onClick={handleCreateProject}
            sx={{ borderRadius: 2 }}
          >
            Create Your First Project
          </Button>
        </Paper>
      ) : (
        <>
          <TableContainer component={Paper} sx={{ borderRadius: 2, mb: 2 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: theme.palette.action.hover }}>
                  <TableCell>Project Name</TableCell>
                  <TableCell>Batch</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Technologies</TableCell>
                  <TableCell>Live URL</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedProjects.map((project) => (
                  <TableRow key={project.id || project._id} hover>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        {project.image ? (
                          <Avatar
                            src={project.image}
                            alt={project.title}
                            variant="rounded"
                            sx={{ width: 44, height: 44, bgcolor: "grey.200" }}
                          />
                        ) : (
                          <Avatar
                            variant="rounded"
                            sx={{ width: 44, height: 44, bgcolor: "primary.main" }}
                          >
                            <AccountTree fontSize="small" />
                          </Avatar>
                        )}
                        <Box>
                          <Typography variant="body1" fontWeight="600">
                            {project.title}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{
                              display: "-webkit-box",
                              WebkitLineClamp: 1,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                              maxWidth: 320,
                            }}
                          >
                            {project.description}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
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
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{project.category || "General"}</Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, maxWidth: 220 }}>
                        {(Array.isArray(project.technologies)
                          ? project.technologies
                          : (project.technologies || "").split(",")
                        )
                          .slice(0, 3)
                          .map((tech, idx) => (
                            <Chip
                              key={idx}
                              label={String(tech).trim()}
                              size="small"
                              variant="outlined"
                              sx={{ fontSize: "0.7rem", height: 22 }}
                            />
                          ))}
                        {Array.isArray(project.technologies) &&
                          project.technologies.length > 3 && (
                            <Chip
                              label={`+${project.technologies.length - 3}`}
                              size="small"
                              sx={{ fontSize: "0.7rem", height: 22 }}
                            />
                          )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      {project.link && project.link !== "#" ? (
                        <Box
                          component="a"
                          href={project.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 0.5,
                            color: "primary.main",
                            textDecoration: "none",
                            fontSize: "0.875rem",
                            "&:hover": { textDecoration: "underline" },
                          }}
                        >
                          <Launch sx={{ fontSize: 16 }} />
                          <Typography
                            variant="body2"
                            sx={{
                              maxWidth: 160,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {project.link.replace(/^https?:\/\//, "")}
                          </Typography>
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          Not set
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "center",
                          gap: 1,
                        }}
                      >
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          startIcon={<Delete />}
                          onClick={() => handleDeleteClick(project)}
                          sx={{ borderRadius: 2 }}
                        >
                          Delete
                        </Button>

                        <Button
                          variant="outlined"
                          color="primary"
                          size="small"
                          startIcon={<Visibility />}
                          onClick={() => handleViewProject(project)}
                          sx={{ borderRadius: 2 }}
                        >
                          View
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(e, val) => setPage(val)}
                color="primary"
                showFirstButton
                showLastButton
              />
            </Box>
          )}

          {/* Showing results text */}
          <Box sx={{ mt: 2, display: "flex", justifyContent: "center" }}>
            <Typography variant="body2" color="text.secondary">
              Showing {paginatedProjects.length} of {projects.length} projects
            </Typography>
          </Box>
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => !deleteLoading && setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete{" "}
            <strong>{projectToDelete?.title}</strong>? This action cannot be
            undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            disabled={deleteLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            disabled={deleteLoading}
            startIcon={
              deleteLoading ? <CircularProgress size={20} /> : <Delete />
            }
          >
            {deleteLoading ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Feedback Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProjectList;
