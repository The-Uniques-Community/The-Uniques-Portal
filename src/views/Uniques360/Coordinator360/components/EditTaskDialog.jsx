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

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      fullWidth 
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: "14px",
          backgroundColor: "background.paper",
          backgroundImage: "none",
          border: "1px solid",
          borderColor: "divider",
          p: 1
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
        Edit Task Parameters
      </DialogTitle>

      <DialogContent sx={{ pb: 2 }}>
        <Box sx={{ mt: 1, display: "flex", flexDirection: "column", gap: 2.5 }}>
          
          {/* Task Title */}
          <TextField
            label="Task Title"
            fullWidth
            variant="outlined"
            size="small"
            value={task.title || ""}
            onChange={(e) => setTask({ ...task, title: e.target.value })}
          />

          {/* Description */}
          <TextField
            label="Description"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            size="small"
            value={task.description || ""}
            onChange={(e) => setTask({ ...task, description: e.target.value })}
          />

          {/* Operational Parameters (Status / Priority / Deadline) */}
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small">
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
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Priority</InputLabel>
                <Select
                  value={task.priority || "medium"}
                  label="Priority"
                  onChange={(e) => setTask({ ...task, priority: e.target.value })}
                >
                  <MenuItem value="low">Low Priority</MenuItem>
                  <MenuItem value="medium">Medium Priority</MenuItem>
                  <MenuItem value="high">High Priority</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Deadline"
                type="date"
                fullWidth
                size="small"
                InputLabelProps={{ shrink: true }}
                value={task.deadline ? String(task.deadline).slice(0, 10) : ""}
                onChange={(e) => setTask({ ...task, deadline: e.target.value })}
              />
            </Grid>
          </Grid>

          {/* Assigned Members Allocation Matrix */}
          <FormControl fullWidth size="small">
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
              {members.map((member) => (
                <MenuItem key={member._id} value={member._id}>
                  {member.fullName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
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
          {submitting ? "Saving Changes..." : "Save Changes"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditTaskDialog;