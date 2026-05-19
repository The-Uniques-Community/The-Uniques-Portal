import React, { useState, useEffect } from "react";
import { useTheme } from "@mui/material/styles";
import { NewMember } from "./dashboardComponents/NewMember";
import StatCard from "./dashboardComponents/StatCard";
import { Groups2 } from "@mui/icons-material";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
import LocationCityIcon from "@mui/icons-material/LocationCity";
import Calender from "./dashboardComponents/Calender";
import Banner from "./dashboardComponents/Banner";
import EventOverView from "./dashboardComponents/EventOverView";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Chip,
  CircularProgress,
  Tabs,
  Tab,
  Box,
  Avatar,
  Typography,
  Modal,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Card,
  CardContent,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputLabel,
  Select,
  MenuItem,
  FormControl,
  InputAdornment,
  Snackbar,
  Alert,
} from "@mui/material";
import SchoolIcon from "@mui/icons-material/School";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import CloseIcon from "@mui/icons-material/Close";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import ClassIcon from "@mui/icons-material/Class";
import BadgeIcon from "@mui/icons-material/Badge";
import DescriptionIcon from "@mui/icons-material/Description";
import SubjectIcon from "@mui/icons-material/Subject";
import DoneIcon from "@mui/icons-material/Done";
import ClearIcon from "@mui/icons-material/Clear";
import PendingIcon from "@mui/icons-material/Pending";
import PaidIcon from "@mui/icons-material/Paid";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import ReceiptIcon from "@mui/icons-material/Receipt";
import CloudUpload from "@mui/icons-material/CloudUpload";
import InsertDriveFile from "@mui/icons-material/InsertDriveFile";
import UploadFile from "@mui/icons-material/UploadFile";
import RemoveCircle from "@mui/icons-material/RemoveCircle";
import Preview from "@mui/icons-material/Preview";
import Close from "@mui/icons-material/Close";

// Fine Payment Modal Component
const FinePaymentModal = ({
  open,
  onClose,
  memberId,
  fine,
  onPaymentComplete,
}) => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [reference, setReference] = useState("");
  const [previewUrl, setPreviewUrl] = useState(null);
  const [error, setError] = useState("");

  // Handle file selection
  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length > 0) {
      setFiles(selectedFiles);

      // Create preview for image files
      if (selectedFiles[0].type.startsWith("image/")) {
        const url = URL.createObjectURL(selectedFiles[0]);
        setPreviewUrl(url);
      }
    }
  };

  // Remove selected file
  const handleRemoveFile = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setFiles([]);
    setPreviewUrl(null);
  };

  // Submit the form
  const handleSubmit = async () => {
    try {
      if (files.length === 0) {
        setError("Please upload a payment receipt");
        return;
      }

      setLoading(true);
      setError("");

      // 1. First upload the file(s)
      const formData = new FormData();
      formData.append("memberId", memberId);
      formData.append("fineId", fine._id || memberId); // Fallback to memberId if no specific fine ID
      formData.append("fileType", "receipt");

      files.forEach((file) => {
        formData.append("files", file);
      });

      // Upload the file - make sure the URL is correct
      const uploadResponse = await axios.post(
        "http://localhost:5000/upload/fine_file_upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (!uploadResponse.data.success) {
        throw new Error(
          uploadResponse.data.message || "Failed to upload receipt"
        );
      }

      // 2. Now update the fine with the file reference
      if (uploadResponse.data.files && uploadResponse.data.files.length > 0) {
        const fileId = uploadResponse.data.files[0]._id;

        // API endpoint for updating fine status - this needs to match your backend routes
        const updateEndpoint = `http://localhost:5000/api/admin/fine/members/${memberId}/fines/${fine._id}`;

        // Update the fine status and attach the proof
        const updateResponse = await axios.patch(updateEndpoint, {
          status: "paid",
          proofOfPaymentId: fileId,
          paymentMethod: paymentMethod,
          paymentReference: reference,
          amount: fine.amount || fine.fineStatus, // Use appropriate amount field
        });

        if (updateResponse.data.success) {
          if (onPaymentComplete) {
            onPaymentComplete({
              ...updateResponse.data.data,
              proofFile: uploadResponse.data.files[0],
            });
          }
          handleClose();
        }
      }
    } catch (err) {
      console.error("Error processing payment:", err);
      setError(err.message || "Failed to process payment");
    } finally {
      setLoading(false);
    }
  };

  // Reset state when closing
  const handleClose = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setFiles([]);
    setPreviewUrl(null);
    setError("");
    setPaymentMethod("upi");
    setReference("");
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={loading ? null : handleClose}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Mark Fine as Paid</Typography>
          {!loading && (
            <IconButton onClick={handleClose}>
              <Close />
            </IconButton>
          )}
        </Box>
      </DialogTitle>

      <DialogContent>
        {fine && (
          <>
            <Box mb={3}>
              <Alert severity="info" sx={{ mb: 2 }}>
                Please upload proof of payment to mark this fine as paid.
              </Alert>

              <Typography variant="subtitle1" fontWeight="bold">
                Fine Details
              </Typography>

              <Typography variant="body1">
                Amount: ₹{fine.amount}
              </Typography>

              {fine.reason && (
                <Typography variant="body2" color="textSecondary">
                  Reason: {fine.reason}
                </Typography>
              )}

              {fine.dateImposed && (
                <Typography variant="body2" color="textSecondary">
                  Date Imposed:{" "}
                  {new Date(fine.dateImposed).toLocaleDateString()}
                </Typography>
              )}
            </Box>

            <Divider sx={{ mb: 3 }} />

            <FormControl fullWidth margin="normal">
              <InputLabel id="payment-method-label">Payment Method</InputLabel>
              <Select
                labelId="payment-method-label"
                value={paymentMethod}
                label="Payment Method"
                onChange={(e) => setPaymentMethod(e.target.value)}
                disabled={loading}
              >
                <MenuItem value="upi">UPI</MenuItem>
                <MenuItem value="bank_transfer">Bank Transfer</MenuItem>
                <MenuItem value="cash">Cash</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>

            <TextField
              margin="normal"
              fullWidth
              label="Payment Reference (Optional)"
              placeholder="Transaction ID / Reference Number"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <ReceiptIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />

            <Box
              mt={3}
              p={3}
              border="1px dashed #ccc"
              borderRadius={1}
              textAlign="center"
              sx={(theme) => ({
                bgcolor: files.length > 0 ? theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.02)" : "transparent"
              })}
            >
              {files.length > 0 ? (
                <Box>
                  {previewUrl ? (
                    <Box mb={2} position="relative">
                      <img
                        src={previewUrl}
                        alt="Receipt preview"
                        style={{
                          maxWidth: "100%",
                          maxHeight: "200px",
                          borderRadius: "4px",
                        }}
                      />
                    </Box>
                  ) : (
                    <Box
                      mb={2}
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <InsertDriveFile sx={{ mr: 1 }} />
                      <Typography variant="body2">{files[0].name}</Typography>
                    </Box>
                  )}
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={handleRemoveFile}
                    startIcon={<RemoveCircle />}
                  >
                    Remove File
                  </Button>
                </Box>
              ) : (
                <Box>
                  <Button
                    component="label"
                    variant="contained"
                    startIcon={<CloudUpload />}
                    disabled={loading}
                  >
                    Upload Receipt
                    <input
                      type="file"
                      hidden
                      accept="image/*,.pdf"
                      onChange={handleFileChange}
                    />
                  </Button>
                  <Typography
                    variant="caption"
                    display="block"
                    mt={1}
                    sx={{ color: (theme) => theme.palette.text.secondary }}
                  >
                    Supported formats: JPG, PNG, PDF
                  </Typography>
                </Box>
              )}
            </Box>

            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading || files.length === 0}
          startIcon={loading ? <CircularProgress size={16} /> : <UploadFile />}
        >
          {loading ? "Processing..." : "Submit Payment"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Receipt Preview Modal Component
const ReceiptPreviewModal = ({ open, onClose, receiptUrl }) => {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Payment Receipt</Typography>
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        {receiptUrl && (
          <Box textAlign="center" py={2}>
            {receiptUrl.endsWith(".pdf") ? (
              <Box>
                <iframe
                  src={`${receiptUrl}#view=FitH`}
                  width="100%"
                  height="500px"
                  title="PDF Receipt"
                  style={{ border: "1px solid #ddd" }}
                />
              </Box>
            ) : (
              <img
                src={receiptUrl}
                alt="Payment Receipt"
                style={{
                  maxWidth: "100%",
                  maxHeight: "70vh",
                  objectFit: "contain",
                }}
              />
            )}
            <Button
              variant="contained"
              startIcon={<Preview />}
              sx={{ mt: 2 }}
              onClick={() => window.open(receiptUrl, "_blank")}
            >
              Open in New Tab
            </Button>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

// Add this component inside the Index.jsx file
const FineDetailsModal = ({ open, onClose, selectedFine, onPayFine, loading }) => {
  const [activeTab, setActiveTab] = useState(0);

  if (!selectedFine) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      aria-labelledby="fine-details-dialog"
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Fine Details for {selectedFine.member.name}</Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        {/* Summary Card */}
        <Card variant="outlined" sx={{ mb: 3 }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="subtitle1" fontWeight="bold">
                <AccountBalanceWalletIcon sx={{ mr: 1, verticalAlign: "middle" }} />
                Payment Summary
              </Typography>
              <Chip
                label={`Total: ₹${selectedFine.totals.total || 0}`}
                color="primary"
              />
            </Box>

            <Box display="flex" justifyContent="space-around" alignItems="center">
              <Box textAlign="center">
                <Typography variant="body2" sx={{ color: (theme) => theme.palette.text.secondary }}>Pending</Typography>
                <Typography variant="h6" color="error">
                  ₹{selectedFine.totals.pending || 0}
                </Typography>
              </Box>
              <Divider orientation="vertical" flexItem />
              <Box textAlign="center">
                <Typography variant="body2" sx={{ color: (theme) => theme.palette.text.secondary }}>Paid</Typography>
                <Typography variant="h6" color="success.main">
                  ₹{selectedFine.totals.paid || 0}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Tabs for All/Pending/Paid fines */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs
            value={activeTab}
            onChange={(_, newValue) => setActiveTab(newValue)}
            aria-label="fine status tabs"
          >
            <Tab label="All Fines" />
            <Tab label="Pending" />
            <Tab label="Paid" />
          </Tabs>
        </Box>

        {/* Fine List */}
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead sx={(theme) => ({ bgcolor: theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.04)" })}>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Reason</TableCell>
                <TableCell align="right">Amount</TableCell>
                <TableCell align="center">Status</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {selectedFine.fines.length > 0 ? (
                selectedFine.fines
                  .filter(fine => {
                    if (activeTab === 0) return true;
                    if (activeTab === 1) return fine.status === "pending";
                    if (activeTab === 2) return fine.status === "paid";
                    return true;
                  })
                  .map((fine, index) => (
                    <TableRow key={fine._id || index} hover>
                      <TableCell>
                        {fine.dateImposed ? new Date(fine.dateImposed).toLocaleDateString() : "N/A"}
                      </TableCell>
                      <TableCell>{fine.reason || "Fine Imposed"}</TableCell>
                      <TableCell align="right">₹{fine.amount}</TableCell>
                      <TableCell align="center">
                        <Chip
                          size="small"
                          label={fine.status === "paid" ? "Paid" : "Pending"}
                          color={fine.status === "paid" ? "success" : "warning"}
                          icon={fine.status === "paid" ? <DoneIcon /> : <PendingIcon />}
                        />
                      </TableCell>
                      <TableCell align="center">
                        {fine.status === "pending" ? (
                          <Button
                            size="small"
                            variant="contained"
                            color="primary"
                            onClick={() => onPayFine(selectedFine.member.id, fine._id)}
                            disabled={loading}
                          >
                            Mark as Paid
                          </Button>
                        ) : (
                          <a href={fine.proofOfPayment?.fileUrl} target="_blank" rel="noopener noreferrer">
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<ReceiptIcon />}
                              onClick={() => {
                                if (fine.proofOfPayment?.fileUrl) {
                                  setReceiptPreviewUrl(fine.proofOfPayment.fileUrl);
                                  setOpenReceiptPreview(true);
                                }
                              }}
                              disabled={!fine.proofOfPayment}
                            >
                              View Receipt
                            </Button>
                          </a>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                    <Typography variant="body2" sx={{ color: (theme) => theme.palette.text.secondary }}>
                      No fines found
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const Index = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  // State for storing fetched data
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalMembers: 0,
    totalFine: 0,
    totalEvents: 0,
    totalCampus: 1,
  });
  const [events, setEvents] = useState([]);
  const [tableView, setTableView] = useState(0);
  const [fineMembers, setFineMembers] = useState([]);
  const [supplementaryMembers, setSupplementaryMembers] = useState([]);
  const [currentSemester, setCurrentSemester] = useState(1);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);

  // NEW: Fine Payment Modal state
  const [openPaymentModal, setOpenPaymentModal] = useState(false);
  const [fineToUpdate, setFineToUpdate] = useState(null);
  const [paymentComplete, setPaymentComplete] = useState(false);

  // NEW: Receipt Preview Modal state
  const [receiptPreviewUrl, setReceiptPreviewUrl] = useState(null);
  const [openReceiptPreview, setOpenReceiptPreview] = useState(false);

  // Add these state variables to the Index component
  const [selectedFine, setSelectedFine] = useState(null);
  const [openViewModal, setOpenViewModal] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const API_BASE_URL = "http://localhost:5000/api/admin";

  // Fetch data when component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch all members
        const membersRes = await axios.get(
          "http://localhost:5000/api/admin/member?page=1&limit=10"
        );
        // Get recently added members (sorted by creation date)
        const sortedMembers = [...membersRes.data.data].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setMembers(sortedMembers.slice(0, 3));

        // Fetch total members count
        const totalMembers =
          membersRes.data.pagination?.total || membersRes.data.data.length;

        // Fetch members with fines
        const fineRes = await axios.get(
          "http://localhost:5000/api/admin/fine/fines/members"
        );
        setFineMembers(
          fineRes.data.data.members.filter((member) => Number(member.totalPendingAmount) > 0)
        );

        // Calculate total fine amount - improved calculation
        let totalFineAmount = 0;
        if (Array.isArray(fineRes.data.data)) {
          totalFineAmount = fineRes.data.data.reduce((total, member) => {
            // Make sure fineStatus is converted to a number and has a default of 0
            const fineAmount = member.fineStatus
              ? Number(member.fineStatus)
              : 0;
            return total + (isNaN(fineAmount) ? 0 : fineAmount);
          }, 0);
        }

        // Alternative: fetch total fine directly if API supports it
        try {
          // Try to get the total fine from a dedicated API endpoint
          const fineStatsRes = await axios.get(
            "http://localhost:5000/api/admin/fine/fines/statistics"
          );
          if (
            fineStatsRes.data &&
            fineStatsRes.data.success &&
            fineStatsRes.data.data
          ) {
            // Use the total pending amount as the fine amount for the dashboard
            totalFineAmount =
              fineStatsRes.data.data.totalPendingAmount || totalFineAmount;
          }
        } catch (error) {
          console.log("Using calculated fine total instead of API stats");
          // Continue with the calculated total if the API call fails
        }

        // Fetch events from the correct API endpoint
        try {
          const eventsRes = await axios.get("http://localhost:5000/api/events");
          // Handle API response based on its structure (data property or direct array)
          const eventsList = eventsRes.data.events || [];
          setEvents(eventsList.slice(0, 3));

          // Update total events count from API response
          const totalEventsCount = eventsRes.data.total || eventsList.length;
          setStats((prev) => ({
            ...prev,
            totalEvents: totalEventsCount,
          }));
        } catch (error) {
          console.error("Error fetching events:", error);
          // Fallback to mock data if API fails
          setEvents([
            {
              eventName: "Tech Workshop",
              eventStatus: "upcoming",
              eventDate: "2025-04-15",
              eventTime: "10:00 AM",
            },
            {
              eventName: "Alumni Meet",
              eventStatus: "upcoming",
              eventDate: "2025-05-20",
              eventTime: "2:00 PM",
            },
            {
              eventName: "Coding Competition",
              eventStatus: "completed",
              eventDate: "2025-02-10",
              eventTime: "9:00 AM",
            },
          ]);

          // Keep the stats value for events if API fails
          setStats((prev) => ({
            ...prev,
            totalEvents: 6, // Default fallback
          }));
        }

        // Update remaining stats
        setStats((prev) => ({
          ...prev,
          totalMembers,
          totalFine: totalFineAmount,
          totalCampus: 1,
        }));

        // Fetch members with supplementary exams for semester 1
        const supplementaryRes = await axios.get(
          `http://localhost:5000/api/admin/member/supplementary/semester/${currentSemester}`
        );
        setSupplementaryMembers(supplementaryRes.data.data || []);

        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle semester change for supplementary data
  const handleSemesterChange = async (semester) => {
    try {
      setLoading(true);
      setCurrentSemester(semester);

      const res = await axios.get(
        `http://localhost:5000/api/admin/member/supplementary/semester/${semester}`
      );

      // Debug the API response
      console.log(`Supplementary data for semester ${semester}:`, res.data);

      if (res.data && res.data.data) {
        setSupplementaryMembers(res.data.data);
      } else {
        console.error("Invalid API response format:", res.data);
        setSupplementaryMembers([]);
      }

      setLoading(false);
    } catch (error) {
      console.error(
        `Error fetching supplementary data for semester ${semester}:`,
        error
      );
      setSupplementaryMembers([]);
      setLoading(false);
    }
  };

  const handleTableViewChange = (event, newValue) => {
    setTableView(newValue);
  };

  // Handle view details button click
  const handleViewDetails = (member) => {
    setSelectedMember(member);
    setModalOpen(true);
  };

  // Close modal
  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedMember(null);
  };

  // NEW: Handle payment completion
  const handlePaymentComplete = async () => {
    setPaymentComplete(true);
    setOpenPaymentModal(false);

    // Refresh the data
    try {
      const fineRes = await axios.get(
        "http://localhost:5000/api/admin/member/fines/all"
      );

      if (fineRes.data && fineRes.data.data) {
        setFineMembers(fineRes.data.data);

        // Recalculate total fine amount
        if (Array.isArray(fineRes.data.data)) {
          const totalFineAmount = fineRes.data.data.reduce((total, member) => {
            const fineAmount = member.fineStatus
              ? Number(member.fineStatus)
              : 0;
            return total + (isNaN(fineAmount) ? 0 : fineAmount);
          }, 0);

          setStats((prev) => ({
            ...prev,
            totalFine: totalFineAmount,
          }));
        }
      }
    } catch (error) {
      console.error("Error refreshing fine data:", error);
    }

    // Reset state after a delay
    setTimeout(() => {
      setPaymentComplete(false);
    }, 3000);
  };

  // NEW: Handle opening receipt preview
  const handleOpenReceipt = (fileUrl) => {
    setReceiptPreviewUrl(fileUrl);
    setOpenReceiptPreview(true);
  };

  // Add this function to view fine details
  const viewFineDetails = async (member) => {
    try {
      setLoading(true);

      // Get complete fine history for the member
      const response = await axios.get(`${API_BASE_URL}/fine/members/${member.id}/fines`);

      setSelectedFine({
        member,
        fines: response.data.data.fines || [],
        totals: response.data.data.totals || {
          totalAmount: member.totalPendingAmount,
          totalPaid: 0,
          totalPending: member.totalPendingAmount
        }
      });

      setActiveTab(0); // Reset to first tab
      setOpenViewModal(true);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching fine details:", error);
      setAlert({
        open: true,
        message: error.response?.data?.message || "Failed to fetch fine details",
        severity: "error"
      });
      setLoading(false);
    }
  };

  // Add this function to handle individual fine payments
  const handlePayFine = (memberId, fineId) => {
    // Prepare the fine object for the payment modal
    const fineToMark = selectedFine.fines.find(f => f._id === fineId);

    if (fineToMark) {
      setFineToUpdate({
        memberId: memberId,
        fine: fineToMark
      });

      setOpenViewModal(false); // Close the view modal
      setOpenPaymentModal(true); // Open the payment modal
    }
  };
  const getProxyImageUrl = (fileId) => {
    if (!fileId) return '/placeholder.svg'; // Fallback image
    return `${API_BASE_URL}/api/image-proxy/${fileId}`;
  };

  return (
    <div className="w-full">
      {/* Main Dashboard Layout */}
      <div className="grid xl:grid-cols-5 lg:grid-cols-4 md:grid-cols-3 grid-cols-1 gap-3 md:px-3 px-1 py-5 mb-5">
        <div className="col-span-4">
          <Banner />
          <div className="grid xl:grid-cols-4 lg:grid-cols-4 md:grid-cols-3 place-items-center grid-cols-1 gap-4">
            <StatCard
              icon={<Groups2 fontSize="large" />}
              title="Total Members"
              value={stats.totalMembers}
              link="/admin/members-overview"
            />
            <StatCard
              icon={<CurrencyRupeeIcon fontSize="large" />}
              title="Total Fine"
              value={stats.totalFine}
              link="/admin/accounts"
            />
            <StatCard
              icon={<EventAvailableIcon fontSize="large" />}
              title="Total Events"
              value={stats.totalEvents}
              link="/admin/events-overview"
            />
            <StatCard
              icon={<LocationCityIcon fontSize="large" />}
              title="Total Campus"
              value={stats.totalCampus}
            />
          </div>

          <div className="px-1 py-5 my-5">
            <h2 className="text-2xl font-bold text-slate-800 mb-5">
              Newly Added Members
            </h2>
            {loading ? (
              <div className="flex justify-center py-8">
                <CircularProgress />
              </div>
            ) : (
              <div className="flex flex-wrap items-center justify-start gap-3">
                {members.length > 0 ? (
                  members.map((member) => (
                    <NewMember key={member._id} user={member} />
                  ))
                ) : (
                  <p className="text-gray-500">No new members found</p>
                )}
              </div>
            )}
          </div>
        </div>
        <div>
          <div className="mb-5">
            <Calender />
          </div>
          <div
            className="mb-5 overflow-auto h-[500px]"
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: "#d4d4d4 #f3f3f3",
              scrollbarTrackColor: "#f3f3f3",
            }}
          >
            {loading ? (
              <div className="flex justify-center py-8">
                <CircularProgress size={24} />
              </div>
            ) : (
              events.map((event, index) => (
                <EventOverView key={index} event={event} />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Member Filters Section */}
      <div className="mx-3 mb-10">
        <h2 className="text-2xl font-bold text-slate-800 mb-3">
          Member Filters
        </h2>

        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
          <Tabs
            value={tableView}
            onChange={handleTableViewChange}
            aria-label="member filter tabs"
          >
            <Tab
              label="Members with Fines"
              icon={<CurrencyRupeeIcon />}
              iconPosition="start"
            />
            <Tab
              label="Members with Supplementary"
              icon={<SchoolIcon />}
              iconPosition="start"
            />
          </Tabs>
        </Box>

        {tableView === 0 ? (
          // Fines Table
          <>
            {loading ? (
              <div className="flex justify-center py-8">
                <CircularProgress />
              </div>
            ) : (
              <TableContainer
                component={Paper}
                className="shadow-md rounded-md"
              >
                <Table>
                  <TableHead className="bg-gray-100">
                    <TableRow>
                      <TableCell>Member</TableCell>
                      <TableCell>Admission No</TableCell>
                      <TableCell>Batch</TableCell>
                      <TableCell align="right">Fine Amount</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {fineMembers.length > 0 ? (
                      fineMembers.map((member) => (
                        <TableRow key={member._id} hover>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar
                                src={member.profilePic}
                                alt={member.name}
                              />
                              <div>
                                <div className="font-medium">
                                  {member.name}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {member.email}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{member.admno}</TableCell>
                          <TableCell>{member.batch}</TableCell>
                          <TableCell align="right">
                            <Chip
                              label={`₹${member.totalPendingAmount}`}
                              color="error"
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Button
                              variant="contained"
                              size="small"
                              style={{ backgroundColor: "#ca0019" }}
                              onClick={() => handleViewDetails(member)}
                            >
                              View Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} align="center" className="py-8">
                          <Typography variant="body1" color="textSecondary">
                            No members with fines found
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </>
        ) : (
          // Supplementary Table
          <>
            <div className="flex mb-4 gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                <Button
                  key={sem}
                  variant={currentSemester === sem ? "contained" : "outlined"}
                  size="small"
                  onClick={() => handleSemesterChange(sem)}
                  style={{
                    backgroundColor:
                      currentSemester === sem ? "#ca0019" : "transparent",
                    borderColor: "#ca0019",
                    color: currentSemester === sem ? "white" : "#ca0019",
                  }}
                >
                  Sem {sem}
                </Button>
              ))}
            </div>

            {loading ? (
              <div className="flex justify-center py-8">
                <CircularProgress />
              </div>
            ) : (
              <TableContainer
                component={Paper}
                className="shadow-md rounded-md"
              >
                <Table>
                  <TableHead className="bg-gray-100">
                    <TableRow>
                      <TableCell>Member</TableCell>
                      <TableCell>Admission No</TableCell>
                      <TableCell>Batch</TableCell>
                      <TableCell>Subjects</TableCell>
                      <TableCell align="center">Status</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {supplementaryMembers.length > 0 ? (
                      supplementaryMembers.map((member) => (
                        <TableRow key={member._id} hover>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar
                                src={user?.profilePic?.fileId ?
                                  getProxyImageUrl(user.profilePic.fileId) :
                                  '/placeholder.svg'
                                }
                              />
                              <div>
                                <div className="font-medium">
                                  {member.fullName}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {member.email}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{member.admno}</TableCell>
                          <TableCell>{member.batch}</TableCell>
                          <TableCell>
                            {member.semesterSupplementary.find(
                              (sem) => sem.semester === currentSemester
                            )?.subjects.length || 0}{" "}
                            subjects
                          </TableCell>
                          <TableCell align="center">
                            {member.semesterSupplementary
                              .find((sem) => sem.semester === currentSemester)
                              ?.subjects.some(
                                (subj) => subj.status === "pending"
                              ) && (
                                <Chip
                                  icon={<WarningAmberIcon />}
                                  label="Pending"
                                  color="warning"
                                  size="small"
                                  style={{ marginRight: 4 }}
                                />
                              )}
                            {member.semesterSupplementary
                              .find((sem) => sem.semester === currentSemester)
                              ?.subjects.some(
                                (subj) => subj.status === "failed"
                              ) && (
                                <Chip label="Failed" color="error" size="small" />
                              )}
                          </TableCell>
                          <TableCell align="center">
                            <Button
                              variant="contained"
                              size="small"
                              style={{ backgroundColor: "#ca0019" }}
                              onClick={() => handleViewDetails(member)}
                            >
                              View Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} align="center" className="py-8">
                          <Typography variant="body1" color="textSecondary">
                            No members with supplementary exams in semester{" "}
                            {currentSemester}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </>
        )}
      </div>

      {/* Member Details Modal */}
      <Modal
        open={modalOpen}
        onClose={handleCloseModal}
        aria-labelledby="member-details-modal"
      >
        <Box 
          style={{
            backgroundColor: theme.palette.background.paper,
            borderColor: theme.palette.divider,
            color: theme.palette.text.primary,
          }}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-xl shadow-xl border p-6 w-11/12 max-w-3xl max-h-[90vh] overflow-y-auto"
        >
          {selectedMember && (
            <>
              {/* Modal Header */}
              <div className="flex justify-between items-center mb-4">
                <Typography
                  variant="h5"
                  component="h2"
                  style={{ color: theme.palette.text.primary }}
                  className="font-bold"
                >
                  {tableView === 0
                    ? "Fine Details"
                    : "Supplementary Exam Details"}
                </Typography>
                <IconButton onClick={handleCloseModal} aria-label="close">
                  <CloseIcon />
                </IconButton>
              </div>

              {/* Member Basic Info */}
              <div className="flex items-center gap-4 mb-6">
                <Avatar
                  src={selectedMember.profilePic}
                  alt={selectedMember.name}
                  sx={{ width: 64, height: 64 }}
                  className="border-2 border-[#ca0019]"
                />
                <div>
                  <Typography variant="h6" className="font-bold">
                    {selectedMember.name}
                  </Typography>
                  <div className="flex flex-wrap gap-2 mt-1">
                    <Chip
                      icon={<BadgeIcon />}
                      label={selectedMember.admno}
                      size="small"
                      className="bg-gray-100"
                    />
                    <Chip
                      icon={<ClassIcon />}
                      label={selectedMember.batch}
                      size="small"
                      className="bg-blue-100 text-blue-800"
                    />
                  </div>
                </div>
              </div>

              <Divider className="my-4" />

              {/* Tab-specific content */}
              {tableView === 0 ? (
                // Fine Details Content
                <div className="space-y-4">
                  <div 
                    style={{
                      backgroundColor: isDark ? "rgba(244, 67, 54, 0.15)" : "#fef2f2",
                      borderColor: isDark ? "rgba(244, 67, 54, 0.3)" : "#fecaca"
                    }}
                    className="p-4 rounded-lg border"
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <CurrencyRupeeIcon className="text-red-600" />
                        <Typography variant="h6" className="font-semibold">
                          Fine Amount
                        </Typography>
                      </div>
                      <Chip
                        label={`₹${selectedMember.totalPendingAmount}`}
                        color="error"
                        className="text-lg font-bold"
                      />
                    </div>
                  </div>

                  <Card 
                    variant="outlined" 
                    style={{
                      borderColor: isDark ? theme.palette.divider : "#fecaca",
                      backgroundColor: theme.palette.background.paper
                    }}
                  >
                    <CardContent>
                      <Typography
                        variant="subtitle1"
                        className="font-semibold mb-3 flex items-center gap-2"
                      >
                        <AccountBalanceWalletIcon fontSize="small" />
                        Payment Status
                      </Typography>

                      <div 
                        style={{
                          backgroundColor: isDark ? "rgba(255, 255, 255, 0.05)" : "#f9fafb"
                        }}
                        className="p-3 rounded-lg mb-3"
                      >
                        <div className="flex justify-between items-center">
                          <Typography variant="body2">Fine Status:</Typography>
                          <Chip
                            label="Unpaid"
                            color="error"
                            size="small"
                            icon={<PaidIcon />}
                          />
                        </div>
                      </div>

                      <Typography
                        variant="body2"
                        style={{ color: theme.palette.text.secondary }}
                        className="italic"
                      >
                        Fine must be paid before the end of the semester to
                        avoid exam restrictions.
                      </Typography>

                      {/* NEW: Show payment receipt if available */}
                      {selectedMember.proofOfPayment && (
                        <Box
                          mt={2}
                          p={2}
                          border={`1px solid ${theme.palette.divider}`}
                          borderRadius={1}
                        >
                          <Typography variant="subtitle2" gutterBottom>
                            Payment Receipt
                          </Typography>
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<ReceiptIcon />}
                            onClick={() =>
                              handleOpenReceipt(
                                selectedMember.proofOfPayment.fileUrl
                              )
                            }
                          >
                            View Receipt
                          </Button>
                        </Box>
                      )}
                    </CardContent>
                  </Card>

                  <div 
                    style={{
                      backgroundColor: isDark ? "rgba(255, 255, 255, 0.05)" : "#f9fafb"
                    }}
                    className="p-4 rounded-lg"
                  >
                    <Typography
                      variant="subtitle1"
                      className="font-semibold mb-2"
                    >
                      Member Contact
                    </Typography>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                          Email
                        </Typography>
                        <Typography variant="body2">
                          {selectedMember.email}
                        </Typography>
                      </div>
                      <div>
                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                          Contact
                        </Typography>
                        <Typography variant="body2">
                          {selectedMember.contact || "Not provided"}
                        </Typography>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 mt-4">
                    <Button
                      variant="outlined"
                      onClick={handleCloseModal}
                      style={{ borderColor: "#ca0019", color: "#ca0019" }}
                    >
                      Close
                    </Button>
                    {/* UPDATED: This button now opens the payment modal */}
                    <Button
                      variant="contained"
                      style={{ backgroundColor: "#ca0019" }}
                      onClick={() => viewFineDetails(selectedMember)}
                    >
                      View Fines
                    </Button>
                  </div>
                </div>
              ) : (
                // Supplementary Exam Details Content
                <div className="space-y-4">
                  <div 
                    style={{
                      backgroundColor: isDark ? "rgba(33, 150, 243, 0.15)" : "#eff6ff"
                    }}
                    className="p-4 rounded-lg"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <SchoolIcon className="text-blue-600" />
                      <Typography variant="h6" className="font-semibold">
                        Semester {currentSemester} Supplementary Exams
                      </Typography>
                    </div>

                    {selectedMember.semesterSupplementary.find(
                      (sem) => sem.semester === currentSemester
                    ) ? (
                      <List 
                        style={{
                          backgroundColor: theme.palette.background.paper,
                          borderColor: theme.palette.divider,
                        }}
                        className="rounded-lg border"
                      >
                        {selectedMember.semesterSupplementary
                          .find((sem) => sem.semester === currentSemester)
                          .subjects.map((subject, idx) => (
                            <ListItem
                              key={idx}
                              divider={
                                idx !==
                                selectedMember.semesterSupplementary.find(
                                  (sem) => sem.semester === currentSemester
                                ).subjects.length -
                                1
                              }
                            >
                              <ListItemAvatar>
                                {subject.status === "pending" ? (
                                  <Avatar className="bg-amber-100">
                                    <PendingIcon className="text-amber-600" />
                                  </Avatar>
                                ) : subject.status === "passed" ? (
                                  <Avatar className="bg-green-100">
                                    <DoneIcon className="text-green-600" />
                                  </Avatar>
                                ) : (
                                  <Avatar className="bg-red-100">
                                    <ClearIcon className="text-red-600" />
                                  </Avatar>
                                )}
                              </ListItemAvatar>
                              <ListItemText
                                primary={
                                  <div className="flex justify-between">
                                    <span>{subject.subjectName}</span>
                                    <Chip
                                      label={subject.status.toUpperCase()}
                                      size="small"
                                      className={`${subject.status === "passed"
                                          ? "bg-green-100 text-green-800"
                                          : subject.status === "failed"
                                            ? "bg-red-100 text-red-800"
                                            : "bg-amber-100 text-amber-800"
                                        }`}
                                    />
                                  </div>
                                }
                                secondary={`Subject Code: ${subject.subjectCode}`}
                              />
                            </ListItem>
                          ))}
                      </List>
                    ) : (
                      <Typography
                        variant="body2"
                        className="text-center text-gray-500 py-2"
                      >
                        No supplementary exams found for this semester
                      </Typography>
                    )}
                  </div>

                  <Card variant="outlined" className="border-blue-200">
                    <CardContent>
                      <Typography
                        variant="subtitle1"
                        className="font-semibold mb-3 flex items-center gap-2"
                      >
                        <SubjectIcon fontSize="small" />
                        Exam Information
                      </Typography>

                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <Typography variant="body2">
                            Total Supplementary Subjects:
                          </Typography>
                          <Chip
                            label={
                              selectedMember.semesterSupplementary.find(
                                (sem) => sem.semester === currentSemester
                              )?.subjects.length || 0
                            }
                            color="primary"
                            size="small"
                          />
                        </div>
                        <div className="flex justify-between items-center">
                          <Typography variant="body2">
                            Pending Exams:
                          </Typography>
                          <Chip
                            label={
                              selectedMember.semesterSupplementary
                                .find((sem) => sem.semester === currentSemester)
                                ?.subjects.filter(
                                  (subj) => subj.status === "pending"
                                ).length || 0
                            }
                            color="warning"
                            size="small"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <Typography
                      variant="subtitle1"
                      className="font-semibold mb-2"
                    >
                      Academic Information
                    </Typography>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Typography variant="body2" className="text-gray-500">
                          Semester SGPA
                        </Typography>
                        <Typography variant="body2">
                          {selectedMember.semesterSGPA
                            ?.find((sem) => sem.semester === currentSemester)
                            ?.sgpa.toFixed(2) || "N/A"}
                        </Typography>
                      </div>
                      <div>
                        <Typography variant="body2" className="text-gray-500">
                          Course
                        </Typography>
                        <Typography variant="body2">
                          {selectedMember.course || "B.Tech CSE"}
                        </Typography>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 mt-4">
                    <Button
                      variant="outlined"
                      onClick={handleCloseModal}
                      style={{ borderColor: "#ca0019", color: "#ca0019" }}
                    >
                      Close
                    </Button>
                    <Button
                      variant="contained"
                      style={{ backgroundColor: "#ca0019" }}
                    >
                      Update Status
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </Box>
      </Modal>

      {/* NEW: Fine Payment Modal */}
      <FinePaymentModal
        open={openPaymentModal}
        onClose={() => setOpenPaymentModal(false)}
        memberId={fineToUpdate?.memberId}
        fine={fineToUpdate?.fine}
        onPaymentComplete={handlePaymentComplete}
      />

      {/* NEW: Receipt Preview Modal */}
      <ReceiptPreviewModal
        open={openReceiptPreview}
        onClose={() => setOpenReceiptPreview(false)}
        receiptUrl={receiptPreviewUrl}
      />

      {/* NEW: Success notification */}
      <Snackbar
        open={paymentComplete}
        autoHideDuration={4000}
        onClose={() => setPaymentComplete(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="success">Payment recorded successfully!</Alert>
      </Snackbar>

      {/* NEW: Fine Details Modal */}
      <FineDetailsModal
        open={openViewModal}
        onClose={() => setOpenViewModal(false)}
        selectedFine={selectedFine}
        onPayFine={(memberId, fineId) => {
          setFineToUpdate({ memberId, fine: { _id: fineId } });
          setOpenPaymentModal(true);
        }}
        loading={loading}
      />

      {/* Add this to the end of your component return statement */}
      <FineDetailsModal
        open={openViewModal}
        onClose={() => setOpenViewModal(false)}
        selectedFine={selectedFine}
        onPayFine={handlePayFine}
        loading={loading}
      />
    </div>
  );
};

export default Index;
