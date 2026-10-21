/**
 * @file LeaveManagement/index.jsx
 * @description Admin leave management view with server-side pagination, status tabs, and ModernTable.
 */

import React, { useState } from "react";
import {
  Container,
  Paper,
  Box,
  Button,
  TableCell,
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
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import VisibilityIcon from "@mui/icons-material/Visibility";
import RefreshIcon from "@mui/icons-material/Refresh";
import { toast } from "react-toastify";
import leaveService from "@/services/leaveService";
import ModernHeader from "@/components/headers/ModernHeader";
import ModernTable from "@/components/tables/ModernTable";
import SearchFilterBar from "@/components/common/filters/SearchFilterBar";
import { usePaginatedQuery } from "@/hooks/usePaginatedQuery";

const STATUS_TABS = ["Pending", "Approved", "Rejected"];

const LeaveManagement = () => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [actionType, setActionType] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const {
    data: leaves,
    loading,
    search,
    page,
    limit,
    pagination,
    setPage,
    setLimit,
    setSearch,
    setFilter,
    refetch,
  } = usePaginatedQuery({
    query: leaveService.getAllLeaves,
    defaultLimit: 10,
    defaultFilters: { status: "Pending" },
  });

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setFilter("status", STATUS_TABS[newValue]);
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
      setActionLoading(true);
      await leaveService.approveLeave(selectedLeave._id, {
        approvedBy: "Admin",
        remarks: "Approved by Admin",
      });
      toast.success(`Leave approved for ${selectedLeave.memberName}`);
      handleCloseDialog();
      refetch();
    } catch (error) {
      console.error("Error approving leave:", error);
      toast.error(error?.message || "Failed to approve leave request");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectLeave = async () => {
    if (!selectedLeave) return;
    if (!rejectReason.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }
    try {
      setActionLoading(true);
      await leaveService.rejectLeave(selectedLeave._id, {
        rejectionReason: rejectReason,
        rejectedBy: "Admin",
        remarks: rejectReason,
      });
      toast.success(`Leave rejected for ${selectedLeave.memberName}`);
      handleCloseDialog();
      refetch();
    } catch (error) {
      console.error("Error rejecting leave:", error);
      toast.error(error?.message || "Failed to reject leave request");
    } finally {
      setActionLoading(false);
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

  const columns = [
    { id: "member", label: "Member", width: "20%" },
    { id: "type", label: "Leave Type", width: "12%" },
    { id: "startDate", label: "Start Date", width: "12%" },
    { id: "endDate", label: "End Date", width: "12%" },
    { id: "days", label: "Days", align: "center", width: "8%" },
    { id: "reason", label: "Reason", width: "18%" },
    { id: "status", label: "Status", width: "8%" },
    { id: "actions", label: "Actions", align: "center", width: "10%" },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 4 }, px: { xs: 1, sm: 2, md: 3 } }}>
      <Box sx={{ mb: 4 }}>
        <ModernHeader
          title="Leave"
          highlight="Management"
          subtitle="Review member leave requests with server-side pagination and status tabs."
          action={
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={refetch}
              disabled={loading}
            >
              Refresh
            </Button>
          }
          sx={{ px: 0 }}
        />

        <SearchFilterBar
          search={search}
          onSearchChange={setSearch}
          placeholder="Search member name or reason..."
          loading={loading}
          filterSlot={
            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                variant="scrollable"
                scrollButtons="auto"
              >
                <Tab label="Pending" />
                <Tab label="Approved" />
                <Tab label="Rejected" />
              </Tabs>
            </Box>
          }
        />

        <ModernTable
          columns={columns}
          data={leaves}
          loading={loading}
          pagination={{
            page,
            limit,
            total: pagination.total,
            pages: pagination.pages,
            onPageChange: setPage,
            onLimitChange: setLimit,
          }}
          renderRow={(leave) => (
            <React.Fragment key={leave._id}>
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
              <TableCell sx={{ maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {leave.reason}
              </TableCell>
              <TableCell>
                <Chip label={leave.status} color={getStatusColor(leave.status)} size="small" />
              </TableCell>
              <TableCell align="center">
                <Stack direction="row" spacing={0.5} justifyContent="center">
                  <Button
                    size="small"
                    startIcon={<VisibilityIcon />}
                    onClick={() => handleOpenDialog(leave, "view")}
                    variant="outlined"
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
                      >
                        Approve
                      </Button>
                      <Button
                        size="small"
                        startIcon={<CancelIcon />}
                        onClick={() => handleOpenDialog(leave, "reject")}
                        color="error"
                        variant="outlined"
                      >
                        Reject
                      </Button>
                    </>
                  )}
                </Stack>
              </TableCell>
            </React.Fragment>
          )}
        />
      </Box>

      {/* Details / Action Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {actionType === "view" && "Leave Request Details"}
          {actionType === "approve" && "Approve Leave Request"}
          {actionType === "reject" && "Reject Leave Request"}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {selectedLeave && (
            <Stack spacing={2}>
              <Box sx={{ p: 2, bgcolor: theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)", borderRadius: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Member Information</Typography>
                <Typography variant="body2"><strong>Name:</strong> {selectedLeave.memberName}</Typography>
                <Typography variant="body2"><strong>Email:</strong> {selectedLeave.memberEmail}</Typography>
              </Box>

              <Box sx={{ p: 2, bgcolor: theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)", borderRadius: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Leave Details</Typography>
                <Typography variant="body2"><strong>Type:</strong> {selectedLeave.type}</Typography>
                <Typography variant="body2"><strong>Start Date:</strong> {new Date(selectedLeave.startDate).toLocaleDateString()}</Typography>
                <Typography variant="body2"><strong>End Date:</strong> {new Date(selectedLeave.endDate).toLocaleDateString()}</Typography>
                <Typography variant="body2"><strong>Days:</strong> {selectedLeave.days}</Typography>
                <Typography variant="body2"><strong>Reason:</strong> {selectedLeave.reason}</Typography>
              </Box>

              {actionType === "reject" && (
                <TextField
                  label="Rejection Reason"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  multiline
                  rows={4}
                  fullWidth
                  placeholder="Enter rejection reason..."
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
            <Button onClick={handleApproveLeave} variant="contained" color="success" disabled={actionLoading}>
              Approve
            </Button>
          )}
          {actionType === "reject" && (
            <Button onClick={handleRejectLeave} variant="contained" color="error" disabled={actionLoading}>
              Reject
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default LeaveManagement;
