/**
 * @file CreateTaskDialog.jsx
 * @description Dialog modal for creating and assigning tasks with batch filtering, multi-member selection, custom role mapping, and priority setting.
 * @architecture Used as a lazy-loaded sub-component by Uniques360Coordinator to configure new task assignments.
 * @agent_note Batch filtering normalizes string casing and 'the ' prefixes. Wheel events and scroll are contained to prevent conflict with global smooth scrolling (Lenis).
 */

import React, { useMemo } from "react";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";

/**
 * @component CreateTaskDialog
 * @description Renders the task creation dialog form for assigning tasks to student members.
 * @param {Object} props - Component properties
 * @param {boolean} props.open - Whether the dialog modal is visible
 * @param {Function} props.onClose - Dismissal callback to close the modal
 * @param {Function} props.onSubmit - Action callback to dispatch task creation
 * @param {boolean} props.submitting - Loading state during submission
 * @param {Object} props.newTask - Task attributes object (title, description, assignedTo, deadline, priority, taskType)
 * @param {Function} props.setNewTask - State dispatcher for task attributes
 * @param {Object} props.newTaskRoles - Dictionary mapping member IDs to custom roles
 * @param {Function} props.setNewTaskRoles - State dispatcher for member roles
 * @param {string} props.selectedBatch - Currently selected batch filter for member lookup
 * @param {Function} props.setSelectedBatch - State dispatcher for batch filter
 * @param {Array<string>} props.batches - List of all batch identifiers
 * @param {Array<Object>} props.members - List of all candidate member objects
 */
const CreateTaskDialog = ({
  open,
  onClose,
  onSubmit,
  submitting,
  newTask,
  setNewTask,
  newTaskRoles,
  setNewTaskRoles,
  selectedBatch,
  setSelectedBatch,
  batches,
  members,
}) => {
  const AtlanticFilterMembers = useMemo(() => {
    if (!selectedBatch) return members;
    const norm = selectedBatch.replace(/^the\s+/i, "").trim().toLowerCase();
    return members.filter((member) => {
      const mBatch = (member.batch || "").replace(/^the\s+/i, "").trim().toLowerCase();
      return mBatch === norm;
    });
  }, [members, selectedBatch]);

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      fullWidth 
      maxWidth="sm"
      PaperProps={{
        "data-lenis-prevent": "true",
        onWheel: (e) => e.stopPropagation(),
        sx: {
          borderRadius: "14px",
          backgroundColor: "background.paper",
          backgroundImage: "none",
          border: "1px solid",
          borderColor: "divider",
          p: 1,
          overscrollBehavior: "contain"
        }
      }}
    >
      <DialogTitle 
        sx={{ 
          pb: 1, 
          fontSize: "19px", 
          fontWeight: 700,
          color: "text.primary" 
        }}
      >
        Assign New Task
      </DialogTitle>

      <DialogContent 
        data-lenis-prevent="true" 
        onWheel={(e) => e.stopPropagation()} 
        sx={{ pb: 2, overscrollBehavior: "contain" }}
      >
        <Box sx={{ mt: 1, display: "flex", flexDirection: "column", gap: 2.5 }}>
          
          {/* Task Title */}
          <TextField
            label="Task Title"
            fullWidth
            variant="outlined"
            size="small"
            value={newTask.title}
            onChange={(e) =>
              setNewTask({
                ...newTask,
                title: e.target.value,
              })
            }
          />

          {/* Description */}
          <TextField
            label="Description"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            size="small"
            value={newTask.description}
            onChange={(e) =>
              setNewTask({
                ...newTask,
                description: e.target.value,
              })
            }
          />

          {/* Filters and Scopes Meta Group */}
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Filter by Batch</InputLabel>
                <Select
                  value={selectedBatch}
                  label="Filter by Batch"
                  onChange={(e) => {
                    setSelectedBatch(e.target.value);
                    setNewTask({
                      ...newTask,
                      assignedTo: [],
                    });
                  }}
                >
                  <MenuItem value="">All Batches</MenuItem>
                  {batches.map((batch) => (
                    <MenuItem key={batch} value={batch}>
                      {batch}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Task Type</InputLabel>
                <Select
                  value={newTask.taskType || "project"}
                  label="Task Type"
                  onChange={(e) =>
                    setNewTask({
                      ...newTask,
                      taskType: e.target.value,
                    })
                  }
                >
                  <MenuItem value="project">Project Scope</MenuItem>
                  <MenuItem value="event">Event Activity</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          {/* Members Assignee Row Picker */}
          <FormControl fullWidth size="small">
            <InputLabel>Assign Members</InputLabel>
            <Select
              multiple
              value={newTask.assignedTo || []}
              label="Assign Members"
              disabled={!AtlanticFilterMembers.length && selectedBatch}
              onChange={(e) => {
                const value = e.target.value;
                setNewTask({
                  ...newTask,
                  assignedTo: typeof value === "string" ? value.split(",") : value,
                });
              }}
              renderValue={(selected) => (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                  {selected.map((id) => {
                    const member = members.find((item) => item._id === id);
                    return (
                      <Chip 
                        key={id} 
                        label={member?.fullName || id} 
                        size="small" 
                        sx={{ 
                          borderRadius: "4px",
                          fontWeight: 500,
                          backgroundColor: "action.hover",
                          border: "1px solid",
                          borderColor: "divider"
                        }} 
                      />
                    );
                  })}
                </Box>
              )}
            >
              {AtlanticFilterMembers.map((member) => (
                <MenuItem key={member._id} value={member._id}>
                  {member.fullName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Inline Role Settings Interface Panel */}
          {newTask.assignedTo?.length > 0 && (
            <Box 
              data-lenis-prevent="true"
              onWheel={(e) => e.stopPropagation()}
              sx={{ 
                p: 2, 
                borderRadius: "8px", 
                border: "1px dashed", 
                borderColor: "divider",
                backgroundColor: "background.default",
                display: "flex", 
                flexDirection: "column", 
                gap: 1.5,
                maxHeight: "180px",
                overflowY: "auto",
                overscrollBehavior: "contain"
              }}
            >
              <Typography variant="caption" sx={{ fontWeight: 700, color: "text.subtext", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Define Member Work Roles
              </Typography>
              
              {newTask.assignedTo.map((memberId) => {
                const member = members.find((item) => item._id === memberId);
                return (
                  <Box key={memberId} sx={{ display: "flex", gap: 2, alignItems: "center", justifyContent: "space-between" }}>
                    <Box sx={{ minWidth: 140, maxWidth: 180 }}>
                      <Typography variant="body2" noWrap sx={{ fontWeight: 600, fontSize: "13px" }}>
                        {member?.fullName || "User Card"}
                      </Typography>
                    </Box>
                    <TextField
                      label="Assigned Role"
                      size="small"
                      value={newTaskRoles?.[memberId] || ""}
                      onChange={(e) =>
                        setNewTaskRoles((prev) => ({
                          ...prev,
                          [memberId]: e.target.value,
                        }))
                      }
                      placeholder="e.g., Lead Frontend, UI design"
                      sx={{ 
                        flexGrow: 1,
                        "& .MuiInputBase-input": { fontSize: "12.5px", py: 0.75 }
                      }}
                    />
                  </Box>
                );
              })}
            </Box>
          )}

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Deadline"
                type="date"
                fullWidth
                size="small"
                InputLabelProps={{ shrink: true }}
                value={newTask.deadline}
                onChange={(e) =>
                  setNewTask({
                    ...newTask,
                    deadline: e.target.value,
                  })
                }
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Priority Level</InputLabel>
                <Select
                  value={newTask.priority}
                  label="Priority Level"
                  onChange={(e) =>
                    setNewTask({
                      ...newTask,
                      priority: e.target.value,
                    })
                  }
                >
                  <MenuItem value="low">Low Priority</MenuItem>
                  <MenuItem value="medium">Medium Priority</MenuItem>
                  <MenuItem value="high">High Priority</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, pt: 1, gap: 1 }}>
        <Button 
          onClick={onClose}
          sx={{
            textTransform: "none",
            fontSize: "13.5px",
            fontWeight: 600,
            color: "text.secondary"
          }}
        >
          Cancel
        </Button>

        <Button
          variant="contained"
          onClick={onSubmit}
          disabled={submitting}
          sx={{
            textTransform: "none",
            fontSize: "13.5px",
            fontWeight: 600,
            borderRadius: "6px",
            px: 2.5,
            backgroundColor: "primary.main",
            color: "primary.light",
            "&:hover": {
              backgroundColor: "primary.main",
              opacity: 0.95
            }
          }}
        >
          {submitting ? "Assigning Task..." : "Assign Task"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateTaskDialog;