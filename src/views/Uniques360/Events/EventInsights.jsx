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
  Avatar,
  AvatarGroup,
  IconButton,
  LinearProgress,
  CircularProgress,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
} from "@mui/material";
import {
  Event as EventIcon,
  Schedule as TimelineIcon,
  People as StudentIcon,
  Warning as UrgencyIcon,
  CheckCircle as DoneIcon,
  Launch as OpenIcon,
} from "@mui/icons-material";
import axios from "axios";
import { BASE_URL } from "@/config";
import { toast } from "react-toastify";

const EventInsights = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const themeColors = {
    red: "#ca0019",
    black: "#111111",
    charcoal: "#1f1f1f",
    gray: "#757575",
    lightGray: "#f3f3f3",
  };

  const fetchEventTasks = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/uniques360/tasks/coordinator/current`, {
        withCredentials: true,
      });
      // Filter only event tasks
      const eventTasks = response.data.filter(task => task.taskType === "event");
      setTasks(eventTasks);
    } catch (error) {
      console.error("Error fetching event tasks:", error);
      toast.error("Failed to load event insights");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEventTasks();
  }, []);

  const handleMarkComplete = async (taskId) => {
    if (!window.confirm("Mark this task as completed?")) return;
    try {
      await axios.patch(`${BASE_URL}/api/uniques360/tasks/${taskId}`, { status: "completed" }, { withCredentials: true });
      toast.success("Task marked completed");
      fetchEventTasks();
    } catch (error) {
      console.error("Error marking task completed:", error);
      toast.error("Failed to mark task completed");
    }
  };

  const stats = {
    total: tasks.length,
    upcoming: tasks.filter(t => t.status === "pending").length,
    completed: tasks.filter(t => t.status === "completed").length,
    urgent: tasks.filter(t => t.priority === "high" && t.status !== "completed").length,
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high": return themeColors.red;
      case "medium": return themeColors.black;
      case "low": return themeColors.gray;
      default: return themeColors.gray;
    }
  };

  const getProgressValue = (status) => {
    switch (status) {
      case "completed": return 100;
      case "in-progress": return 50;
      default: return 10;
    }
  };

  const getTaskProgress = (task) => {
    if (typeof task.progressPercent === "number") return task.progressPercent;
    return getProgressValue(task.status);
  };

  const getInitials = (fullName) => {
    if (!fullName) return "?";
    return fullName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map(part => part[0])
      .join("")
      .toUpperCase();
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh" }}>
        <CircularProgress sx={{ color: themeColors.red }} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4, bgcolor: "#fafafa", minHeight: "100vh" }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: "bold", color: themeColors.black, mb: 1 }}>
          Event Analytics Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Real-time insights and tracking for all active event tasks.
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          { title: "Total Event Tasks", value: stats.total, icon: <EventIcon />, color: themeColors.red },
          { title: "Upcoming Tasks", value: stats.upcoming, icon: <TimelineIcon />, color: themeColors.black },
          { title: "Completed", value: stats.completed, icon: <DoneIcon />, color: themeColors.red },
          { title: "Urgent (High Priority)", value: stats.urgent, icon: <UrgencyIcon />, color: themeColors.black },
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
        {/* Main Table */}
        <Grid item xs={12} lg={7}>
          <TableContainer component={Paper} sx={{ 
            borderRadius: 4,
            boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
            border: "1px solid rgba(0,0,0,0.04)"
          }}>
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: "bold" }}>Active Event Tasks</Typography>
            </Box>
            <Table>
              <TableHead sx={{ bgcolor: themeColors.black }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold", color: "#fff" }}>Event Title</TableCell>
                  <TableCell sx={{ fontWeight: "bold", color: "#fff" }}>Priority</TableCell>
                  <TableCell sx={{ fontWeight: "bold", color: "#fff" }}>Team</TableCell>
                  <TableCell sx={{ fontWeight: "bold", color: "#fff" }}>Progress</TableCell>
                  <TableCell sx={{ fontWeight: "bold", color: "#fff" }}>Deadline</TableCell>
                  <TableCell sx={{ fontWeight: "bold", color: "#fff" }}>Action</TableCell>
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
                          textTransform: "capitalize"
                        }} 
                      />
                    </TableCell>
                    <TableCell>
                      <AvatarGroup max={4} sx={{ justifyContent: "flex-end" }}>
                        {task.assignedTo?.map((item, i) => {
                          const inner = item && item.member ? item.member : item;
                          return (
                            <Avatar key={inner?._id || i} sx={{ bgcolor: "#cfd3d8", color: "#555", width: 32, height: 32, fontSize: 12 }}>
                              {getInitials(inner?.fullName || inner?.email)}
                            </Avatar>
                          );
                        })}
                      </AvatarGroup>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Box sx={{ width: "100%" }}>
                          <LinearProgress 
                            variant="determinate" 
                            value={getTaskProgress(task)} 
                            sx={{ 
                              height: 6, 
                              borderRadius: 10, 
                                bgcolor: themeColors.lightGray,
                                "& .MuiLinearProgress-bar": { bgcolor: task.status === "completed" ? themeColors.red : themeColors.black }
                            }} 
                          />
                        </Box>
                        <Typography variant="caption">{getTaskProgress(task)}%</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      {new Date(task.deadline).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        {task.status !== 'completed' && (
                          <IconButton size="small" onClick={() => handleMarkComplete(task._id)} title="Mark complete">
                            <DoneIcon fontSize="small" sx={{ color: themeColors.red }} />
                          </IconButton>
                        )}
                        <IconButton size="small" color="primary">
                          <OpenIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>

        {/* Team Workload / Event Activity */}
        <Grid item xs={12} lg={5}>
          <Card sx={{ 
            borderRadius: 4,
            boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
            height: "100%"
          }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>Event Activity</Typography>
              <List>
                {tasks.slice(0, 5).map((task, i) => (
                  <React.Fragment key={i}>
                    <ListItem alignItems="flex-start">
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: task.status === "completed" ? themeColors.red : themeColors.black }}>
                          <StudentIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={task.title}
                        secondary={
                          <Typography variant="caption" color="text.secondary">
                            Assigned to {task.assignedTo?.length || 0} students • Deadline: {new Date(task.deadline).toLocaleDateString()}
                          </Typography>
                        }
                      />
                    </ListItem>
                    {i < tasks.slice(0, 5).length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default EventInsights;
