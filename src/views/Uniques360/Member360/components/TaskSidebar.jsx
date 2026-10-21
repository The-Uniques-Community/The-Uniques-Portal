import React, { useMemo } from "react";
import { Box, Chip, List, ListItemButton, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { motion } from "framer-motion";
import TaskIcon from '@mui/icons-material/AssignmentOutlined';

const TaskSidebar = ({ tasks, selectedTask, onSelectTask }) => {
  const theme = useTheme();
  const isLight = theme.palette.mode === "light";

  const groupedTasks = useMemo(() => {
    const taskList = Array.isArray(tasks) ? tasks : [];
    return {
      pending: taskList.filter((task) => task.status === "pending"),
      inProgress: taskList.filter((task) => task.status === "in-progress"),
      completed: taskList.filter((task) => task.status === "completed"),
    };
  }, [tasks]);

  const sections = [
    { key: "pending", label: "Pending", color: isLight ? "#ca0019" : "#ff5252" },
    { key: "inProgress", label: "In Progress", color: "#f59e0b" },
    { key: "completed", label: "Completed", color: "#16a34a" },
  ];

  const drawerBg = theme?.palette?.background?.drawer || (isLight ? "#0d0d0d" : "#1a1a1a");
  
  // Custom transparent alpha calculations relative to typography settings across dark backgrounds
  const textPrimaryColor = isLight ? "#ffffff" : theme.palette.text.primary;
  const textSecondaryColor = isLight ? "rgba(255, 255, 255, 0.7)" : theme.palette.text.secondary;
  const textSubtextColor = isLight ? "rgba(255, 255, 255, 0.45)" : theme.palette.text.subtext;

  const renderTask = (task, index) => {
    const isSelected = selectedTask?._id === task._id;

    // Determine target color for status badge accent
    const currentSection = sections.find(s => s.key === "pending" && task.status === "pending" || 
                                         s.key === "inProgress" && task.status === "in-progress" || 
                                         s.key === "completed" && task.status === "completed");
    const accentColor = currentSection ? currentSection.color : "divider";

    return (
      <motion.div
        key={task._id}
        initial={{ x: -10, opacity: 0 }}
        whileInView={{ x: 0, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: index * 0.03, duration: 0.2, ease: "easeOut" }}
      >
        <ListItemButton
          onClick={() => onSelectTask(task)}
          selected={isSelected}
          disableRipple
          sx={{
            mx: 1.5,
            mb: 0.75,
            p: "10px 12px",
            borderRadius: "8px",
            alignItems: "flex-start",
            position: "relative",
            transition: "all 0.15s ease-in-out",
            border: "1px solid transparent",

            // Base State
            bgcolor: "transparent",
            color: textPrimaryColor,

            // Hover State
            "&:hover": {
              bgcolor: isLight ? "rgba(255, 255, 255, 0.06)" : "action.hover",
              color: textPrimaryColor,
            },

            // Selected State
            "&.Mui-selected": {
              bgcolor: isLight ? "rgba(255, 255, 255, 0.12)" : "action.selected",
              borderColor: isLight ? "rgba(255, 255, 255, 0.08)" : "divider",
              color: textPrimaryColor,
              "&:hover": {
                bgcolor: isLight ? "rgba(255, 255, 255, 0.16)" : "action.selected",
              },
            },
          }}
        >
          {/* Active Left Status Accent Pill */}
          {isSelected && (
            <Box
              component={motion.div}
              layoutId="activeIndicator"
              sx={{
                position: "absolute",
                left: 0,
                top: "12px",
                bottom: "12px",
                width: "3px",
                borderRadius: "0 4px 4px 0",
                bgcolor: isLight ? "primary.main" : "text.link",
              }}
            />
          )}

          <TaskIcon sx={{ color: isSelected ? (isLight ? "primary.main" : "text.link") : textSecondaryColor, mr: 1.5, mt: 0.25, fontSize: 18 }} />

          <Box sx={{ minWidth: 0, flexGrow: 1 }}>
            <Typography 
              variant="body2" 
              sx={{ 
                fontWeight: isSelected ? 600 : 500, 
                fontSize: "13.5px",
                letterSpacing: "0.1px" 
              }} 
              noWrap
            >
              {task.title}
            </Typography>

            <Typography
              variant="caption"
              sx={{
                display: "block",
                color: textSecondaryColor,
                fontSize: "11.5px",
                mt: 0.25,
                fontWeight: 400
              }}
              noWrap
            >
              {task.assignedTo?.map((item) => {
                const inner = item && item.member ? item.member : item;
                const role = item && item.role ? ` • ${item.role}` : "";
                return `${inner?.fullName || inner?.email || "Member"}${role}`;
              }).join(", ") || "No assignment"}
            </Typography>

            {/* Meta Tags Row */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, flexWrap: "wrap", mt: 1 }}>
              <Box 
                sx={{ 
                  display: "inline-flex", 
                  alignItems: "center", 
                  gap: 0.75,
                  px: 1, 
                  py: 0.25, 
                  borderRadius: "4px", 
                  backgroundColor: isLight ? "rgba(255, 255, 255, 0.06)" : "background.paper",
                  border: "1px solid",
                  borderColor: isLight ? "rgba(255, 255, 255, 0.06)" : "divider"
                }}
              >
                <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: accentColor }} />
                <Typography variant="caption" sx={{ fontSize: "10.5px", color: textSecondaryColor, fontWeight: 600, textTransform: "capitalize" }}>
                  {task.status === "pending" ? "Pending" : task.status}
                </Typography>
              </Box>

              {typeof task.progressPercent === "number" && (
                <Typography 
                  variant="caption" 
                  sx={{ 
                    fontSize: "11px", 
                    color: isLight ? "primary.main" : "text.link", 
                    fontWeight: 700,
                    px: 0.5
                  }}
                >
                  {task.progressPercent}%
                </Typography>
              )}
            </Box>
          </Box>
        </ListItemButton>
      </motion.div>
    );
  };

  return (
    <Box
      sx={{
        width: 320,
        bgcolor: drawerBg,
        color: textPrimaryColor,
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
        borderRight: "1px solid",
        borderColor: isLight ? "rgba(255,255,255,0.06)" : "divider",
      }}
    >
      {/* Sidebar Workspace Brand Branding */}
      <Box sx={{ p: 3, pb: 2.5 }}>
        <Typography 
          variant="subtitle1" 
          sx={{ 
            fontWeight: 800, 
            letterSpacing: "-0.3px",
            fontSize: "17px",
            color: textPrimaryColor
          }}
        >
          Uniques 360
        </Typography>

        <Typography
          variant="caption"
          sx={{
            color: textSecondaryColor,
            display: "block",
            mt: 0.25,
            fontSize: "12px"
          }}
        >
          Workspace Task Distribution
        </Typography>
      </Box>

      {/* Task Categorization Wrapper */}
      <Box sx={{ pb: 3 }}>
        {sections.map((section) => (
          <Box key={section.key} sx={{ mb: 2 }}>
            {/* Group Header Label */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                px: 2.5,
                mb: 0.75,
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 700,
                  letterSpacing: "0.6px",
                  color: textSubtextColor,
                  textTransform: "uppercase",
                  fontSize: "11px"
                }}
              >
                {section.label}
              </Typography>

              <Chip
                label={groupedTasks[section.key].length}
                size="small"
                sx={{
                  height: "18px",
                  fontSize: "10.5px",
                  fontWeight: 700,
                  bgcolor: isLight ? "rgba(255, 255, 255, 0.08)" : "action.hover",
                  color: textSecondaryColor,
                  border: "1px solid transparent",
                  borderColor: isLight ? "transparent" : "divider",
                  "& .MuiChip-label": { px: 1 }
                }}
              />
            </Box>

            <List disablePadding>
              {groupedTasks[section.key].length > 0 ? (
                groupedTasks[section.key].map((task, index) =>
                  renderTask(task, index)
                )
              ) : (
                <Box sx={{ px: 2.5, py: 1 }}>
                  <Typography
                    variant="caption"
                    sx={{
                      color: textSubtextColor,
                      fontStyle: "italic",
                      fontSize: "12px"
                    }}
                  >
                    No tasks assigned
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