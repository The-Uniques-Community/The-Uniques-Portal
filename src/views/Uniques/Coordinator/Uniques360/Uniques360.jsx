import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  Chip,
  IconButton,
  CircularProgress,
  LinearProgress,
  Avatar,
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
} from "@mui/icons-material";

import axios from "axios";
import { BASE_URL } from "@/config";
import { toast } from "react-toastify";
import { useThemeContext } from "@/theme/ThemeProvider";
import logoCommunity from "@/assets/logos/theuniquesCommunity.png";
import logoWhite from "@/assets/logos/uniqueswhite.png";
import TaskTable from "./components/TaskTable";
import CreateTaskDialog from "./components/CreateTaskDialog";
import ReportsDialog from "./components/ReportsDialog";
import EditTaskDialog from "./components/EditTaskDialog";
import TeamDialog from "./components/TeamDialog";

const Uniques360Coordinator = () => {
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const batches = [
    "The Uniques 1.0",
    "The Uniques 2.0",
    "The Uniques 3.0",
    "The Uniques 4.0",
  ];

  const { isDarkMode } = useThemeContext();

  // ================= FETCH TASKS =================

  const fetchTasks = async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}/api/uniques360/tasks/coordinator/current`,
        {
          withCredentials: true,
        }
      );

      setTasks(response.data || []);
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message || "Failed to fetch tasks"
      );
    }
  };

  // ================= FETCH MEMBERS =================

  const fetchMembers = async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}/api/admin/member`,
        {
          withCredentials: true,
        }
      );

      setMembers(response.data?.data || []);
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message || "Failed to fetch members"
      );
    }
  };

  // ================= INITIAL LOAD =================

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);

        await Promise.all([
          fetchTasks(),
          fetchMembers(),
        ]);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  // ================= CREATE TASK =================

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

      const response = await axios.post(
        `${BASE_URL}/api/uniques360/tasks`,
        {
          ...newTask,
          assignedTo,
        },
        {
          withCredentials: true,
        }
      );

      toast.success("Task assigned successfully");

      const createdTask = response.data?.task;
      if (createdTask) {
        setTasks((prev) => [createdTask, ...(Array.isArray(prev) ? prev : [])]);
      }

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

      fetchTasks();
    } catch (error) {
      console.error(error);

      toast.error(
        error.response?.data?.message ||
          "Error creating task"
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ================= UPDATE STATUS =================

  const handleStatusUpdate = async (
    taskId,
    newStatus
  ) => {
    try {
      await axios.patch(
        `${BASE_URL}/api/uniques360/tasks/${taskId}`,
        { status: newStatus },
        {
          withCredentials: true,
        }
      );

      toast.success(`Task marked as ${newStatus}`);

      fetchTasks();
    } catch (error) {
      console.error(error);

      toast.error(
        error.response?.data?.message ||
          "Error updating status"
      );
    }
  };

  // ================= DELETE TASK =================

  const handleDeleteTask = async (taskId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this task?"
      )
    )
      return;

    try {
      await axios.delete(
        `${BASE_URL}/api/uniques360/tasks/${taskId}`,
        {
          withCredentials: true,
        }
      );

      toast.success("Task deleted");

      fetchTasks();
    } catch (error) {
      console.error(error);

      toast.error(
        error.response?.data?.message ||
          "Error deleting task"
      );
    }
  };

  // ================= UPDATE TASK =================

  const handleUpdateTask = async () => {
    try {
      setSubmitting(true);

      await axios.put(`${BASE_URL}/api/uniques360/tasks/${selectedTask._id}`, selectedTask, {
        withCredentials: true,
      });

      toast.success("Task updated");

      setEditOpen(false);

      fetchTasks();
    } catch (error) {
      console.error(error);

      toast.error(
        error.response?.data?.message ||
          "Error updating task"
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ================= FETCH REPORTS =================

  const fetchReports = async (taskId) => {
    try {
      setReportsLoading(true);

      const response = await axios.get(
        `${BASE_URL}/api/uniques360/reports/task/${taskId}`,
        {
          withCredentials: true,
        }
      );

      setReports(response.data || []);
    } catch (error) {
      console.error(error);

      toast.error(
        error.response?.data?.message ||
          "Error fetching reports"
      );
    } finally {
      setReportsLoading(false);
    }
  };

  // ================= REMOVE MEMBER =================

  const handleRemoveMember = async (
    taskId,
    memberId
  ) => {
    try {
      await axios.post(
        `${BASE_URL}/api/uniques360/tasks/${taskId}/members/remove`,
        {
          memberIdToRemove: memberId,
        },
        {
          withCredentials: true,
        }
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

      toast.error(
        error.response?.data?.message ||
          "Error removing member"
      );
    }
  };

  // ================= STATUS COLOR =================

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "success";

      case "in-progress":
        return "warning";

      default:
        return "default";
    }
  };

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

  // ================= LOADING =================

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "80vh",
          gap: 3,
        }}
      >
        <Box
          component="img"
          src={isDarkMode ? logoWhite : logoCommunity}
          alt="logo"
          sx={{
            height: isDarkMode ? 60 : 80,
          }}
        />

        <Box sx={{ width: 300 }}>
          <LinearProgress
            sx={{
              height: 4,
              borderRadius: 2,
              "& .MuiLinearProgress-bar": {
                backgroundColor: "#ca0019",
              },
            }}
          />
        </Box>

        <Typography variant="caption">
          Loading workspace...
        </Typography>
      </Box>
    );
  }

  // ================= MAIN UI =================

  return (
    <Box sx={{ p: 3 }}>
      {/* HEADER */}

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          mb: 4,
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontWeight: "bold",
            color: "#ca0019",
          }}
        >
          Uniques 360 - Task Management
        </Typography>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpen(true)}
          sx={{
            bgcolor: "#ca0019",
            "&:hover": {
              bgcolor: "#a30014",
            },
          }}
        >
          Assign New Task
        </Button>
      </Box>

      <Box sx={{ mb: 3, display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" }, gap: 2 }}>
        <FormControl fullWidth size="small">
          <InputLabel>Filter by Type</InputLabel>
          <Select value={taskTypeFilter} label="Filter by Type" onChange={(e) => setTaskTypeFilter(e.target.value)}>
            <MenuItem value="all">All Tasks</MenuItem>
            <MenuItem value="project">Project</MenuItem>
            <MenuItem value="event">Event</MenuItem>
          </Select>
        </FormControl>

        <FormControl fullWidth size="small">
          <InputLabel>Filter by Status</InputLabel>
          <Select value={statusFilter} label="Filter by Status" onChange={(e) => setStatusFilter(e.target.value)}>
            <MenuItem value="all">All Status</MenuItem>
            <MenuItem value="pending">Todo</MenuItem>
            <MenuItem value="in-progress">In Progress</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
          </Select>
        </FormControl>

        <FormControl fullWidth size="small">
          <InputLabel>Filter by Member</InputLabel>
          <Select value={memberFilter} label="Filter by Member" onChange={(e) => setMemberFilter(e.target.value)}>
            <MenuItem value="all">All Members</MenuItem>
            {members.map((member) => (
              <MenuItem key={member._id} value={member._id}>{member.fullName}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

          <Box sx={{ mb: 3, display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" }, gap: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Filter by Type</InputLabel>
              <Select value={taskTypeFilter} label="Filter by Type" onChange={(e) => setTaskTypeFilter(e.target.value)}>
                <MenuItem value="all">All Tasks</MenuItem>
                <MenuItem value="project">Project</MenuItem>
                <MenuItem value="event">Event</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth size="small">
              <InputLabel>Filter by Status</InputLabel>
              <Select value={statusFilter} label="Filter by Status" onChange={(e) => setStatusFilter(e.target.value)}>
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="pending">Todo</MenuItem>
                <MenuItem value="in-progress">In Progress</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth size="small">
              <InputLabel>Filter by Member</InputLabel>
              <Select value={memberFilter} label="Filter by Member" onChange={(e) => setMemberFilter(e.target.value)}>
                <MenuItem value="all">All Members</MenuItem>
                {members.map((member) => (
                  <MenuItem key={member._id} value={member._id}>{member.fullName}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

      {/* TABLE */}

      <TaskTable
            tasks={filteredTasks}
        getStatusColor={getStatusColor}
        onViewReports={(task) => {
          setSelectedTask(task);
          setReportsOpen(true);
          fetchReports(task._id);
        }}
        onEdit={(task) => {
          setSelectedTask({
            ...task,
            assignedTo: task.assignedTo?.map((item) => {
              const inner = item && item.member ? item.member : item;
              return inner?._id || inner?.id || inner;
            }) || [],
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
        onMarkComplete={handleStatusUpdate}
        onDelete={handleDeleteTask}
      />

      {/* CREATE TASK DIALOG */}

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

      <ReportsDialog
        open={reportsOpen}
        onClose={() => setReportsOpen(false)}
        task={selectedTask}
        reports={reports}
        loading={reportsLoading}
      />

      <EditTaskDialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSubmit={handleUpdateTask}
        submitting={submitting}
        task={selectedTask}
        setTask={setSelectedTask}
        members={members}
      />

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
              {
                withCredentials: true,
              }
            );

            toast.success("Member added");
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
    </Box>
  );
};

export default Uniques360Coordinator;