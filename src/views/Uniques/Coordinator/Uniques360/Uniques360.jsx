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
  });

  const [selectedBatch, setSelectedBatch] = useState("");

  const [reportsOpen, setReportsOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [reports, setReports] = useState([]);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [teamSelectedBatch, setTeamSelectedBatch] = useState("");
  const [teamSelectedMember, setTeamSelectedMember] = useState("");

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

      await axios.post(
        `${BASE_URL}/api/uniques360/tasks`,
        newTask,
        {
          withCredentials: true,
        }
      );

      toast.success("Task assigned successfully");

      setOpen(false);

      setNewTask({
        title: "",
        description: "",
        assignedTo: [],
        deadline: "",
        priority: "medium",
      });

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
        assignedTo: prev.assignedTo.filter(
          (m) => m._id !== memberId
        ),
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

      {/* TABLE */}

      <TaskTable
        tasks={tasks}
        getStatusColor={getStatusColor}
        onViewReports={(task) => {
          setSelectedTask(task);
          setReportsOpen(true);
          fetchReports(task._id);
        }}
        onEdit={(task) => {
          setSelectedTask({
            ...task,
            assignedTo: task.assignedTo?.map((member) => member._id) || [],
          });

          setEditOpen(true);
        }}
        onManageTeam={(task) => {
          setSelectedTask(task);
          setTeamSelectedBatch("");
          setTeamSelectedMember("");
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
              },
              {
                withCredentials: true,
              }
            );

            toast.success("Member added");
            setTeamSelectedMember("");
            setTeamSelectedBatch("");
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
      />
    </Box>
  );
};

export default Uniques360Coordinator;