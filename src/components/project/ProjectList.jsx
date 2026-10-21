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
} from "@mui/material";
import AddCircleOutline from "@mui/icons-material/AddCircleOutline";
import AccountTree from "@mui/icons-material/AccountTree";
import Layers from "@mui/icons-material/Layers";
import Delete from "@mui/icons-material/Delete";
import Launch from "@mui/icons-material/Launch";
import { useNavigate } from "react-router-dom";
import projectService from "@/services/projectService";
import ModernTable from "@/components/tables/ModernTable";
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
    query: projectService.getProjects,
    defaultLimit: 10,
  });

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
      await projectService.deleteProject(projectToDelete._id || projectToDelete.id);
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

  const columns = [
    { id: "title", label: "Project Title", width: "30%" },
    { id: "batch", label: "Batch", width: "15%" },
    { id: "category", label: "Category", width: "20%" },
    { id: "status", label: "Status", width: "15%" },
    { id: "actions", label: "Actions", align: "center", width: "20%" },
  ];

  return (
    <Box sx={{ p: { xs: 1.5, sm: 2, md: 3 } }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: "bold" }}>
          Project Management
        </Typography>
        <Button variant="contained" startIcon={<AddCircleOutline />} onClick={handleCreateProject}>
          New Project
        </Button>
      </Box>

      {/* Metrics Row */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2} sx={{ borderRadius: 2 }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Total Projects</Typography>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <AccountTree sx={{ mr: 1, color: theme.palette.primary.main }} />
                <Typography variant="h4">{pagination.total}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2} sx={{ borderRadius: 2 }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Current Page</Typography>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Layers sx={{ mr: 1, color: "#1890ff" }} />
                <Typography variant="h4">{page} / {pagination.pages}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <SearchFilterBar
        search={search}
        onSearchChange={setSearch}
        placeholder="Search projects by title, category, or description..."
        loading={loading}
      />

      <ModernTable
        columns={columns}
        data={projects}
        loading={loading}
        pagination={{
          page,
          limit,
          total: pagination.total,
          pages: pagination.pages,
          onPageChange: setPage,
          onLimitChange: setLimit,
        }}
        renderRow={(project) => (
          <React.Fragment key={project._id || project.id}>
            <TableCell>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>{project.title}</Typography>
              <Typography variant="caption" sx={{ color: theme.palette.text.secondary }} noWrap>
                {project.description}
              </Typography>
            </TableCell>
            <TableCell><Chip label={project.batch || "General"} size="small" /></TableCell>
            <TableCell>{project.category || "General"}</TableCell>
            <TableCell>
              <Chip
                label={project.status || "In Progress"}
                color={project.status === "Completed" ? "success" : "default"}
                size="small"
              />
            </TableCell>
            <TableCell align="center">
              {project.link && (
                <Tooltip title="Open Live Site">
                  <IconButton size="small" href={project.link} target="_blank">
                    <Launch fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
              <Tooltip title="Delete">
                <IconButton size="small" color="error" onClick={() => handleDeleteClick(project)}>
                  <Delete fontSize="small" />
                </IconButton>
              </Tooltip>
            </TableCell>
          </React.Fragment>
        )}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete project "{projectToDelete?.title}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={deleteLoading}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained" disabled={deleteLoading}>
            {deleteLoading ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default ProjectList;
