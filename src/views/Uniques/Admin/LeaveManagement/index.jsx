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
  Autocomplete,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import VisibilityIcon from "@mui/icons-material/Visibility";
import RefreshIcon from "@mui/icons-material/Refresh";
import { toast } from "react-toastify";
import { BASE_URL } from "@/config";
import ModernHeader from "@/utils/Header/ModernHeader";

const AdminLeaveManagement = () => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [actionType, setActionType] = useState("");
  const [leaves, setLeaves] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [memberFilter, setMemberFilter] = useState(null);

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

  const getUniqueMembersFromLeaves = () => {
    const uniqueMembers = [...new Set(leaves.map((leave) => leave.memberName))].sort();
    return uniqueMembers.map((name) => ({
      label: name,
      id: name,
    }));
  };

  const getDisplayLeaves = () => {
    let displayLeaves = [];
    switch (tabValue) {
      case 0:
        displayLeaves = pendingLeaves;
        break;
      case 1:
        displayLeaves = approvedLeaves;
        break;
      case 2:
        displayLeaves = rejectedLeaves;
        break;
      default:
        displayLeaves = [];
    }

    if (memberFilter) {
      displayLeaves = displayLeaves.filter(
        (leave) => leave.memberName === memberFilter.label
      );
    }

    return displayLeaves;
  };

  const getMemberLeaveStats = () => {
    if (!memberFilter) return null;
    const memberLeaves = leaves.filter(
      (leave) => leave.memberName === memberFilter.label
    );
    const approvedCount = memberLeaves.filter(
      (l) => l.status === "Approved"
    ).length;
    const totalDays = memberLeaves
      .filter((l) => l.status === "Approved")
      .reduce((sum, l) => sum + l.days, 0);
    const pendingCount = memberLeaves.filter(
      (l) => l.status === "Pending"
    ).length;

    return { total: memberLeaves.length, approved: approvedCount, totalDays, pending: pendingCount };
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
        body: JSON.stringify({ approvedBy: "Admin" }),
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
        body: JSON.stringify({ rejectionReason: rejectReason, rejectedBy: "Admin" }),
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
    <TableContainer component={Paper} sx={{ mt: 2, overflowX: "auto", maxWidth: "100%" }}>
      <Table>
        <TableHead sx={{ backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : theme.palette.primary.main }}>
          <TableRow>
            <TableCell sx={{ color: theme.palette.mode === 'dark' ? theme.palette.text.primary : "white", fontWeight: 600 }}>Member</TableCell>
            <TableCell sx={{ color: theme.palette.mode === 'dark' ? theme.palette.text.primary : "white", fontWeight: 600 }}>Leave Type</TableCell>
            <TableCell sx={{ color: theme.palette.mode === 'dark' ? theme.palette.text.primary : "white", fontWeight: 600 }}>Start Date</TableCell>
            <TableCell sx={{ color: theme.palette.mode === 'dark' ? theme.palette.text.primary : "white", fontWeight: 600 }}>End Date</TableCell>
            <TableCell sx={{ color: theme.palette.mode === 'dark' ? theme.palette.text.primary : "white", fontWeight: 600 }} align="center">Days</TableCell>
            <TableCell sx={{ color: theme.palette.mode === 'dark' ? theme.palette.text.primary : "white", fontWeight: 600 }}>Reason</TableCell>
            <TableCell sx={{ color: theme.palette.mode === 'dark' ? theme.palette.text.primary : "white", fontWeight: 600 }}>Status</TableCell>
            <TableCell sx={{ color: theme.palette.mode === 'dark' ? theme.palette.text.primary : "white", fontWeight: 600 }} align="center">Actions</TableCell>
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
                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
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
                <Typography sx={{ color: theme.palette.text.secondary }}>
                  {memberFilter
                    ? `No ${tabValue === 0 ? "pending" : tabValue === 1 ? "approved" : "rejected"} leave requests for ${memberFilter.label}`
                    : `No ${tabValue === 0 ? "pending" : tabValue === 1 ? "approved" : "rejected"} leave requests`}
                </Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 4 }, px: { xs: 1, sm: 2, md: 3 } }}>
      <Box sx={{ mb: 4 }}>
        <ModernHeader
          title="Leave"
          highlight="Management"
          subtitle="Review member leave requests, filter by member, and keep approvals moving clearly."
          action={
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={fetchLeaves}
              disabled={isLoading}
            >
              {isLoading ? "Loading..." : "Refresh"}
            </Button>
          }
          sx={{ px: 0 }}
        />

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
                <Card sx={{ backgroundColor: theme.palette.background.paper }}>
                  <CardContent>
                    <Typography sx={{ color: theme.palette.text.secondary }} gutterBottom>Pending Requests</Typography>
                    <Typography variant="h5" sx={{ color: theme.palette.text.primary }}>{pendingLeaves.length}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ backgroundColor: theme.palette.background.paper }}>
                  <CardContent>
                    <Typography sx={{ color: theme.palette.text.secondary }} gutterBottom>Approved</Typography>
                    <Typography variant="h5" sx={{ color: theme.palette.text.primary }}>{approvedLeaves.length}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ backgroundColor: theme.palette.background.paper }}>
                  <CardContent>
                    <Typography sx={{ color: theme.palette.text.secondary }} gutterBottom>Rejected</Typography>
                    <Typography variant="h5" sx={{ color: theme.palette.text.primary }}>{rejectedLeaves.length}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ backgroundColor: theme.palette.background.paper }}>
                  <CardContent>
                    <Typography sx={{ color: theme.palette.text.secondary }} gutterBottom>Total Requests</Typography>
                    <Typography variant="h5" sx={{ color: theme.palette.text.primary }}>{leaves.length}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {leaves.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Autocomplete
                  options={getUniqueMembersFromLeaves()}
                  value={memberFilter}
                  onChange={(e, newValue) => {
                    setMemberFilter(newValue);
                  }}
                  getOptionLabel={(option) => option.label || ""}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Filter by Member"
                      placeholder="Search member name..."
                      variant="outlined"
                      size="small"
                    />
                  )}
                  clearIcon={null}
                  sx={{ maxWidth: 300 }}
                />
                {memberFilter && (
                  <Box sx={{ mt: 2, p: 2, bgcolor: theme.palette.mode === "dark" ? "rgba(25, 118, 210, 0.15)" : "rgba(25, 118, 210, 0.1)", borderRadius: 1, border: `1px solid ${theme.palette.divider}` }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: theme.palette.text.primary }}>
                      {memberFilter.label}'s Leave Statistics
                    </Typography>
                    <Grid container spacing={1}>
                      <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="body2" sx={{ color: theme.palette.text.primary }}>
                          <strong>Total Requests:</strong> {getMemberLeaveStats()?.total || 0}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="body2" sx={{ color: theme.palette.text.primary }}>
                          <strong>Approved:</strong> {getMemberLeaveStats()?.approved || 0}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="body2" sx={{ color: theme.palette.text.primary }}>
                          <strong>Total Days:</strong> {getMemberLeaveStats()?.totalDays || 0}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="body2" sx={{ color: theme.palette.text.primary }}>
                          <strong>Pending:</strong> {getMemberLeaveStats()?.pending || 0}
                        </Typography>
                      </Grid>
                    </Grid>
                    <Button
                      variant="text"
                      size="small"
                      onClick={() => setMemberFilter(null)}
                      sx={{ mt: 1 }}
                    >
                      Clear Filter
                    </Button>
                  </Box>
                )}
              </Box>
            )}

            <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
              <Tabs 
                value={tabValue} 
                onChange={(e, newValue) => setTabValue(newValue)}
                variant="scrollable"
                scrollButtons="auto"
                allowScrollButtonsMobile
              >
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
              <Box sx={{ p: 2, bgcolor: theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)", borderRadius: 1, border: `1px solid ${theme.palette.divider}` }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: theme.palette.text.primary }}>Member Information</Typography>
                <Typography variant="body2" sx={{ color: theme.palette.text.primary }}><strong>Name:</strong> {selectedLeave.memberName}</Typography>
                <Typography variant="body2" sx={{ color: theme.palette.text.primary }}><strong>Email:</strong> {selectedLeave.memberEmail}</Typography>
                {selectedLeave.memberPhone && (
                  <Typography variant="body2" sx={{ color: theme.palette.text.primary }}><strong>Phone:</strong> {selectedLeave.memberPhone}</Typography>
                )}
              </Box>

              <Box sx={{ p: 2, bgcolor: theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)", borderRadius: 1, border: `1px solid ${theme.palette.divider}` }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: theme.palette.text.primary }}>Leave Information</Typography>
                <Typography variant="body2" sx={{ color: theme.palette.text.primary }}><strong>Type:</strong> {selectedLeave.type}</Typography>
                <Typography variant="body2" sx={{ color: theme.palette.text.primary }}><strong>Start Date:</strong> {new Date(selectedLeave.startDate).toLocaleDateString()}</Typography>
                <Typography variant="body2" sx={{ color: theme.palette.text.primary }}><strong>End Date:</strong> {new Date(selectedLeave.endDate).toLocaleDateString()}</Typography>
                <Typography variant="body2" sx={{ color: theme.palette.text.primary }}><strong>Number of Days:</strong> {selectedLeave.days}</Typography>
                <Typography variant="body2" sx={{ color: theme.palette.text.primary }}><strong>Applied On:</strong> {new Date(selectedLeave.appliedDate).toLocaleDateString()}</Typography>
              </Box>

              <Box sx={{ p: 2, bgcolor: theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)", borderRadius: 1, border: `1px solid ${theme.palette.divider}` }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: theme.palette.text.primary }}>Reason</Typography>
                <Typography variant="body2" sx={{ color: theme.palette.text.primary }}>{selectedLeave.reason}</Typography>
              </Box>

              {selectedLeave.status === "Approved" && (
                <Box sx={{ p: 2, bgcolor: theme.palette.mode === "dark" ? "rgba(76, 175, 80, 0.15)" : "rgba(76, 175, 80, 0.1)", borderRadius: 1, border: `1px solid ${theme.palette.success.main}` }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: theme.palette.text.primary }}>Approval Information</Typography>
                  <Typography variant="body2" sx={{ color: theme.palette.text.primary }}><strong>Approved By:</strong> {selectedLeave.approvedBy}</Typography>
                  <Typography variant="body2" sx={{ color: theme.palette.text.primary }}><strong>Approved Date:</strong> {new Date(selectedLeave.approvedDate).toLocaleDateString()}</Typography>
                </Box>
              )}

              {selectedLeave.status === "Rejected" && (
                <Box sx={{ p: 2, bgcolor: theme.palette.mode === "dark" ? "rgba(244, 67, 54, 0.15)" : "rgba(244, 67, 54, 0.1)", borderRadius: 1, border: `1px solid ${theme.palette.error.main}` }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: theme.palette.text.primary }}>Rejection Information</Typography>
                  <Typography variant="body2" sx={{ color: theme.palette.text.primary }}><strong>Rejected By:</strong> {selectedLeave.rejectedBy}</Typography>
                  <Typography variant="body2" sx={{ color: theme.palette.text.primary }}><strong>Rejected Date:</strong> {new Date(selectedLeave.rejectedDate).toLocaleDateString()}</Typography>
                  <Typography variant="body2" sx={{ color: theme.palette.text.primary }}><strong>Reason:</strong> {selectedLeave.rejectionReason}</Typography>
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

export default AdminLeaveManagement;
