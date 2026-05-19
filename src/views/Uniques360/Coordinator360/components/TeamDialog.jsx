import React from "react";
import {
  Avatar,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemSecondaryAction,
  ListItemText,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { Delete as DeleteIcon } from "@mui/icons-material";

const TeamDialog = ({
  open,
  onClose,
  task,
  members,
  selectedMemberId,
  onSelectedMemberChange,
  selectedRole,
  onSelectedRoleChange,
  selectedBatch,
  onSelectedBatchChange,
  batches,
  onAddMember,
  onRemoveMember,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  if (!task) return null;

  const assignedIds = (task.assignedTo || []).map((member) => {
    if (typeof member === "string") return member;
    if (member?.member) return member.member._id || member.member;
    return member._id;
  });
  const assignedMembers = members.filter((member) => assignedIds.includes(member._id));
  const availableMembers = members.filter(
    (member) =>
      (!selectedBatch || member.batch === selectedBatch) &&
      !assignedIds.includes(member._id)
  );

  const getRole = (memberId) => {
    const item = (task.assignedTo || []).find((entry) => {
      if (typeof entry === "string") return entry === memberId;
      if (entry?.member) return (entry.member._id || entry.member) === memberId;
      return entry?._id === memberId;
    });
    return item?.role || "";
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Manage Team - {task.title}</DialogTitle>

      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: isDark ? "rgba(255, 255, 255, 0.05)" : "#f7f7f7", border: "1px solid", borderColor: "divider" }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
              Assignment overview
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {task.title}
            </Typography>
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 1 }}>
              <Chip label={`Members: ${assignedMembers.length}`} size="small" />
              <Chip label={task.status === "pending" ? "Pending" : task.status} size="small" color={task.status === "completed" ? "success" : task.status === "in-progress" ? "warning" : "info"} />
              {typeof task.progressPercent === "number" && (
                <Chip label={`${task.progressPercent}% progress`} size="small" variant="outlined" />
              )}
            </Box>
          </Box>

          <FormControl fullWidth>
            <InputLabel>Filter by Batch</InputLabel>
            <Select value={selectedBatch} label="Filter by Batch" onChange={(e) => onSelectedBatchChange(e.target.value)}>
              <MenuItem value="">All Batches</MenuItem>
              {batches.map((batch) => (
                <MenuItem key={batch} value={batch}>
                  {batch}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Add User</InputLabel>
            <Select value={selectedMemberId} label="Add User" onChange={(e) => onSelectedMemberChange(e.target.value)}>
              {availableMembers.map((member) => (
                <MenuItem key={member._id} value={member._id}>
                  {member.fullName} {member.email ? `(${member.email})` : ""}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Role (admin input)"
            value={selectedRole}
            onChange={(e) => onSelectedRoleChange(e.target.value)}
            placeholder="frontend, backend, ui, etc."
            fullWidth
          />

          <Button variant="contained" onClick={onAddMember} disabled={!selectedMemberId} sx={{ bgcolor: "#ca0019", alignSelf: "flex-start" }}>
            Add User
          </Button>

          <List>
            {assignedMembers.map((member) => (
              <ListItem key={member._id} divider>
                <ListItemAvatar>
                  <Avatar>{member.fullName?.[0] || "U"}</Avatar>
                </ListItemAvatar>
                <ListItemText primary={member.fullName} secondary={getRole(member._id) || member.batch || member.email || "No batch"} />
                <ListItemSecondaryAction>
                  <IconButton edge="end" color="error" onClick={() => onRemoveMember(member._id)}>
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default TeamDialog;
