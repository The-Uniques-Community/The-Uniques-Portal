/**
 * @file ProjectInsights.jsx
 * @description Project operations dashboard displaying analytics, workload metrics, aging task alerts, and execution progress for project-type tasks.
 * @architecture Uniques360 view for project coordinators, filtering current coordinator tasks by taskType === 'project'.
 * @agent_note Calculates aging tasks by comparing task deadline with today's date for all uncompleted tasks.
 */

import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  LinearProgress,
  Avatar,
  AvatarGroup,
  IconButton,
  Tooltip,
  CircularProgress,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles"; // Import alpha for secure hex opacities
import ModernTable from "@/components/tables/ModernTable";
import ModernHeader from "@/components/headers/ModernHeader";
import { ProjectInsightsSkeleton } from "@/components/common/skeletons";
import ProjectIcon from '@mui/icons-material/Assignment';
import OngoingIcon from '@mui/icons-material/TrendingUp';
import CompletedIcon from '@mui/icons-material/CheckCircle';
import AgingIcon from '@mui/icons-material/Timer';
import OpenIcon from '@mui/icons-material/Launch';
import axios from "axios";
import { BASE_URL } from "@/config";
import { toast } from "react-toastify";

/**
 * @component ProjectInsights
 * @description Dashboard view providing analytics, project task tables, progress meters, and team workload widgets for project-type initiatives.
 * @state {Array} tasks - Project tasks assigned to coordinator
 * @state {boolean} loading - Loading flag for initial API fetch
 * @api {GET} /api/uniques360/tasks/coordinator/current - Fetches coordinator tasks (filtered for taskType === 'project')
 * @api {PATCH} /api/uniques360/tasks/:taskId - Marks a project task completed
 */
const ProjectInsights = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const themeColors = {
    red: "#ca0019",
    black: isDark ? "#ffffff" : "#111111",
    charcoal: isDark ? "#ffffff" : "#1f1f1f",
    gray: "#757575",
    lightGray: isDark ? "rgba(255, 255, 255, 0.08)" : "#f3f3f3",
  };

  /**
   * @desc Fetches coordinator tasks and filters exclusively for project tasks.
   * @returns {Promise<void>}
   */
  const fetchProjectTasks = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/uniques360/tasks/coordinator/current`, {
        withCredentials: true,
      });
      // Safety guard: Ensure response data is an array before filtering
      const data = Array.isArray(response.data) ? response.data : [];
      const projectTasks = data.filter(task => task.taskType === "project");
      setTasks(projectTasks);
    } catch (error) {
      console.error("Error fetching project tasks:", error);
      toast.error("Failed to load project insights");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectTasks();
  }, []);

  /**
   * @desc Marks a project task completed after user confirmation.
   * @param {string} taskId - Target task ID
   * @returns {Promise<void>}
   */
  const handleMarkComplete = async (taskId) => {
    if (!window.confirm("Mark this task as completed?")) return;
    try {
      await axios.patch(`${BASE_URL}/api/uniques360/tasks/${taskId}`, { status: "completed" }, { withCredentials: true });
      toast.success("Task marked completed");
      fetchProjectTasks();
    } catch (error) {
      console.error("Error marking task completed:", error);
      toast.error(error.response?.data?.message || "Failed to mark task completed");
    }
  };

  // Wrapped in useMemo to avoid recalculating loops on arbitrary re-renders
  const stats = useMemo(() => {
    const today = new Date();
    return {
      total: tasks.length,
      ongoing: tasks.filter(t => t.status === "in-progress" || t.status === "pending").length,
      completed: tasks.filter(t => t.status === "completed").length,
      aging: tasks.filter(t => {
        if (t.status === "completed" || !t.deadline) return false;
        return new Date(t.deadline) < today;
      }).length,
    };
  }, [tasks]);

  /**
   * @desc Resolves theme color corresponding to task priority level.
   * @param {string} priority - Priority value ('high' | 'medium' | 'low')
   * @returns {string} Color token hex string
   */
  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case "high": return themeColors.red;
      case "medium": return themeColors.black;
      case "low": return themeColors.gray;
      default: return themeColors.gray;
    }
  };

  if (loading) {
    return <ProjectInsightsSkeleton />;
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: "background.default", minHeight: "100vh" }}>
      <ModernHeader
        title="Project Analytics"
        highlight="Dashboard"
        subtitle="Real-time insights and tracking for all active projects."
      />

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          { title: "Total Projects", value: stats.total, icon: <ProjectIcon />, color: themeColors.red },
          { title: "Ongoing", value: stats.ongoing, icon: <OngoingIcon />, color: themeColors.black },
          { title: "Completed", value: stats.completed, icon: <CompletedIcon />, color: themeColors.red },
          { title: "Aging Tasks", value: stats.aging, icon: <AgingIcon />, color: themeColors.black },
        ].map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card sx={{ 
              borderRadius: 4, 
              boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
              borderLeft: `6px solid ${stat.color}`,
              transition: "transform 0.2s",
              "& :hover": { transform: "translateY(-5px)" }
            }}>
              <CardContent sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                    {stat.title}
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                    {stat.value}
                  </Typography>
                </Box>
                <Box sx={{ 
                  p: 1.5, 
                  borderRadius: "50%", 
                  bgcolor: alpha(stat.color, 0.08), // Clean UI opacity transparency fallback
                  color: stat.color 
                }}>
                  {stat.icon}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Main Content */}
      <Grid container spacing={3}>
        {/* Project List Table */}
        <Grid item xs={12} lg={8}>
          <ModernTable
            loading={loading}
            title="Active Project Tasks"
            columns={[
              { id: "title", label: "Project Title" },
              { id: "priority", label: "Priority" },
              { id: "team", label: "Team" },
              { id: "progress", label: "Progress" },
              { id: "deadline", label: "Deadline" },
              { id: "action", label: "Action", align: "right" },
            ]}
            data={tasks}
            renderRow={(task) => (
              <>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: "medium" }}>{task.title || "Untitled Task"}</Typography>
                  <Typography variant="caption" color="text.secondary">{task.projectCategory || "General"}</Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={task.priority || "low"}
                    size="small"
                    sx={{
                      bgcolor: alpha(getPriorityColor(task.priority), 0.08),
                      color: getPriorityColor(task.priority),
                      fontWeight: "bold",
                      textTransform: "capitalize"
                    }}
                  />
                </TableCell>
                <TableCell>
                  <AvatarGroup max={3}>
                    {task.assignedTo?.map((item, i) => {
                      if (!item) return null;
                      const inner = item.member ? item.member : item;
                      const displayName = inner?.fullName || "Team Member";
                      
                      return (
                        <Tooltip title={displayName} key={inner?._id || i}>
                          <Avatar sx={{ width: 30, height: 30, fontSize: "0.8rem" }}>
                            {displayName.charAt(0).toUpperCase()}
                          </Avatar>
                        </Tooltip>
                      );
                    })}
                  </AvatarGroup>
                </TableCell>
                <TableCell sx={{ width: 150 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <LinearProgress
                      variant="determinate"
                      value={task.status === "completed" ? 100 : task.status === "in-progress" ? 50 : 10}
                      sx={{
                        flexGrow: 1,
                        height: 6,
                        borderRadius: 3,
                        bgcolor: themeColors.lightGray,
                        "& .MuiLinearProgress-bar": { bgcolor: task.status === "completed" ? themeColors.red : themeColors.black }
                      }}
                    />
                    <Typography variant="caption">
                      {task.status === "completed" ? "100%" : task.status === "in-progress" ? "50%" : "10%"}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="caption">
                    {task.deadline ? new Date(task.deadline).toLocaleDateString() : "No Deadline"}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                    {task.status !== 'completed' && (
                      <IconButton size="small" onClick={() => handleMarkComplete(task._id)} title="Mark complete">
                        <CompletedIcon fontSize="small" sx={{ color: themeColors.red }} />
                      </IconButton>
                    )}
                    <IconButton size="small">
                      <OpenIcon fontSize="small" sx={{ color: themeColors.gray }} />
                    </IconButton>
                  </Box>
                </TableCell>
              </>
            )}
          />
        </Grid>

        {/* Team Overview Card */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ borderRadius: 4, boxShadow: "0 4px 20px rgba(0,0,0,0.05)", height: "100%" }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: "bold", mb: 3 }}>Team Workload</Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                {[
                  { name: "Sagar Modi", role: "Developer", load: 80, color: themeColors.red },
                  { name: "Sumit Modi", role: "Designer", load: 45, color: themeColors.black },
                  { name: "Kritika", role: "Manager", load: 20, color: themeColors.gray },
                ].map((member, i) => (
                  <Box key={i}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        <Avatar sx={{ width: 35, height: 35, bgcolor: member.color }}>{member.name.charAt(0)}</Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: "bold" }}>{member.name}</Typography>
                          <Typography variant="caption" color="text.secondary">{member.role}</Typography>
                        </Box>
                      </Box>
                      <Typography variant="caption" sx={{ fontWeight: "bold" }}>{member.load}%</Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={member.load} 
                      sx={{ 
                        height: 4, 
                        borderRadius: 2, 
                        bgcolor: themeColors.lightGray,
                        "& .MuiLinearProgress-bar": { bgcolor: member.color }
                      }} 
                    />
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProjectInsights;
