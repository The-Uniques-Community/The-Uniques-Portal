import React, { useState, useEffect } from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  Chip,
  Pagination,
  Modal,
  IconButton,
  Avatar,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  InputAdornment,
  Snackbar,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  Card,
  CardContent,
  Grid,
  Tab,
  Tabs,
  Tooltip,
  Link,
  Stack,
  Badge,
  Autocomplete,
  useTheme,
} from "@mui/material";
import {
  FileDownload as FileDownloadIcon,
  Search as SearchIcon,
  Close as CloseIcon,
  Visibility as VisibilityIcon,
  Delete as DeleteIcon,
  AddCircle as AddCircleIcon,
  PersonSearch as PersonSearchIcon,
  CurrencyRupee as CurrencyRupeeIcon,
  CheckCircle as CheckCircleIcon,
  DateRange as DateRangeIcon,
  ErrorOutline as ErrorOutlineIcon,
  Receipt as ReceiptIcon,
  Refresh as RefreshIcon,
  History as HistoryIcon,
  Dashboard as DashboardIcon,
  Info as InfoIcon,
  CloudUpload,
  InsertDriveFile,
  UploadFile,
  RemoveCircle,
  Preview,
  Close
} from "@mui/icons-material";
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import axios from "axios";
// Import date-fns without destructuring to avoid the missing module error
import * as dateFns from 'date-fns';
import tu from '@/assets/logos/tu.png';
import * as XLSX from 'xlsx';

// Base API URL
const API_BASE_URL = 'http://localhost:5000/api/admin/fine';
const UPLOAD_API_URL = 'http://localhost:5000/upload/fine_file_upload';

// Fine Payment Modal Component - Fix Receipt icon reference
const FinePaymentModal = ({ open, onClose, memberId, fine, onPaymentComplete }) => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [reference, setReference] = useState('');
  const [previewUrl, setPreviewUrl] = useState(null);
  const [error, setError] = useState('');

  // Handle file selection
  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length > 0) {
      setFiles(selectedFiles);
      
      // Create preview for image files
      if (selectedFiles[0].type.startsWith('image/')) {
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
        setError('Please upload a payment receipt');
        return;
      }

      setLoading(true);
      setError('');

      // 1. First upload the file(s)
      const formData = new FormData();
      formData.append('memberId', memberId);
      formData.append('fineId', fine._id);
      formData.append('fileType', 'receipt');
      
      files.forEach(file => {
        formData.append('files', file);
      });

      // Upload the file
      const uploadResponse = await axios.post(
        UPLOAD_API_URL,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (!uploadResponse.data.success) {
        throw new Error(uploadResponse.data.message || 'Failed to upload receipt');
      }

      // 2. Now update the fine with the file reference
      if (uploadResponse.data.files && uploadResponse.data.files.length > 0) {
        const fileId = uploadResponse.data.files[0]._id;
        
        // Update the fine status and attach the proof
        const updateResponse = await axios.patch(
          `${API_BASE_URL}/members/${memberId}/fines/${fine._id}`,
          {
            status: 'paid',
            proofOfPaymentId: fileId,
            paymentMethod: paymentMethod,
            paymentReference: reference
          }
        );

        if (updateResponse.data.success) {
          if (onPaymentComplete) {
            onPaymentComplete({
              ...updateResponse.data.data,
              proofFile: uploadResponse.data.files[0]
            });
          }
          handleClose();
        }
      }
    } catch (err) {
      console.error('Error processing payment:', err);
      setError(err.message || 'Failed to process payment');
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
    setError('');
    setPaymentMethod('upi');
    setReference('');
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
          <Typography variant="h6">
            Mark Fine as Paid
          </Typography>
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
              
              <Typography variant="body2" color="textSecondary">
                Reason: {fine.reason}
              </Typography>
              
              <Typography variant="body2" color="textSecondary">
                Date Imposed: {new Date(fine.dateImposed).toLocaleDateString()}
              </Typography>
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
                    {/* FIX: Changed Receipt to ReceiptIcon */}
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
              bgcolor={files.length > 0 ? 'rgba(0,0,0,0.02)' : 'transparent'}
            >
              {files.length > 0 ? (
                <Box>
                  {previewUrl ? (
                    <Box mb={2} position="relative">
                      <img 
                        src={previewUrl} 
                        alt="Receipt preview" 
                        style={{ 
                          maxWidth: '100%', 
                          maxHeight: '200px',
                          borderRadius: '4px'
                        }} 
                      />
                    </Box>
                  ) : (
                    <Box mb={2} display="flex" alignItems="center" justifyContent="center">
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
                  <Typography variant="caption" display="block" mt={1} color="textSecondary">
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
          {loading ? 'Processing...' : 'Submit Payment'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const FineTable = () => {
  const theme = useTheme();
  // State management
  const [fines, setFines] = useState([]);
  const [statistics, setStatistics] = useState({
    totalFinesIssued: 0,
    totalAmount: 0,
    totalPendingAmount: 0,
    totalPaidAmount: 0,
    totalWaivedAmount: 0,
    membersWithPendingFines: 0,
    recentFines: []
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [batchFilter, setBatchFilter] = useState("All Batches");
  const [statusFilter, setStatusFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [rowsPerPage] = useState(10);
  
  // Modal states
  const [openViewModal, setOpenViewModal] = useState(false);
  const [openAddFineModal, setOpenAddFineModal] = useState(false);
  const [openDeleteConfirmModal, setOpenDeleteConfirmModal] = useState(false);
  const [openStatsModal, setOpenStatsModal] = useState(false);
  const [selectedFine, setSelectedFine] = useState(null);
  const [fineToDelete, setFineToDelete] = useState(null);
  
  // Search members modal
  const [openSearchModal, setOpenSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  
  // New fine state
  const [selectedMember, setSelectedMember] = useState(null);
  const [fineAmount, setFineAmount] = useState("");
  const [fineReason, setFineReason] = useState("");
  const [fineDate, setFineDate] = useState(new Date());
  
  // Tab state for fine details modal
  const [activeTab, setActiveTab] = useState(0);

  // NEW: Payment and Receipt states
  const [openPaymentModal, setOpenPaymentModal] = useState(false);
  const [selectedFineForPayment, setSelectedFineForPayment] = useState(null);
  const [receiptPreviewUrl, setReceiptPreviewUrl] = useState(null);
  const [openReceiptPreview, setOpenReceiptPreview] = useState(false);
  
  // Alert state
  const [alert, setAlert] = useState({
    open: false,
    message: "",
    severity: "success"
  });

  // NEW: Handle payment completion
  const handlePaymentComplete = (updatedFine) => {
    // Refresh fine data
    fetchFines();
    
    setAlert({
      open: true,
      message: "Payment recorded successfully!",
      severity: "success"
    });
  };
  
  // NEW: Receipt preview handler
  const handleOpenReceipt = (fileUrl) => {
    // If we have a file object reference
    if (fileUrl && fileUrl.fileUrl) {
      setReceiptPreviewUrl(fileUrl.fileId);
      setOpenReceiptPreview(true);
      return;
    }
    
    // Show error
    setAlert({
      open: true,
      message: "Cannot open receipt: File not found",
      severity: "error"
    });
  };

  // Get fine statistics
  const fetchFineStatistics = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/fines/statistics`);
      setStatistics(response.data.data);
    } catch (error) {
      console.error("Error fetching fine statistics:", error);
      setAlert({
        open: true,
        message: "Failed to fetch fine statistics",
        severity: "error"
      });
    }
  };

  // Fetch members with fines
  // Fetch members with fines - FIXED VERSION to show ALL statuses
  const fetchFines = async () => {
    try {
      setLoading(true);
      
      // Use this generic endpoint instead of the specific "pending" one
      const endpoint = `${API_BASE_URL}/fines/members`;
      
      // Create query parameters object
      const params = {
        page,
        limit: rowsPerPage
      };
      
      if (batchFilter !== "All Batches") {
        params.batch = batchFilter;
      }
      
      if (search && search.trim() !== "") {
        params.search = search.trim();
      }
      
      // Only add status filter if not "All"
      if (statusFilter !== "All") {
        params.status = statusFilter.toLowerCase();
      }
      
      const response = await axios.get(endpoint, { params });
      
      if (response.data && response.data.success) {
        setFines(response.data.data.members || []);
        setTotalPages(Math.ceil(response.data.data.count / rowsPerPage) || 1);
        fetchFineStatistics(); // Get updated statistics
      } else {
        throw new Error("Failed to fetch fine data");
      }
      
      setLoading(false);
    } catch (error) {
      console.error("Error fetching fines:", error);
      setAlert({
        open: true,
        message: "Failed to fetch fine records",
        severity: "error"
      });
      setLoading(false);
    }
  };

  const imposeFine = async () => {
    if (!selectedMember || !fineAmount || !fineReason) {
      setAlert({
        open: true,
        message: "Please complete all required fields",
        severity: "warning"
      });
      return;
    }
    
    try {
      setLoading(true);
      
      await axios.post(`${API_BASE_URL}/members/${selectedMember._id}/fines`, {
        amount: Number(fineAmount),
        reason: fineReason,
        dateImposed: fineDate
      });
      
      setAlert({
        open: true,
        message: `Fine of ₹${fineAmount} imposed successfully`,
        severity: "success"
      });
      
      // Reset form and close modal
      setSelectedMember(null);
      setFineAmount("");
      setFineReason("");
      setFineDate(new Date());
      setOpenAddFineModal(false);
      
      // Refresh data
      fetchFines();
    } catch (error) {
      console.error("Error imposing fine:", error);
      setAlert({
        open: true,
        message: error.response?.data?.message || "Failed to impose fine",
        severity: "error"
      });
      setLoading(false);
    }
  };

  const updateFineStatus = async (memberId, fineId, newStatus) => {
    try {
      setLoading(true);
      
      await axios.patch(`${API_BASE_URL}/members/${memberId}/fines/${fineId}`, {
        status: newStatus
      });
      
      setAlert({
        open: true,
        message: `Fine marked as ${newStatus} successfully`,
        severity: "success"
      });
      
      // Refresh data and close modal if open
      fetchFines();
      setOpenViewModal(false);
    } catch (error) {
      console.error("Error updating fine status:", error);
      setAlert({
        open: true,
        message: error.response?.data?.message || "Failed to update fine status",
        severity: "error"
      });
      setLoading(false);
    }
  };

  const removeFine = async () => {
    if (!fineToDelete) return;
    
    try {
      setLoading(true);
      
      await axios.delete(`${API_BASE_URL}/members/${fineToDelete.memberId}/fines/${fineToDelete.fineId}`);
      
      setAlert({
        open: true,
        message: "Fine removed successfully",
        severity: "success"
      });
      
      // Reset state and close modal
      setFineToDelete(null);
      setOpenDeleteConfirmModal(false);
      
      // Refresh data
      fetchFines();
    } catch (error) {
      console.error("Error removing fine:", error);
      setAlert({
        open: true,
        message: error.response?.data?.message || "Failed to remove fine",
        severity: "error"
      });
      setLoading(false);
    }
  };

  const viewFineDetails = async (member) => {
    try {
      setLoading(true);
      
      // Get complete fine history for the member
      const response = await axios.get(`${API_BASE_URL}/members/${member.id}/fines`);
      
      setSelectedFine({
        member,
        fines: response.data.data.fines,
        totals: response.data.data.totals
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

  const searchMembers = async () => {
    if (!searchQuery.trim()) return;
    
    try {
      setSearchLoading(true);
      
      const response = await axios.get(`${API_BASE_URL}/members/search`, {
        params: {
          query: searchQuery,
          batch: batchFilter !== "All Batches" ? batchFilter : undefined,
          limit: 10
        }
      });
      
      setSearchResults(response.data.data || []);
      setSearchLoading(false);
    } catch (error) {
      console.error("Error searching members:", error);
      setAlert({
        open: true,
        message: error.response?.data?.message || "Failed to search members",
        severity: "error"
      });
      setSearchLoading(false);
    }
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    // Reset to first page when searching
    setPage(1);
  };

  // Handle batch filter change
  const handleBatchChange = (e) => {
    setBatchFilter(e.target.value);
    // Reset to first page when changing filter
    setPage(1);
  };

  // Handle status filter change
  const handleStatusChange = (e) => {
    setStatusFilter(e.target.value);
    // Reset to first page when changing filter
    setPage(1);
  };

  // Export to Excel function
  const exportToExcel = () => {
    // Create worksheet from fines data
    const worksheet = XLSX.utils.json_to_sheet(fines.map(fine => ({
      'Member Name': fine.name,
      'Admission No': fine.admno,
      'Batch': fine.batch,
      'Total Pending Amount': fine.totalPendingAmount,
      'Pending Fines Count': fine.pendingFinesCount,
      'Last Updated': new Date(fine.updatedAt).toLocaleDateString()
    })));
    
    // Create workbook and add worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Fines');
    
    // Generate Excel file and trigger download
    XLSX.writeFile(workbook, `Fine_Records_${new Date().toISOString().split('T')[0]}.xlsx`);
  };
  
  // Load data when component mounts or filters change
  useEffect(() => {
    fetchFines();
  }, [page, batchFilter, statusFilter]);

  // Separate useEffect for search to add debouncing
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchFines();
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [search]);

  // Status Chip component
  const getStatusChip = (status) => {
    switch (status.toLowerCase()) {
      case "paid":
        return <Chip label="Paid" color="success" size="small" />;
      case "pending":
        return <Chip label="Pending" color="warning" size="small" />;
      case "waived":
        return <Chip label="Waived" color="default" size="small" />;
      default:
        return <Chip label={status} size="small" />;
    }
  };

  return (
    <Box
      sx={{
        backgroundColor: "#f5f5f5",
        color: "#333",
        minHeight: "80vh",
        p: 3,
      }}
    >
      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', boxShadow: 2 }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="overline">
                Total Fines Amount
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#ca0019' }}>
                ₹{statistics.totalAmount || 0}
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                {statistics.totalFinesIssued || 0} fines issued in total
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', boxShadow: 2 }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="overline">
                Pending Amount
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: theme.palette.warning.main }}>
                ₹{statistics.totalPendingAmount || 0}
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                {statistics.membersWithPendingFines || 0} members with pending fines
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', boxShadow: 2 }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="overline">
                Paid Amount
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: theme.palette.success.main }}>
                ₹{statistics.totalPaidAmount || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            sx={{ 
              height: '100%', 
              boxShadow: 2, 
              cursor: 'pointer',
              '&:hover': { boxShadow: 4 } 
            }}
            onClick={() => setOpenStatsModal(true)}
          >
            <CardContent sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <Typography color="textSecondary" gutterBottom variant="overline">
                Statistics & Insights
              </Typography>
              <Box sx={{ mt: 'auto', display: 'flex', alignItems: 'center' }}>
                <DashboardIcon sx={{ color: '#ca0019', mr: 1 }} />
                <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                  View Detailed Analytics
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Header */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h5" fontWeight="bold">
          Fine Records
        </Typography>
        <Button 
          variant="contained" 
          color="primary"
          startIcon={<AddCircleIcon />}
          onClick={() => setOpenSearchModal(true)}
          sx={{ bgcolor: "#ca0019" }}
        >
          Add New Fine
        </Button>
      </Box>

      {/* Filters & Search */}
      <Box display="flex" justifyContent="space-between" mb={2} flexWrap="wrap" gap={2}>
        <TextField
          variant="outlined"
          placeholder="Search by Name or Admission No"
          value={search}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: "#555" }} />,
          }}
          sx={{ bgcolor: "#fff", borderRadius: 1, input: { color: "#333" }, flexGrow: 1 }}
        />
        <Box display="flex" gap={2} flexWrap="wrap">
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={handleStatusChange}
              sx={{ bgcolor: "#fff", color: "#333" }}
            >
              <MenuItem value="All">All Status</MenuItem>
              <MenuItem value="Pending">Pending</MenuItem>
              <MenuItem value="Paid">Paid</MenuItem>
              <MenuItem value="Waived">Waived</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Batch</InputLabel>
            <Select
              value={batchFilter}
              label="Batch"
              onChange={handleBatchChange}
              sx={{ bgcolor: "#fff", color: "#333" }}
            >
              <MenuItem value="All Batches">All Batches</MenuItem>
              <MenuItem value="The Uniques 1.0">The Uniques 1.0</MenuItem>
              <MenuItem value="The Uniques 2.0">The Uniques 2.0</MenuItem>
              <MenuItem value="The Uniques 3.0">The Uniques 3.0</MenuItem>
            </Select>
          </FormControl>
          
          <Button 
            variant="contained" 
            startIcon={<FileDownloadIcon />}
            onClick={exportToExcel}
            sx={{ bgcolor: "#ca0019" }}
          >
            Export Excel
          </Button>
        </Box>
      </Box>

      {/* Fines Table */}
      <TableContainer
        component={Paper}
        sx={{ backgroundColor: "#fff", minHeight: "50vh" }}
      >
        <Table>
          <TableHead sx={{ padding: 2 }}>
            <TableRow sx={{ bgcolor: "#fff", borderBottom: 2 }}>
              <TableCell sx={{ color: "#555", fontWeight: "bold" }}>
                Member
              </TableCell>
              <TableCell sx={{ color: "#555", fontWeight: "bold" }}>
                Batch
              </TableCell>
              <TableCell sx={{ color: "#555", fontWeight: "bold" }}>
                Pending Amount
              </TableCell>
              <TableCell sx={{ color: "#555", fontWeight: "bold" }}>
                Pending Fines
              </TableCell>
              <TableCell sx={{ color: "#555", fontWeight: "bold" }}>
                Last Updated
              </TableCell>
              <TableCell sx={{ color: "#555", fontWeight: "bold", width: 120 }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                  <CircularProgress size={40} sx={{ color: "#ca0019" }} />
                </TableCell>
              </TableRow>
            ) : fines.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                  <Typography variant="body1">No fine records found</Typography>
                </TableCell>
              </TableRow>
            ) : (
              fines.map((fine) => (
                <TableRow key={fine.id} hover>
                  <TableCell sx={{ color: "#333" }}>
                    <div className="flex items-center gap-2">
                      <Avatar alt={fine.name} src={fine.profilePic?.url} />
                      <div>
                        <Typography variant="body1">{fine.name}</Typography>
                        <Typography variant="caption" color="textSecondary">
                          {fine.admno}
                        </Typography>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell sx={{ color: "#333" }}>
                    <div className="flex gap-x-1 items-center"> 
                      <img className="h-5 w-5 object-center object-contain inline" src={tu} alt="TU"/> 
                      {fine.batch}
                    </div>
                  </TableCell>
                  <TableCell sx={{ color: "#333" }}>
                    <Typography
                      sx={{
                        fontWeight: 'bold',
                        color: fine.totalPendingAmount > 0 ? theme.palette.warning.dark : theme.palette.success.main
                      }}
                    >
                      ₹{fine.totalPendingAmount}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ color: "#333" }}>
                    {fine.pendingFinesCount > 0 ? (
                      <Badge badgeContent={fine.pendingFinesCount} color="warning">
                        <ReceiptIcon fontSize="small" />
                      </Badge>
                    ) : (
                      <Chip label="None" size="small" color="success" />
                    )}
                  </TableCell>
                  <TableCell sx={{ color: "#333" }}>
                    {new Date(fine.updatedAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Box display="flex" gap={1}>
                      <Tooltip title="View Details">
                        <IconButton 
                          color="primary" 
                          onClick={() => viewFineDetails(fine)}
                          size="small"
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Add Fine">
                        <IconButton 
                          color="warning"
                          size="small"
                          onClick={() => {
                            setSelectedMember({
                              _id: fine.id,
                              fullName: fine.name,
                              admno: fine.admno,
                              batch: fine.batch,
                              profilePic: fine.profilePic,
                              pendingAmount: fine.totalPendingAmount
                            });
                            setOpenAddFineModal(true);
                          }}
                        >
                          <AddCircleIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <Box display="flex" justifyContent="center" mt={2}>
        <Pagination
          count={totalPages}
          page={page}
          onChange={(e, value) => setPage(value)}
          sx={{
            "& .Mui-selected": {
              backgroundColor: "#ca0019 !important",
              color: "white",
            },
          }}
        />
      </Box>

      {/* View Fine Details Modal */}
      <Modal
        open={openViewModal}
        onClose={() => setOpenViewModal(false)}
        aria-labelledby="fine-details-modal"
      >
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 700,
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
          maxHeight: '90vh',
          overflow: 'auto'
        }}>
          <div className="flex justify-between items-center mb-2">
            <Typography variant="h5" component="h2" fontWeight="bold">
              Fine Details
            </Typography>
            <IconButton onClick={() => setOpenViewModal(false)}>
              <CloseIcon />
            </IconButton>
          </div>
          
          {selectedFine && (
            <>
              <div className="flex items-center gap-3 mb-4">
                <Avatar 
                  src={selectedFine.member.profilePic?.url} 
                  alt={selectedFine.member.name}
                  sx={{ width: 56, height: 56 }}
                />
                <div>
                  <Typography variant="h6">{selectedFine.member.name}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    {selectedFine.member.admno} • {selectedFine.member.batch}
                  </Typography>
                </div>
              </div>
              
              <Divider sx={{ mb: 3 }} />
              
              {/* Tabs for fine details */}
              <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
                  <Tab label="Summary" />
                  <Tab label="Fine History" />
                </Tabs>
              </Box>
              
              {/* Summary Tab */}
              {activeTab === 0 && (
                <div>
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={12} sm={4}>
                      <Card sx={{ bgcolor: theme.palette.warning.light, height: '100%' }}>
                        <CardContent>
                          <Typography variant="overline">
                            Pending
                          </Typography>
                          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                            ₹{selectedFine.totals?.pending || 0}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Card sx={{ bgcolor: theme.palette.success.light, height: '100%' }}>
                        <CardContent>
                          <Typography variant="overline">
                            Paid
                          </Typography>
                          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                            ₹{selectedFine.totals?.paid || 0}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Card sx={{ bgcolor: theme.palette.grey[200], height: '100%' }}>
                        <CardContent>
                          <Typography variant="overline">
                            Waived
                          </Typography>
                          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                            ₹{selectedFine.totals?.waived || 0}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                  
                  <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                    Pending Fines
                  </Typography>
                  
                  {selectedFine.fines.filter(f => f.status === 'pending').length > 0 ? (
                    selectedFine.fines.filter(f => f.status === 'pending').map((fine) => (
                      <Card key={fine._id} sx={{ mb: 2, borderLeft: `4px solid ${theme.palette.warning.main}` }}>
                        <CardContent sx={{ pb: 1 }}>
                          <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                            <div>
                              <Typography variant="body1" fontWeight="medium">
                                ₹{fine.amount} - {fine.reason}
                              </Typography>
                              <Typography variant="caption" color="textSecondary">
                                Imposed: {new Date(fine.dateImposed).toLocaleDateString()}
                              </Typography>
                            </div>
                            <Box>
                              {/* UPDATED: Mark Paid button now opens payment modal */}
                              <Button 
                                size="small"
                                variant="outlined"
                                color="success"
                                onClick={() => {
                                  setSelectedFineForPayment(fine);
                                  setOpenPaymentModal(true);
                                }}
                              >
                                Mark Paid
                              </Button>
                              <IconButton 
                                size="small" 
                                color="error"
                                sx={{ ml: 1 }}
                                onClick={() => {
                                  setFineToDelete({
                                    memberId: selectedFine.member.id,
                                    fineId: fine._id,
                                    amount: fine.amount
                                  });
                                  setOpenDeleteConfirmModal(true);
                                }}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <Typography variant="body2" color="textSecondary" sx={{ py: 2 }}>
                      No pending fines
                    </Typography>
                  )}
                </div>
              )}
              
              {/* History Tab */}
              {activeTab === 1 && (
                <div>
                  <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
                    All Fines
                  </Typography>
                  
                  {selectedFine.fines.length > 0 ? (
                    selectedFine.fines.map((fine) => {
                      // Determine border color based on status
                      let borderColor;
                      switch (fine.status) {
                        case 'paid': borderColor = theme.palette.success.main; break;
                        case 'pending': borderColor = theme.palette.warning.main; break;
                        case 'waived': borderColor = theme.palette.grey[500]; break;
                        default: borderColor = theme.palette.grey[300];
                      }
                      
                      return (
                        <Card key={fine._id} sx={{ mb: 2, borderLeft: `4px solid ${borderColor}` }}>
                          <CardContent>
                            <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                              <div>
                                <Typography variant="body1" fontWeight="medium">
                                  ₹{fine.amount} - {fine.reason}
                                </Typography>
                                <Box mt={0.5}>
                                  <Typography variant="caption" color="textSecondary" sx={{ display: 'block' }}>
                                    Imposed: {new Date(fine.dateImposed).toLocaleDateString()}
                                  </Typography>
                                  <Box display="flex" alignItems="center" mt={0.5}>
                                    {getStatusChip(fine.status)}
                                    {/* UPDATED: Receipt link now opens preview */}
                                    {fine.proofOfPayment && (
                                      <Link 
                                        component="button"
                                        onClick={() => handleOpenReceipt(fine.proofOfPayment)}
                                        underline="hover" 
                                        color="primary" 
                                        sx={{ ml: 2, fontSize: '0.75rem', display: 'flex', alignItems: 'center' }}
                                      >
                                        <ReceiptIcon fontSize="inherit" sx={{ mr: 0.5 }} />
                                        View Receipt
                                      </Link>
                                    )}
                                  </Box>
                                </Box>
                              </div>
                              
                              {fine.status === 'pending' && (
                                <Box>
                                  <Button 
                                    size="small"
                                    variant="outlined"
                                    color="error"
                                    onClick={() => {
                                      setFineToDelete({
                                        memberId: selectedFine.member.id,
                                        fineId: fine._id,
                                        amount: fine.amount
                                      });
                                      setOpenDeleteConfirmModal(true);
                                    }}
                                    sx={{ mr: 1 }}
                                  >
                                    Remove
                                  </Button>
                                  {/* UPDATED: Mark Paid button now opens payment modal */}
                                  <Button 
                                    size="small"
                                    variant="outlined"
                                    color="success"
                                    onClick={() => {
                                      setSelectedFineForPayment(fine);
                                      setOpenPaymentModal(true);
                                    }}
                                  >
                                    Mark Paid
                                  </Button>
                                </Box>
                              )}
                            </Box>
                          </CardContent>
                        </Card>
                      );
                    })
                  ) : (
                    <Typography variant="body2" color="textSecondary" sx={{ py: 2 }}>
                      No fine records found
                    </Typography>
                  )}
                </div>
              )}
            </>
          )}
        </Box>
      </Modal>

      {/* Search Members Modal */}
      <Dialog
        open={openSearchModal}
        onClose={() => setOpenSearchModal(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          <div className="flex justify-between items-center">
            <Typography variant="h6">Search Members</Typography>
            <IconButton onClick={() => setOpenSearchModal(false)}>
              <CloseIcon />
            </IconButton>
          </div>
        </DialogTitle>
        <DialogContent>
          <div className="mb-4 mt-2">
            <TextField
              fullWidth
              label="Search by Name, Email or Admission No"
              variant="outlined"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={searchMembers}>
                      <SearchIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  searchMembers();
                }
              }}
            />
          </div>

          {searchLoading ? (
            <div className="flex justify-center my-4">
              <CircularProgress />
            </div>
          ) : (
            <List>
              {searchResults.length === 0 ? (
                <Typography variant="body2" align="center" sx={{ py: 2, color: 'text.secondary' }}>
                  {searchQuery ? 'No members found' : 'Search for members to add a fine'}
                </Typography>
              ) : (
                searchResults.map((member) => (
                  <ListItem 
                    key={member._id}
                    button
                    onClick={() => {
                      setSelectedMember(member);
                      setOpenSearchModal(false);
                      setOpenAddFineModal(true);
                    }}
                    sx={{ 
                      borderRadius: 1,
                      mb: 1,
                      '&:hover': { bgcolor: '#f5f5f5' }
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar src={member.profilePic?.url} />
                    </ListItemAvatar>
                    <ListItemText 
                      primary={member.fullName}
                      secondary={
                        <React.Fragment>
                          <span>{member.admno}</span>
                          <span className="mx-1">•</span>
                          <span>{member.batch}</span>
                          {member.fines && member.fines.some(fine => fine.status === 'pending') && (
                            <Chip 
                              size="small" 
                              label="Has pending fines" 
                              color="error"
                              sx={{ ml: 1 }}
                            />
                          )}
                        </React.Fragment>
                      }
                    />
                  </ListItem>
                ))
              )}
            </List>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Fine Modal */}
      <Dialog
        open={openAddFineModal}
        onClose={() => setOpenAddFineModal(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          <div className="flex justify-between items-center">
            <Typography variant="h6">Add Fine</Typography>
            <IconButton onClick={() => setOpenAddFineModal(false)}>
              <CloseIcon />
            </IconButton>
          </div>
        </DialogTitle>
        <DialogContent>
          {selectedMember && (
            <>
              <div className="flex items-center gap-3 mb-4 mt-2">
                <Avatar 
                  src={selectedMember.profilePic?.url} 
                  alt={selectedMember.fullName}
                  sx={{ width: 56, height: 56 }}
                />
                <div>
                  <Typography variant="h6">{selectedMember.fullName}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    {selectedMember.admno} • {selectedMember.batch}
                  </Typography>
                </div>
              </div>
              
              <Divider sx={{ mb: 3 }} />
              
              {selectedMember.pendingAmount > 0 && (
                <Alert severity="info" sx={{ mb: 3 }}>
                  This member already has a total pending fine of ₹{selectedMember.pendingAmount}
                </Alert>
              )}
              
              <FormControl fullWidth sx={{ mb: 3 }}>
                <TextField
                  label="Fine Amount"
                  type="number"
                  InputProps={{
                    startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                  }}
                  value={fineAmount}
                  onChange={(e) => setFineAmount(e.target.value)}
                  fullWidth
                  required
                />
              </FormControl>
              
              <FormControl fullWidth sx={{ mb: 3 }}>
                <TextField
                  label="Reason for Fine"
                  multiline
                  rows={3}
                  value={fineReason}
                  onChange={(e) => setFineReason(e.target.value)}
                  fullWidth
                  required
                />
              </FormControl>
              
              <FormControl fullWidth sx={{ mb: 3 }}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Date Imposed"
                    value={fineDate}
                    onChange={(newDate) => setFineDate(newDate)}
                    slotProps={{ textField: { fullWidth: true } }}
                    maxDate={new Date()}
                  />
                </LocalizationProvider>
              </FormControl>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddFineModal(false)}>Cancel</Button>
          <Button 
            onClick={imposeFine} 
            variant="contained" 
            sx={{ bgcolor: "#ca0019" }}
          >
            Add Fine
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog
        open={openDeleteConfirmModal}
        onClose={() => setOpenDeleteConfirmModal(false)}
      >
        <DialogTitle>
          Confirm Fine Removal
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Are you sure you want to remove this fine of ₹{fineToDelete?.amount}?
          </Typography>
          <Typography variant="body2" color="error" sx={{ mt: 1 }}>
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteConfirmModal(false)}>
            Cancel
          </Button>
          <Button 
            onClick={removeFine} 
            variant="contained" 
            color="error"
          >
            Remove
          </Button>
        </DialogActions>
      </Dialog>

      {/* Statistics Modal */}
      <Dialog
        open={openStatsModal}
        onClose={() => setOpenStatsModal(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          <div className="flex justify-between items-center">
            <Typography variant="h6">Fine Statistics & Analytics</Typography>
            <IconButton onClick={() => setOpenStatsModal(false)}>
              <CloseIcon />
            </IconButton>
          </div>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mb: 4, mt: 1 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography color="textSecondary" variant="overline">
                    Total Fines
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#ca0019' }}>
                    ₹{statistics.totalAmount || 0}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {statistics.totalFinesIssued || 0} total records
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography color="textSecondary" variant="overline">
                    Pending
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: theme.palette.warning.main }}>
                    ₹{statistics.totalPendingAmount || 0}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {statistics.membersWithPendingFines || 0} members
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography color="textSecondary" variant="overline">
                    Paid
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: theme.palette.success.main }}>
                    ₹{statistics.totalPaidAmount || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography color="textSecondary" variant="overline">
                    Waived
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    ₹{statistics.totalWaivedAmount || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          
          <Typography variant="h6" sx={{ mb: 2 }}>
            Recent Activity
          </Typography>
          
          <TableContainer component={Paper} sx={{ mb: 3 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell><Typography variant="subtitle2">Member</Typography></TableCell>
                  <TableCell><Typography variant="subtitle2">Amount</Typography></TableCell>
                  <TableCell><Typography variant="subtitle2">Reason</Typography></TableCell>
                  <TableCell><Typography variant="subtitle2">Date</Typography></TableCell>
                  <TableCell><Typography variant="subtitle2">Status</Typography></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {statistics.recentFines && statistics.recentFines.length > 0 ? (
                  statistics.recentFines.map((fine) => (
                    <TableRow key={fine._id} hover>
                      <TableCell>{fine.memberName}</TableCell>
                      <TableCell>₹{fine.amount}</TableCell>
                      <TableCell>{fine.reason}</TableCell>
                      <TableCell>{new Date(fine.dateImposed).toLocaleDateString()}</TableCell>
                      <TableCell>{getStatusChip(fine.status)}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      No recent activity
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
      </Dialog>

      {/* NEW: Payment Modal */}
      <FinePaymentModal
        open={openPaymentModal}
        onClose={() => setOpenPaymentModal(false)}
        memberId={selectedFine?.member?.id}
        fine={selectedFineForPayment}
        onPaymentComplete={handlePaymentComplete}
      />

      {/* NEW: Receipt Preview Modal */}
      <Dialog
        open={openReceiptPreview}
        onClose={() => setOpenReceiptPreview(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Payment Receipt</Typography>
            <IconButton onClick={() => setOpenReceiptPreview(false)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {receiptPreviewUrl && (
            <Box textAlign="center" py={2}>
              
                <Box>
                  <iframe 
                    src={`https://drive.google.com/file/d/${receiptPreviewUrl}/preview`} 
                    width="100%" 
                    height="500px" 
                    title="PDF Receipt"
                    style={{ border: '1px solid #ddd' }}
                  />
                </Box>
            
              
              <Button
                variant="contained"
                startIcon={<Preview />}
                sx={{ mt: 2 }}
                onClick={() => window.open(receiptPreviewUrl, '_blank')}
              >
                Open in New Tab
              </Button>
            </Box>
          )}
        </DialogContent>
      </Dialog>

      {/* Alert Snackbar */}
      <Snackbar
        open={alert.open}
        autoHideDuration={6000}
        onClose={() => setAlert({...alert, open: false})}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setAlert({...alert, open: false})} 
          severity={alert.severity}
          sx={{ width: '100%' }}
        >
          {alert.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default FineTable;
