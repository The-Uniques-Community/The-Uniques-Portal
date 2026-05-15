import React from "react";
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

const EditTaskDialog = ({
  open,
  onClose,
  onSubmit,
  submitting,
  task,
  setTask,
  members,
}) => {
  if (!task) return null;

  const assignedIds = task.assignedTo || [];
  const assignedMembers = members.filter((member) => assignedIds.includes(member._id));
  const availableMembers = members.filter((member) => !assignedIds.includes(member._id));

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Edit Task</DialogTitle>

      <DialogContent>
        <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            label="Task Title"
            fullWidth
            value={task.title || ""}
            onChange={(e) => setTask({ ...task, title: e.target.value })}
          />

          <TextField
            label="Description"
            fullWidth
            multiline
            rows={3}
            value={task.description || ""}
            onChange={(e) => setTask({ ...task, description: e.target.value })}
          />

          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>

            <Select
              value={task.status || "pending"}
              label="Status"
              onChange={(e) => setTask({ ...task, status: e.target.value })}
            >
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="in-progress">In Progress</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
            </Select>
          </FormControl>

          <Grid container spacing={2}>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>

                <Select
                  value={task.priority || "medium"}
                  label="Priority"
                  onChange={(e) => setTask({ ...task, priority: e.target.value })}
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={6}>
              <TextField
                label="Deadline"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={task.deadline ? String(task.deadline).slice(0, 10) : ""}
                onChange={(e) => setTask({ ...task, deadline: e.target.value })}
              />
            </Grid>
          </Grid>

          <FormControl fullWidth>
            <InputLabel>Assign Members</InputLabel>

            <Select
              multiple
              value={assignedIds}
              label="Assign Members"
              onChange={(e) => {
                const value = e.target.value;
                setTask({
                  ...task,
                  assignedTo: typeof value === "string" ? value.split(",") : value,
                });
              }}
              renderValue={(selected) => (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                  {selected.map((id) => {
                    const member = members.find((item) => item._id === id);
                    return <Chip key={id} label={member?.fullName || id} size="small" />;
                  })}
                </Box>
              )}
            >
              {availableMembers.map((member) => (
                <MenuItem key={member._id} value={member._id}>
                  {member.fullName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={onSubmit} disabled={submitting} sx={{ bgcolor: "#ca0019" }}>
          {submitting ? "Saving..." : "Save Changes"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditTaskDialog;