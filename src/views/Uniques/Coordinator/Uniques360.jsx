import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Grid,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  CircularProgress,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  Avatar,
  Divider,
  Card,
  CardContent,
} from "@mui/material";
import { 
  Add as AddIcon, 
  Visibility as ViewIcon, 
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CompleteIcon,
  People as TeamIcon,
  Close as CloseIcon,
  History as HistoryIcon,
  Assignment as ProjectIcon,
  Timeline as TimelineIcon
} from "@mui/icons-material";
import axios from "axios";
import { BASE_URL } from "@/config";
import { toast } from "react-toastify";
import { useThemeContext } from "@/theme/ThemeProvider";
import logoCommunity from "@/assets/logos/theuniquesCommunity.png";
import logoWhite from "@/assets/logos/uniqueswhite.png";

const Uniques360Coordinator = () => {
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    assignedTo: [],
    deadline: "",
    priority: "medium",
    taskType: "project",
  });
  const [selectedBatch, setSelectedBatch] = useState("");
  
  // New States
  const [reportsOpen, setReportsOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [reports, setReports] = useState([]);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [teamOpen, setTeamOpen] = useState(false);

  const batches = ["The Uniques 1.0", "The Uniques 2.0", "The Uniques 3.0", "The Uniques 4.0"];

  const fetchTasks = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/uniques360/tasks/coordinator/current`, {
        withCredentials: true,
      });
      setTasks(response.data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  const fetchMembers = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/admin/member`, {
        withCredentials: true,
      });
      setMembers(response.data.data || []);
    } catch (error) {
      console.error("Error fetching members:", error);
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

  const filteredMembers = selectedBatch 
    ? members.filter(member => member.batch === selectedBatch)
    : members;

  const handleCreateTask = async () => {
    try {
      if (!newTask.title || !newTask.assignedTo) {
        toast.error("Please fill in required fields");
        return;
      }
      await axios.post(`${BASE_URL}/api/uniques360/tasks`, newTask, {
        withCredentials: true,
      });
      toast.success("Task assigned successfully");
      setOpen(false);
      fetchTasks();
      setNewTask({ title: "", description: "", assignedTo: [], deadline: "", priority: "medium", taskType: "project" });
      setSelectedBatch("");
    } catch (error) {
      toast.error("Error creating task");
    }
  };

  const handleStatusUpdate = async (taskId, newStatus) => {
    try {
      await axios.patch(`${BASE_URL}/api/uniques360/tasks/${taskId}`, { status: newStatus }, {
        withCredentials: true,
      });
      toast.success(`Task marked as ${newStatus}`);
      fetchTasks();
    } catch (error) {
      toast.error("Error updating status");
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      await axios.delete(`${BASE_URL}/api/uniques360/tasks/${taskId}`, {
        withCredentials: true,
      });
      toast.success("Task deleted");
      fetchTasks();
    } catch (error) {
      toast.error("Error deleting task");
    }
  };

  const handleUpdateTask = async () => {
    try {
      await axios.put(`${BASE_URL}/api/uniques360/tasks/${selectedTask._id}`, selectedTask, {
        withCredentials: true,
      });
      toast.success("Task updated");
      setEditOpen(false);
      fetchTasks();
    } catch (error) {
      toast.error("Error updating task");
    }
  };

  const fetchReports = async (taskId) => {
    setReportsLoading(true);
    try {
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

  const handleRemoveMember = async (taskId, memberId) => {
    try {
      await axios.post(`${BASE_URL}/api/uniques360/tasks/${taskId}/members/remove`, {
        memberIdToRemove: memberId
      }, {
        withCredentials: true,
      });
      toast.success("Member removed");
      fetchTasks();
      // Update selected task in state to reflect change in team modal
      setSelectedTask(prev => ({
        ...prev,
        assignedTo: prev.assignedTo.filter(m => m._id !== memberId)
      }));
    } catch (error) {
      toast.error("Error removing member");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed": return "success";
      case "in-progress": return "warning";
      default: return "default";
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
        sx={{ height: isDarkMode ? 60 : 80, mb: 1, filter: isDarkMode ? "none" : "drop-shadow(0px 2px 4px rgba(0,0,0,0.1))" }}
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
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: "bold", color: "#ca0019" }}>
          Uniques 360 - Task Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpen(true)}
          sx={{ bgcolor: "#ca0019", "&:hover": { bgcolor: "#a30014" }, borderRadius: 2 }}
        >
          Assign New Task
        </Button>
      </Box>

      {/* Navigation Insights Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6}>
          <Card 
            sx={{ 
              cursor: "pointer", 
              bgcolor: "#ca0019", 
              color: "white", 
              borderRadius: 3,
              transition: "transform 0.2s",
              "&:hover": { transform: "scale(1.02)" }
            }}
            onClick={() => window.location.href = "/coordinator/project-insights"}
          >
            <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Box sx={{ p: 1, bgcolor: "rgba(255,255,255,0.2)", borderRadius: "50%" }}>
                <ProjectIcon fontSize="large" />
              </Box>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: "bold" }}>Project Insights</Typography>
                <Typography variant="body2">View detailed project analytics and team progress</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Card 
            sx={{ 
              cursor: "pointer", 
              bgcolor: "#1a1a1a", 
              color: "white", 
              borderRadius: 3,
              transition: "transform 0.2s",
              "&:hover": { transform: "scale(1.02)" }
            }}
            onClick={() => window.location.href = "/coordinator/event-insights"}
          >
            <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Box sx={{ p: 1, bgcolor: "rgba(255,255,255,0.1)", borderRadius: "50%" }}>
                <TimelineIcon fontSize="large" sx={{ color: "#ca0019" }} />
              </Box>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: "bold" }}>Event Insights</Typography>
                <Typography variant="body2">Track event tasks and student assignments</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <TableContainer component={Paper} elevation={3} sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead sx={{ bgcolor: "#f5f5f5" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold" }}>Task Title</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Assigned To</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Priority</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Deadline</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tasks.map((task) => (
              <TableRow key={task._id} hover>
                <TableCell>{task.title}</TableCell>
                <TableCell>
                  {task.assignedTo?.map(m => m.fullName).join(", ") || "No one assigned"}
                </TableCell>
                <TableCell>
                  <Chip label={task.priority} size="small" color={task.priority === "high" ? "error" : "default"} />
                </TableCell>
                <TableCell>{task.deadline ? new Date(task.deadline).toLocaleDateString() : "No deadline"}</TableCell>
                <TableCell>
                  <Chip label={task.status} size="small" color={getStatusColor(task.status)} />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: "flex", gap: 0.5 }}>
                    <IconButton 
                      color="primary" 
                      size="small"
                      title="View Reports"
                      onClick={() => {
                        setSelectedTask(task);
                        setReportsOpen(true);
                        fetchReports(task._id);
                      }}
                    >
                      <ViewIcon fontSize="small" />
                    </IconButton>
                    <IconButton 
                      color="secondary" 
                      size="small"
                      title="Edit Task"
                      onClick={() => {
                        setSelectedTask({
                          ...task,
                          assignedTo: task.assignedTo.map(m => m._id) // Convert to IDs for Select
                        });
                        setEditOpen(true);
                      }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton 
                      size="small"
                      title="Manage Team"
                      onClick={() => {
                        setSelectedTask(task);
                        setTeamOpen(true);
                      }}
                    >
                      <TeamIcon fontSize="small" />
                    </IconButton>
                    {task.status !== "completed" && (
                      <IconButton 
                        color="success" 
                        size="small"
                        title="Mark Complete"
                        onClick={() => handleStatusUpdate(task._id, "completed")}
                      >
                        <CompleteIcon fontSize="small" />
                      </IconButton>
                    )}
                    <IconButton 
                      color="error" 
                      size="small"
                      title="Delete Task"
                      onClick={() => handleDeleteTask(task._id)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Create Task Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: "bold" }}>Assign New Project/Task</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              label="Task Title"
              fullWidth
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              required
            />
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={3}
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              required
            />
            
            <FormControl fullWidth required>
              <InputLabel>Task Category</InputLabel>
              <Select
                value={newTask.taskType}
                label="Task Category"
                onChange={(e) => setNewTask({ ...newTask, taskType: e.target.value })}
              >
                <MenuItem value="project">Project Assignment</MenuItem>
                <MenuItem value="event">Event Assignment</MenuItem>
              </Select>
            </FormControl>
            
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Filter by Batch</InputLabel>
                  <Select
                    value={selectedBatch}
                    label="Filter by Batch"
                    onChange={(e) => {
                      setSelectedBatch(e.target.value);
                      setNewTask({ ...newTask, assignedTo: "" }); // Reset selected member when batch changes
                    }}
                  >
                    <MenuItem value=""><em>All Batches</em></MenuItem>
                    {batches.map((batch) => (
                      <MenuItem key={batch} value={batch}>{batch}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth required>
                  <InputLabel>Assign To Member(s)</InputLabel>
                  <Select
                    multiple
                    value={newTask.assignedTo}
                    label="Assign To Member(s)"
                    onChange={(e) => {
                      const value = e.target.value;
                      setNewTask({ ...newTask, assignedTo: typeof value === 'string' ? value.split(',') : value });
                    }}
                    disabled={!filteredMembers.length && selectedBatch}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => {
                          const member = members.find(m => m._id === value);
                          return <Chip key={value} label={member?.fullName || value} size="small" />;
                        })}
                      </Box>
                    )}
                  >
                    {filteredMembers.map((member) => (
                      <MenuItem key={member._id} value={member._id}>
                        {member.fullName} ({member.admno || "No ID"})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            <TextField
              label="Deadline"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={newTask.deadline}
              onChange={(e) => setNewTask({ ...newTask, deadline: e.target.value })}
            />
            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select
                value={newTask.priority}
                label="Priority"
                onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
              >
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateTask} variant="contained" sx={{ bgcolor: "#ca0019" }}>
            Assign Task
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Task Dialog */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: "bold" }}>Edit Project/Task</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              label="Task Title"
              fullWidth
              value={selectedTask?.title || ""}
              onChange={(e) => setSelectedTask({ ...selectedTask, title: e.target.value })}
            />
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={3}
              value={selectedTask?.description || ""}
              onChange={(e) => setSelectedTask({ ...selectedTask, description: e.target.value })}
            />
            <TextField
              label="Deadline"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={selectedTask?.deadline ? new Date(selectedTask.deadline).toISOString().split('T')[0] : ""}
              onChange={(e) => setSelectedTask({ ...selectedTask, deadline: e.target.value })}
            />
            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select
                value={selectedTask?.priority || "medium"}
                label="Priority"
                onChange={(e) => setSelectedTask({ ...selectedTask, priority: e.target.value })}
              >
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button onClick={handleUpdateTask} variant="contained" color="secondary">
            Update Task
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Reports Dialog */}
      <Dialog open={reportsOpen} onClose={() => setReportsOpen(false)} fullWidth maxWidth="md">
        <DialogTitle sx={{ 
          fontWeight: "bold", 
          borderBottom: 1, 
          borderColor: "divider", 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center",
          bgcolor: "#f8f9fa"
        }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <ViewIcon sx={{ color: "#ca0019" }} />
            <Typography variant="h6" sx={{ fontWeight: "bold" }}>Daily Progress Feed - {selectedTask?.title}</Typography>
          </Box>
          <IconButton onClick={() => setReportsOpen(false)} size="small"><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0, bgcolor: "white", minHeight: "400px" }}>
          {reportsLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 8 }}><CircularProgress /></Box>
          ) : reports.length === 0 ? (
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", p: 8, opacity: 0.5 }}>
              <HistoryIcon sx={{ fontSize: 64, mb: 2 }} />
              <Typography variant="h6">No reports submitted yet.</Typography>
            </Box>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", p: 2 }}>
              {reports.map((report) => (
                <Box key={report._id} sx={{ 
                  display: "flex", 
                  gap: 2, 
                  p: 2, 
                  "&:hover": { bgcolor: "#f8f9fa" },
                  borderRadius: 1,
                  transition: "background 0.2s"
                }}>
                  <Avatar sx={{ width: 40, height: 40, bgcolor: "#ca0019", fontWeight: "bold" }}>
                    {report.studentId?.fullName?.[0] || "U"}
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: "flex", alignItems: "baseline", gap: 1, mb: 0.5 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: "bold", color: "#1d1c1d" }}>
                        {report.studentId?.fullName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(report.submissionDate || report.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ color: "#1d1c1d", lineHeight: 1.5, whiteSpace: "pre-line" }}>
                      {report.reportContent}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: 1, borderColor: "divider", bgcolor: "#f8f9fa" }}>
          <Button onClick={() => setReportsOpen(false)} variant="outlined">Close Feed</Button>
        </DialogActions>
      </Dialog>

      {/* Manage Team Dialog */}
      <Dialog open={teamOpen} onClose={() => setTeamOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: "bold" }}>Manage Project Team</DialogTitle>
        <DialogContent>
          <List sx={{ mt: 1 }}>
            {selectedTask?.assignedTo?.map((member) => (
              <ListItem key={member._id} disablePadding sx={{ mb: 1 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", p: 1, border: 1, borderColor: "divider", borderRadius: 1 }}>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: "bold" }}>{member.fullName}</Typography>
                    <Typography variant="caption" color="text.secondary">{member.email}</Typography>
                  </Box>
                  <IconButton 
                    edge="end" 
                    color="error" 
                    size="small"
                    onClick={() => handleRemoveMember(selectedTask._id, member._id)}
                    disabled={selectedTask.assignedTo.length <= 1}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              </ListItem>
            ))}
          </List>
          {selectedTask?.assignedTo?.length <= 1 && (
            <Typography variant="caption" color="error" sx={{ mt: 1, display: "block" }}>
              * Cannot remove the last member. Use delete task instead.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTeamOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Uniques360Coordinator;
