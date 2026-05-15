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
} from "@mui/material";

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
  const filteredMembers = useMemo(() => {
    return selectedBatch
      ? members.filter((member) => member.batch === selectedBatch)
      : members;
  }, [members, selectedBatch]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Assign New Task</DialogTitle>

      <DialogContent>
        <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            label="Task Title"
            fullWidth
            value={newTask.title}
            onChange={(e) =>
              setNewTask({
                ...newTask,
                title: e.target.value,
              })
            }
          />

          <TextField
            label="Description"
            fullWidth
            multiline
            rows={3}
            value={newTask.description}
            onChange={(e) =>
              setNewTask({
                ...newTask,
                description: e.target.value,
              })
            }
          />

          <Grid container spacing={2}>
            <Grid item xs={6}>
              <FormControl fullWidth>
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

                  <FormControl fullWidth>
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
                      <MenuItem value="project">Project</MenuItem>
                      <MenuItem value="event">Event</MenuItem>
                    </Select>
                  </FormControl>
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

            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Assign Members</InputLabel>

                <Select
                  multiple
                  value={newTask.assignedTo || []}
                  label="Assign Members"
                  disabled={!filteredMembers.length && selectedBatch}
                  onChange={(e) => {
                    const value = e.target.value;

                    setNewTask({
                      ...newTask,
                      assignedTo:
                        typeof value === "string" ? value.split(",") : value,
                    });
                  }}
                  renderValue={(selected) => <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>{selected.map((id) => {
                    const member = members.find((item) => item._id === id);
                    return <Chip key={id} label={member?.fullName || id} size="small" />;
                  })}</Box>}
                >
                  {filteredMembers.map((member) => (
                    <MenuItem key={member._id} value={member._id}>
                      {member.fullName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {newTask.assignedTo?.length > 0 && (
                <Box sx={{ mt: 1.5, display: "flex", flexDirection: "column", gap: 1.25 }}>
                  {newTask.assignedTo.map((memberId) => {
                    const member = members.find((item) => item._id === memberId);
                    return (
                      <Box key={memberId} sx={{ display: "flex", gap: 1.25, alignItems: "center", flexWrap: "wrap" }}>
                        <Box sx={{ minWidth: 180 }}>
                          <Chip label={member?.fullName || memberId} size="small" />
                        </Box>
                        <TextField
                          label="Role (admin input)"
                          size="small"
                          fullWidth
                          value={newTaskRoles?.[memberId] || ""}
                          onChange={(e) =>
                            setNewTaskRoles((prev) => ({
                              ...prev,
                              [memberId]: e.target.value,
                            }))
                          }
                          placeholder="frontend, backend, ui, etc."
                        />
                      </Box>
                    );
                  })}
                </Box>
              )}
            </Grid>
          </Grid>

          <TextField
            label="Deadline"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={newTask.deadline}
            onChange={(e) =>
              setNewTask({
                ...newTask,
                deadline: e.target.value,
              })
            }
          />

          <FormControl fullWidth>
            <InputLabel>Priority</InputLabel>

            <Select
              value={newTask.priority}
              label="Priority"
              onChange={(e) =>
                setNewTask({
                  ...newTask,
                  priority: e.target.value,
                })
              }
            >
              <MenuItem value="low">Low</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="high">High</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>

        <Button
          variant="contained"
          onClick={onSubmit}
          disabled={submitting}
          sx={{ bgcolor: "#ca0019" }}
        >
          {submitting ? "Assigning..." : "Assign Task"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateTaskDialog;