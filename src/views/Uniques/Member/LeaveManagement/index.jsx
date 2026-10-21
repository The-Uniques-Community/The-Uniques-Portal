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
import ModernTable from "@/components/tables/ModernTable";
import ModernHeader from "@/components/headers/ModernHeader";
import { BaseSkeleton } from "@/components/common/skeletons";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { toast } from "react-toastify";
import leaveService from "@/services/leaveService";

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
      const data = await leaveService.getMyLeaves();
      setLeaves(data.leaves || []);
    } catch (error) {
      console.error("Error fetching leaves:", error);
      if (error?.status === 401 || error?.response?.status === 401) {
        toast.error("Please login to view your leaves");
        return;
      }
      toast.error(error?.message || "Failed to load leave requests");
    } finally {
      setIsLoading(false);
    }
  };


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
        await leaveService.updateLeaveRequest(editingId, formData);
        toast.success("Leave request updated successfully");
      } else {
        await leaveService.submitLeaveRequest(formData);
        toast.success("Leave request submitted successfully");
      }

      handleCloseDialog();
      fetchLeaves();
    } catch (error) {
      console.error("Error saving leave:", error);
      toast.error(error.response?.data?.message || error?.message || "Failed to save leave request");
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
      await leaveService.deleteLeaveRequest(id);
      toast.success("Leave request deleted successfully");
      fetchLeaves();
    } catch (error) {
      console.error("Error deleting leave:", error);
      toast.error(error?.message || "Failed to delete leave request");
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
        <ModernHeader
          title="Leave"
          highlight="Management"
          subtitle="Submit, edit, and track your leave requests from one clean workspace."
          action={
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
              disabled={isLoading}
              sx={{
                bgcolor: "#ca0019",
                "&:hover": { bgcolor: "#a30014" },
                textTransform: "none",
                fontWeight: 700,
              }}
            >
              Request New Leave
            </Button>
          }
          sx={{ px: 0 }}
        />

        {/* Leave Statistics */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Submitted
                </Typography>
                <Typography variant="h5">
                  {isLoading ? <BaseSkeleton variant="text" width={40} height={32} /> : leaves.length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Pending Review
                </Typography>
                <Typography variant="h5">
                  {isLoading ? (
                    <BaseSkeleton variant="text" width={40} height={32} />
                  ) : (
                    leaves.filter((l) => l.status === "Pending").length
                  )}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Approved
                </Typography>
                <Typography variant="h5">
                  {isLoading ? (
                    <BaseSkeleton variant="text" width={40} height={32} />
                  ) : (
                    leaves.filter((l) => l.status === "Approved").length
                  )}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Rejected
                </Typography>
                <Typography variant="h5">
                  {isLoading ? (
                    <BaseSkeleton variant="text" width={40} height={32} />
                  ) : (
                    leaves.filter((l) => l.status === "Rejected").length
                  )}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Leave Table */}
        <ModernTable
          title="Leave Requests"
          loading={isLoading}
          columns={[
            { id: "type", label: "Leave Type" },
            { id: "startDate", label: "Start Date" },
            { id: "endDate", label: "End Date" },
            { id: "days", label: "Days", align: "center" },
            { id: "reason", label: "Reason" },
            { id: "status", label: "Status" },
            { id: "actions", label: "Actions", align: "center" },
          ]}
          data={leaves}
          renderRow={(leave) => (
            <>
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
            </>
          )}
        />
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
