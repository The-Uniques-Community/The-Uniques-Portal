import React from "react";
import {
  Box,
  Chip,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import {
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CompleteIcon,
  People as TeamIcon,
  PersonAddAlt1 as AddUserIcon,
} from "@mui/icons-material";

const TaskTable = ({
  title,
  description,
  tasks,
  getStatusColor,
  onViewReports,
  onEdit,
  onManageTeam,
  onAddUser,
  onMarkComplete,
  onDelete,
}) => {
  return (
    <Paper elevation={3} sx={{ borderRadius: 2, overflow: "hidden" }}>
      {(title || description) && (
        <Box sx={{ p: 2, borderBottom: "1px solid #eee" }}>
          {title && (
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              {title}
            </Typography>
          )}
          {description && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {description}
            </Typography>
          )}
        </Box>
      )}

      <TableContainer>
        <Table>
          <TableHead sx={{ bgcolor: "#f5f5f5" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold" }}>Task Title</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Assigned To</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Priority</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Assigned Date</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Deadline</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {tasks.map((task) => (
              <TableRow key={task._id} hover>
                <TableCell>
                  <Stack spacing={0.5}>
                    <Typography sx={{ fontWeight: 700 }}>{task.title}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {task.projectCategory || "General"}
                    </Typography>
                  </Stack>
                </TableCell>

                <TableCell>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
                    {task.assignedTo?.length ? (
                      task.assignedTo.map((item) => {
                        // item can be either a Member object (legacy) or { member: Member, role: String }
                        const inner = item && item.member ? item.member : item;
                        const name = inner?.fullName || inner?.email || "Member";
                        const explicitRole = item && item.role ? item.role : null;
                        const roleLabel = explicitRole || inner?.taskRole || inner?.roleInTask || (inner?.role && inner.role !== 'member' ? inner.role : null);
                        const key = inner?._id || inner?.email || name;
                        return (
                          <Chip
                            key={key}
                            label={roleLabel ? `${name} — ${roleLabel}` : name}
                            size="small"
                            variant="outlined"
                            sx={{ borderRadius: 999 }}
                          />
                        );
                      })
                    ) : (
                      <Chip label="No one assigned" size="small" variant="outlined" />
                    )}
                  </Box>
                </TableCell>

                <TableCell>
                  <Chip
                    label={task.priority}
                    size="small"
                    color={task.priority === "high" ? "error" : task.priority === "medium" ? "warning" : "default"}
                  />
                </TableCell>

                <TableCell>
                  {task.createdAt ? new Date(task.createdAt).toLocaleDateString() : "—"}
                </TableCell>

                <TableCell>
                  {task.deadline
                    ? new Date(task.deadline).toLocaleDateString()
                    : "No deadline"}
                </TableCell>

                <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                    <Chip
                      label={task.status === "pending" ? "Pending" : task.status}
                      size="small"
                      color={getStatusColor(task.status)}
                    />

                    {typeof task.progressPercent === "number" && (
                      <Chip
                        label={`${task.progressPercent}%`}
                        size="small"
                        variant="outlined"
                        color="info"
                      />
                    )}
                  </Box>
                </TableCell>

                <TableCell>
                  <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                    <IconButton
                      color="primary"
                      size="small"
                      onClick={() => onViewReports(task)}
                      title="View reports"
                    >
                      <ViewIcon fontSize="small" />
                    </IconButton>

                    <IconButton
                      color="secondary"
                      size="small"
                      onClick={() => onEdit(task)}
                      title="Edit task"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>

                    <IconButton
                      size="small"
                      onClick={() => onAddUser?.(task)}
                      title="Add user"
                    >
                      <AddUserIcon fontSize="small" />
                    </IconButton>

                    <IconButton
                      size="small"
                      onClick={() => onManageTeam(task)}
                      title="Manage team"
                    >
                      <TeamIcon fontSize="small" />
                    </IconButton>

                    {task.status !== "completed" && (
                      <IconButton
                        color="success"
                        size="small"
                        onClick={() => onMarkComplete(task._id, "completed")}
                        title="Mark completed"
                      >
                        <CompleteIcon fontSize="small" />
                      </IconButton>
                    )}

                    <IconButton
                      color="error"
                      size="small"
                      onClick={() => onDelete(task._id)}
                      title="Delete task"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default TaskTable;
