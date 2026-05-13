import React, { useState, useEffect } from "react";
import {
  Container,
  Paper,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
  Chip,
  Card,
  CardContent,
  Grid,
  Stack,
  useTheme,
  CircularProgress,
  Alert,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { toast } from "react-toastify";
import { BASE_URL } from "@/config";

const LeaveManagement = () => {
  const theme = useTheme();
  
  const [leaves, setLeaves] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    type: "",
    startDate: "",
    endDate: "",
    reason: "",
  });

  const leaveTypes = ["Sick Leave", "Casual Leave", "Annual Leave", "Maternity Leave", "Paternity Leave"];

  // Load leaves from API
  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${BASE_URL}/api/leave/my-leaves`, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status === 401) {
          toast.error("Please login to view your leaves");
          return;
        }
        throw new Error("Failed to fetch leaves");
      }

      const data = await response.json();
      setLeaves(data.leaves || []);
    } catch (error) {
      console.error("Error fetching leaves:", error);
      toast.error("Failed to load leave requests");
    } finally {
      setIsLoading(false);
    }
  }


  const handleOpenDialog = (leave = null) => {
    if (leave) {
      setEditingId(leave._id);
      setFormData({
        type: leave.type,
        startDate: leave.startDate.split("T")[0],
        endDate: leave.endDate.split("T")[0],
        reason: leave.reason,
      });
    } else {
      setEditingId(null);
      setFormData({
        type: "",
        startDate: "",
        endDate: "",
        reason: "",
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingId(null);
    setFormData({
      type: "",
      startDate: "",
      endDate: "",
      reason: "",
    });
  };

  const handleSave = async () => {
    if (!formData.type || !formData.startDate || !formData.endDate || !formData.reason) {
      toast.error("Please fill in all fields");
      return;
    }

    if (new Date(formData.startDate) > new Date(formData.endDate)) {
      toast.error("Start date must be before end date");
      return;
    }

    try {
      setIsLoading(true);

      if (editingId) {
        const response = await fetch(`${BASE_URL}/api/leave/${editingId}`, {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Failed to update leave request");
        toast.success("Leave request updated successfully");
      } else {
        const response = await fetch(`${BASE_URL}/api/leave/submit`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Failed to submit leave request");
        toast.success("Leave request submitted successfully");
      }

      handleCloseDialog();
      fetchLeaves();
    } catch (error) {
      console.error("Error saving leave:", error);
      toast.error(error.message || "Failed to save leave request");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this leave request?")) {
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`${BASE_URL}/api/leave/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to delete leave request");
      }

      toast.success("Leave request deleted successfully");
      fetchLeaves();
    } catch (error) {
      console.error("Error deleting leave:", error);
      toast.error("Failed to delete leave request");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Approved":
        return "success";
      case "Rejected":
        return "error";
      case "Pending":
        return "warning";
      default:
        return "default";
    }
  };

  const pendingLeaves = leaves.filter((l) => l.status === "Pending");
  const approvedLeaves = leaves.filter((l) => l.status === "Approved");
  const rejectedLeaves = leaves.filter((l) => l.status === "Rejected");

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 3 }}>
          Leave Management
        </Typography>

        {isLoading && <CircularProgress />}

        {/* Leave Statistics */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Submitted
                </Typography>
                <Typography variant="h5">{leaves.length}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Pending Review
                </Typography>
                <Typography variant="h5">{leaves.filter((l) => l.status === "Pending").length}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Approved
                </Typography>
                <Typography variant="h5">{leaves.filter((l) => l.status === "Approved").length}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Rejected
                </Typography>
                <Typography variant="h5">{leaves.filter((l) => l.status === "Rejected").length}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Add New Leave Button */}
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{ mb: 3 }}
          disabled={isLoading}
        >
          Request New Leave
        </Button>

        {/* Leave Table */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead sx={{ backgroundColor: theme.palette.primary.light }}>
              <TableRow>
                <TableCell sx={{ color: "white", fontWeight: 600 }}>Leave Type</TableCell>
                <TableCell sx={{ color: "white", fontWeight: 600 }}>Start Date</TableCell>
                <TableCell sx={{ color: "white", fontWeight: 600 }}>End Date</TableCell>
                <TableCell sx={{ color: "white", fontWeight: 600 }} align="center">
                  Days
                </TableCell>
                <TableCell sx={{ color: "white", fontWeight: 600 }}>Reason</TableCell>
                <TableCell sx={{ color: "white", fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ color: "white", fontWeight: 600 }} align="center">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {leaves.length > 0 ? (
                leaves.map((leave) => (
                  <TableRow key={leave._id} hover>
                    <TableCell>{leave.type}</TableCell>
                    <TableCell>{new Date(leave.startDate).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(leave.endDate).toLocaleDateString()}</TableCell>
                    <TableCell align="center">{leave.days}</TableCell>
                    <TableCell>{leave.reason}</TableCell>
                    <TableCell>
                      <Chip
                        label={leave.status}
                        color={leave.status === "Approved" ? "success" : leave.status === "Rejected" ? "error" : "warning"}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={1} justifyContent="center">
                        {leave.status === "Pending" && (
                          <>
                            <Button
                              size="small"
                              startIcon={<EditIcon />}
                              onClick={() => handleOpenDialog(leave)}
                              variant="outlined"
                              disabled={isLoading}
                            >
                              Edit
                            </Button>
                            <Button
                              size="small"
                              startIcon={<DeleteIcon />}
                              onClick={() => handleDelete(leave._id)}
                              color="error"
                              variant="outlined"
                              disabled={isLoading}
                            >
                              Delete
                            </Button>
                          </>
                        )}
                        {leave.status !== "Pending" && (
                          <Typography variant="body2" color="textSecondary">
                            No actions available
                          </Typography>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                    <Typography color="textSecondary">No leave requests yet</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Leave Request Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? "Edit Leave Request" : "Request New Leave"}</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2}>
            <FormControl fullWidth>
              <InputLabel>Leave Type</InputLabel>
              <Select
                value={formData.type}
                label="Leave Type"
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                {leaveTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Start Date"
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />

            <TextField
              label="End Date"
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />

            <TextField
              label="Reason"
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              multiline
              rows={4}
              fullWidth
            />

            <Box
              sx={{
                p: 2,
                bgcolor: theme.palette.mode === "dark" ? "grey.800" : "grey.100",
                borderRadius: 1,
              }}
            >
              <Typography variant="body2">
                <strong>Note:</strong> Leave requests will be reviewed by admin and coordinator.
              </Typography>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" disabled={isLoading}>
            {isLoading ? "Processing..." : editingId ? "Update" : "Submit"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default LeaveManagement;
