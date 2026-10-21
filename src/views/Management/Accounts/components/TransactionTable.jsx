/**
 * @file TransactionTable.jsx
 * @description Accounts fine transaction management table refactored with usePaginatedQuery,
 * ModernTable, and DataTablePagination.
 */

import React, { useState } from "react";
import ModernTable from "@/components/tables/ModernTable";
import SearchFilterBar from "@/components/common/filters/SearchFilterBar";
import { usePaginatedQuery } from "@/hooks/usePaginatedQuery";
import fineService from "@/services/fineService";
import {
  Box,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TableCell,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  IconButton,
  Divider,
  InputAdornment,
  useTheme,
} from "@mui/material";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import ReceiptIcon from "@mui/icons-material/Receipt";
import Close from "@mui/icons-material/Close";
import UploadFile from "@mui/icons-material/UploadFile";
import { FILE_VALIDATION_PRESETS, validateFiles } from "@/utils/fileValidation";

export const FinePaymentModal = ({ open, onClose, memberId, fine, onPaymentComplete }) => {
  const theme = useTheme();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [reference, setReference] = useState("");
  const [previewUrl, setPreviewUrl] = useState(null);
  const [error, setError] = useState("");

  const handleFileChange = (e) => {
    const { validFiles, allValid } = validateFiles(e.target.files, FILE_VALIDATION_PRESETS.RECEIPT, { inputTarget: e });
    if (!allValid || validFiles.length === 0) return;
    setFiles(validFiles);
    if (validFiles[0].type.startsWith("image/")) {
      setPreviewUrl(URL.createObjectURL(validFiles[0]));
    }
  };

  const handleClose = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFiles([]);
    setPreviewUrl(null);
    setError("");
    setPaymentMethod("upi");
    setReference("");
    onClose();
  };

  const handleSubmit = async () => {
    try {
      if (files.length === 0) {
        setError("Please upload a payment receipt");
        return;
      }
      setLoading(true);
      setError("");

      const formData = new FormData();
      formData.append("memberId", memberId);
      formData.append("fineId", fine._id);
      formData.append("fileType", "receipt");
      formData.append("files", files[0]);

      const uploadResponse = await fineService.uploadFineReceipt(formData);
      if (!uploadResponse.success) throw new Error(uploadResponse.message || "Failed to upload receipt");

      const uploadedFile = uploadResponse.files?.[0];
      await fineService.updateFineStatus(memberId, fine._id, {
        status: "paid",
        proofOfPayment: {
          _id: uploadedFile._id,
          fileId: uploadedFile.fileId,
          fileUrl: uploadedFile.fileUrl || uploadedFile.url,
          fileName: uploadedFile.fileName || "receipt.pdf",
        },
        paymentMethod,
        paymentReference: reference,
      });

      if (onPaymentComplete) onPaymentComplete();
      handleClose();
    } catch (err) {
      setError(err?.message || "Failed to process payment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={loading ? null : handleClose} fullWidth maxWidth="sm">
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Mark Fine as Paid</Typography>
          {!loading && <IconButton onClick={handleClose}><Close /></IconButton>}
        </Box>
      </DialogTitle>
      <DialogContent>
        {fine && (
          <>
            <Typography variant="body1">Amount: ₹{fine.amount}</Typography>
            <Typography variant="body2" color="textSecondary">Reason: {fine.reason}</Typography>
            <Divider sx={{ my: 2 }} />
            <FormControl fullWidth margin="normal">
              <InputLabel>Payment Method</InputLabel>
              <Select value={paymentMethod} label="Payment Method" onChange={(e) => setPaymentMethod(e.target.value)}>
                <MenuItem value="upi">UPI</MenuItem>
                <MenuItem value="bank_transfer">Bank Transfer</MenuItem>
                <MenuItem value="cash">Cash</MenuItem>
              </Select>
            </FormControl>
            <TextField
              margin="normal"
              fullWidth
              label="Payment Reference"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              InputProps={{ startAdornment: <InputAdornment position="start"><ReceiptIcon fontSize="small" /></InputAdornment> }}
            />
            <input type="file" accept="image/*,.pdf" onChange={handleFileChange} style={{ marginTop: 16 }} />
            {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading || files.length === 0} startIcon={loading ? <CircularProgress size={16} /> : <UploadFile />}>
          Submit Payment
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export const TransactionTable = () => {
  const [alert, setAlert] = useState({ open: false, message: "", severity: "success" });

  const {
    data: members,
    loading,
    search,
    page,
    limit,
    filters,
    pagination,
    setPage,
    setLimit,
    setSearch,
    setFilter,
    refetch,
  } = usePaginatedQuery({
    query: fineService.getFineMembers,
    defaultLimit: 10,
    defaultFilters: { status: "All", batch: "All Batches" },
  });

  const exportToExcel = async () => {
    const XLSX = await import("xlsx");
    const worksheet = XLSX.utils.json_to_sheet(
      members.filter(Boolean).map((m) => ({
        "Member Name": m.name || m.fullName || "N/A",
        "Admission No": m.admno || "N/A",
        "Batch": m.batch || "N/A",
        "Total Pending": m.totalPendingAmount || m.totalPendingFine || 0,
        "Pending Count": m.pendingFinesCount || 0,
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Fines");
    XLSX.writeFile(workbook, "fine_records.xlsx");
  };

  const columns = [
    { id: "member", label: "Member Details", width: "25%" },
    { id: "batch", label: "Batch", width: "15%" },
    { id: "totalFines", label: "Total Fines", align: "center", width: "15%" },
    { id: "pendingAmount", label: "Pending (₹)", align: "right", width: "20%" },
    { id: "paidAmount", label: "Paid (₹)", align: "right", width: "25%" },
  ];

  return (
    <Box sx={{ p: 2 }}>
      <SearchFilterBar
        search={search}
        onSearchChange={setSearch}
        placeholder="Search member name or admission no..."
        loading={loading}
        filterSlot={
          <>
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.status || "All"}
                label="Status"
                onChange={(e) => setFilter("status", e.target.value)}
              >
                <MenuItem value="All">All Statuses</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="paid">Paid</MenuItem>
                <MenuItem value="waived">Waived</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel>Batch</InputLabel>
              <Select
                value={filters.batch || "All Batches"}
                label="Batch"
                onChange={(e) => setFilter("batch", e.target.value)}
              >
                <MenuItem value="All Batches">All Batches</MenuItem>
                <MenuItem value="The Uniques 1.0">Uniques 1.0</MenuItem>
                <MenuItem value="The Uniques 2.0">Uniques 2.0</MenuItem>
                <MenuItem value="The Uniques 3.0">Uniques 3.0</MenuItem>
                <MenuItem value="The Uniques 4.0">Uniques 4.0</MenuItem>
              </Select>
            </FormControl>
          </>
        }
        actionSlot={
          <Button variant="outlined" startIcon={<FileDownloadIcon />} onClick={exportToExcel}>
            Export
          </Button>
        }
      />

      <ModernTable
        columns={columns}
        data={members}
        loading={loading}
        pagination={{
          page,
          limit,
          total: pagination.total,
          pages: pagination.pages,
          onPageChange: setPage,
          onLimitChange: setLimit,
        }}
        renderRow={(m) => (
          <React.Fragment key={m._id || m.id}>
            <TableCell>
              <Typography variant="body2" fontWeight={600}>{m.fullName || m.name}</Typography>
              <Typography variant="caption" color="text.secondary">{m.admno} • {m.email}</Typography>
            </TableCell>
            <TableCell>{m.batch || "N/A"}</TableCell>
            <TableCell align="center">{m.totalFinesCount || m.pendingFinesCount || 0}</TableCell>
            <TableCell align="right" sx={{ color: "error.main", fontWeight: 700 }}>
              ₹{m.totalPendingAmount || m.totalPendingFine || 0}
            </TableCell>
            <TableCell align="right" sx={{ color: "success.main", fontWeight: 600 }}>
              ₹{m.totalPaidAmount || m.totalPaidFine || 0}
            </TableCell>
          </React.Fragment>
        )}
      />

      <Snackbar
        open={alert.open}
        autoHideDuration={4000}
        onClose={() => setAlert({ ...alert, open: false })}
      >
        <Alert severity={alert.severity}>{alert.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default TransactionTable;
