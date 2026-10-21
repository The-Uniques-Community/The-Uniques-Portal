import React, { useEffect, useMemo, useRef, useState } from "react";
import { Avatar, Box, Button, Chip, Grid, Paper, Typography, CircularProgress } from "@mui/material";
import CompleteIcon from '@mui/icons-material/CheckCircleOutline';
import ProjectIcon from '@mui/icons-material/FolderOutlined';
import DateIcon from '@mui/icons-material/CalendarTodayOutlined';
import axios from "axios";
import { BASE_URL } from "@/config";
import { toast } from "react-toastify";
import { useThemeContext } from "@/theme/ThemeProvider";
import logoCommunity from "@/assets/logos/theuniquesCommunity.png";
import logoWhite from "@/assets/logos/uniqueswhite.png";
import TaskSidebar from "./components/TaskSidebar";
import ReportFeed from "./components/ReportFeed";
import ReportComposer from "./components/ReportComposer";
import { WorkspaceSkeleton } from "@/components/common/skeletons";

const Uniques360Member = () => {
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [reports, setReports] = useState([]);
  const [members, setMembers] = useState([]);
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState("");
  const [newReport, setNewReport] = useState("");
  const [progressPercent, setProgressPercent] = useState("");
  const [loading, setLoading] = useState(true);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);
  const { isDarkMode } = useThemeContext();

  const fetchMembers = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/admin/member`, { withCredentials: true });
      const allMembers = response.data?.data || [];
      setMembers(allMembers);
      const uniqueBatches = [...new Set(allMembers.map((m) => m.batch).filter(Boolean))].sort();
      setBatches(uniqueBatches);
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Error fetching members");
    }
  };

  const fetchTasks = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/uniques360/tasks/member/me`, { withCredentials: true });
      const fetchedTasks = Array.isArray(response.data) ? response.data : [];
      setTasks(fetchedTasks);
      if (fetchedTasks.length > 0) {
        setSelectedTask((current) => {
          if (!current) return fetchedTasks[0];
          return fetchedTasks.find((task) => task._id === current._id) || fetchedTasks[0];
        });
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Error fetching tasks");
    }
  };

  const fetchReports = async (taskId) => {
    try {
      setReportsLoading(true);
      const response = await axios.get(`${BASE_URL}/api/uniques360/reports/task/${taskId}`, { withCredentials: true });
      setReports(response.data || []);
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Error fetching reports");
    } finally {
      setReportsLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        await Promise.all([fetchTasks(), fetchMembers()]);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (selectedTask?._id) fetchReports(selectedTask._id);
  }, [selectedTask]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [reports]);

  const availableMembers = useMemo(() => {
    return members
      .filter((m) => !selectedBatch || m.batch === selectedBatch)
      .filter((m) => !selectedTask?.assignedTo?.some((at) => ((at.member && at.member._id) || at._id) === m._id));
  }, [members, selectedBatch, selectedTask]);

  const taskStatusLabel = (status) => (status === "pending" ? "Pending" : status);

  const handleSubmitReport = async () => {
    if ((!newReport.trim() && progressPercent === "") || !selectedTask) return;
    try {
      setSending(true);
      await axios.post(
        `${BASE_URL}/api/uniques360/reports`,
        { taskId: selectedTask._id, reportContent: newReport, progressPercent },
        { withCredentials: true }
      );
      toast.success("Daily report submitted");
      setNewReport("");
      setProgressPercent("");
      await Promise.all([fetchReports(selectedTask._id), fetchTasks()]);
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Error submitting report");
    } finally {
      setSending(false);
    }
  };

  const handleMarkComplete = async () => {
    if (!selectedTask) return;
    try {
      await axios.patch(
        `${BASE_URL}/api/uniques360/tasks/${selectedTask._id}`,
        { status: "completed" },
        { withCredentials: true }
      );
      toast.success("Task marked completed");
      setSelectedTask((prev) => (prev ? { ...prev, status: "completed" } : prev));
      setTasks((prev) => prev.map((t) => (t._id === selectedTask._id ? { ...t, status: "completed" } : t)));
      fetchTasks();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Error updating status");
    }
  };

  if (loading) {
    return <WorkspaceSkeleton />;
  }

  // Define reactive styling conditions based on current selected status configurations
  const getStatusColor = (status) => {
    switch (status) {
      case "completed": return "#16a34a";
      case "in-progress": return "#f59e0b";
      default: return isDarkMode ? "#ff5252" : "#ca0019";
    }
  };

  return (
    <Grid 
      container 
      sx={{ 
        height: "calc(100vh - 100px)", 
        bgcolor: "background.default",
        overflow: "hidden"
      }}
    >
      {/* Sidebar Navigation Panel Container */}
      <Grid 
        item 
        xs={12} 
        md={3} 
        sx={{ 
          height: "100%",
          display: "flex",
          flexDirection: "column",
          borderRight: "1px solid", 
          borderColor: "divider",
          zIndex: 5
        }}
      >
        <TaskSidebar tasks={tasks} selectedTask={selectedTask} onSelectTask={setSelectedTask} />
      </Grid>

      {/* Main Workspace Frame Panel */}
      <Grid 
        item 
        xs={12} 
        md={9} 
        sx={{ 
          display: "flex", 
          flexDirection: "column", 
          height: "100%",
          backgroundColor: "background.default"
        }}
      >
        {selectedTask ? (
          <Paper
            elevation={0}
            sx={{ 
              flexGrow: 1, 
              display: "flex", 
              flexDirection: "column", 
              m: { xs: 1.5, md: 3 }, 
              borderRadius: "14px", 
              overflow: "hidden",
              border: "1px solid",
              borderColor: "divider",
              backgroundColor: "background.default"
            }}
          >
            {/* Context Workspace Active Heading Row */}
            <Box 
              sx={{ 
                p: 2.5, 
                borderBottom: "1px solid", 
                borderColor: "divider",
                backgroundColor: "background.paper"
              }}
            >
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 2, flexWrap: "wrap", mb: 2 }}>
                <Box>
                  <Typography 
                    variant="h5" 
                    sx={{ 
                      fontWeight: 700, 
                      fontSize: "20px",
                      letterSpacing: "-0.2px",
                      color: "text.primary",
                      mb: 0.5
                    }}
                  >
                    {selectedTask.title}
                  </Typography>
                  
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                    <ProjectIcon sx={{ fontSize: 14, color: "text.subtext" }} />
                    <Typography variant="body2" sx={{ color: "text.secondary", fontSize: "13px", fontWeight: 500 }}>
                      {selectedTask.projectCategory || "General Scope"}
                    </Typography>
                  </Box>
                </Box>

                {/* Main Heading Status & CTA Actions */}
                <Box sx={{ display: "flex", gap: 1.25, flexWrap: "wrap", alignItems: "center" }}>
                  {selectedTask.status !== "completed" && (
                    <Button 
                      variant="outlined" 
                      startIcon={<CompleteIcon sx={{ fontSize: 16 }} />} 
                      onClick={handleMarkComplete}
                      sx={{
                        height: "32px",
                        fontSize: "12.5px",
                        fontWeight: 600,
                        borderRadius: "6px",
                        textTransform: "none",
                        color: "text.primary",
                        borderColor: "divider",
                        backgroundColor: "background.default",
                        transition: "all 0.15s ease-in-out",
                        "&:hover": {
                          backgroundColor: "action.hover",
                          borderColor: "action.disabled"
                        }
                      }}
                    >
                      Mark Complete
                    </Button>
                  )}

                  {/* Status Capsule Label Badge */}
                  <Box 
                    sx={{ 
                      display: "inline-flex", 
                      alignItems: "center", 
                      gap: 0.75,
                      px: 1.25, 
                      height: "32px",
                      borderRadius: "6px", 
                      backgroundColor: "background.default",
                      border: "1px solid",
                      borderColor: "divider"
                    }}
                  >
                    <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: getStatusColor(selectedTask.status) }} />
                    <Typography variant="caption" sx={{ fontSize: "11.5px", color: "text.primary", fontWeight: 600, textTransform: "capitalize" }}>
                      {taskStatusLabel(selectedTask.status)}
                    </Typography>
                  </Box>

                  {/* Progress Indicator Percentage Pill */}
                  {typeof selectedTask.progressPercent === "number" && (
                    <Chip 
                      label={`${selectedTask.progressPercent}% Active Progress`} 
                      size="small"
                      sx={{ 
                        height: "32px",
                        fontSize: "11.5px",
                        fontWeight: 600,
                        borderRadius: "6px",
                        backgroundColor: "action.focus",
                        color: isDarkMode ? "text.link" : "primary.main",
                        border: "1px solid transparent"
                      }}
                    />
                  )}

                  {/* Due Date Indicator Badge */}
                  {selectedTask.deadline && (
                    <Box 
                      sx={{ 
                        display: "inline-flex", 
                        alignItems: "center", 
                        gap: 0.75,
                        px: 1.25, 
                        height: "32px",
                        borderRadius: "6px", 
                        backgroundColor: "background.default",
                        border: "1px solid",
                        borderColor: "divider",
                        color: "text.secondary"
                      }}
                    >
                      <DateIcon sx={{ fontSize: 13, color: "text.subtext" }} />
                      <Typography variant="caption" sx={{ fontSize: "11.5px", fontWeight: 500 }}>
                        Due {new Date(selectedTask.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>

              {/* Sub-Header Section: Assigned Coworkers / Team members layout */}
              <Box sx={{ mt: 2, pt: 1.5, borderTop: "1px dashed", borderColor: "divider" }}>
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", alignItems: "center" }}>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: "text.subtext", textTransform: "uppercase", letterSpacing: "0.5px", mr: 1 }}>
                    Assignees:
                  </Typography>

                  {selectedTask.assignedTo?.length ? (
                    selectedTask.assignedTo.map((item) => {
                      const inner = item && item.member ? item.member : item;
                      const role = item && item.role ? item.role : null;
                      return (
                        <Chip
                          key={inner._id}
                          avatar={
                            <Avatar sx={{ "&.MuiAvatar-root": { width: 18, height: 18, fontSize: "9px", fontWeight: 700, bgcolor: "background.drawer", color: "primary.main" } }}>
                              {inner.fullName?.[0]?.toUpperCase() || "U"}
                            </Avatar>
                          }
                          label={`${inner.fullName}${role ? ` (${role})` : ""}`}
                          variant="outlined"
                          sx={{
                            height: "24px",
                            borderRadius: "4px",
                            fontSize: "11.5px",
                            borderColor: "divider",
                            color: "text.secondary",
                            backgroundColor: "background.default",
                            "& .MuiChip-label": { px: 1 }
                          }}
                        />
                      );
                    })
                  ) : (
                    <Typography variant="caption" sx={{ color: "text.subtext", fontStyle: "italic" }}>
                      No active assignees on this card
                    </Typography>
                  )}
                </Box>
              </Box>
            </Box>

            {/* Core Activity Feed Content Stream */}
            <Box sx={{ flexGrow: 1, overflowY: "auto", backgroundColor: "background.default" }}>
              <ReportFeed reports={reports} reportsLoading={reportsLoading} scrollRef={scrollRef} />
            </Box>

            {/* Dedicated Input Text Editor / Composer Base */}
            <ReportComposer
              selectedTask={selectedTask}
              newReport={newReport}
              setNewReport={setNewReport}
              progressPercent={progressPercent}
              setProgressPercent={setProgressPercent}
              sending={sending}
              onSubmit={handleSubmitReport}
            />
          </Paper>
        ) : (
          /* Empty Workspace Default Placeholder Context Screen */
          <Box 
            sx={{ 
              flexGrow: 1, 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center", 
              flexDirection: "column",
              backgroundColor: "background.default",
              gap: 1.5
            }}
          >
            <Box 
              sx={{ 
                p: 2.5, 
                borderRadius: "50%", 
                backgroundColor: "action.hover",
                border: "1px solid",
                borderColor: "divider",
                mb: 1
              }}
            >
              <ProjectIcon sx={{ fontSize: 32, color: "text.subtext" }} />
            </Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "text.primary" }}>
              No Project Active
            </Typography>
            <Typography variant="body2" sx={{ color: "text.subtext", maxWidth: 280, textAlign: "center", fontSize: "13.5px" }}>
              Select an item assignment thread from the left navigation terminal list to review status reports.
            </Typography>
          </Box>
        )}
      </Grid>
    </Grid>
  );
};

export default Uniques360Member;