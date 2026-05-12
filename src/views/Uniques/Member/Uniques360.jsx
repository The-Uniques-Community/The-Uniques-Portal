import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Box,
  Typography,
  Paper,
  Divider,
  Avatar,
  TextField,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  LinearProgress,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
} from "@mui/material";
import {
  Send as SendIcon,
  AttachFile as AttachIcon,
  Tag as TagIcon,
  Assignment as TaskIcon,
  History as HistoryIcon,
  PersonAdd as PersonAddIcon,
  Group as GroupIcon,
  Info as InfoIcon,
  Delete as RemoveIcon,
  CheckCircle as CompleteIcon,
  Close as CloseIcon
} from "@mui/icons-material";
import axios from "axios";
import { BASE_URL } from "@/config";
import { toast } from "react-toastify";
import { useThemeContext } from "@/theme/ThemeProvider";
import logoCommunity from "@/assets/logos/theuniquesCommunity.png";
import logoWhite from "@/assets/logos/uniqueswhite.png";

const Uniques360Member = () => {
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [reports, setReports] = useState([]);
  const [members, setMembers] = useState([]);
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState("");
  const [newReport, setNewReport] = useState("");
  const [loading, setLoading] = useState(true);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [addTeammateOpen, setAddTeammateOpen] = useState(false);
  const [selectedTeammate, setSelectedTeammate] = useState("");
  const [taskInfoOpen, setTaskInfoOpen] = useState(false);
  const [manageTeamOpen, setManageTeamOpen] = useState(false);
  const scrollRef = useRef(null);

  const fetchMembers = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/admin/member`, {
        withCredentials: true,
      });
      const allMembers = response.data.data || [];
      setMembers(allMembers);
      
      // Extract unique batches
      const uniqueBatches = [...new Set(allMembers.map(m => m.batch).filter(Boolean))].sort();
      setBatches(uniqueBatches);
    } catch (error) {
      console.error("Error fetching members:", error);
    }
  };

  const fetchTasks = async () => {
    try {
      // Need a way to get current member ID or just a general 'my tasks' endpoint
      const response = await axios.get(`${BASE_URL}/api/uniques360/tasks/member/me`, {
        withCredentials: true,
      });
      setTasks(response.data);
      if (response.data.length > 0) {
        setSelectedTask(response.data[0]);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  const fetchReports = async (taskId) => {
    try {
      setReportsLoading(true);
      const response = await axios.get(`${BASE_URL}/api/uniques360/reports/task/${taskId}`, {
        withCredentials: true,
      });
      setReports(response.data);
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setReportsLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchTasks(), fetchMembers()]);
      setLoading(false);
    };
    init();
  }, []);

  useEffect(() => {
    if (selectedTask) {
      fetchReports(selectedTask._id);
    }
  }, [selectedTask]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [reports]);

  const handleSubmitReport = async () => {
    if (!newReport.trim() || !selectedTask) return;

    try {
      const response = await axios.post(`${BASE_URL}/api/uniques360/reports`, {
        taskId: selectedTask._id,
        reportContent: newReport,
      }, {
        withCredentials: true,
      });
      toast.success("Daily report submitted");
      setNewReport("");
      fetchReports(selectedTask._id);
    } catch (error) {
      toast.error("Error submitting report");
    }
  };

  const handleAddTeammate = async () => {
    if (!selectedTeammate || !selectedTask) return;

    try {
      await axios.post(`${BASE_URL}/api/uniques360/tasks/${selectedTask._id}/members`, {
        newMemberId: selectedTeammate
      }, {
        withCredentials: true,
      });
      toast.success("Teammate added successfully");
      setAddTeammateOpen(false);
      setSelectedTeammate("");
      setSelectedBatch("");
      fetchTasks(); // Refresh to show new team members
    } catch (error) {
      toast.error(error.response?.data?.message || "Error adding teammate");
    }
  };

  const handleRemoveTeammate = async (memberId) => {
    if (!selectedTask) return;
    try {
      await axios.post(`${BASE_URL}/api/uniques360/tasks/${selectedTask._id}/members/remove`, {
        memberIdToRemove: memberId
      }, {
        withCredentials: true,
      });
      toast.success("Teammate removed");
      fetchTasks();
      // Update local state
      setSelectedTask(prev => ({
        ...prev,
        assignedTo: prev.assignedTo.filter(m => m._id !== memberId)
      }));
    } catch (error) {
      toast.error("Error removing teammate");
    }
  };

  const handleMarkComplete = async () => {
    if (!selectedTask) return;
    try {
      await axios.patch(`${BASE_URL}/api/uniques360/tasks/${selectedTask._id}`, {
        status: "completed"
      }, {
        withCredentials: true,
      });
      toast.success("Project marked as completed!");
      fetchTasks();
    } catch (error) {
      toast.error("Error updating status");
    }
  };

  const { isDarkMode } = useThemeContext();

  if (loading) return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column',
      justifyContent: 'center', 
      alignItems: 'center',
      height: '80vh',
      gap: 3
    }}>
      <Box 
        component="img" 
        src={isDarkMode ? logoWhite : logoCommunity} 
        alt="The Uniques Logo"
        sx={{ height: isDarkMode ? 60 : 80, mb: 1 }}
      />
      <Box sx={{ width: '300px' }}>
        <LinearProgress sx={{ 
          height: 3, 
          borderRadius: 1,
          bgcolor: isDarkMode ? "#333" : "#f0f0f0",
          "& .MuiLinearProgress-bar": { bgcolor: "#ca0019" }
        }} />
      </Box>
      <Typography variant="caption" sx={{ color: "text.secondary", letterSpacing: 1, fontWeight: "medium" }}>
        Please wait while we prepare your workspace...
      </Typography>
    </Box>
  );

  return (
    <Box sx={{ 
      display: "flex", 
      height: "calc(100vh - 100px)", 
      bgcolor: isDarkMode ? "#0b0e11" : "#f8f9fa", 
      borderRadius: 4, 
      overflow: "hidden", 
      border: "1px solid",
      borderColor: isDarkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
      boxShadow: "0 8px 32px rgba(0,0,0,0.1)"
    }}>
      {/* Premium Sidebar */}
      <Box sx={{ 
        width: 300, 
        bgcolor: isDarkMode ? "#1a1d21" : "#3f0e40", 
        color: "white", 
        display: "flex", 
        flexDirection: "column",
        borderRight: "1px solid rgba(255,255,255,0.05)"
      }}>
        <Box sx={{ p: 3, borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
          <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: -0.5, color: "#fff" }}>Uniques 360</Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}>
            <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "#44b700", boxShadow: "0 0 10px #44b700" }} />
            <Typography variant="caption" sx={{ opacity: 0.7, fontWeight: 500 }}>Active Workspace</Typography>
          </Box>
        </Box>
        
        <Box sx={{ flexGrow: 1, overflowY: "auto", p: 1.5 }}>
          <Typography variant="overline" sx={{ px: 2, opacity: 0.5, fontSize: "0.7rem", fontWeight: 700, letterSpacing: 1.5 }}>
            MY PROJECTS
          </Typography>
          <List sx={{ mt: 1 }}>
            <AnimatePresence mode="popLayout">
              {tasks.map((task, index) => (
                <motion.div
                  key={task._id}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <ListItemButton
                    onClick={() => setSelectedTask(task)}
                    sx={{
                      borderRadius: 2,
                      mb: 0.5,
                      bgcolor: selectedTask?._id === task._id ? "rgba(255,255,255,0.1)" : "transparent",
                      color: "white",
                      "&:hover": { 
                        bgcolor: "rgba(255,255,255,0.05)",
                        transform: "translateX(4px)"
                      },
                      transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 36, color: "inherit", opacity: selectedTask?._id === task._id ? 1 : 0.6 }}>
                      <TagIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                      primary={task.title} 
                      primaryTypographyProps={{ 
                        sx: { 
                          fontSize: "0.85rem", 
                          fontWeight: selectedTask?._id === task._id ? 700 : 500,
                          whiteSpace: "nowrap", 
                          overflow: "hidden", 
                          textOverflow: "ellipsis",
                          opacity: selectedTask?._id === task._id ? 1 : 0.8
                        } 
                      }} 
                    />
                  </ListItemButton>
                </motion.div>
              ))}
            </AnimatePresence>
          </List>
        </Box>
      </Box>

      {/* Modern Main Content */}
      <Box sx={{ 
        flexGrow: 1, 
        display: "flex", 
        flexDirection: "column", 
        bgcolor: isDarkMode ? "#0b0e11" : "#ffffff",
        position: "relative"
      }}>
        {selectedTask ? (
          <>
            {/* Glassmorphic Header */}
            <Box sx={{ 
              p: 2, 
              borderBottom: "1px solid",
              borderColor: isDarkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "center",
              bgcolor: isDarkMode ? "rgba(11, 14, 17, 0.8)" : "rgba(255, 255, 255, 0.8)",
              backdropFilter: "blur(12px)",
              zIndex: 10
            }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <IconButton 
                    size="small" 
                    onClick={() => setTaskInfoOpen(true)} 
                    title="Task Info"
                    sx={{ bgcolor: isDarkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)" }}
                  >
                    <InfoIcon fontSize="small" color="primary" />
                  </IconButton>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, letterSpacing: -0.5 }}># {selectedTask.title}</Typography>
                </Box>
                <Divider orientation="vertical" flexItem sx={{ my: 1, opacity: 0.1 }} />
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Button 
                    size="small" 
                    startIcon={<GroupIcon />} 
                    onClick={() => setManageTeamOpen(true)}
                    sx={{ 
                      textTransform: "none", 
                      color: "text.secondary",
                      fontWeight: 600,
                      px: 1.5,
                      borderRadius: 2,
                      "&:hover": { bgcolor: "rgba(0,0,0,0.03)" }
                    }}
                  >
                    Team ({selectedTask.assignedTo?.length || 0})
                  </Button>
                  <IconButton 
                    size="small" 
                    onClick={() => setAddTeammateOpen(true)}
                    sx={{ color: "primary.main", bgcolor: "primary.lighter", "&:hover": { bgcolor: "primary.light" } }}
                  >
                    <PersonAddIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                {selectedTask.status !== "completed" && (
                  <Button 
                    variant="contained" 
                    size="small" 
                    color="success" 
                    startIcon={<CompleteIcon />}
                    onClick={handleMarkComplete}
                    sx={{ 
                      textTransform: "none", 
                      fontWeight: 700,
                      borderRadius: 2,
                      boxShadow: "0 4px 12px rgba(46, 125, 50, 0.2)"
                    }}
                  >
                    Complete
                  </Button>
                )}
                <Chip 
                  label={selectedTask.status} 
                  size="small" 
                  color={selectedTask.status === "completed" ? "success" : "warning"} 
                  sx={{ fontWeight: 700, borderRadius: 1.5, px: 1 }}
                />
              </Box>
            </Box>

            {/* Premium Reports Feed */}
            <Box 
              ref={scrollRef} 
              sx={{ 
                flexGrow: 1, 
                overflowY: "auto", 
                p: 3, 
                display: "flex", 
                flexDirection: "column-reverse", 
                gap: 2,
                bgcolor: isDarkMode ? "#0b0e11" : "#fdfdfd"
              }}
            >
              {reportsLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress size={24} /></Box>
              ) : reports.length > 0 ? (
                <AnimatePresence mode="popLayout">
                  {reports.map((report, index) => (
                    <motion.div
                      key={report._id}
                      initial={{ y: 20, opacity: 0, scale: 0.95 }}
                      animate={{ y: 0, opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                    >
                      <Box sx={{ display: "flex", gap: 2, p: 1, borderRadius: 3, "&:hover": { bgcolor: isDarkMode ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.01)" }, transition: "background 0.2s" }}>
                        <Avatar sx={{ 
                          width: 40, 
                          height: 40, 
                          bgcolor: "#ca0019", 
                          boxShadow: "0 4px 10px rgba(202, 0, 25, 0.2)",
                          fontSize: "0.9rem",
                          fontWeight: "bold"
                        }}>
                          {report.studentId?.fullName?.[0] || "U"}
                        </Avatar>
                        <Box sx={{ flexGrow: 1 }}>
                          <Box sx={{ display: "flex", alignItems: "baseline", gap: 1, mb: 0.5 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: isDarkMode ? "#fff" : "#1d1c1d" }}>
                              {report.studentId?.fullName || "Team Member"}
                            </Typography>
                            <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 500 }}>
                              {new Date(report.submissionDate).toLocaleString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                            </Typography>
                          </Box>
                          <Paper 
                            elevation={0}
                            sx={{ 
                              p: 2, 
                              borderRadius: 3, 
                              bgcolor: isDarkMode ? "#1a1d21" : "#f1f1f1",
                              borderTopLeftRadius: 0,
                              maxWidth: "fit-content",
                              border: "1px solid",
                              borderColor: isDarkMode ? "rgba(255,255,255,0.05)" : "transparent"
                            }}
                          >
                            <Typography variant="body2" sx={{ color: isDarkMode ? "#e1e1e1" : "#1d1c1d", lineHeight: 1.6, fontWeight: 500 }}>
                              {report.reportContent}
                            </Typography>
                          </Paper>
                        </Box>
                      </Box>
                    </motion.div>
                  ))}
                </AnimatePresence>
              ) : (
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexGrow: 1, opacity: 0.3 }}>
                  <HistoryIcon sx={{ fontSize: 80, mb: 2 }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>No Updates Yet</Typography>
                  <Typography variant="body2">Be the first to share progress on this project.</Typography>
                </Box>
              )}
            </Box>

            {/* Immersive Input Area */}
            <Box sx={{ p: 3, bgcolor: isDarkMode ? "#0b0e11" : "#ffffff", borderTop: "1px solid", borderColor: isDarkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)" }}>
              <Paper
                elevation={0}
                sx={{
                  p: "4px 8px",
                  display: "flex",
                  alignItems: "flex-end",
                  borderRadius: 3,
                  border: "1.5px solid",
                  borderColor: isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
                  bgcolor: isDarkMode ? "#1a1d21" : "#fdfdfd",
                  transition: "all 0.2s ease-in-out",
                  "&:focus-within": {
                    borderColor: "#ca0019",
                    boxShadow: "0 0 0 3px rgba(202, 0, 25, 0.1)"
                  }
                }}
              >
                <IconButton sx={{ p: 1.5, color: "text.secondary" }} aria-label="attach">
                  <AttachIcon fontSize="small" />
                </IconButton>
                <TextField
                  sx={{ ml: 1, flex: 1, pb: 1 }}
                  placeholder={`Share progress on #${selectedTask.title}...`}
                  variant="standard"
                  InputProps={{ 
                    disableUnderline: true,
                    sx: { fontSize: "0.95rem", fontWeight: 500, py: 1.5 }
                  }}
                  value={newReport}
                  onChange={(e) => setNewReport(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmitReport();
                    }
                  }}
                  multiline
                  maxRows={6}
                />
                <IconButton 
                  color="primary" 
                  sx={{ 
                    p: 1.5, 
                    mb: 0.5,
                    color: newReport.trim() ? "#ca0019" : "text.disabled",
                    transition: "transform 0.2s",
                    "&:hover": { transform: newReport.trim() ? "translateY(-2px)" : "none" }
                  }} 
                  onClick={handleSubmitReport}
                  disabled={!newReport.trim()}
                >
                  <SendIcon fontSize="small" />
                </IconButton>
              </Paper>
              <Box sx={{ mt: 1, px: 1, display: "flex", justifyContent: "space-between" }}>
                <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 500, fontSize: "0.7rem" }}>
                  <b>Enter</b> to send • <b>Shift+Enter</b> for new line
                </Typography>
                <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 700, fontSize: "0.7rem", opacity: 0.5 }}>
                  {newReport.length} characters
                </Typography>
              </Box>
            </Box>
          </>
        ) : (
          <Box sx={{ 
            display: "flex", 
            flexDirection: "column", 
            alignItems: "center", 
            justifyContent: "center", 
            height: "100%",
            background: isDarkMode ? "radial-gradient(circle at center, #1a1d21 0%, #0b0e11 100%)" : "radial-gradient(circle at center, #ffffff 0%, #f8f9fa 100%)"
          }}>
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
            >
              <TaskIcon sx={{ fontSize: 100, color: "primary.main", opacity: 0.2, mb: 3 }} />
              <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: -0.5, mb: 1 }}>Welcome to Uniques 360</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>Select a project from the sidebar to start collaborating.</Typography>
            </motion.div>
          </Box>
        )}
      </Box>

      {/* Add Teammate Modal */}
      <Dialog open={addTeammateOpen} onClose={() => setAddTeammateOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: "bold" }}>Add Project Teammate</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Add another member to work with you on <b>#{selectedTask?.title}</b>.
            </Typography>
            <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Filter by Batch</InputLabel>
                <Select
                  value={selectedBatch}
                  label="Filter by Batch"
                  onChange={(e) => {
                    setSelectedBatch(e.target.value);
                    setSelectedTeammate(""); // Reset selected member when batch changes
                  }}
                >
                  <MenuItem value="">All Batches</MenuItem>
                  {batches.map((batch) => (
                    <MenuItem key={batch} value={batch}>{batch}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Select Member</InputLabel>
                <Select
                  value={selectedTeammate}
                  label="Select Member"
                  onChange={(e) => setSelectedTeammate(e.target.value)}
                  disabled={!members.length}
                >
                  {members
                    .filter(m => !selectedBatch || m.batch === selectedBatch) // Filter by batch
                    .filter(m => !selectedTask?.assignedTo?.some(at => at._id === m._id)) // Filter out already assigned
                    .map((member) => (
                      <MenuItem key={member._id} value={member._id}>
                        {member.fullName} ({member.admno || "No ID"})
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddTeammateOpen(false)}>Cancel</Button>
          <Button onClick={handleAddTeammate} variant="contained" sx={{ bgcolor: "#3f0e40" }} disabled={!selectedTeammate}>
            Add Member
          </Button>
        </DialogActions>
      </Dialog>

      {/* Task Info Dialog */}
      <Dialog open={taskInfoOpen} onClose={() => setTaskInfoOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: "bold", borderBottom: 1, borderColor: "divider", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          Task Details
          <IconButton onClick={() => setTaskInfoOpen(false)} size="small"><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent sx={{ py: 2 }}>
          <Typography variant="h6" gutterBottom color="primary" sx={{ fontWeight: "bold" }}>{selectedTask?.title}</Typography>
          <Box sx={{ mb: 3 }}>
            <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", fontWeight: "bold" }}>Description</Typography>
            <Typography variant="body1" sx={{ mt: 0.5, whiteSpace: "pre-line" }}>{selectedTask?.description || "No description provided."}</Typography>
          </Box>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", fontWeight: "bold" }}>Deadline</Typography>
              <Typography variant="body2" sx={{ mt: 0.5 }}>{selectedTask?.deadline ? new Date(selectedTask.deadline).toLocaleDateString() : "No deadline"}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", fontWeight: "bold" }}>Priority</Typography>
              <Box sx={{ mt: 0.5 }}>
                <Chip label={selectedTask?.priority} size="small" color={selectedTask?.priority === "high" ? "error" : "default"} />
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTaskInfoOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Manage Team Dialog */}
      <Dialog open={manageTeamOpen} onClose={() => setManageTeamOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: "bold" }}>Project Team Members</DialogTitle>
        <DialogContent>
          <List>
            {selectedTask?.assignedTo?.map((member) => (
              <ListItem key={member._id} secondaryAction={
                <IconButton 
                  edge="end" 
                  color="error" 
                  onClick={() => handleRemoveTeammate(member._id)}
                  disabled={selectedTask.assignedTo.length <= 1}
                >
                  <RemoveIcon fontSize="small" />
                </IconButton>
              }>
                <ListItemText primary={member.fullName} secondary={member.email} />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setManageTeamOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Uniques360Member;
