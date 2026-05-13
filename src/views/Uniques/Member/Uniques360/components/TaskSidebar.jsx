import React from "react";
import { Box, List, ListItemButton, ListItemIcon, ListItemText, Typography } from "@mui/material";
import { motion } from "framer-motion";
import { Tag as TagIcon } from "@mui/icons-material";

const TaskSidebar = ({ tasks, selectedTask, onSelectTask, isDarkMode }) => {
  return (
    <Box
      sx={{
        width: 300,
        bgcolor: isDarkMode ? "#1a1d21" : "#3f0e40",
        color: "white",
        overflowY: "auto",
      }}
    >
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 800 }}>
          Uniques 360
        </Typography>
      </Box>

      <List>
        {Array.isArray(tasks) &&
          tasks.map((task, index) => (
            <motion.div
              key={task._id}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.05 }}
            >
              <ListItemButton onClick={() => onSelectTask(task)} selected={selectedTask?._id === task._id}>
                <ListItemIcon sx={{ color: "white" }}>
                  <TagIcon />
                </ListItemIcon>
                <ListItemText primary={task.title} />
              </ListItemButton>
            </motion.div>
          ))}
      </List>
    </Box>
  );
};

export default TaskSidebar;