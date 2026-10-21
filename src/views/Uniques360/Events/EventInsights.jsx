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
  useTheme,
} from "@mui/material";
import ModernTable from "@/components/tables/ModernTable";
import ModernHeader from "@/components/headers/ModernHeader";
import { EventInsightsSkeleton } from "@/components/common/skeletons";
import EventIcon from '@mui/icons-material/Event';
import TimelineIcon from '@mui/icons-material/Schedule';
import StudentIcon from '@mui/icons-material/People';
import UrgencyIcon from '@mui/icons-material/Warning';
import DoneIcon from '@mui/icons-material/CheckCircle';
import OpenIcon from '@mui/icons-material/Launch';
import axios from "axios";
import { BASE_URL } from "@/config";
import { toast } from "react-toastify";

const BRAND_COLOR = "#ca0019";

const EventInsights = () => {
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
      toast.error(error.response?.data?.message || "Failed to mark task completed");
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
      case "high": return BRAND_COLOR;
      case "medium": return "text.primary";
      default: return "text.secondary";
    }
  };

  const getTaskProgress = (task) => {
    if (typeof task.progressPercent === "number") return task.progressPercent;
    switch (task.status) {
      case "completed": return 100;
      case "in-progress": return 50;
      default: return 10;
    }
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
    return <EventInsightsSkeleton />;
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, minHeight: "100vh", bgcolor: "background.default" }}>
      <ModernHeader
        title="Event Analytics"
        highlight="Engine"
        subtitle="Real-time metrics, milestones, and deployment health tracking for active operational event vectors."
      />

      {/* Stats Matrix Grid */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        {[
          { title: "Total Event Tasks", value: stats.total, icon: <EventIcon />, color: BRAND_COLOR },
          { title: "Upcoming Tasks", value: stats.upcoming, icon: <TimelineIcon />, color: "#FFA500" },
          { title: "Completed Milestones", value: stats.completed, icon: <DoneIcon />, color: "#4CAF50" },
          { title: "Urgent Hotspots", value: stats.urgent, icon: <UrgencyIcon />, color: BRAND_COLOR },
        ].map((stat, index) => (
          <Grid item xs={6} md={3} key={index}>
            <Card sx={{ 
              borderRadius: "12px",
              boxShadow: "none",
              border: "1px solid",
              borderColor: "divider",
              borderLeft: `5px solid ${stat.color}`,
              bgcolor: "background.paper"
            }}>
              <CardContent sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", p: 2.5, "&:last-child": { pb: 2.5 } }}>
                <Box>
                  <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    {stat.title}
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5, color: "text.primary" }}>
                    {stat.value}
                  </Typography>
                </Box>
                <Box sx={{ 
                  p: 1.25, 
                  borderRadius: "8px", 
                  bgcolor: "action.hover", 
                  color: stat.color,
                  display: "flex",
                  alignItems: "center"
                }}>
                  {stat.icon}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Main Workspace Configuration Layout */}
      <Grid container spacing={3}>
        {/* Core Task Registry View */}
        <Grid item xs={12} lg={7}>
          <ModernTable
            loading={loading}
            title="Active Event Matrix Stream"
            columns={[
              { id: "title", label: "EVENT OPERATIONAL LOG" },
              { id: "priority", label: "PRIORITY" },
              { id: "team", label: "TEAM", align: "right" },
              { id: "progress", label: "PROGRESS" },
              { id: "deadline", label: "DEADLINE" },
              { id: "actions", label: "ACTIONS", align: "right" },
            ]}
            data={tasks}
            renderRow={(task) => (
              <>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary" }}>{task.title}</Typography>
                  <Typography variant="caption" sx={{ color: "text.secondary" }}>{task.projectCategory || "General Namespace"}</Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={task.priority}
                    size="small"
                    sx={{
                      fontWeight: 700,
                      fontSize: "11px",
                      borderRadius: "4px",
                      bgcolor: "action.selected",
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
                        <Avatar key={inner?._id || i} sx={{ bgcolor: "action.selected", color: "text.primary", width: 28, height: 28, fontSize: "10px", fontWeight: 700, border: "2px solid var(--mui-palette-background-paper) !important" }}>
                          {getInitials(inner?.fullName || inner?.email)}
                        </Avatar>
                      );
                    })}
                  </AvatarGroup>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: "100px" }}>
                    <Box sx={{ width: "100%" }}>
                      <LinearProgress
                        variant="determinate"
                        value={getTaskProgress(task)}
                        sx={{
                          height: 5,
                          borderRadius: 4,
                          bgcolor: "action.hover",
                          "& .MuiLinearProgress-bar": { bgcolor: task.status === "completed" ? "#4CAF50" : BRAND_COLOR }
                        }}
                      />
                    </Box>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: "text.primary" }}>{getTaskProgress(task)}%</Typography>
                  </Box>
                </TableCell>
                <TableCell sx={{ fontSize: "13px", color: "text.secondary", fontWeight: 500 }}>
                  {new Date(task.deadline).toLocaleDateString()}
                </TableCell>
                <TableCell align="right">
                  <Box sx={{ display: 'flex', gap: 0.5, justifyContent: "flex-end" }}>
                    {task.status !== 'completed' && (
                      <IconButton size="small" onClick={() => handleMarkComplete(task._id)} title="Mark complete" sx={{ color: "success.main", "&:hover": { bgcolor: "action.hover" } }}>
                        <DoneIcon fontSize="small" />
                      </IconButton>
                    )}
                    <IconButton size="small" color="primary" sx={{ "&:hover": { bgcolor: "action.hover" } }}>
                      <OpenIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </TableCell>
              </>
            )}
          />
        </Grid>

        {/* Real-time Task Activity Roster Stream */}
        <Grid item xs={12} lg={5}>
          <Card sx={{ 
            borderRadius: "14px",
            boxShadow: "none",
            border: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
            height: "100%"
          }}>
            <Box sx={{ p: 2.5, borderBottom: "1px solid", borderColor: "divider" }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "text.primary" }}>
                Live Stream Manifest
              </Typography>
            </Box>
            <CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
              <List disablePadding>
                {tasks.slice(0, 6).map((task, i) => (
                  <React.Fragment key={task._id || i}>
                    <ListItem sx={{ py: 1.75, px: 2.5, "&:hover": { bgcolor: "action.hover" } }}>
                      <ListItemAvatar>
                        <Avatar sx={{ 
                          width: 36, 
                          height: 36, 
                          bgcolor: task.status === "completed" ? "success.soft" : "action.selected", 
                          color: task.status === "completed" ? "success.main" : BRAND_COLOR 
                        }}>
                          <StudentIcon sx={{ fontSize: "18px" }} />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={task.title}
                        secondary={`Assigned Members: ${task.assignedTo?.length || 0} allocation vectors • Cutoff: ${new Date(task.deadline).toLocaleDateString()}`}
                        primaryTypographyProps={{ sx: { fontWeight: 600, fontSize: "14px", color: "text.primary" } }}
                        secondaryTypographyProps={{ sx: { fontSize: "12px", color: "text.secondary", mt: 0.25 } }}
                      />
                    </ListItem>
                    {i < Math.min(tasks.length, 6) - 1 && <Divider />}
                  </React.Fragment>
                ))}
                {tasks.length === 0 && (
                  <Box sx={{ py: 6, textAlign: "center", color: "text.secondary", fontWeight: 500 }}>
                    No operations streaming.
                  </Box>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default EventInsights;
