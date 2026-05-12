import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  CircularProgress,
  useTheme,
  Pagination,
  alpha,
  Chip,
  Tooltip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar,
  Alert,
} from "@mui/material";
import {
  AddCircleOutline,
  EventNote,
  EventAvailable,
  EventBusy,
  Visibility,
  CurrencyRupee,
  PhotoLibrary,
  AttachMoney,
  Delete,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const index = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    ongoing: 0,
    upcoming: 0,
    completed: 0,
    totalBudget: 0, // New stat for total budget allocated
    pendingExpenses: 0, // New stat for pending expenses
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    count: 0,
    total: 0,
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const navigate = useNavigate();
  const theme = useTheme();

  const fetchEvents = async (page = 1) => {
    try {
      setLoading(true);
      // Add page parameter to the API endpoint
      const response = await fetch(
        `http://localhost:5000/api/events?page=${page}`
      );
      const data = await response.json();

      if (data.success) {
        // Sort events before setting state
        const sortedEvents = sortEventsByPriority(data.events || []);
        setEvents(sortedEvents);

        // Update pagination info
        setPagination({
          currentPage: data.currentPage,
          totalPages: data.totalPages,
          count: data.count,
          total: data.total,
        });

        // Calculate stats
        const ongoing = data?.totalOngoing || 0
        const upcoming = data?.totalUpcoming || 0
        const completed = data.events.filter(
          (event) => event.eventStatus === "completed"
        ).length;

        // Calculate budget stats
        let totalBudget = 0;
        let pendingExpenses = 0;

        data.events.forEach((event) => {
          if (event.budget && event.budget.totalAllocated) {
            totalBudget += event.budget.totalAllocated;
          }

          if (event.expenses) {
            pendingExpenses += event.expenses.filter(
              (expense) => expense.paymentStatus === "pending"
            ).length;
          }
        });

        setStats({
          total: data.total,
          ongoing,
          upcoming,
          completed,
          totalBudget,
          pendingExpenses,
        });
      }
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to sort events by priority and date
  const sortEventsByPriority = (eventsArray) => {
    // Define status priority
    const statusPriority = {
      ongoing: 1,
      upcoming: 2,
      completed: 3,
    };

    return [...eventsArray].sort((a, b) => {
      // First, sort by status priority
      const statusDiff =
        statusPriority[a.eventStatus] - statusPriority[b.eventStatus];

      if (statusDiff !== 0) return statusDiff;

      // If same status, sort by date based on status type
      const dateA = new Date(a.eventDate);
      const dateB = new Date(b.eventDate);

      // For upcoming events: sort from soonest to furthest
      if (a.eventStatus === "upcoming") {
        return dateA - dateB;
      }

      // For ongoing and completed: sort from newest to oldest
      return dateB - dateA;
    });
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handlePageChange = (event, value) => {
    fetchEvents(value);
  };

  const handleCreateEvent = () => {
    navigate("/admin/events-overview/create");
  };
 
  const handleViewEvent = (eventId) => {
    navigate(`/admin/events-overview/view/${eventId}`);
  };

  const handleViewBudget = (eventId) => {
    navigate(`/admin/events-overview/${eventId}/budget`);
  };

  const handleViewGallery = (eventId) => {
    navigate(`/admin/events/${eventId}/gallery`);
  };

  const handleDeleteClick = (eventId) => {
    setEventToDelete(eventId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!eventToDelete) return;

    try {
      setDeleteLoading(true);
      const response = await fetch(
        `http://localhost:5000/api/events/${eventToDelete}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          // Important: backend uses verifyToken which usually checks cookies
          // fetch needs credentials: 'include' to send cookies
          credentials: "include",
        }
      );

      const data = await response.json();

      if (data.success) {
        setSnackbar({
          open: true,
          message: "Event deleted successfully",
          severity: "success",
        });
        // Refresh the list
        fetchEvents(pagination.currentPage);
      } else {
        setSnackbar({
          open: true,
          message: data.message || "Failed to delete event",
          severity: "error",
        });
      }
    } catch (error) {
      console.error("Error deleting event:", error);
      setSnackbar({
        open: true,
        message: "An error occurred while deleting the event",
        severity: "error",
      });
    } finally {
      setDeleteLoading(false);
      setDeleteDialogOpen(false);
      setEventToDelete(null);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "ongoing":
        return "#ff4d4f"; // Red for live/ongoing
      case "completed":
        return "#52c41a"; // Green for completed
      case "upcoming":
        return "#faad14"; // Yellow for upcoming
      default:
        return "#d9d9d9"; // Grey default
    }
  };

  const renderStatusIndicator = (status) => (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <Box
        sx={{
          width: 10,
          height: 10,
          borderRadius: "50%",
          backgroundColor: getStatusColor(status),
          boxShadow: `0 0 5px ${getStatusColor(status)}`,
        }}
      />
      <Typography variant="body2" sx={{ textTransform: "capitalize" }}>
        {status}
      </Typography>
    </Box>
  );

  // Format date to a more readable format
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Format currency
  const formatCurrency = (amount, currency = "INR") => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: "bold" }}>
        Event Management
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2} sx={{ borderRadius: 2, boxShadow: "none" }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Events
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <EventNote sx={{ mr: 1, color: theme.palette.primary.main }} />
                <Typography variant="h4">{stats.total}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2} sx={{ borderRadius: 2, boxShadow: "none" }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Ongoing Events
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Box
                  sx={{
                    mr: 1,
                    display: "flex",
                    alignItems: "center",
                    color: "#ff4d4f",
                  }}
                >
                  <EventAvailable />
                </Box>
                <Typography variant="h4">{stats.ongoing}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2} sx={{ borderRadius: 2, boxShadow: "none" }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Upcoming Events
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Box sx={{ mr: 1, color: "#faad14" }}>
                  <EventNote />
                </Box>
                <Typography variant="h4">{stats.upcoming}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2} sx={{ borderRadius: 2, boxShadow: "none" }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Budget Allocated
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Box sx={{ mr: 1, color: "#1890ff" }}>
                  <CurrencyRupee />
                </Box>
                <Typography variant="h4">
                  {formatCurrency(stats.totalBudget)}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Events Table with Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h5">Events List</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddCircleOutline />}
          onClick={handleCreateEvent}
          sx={{ borderRadius: 2 }}
        >
          Create New Event
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : events.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: "center", borderRadius: 2 }}>
          <Typography variant="h6" sx={{ mb: 2, color: "text.secondary" }}>
            No events found
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddCircleOutline />}
            onClick={handleCreateEvent}
            sx={{ borderRadius: 2 }}
          >
            Create Your First Event
          </Button>
        </Paper>
      ) : (
        <>
          <TableContainer component={Paper} sx={{ borderRadius: 2, mb: 2 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: theme.palette.action.hover }}>
                  <TableCell>Event Name</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Budget Status</TableCell>
                  <TableCell>Venue</TableCell>
                  <TableCell>Event Type</TableCell>
                  <TableCell>Organizer Batch</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {events.map((event) => (
                  <TableRow
                    key={event._id}
                    hover
                    sx={{
                      backgroundColor:
                        event.eventStatus === "ongoing"
                          ? alpha(getStatusColor("ongoing"), 0.05)
                          : "inherit",
                    }}
                  >
                    <TableCell>{event.eventName}</TableCell>
                    <TableCell>
                      {formatDate(event.eventDate)}
                      <Typography
                        variant="caption"
                        display="block"
                        color="text.secondary"
                      >
                        {event.eventTime}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {renderStatusIndicator(event.eventStatus)}
                    </TableCell>
                    <TableCell>
                      {event.budget && event.budget.totalAllocated ? (
                        <Box>
                          <Typography variant="body2" fontWeight="bold">
                            {formatCurrency(event.budget.totalAllocated)}
                          </Typography>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 0.5,
                            }}
                          >
                            <Box
                              sx={{
                                width: 8,
                                height: 8,
                                borderRadius: "50%",
                                bgcolor:
                                  event.budget.remaining > 0
                                    ? "#52c41a"
                                    : "#ff4d4f",
                              }}
                            />
                            <Typography variant="caption">
                              {formatCurrency(event.budget.remaining)} remaining
                            </Typography>
                          </Box>
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          Not set
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>{event.eventVenue}</TableCell>
                    <TableCell>{event.eventType}</TableCell>
                    <TableCell>{event.eventOrganizerBatch}</TableCell>
                    <TableCell align="center">
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "center",
                          gap: 1,
                        }}
                      >
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          startIcon={<Delete />}
                          onClick={() => handleDeleteClick(event._id)}
                          sx={{ borderRadius: 2 }}
                        >
                          Delete
                        </Button>

                        <Button
                          variant="outlined"
                          color="primary"
                          size="small"
                          startIcon={<Visibility />}
                          onClick={() => handleViewEvent(event._id)}
                          sx={{ borderRadius: 2 }}
                        >
                          View
                        </Button>

                        <Tooltip title="Manage Budget">
                          <IconButton
                            color="info"
                            size="small"
                            onClick={() => handleViewBudget(event._id)}
                            sx={{
                              borderRadius: 2,
                              border: "1px solid",
                              borderColor: "divider",
                            }}
                          >
                            <AttachMoney />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
              <Pagination
                count={pagination.totalPages}
                page={pagination.currentPage}
                onChange={handlePageChange}
                color="primary"
                showFirstButton
                showLastButton
              />
            </Box>
          )}

          {/* Showing results text */}
          <Box sx={{ mt: 2, display: "flex", justifyContent: "center" }}>
            <Typography variant="body2" color="text.secondary">
              Showing {pagination.count} of {pagination.total} events
            </Typography>
          </Box>
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => !deleteLoading && setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this event? This action is permanent
            and will also delete all associated registration forms and
            responses.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            disabled={deleteLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            disabled={deleteLoading}
            startIcon={
              deleteLoading ? <CircularProgress size={20} /> : <Delete />
            }
          >
            {deleteLoading ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Feedback Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default index;
