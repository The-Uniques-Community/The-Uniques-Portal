import React, { useMemo } from "react";
import { Box, Chip, List, ListItemButton, Typography } from "@mui/material";
import { motion } from "framer-motion";
import { AssignmentTurnedIn as TaskIcon } from "@mui/icons-material";

const TaskSidebar = ({ tasks, selectedTask, onSelectTask, isDarkMode }) => {
  const groupedTasks = useMemo(() => {
    const taskList = Array.isArray(tasks) ? tasks : [];

    return {
      pending: taskList.filter((task) => task.status === "pending"),
      inProgress: taskList.filter((task) => task.status === "in-progress"),
      completed: taskList.filter((task) => task.status === "completed"),
    };
  }, [tasks]);

  const sections = [
    { key: "pending", label: "Pending", color: "#ca0019" },
    { key: "inProgress", label: "In Progress", color: "#f59e0b" },
    { key: "completed", label: "Completed", color: "#16a34a" },
  ];

  const renderTask = (task, index) => (
    <motion.div
      key={task._id}
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: index * 0.05 }}
    >
      <ListItemButton
        onClick={() => onSelectTask(task)}
        selected={selectedTask?._id === task._id}
        sx={{
          mx: 1,
          mb: 0.75,
          borderRadius: 2,
          alignItems: "flex-start",
          bgcolor: selectedTask?._id === task._id ? "rgba(255,255,255,0.16)" : "transparent",
        }}
      >
        <TaskIcon sx={{ color: "white", mr: 1.5, mt: 0.25 }} />
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="body2" sx={{ fontWeight: 700, color: "white" }} noWrap>
            {task.title}
          </Typography>
          <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.72)", display: "block" }}>
            {task.assignedTo?.map((item) => {
              const inner = item && item.member ? item.member : item;
              const role = item && item.role ? ` • ${item.role}` : '';
              return `${inner?.fullName || inner?.email || 'Member'}${role}`;
            }).join(', ') || 'No one assigned'}
          </Typography>
          <Chip
            label={task.status === "pending" ? "Pending" : task.status}
            size="small"
            sx={{ mt: 0.75, bgcolor: "rgba(255,255,255,0.14)", color: "white" }}
          />
          {typeof task.progressPercent === "number" && (
            <Chip
              label={`${task.progressPercent}%`}
              size="small"
              sx={{ mt: 0.75, ml: 0.75, bgcolor: "rgba(255,255,255,0.14)", color: "white" }}
            />
          )}
        </Box>
      </ListItemButton>
    </motion.div>
  );

  return (
    <Box
      sx={{
        width: 320,
        bgcolor: isDarkMode ? "#1a1d21" : "#3f0e40",
        color: "white",
        overflowY: "auto",
      }}
    >
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 800 }}>
          Uniques 360
        </Typography>
        <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.7)", mt: 0.5 }}>
          Tasks grouped by status
        </Typography>
      </Box>

      <Box sx={{ px: 1.5, pb: 2 }}>
        {sections.map((section) => (
          <Box key={section.key} sx={{ mb: 2.5 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", px: 1, mb: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, letterSpacing: 0.3 }}>
                {section.label}
              </Typography>
              <Chip label={groupedTasks[section.key].length} size="small" sx={{ bgcolor: section.color, color: "white", fontWeight: 700 }} />
            </Box>
            <List disablePadding>
              {groupedTasks[section.key].length > 0 ? (
                groupedTasks[section.key].map((task, index) => renderTask(task, index))
              ) : (
                <Box sx={{ px: 1, pb: 1.5 }}>
                  <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.55)" }}>
                    No tasks in this section.
                  </Typography>
                </Box>
              )}
            </List>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default TaskSidebar;
