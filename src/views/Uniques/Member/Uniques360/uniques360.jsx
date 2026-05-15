import React, { useEffect, useMemo, useRef, useState } from "react";
import { Avatar, Box, Button, Chip, LinearProgress, Stack, Typography } from "@mui/material";
import { CheckCircle as CompleteIcon } from "@mui/icons-material";
import axios from "axios";
import { BASE_URL } from "@/config";
import { toast } from "react-toastify";
import { useThemeContext } from "@/theme/ThemeProvider";
import logoCommunity from "@/assets/logos/theuniquesCommunity.png";
import logoWhite from "@/assets/logos/uniqueswhite.png";
import TaskSidebar from "./components/TaskSidebar";
import ReportFeed from "./components/ReportFeed";
import ReportComposer from "./components/ReportComposer";

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
      const fetchedTasks = response.data || [];
      setTasks(fetchedTasks);
      if (fetchedTasks.length > 0 && !selectedTask) setSelectedTask(fetchedTasks[0]);
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

  const taskStatusLabel = (status) => (status === "pending" ? "todo" : status);

  const handleSubmitReport = async () => {
    if (!newReport.trim() || !selectedTask) return;
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
      fetchReports(selectedTask._id);
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
      toast.success("Project marked completed");
      fetchTasks();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Error updating status");
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", height: "80vh", gap: 3 }}>
        <Box component="img" src={isDarkMode ? logoWhite : logoCommunity} alt="logo" sx={{ height: isDarkMode ? 60 : 80 }} />
        <Box sx={{ width: 300 }}>
          <LinearProgress sx={{ height: 4, borderRadius: 2, "& .MuiLinearProgress-bar": { backgroundColor: "#ca0019" } }} />
        </Box>
        <Typography variant="caption">Loading workspace...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", height: "calc(100vh - 100px)", bgcolor: isDarkMode ? "#0b0e11" : "#f8f9fa" }}>
      <TaskSidebar tasks={tasks} selectedTask={selectedTask} onSelectTask={setSelectedTask} isDarkMode={isDarkMode} />

      <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
        {selectedTask ? (
          <>
            <Box sx={{ p: 2, borderBottom: "1px solid #eee" }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>
                    {selectedTask.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedTask.projectCategory || "General"}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", alignItems: "center" }}>
                  {selectedTask.status !== "completed" && (
                    <Button variant="contained" color="success" startIcon={<CompleteIcon />} onClick={handleMarkComplete}>
                      Complete
                    </Button>
                  )}
                  <Chip label={taskStatusLabel(selectedTask.status)} color={selectedTask.status === "completed" ? "success" : selectedTask.status === "in-progress" ? "warning" : "info"} />
                  {selectedTask.deadline && (
                    <Chip label={`Due ${new Date(selectedTask.deadline).toLocaleDateString()}`} variant="outlined" />
                  )}
                </Box>
              </Box>

              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                  Assigned members
                </Typography>
                <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                  {selectedTask.assignedTo?.length ? (
                    selectedTask.assignedTo.map((item) => {
                      const inner = item && item.member ? item.member : item;
                      const role = item && item.role ? item.role : null;
                      return (
                        <Chip
                          key={inner._id}
                          avatar={<Avatar>{inner.fullName?.[0] || "U"}</Avatar>}
                          label={`${inner.fullName}${role ? ` • ${role}` : inner.email ? ` • ${inner.email}` : ""}`}
                          variant="outlined"
                        />
                      );
                    })
                  ) : (
                    <Chip label="No members assigned" variant="outlined" />
                  )}
                </Stack>
              </Box>
            </Box>

            <ReportFeed reports={reports} reportsLoading={reportsLoading} scrollRef={scrollRef} />
            <ReportComposer selectedTask={selectedTask} newReport={newReport} setNewReport={setNewReport} progressPercent={progressPercent} setProgressPercent={setProgressPercent} sending={sending} onSubmit={handleSubmitReport} />
          </>
        ) : (
          <Box sx={{ flexGrow: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
            <Typography variant="h5">Select a Project</Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default Uniques360Member;