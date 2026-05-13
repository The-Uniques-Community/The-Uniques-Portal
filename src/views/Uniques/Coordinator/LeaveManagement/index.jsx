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
  Typography,
  Chip,
  Card,
  CardContent,
  Grid,
  Stack,
  useTheme,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import VisibilityIcon from "@mui/icons-material/Visibility";
import RefreshIcon from "@mui/icons-material/Refresh";
import { toast } from "react-toastify";
import { BASE_URL } from "@/config";

const CoordinatorLeaveManagement = () => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [actionType, setActionType] = useState("");
  const [leaves, setLeaves] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchLeaves();
    const handleVisibilityChange = () => {
      if (!document.hidden) fetchLeaves();
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  const fetchLeaves = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${BASE_URL}/api/leave/all`, {
        method: "GET",
        credentials: "include",
      });
      if (!response.ok) {
        if (response.status === 401) {
          toast.error("Please login to view leave requests");
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
  };

  const pendingLeaves = leaves.filter((l) => l.status === "Pending");
  const approvedLeaves = leaves.filter((l) => l.status === "Approved");
  const rejectedLeaves = leaves.filter((l) => l.status === "Rejected");

  const getDisplayLeaves = () => {
    switch (tabValue) {
      case 0: return pendingLeaves;
      case 1: return approvedLeaves;
      case 2: return rejectedLeaves;
      default: return [];
    }
  };

  const handleOpenDialog = (leave, type) => {
    setSelectedLeave(leave);
    setActionType(type);
    setRejectReason("");
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedLeave(null);
    setActionType("");
    setRejectReason("");
  };

  const handleApproveLeave = async () => {
    if (!selectedLeave) return;
    try {
      setIsLoading(true);
      const response = await fetch(`${BASE_URL}/api/leave/${selectedLeave._id}/approve`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approvedBy: "Coordinator" }),
      });
      if (!response.ok) throw new Error("Failed to approve leave");
      toast.success(`Leave approved for ${selectedLeave.memberName}`);
      handleCloseDialog();
      fetchLeaves();
    } catch (error) {
      console.error("Error approving leave:", error);
      toast.error("Failed to approve leave request");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRejectLeave = async () => {
    if (!selectedLeave) return;
    if (!rejectReason.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }
    try {
      setIsLoading(true);
      const response = await fetch(`${BASE_URL}/api/leave/${selectedLeave._id}/reject`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rejectionReason: rejectReason, rejectedBy: "Coordinator" }),
      });
      if (!response.ok) throw new Error("Failed to reject leave");
      toast.success(`Leave rejected for ${selectedLeave.memberName}`);
      handleCloseDialog();
      fetchLeaves();
    } catch (error) {
      console.error("Error rejecting leave:", error);
      toast.error("Failed to reject leave request");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Approved": return "success";
      case "Rejected": return "error";
      case "Pending": return "warning";
      default: return "default";
    }
  };

  const LeaveTable = ({ leavesToDisplay }) => (
    <TableContainer component={Paper} sx={{ mt: 2 }}>
      <Table>
        <TableHead sx={{ backgroundColor: theme.palette.primary.light }}>
          <TableRow>
            <TableCell sx={{ color: "white", fontWeight: 600 }}>Member</TableCell>
            <TableCell sx={{ color: "white", fontWeight: 600 }}>Leave Type</TableCell>
            <TableCell sx={{ color: "white", fontWeight: 600 }}>Start Date</TableCell>
            <TableCell sx={{ color: "white", fontWeight: 600 }}>End Date</TableCell>
            <TableCell sx={{ color: "white", fontWeight: 600 }} align="center">Days</TableCell>
            <TableCell sx={{ color: "white", fontWeight: 600 }}>Reason</TableCell>
            <TableCell sx={{ color: "white", fontWeight: 600 }}>Status</TableCell>
            <TableCell sx={{ color: "white", fontWeight: 600 }} align="center">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {leavesToDisplay.length > 0 ? (
            leavesToDisplay.map((leave) => (
              <TableRow key={leave._id} hover>
                <TableCell>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {leave.memberName}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {leave.memberEmail}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>{leave.type}</TableCell>
                <TableCell>{new Date(leave.startDate).toLocaleDateString()}</TableCell>
                <TableCell>{new Date(leave.endDate).toLocaleDateString()}</TableCell>
                <TableCell align="center">{leave.days}</TableCell>
                <TableCell>{leave.reason}</TableCell>
                <TableCell>
                  <Chip label={leave.status} color={getStatusColor(leave.status)} size="small" />
                </TableCell>
                <TableCell align="center">
                  <Stack direction="row" spacing={1} justifyContent="center">
                    <Button
                      size="small"
                      startIcon={<VisibilityIcon />}
                      onClick={() => handleOpenDialog(leave, "view")}
                      variant="outlined"
                      disabled={isLoading}
                    >
                      View
                    </Button>
                    {leave.status === "Pending" && (
                      <>
                        <Button
                          size="small"
                          startIcon={<CheckCircleIcon />}
                          onClick={() => handleOpenDialog(leave, "approve")}
                          color="success"
                          variant="outlined"
                          disabled={isLoading}
                        >
                          Approve
                        </Button>
                        <Button
                          size="small"
                          startIcon={<CancelIcon />}
                          onClick={() => handleOpenDialog(leave, "reject")}
                          color="error"
                          variant="outlined"
                          disabled={isLoading}
                        >
                          Reject
                        </Button>
                      </>
                    )}
                  </Stack>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                <Typography color="textSecondary">
                  No {tabValue === 0 ? "pending" : tabValue === 1 ? "approved" : "rejected"} leave requests
                </Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            Leave Management
          </Typography>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchLeaves}
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : "Refresh"}
          </Button>
        </Box>

        {!isLoading && leaves.length === 0 && (
          <Alert severity="info" sx={{ mb: 3 }}>
            No leave requests found. Members can submit leave requests from their dashboard.
          </Alert>
        )}

        {isLoading && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {!isLoading && (
          <>
            <Grid container spacing={2} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>Pending Requests</Typography>
                    <Typography variant="h5">{pendingLeaves.length}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>Approved</Typography>
                    <Typography variant="h5">{approvedLeaves.length}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>Rejected</Typography>
                    <Typography variant="h5">{rejectedLeaves.length}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>Total Requests</Typography>
                    <Typography variant="h5">{leaves.length}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
              <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
                <Tab label={`Pending (${pendingLeaves.length})`} />
                <Tab label={`Approved (${approvedLeaves.length})`} />
                <Tab label={`Rejected (${rejectedLeaves.length})`} />
              </Tabs>
            </Box>

            <LeaveTable leavesToDisplay={getDisplayLeaves()} />
          </>
        )}
      </Box>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {actionType === "view" && "Leave Request Details"}
          {actionType === "approve" && "Approve Leave Request"}
          {actionType === "reject" && "Reject Leave Request"}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {selectedLeave && (
            <Stack spacing={2}>
              <Box sx={{ p: 2, bgcolor: theme.palette.mode === "dark" ? "grey.800" : "grey.100", borderRadius: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Member Information</Typography>
                <Typography variant="body2"><strong>Name:</strong> {selectedLeave.memberName}</Typography>
                <Typography variant="body2"><strong>Email:</strong> {selectedLeave.memberEmail}</Typography>
                {selectedLeave.memberPhone && (
                  <Typography variant="body2"><strong>Phone:</strong> {selectedLeave.memberPhone}</Typography>
                )}
              </Box>

              <Box sx={{ p: 2, bgcolor: theme.palette.mode === "dark" ? "grey.800" : "grey.100", borderRadius: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Leave Information</Typography>
                <Typography variant="body2"><strong>Type:</strong> {selectedLeave.type}</Typography>
                <Typography variant="body2"><strong>Start Date:</strong> {new Date(selectedLeave.startDate).toLocaleDateString()}</Typography>
                <Typography variant="body2"><strong>End Date:</strong> {new Date(selectedLeave.endDate).toLocaleDateString()}</Typography>
                <Typography variant="body2"><strong>Number of Days:</strong> {selectedLeave.days}</Typography>
                <Typography variant="body2"><strong>Applied On:</strong> {new Date(selectedLeave.appliedDate).toLocaleDateString()}</Typography>
              </Box>

              <Box sx={{ p: 2, bgcolor: theme.palette.mode === "dark" ? "grey.800" : "grey.100", borderRadius: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Reason</Typography>
                <Typography variant="body2">{selectedLeave.reason}</Typography>
              </Box>

              {selectedLeave.status === "Approved" && (
                <Box sx={{ p: 2, bgcolor: theme.palette.success.light, borderRadius: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Approval Information</Typography>
                  <Typography variant="body2"><strong>Approved By:</strong> {selectedLeave.approvedBy}</Typography>
                  <Typography variant="body2"><strong>Approved Date:</strong> {new Date(selectedLeave.approvedDate).toLocaleDateString()}</Typography>
                </Box>
              )}

              {selectedLeave.status === "Rejected" && (
                <Box sx={{ p: 2, bgcolor: theme.palette.error.light, borderRadius: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Rejection Information</Typography>
                  <Typography variant="body2"><strong>Rejected By:</strong> {selectedLeave.rejectedBy}</Typography>
                  <Typography variant="body2"><strong>Rejected Date:</strong> {new Date(selectedLeave.rejectedDate).toLocaleDateString()}</Typography>
                  <Typography variant="body2"><strong>Reason:</strong> {selectedLeave.rejectionReason}</Typography>
                </Box>
              )}

              {actionType === "reject" && (
                <TextField
                  label="Rejection Reason"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  multiline
                  rows={4}
                  fullWidth
                  placeholder="Enter the reason for rejecting this leave request..."
                />
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>
            {actionType === "view" ? "Close" : "Cancel"}
          </Button>
          {actionType === "approve" && (
            <Button onClick={handleApproveLeave} variant="contained" color="success" disabled={isLoading}>
              Approve
            </Button>
          )}
          {actionType === "reject" && (
            <Button onClick={handleRejectLeave} variant="contained" color="error" disabled={isLoading}>
              Reject
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CoordinatorLeaveManagement;
