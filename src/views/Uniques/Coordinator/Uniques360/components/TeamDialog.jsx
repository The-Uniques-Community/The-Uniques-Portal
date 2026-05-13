import React from "react";
import {
  Avatar,
  Box,
  Button,
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
} from "@mui/material";
import { Delete as DeleteIcon } from "@mui/icons-material";

const TeamDialog = ({
  open,
  onClose,
  task,
  members,
  selectedMemberId,
  onSelectedMemberChange,
  selectedBatch,
  onSelectedBatchChange,
  batches,
  onAddMember,
  onRemoveMember,
}) => {
  if (!task) return null;

  const assignedIds = (task.assignedTo || []).map((member) =>
    typeof member === "string" ? member : member._id
  );
  const assignedMembers = members.filter((member) => assignedIds.includes(member._id));
  const availableMembers = members.filter(
    (member) =>
      (!selectedBatch || member.batch === selectedBatch) &&
      !assignedIds.includes(member._id)
  );

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Manage Team - {task.title}</DialogTitle>

      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
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
            <InputLabel>Add Member</InputLabel>
            <Select value={selectedMemberId} label="Add Member" onChange={(e) => onSelectedMemberChange(e.target.value)}>
              {availableMembers.map((member) => (
                <MenuItem key={member._id} value={member._id}>
                  {member.fullName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button variant="contained" onClick={onAddMember} disabled={!selectedMemberId} sx={{ bgcolor: "#ca0019", alignSelf: "flex-start" }}>
            Add Teammate
          </Button>

          <List>
            {assignedMembers.map((member) => (
              <ListItem key={member._id} divider>
                <ListItemAvatar>
                  <Avatar>{member.fullName?.[0] || "U"}</Avatar>
                </ListItemAvatar>
                <ListItemText primary={member.fullName} secondary={member.batch || "No batch"} />
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