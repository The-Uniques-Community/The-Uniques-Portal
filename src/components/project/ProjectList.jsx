/**
 * @file ProjectList.jsx
 * @description Administrative project listing view with server-side pagination, ModernTable, and SearchFilterBar.
 */

import React, { useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Button,
  TableCell,
  Card,
  CardContent,
  useTheme,
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
  CircularProgress,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import AddCircleOutline from "@mui/icons-material/AddCircleOutline";
import AccountTree from "@mui/icons-material/AccountTree";
import Layers from "@mui/icons-material/Layers";
import Delete from "@mui/icons-material/Delete";
import Launch from "@mui/icons-material/Launch";
import Visibility from "@mui/icons-material/Visibility";
import Refresh from "@mui/icons-material/Refresh";
import { useNavigate } from "react-router-dom";
import projectService from "@/services/projectService";
import {
  getPaginatedProjects,
  deleteProject as deleteStoredProject,
  getStoredProjects,
} from "@/utils/project/projectsData";
import ModernTable from "@/components/tables/ModernTable";
import ModernHeader from "@/components/headers/ModernHeader";
import SearchFilterBar from "@/components/common/filters/SearchFilterBar";
import { usePaginatedQuery } from "@/hooks/usePaginatedQuery";

export const ProjectList = ({ createRoutePrefix = "/coordinator/projects-overview" }) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const navigate = useNavigate();
  const theme = useTheme();

  const {
    data: projects,
    loading,
    search,
    page,
    limit,
    pagination,
    setPage,
    setLimit,
    setSearch,
    refetch,
  } = usePaginatedQuery({
    query: getPaginatedProjects,
    defaultLimit: 10,
  });

  const allStored = getStoredProjects();
  const totalCount = pagination.total || allStored.length;

  const handleCreateProject = () => {
    navigate(`${createRoutePrefix}/create`);
  };

  const handleViewProject = (projectId) => {
    navigate(`${createRoutePrefix}/view/${projectId}`);
  };

  const handleDeleteClick = (project) => {
    setProjectToDelete(project);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!projectToDelete) return;
    try {
      setDeleteLoading(true);
      const projectId = projectToDelete._id || projectToDelete.id;
      await deleteStoredProject(projectId);
      setSnackbar({ open: true, message: "Project deleted successfully", severity: "success" });
      refetch();
    } catch (error) {
      console.error("Error deleting project:", error);
      setSnackbar({ open: true, message: "Failed to delete project", severity: "error" });
    } finally {
      setDeleteLoading(false);
      setDeleteDialogOpen(false);
      setProjectToDelete(null);
    }
  };

  const getStatusColor = (status) => {
    switch ((status || "").toLowerCase()) {
      case "active":
        return "#52c41a"; // Green
      case "completed":
        return "#1890ff"; // Blue
      case "in progress":
        return "#faad14"; // Amber
      case "upcoming":
        return "#722ed1"; // Purple
      case "archived":
        return "#8c8c8c"; // Grey
      default:
        return "#52c41a";
    }
  };

  const renderStatusIndicator = (status) => {
    const label = status || "Active";
    const color = getStatusColor(label);
    return (
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Box
          sx={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            backgroundColor: color,
            boxShadow: `0 0 5px ${color}`,
          }}
        />
        <Typography variant="body2" sx={{ fontWeight: 500, textTransform: "capitalize" }}>
          {label}
        </Typography>
      </Box>
    );
  };

  const columns = [
    { id: "title", label: "Project Title", width: "34%" },
    { id: "batch", label: "Batch", width: "14%" },
    { id: "category", label: "Category", width: "18%" },
    { id: "status", label: "Status", width: "14%" },
    { id: "actions", label: "Actions", align: "center", width: "20%" },
  ];

  return (
    <Box sx={{ p: { xs: 1.5, sm: 2, md: 3 } }}>
      <ModernHeader
        title="Project"
        highlight="Management"
        subtitle="Create, review, and manage community projects and portfolios from one workspace."
        action={
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddCircleOutline />}
            onClick={handleCreateProject}
            sx={{
              borderRadius: "10px",
              whiteSpace: "nowrap",
              textTransform: "none",
              fontWeight: 700,
              fontSize: "14px",
              px: 3,
              py: 1.1,
              bgcolor: "primary.main",
              boxShadow: (theme) => `0 4px 14px 0 ${alpha(theme.palette.primary.main, 0.35)}`,
              transition: "all 0.25s ease",
              "&:hover": {
                bgcolor: "#a30014",
                transform: "translateY(-1px)",
                boxShadow: (theme) => `0 6px 18px 0 ${alpha(theme.palette.primary.main, 0.45)}`,
              },
            }}
          >
            New Project
          </Button>
        }
        sx={{ mb: 3.5, p: 0 }}
      />

      {/* Metrics Row: 2 Compact Cards matching original portal layout */}
      <Grid container spacing={2.5} sx={{ mb: 3.5 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            elevation={0}
            sx={{
              borderRadius: "14px",
              border: "1px solid",
              borderColor: "divider",
              bgcolor: (theme) =>
                theme.palette.mode === "dark" ? "background.paper" : "#fbfbfc",
              boxShadow: (theme) =>
                theme.palette.mode === "dark" ? "none" : "0 2px 8px 0 rgba(0, 0, 0, 0.04)",
              p: 2.25,
              transition: "all 0.25s ease",
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: (theme) =>
                  theme.palette.mode === "dark" ? "none" : "0 6px 16px 0 rgba(0, 0, 0, 0.08)",
              },
            }}
          >
            <Typography
              variant="body2"
              sx={{
                color: "text.secondary",
                fontWeight: 600,
                fontSize: "13px",
                mb: 1.25,
              }}
            >
              Total Projects
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
              <AccountTree sx={{ fontSize: 26, color: "primary.main" }} />
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 800,
                  fontSize: "28px",
                  color: "text.primary",
                  lineHeight: 1,
                }}
              >
                {totalCount}
              </Typography>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            elevation={0}
            sx={{
              borderRadius: "14px",
              border: "1px solid",
              borderColor: "divider",
              bgcolor: (theme) =>
                theme.palette.mode === "dark" ? "background.paper" : "#fbfbfc",
              boxShadow: (theme) =>
                theme.palette.mode === "dark" ? "none" : "0 2px 8px 0 rgba(0, 0, 0, 0.04)",
              p: 2.25,
              transition: "all 0.25s ease",
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: (theme) =>
                  theme.palette.mode === "dark" ? "none" : "0 6px 16px 0 rgba(0, 0, 0, 0.08)",
              },
            }}
          >
            <Typography
              variant="body2"
              sx={{
                color: "text.secondary",
                fontWeight: 600,
                fontSize: "13px",
                mb: 1.25,
              }}
            >
              Current Page
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
              <Layers sx={{ fontSize: 26, color: "#1890ff" }} />
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 800,
                  fontSize: "28px",
                  color: "text.primary",
                  lineHeight: 1,
                }}
              >
                {page} / {pagination.pages || 1}
              </Typography>
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Projects List Section Heading */}
      <Typography
        variant="h6"
        sx={{
          fontWeight: 800,
          color: "text.primary",
          mb: 2,
          fontSize: "18px",
          letterSpacing: "-0.2px",
        }}
      >
        Projects List
      </Typography>

      {/* Search and Filters Bar */}
      <SearchFilterBar
        search={search}
        onSearchChange={setSearch}
        placeholder="Search projects by title, category, or description..."
        loading={loading}
        actionSlot={
          <Button
            variant="outlined"
            startIcon={<Refresh sx={{ fontSize: "18px !important" }} />}
            onClick={refetch}
            disabled={loading}
            sx={{
              borderRadius: "10px",
              textTransform: "none",
              fontWeight: 600,
              fontSize: "13px",
              px: 2.5,
              py: 0.75,
              borderColor: "divider",
              color: "text.primary",
              bgcolor: "background.default",
              transition: "all 0.2s ease",
              "&:hover": {
                borderColor: "primary.main",
                color: "primary.main",
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04),
              },
            }}
          >
            Refresh
          </Button>
        }
        sx={{
          bgcolor: "background.paper",
          borderRadius: "14px",
          border: "1px solid",
          borderColor: "divider",
          boxShadow: (theme) =>
            theme.palette.mode === "dark"
              ? "none"
              : "0 2px 8px rgba(0, 0, 0, 0.03)",
          p: { xs: 1.5, sm: 2 },
          mb: 3,
        }}
      />

      {/* Projects Table */}
      <ModernTable
        title="Projects List"
        columns={columns}
        data={projects}
        loading={loading}
        emptyMessage={
          search
            ? "No projects found matching your search."
            : "No projects found. Click 'New Project' to create one."
        }
        tableContainerStyles={{
          maxHeight: "none",
          overflowY: "visible",
        }}
        containerStyles={{
          borderRadius: "14px",
          border: "1px solid",
          borderColor: "divider",
          boxShadow: (theme) =>
            theme.palette.mode === "dark"
              ? "none"
              : "0 2px 10px 0 rgba(0, 0, 0, 0.04)",
        }}
        pagination={{
          page,
          limit,
          total: pagination.total,
          pages: pagination.pages,
          onPageChange: setPage,
          onLimitChange: setLimit,
        }}
        renderRow={(project) => {
          const projectId = project._id || project.id;
          return (
            <React.Fragment key={projectId}>
              <TableCell sx={{ py: 2 }}>
                <Typography
                  variant="subtitle2"
                  onClick={() => handleViewProject(projectId)}
                  sx={{
                    fontWeight: 700,
                    fontSize: "14px",
                    color: "text.primary",
                    letterSpacing: "-0.2px",
                    cursor: "pointer",
                    transition: "color 0.2s ease",
                    mb: 0.5,
                    "&:hover": {
                      color: "primary.main",
                    },
                  }}
                >
                  {project.title}
                </Typography>
                {project.description ? (
                  <Typography
                    variant="caption"
                    sx={{
                      color: "text.secondary",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      lineHeight: 1.5,
                      fontSize: "12.5px",
                    }}
                  >
                    {project.description}
                  </Typography>
                ) : null}
              </TableCell>

              <TableCell sx={{ py: 2 }}>
                <Chip
                  label={project.batch || "General"}
                  size="small"
                  sx={{
                    borderRadius: "6px",
                    fontWeight: 600,
                    fontSize: "12px",
                    height: "24px",
                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
                    color: "primary.main",
                    border: (theme) =>
                      `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                  }}
                />
              </TableCell>

              <TableCell sx={{ py: 2 }}>
                <Typography
                  variant="body2"
                  sx={{
                    color: "text.secondary",
                    fontWeight: 500,
                    fontSize: "13px",
                  }}
                >
                  {project.category || "General"}
                </Typography>
              </TableCell>

              <TableCell sx={{ py: 2 }}>
                {renderStatusIndicator(project.status)}
              </TableCell>

              <TableCell align="center" sx={{ py: 2 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: 1,
                    flexWrap: "nowrap",
                  }}
                >
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    startIcon={<Delete sx={{ fontSize: "16px !important" }} />}
                    onClick={() => handleDeleteClick(project)}
                    sx={{
                      borderRadius: "8px",
                      textTransform: "none",
                      fontWeight: 600,
                      fontSize: "12px",
                      px: 1.5,
                      py: 0.5,
                      borderColor: (theme) => alpha(theme.palette.error.main, 0.35),
                      color: "error.main",
                      bgcolor: (theme) => alpha(theme.palette.error.main, 0.02),
                      "&:hover": {
                        borderColor: "error.main",
                        bgcolor: (theme) => alpha(theme.palette.error.main, 0.08),
                      },
                    }}
                  >
                    Delete
                  </Button>

                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<Visibility sx={{ fontSize: "16px !important" }} />}
                    onClick={() => handleViewProject(projectId)}
                    sx={{
                      borderRadius: "8px",
                      textTransform: "none",
                      fontWeight: 600,
                      fontSize: "12px",
                      px: 1.5,
                      py: 0.5,
                      color: "primary.main",
                      borderColor: (theme) => alpha(theme.palette.primary.main, 0.35),
                      bgcolor: (theme) => alpha(theme.palette.primary.main, 0.02),
                      "&:hover": {
                        borderColor: "primary.main",
                        bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
                      },
                    }}
                  >
                    View
                  </Button>

                  {(project.link || project.liveUrl) &&
                    (project.link !== "#" || project.liveUrl) && (
                      <Tooltip title="Live Website" arrow>
                        <IconButton
                          size="small"
                          component="a"
                          href={project.link || project.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{
                            borderRadius: "8px",
                            border: "1px solid",
                            borderColor: (theme) => alpha("#1890ff", 0.4),
                            p: "5px",
                            color: "#1890ff",
                            bgcolor: (theme) => alpha("#1890ff", 0.04),
                            transition: "all 0.2s ease",
                            "&:hover": {
                              borderColor: "#1890ff",
                              bgcolor: (theme) => alpha("#1890ff", 0.12),
                              transform: "translateY(-1px)",
                            },
                          }}
                        >
                          <Launch sx={{ fontSize: "16px" }} />
                        </IconButton>
                      </Tooltip>
                    )}
                </Box>
              </TableCell>
            </React.Fragment>
          );
        }}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => !deleteLoading && setDeleteDialogOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: 3,
            p: 1,
            border: "1px solid",
            borderColor: "divider",
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete project "{projectToDelete?.title}"? This
            action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            disabled={deleteLoading}
            sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            disabled={deleteLoading}
            startIcon={
              deleteLoading ? (
                <CircularProgress size={18} color="inherit" />
              ) : (
                <Delete />
              )
            }
            sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}
          >
            {deleteLoading ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%", borderRadius: 2, fontWeight: 500 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProjectList;

