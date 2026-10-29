/**
 * @file Uniques360.jsx
 * @description Uniques360 Coordinator dashboard workspace for tracking operations, managing assignments, reviewing member reports, and coordinating team rosters.
 * @architecture Connects to Uniques360 coordinator routes, leveraging TaskTable, CreateTaskDialog, EditTaskDialog, ReportsDialog, and TeamDialog child components.
 * @agent_note Handles task normalization for populated member structures (`item.member._id` vs plain string IDs) across status changes, CRUD operations, and team assignments.
 */

import React, { useState, useEffect, useMemo } from "react";
import ModernTable from "@/components/tables/ModernTable";
import ModernButton from "@/components/buttons/ModernButton";
import ModernStatCard from "@/components/cards/ModernStatCard";
import ModernHeader from "@/components/headers/ModernHeader";
import { alpha } from "@mui/material/styles";
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  FormControl,
  Grid,
  InputLabel,
  LinearProgress,
  MenuItem,
  Paper,
  Select,
  Typography,
} from "@mui/material";

import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import TaskIcon from '@mui/icons-material/Assignment';
import PendingIcon from '@mui/icons-material/HourglassEmpty';
import ProgressIcon from '@mui/icons-material/TrendingUp';
import CompleteIcon from '@mui/icons-material/CheckCircleOutline';

import axios from "axios";
import { useBatches } from "@/hooks/useBatches";
import { BASE_URL } from "@/config";
import { toast } from "react-toastify";
import { useThemeContext } from "@/theme/ThemeProvider";
import logoCommunity from "@/assets/logos/theuniquesCommunity.png";
import logoWhite from "@/assets/logos/uniqueswhite.png";
import TaskTable from "./components/TaskTable";
import { Coordinator360Skeleton, TableSkeleton } from "@/components/common/skeletons";
import { preloadComponent } from "@/utils/preload";

const CreateTaskDialog = React.lazy(() => import("./components/CreateTaskDialog"));
const ReportsDialog = React.lazy(() => import("./components/ReportsDialog"));
const EditTaskDialog = React.lazy(() => import("./components/EditTaskDialog"));
const TeamDialog = React.lazy(() => import("./components/TeamDialog"));

const BRAND_COLOR = "#ca0019";
const BRAND_HOVER = "#a30014";

/**
 * @component Uniques360Coordinator
 * @description Main dashboard view for Uniques360 coordinators to assign tasks, filter metrics, monitor progress, inspect reports, and manage teams.
 * @state {Array} tasks - List of tasks retrieved for the coordinator
 * @state {Array} members - Directory list of active members available for task assignments
 * @state {boolean} loading - Global initial fetch state
 * @state {boolean} tasksLoading - Spinner indicator for task queries
 * @state {boolean} submitting - Active submission guard for dialog mutations
 * @state {boolean} open - Controls visibility of the CreateTaskDialog
 * @state {Object} newTask - Form payload for creating a new task
 * @state {Object} newTaskRoles - Mapping of memberId to designated task role
 * @state {string} selectedBatch - Batch filter currently selected for candidate assignment
 * @state {boolean} reportsOpen - Controls visibility of the ReportsDialog
 * @state {Object|null} selectedTask - Task actively being viewed, edited, or staffed
 * @state {Array} reports - Submission reports submitted by students for the selected task
 * @state {boolean} reportsLoading - Spinner indicator for report fetching
 * @state {string} taskTypeFilter - Filter category: 'all' | 'project' | 'event'
 * @state {string} statusFilter - Filter status: 'all' | 'pending' | 'in-progress' | 'completed'
 * @state {string} memberFilter - Filter member by MongoDB ObjectId
 * @state {boolean} editOpen - Controls visibility of the EditTaskDialog
 * @state {boolean} teamOpen - Controls visibility of the TeamDialog
 * @api {GET} /api/uniques360/tasks/coordinator/current - Fetch coordinator assigned tasks
 * @api {GET} /api/admin/member/lookup - Fetch lookup directory of all members
 * @api {POST} /api/uniques360/tasks - Create and assign a new task
 * @api {PATCH} /api/uniques360/tasks/:taskId - Update task completion status
 * @api {DELETE} /api/uniques360/tasks/:taskId - Remove a task
 * @api {PUT} /api/uniques360/tasks/:taskId - Update existing task details and assignments
 * @api {GET} /api/uniques360/reports/task/:taskId - Retrieve reports for a task
 * @api {POST} /api/uniques360/tasks/:taskId/members/remove - Remove a member from a task
 * @api {POST} /api/uniques360/tasks/:taskId/members - Add a member to a task
 */
const Uniques360Coordinator = () => {
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [open, setOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    assignedTo: [],
    deadline: "",
    priority: "medium",
    taskType: "project",
  });
  const [newTaskRoles, setNewTaskRoles] = useState({});
  const [selectedBatch, setSelectedBatch] = useState("");

  const [reportsOpen, setReportsOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [reports, setReports] = useState([]);
  const [reportsLoading, setReportsLoading] = useState(false);
  
  const [teamSelectedBatch, setTeamSelectedBatch] = useState("");
  const [teamSelectedMember, setTeamSelectedMember] = useState("");
  const [teamSelectedRole, setTeamSelectedRole] = useState("");
  
  const [taskTypeFilter, setTaskTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [memberFilter, setMemberFilter] = useState("all");

  const [editOpen, setEditOpen] = useState(false);
  const [teamOpen, setTeamOpen] = useState(false);

  const { batches } = useBatches();

  const { isDarkMode } = useThemeContext();

  // ================= FETCH TASKS =================
  /**
   * @desc Fetches current coordinator tasks from the Uniques360 backend service.
   * @returns {Promise<void>} Resolves after tasks are committed to component state.
   */
  const fetchTasks = async () => {
    try {
      setTasksLoading(true);
      const response = await axios.get(
        `${BASE_URL}/api/uniques360/tasks/coordinator/current`,
        { withCredentials: true }
      );
      const tasksData = Array.isArray(response.data) ? response.data : response.data?.tasks || response.data || [];
      setTasks(tasksData);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      toast.error(error.response?.data?.message || "Failed to fetch tasks");
      setTasks([]);
    } finally {
      setTasksLoading(false);
    }
  };

  // ================= FETCH MEMBERS =================
  /**
   * @desc Fetches member directory for lookup when assigning or editing tasks.
   * @returns {Promise<void>} Resolves when members state is updated.
   */
  const fetchMembers = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/admin/member/lookup`, {
        withCredentials: true,
      });
      setMembers(response.data?.data || []);
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to fetch members");
    }
  };

  // ================= INITIAL LOAD =================
  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        await Promise.all([fetchTasks(), fetchMembers()]);
      } catch (error) {
        console.error("Error initializing:", error);
        toast.error("Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  // ================= CREATE TASK =================
  /**
   * @desc Submits a new task creation request with assigned members and roles.
   * @returns {Promise<void>} Resolves on task creation completion.
   */
  const handleCreateTask = async () => {
    try {
      if (!newTask.title.trim()) {
        toast.error("Task title is required");
        return;
      }
      if (newTask.assignedTo.length === 0) {
        toast.error("Please assign at least one member");
        return;
      }

      setSubmitting(true);
      const assignedTo = newTask.assignedTo.map((memberId) => ({
        member: memberId,
        role: newTaskRoles[memberId] || null,
      }));

      await axios.post(
        `${BASE_URL}/api/uniques360/tasks`,
        { ...newTask, assignedTo },
        { withCredentials: true }
      );

      toast.success("Task assigned successfully");
      setOpen(false);
      setNewTask({
        title: "",
        description: "",
        assignedTo: [],
        deadline: "",
        priority: "medium",
        taskType: "project",
      });
      setNewTaskRoles({});
      setSelectedBatch("");
      await fetchTasks();
    } catch (error) {
      console.error("Error creating task:", error);
      toast.error(error.response?.data?.message || "Error creating task");
    } finally {
      setSubmitting(false);
    }
  };

  // ================= UPDATE STATUS =================
  /**
   * @desc Updates the workflow status of an existing task (e.g., mark as completed).
   * @param {string} taskId - MongoDB ID of the task to update
   * @param {string} [newStatus="completed"] - Target status string
   * @returns {Promise<void>}
   */
  const handleStatusUpdate = async (taskId, newStatus = "completed") => {
    try {
      await axios.patch(
        `${BASE_URL}/api/uniques360/tasks/${taskId}`,
        { status: newStatus },
        { withCredentials: true }
      );
      toast.success(`Task marked as ${newStatus}`);
      await fetchTasks();
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error(error.response?.data?.message || "Error updating status");
    }
  };

  // ================= DELETE TASK =================
  /**
   * @desc Prompts coordinator confirmation and deletes the specified task.
   * @param {string} taskId - MongoDB ID of the task to delete
   * @returns {Promise<void>}
   */
  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      await axios.delete(`${BASE_URL}/api/uniques360/tasks/${taskId}`, {
        withCredentials: true,
      });
      toast.success("Task deleted");
      fetchTasks();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Error deleting task");
    }
  };

  // ================= UPDATE TASK =================
  /**
   * @desc Submits updated task details and re-mapped member role mappings.
   * @returns {Promise<void>}
   */
  const handleUpdateTask = async () => {
    try {
      setSubmitting(true);
      const roles = selectedTask.assignedRoles || {};
      const assignedToPayload = (selectedTask.assignedTo || []).map((id) => {
        const rawId = typeof id === "object" ? (id._id || id.member || id) : id;
        return {
          member: rawId,
          role: roles[rawId] || null,
        };
      });
      await axios.put(
        `${BASE_URL}/api/uniques360/tasks/${selectedTask._id}`,
        { ...selectedTask, assignedTo: assignedToPayload },
        { withCredentials: true }
      );
      toast.success("Task updated");
      setEditOpen(false);
      fetchTasks();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Error updating task");
    } finally {
      setSubmitting(false);
    }
  };

  // ================= FETCH REPORTS =================
  /**
   * @desc Loads member reports submitted for a specified task.
   * @param {string} taskId - MongoDB ID of the selected task
   * @returns {Promise<void>}
   */
  const fetchReports = async (taskId) => {
    try {
      setReportsLoading(true);
      const response = await axios.get(
        `${BASE_URL}/api/uniques360/reports/task/${taskId}`,
        { withCredentials: true }
      );
      setReports(response.data || []);
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Error fetching reports");
    } finally {
      setReportsLoading(false);
    }
  };

  // ================= REMOVE MEMBER =================
  /**
   * @desc Detaches an assigned member from a task roster.
   * @param {string} taskId - Target task ID
   * @param {string} memberId - Member ID to remove
   * @returns {Promise<void>}
   */
  const handleRemoveMember = async (taskId, memberId) => {
    try {
      await axios.post(
        `${BASE_URL}/api/uniques360/tasks/${taskId}/members/remove`,
        { memberIdToRemove: memberId },
        { withCredentials: true }
      );
      toast.success("Member removed");
      fetchTasks();
      setSelectedTask((prev) => ({
        ...prev,
        assignedTo: (prev.assignedTo || []).filter((m) => {
          const inner = m && m.member ? m.member : m;
          const id = inner?._id || inner?.id || inner;
          return id?.toString?.() !== memberId;
        }),
      }));
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Error removing member");
    }
  };

  /**
   * @desc Resolves semantic MUI color variant based on task completion status.
   * @param {string} status - Task status string
   * @returns {'success'|'warning'|'default'} Chip color identifier
   */
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "completed": return "success";
      case "in-progress": return "warning";
      default: return "default";
    }
  };

  // Memoizing operations to protect logic iteration arrays
  const taskStats = useMemo(() => {
    return {
      total: tasks.length,
      pending: tasks.filter((t) => t.status?.toLowerCase() === "pending").length,
      inProgress: tasks.filter((t) => t.status?.toLowerCase() === "in-progress").length,
      completed: tasks.filter((t) => t.status?.toLowerCase() === "completed").length,
    };
  }, [tasks]);

  const filteredTasks = tasks.filter((task) => {
    const typeOk = taskTypeFilter === "all" || task.taskType === taskTypeFilter;
    const statusOk = statusFilter === "all" || task.status === statusFilter;
    const memberOk = memberFilter === "all" || (task.assignedTo || []).some((item) => {
      const inner = item && item.member ? item.member : item;
      const id = inner?._id || inner?.id || inner;
      return id?.toString?.() === memberFilter;
    });
    return typeOk && statusOk && memberOk;
  });

  // Toggles the filter state if clicked multiple times
  /**
   * @desc Toggles filtering by status card metric; clears filter if clicked again.
   * @param {string} targetStatus - Filter value ('all' | 'pending' | 'in-progress' | 'completed')
   */
  const handleMetricCardClick = (targetStatus) => {
    if (statusFilter === targetStatus) {
      setStatusFilter("all");
    } else {
      setStatusFilter(targetStatus);
    }
  };

  if (loading) {
    return <Coordinator360Skeleton />;
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: "background.default", minHeight: "100vh" }}>
      <ModernHeader
        title="Uniques 360"
        highlight="Workspace"
        subtitle="Monitor assignments, project deployment logs, and student metrics across batches."
        sx={{ mb: 5 }}
        action={
          <ModernButton
            startIcon={<AddIcon sx={{ fontSize: "20px !important", transition: "transform 0.3s ease" }} />}
            onClick={() => setOpen(true)}
            onMouseEnter={() => preloadComponent(() => import("./components/CreateTaskDialog"))}
            onFocus={() => preloadComponent(() => import("./components/CreateTaskDialog"))}
          >
            Assign New Task
          </ModernButton>
        }
      />
{/* DASHBOARD STATUS SUMMARY METRICS */}
<Grid container spacing={3} sx={{ mb: 4 }}>
  {[
    { 
      label: "Total Tasks", 
      value: taskStats.total, 
      color: BRAND_COLOR, 
      filterValue: "all", 
      icon: <TaskIcon sx={{ fontSize: "24px" }} />,
      gradient: "radial-gradient(circle at 80% 20%, rgba(202, 0, 25, 0.15) 0%, transparent 50%)"
    },
    { 
      label: "Pending Operation", 
      value: taskStats.pending, 
      color: "#FFA500", 
      filterValue: "pending", 
      icon: <PendingIcon sx={{ fontSize: "24px" }} />,
      gradient: "radial-gradient(circle at 80% 20%, rgba(255, 165, 0, 0.15) 0%, transparent 50%)"
    },
    { 
      label: "Active Progression", 
      value: taskStats.inProgress, 
      color: "#2196F3", 
      filterValue: "in-progress", 
      icon: <ProgressIcon sx={{ fontSize: "24px" }} />,
      gradient: "radial-gradient(circle at 80% 20%, rgba(33, 150, 243, 0.15) 0%, transparent 50%)"
    },
    { 
      label: "Completed Operations", 
      value: taskStats.completed, 
      color: "#4CAF50", 
      filterValue: "completed", 
      icon: <CompleteIcon sx={{ fontSize: "24px" }} />,
      gradient: "radial-gradient(circle at 80% 20%, rgba(76, 175, 80, 0.15) 0%, transparent 50%)"
    }
  ].map((stat, idx) => {
    const isSelected = statusFilter === stat.filterValue;
    return (
      <Grid item xs={12} sm={6} md={3} key={idx}>
        <Paper
          onClick={() => handleMetricCardClick(stat.filterValue)}
          sx={{
            p: 3,
            borderRadius: "14px",
            bgcolor: isSelected ? "#0a0a0a" : "rgba(255, 255, 255, 0.02)",
            backgroundImage: isSelected ? stat.gradient : "none",
            border: "1px solid",
            borderColor: isSelected ? stat.color : "rgba(255, 255, 255, 0.07)",
            cursor: "pointer",
            userSelect: "none",
            display: "flex",
            alignItems: "center",
            position: "relative",
            overflow: "hidden",
            height: "110px",
            transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
            boxShadow: isSelected 
              ? `0 20px 40px -15px ${alpha(stat.color, 0.3)}, inset 0 0 0 1px ${alpha(stat.color, 0.2)}` 
              : "none",
            "&::before": {
              content: '""',
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              width: "4px",
              bgcolor: stat.color,
              transform: isSelected ? "scaleY(1)" : "scaleY(0)",
              transition: "transform 0.2s ease",
            },
            "&:hover": {
              bgcolor: isSelected ? "#0a0a0a" : "rgba(255, 255, 255, 0.05)",
              borderColor: alpha(stat.color, 0.6),
              transform: "translateY(-2px)",
              "& .metric-icon-wrapper": {
                color: "#ffffff",
                bgcolor: stat.color,
                boxShadow: `0 0 20px ${alpha(stat.color, 0.6)}`,
              }
            },
          }}
        >
          {/* Main Metrics Layout */}
          <Box sx={{ display: "flex", width: "100%", alignItems: "center", justifyContent: "space-between" }}>
            <Box>
              <Typography 
                variant="caption" 
                sx={{ 
                  fontWeight: 700, 
                  color: isSelected ? "#ffffff" : "text.secondary", 
                  fontSize: "11px", 
                  textTransform: "uppercase", 
                  letterSpacing: "1.5px",
                  display: "block",
                  mb: 0.5,
                  opacity: isSelected ? 1 : 0.5
                }}
              >
                {stat.label}
              </Typography>
              <Typography 
                variant="h3" 
                sx={{ 
                  fontWeight: 900, 
                  color: isSelected ? "#ffffff" : stat.color, 
                  fontSize: "2.25rem",
                  lineHeight: 1,
                  letterSpacing: "-1px"
                }}
              >
                {stat.value}
              </Typography>
            </Box>

            {/* Futuristic Hex/Circle Container Style */}
            <Box 
              className="metric-icon-wrapper"
              sx={{ 
                width: "48px",
                height: "48px",
                borderRadius: "12px", 
                bgcolor: isSelected ? stat.color : "rgba(255, 255, 255, 0.03)", 
                color: isSelected ? "#ffffff" : "text.secondary",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
                border: "1px solid",
                borderColor: isSelected ? "transparent" : "rgba(255, 255, 255, 0.08)",
                boxShadow: isSelected ? `0 0 15px ${alpha(stat.color, 0.5)}` : "none"
              }}
            >
              {stat.icon}
            </Box>
          </Box>
        </Paper>
      </Grid>
    );
  })}
</Grid>

      {/* CONTROL FILTERS CONFIGURATION BAR */}
      <Card sx={{ mb: 4, borderRadius: "16px", border: "1px solid", borderColor: "divider", boxShadow: "none", bgcolor: "background.paper" }}>
        <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
          <Grid container spacing={2.5}>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Filter by Type</InputLabel>
                <Select value={taskTypeFilter} label="Filter by Type" onChange={(e) => setTaskTypeFilter(e.target.value)} sx={{ borderRadius: "10px" }}>
                  <MenuItem value="all">All Tasks</MenuItem>
                  <MenuItem value="project">Project</MenuItem>
                  <MenuItem value="event">Event</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Filter by Status</InputLabel>
                <Select value={statusFilter} label="Filter by Status" onChange={(e) => setStatusFilter(e.target.value)} sx={{ borderRadius: "10px" }}>
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="in-progress">In Progress</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Filter by Member</InputLabel>
                <Select value={memberFilter} label="Filter by Member" onChange={(e) => setMemberFilter(e.target.value)} sx={{ borderRadius: "10px" }}>
                  <MenuItem value="all">All Members</MenuItem>
                  {members.map((member) => (
                    <MenuItem key={member._id} value={member._id}>{member.fullName}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* DYNAMIC DATA VIEWS */}
      {tasksLoading && (
        <TableSkeleton rows={5} columns={7} />
      )}

      {!tasksLoading && tasks.length === 0 && (
        <Paper sx={{ p: 6, textAlign: "center", borderRadius: "16px", border: "1px solid", borderColor: "divider", boxShadow: "none", bgcolor: "background.paper" }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: "text.primary", mb: 1 }}>
            No tasks assigned yet
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", mb: 3, maxWidth: "400px", mx: "auto" }}>
            Initialize assignments and milestone actions inside the coordinator workspace.
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpen(true)}
            onMouseEnter={() => preloadComponent(() => import("./components/CreateTaskDialog"))}
            onFocus={() => preloadComponent(() => import("./components/CreateTaskDialog"))}
            sx={{ textTransform: "none", fontWeight: 600, borderRadius: "10px", bgcolor: BRAND_COLOR, "&:hover": { bgcolor: BRAND_HOVER }, boxShadow: "none" }}
          >
            Assign First Task
          </Button>
        </Paper>
      )}

      {!tasksLoading && tasks.length > 0 && filteredTasks.length === 0 && (
        <Paper sx={{ p: 6, textAlign: "center", borderRadius: "16px", border: "1px solid", borderColor: "divider", boxShadow: "none", bgcolor: "background.paper" }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "text.primary" }}>
            No tasks match your current filter parameters
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
            Adjust choices or clear filters to locate hidden records.
          </Typography>
        </Paper>
      )}

      {!tasksLoading && filteredTasks.length > 0 && (
        <Box sx={{ mb: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 700, letterSpacing: "0.5px" }}>
            SHOWING {filteredTasks.length} OF {tasks.length} OPERATIONS
          </Typography>
          <Button
            size="small"
            startIcon={<RefreshIcon sx={{ fontSize: "16px !important" }} />}
            onClick={fetchTasks}
            sx={{ textTransform: "none", fontWeight: 700, fontSize: "12px", color: BRAND_COLOR, "&:hover": { bgcolor: alpha(BRAND_COLOR, 0.04) } }}
          >
            Sync Matrix
          </Button>
        </Box>
      )}

      {/* CORE ASSIGNMENT GRID REPO */}
      {!tasksLoading && filteredTasks.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <TaskTable
            tasks={filteredTasks}
            getStatusColor={getStatusColor}
            onViewReports={(task) => {
              setSelectedTask(task);
              setReportsOpen(true);
              fetchReports(task._id);
            }}
            onEdit={(task) => {
              const existingRoles = {};
              const assignedIds = [];
              (task.assignedTo || []).forEach((item) => {
                const inner = item && item.member ? item.member : item;
                const id = (inner?._id || inner?.id || inner)?.toString?.();
                if (id) {
                  assignedIds.push(id);
                  if (item && item.role) {
                    existingRoles[id] = item.role;
                  }
                }
              });
              setSelectedTask({
                ...task,
                assignedTo: assignedIds,
                assignedRoles: existingRoles,
              });
              setEditOpen(true);
            }}
            onManageTeam={(task) => {
              setSelectedTask(task);
              setTeamSelectedBatch("");
              setTeamSelectedMember("");
              setTeamSelectedRole("");
              setTeamOpen(true);
            }}
            onMarkComplete={(taskId) => handleStatusUpdate(taskId, "completed")}
            onDelete={handleDeleteTask}
          />
        </Box>
      )}

      {/* MODAL SYNC SYSTEM */}
      {open && (
        <React.Suspense fallback={null}>
          <CreateTaskDialog
            open={open}
            onClose={() => setOpen(false)}
            onSubmit={handleCreateTask}
            submitting={submitting}
            newTask={newTask}
            setNewTask={setNewTask}
            selectedBatch={selectedBatch}
            setSelectedBatch={setSelectedBatch}
            batches={batches}
            members={members}
            newTaskRoles={newTaskRoles}
            setNewTaskRoles={setNewTaskRoles}
          />
        </React.Suspense>
      )}

      {reportsOpen && (
        <React.Suspense fallback={null}>
          <ReportsDialog
            open={reportsOpen}
            onClose={() => setReportsOpen(false)}
            task={selectedTask}
            reports={reports}
            loading={reportsLoading}
          />
        </React.Suspense>
      )}

      {editOpen && (
        <React.Suspense fallback={null}>
          <EditTaskDialog
            open={editOpen}
            onClose={() => setEditOpen(false)}
            onSubmit={handleUpdateTask}
            submitting={submitting}
            task={selectedTask}
            setTask={setSelectedTask}
            members={members}
            batches={batches}
          />
        </React.Suspense>
      )}

      {teamOpen && (
        <React.Suspense fallback={null}>
          <TeamDialog
            open={teamOpen}
            onClose={() => setTeamOpen(false)}
            task={selectedTask}
            members={members}
            selectedMemberId={teamSelectedMember}
            onSelectedMemberChange={setTeamSelectedMember}
            selectedBatch={teamSelectedBatch}
            onSelectedBatchChange={setTeamSelectedBatch}
            batches={batches}
            onAddMember={async () => {
              if (!selectedTask || !teamSelectedMember) return;
              try {
                await axios.post(
                  `${BASE_URL}/api/uniques360/tasks/${selectedTask._id}/members`,
                  {
                    newMemberId: teamSelectedMember,
                    role: teamSelectedRole || null,
                  },
                  { withCredentials: true }
                );
                toast.success("Teammate deployed");
                setTeamSelectedMember("");
                setTeamSelectedBatch("");
                setTeamSelectedRole("");
                fetchTasks();
                setSelectedTask((prev) => ({
                  ...prev,
                  assignedTo: [
                    ...(prev.assignedTo || []),
                    members.find((member) => member._id === teamSelectedMember),
                  ].filter(Boolean),
                }));
              } catch (error) {
                console.error(error);
                toast.error(error.response?.data?.message || "Error adding teammate");
              }
            }}
            onRemoveMember={async (memberId) => {
              await handleRemoveMember(selectedTask._id, memberId);
            }}
            selectedRole={teamSelectedRole}
            onSelectedRoleChange={setTeamSelectedRole}
          />
        </React.Suspense>
      )}
    </Box>
  );
};

export default Uniques360Coordinator;
