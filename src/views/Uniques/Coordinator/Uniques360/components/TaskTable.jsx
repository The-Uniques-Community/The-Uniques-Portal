import React from "react";
import {
  Box,
  Chip,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import {
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CompleteIcon,
  People as TeamIcon,
} from "@mui/icons-material";

const TaskTable = ({
  tasks,
  getStatusColor,
  onViewReports,
  onEdit,
  onManageTeam,
  onMarkComplete,
  onDelete,
}) => {
  return (
    <TableContainer component={Paper} elevation={3} sx={{ borderRadius: 2 }}>
      <Table>
        <TableHead sx={{ bgcolor: "#f5f5f5" }}>
          <TableRow>
            <TableCell sx={{ fontWeight: "bold" }}>Task Title</TableCell>
            <TableCell sx={{ fontWeight: "bold" }}>Assigned To</TableCell>
            <TableCell sx={{ fontWeight: "bold" }}>Priority</TableCell>
            <TableCell sx={{ fontWeight: "bold" }}>Deadline</TableCell>
            <TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>
            <TableCell sx={{ fontWeight: "bold" }}>Actions</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {tasks.map((task) => (
            <TableRow key={task._id} hover>
              <TableCell>{task.title}</TableCell>

              <TableCell>
                {task.assignedTo
                  ?.map((member) => member.fullName)
                  .join(", ") || "No one assigned"}
              </TableCell>

              <TableCell>
                <Chip
                  label={task.priority}
                  size="small"
                  color={task.priority === "high" ? "error" : "default"}
                />
              </TableCell>

              <TableCell>
                {task.deadline
                  ? new Date(task.deadline).toLocaleDateString()
                  : "No deadline"}
              </TableCell>

              <TableCell>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                  <Chip
                    label={task.status}
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
                <Box sx={{ display: "flex", gap: 0.5 }}>
                  <IconButton
                    color="primary"
                    size="small"
                    onClick={() => onViewReports(task)}
                  >
                    <ViewIcon fontSize="small" />
                  </IconButton>

                  <IconButton
                    color="secondary"
                    size="small"
                    onClick={() => onEdit(task)}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>

                  <IconButton size="small" onClick={() => onManageTeam(task)}>
                    <TeamIcon fontSize="small" />
                  </IconButton>

                  {task.status !== "completed" && (
                    <IconButton
                      color="success"
                      size="small"
                      onClick={() => onMarkComplete(task._id, "completed")}
                    >
                      <CompleteIcon fontSize="small" />
                    </IconButton>
                  )}

                  <IconButton
                    color="error"
                    size="small"
                    onClick={() => onDelete(task._id)}
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
  );
};

export default TaskTable;