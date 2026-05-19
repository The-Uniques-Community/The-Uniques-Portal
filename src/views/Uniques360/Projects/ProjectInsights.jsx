import React, { useState, useEffect } from "react";
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
import {
  Assignment as ProjectIcon,
  TrendingUp as OngoingIcon,
  CheckCircle as CompletedIcon,
  Timer as AgingIcon,
  People as TeamIcon,
  Launch as OpenIcon,
} from "@mui/icons-material";
import axios from "axios";
import { BASE_URL } from "@/config";
import { toast } from "react-toastify";

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

  const fetchProjectTasks = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/uniques360/tasks/coordinator/current`, {
        withCredentials: true,
      });
      // Filter only project tasks
      const projectTasks = response.data.filter(task => task.taskType === "project");
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

  const handleMarkComplete = async (taskId) => {
    if (!window.confirm("Mark this task as completed?")) return;
    try {
      await axios.patch(`${BASE_URL}/api/uniques360/tasks/${taskId}`, { status: "completed" }, { withCredentials: true });
      toast.success("Task marked completed");
      fetchProjectTasks();
    } catch (error) {
      console.error("Error marking task completed:", error);
      toast.error("Failed to mark task completed");
    }
  };

  const stats = {
    total: tasks.length,
    ongoing: tasks.filter(t => t.status === "in-progress" || t.status === "pending").length,
    completed: tasks.filter(t => t.status === "completed").length,
    aging: tasks.filter(t => {
      if (t.status === "completed") return false;
      const deadline = new Date(t.deadline);
      const today = new Date();
      return deadline < today;
    }).length,
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high": return themeColors.red;
      case "medium": return themeColors.black;
      case "low": return themeColors.gray;
      default: return themeColors.gray;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh" }}>
        <CircularProgress sx={{ color: themeColors.red }} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4, bgcolor: isDark ? "background.default" : "#fafafa", minHeight: "100vh" }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: "bold", color: themeColors.black, mb: 1 }}>
          Project Analytics Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Real-time insights and tracking for all active projects.
        </Typography>
      </Box>

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
              "&:hover": { transform: "translateY(-5px)" }
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
                  bgcolor: `${stat.color}15`, 
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
          <TableContainer component={Paper} sx={{ borderRadius: 4, boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
            <Box sx={{ p: 3, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Typography variant="h6" sx={{ fontWeight: "bold" }}>Active Project Tasks</Typography>
            </Box>
            <Table>
              <TableHead sx={{ bgcolor: themeColors.black }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold", color: "#fff" }}>Project Title</TableCell>
                  <TableCell sx={{ fontWeight: "bold", color: "#fff" }}>Priority</TableCell>
                  <TableCell sx={{ fontWeight: "bold", color: "#fff" }}>Team</TableCell>
                  <TableCell sx={{ fontWeight: "bold", color: "#fff" }}>Progress</TableCell>
                  <TableCell sx={{ fontWeight: "bold", color: "#fff" }}>Deadline</TableCell>
                  <TableCell sx={{ fontWeight: "bold", color: "#fff" }} align="right">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tasks.map((task) => (
                  <TableRow key={task._id} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: "medium" }}>{task.title}</Typography>
                      <Typography variant="caption" color="text.secondary">{task.projectCategory || "General"}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={task.priority} 
                        size="small" 
                        sx={{ 
                          bgcolor: `${getPriorityColor(task.priority)}15`, 
                          color: getPriorityColor(task.priority),
                          fontWeight: "bold",
                          textTransform: "capitalize"
                        }} 
                      />
                    </TableCell>
                    <TableCell>
                      <AvatarGroup max={3}>
                        {task.assignedTo?.map((item, i) => {
                          const inner = item && item.member ? item.member : item;
                          return (
                            <Tooltip title={inner.fullName} key={i}>
                              <Avatar sx={{ width: 30, height: 30, fontSize: "0.8rem" }}>
                                {inner.fullName?.charAt(0)}
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
                        <Typography variant="caption">{task.status === "completed" ? "100%" : task.status === "in-progress" ? "50%" : "10%"}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption">
                        {new Date(task.deadline).toLocaleDateString()}
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
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>

        {/* Team Overview Card */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ borderRadius: 4, boxShadow: "0 4px 20px rgba(0,0,0,0.05)", height: "100%" }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: "bold", mb: 3 }}>Team Workload</Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                {/* Mockup team members - in a real app, this would be derived from the tasks data */}
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
