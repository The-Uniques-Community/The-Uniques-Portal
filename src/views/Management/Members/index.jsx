/**
 * @file Members/index.jsx
 * @description Admin member management view. Bug-fix: removed client-side filter collapse,
 * wired usePaginatedQuery with batch filters and DataTablePagination.
 */

import React, { useState } from "react";
import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import { MemberCardDashboard } from "@/components/cards/MemberCardDashboard";
import { CardSkeleton } from "@/components/common/skeletons";
import DataTablePagination from "@/components/common/pagination/DataTablePagination";
import SearchFilterBar from "@/components/common/filters/SearchFilterBar";
import memberService from "@/services/memberService";
import { usePaginatedQuery } from "@/hooks/usePaginatedQuery";
import {
  Typography,
  Button,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Snackbar,
  Alert,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import PersonAddIcon from "@mui/icons-material/PersonAdd";

const BATCH_TABS = [
  { id: "1", label: "All Members", batch: null, isSuspended: null },
  { id: "2", label: "Uniques 1.0", batch: "The Uniques 1.0" },
  { id: "3", label: "Uniques 2.0", batch: "The Uniques 2.0" },
  { id: "4", label: "Uniques 3.0", batch: "The Uniques 3.0" },
  { id: "5", label: "Uniques 4.0", batch: "The Uniques 4.0" },
  { id: "6", label: "Uniques 5.0", batch: "The Uniques 5.0" },
  { id: "7", label: "Uniques 6.0", batch: "The Uniques 6.0" },
  { id: "8", label: "Suspended", isSuspended: true },
];

const MembersIndex = () => {
  const [tabValue, setTabValue] = useState("1");
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [addMemberLoading, setAddMemberLoading] = useState(false);
  const [newMember, setNewMember] = useState({
    fullName: "",
    email: "",
    batch: "",
    admno: "",
    password: "",
    course: "B.Tech CSE",
  });
  const [formErrors, setFormErrors] = useState({});
  const [alert, setAlert] = useState({ open: false, message: "", severity: "success" });

  const {
    data: members,
    loading,
    error,
    page,
    limit,
    search,
    pagination,
    setPage,
    setLimit,
    setSearch,
    setFilter,
    refetch,
  } = usePaginatedQuery({
    query: memberService.getAdminMembers,
    defaultLimit: 12,
  });

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    const target = BATCH_TABS.find((b) => b.id === newValue);
    setFilter((prev) => ({
      ...prev,
      batch: target?.batch || undefined,
      isSuspended: target?.isSuspended || undefined,
    }));
  };

  const handleAddMemberSubmit = async () => {
    const errors = {};
    if (!newMember.fullName.trim()) errors.fullName = "Full Name is required";
    if (!newMember.email.trim()) errors.email = "Email is required";
    if (!newMember.batch.trim()) errors.batch = "Batch is required";
    if (!newMember.admno.trim()) errors.admno = "Admission No is required";
    if (!newMember.password.trim()) errors.password = "Password is required";

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      setAddMemberLoading(true);
      await memberService.addMember(newMember);
      setAlert({ open: true, message: "Member added successfully", severity: "success" });
      setAddMemberOpen(false);
      setNewMember({ fullName: "", email: "", batch: "", admno: "", password: "", course: "B.Tech CSE" });
      refetch();
    } catch (err) {
      setAlert({ open: true, message: err?.message || "Failed to add member", severity: "error" });
    } finally {
      setAddMemberLoading(false);
    }
  };

  return (
    <Box sx={{ width: "100%", typography: "body1", p: 3 }}>
      <TabContext value={tabValue}>
        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
          <TabList onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
            {BATCH_TABS.map((tab) => (
              <Tab key={tab.id} label={tab.label} value={tab.id} />
            ))}
          </TabList>
        </Box>

        <SearchFilterBar
          search={search}
          onSearchChange={setSearch}
          placeholder="Search by name, email, or admission no..."
          loading={loading}
          actionSlot={
            <>
              <Button variant="outlined" startIcon={<RefreshIcon />} onClick={refetch}>
                Refresh
              </Button>
              <Button
                variant="contained"
                startIcon={<PersonAddIcon />}
                onClick={() => setAddMemberOpen(true)}
              >
                Add Member
              </Button>
            </>
          }
        />

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Grid container spacing={3}>
            {Array.from(new Array(limit)).map((_, idx) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={idx}>
                <CardSkeleton height={280} />
              </Grid>
            ))}
          </Grid>
        ) : members.length === 0 ? (
          <Box sx={{ py: 8, textAlign: "center" }}>
            <Typography variant="body1" color="text.secondary">
              No members found matching your search and filter criteria.
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {members.map((member) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={member._id}>
                <MemberCardDashboard member={member} onMemberUpdate={refetch} />
              </Grid>
            ))}
          </Grid>
        )}

        <Box sx={{ mt: 3 }}>
          <DataTablePagination
            page={page}
            limit={limit}
            total={pagination.total}
            pages={pagination.pages}
            onPageChange={setPage}
            onLimitChange={setLimit}
            rowsPerPageOptions={[12, 24, 48, 96]}
            loading={loading}
          />
        </Box>
      </TabContext>

      {/* Add Member Dialog */}
      <Dialog open={addMemberOpen} onClose={() => setAddMemberOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Member</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            margin="dense"
            label="Full Name"
            fullWidth
            value={newMember.fullName}
            onChange={(e) => setNewMember({ ...newMember, fullName: e.target.value })}
            error={Boolean(formErrors.fullName)}
            helperText={formErrors.fullName}
          />
          <TextField
            margin="dense"
            label="Email"
            type="email"
            fullWidth
            value={newMember.email}
            onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
            error={Boolean(formErrors.email)}
            helperText={formErrors.email}
          />
          <TextField
            margin="dense"
            label="Admission No"
            fullWidth
            value={newMember.admno}
            onChange={(e) => setNewMember({ ...newMember, admno: e.target.value.toUpperCase() })}
            error={Boolean(formErrors.admno)}
            helperText={formErrors.admno}
          />
          <FormControl fullWidth margin="dense" error={Boolean(formErrors.batch)}>
            <InputLabel>Batch</InputLabel>
            <Select
              value={newMember.batch}
              label="Batch"
              onChange={(e) => setNewMember({ ...newMember, batch: e.target.value })}
            >
              <MenuItem value="The Uniques 1.0">The Uniques 1.0</MenuItem>
              <MenuItem value="The Uniques 2.0">The Uniques 2.0</MenuItem>
              <MenuItem value="The Uniques 3.0">The Uniques 3.0</MenuItem>
              <MenuItem value="The Uniques 4.0">The Uniques 4.0</MenuItem>
              <MenuItem value="The Uniques 5.0">The Uniques 5.0</MenuItem>
              <MenuItem value="The Uniques 6.0">The Uniques 6.0</MenuItem>
            </Select>
            {formErrors.batch && <FormHelperText>{formErrors.batch}</FormHelperText>}
          </FormControl>
          <TextField
            margin="dense"
            label="Password"
            type="password"
            fullWidth
            value={newMember.password}
            onChange={(e) => setNewMember({ ...newMember, password: e.target.value })}
            error={Boolean(formErrors.password)}
            helperText={formErrors.password}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddMemberOpen(false)}>Cancel</Button>
          <Button onClick={handleAddMemberSubmit} variant="contained" disabled={addMemberLoading}>
            {addMemberLoading ? "Adding..." : "Add Member"}
          </Button>
        </DialogActions>
      </Dialog>

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

export default MembersIndex;
