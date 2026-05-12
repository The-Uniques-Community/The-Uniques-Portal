import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Button,
  Modal,
  Card,
  CardContent,
  Divider,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Pagination,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Grid,
} from "@mui/material";
import {
  Search as SearchIcon,
  Mail as MailIcon,
  Phone as PhoneIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Reply as ReplyIcon,
  Person as PersonIcon,
  CalendarToday as CalendarTodayIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  HourglassEmpty as HourglassEmptyIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import axios from "axios";
import { format } from "date-fns";

const EnquiryManagement = () => {
  // State variables
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [replyMessage, setReplyMessage] = useState("");
  const [replyLoading, setReplyLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState(10);
  const [filterCriteria, setFilterCriteria] = useState("createdAt:desc");
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);
  const [alertInfo, setAlertInfo] = useState({
    show: false,
    message: "",
    severity: "success",
  });
  const [newStatus, setNewStatus] = useState("");
  const [notes, setNotes] = useState("");

  // Status options for the tabs
  const statusOptions = [
    { value: "all", label: "All" },
    { value: "new", label: "New", color: "warning" },
    { value: "reviewed", label: "Reviewed", color: "info" },
    { value: "in-progress", label: "In Progress", color: "primary" },
    { value: "resolved", label: "Resolved", color: "success" },
    { value: "archived", label: "Archived", color: "default" },
  ];

  // Fetch enquiries from API
  useEffect(() => {
    fetchEnquiries();
  }, [currentPage, limit, statusFilter, filterCriteria]);

  const fetchEnquiries = async () => {
    try {
      setLoading(true);

      let url = `http://localhost:5000/api/admin/enquiry?page=${currentPage}&limit=${limit}`;
      if (statusFilter !== "all") {
        url += `&status=${statusFilter}`;
      }
      if (searchTerm) {
        url += `&search=${searchTerm}`;
      }
      if (filterCriteria) {
        url += `&sortBy=${filterCriteria}`;
      }

      const response = await axios.get(url, {
        withCredentials: true, // Important for authenticated requests
      });

      if (response.data.success) {
        setEnquiries(response.data.data);
        setTotalPages(response.data.pagination.pages);
      } else {
        showAlert("Failed to fetch enquiries", "error");
      }
    } catch (error) {
      console.error("Error fetching enquiries:", error);
      showAlert("Error loading enquiries. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Search handler with debounce
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);

    // If we already have a timer, clear it
    if (window.searchTimeout) {
      clearTimeout(window.searchTimeout);
    }

    // Set a new timer
    window.searchTimeout = setTimeout(() => {
      setCurrentPage(1); // Reset to first page when searching
      fetchEnquiries();
    }, 500);
  };

  // Handle tab change for status filtering
  const handleTabChange = (event, newValue) => {
    setStatusFilter(newValue);
    setCurrentPage(1); // Reset to first page when changing tabs
  };

  // Handle viewing an enquiry's details
  const handleViewEnquiry = async (id) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `http://localhost:5000/api/admin/enquiry/${id}`,
        {
          withCredentials: true,
        }
      );

      if (response.data.success) {
        setSelectedEnquiry(response.data.data);
        setModalOpen(true);
        setNewStatus(response.data.data.status);
        setNotes(response.data.data.notes || "");
      } else {
        showAlert("Failed to load enquiry details", "error");
      }
    } catch (error) {
      console.error("Error fetching enquiry details:", error);
      showAlert("Error loading enquiry details", "error");
    } finally {
      setLoading(false);
    }
  };

  // Handle sending a reply
  // Handle sending a reply
  const handleSendReply = async () => {
    // Validate that we have a selected enquiry with a valid ID
    if (!selectedEnquiry || !selectedEnquiry._id) {
      showAlert("Error: No enquiry selected or invalid enquiry data", "error");
      return;
    }
  
    if (!replyMessage.trim()) {
      showAlert("Please enter a reply message", "warning");
      return;
    }
  
    // Store the ID in a separate variable to make sure it's available
    const enquiryId = selectedEnquiry._id;
    console.log("Sending reply to enquiry ID:", enquiryId); // Debug log
  
    try {
        setReplyLoading(true);
        
        // Ensure ID is a string (in case it's an ObjectId or other format)
        const enquiryId = selectedEnquiry._id.toString();
        console.log("Sending reply to enquiry ID:", enquiryId); // Debug log
        
        // Only send the replyMessage in the request body
        // The backend extracts the ID from the URL params
        const response = await axios.post(
          `http://localhost:5000/api/admin/enquiry/${enquiryId}/reply`,
          { replyMessage },
          { withCredentials: true }
        );
      
        if (response.data.success) {
          showAlert("Reply sent successfully", "success");
          setModalOpen(false);
          setReplyMessage("");
      
          // Refresh enquiries list
          fetchEnquiries();
        } else {
          showAlert(`Failed to send reply: ${response.data.message || "Unknown error"}`, "error");
        }
      } catch (error) {
      console.error("Error sending reply:", error);
      showAlert(
        "Error sending reply: " +
          (error.response?.data?.message || "Unknown error"),
        "error"
      );
    } finally {
      setReplyLoading(false);
    }
  };

  // Handle updating enquiry status
  const handleUpdateStatus = async () => {
    if (
      newStatus === selectedEnquiry.status &&
      (!notes || notes === selectedEnquiry.notes)
    ) {
      setModalOpen(false);
      return; // No changes
    }

    try {
      setStatusUpdateLoading(true);
      const response = await axios.patch(
        `http://localhost:5000/api/admin/enquiry/${selectedEnquiry._id}/status`,
        {
          status: newStatus,
          notes,
        },
        { withCredentials: true }
      );

      if (response.data.success) {
        showAlert("Status updated successfully", "success");
        setModalOpen(false);

        // Refresh enquiries list
        fetchEnquiries();
      } else {
        showAlert("Failed to update status", "error");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      showAlert("Error updating status", "error");
    } finally {
      setStatusUpdateLoading(false);
    }
  };

  // Handle delete confirmation dialog
  const handleDeleteConfirmation = (id) => {
    setDeleteId(id);
    setDeleteDialogOpen(true);
  };

  // Handle delete enquiry
  const handleDeleteEnquiry = async () => {
    try {
      const response = await axios.delete(
        `http://localhost:5000/api/admin/enquiry/${deleteId}`,
        { withCredentials: true }
      );

      if (response.data.success) {
        showAlert("Enquiry deleted successfully", "success");

        // Refresh enquiries list
        fetchEnquiries();
      } else {
        showAlert("Failed to delete enquiry", "error");
      }
    } catch (error) {
      console.error("Error deleting enquiry:", error);
      showAlert("Error deleting enquiry", "error");
    } finally {
      setDeleteDialogOpen(false);
      setDeleteId(null);
    }
  };

  // Utility function to show alerts
  const showAlert = (message, severity = "success") => {
    setAlertInfo({
      show: true,
      message,
      severity,
    });

    // Auto hide after 5 seconds
    setTimeout(() => {
      setAlertInfo((prev) => ({ ...prev, show: false }));
    }, 5000);
  };

  // Helper function to get the status chip color
  const getStatusChip = (status) => {
    const statusOption = statusOptions.find(
      (option) => option.value === status
    );
    return (
      <Chip
        size="small"
        label={statusOption?.label || status}
        color={statusOption?.color || "default"}
      />
    );
  };

  // Get status icon based on status
  const getStatusIcon = (status) => {
    switch (status) {
      case "new":
        return <WarningIcon fontSize="small" color="warning" />;
      case "reviewed":
        return <InfoIcon fontSize="small" color="info" />;
      case "in-progress":
        return <HourglassEmptyIcon fontSize="small" color="primary" />;
      case "resolved":
        return <CheckCircleIcon fontSize="small" color="success" />;
      default:
        return null;
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy h:mm a");
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="p-6">
      {/* Header Section */}
      <div className="mb-6">
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          className="text-gray-800"
        >
          Enquiry Management
        </Typography>
        <Typography variant="body1" className="text-gray-600 mb-4">
          Manage and respond to enquiries from website visitors.
        </Typography>

        {alertInfo.show && (
          <Alert
            severity={alertInfo.severity}
            onClose={() => setAlertInfo((prev) => ({ ...prev, show: false }))}
            className="mb-4"
          >
            {alertInfo.message}
          </Alert>
        )}
      </div>

      {/* Filter and Search Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
        <Paper className="p-1 w-full lg:w-auto">
          <Tabs
            value={statusFilter}
            onChange={handleTabChange}
            aria-label="enquiry status tabs"
            variant="scrollable"
            scrollButtons="auto"
            sx={{ minHeight: "48px" }}
          >
            {statusOptions.map((status) => (
              <Tab
                key={status.value}
                value={status.value}
                label={status.label}
                icon={
                  status.value !== "all" ? getStatusIcon(status.value) : null
                }
                iconPosition="start"
                sx={{ minHeight: "48px" }}
              />
            ))}
          </Tabs>
        </Paper>

        <div className="flex items-center gap-3 w-full lg:w-auto">
          <TextField
            label="Search"
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={handleSearch}
            className="w-full lg:w-64"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
            placeholder="Name, email or message..."
          />

          <FormControl size="small" className="w-40">
            <InputLabel>Sort By</InputLabel>
            <Select
              value={filterCriteria}
              label="Sort By"
              onChange={(e) => setFilterCriteria(e.target.value)}
            >
              <MenuItem value="createdAt:desc">Newest First</MenuItem>
              <MenuItem value="createdAt:asc">Oldest First</MenuItem>
              <MenuItem value="firstName:asc">Name (A-Z)</MenuItem>
              <MenuItem value="firstName:desc">Name (Z-A)</MenuItem>
            </Select>
          </FormControl>
        </div>
      </div>

      {/* Enquiries Table */}
      <TableContainer component={Paper} className="mb-4">
        <Table sx={{ minWidth: 650 }}>
          <TableHead className="bg-gray-100">
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Contact</TableCell>
              <TableCell>Message</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center" className="py-8">
                  <CircularProgress size={40} />
                  <Typography variant="body2" className="mt-2 text-gray-600">
                    Loading enquiries...
                  </Typography>
                </TableCell>
              </TableRow>
            ) : enquiries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" className="py-8">
                  <Typography variant="body1" className="text-gray-500">
                    No enquiries found.
                  </Typography>
                  <Typography variant="body2" className="mt-1 text-gray-400">
                    {searchTerm
                      ? "Try adjusting your search terms."
                      : "New enquiries will appear here."}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              enquiries.map((enquiry) => (
                <TableRow
                  key={enquiry._id}
                  hover
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                >
                  <TableCell>
                    <div className="flex items-center">
                      <PersonIcon
                        fontSize="small"
                        className="text-gray-400 mr-2"
                      />
                      <div>
                        <Typography variant="body2" className="font-medium">
                          {`${enquiry.firstName} ${enquiry.lastName}`}
                        </Typography>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center">
                        <MailIcon
                          fontSize="small"
                          className="text-gray-400 mr-1"
                        />
                        <Typography variant="body2">{enquiry.email}</Typography>
                      </div>
                      {enquiry.phone && (
                        <div className="flex items-center">
                          <PhoneIcon
                            fontSize="small"
                            className="text-gray-400 mr-1"
                          />
                          <Typography variant="body2">
                            {enquiry.phone}
                          </Typography>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      className="line-clamp-2 max-w-sm"
                    >
                      {enquiry.message}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <CalendarTodayIcon
                        fontSize="small"
                        className="text-gray-400 mr-1"
                      />
                      <Typography variant="body2">
                        {formatDate(enquiry.createdAt)}
                      </Typography>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusChip(enquiry.status)}</TableCell>
                  <TableCell align="center">
                    <div className="flex justify-center space-x-1">
                      <IconButton
                        size="small"
                        onClick={() => handleViewEnquiry(enquiry._id)}
                        title="View Details"
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>

                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => {
                          if (enquiry && enquiry._id) {
                            handleViewEnquiry(enquiry._id);
                          } else {
                            showAlert("Error: Invalid enquiry data", "error");
                          }
                        }}
                        title="Reply"
                      >
                        <ReplyIcon fontSize="small" />
                      </IconButton>

                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteConfirmation(enquiry._id)}
                        title="Delete"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <div className="flex justify-between items-center">
        <FormControl size="small" variant="outlined" className="w-20">
          <InputLabel>Rows</InputLabel>
          <Select
            value={limit}
            onChange={(e) => {
              setLimit(e.target.value);
              setCurrentPage(1);
            }}
            label="Rows"
          >
            <MenuItem value={5}>5</MenuItem>
            <MenuItem value={10}>10</MenuItem>
            <MenuItem value={25}>25</MenuItem>
            <MenuItem value={50}>50</MenuItem>
          </Select>
        </FormControl>

        <Pagination
          count={totalPages}
          page={currentPage}
          onChange={(e, page) => setCurrentPage(page)}
          color="primary"
          showFirstButton
          showLastButton
        />
      </div>

      {/* Enquiry Details Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        aria-labelledby="enquiry-details-modal"
      >
        <Box className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-xl p-6 w-11/12 max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedEnquiry ? (
            <>
              {/* Modal Header */}
              <Box className="flex justify-between items-center mb-4">
                <Typography
                  variant="h5"
                  component="h2"
                  className="text-gray-800"
                >
                  Enquiry Details
                </Typography>
                <IconButton onClick={() => setModalOpen(false)}>
                  <CloseIcon />
                </IconButton>
              </Box>

              <Divider className="mb-4" />

              {/* Enquiry Information */}
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined" className="mb-4">
                    <CardContent>
                      <Typography
                        variant="subtitle1"
                        className="font-bold text-gray-700 mb-2"
                      >
                        Contact Information
                      </Typography>

                      <Box className="space-y-3">
                        <Box className="flex items-center">
                          <PersonIcon className="text-gray-500 mr-2" />
                          <Box>
                            <Typography
                              variant="body2"
                              className="text-gray-500"
                            >
                              Full Name
                            </Typography>
                            <Typography variant="body1" className="font-medium">
                              {`${selectedEnquiry.firstName} ${selectedEnquiry.lastName}`}
                            </Typography>
                          </Box>
                        </Box>

                        <Box className="flex items-center">
                          <MailIcon className="text-gray-500 mr-2" />
                          <Box>
                            <Typography
                              variant="body2"
                              className="text-gray-500"
                            >
                              Email Address
                            </Typography>
                            <Typography variant="body1">
                              {selectedEnquiry.email}
                            </Typography>
                          </Box>
                        </Box>

                        {selectedEnquiry.phone && (
                          <Box className="flex items-center">
                            <PhoneIcon className="text-gray-500 mr-2" />
                            <Box>
                              <Typography
                                variant="body2"
                                className="text-gray-500"
                              >
                                Phone Number
                              </Typography>
                              <Typography variant="body1">
                                {selectedEnquiry.phone}
                              </Typography>
                            </Box>
                          </Box>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card variant="outlined" className="mb-4">
                    <CardContent>
                      <Typography
                        variant="subtitle1"
                        className="font-bold text-gray-700 mb-2"
                      >
                        Enquiry Details
                      </Typography>

                      <Box className="space-y-3">
                        <Box>
                          <Typography variant="body2" className="text-gray-500">
                            Status
                          </Typography>
                          <Box className="mt-1">
                            {getStatusChip(selectedEnquiry.status)}
                          </Box>
                        </Box>

                        <Box>
                          <Typography variant="body2" className="text-gray-500">
                            Date Submitted
                          </Typography>
                          <Typography variant="body1">
                            {formatDate(selectedEnquiry.createdAt)}
                          </Typography>
                        </Box>

                        {selectedEnquiry.services &&
                          selectedEnquiry.services.length > 0 && (
                            <Box>
                              <Typography
                                variant="body2"
                                className="text-gray-500"
                              >
                                Interested Services
                              </Typography>
                              <Box className="flex flex-wrap gap-1 mt-1">
                                {selectedEnquiry.services.map(
                                  (service, idx) => (
                                    <Chip
                                      key={idx}
                                      label={service}
                                      size="small"
                                      color="primary"
                                      variant="outlined"
                                    />
                                  )
                                )}
                              </Box>
                            </Box>
                          )}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              <Card variant="outlined" className="mb-4">
                <CardContent>
                  <Typography
                    variant="subtitle1"
                    className="font-bold text-gray-700 mb-2"
                  >
                    Enquiry Message
                  </Typography>
                  <Typography
                    variant="body1"
                    className="bg-gray-50 p-3 rounded whitespace-pre-line"
                  >
                    {selectedEnquiry.message}
                  </Typography>
                </CardContent>
              </Card>

              {/* Status Management */}
              <Card variant="outlined" className="mb-4">
                <CardContent>
                  <Typography
                    variant="subtitle1"
                    className="font-bold text-gray-700 mb-3"
                  >
                    Update Status
                  </Typography>

                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Status</InputLabel>
                        <Select
                          value={newStatus}
                          label="Status"
                          onChange={(e) => setNewStatus(e.target.value)}
                        >
                          <MenuItem value="new">New</MenuItem>
                          <MenuItem value="reviewed">Reviewed</MenuItem>
                          <MenuItem value="in-progress">In Progress</MenuItem>
                          <MenuItem value="resolved">Resolved</MenuItem>
                          <MenuItem value="archived">Archived</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={handleUpdateStatus}
                        disabled={
                          statusUpdateLoading ||
                          newStatus === selectedEnquiry.status
                        }
                        fullWidth
                      >
                        {statusUpdateLoading ? (
                          <CircularProgress size={24} />
                        ) : (
                          "Update Status"
                        )}
                      </Button>
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        label="Internal Notes"
                        multiline
                        rows={2}
                        fullWidth
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        variant="outlined"
                        placeholder="Add internal notes about this enquiry (only visible to admin)"
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Reply Form */}
              <Card variant="outlined" className="mb-4">
                <CardContent>
                  <Typography
                    variant="subtitle1"
                    className="font-bold text-gray-700 mb-3"
                  >
                    Reply to Enquiry
                  </Typography>

                  <TextField
                    fullWidth
                    multiline
                    rows={5}
                    label="Reply Message"
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    placeholder="Type your response to the enquiry here..."
                    variant="outlined"
                    className="mb-3"
                  />

                  <Box className="flex justify-end">
                    <Button
                      variant="contained"
                      color="primary"
                      endIcon={<ReplyIcon />}
                      onClick={handleSendReply}
                      disabled={replyLoading || !replyMessage.trim()}
                    >
                      {replyLoading ? (
                        <CircularProgress size={24} />
                      ) : (
                        "Send Reply"
                      )}
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </>
          ) : (
            <Box className="flex justify-center items-center py-8">
              <CircularProgress />
            </Box>
          )}
        </Box>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Delete Enquiry?</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete this enquiry? This action cannot be
            undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <Button
            onClick={handleDeleteEnquiry}
            color="error"
            variant="contained"
            autoFocus
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default EnquiryManagement;
