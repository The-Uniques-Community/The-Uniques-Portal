/**
 * @file TeamDialog.jsx
 * @description Dialog modal for managing team roster allocations, assigning new members with specific roles, and unassigning members from a task.
 * @architecture Sub-component of Uniques360Coordinator, invoked when clicking 'Manage Team' on any task entry in TaskTable.
 * @agent_note Extracts normalized member IDs whether task.assignedTo stores raw IDs or populated objects. Filters available members to avoid duplicate assignments.
 */

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
  Grid,
  useTheme,
} from "@mui/material";
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import AddTeamIcon from '@mui/icons-material/GroupAddOutlined';

/**
 * @component TeamDialog
 * @description Modal allowing coordinators to view currently assigned team members, assign new members with custom roles, and detach members.
 * @param {Object} props - Component properties
 * @param {boolean} props.open - Whether dialog is currently visible
 * @param {Function} props.onClose - Modal close handler
 * @param {Object|null} props.task - The selected task whose team is being managed
 * @param {Array<Object>} props.members - List of all member profiles in system
 * @param {string} props.selectedMemberId - Current member selected in the add dropdown
 * @param {Function} props.onSelectedMemberChange - Dispatcher for selected member
 * @param {string} props.selectedRole - Text description of assigned role responsibility
 * @param {Function} props.onSelectedRoleChange - Dispatcher for role text
 * @param {string} props.selectedBatch - Currently applied batch filter
 * @param {Function} props.onSelectedBatchChange - Dispatcher for batch filter
 * @param {Array<string>} props.batches - List of all batch options
 * @param {Function} props.onAddMember - Action trigger to attach selected member
 * @param {Function} props.onRemoveMember - Action trigger to detach member by ID
 */
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
  const normBatch = selectedBatch ? selectedBatch.replace(/^the\s+/i, "").trim().toLowerCase() : null;
  const availableMembers = members.filter((member) => {
    const mBatch = (member.batch || "").replace(/^the\s+/i, "").trim().toLowerCase();
    const batchMatches = !normBatch || mBatch === normBatch;
    return batchMatches && !assignedIds.includes(member._id);
  });

  const getRole = (memberId) => {
    const item = (task.assignedTo || []).find((entry) => {
      if (typeof entry === "string") return entry === memberId;
      if (entry?.member) return (entry.member._id || entry.member) === memberId;
      return entry?._id === memberId;
    });
    return item?.role || "";
  };

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
          pb: 1.5, 
          fontSize: "19px", 
          fontWeight: 700,
          color: "text.primary" 
        }}
      >
        Manage Team Allocation
      </DialogTitle>

      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, mt: 1 }}>
          
          {/* Assignment Overview Meta Card */}
          <Box 
            sx={{ 
              p: 2, 
              borderRadius: "10px", 
              backgroundColor: isDark ? "rgba(255, 255, 255, 0.05)" : "action.hover", 
              border: "1px solid",
              borderColor: "divider" 
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: "13px", color: "text.secondary", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Active Target Workspace
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 600, mt: 0.5, color: "text.primary" }}>
              {task.title}
            </Typography>
            
            <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap", mt: 1.5 }}>
              <Chip 
                label={`Allocated: ${assignedMembers.length}`} 
                size="small" 
                sx={{ borderRadius: "4px", fontWeight: 600, fontSize: "11px", height: "22px", backgroundColor: "background.paper", borderColor: "divider" }}
                variant="outlined"
              />
              <Chip 
                label={task.status === "pending" ? "Pending" : task.status} 
                size="small" 
                color={task.status === "completed" ? "success" : task.status === "in-progress" ? "warning" : "info"}
                variant="soft"
                sx={{ borderRadius: "4px", fontWeight: 600, fontSize: "11px", height: "22px", textTransform: "capitalize" }}
              />
              {typeof task.progressPercent === "number" && (
                <Chip 
                  label={`${task.progressPercent}% Vector Progress`} 
                  size="small" 
                  variant="outlined" 
                  sx={{ borderRadius: "4px", fontWeight: 600, fontSize: "11px", height: "22px", backgroundColor: "background.paper", borderColor: "divider" }}
                />
              )}
            </Box>
          </Box>

          {/* Allocation Matrix Filters and Inputs */}
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small">
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
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Add User</InputLabel>
                <Select value={selectedMemberId} label="Add User" onChange={(e) => onSelectedMemberChange(e.target.value)}>
                  {availableMembers.map((member) => (
                    <MenuItem key={member._id} value={member._id}>
                      {member.fullName} {member.email ? `(${member.email})` : ""}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
                <TextField
                  label="Role Responsibility"
                  value={selectedRole}
                  onChange={(e) => onSelectedRoleChange(e.target.value)}
                  placeholder="e.g., Frontend, Backend, Team Lead"
                  fullWidth
                  size="small"
                />

                <Button 
                  variant="contained" 
                  onClick={onAddMember} 
                  disabled={!selectedMemberId} 
                  startIcon={<AddTeamIcon sx={{ fontSize: 18 }} />}
                  sx={{ 
                    textTransform: "none",
                    whiteSpace: "nowrap",
                    fontSize: "13px",
                    fontWeight: 600,
                    height: "40px",
                    borderRadius: "6px",
                    px: 2,
                    backgroundColor: "primary.main",
                    color: "primary.light",
                    "&:hover": {
                      backgroundColor: "primary.main",
                      opacity: 0.95
                    }
                  }}
                >
                  Assign
                </Button>
              </Box>
            </Grid>
          </Grid>

          {/* Roster Allocation Stream List */}
          <List disablePadding sx={{ mt: 1, border: "1px solid", borderColor: "divider", borderRadius: "10px", overflow: "hidden" }}>
            {assignedMembers.length > 0 ? (
              assignedMembers.map((member, index) => (
                <ListItem 
                  key={member._id} 
                  divider={index !== assignedMembers.length - 1}
                  sx={{ 
                    py: 1.5, 
                    px: 2,
                    backgroundColor: "background.paper",
                    "&:hover": { backgroundColor: "action.hover" }
                  }}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ width: 34, height: 34, fontSize: "12px", fontWeight: 700, bgcolor: "action.selected", color: "text.primary" }}>
                      {member.fullName?.[0]?.toUpperCase() || "U"}
                    </Avatar>
                  </ListItemAvatar>
                  
                  <ListItemText 
                    primary={member.fullName} 
                    secondary={getRole(member._id) || member.batch || member.email || "General Space"} 
                    primaryTypographyProps={{ sx: { fontWeight: 600, fontSize: "14px", color: "text.primary" } }}
                    secondaryTypographyProps={{ sx: { fontSize: "12px", color: "text.secondary", mt: 0.25 } }}
                  />
                  
                  <ListItemSecondaryAction sx={{ pr: 1 }}>
                    <IconButton 
                      edge="end" 
                      size="small" 
                      onClick={() => onRemoveMember(member._id)}
                      sx={{ color: "text.secondary", "&:hover": { color: "error.main", backgroundColor: "action.hover" } }}
                    >
                      <DeleteIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))
            ) : (
              <Box sx={{ py: 4, textAlign: "center", color: "text.subtext" }}>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  No members assigned to this operation yet.
                </Typography>
              </Box>
            )}
          </List>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, pt: 1 }}>
        <Button 
          onClick={onClose}
          sx={{
            textTransform: "none",
            fontSize: "13.5px",
            fontWeight: 600,
            color: "text.secondary"
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TeamDialog;
