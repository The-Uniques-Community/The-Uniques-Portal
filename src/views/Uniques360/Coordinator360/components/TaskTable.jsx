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
  LinearProgress,
} from "@mui/material";
import ModernTable from "@/components/tables/ModernTable";
import ViewIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CompleteIcon from '@mui/icons-material/CheckCircle';
import TeamIcon from '@mui/icons-material/People';

const TaskTable = ({
  title,
  description,
  tasks,
  getStatusColor,
  onViewReports,
  onEdit,
  onManageTeam,
  onMarkComplete,
  onDelete,
}) => {
  return (
    <Paper 
      elevation={0} 
      sx={{ 
        borderRadius: "12px", 
        overflow: "hidden",
        border: "1px solid",
        borderColor: "divider",
        backgroundColor: "background.paper"
      }}
    >
      {/* Table Header Section */}
      {(title || description) && (
        <Box sx={{ p: 2.5, borderBottom: "1px solid", borderColor: "divider" }}>
          {title && (
            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: "16px", color: "text.primary" }}>
              {title}
            </Typography>
          )}
          {description && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontSize: "13px" }}>
              {description}
            </Typography>
          )}
        </Box>
      )}

      {/* Structured Content Grid Container */}
      <ModernTable
        title={title}
        description={description}
        columns={[
          { id: "title", label: "Task Title" },
          { id: "assignedTo", label: "Assigned To" },
          { id: "priority", label: "Priority" },
          { id: "assignedDate", label: "Assigned Date" },
          { id: "deadline", label: "Deadline" },
          { id: "status", label: "Status & Progress" },
          { id: "actions", label: "Actions", align: "right" },
        ]}
        data={tasks}
        renderRow={(task) => (
          <>
            <TableCell sx={{ py: 1.75 }}>
              <Stack spacing={0.25}>
                <Typography sx={{ fontWeight: 600, fontSize: "13.5px", color: "text.primary" }}>
                  {task.title}
                </Typography>
                <Typography variant="caption" sx={{ color: "text.subtext", fontSize: "11px" }}>
                  {task.projectCategory || "General"}
                </Typography>
              </Stack>
            </TableCell>
            <TableCell sx={{ py: 1.75 }}>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, maxWidth: "260px" }}>
                {task.assignedTo?.length ? (
                  task.assignedTo.map((item) => {
                    const inner = item && item.member ? item.member : item;
                    const name = inner?.fullName || inner?.email || "Member";
                    const explicitRole = item && item.role ? item.role : null;
                    const roleLabel = explicitRole || inner?.taskRole || inner?.roleInTask || (inner?.role && inner.role !== 'member' ? inner.role : null);
                    const key = inner?._id || inner?.email || name;
                    return (
                      <Chip
                        key={key}
                        label={roleLabel ? `${name} (${roleLabel})` : name}
                        size="small"
                        variant="outlined"
                        sx={{ 
                          borderRadius: "4px", 
                          fontSize: "11px",
                          fontWeight: 500,
                          height: "22px",
                          borderColor: "divider",
                          backgroundColor: "action.hover",
                          color: "text.secondary"
                        }}
                      />
                    );
                  })
                ) : (
                  <Chip 
                    label="No assignment" 
                    size="small" 
                    variant="outlined" 
                    sx={{ borderRadius: "4px", fontSize: "11px", height: "22px", borderStyle: "dashed", color: "text.subtext" }} 
                  />
                )}
              </Box>
            </TableCell>
            <TableCell sx={{ py: 1.75 }}>
              <Chip
                label={task.priority}
                size="small"
                color={task.priority === "high" ? "error" : task.priority === "medium" ? "warning" : "default"}
                variant={task.priority === "high" || task.priority === "medium" ? "soft" : "outlined"}
                sx={{ 
                  borderRadius: "4px", 
                  fontSize: "11px", 
                  fontWeight: 600, 
                  textTransform: "capitalize",
                  height: "22px"
                }}
              />
            </TableCell>
            <TableCell sx={{ py: 1.75, fontSize: "13px", color: "text.secondary" }}>
              {task.createdAt ? new Date(task.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : "—"}
            </TableCell>
            <TableCell sx={{ py: 1.75, fontSize: "13px", color: "text.secondary" }}>
              {task.deadline
                ? new Date(task.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
                : "No deadline"}
            </TableCell>
            <TableCell sx={{ py: 1.75 }}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75, width: "140px" }}>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      textTransform: "capitalize", 
                      fontWeight: 600, 
                      fontSize: "11px",
                      color: task.status === "completed" ? "success.main" : task.status === "in-progress" ? "warning.main" : "text.secondary"
                    }}
                  >
                    {task.status === "pending" ? "Pending" : task.status}
                  </Typography>

                  {typeof task.progressPercent === "number" && (
                    <Typography variant="caption" sx={{ fontWeight: 700, fontSize: "11px", color: "text.primary" }}>
                      {`${task.progressPercent}%`}
                    </Typography>
                  )}
                </Box>

                {typeof task.progressPercent === "number" && (
                  <LinearProgress 
                    variant="determinate" 
                    value={Math.min(Math.max(task.progressPercent, 0), 100)} 
                    sx={{ 
                      height: 5, 
                      borderRadius: 4,
                      backgroundColor: "action.hover",
                      "& .MuiLinearProgress-bar": {
                        borderRadius: 4,
                        backgroundColor: getStatusColor(task.status),
                      }
                    }} 
                  />
                )}
              </Box>
            </TableCell>
            <TableCell sx={{ py: 1.75, pr: 2.5 }} align="right">
              <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                {onViewReports && (
                  <IconButton size="small" onClick={() => onViewReports(task)} title="View Reports">
                    <ViewIcon fontSize="small" />
                  </IconButton>
                )}
                {onEdit && (
                  <IconButton size="small" onClick={() => onEdit(task)} title="Edit Task">
                    <EditIcon fontSize="small" />
                  </IconButton>
                )}
                {onManageTeam && (
                  <IconButton size="small" onClick={() => onManageTeam(task)} title="Manage Team">
                    <TeamIcon fontSize="small" />
                  </IconButton>
                )}
                {onMarkComplete && task.status !== "completed" && (
                  <IconButton size="small" onClick={() => onMarkComplete(task._id, "completed")} title="Mark as Complete">
                    <CompleteIcon fontSize="small" />
                  </IconButton>
                )}
                {onDelete && (
                  <IconButton size="small" onClick={() => onDelete(task._id)} title="Delete Task">
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                )}
              </Stack>
            </TableCell>
          </>
        )}
      />
    </Paper>
  );
};

export default TaskTable;