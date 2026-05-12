import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Card,
  CardContent,
  LinearProgress,
  Tooltip,
  Alert,
  Avatar,
  Input,
} from "@mui/material";
import {
  Add,
  AttachMoney,
  Business,
  Delete,
  Download,
  Edit,
  MoneyOff,
  Receipt,
  Save,
  CheckCircle,
  Cancel,
  PictureAsPdf,
  ArrowBack,
  CloudUpload,
  Visibility,
} from "@mui/icons-material";
import { useParams, useNavigate } from "react-router-dom";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "react-toastify";

// Budget chart component using simple box charts
const BudgetChart = ({ allocations = [], expenses = [], sponsors = [] }) => {
  // Group expenses by category
  const expensesByCategory = {};
  expenses.forEach((expense) => {
    if (expense.paymentStatus === "completed") {
      if (!expensesByCategory[expense.category]) {
        expensesByCategory[expense.category] = 0;
      }
      expensesByCategory[expense.category] += expense.amount;
    }
  });

  // Group sponsors by type
  const sponsorsByType = {};
  sponsors.forEach((sponsor) => {
    if (!sponsorsByType[sponsor.type]) {
      sponsorsByType[sponsor.type] = 0;
    }
    sponsorsByType[sponsor.type] += sponsor.amount;
  });

  // Find max value for scaling
  const allValues = [
    ...allocations.map((a) => a.amount),
    ...Object.values(expensesByCategory),
    ...Object.values(sponsorsByType),
  ];
  const maxValue = Math.max(...allValues, 1);

  // Get all unique categories
  const allCategories = [
    ...new Set([
      ...allocations.map((a) => a.category),
      ...Object.keys(expensesByCategory),
    ]),
  ];

  // Get all unique sponsor types
  const allSponsorTypes = [...new Set(sponsors.map((s) => s.type))];

  return (
    <Box sx={{ mt: 2 }}>
      {/* Budget Allocations vs Expenses */}
      {allCategories.map((category) => {
        const allocation =
          allocations.find((a) => a.category === category)?.amount || 0;
        const spent = expensesByCategory[category] || 0;
        const percentSpent = allocation > 0 ? (spent / allocation) * 100 : 0;

        return (
          <Box key={category} sx={{ mb: 2 }}>
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}
            >
              <Typography variant="body2" sx={{ textTransform: "capitalize" }}>
                {category}
              </Typography>
              <Typography variant="body2">
                ₹{spent.toLocaleString()} / ₹{allocation.toLocaleString()}
              </Typography>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Box sx={{ flexGrow: 1, mr: 1 }}>
                <LinearProgress
                  variant="determinate"
                  value={Math.min(percentSpent, 100)}
                  color={percentSpent > 100 ? "error" : "primary"}
                  sx={{ height: 10, borderRadius: 1 }}
                />
              </Box>
              <Typography
                variant="caption"
                color={percentSpent > 100 ? "error" : "inherit"}
              >
                {percentSpent.toFixed(0)}%
              </Typography>
            </Box>
          </Box>
        );
      })}

      {/* Sponsors by Type */}
      {sponsors.length > 0 && (
        <>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: "bold" }}>
            Sponsorships by Type
          </Typography>
          {allSponsorTypes.map((type) => {
            const typeSponsors = sponsors.filter((s) => s.type === type);
            const typeAmount = typeSponsors.reduce(
              (sum, s) => sum + s.amount,
              0
            );
            const totalSponsorship = sponsors.reduce(
              (sum, s) => sum + s.amount,
              0
            );
            const percentage = (typeAmount / totalSponsorship) * 100;

            return (
              <Box key={type} sx={{ mb: 2 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 0.5,
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{ textTransform: "capitalize" }}
                  >
                    {type}
                  </Typography>
                  <Typography variant="body2">
                    ₹{typeAmount.toLocaleString()}({typeSponsors.length} sponsor
                    {typeSponsors.length !== 1 ? "s" : ""})
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Box sx={{ flexGrow: 1, mr: 1 }}>
                    <LinearProgress
                      variant="determinate"
                      value={percentage}
                      color={
                        type === "cash"
                          ? "success"
                          : type === "in-kind"
                          ? "info"
                          : "secondary"
                      }
                      sx={{ height: 10, borderRadius: 1 }}
                    />
                  </Box>
                  <Typography variant="caption">
                    {percentage.toFixed(0)}%
                  </Typography>
                </Box>
              </Box>
            );
          })}
        </>
      )}
    </Box>
  );
};
// Event Budget Management component
const EventBudget = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const reportRef = useRef(null);
  const fileInputRef = useRef(null);
  const sponsorFileInputRef = useRef(null);

  // Add user role state
  const [userRole, setUserRole] = useState(null);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [budget, setBudget] = useState({
    totalAllocated: 0,
    totalSpent: 0,
    remaining: 0,
    currency: "INR",
    status: "active",
  });
  const [sponsors, setSponsors] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const [uploadingReceipt, setUploadingReceipt] = useState(false);
  const [currentItemForReceipt, setCurrentItemForReceipt] = useState(null);

  // Dialog states
  const [budgetDialog, setBudgetDialog] = useState(false);
  const [sponsorDialog, setSponsorDialog] = useState(false);
  const [expenseDialog, setExpenseDialog] = useState(false);
  const [allocationDialog, setAllocationDialog] = useState(false);
  const [receiptDialog, setReceiptDialog] = useState(false);
  const [viewReceiptDialog, setViewReceiptDialog] = useState(false);
  const [viewingReceiptUrl, setViewingReceiptUrl] = useState("");
  console.log("viewingReceiptUrl", viewingReceiptUrl);

  // Form states
  const [newBudget, setNewBudget] = useState({
    totalAllocated: 0,
    currency: "INR",
    note: "",
  });
  const [newSponsor, setNewSponsor] = useState({
    name: "",
    amount: 0,
    type: "cash",
    contactPerson: "",
    contactEmail: "",
    contactPhone: "",
    notes: "",
    logoUrl: "",
  });
  const [newExpense, setNewExpense] = useState({
    category: "",
    title: "",
    amount: 0,
    vendor: "",
    paymentMethod: "cash",
    paymentStatus: "pending",
    paidBy: "",
    notes: "",
  });
  const [newAllocation, setNewAllocation] = useState({
    category: "",
    amount: 0,
    notes: "",
  });

  // For report generation
  const [generatingReport, setGeneratingReport] = useState(false);
  const fetchUserRole = () => {
    try {
      const user = JSON.parse(localStorage.getItem("user")) || {};
      setUserRole(user.role || "coordinator");
    } catch (error) {
      console.error("Error determining user role:", error);
      setUserRole("coordinator");
    }
  };

  const isAdmin = () => userRole === "admin";

  useEffect(() => {
    fetchUserRole();
    fetchEvent();
    fetchBudgetData();
  }, [id]);

  // Upload receipt for expense or sponsor
  const handleUploadReceipt = async (itemId, itemType) => {
    setCurrentItemForReceipt({ id: itemId, type: itemType });
    setReceiptDialog(true);
    console.log("Uploading receipt for", itemId, itemType);
  };

  // Submit the receipt file
  const handleSubmitReceipt = async (e) => {
    e.preventDefault();

    if (!currentItemForReceipt) return;

    const fileInput =
      currentItemForReceipt.type === "expense"
        ? fileInputRef.current
        : sponsorFileInputRef.current;
    const file = fileInput.files[0];

    if (!file) {
      toast.error("Please select a file to upload");
      return;
    }

    setUploadingReceipt(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("eventId", id);
      formData.append("itemType", currentItemForReceipt.type);
      formData.append("itemId", currentItemForReceipt.id);

      const response = await fetch(
        "http://localhost:5000/upload/budget_file_upload",
        {
          method: "POST",
          credentials: "include",
          body: formData,
        }
      );

      const data = await response.json();

      if (response.ok) {
        toast.success(`Receipt uploaded successfully`);
        setReceiptDialog(false);
        fetchBudgetData(); // Refresh data
      } else {
        toast.error(data.message || "Failed to upload receipt");
      }
    } catch (error) {
      console.error("Error uploading receipt:", error);
      toast.error("An error occurred while uploading the receipt");
    } finally {
      setUploadingReceipt(false);
    }
  };

  // View receipt
  const handleViewReceipt = async (fileUrl) => {
    setViewingReceiptUrl(fileUrl);
    setViewReceiptDialog(true);
  };

  const handleDeleteExpense = async (expenseId) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/events/${id}/expenses/${expenseId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (data.success) {
        setExpenses(data.expenses);
        setBudget(data.budget);
        toast.success("Expense deleted successfully");
      } else {
        toast.error(data.message || "Failed to delete expense");
      }
    } catch (error) {
      console.error("Error deleting expense:", error);
      toast.error("An error occurred while deleting the expense");
    }
  };

  // Delete allocation - admin only
  const handleDeleteAllocation = async (allocationId) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/events/${id}/budget-allocations/${allocationId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (data.success) {
        setAllocations(data.allocations);
        toast.success("Budget allocation deleted successfully");
      } else {
        toast.error(data.message || "Failed to delete allocation");
      }
    } catch (error) {
      console.error("Error deleting allocation:", error);
      toast.error("An error occurred while deleting the allocation");
    }
  };

  // Add allocation - admin only
  const handleAddAllocation = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/events/${id}/budget-allocations`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(newAllocation),
        }
      );

      const data = await response.json();

      if (data.success) {
        setAllocations(data.allocations);
        setAllocationDialog(false);
        // Reset form
        setNewAllocation({
          category: "",
          amount: 0,
          notes: "",
        });
        toast.success("Budget allocation added successfully");
      } else {
        toast.error(data.message || "Failed to add allocation");
      }
    } catch (error) {
      console.error("Error adding allocation:", error);
      toast.error("An error occurred while adding the allocation");
    }
  };

  // Fetch event data
  const fetchEvent = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/events/${id}`, {
        credentials: "include",
      });
      const data = await response.json();

      if (data.success) {
        setEvent(data.event);
      } else {
        console.error("Error fetching event:", data.message);
      }
    } catch (error) {
      console.error("Error fetching event:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch budget data
  const fetchBudgetData = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:5000/api/events/${id}/budget`,
        {
          credentials: "include",
        }
      );
      const data = await response.json();

      if (data.success) {
        setBudget(
          data.budget || {
            totalAllocated: 0,
            totalSpent: 0,
            remaining: 0,
            currency: "INR",
            status: "pending",
          }
        );
        setSponsors(data.sponsors || []);
        setExpenses(data.expenses || []);
        setAllocations(data.budgetAllocations || []);

        // Calculate actual budget with sponsorships included
        const totalSponsorship = (data.sponsors || [])
          .filter((sponsor) => sponsor.receivedStatus === "received")
          .reduce((sum, sponsor) => sum + sponsor.amount, 0);

        const totalAllocated = data.budget?.totalAllocated || 0;
        const totalSpent = data.budget?.totalSpent || 0;

        // Update budget with sponsorship
        setBudget((prev) => ({
          ...prev,
          totalWithSponsorships: totalAllocated + totalSponsorship,
          remaining: totalAllocated + totalSponsorship - totalSpent,
        }));
      } else {
        console.error("Error fetching budget data:", data.message);
      }
    } catch (error) {
      console.error("Error fetching budget data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Update budget
  const handleUpdateBudget = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/events/${id}/budget`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(newBudget),
        }
      );

      const data = await response.json();

      if (data.success) {
        setBudget(data.budget);
        setBudgetDialog(false);
        // Reset form
        setNewBudget({
          totalAllocated: 0,
          currency: "INR",
          note: "",
        });

        // Refresh budget data to include sponsorships
        fetchBudgetData();
      } else {
        console.error("Error updating budget:", data.message);
      }
    } catch (error) {
      console.error("Error updating budget:", error);
    }
  };

  // Add sponsor
  const handleAddSponsor = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/events/${id}/sponsors`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(newSponsor),
        }
      );

      const data = await response.json();

      if (data.success) {
        setSponsors(data.sponsors);
        setSponsorDialog(false);
        // Update budget after adding sponsor
        fetchBudgetData();
        // Reset form
        setNewSponsor({
          name: "",
          amount: 0,
          type: "cash",
          contactPerson: "",
          contactEmail: "",
          contactPhone: "",
          notes: "",
        });
      } else {
        console.error("Error adding sponsor:", data.message);
      }
    } catch (error) {
      console.error("Error adding sponsor:", error);
    }
  };

  const handleDeleteSponsor = async (sponsorId) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/events/${id}/sponsors/${sponsorId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (data.success) {
        // Update sponsors list
        setSponsors(data.sponsors);

        // Update budget since deleting a sponsor affects the budget
        if (data.budget) {
          setBudget(data.budget);
        } else {
          // Fallback: Refresh budget data if budget not returned
          fetchBudgetData();
        }

        toast.success("Sponsor deleted successfully");
      } else {
        toast.error(data.message || "Failed to delete sponsor");
      }
    } catch (error) {
      console.error("Error deleting sponsor:", error);
      toast.error("An error occurred while deleting the sponsor");
    }
  };

  // Add expense
  const handleAddExpense = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/events/${id}/expenses`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(newExpense),
        }
      );

      const data = await response.json();

      if (data.success) {
        setExpenses(data.expenses);
        setExpenseDialog(false);
        // Update budget after adding expense
        setBudget(data.budget);
        // Refresh to update calculations
        fetchBudgetData();
        // Reset form
        setNewExpense({
          category: "",
          title: "",
          amount: 0,
          vendor: "",
          paymentMethod: "cash",
          paymentStatus: "pending",
          paidBy: "",
          notes: "",
        });
      } else {
        console.error("Error adding expense:", data.message);
      }
    } catch (error) {
      console.error("Error adding expense:", error);
    }
  };

  // Update expense status
  const handleUpdateExpenseStatus = async (expenseId, newStatus) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/events/${id}/expenses/${expenseId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            paymentStatus: newStatus,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setExpenses(data.expenses);
        setBudget(data.budget);
        fetchBudgetData();
      } else {
        console.error("Error updating expense status:", data.message);
      }
    } catch (error) {
      console.error("Error updating expense status:", error);
    }
  };

  // Replace only the parts where you call autoTable
  const generateReport = async () => {
    setGeneratingReport(true);

    try {
      // Create new PDF document
      const doc = new jsPDF();
      const eventName = event?.eventName || "Event";

      // Add title and date (unchanged)
      doc.setFontSize(20);
      doc.setTextColor(40);
      doc.text(`Budget Report: ${eventName}`, 20, 20);

      doc.setFontSize(12);
      doc.setTextColor(100);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, 30);

      // Budget summary
      doc.setFontSize(16);
      doc.setTextColor(40);
      doc.text("Budget Summary", 20, 45);

      // Calculate total received sponsors
      const totalReceivedSponsorship = sponsors
        .filter((sponsor) => sponsor.receivedStatus === "received")
        .reduce((sum, sponsor) => sum + sponsor.amount, 0);

      const totalPendingSponsorship = sponsors
        .filter((sponsor) => sponsor.receivedStatus === "pending")
        .reduce((sum, sponsor) => sum + sponsor.amount, 0);

      // USE THE IMPORTED AUTOTABLE FUNCTION INSTEAD
      autoTable(doc, {
        startY: 50,
        head: [["Item", "Amount (₹)"]],
        body: [
          ["Total Budget Allocation", budget.totalAllocated.toLocaleString()],
          [
            "Total Received Sponsorships",
            totalReceivedSponsorship.toLocaleString(),
          ],
          [
            "Total Available Budget",
            (budget.totalAllocated + totalReceivedSponsorship).toLocaleString(),
          ],
          ["Total Spent", budget.totalSpent.toLocaleString()],
          ["Remaining", budget.remaining.toLocaleString()],
          ["Pending Sponsorships", totalPendingSponsorship.toLocaleString()],
        ],
        theme: "grid",
      });

      // Continue the same pattern for all other tables
      // For example:
      doc.setFontSize(16);
      doc.setTextColor(40);
      const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY : 50;
      doc.text("Sponsors", 20, finalY + 15);

      if (sponsors.length > 0) {
        autoTable(doc, {
          startY: finalY + 20,
          head: [
            [
              "Name",
              "Type",
              "Amount (₹)",
              "Status",
              "Contact Person",
              "Contact",
            ],
          ],
          body: sponsors.map((sponsor) => [
            sponsor.name,
            sponsor.type,
            sponsor.amount.toLocaleString(),
            sponsor.receivedStatus || "pending",
            sponsor.contactPerson || "-",
            sponsor.contactEmail || sponsor.contactPhone || "-",
          ]),
          theme: "grid",
        });
      }

      // Do the same for the remaining tables (expenses, allocations)
      // Remember to use autoTable(doc, {...}) for all tables

      // Save the document (unchanged)
      doc.save(
        `${eventName.replace(/\s+/g, "-").toLowerCase()}-budget-report.pdf`
      );
      toast.success("Budget report generated successfully");
    } catch (error) {
      console.error("Error generating report:", error);
      toast.error("Failed to generate report");
    } finally {
      setGeneratingReport(false);
    }
  };
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString();
  };

  // Calculate total sponsors amount by type
  const getSponsorTotalByType = (type) => {
    return sponsors
      .filter((sponsor) => sponsor.type === type)
      .reduce((sum, sponsor) => sum + sponsor.amount, 0);
  };

  // Calculate received sponsorships amount
  const getReceivedSponsorshipsTotal = () => {
    return sponsors
      .filter((sponsor) => sponsor.receivedStatus === "received")
      .reduce((sum, sponsor) => sum + sponsor.amount, 0);
  };

  // Calculate expenses by category
  const getExpensesByCategory = (category) => {
    return expenses
      .filter(
        (expense) =>
          expense.category === category && expense.paymentStatus === "completed"
      )
      .reduce((sum, expense) => sum + expense.amount, 0);
  };

  // Get allocation for category
  const getAllocationForCategory = (category) => {
    const allocation = allocations.find((a) => a.category === category);
    return allocation ? allocation.amount : 0;
  };

  // Calculate total available budget with sponsorships
  const getTotalAvailableBudget = () => {
    const allocatedBudget = budget.totalAllocated || 0;
    const receivedSponsorships = getReceivedSponsorshipsTotal();
    return allocatedBudget + receivedSponsorships;
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "80vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!event) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" color="error">
          Event not found
        </Typography>
        <Button
          variant="contained"
          sx={{ mt: 2 }}
          onClick={() => navigate(-1)}
        >
          Back to Events
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }} ref={reportRef}>
      {/* Header with actions */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Box>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate(-1)}
            sx={{ mb: 1 }}
          >
            Back to Event
          </Button>
          <Typography variant="h4" sx={{ fontWeight: "bold" }}>
            Budget Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {event.eventName}
          </Typography>
          {/* Display current user role */}
          <Typography variant="caption" color="text.secondary">
            {userRole === "admin"
              ? "Administrator Access"
              : "Coordinator Access"}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<PictureAsPdf />}
            onClick={generateReport}
            disabled={generatingReport}
          >
            {generatingReport ? "Generating..." : "Generate Report"}
          </Button>
          {/* Only admin can update total budget */}

          <Button
            variant="contained"
            startIcon={<AttachMoney />}
            onClick={() => setBudgetDialog(true)}
          >
            Update Budget
          </Button>
        </Box>
      </Box>

      {/* Budget summary cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 2, height: "100%" }}>
            <CardContent>
              <Typography
                sx={{ fontSize: 14 }}
                color="text.secondary"
                gutterBottom
              >
                Total Available Budget
              </Typography>
              <Typography
                variant="h5"
                component="div"
                sx={{ fontWeight: "bold" }}
              >
                ₹{budget.totalAllocated.toLocaleString()}
                {getReceivedSponsorshipsTotal() > 0 && (
                  <Typography variant="body2" color="primary" sx={{ mt: 0.5 }}>
                    + ₹{getReceivedSponsorshipsTotal().toLocaleString()}{" "}
                    (sponsorships)
                  </Typography>
                )}
              </Typography>
              <Typography
                variant="h3"
                component="div"
                sx={{ fontWeight: "bold", mt: 1 }}
              >
                ₹{getTotalAvailableBudget().toLocaleString()}
              </Typography>
              <Box sx={{ mt: 1, display: "flex", alignItems: "center" }}>
                <Chip
                  label={budget.status}
                  color={budget.status === "active" ? "success" : "default"}
                  size="small"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 2, height: "100%" }}>
            <CardContent>
              <Typography
                sx={{ fontSize: 14 }}
                color="text.secondary"
                gutterBottom
              >
                Total Spent
              </Typography>
              <Typography
                variant="h3"
                component="div"
                sx={{ fontWeight: "bold" }}
              >
                ₹{budget.totalSpent.toLocaleString()}
              </Typography>
              <Box sx={{ mt: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  {Math.round(
                    (budget.totalSpent / getTotalAvailableBudget()) * 100
                  ) || 0}
                  % of budget used
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={
                    Math.min(
                      (budget.totalSpent / getTotalAvailableBudget()) * 100,
                      100
                    ) || 0
                  }
                  sx={{ mt: 1, height: 8, borderRadius: 1 }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card
            sx={{
              borderRadius: 2,
              height: "100%",
              bgcolor:
                getTotalAvailableBudget() - budget.totalSpent >= 0
                  ? "background.paper"
                  : "#fff1f0",
            }}
          >
            <CardContent>
              <Typography
                sx={{ fontSize: 14 }}
                color="text.secondary"
                gutterBottom
              >
                Remaining Budget
              </Typography>
              <Typography
                variant="h3"
                component="div"
                sx={{
                  fontWeight: "bold",
                  color:
                    getTotalAvailableBudget() - budget.totalSpent < 0
                      ? "error.main"
                      : "inherit",
                }}
              >
                ₹
                {(
                  getTotalAvailableBudget() - budget.totalSpent
                ).toLocaleString()}
              </Typography>
              {getTotalAvailableBudget() - budget.totalSpent < 0 ? (
                <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                  Budget exceeded by{" "}
                  {Math.abs(
                    getTotalAvailableBudget() - budget.totalSpent
                  ).toLocaleString()}
                </Typography>
              ) : (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1 }}
                >
                  {Math.round(
                    ((getTotalAvailableBudget() - budget.totalSpent) /
                      getTotalAvailableBudget()) *
                      100
                  ) || 0}
                  % of budget remaining
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Budget tabs */}
      <Paper sx={{ borderRadius: 2, mb: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="budget tabs"
          >
            <Tab label="Overview" />
            <Tab label="Sponsors" />
            <Tab label="Expenses" />
            <Tab label="Allocations" />
          </Tabs>
        </Box>

        {/* Overview Tab */}
        {tabValue === 0 && (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Budget Overview
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography
                  variant="subtitle1"
                  sx={{ mb: 2, fontWeight: "medium" }}
                >
                  Budget Utilization by Category
                </Typography>
                <BudgetChart
                  allocations={allocations}
                  expenses={expenses}
                  sponsors={sponsors}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography
                  variant="subtitle1"
                  sx={{ mb: 2, fontWeight: "medium" }}
                >
                  Summary
                </Typography>

                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Item</TableCell>
                        <TableCell align="right">Amount (₹)</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell>Budget Allocation</TableCell>
                        <TableCell align="right">
                          {budget.totalAllocated.toLocaleString()}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Total Sponsorships</TableCell>
                        <TableCell align="right">
                          {sponsors
                            .reduce((sum, sponsor) => sum + sponsor.amount, 0)
                            .toLocaleString()}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Received Sponsorships</TableCell>
                        <TableCell align="right">
                          {getReceivedSponsorshipsTotal().toLocaleString()}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Cash Sponsorships</TableCell>
                        <TableCell align="right">
                          {getSponsorTotalByType("cash").toLocaleString()}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>In-kind Sponsorships</TableCell>
                        <TableCell align="right">
                          {getSponsorTotalByType("in-kind").toLocaleString()}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Service Sponsorships</TableCell>
                        <TableCell align="right">
                          {getSponsorTotalByType("services").toLocaleString()}
                        </TableCell>
                      </TableRow>
                      <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                        <TableCell>
                          <strong>Total Available Budget</strong>
                        </TableCell>
                        <TableCell align="right">
                          <strong>
                            {getTotalAvailableBudget().toLocaleString()}
                          </strong>
                        </TableCell>
                      </TableRow>
                      <TableRow sx={{ backgroundColor: "#f8f9fa" }}>
                        <TableCell>
                          <strong>Total Expenses</strong>
                        </TableCell>
                        <TableCell align="right">
                          <strong>{budget.totalSpent.toLocaleString()}</strong>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Pending Expenses</TableCell>
                        <TableCell align="right">
                          {expenses
                            .filter(
                              (expense) => expense.paymentStatus === "pending"
                            )
                            .reduce((sum, expense) => sum + expense.amount, 0)
                            .toLocaleString()}
                        </TableCell>
                      </TableRow>
                      <TableRow
                        sx={{
                          backgroundColor:
                            getTotalAvailableBudget() - budget.totalSpent >= 0
                              ? "#f6ffed"
                              : "#fff1f0",
                        }}
                      >
                        <TableCell>
                          <strong>Remaining Budget</strong>
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{
                            color:
                              getTotalAvailableBudget() - budget.totalSpent < 0
                                ? "error.main"
                                : "success.main",
                            fontWeight: "bold",
                          }}
                        >
                          <strong>
                            {(
                              getTotalAvailableBudget() - budget.totalSpent
                            ).toLocaleString()}
                          </strong>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Sponsors Tab */}

        {tabValue === 1 && (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Sponsors
            </Typography>

            <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setSponsorDialog(true)}
              >
                Add Sponsor
              </Button>
            </Box>

            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell align="right">Amount (₹)</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Contact Person</TableCell>
                    <TableCell>Contact</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sponsors.map((sponsor) => (
                    <TableRow key={sponsor._id}>
                      <TableCell>{sponsor.name}</TableCell>
                      <TableCell>{sponsor.type}</TableCell>
                      <TableCell align="right">
                        {sponsor.amount.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={sponsor.receivedStatus || "pending"}
                          color={
                            sponsor.receivedStatus === "received"
                              ? "success"
                              : "warning"
                          }
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{sponsor.contactPerson}</TableCell>
                      <TableCell>
                        {sponsor.contactEmail || sponsor.contactPhone}
                      </TableCell>
                      <TableCell>
                        {sponsor.receivedStatus === "pending" && (
                          <Tooltip title="Upload Receipt">
                            <IconButton
                              size="small"
                              onClick={() =>
                                handleUploadReceipt(sponsor._id, "sponsor")
                              }
                            >
                              <CloudUpload />
                            </IconButton>
                          </Tooltip>
                        )}
                        {sponsor.receiptId && (
                          <Tooltip title="View Receipt">
                            <IconButton
                              size="small"
                              onClick={() =>
                                handleViewReceipt(sponsor.receiptId.fileId)
                              }
                            >
                              <Visibility />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteSponsor(sponsor._id)}
                          >
                            <Delete />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {/* Expenses Tab */}

        {tabValue === 2 && (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Expenses
            </Typography>

            <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setExpenseDialog(true)}
              >
                Add Expense
              </Button>
            </Box>

            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Title</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell align="right">Amount (₹)</TableCell>
                    <TableCell>Vendor</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Paid By</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {expenses.map((expense) => (
                    <TableRow key={expense._id}>
                      <TableCell>{expense.title}</TableCell>
                      <TableCell>{expense.category}</TableCell>
                      <TableCell align="right">
                        {expense.amount.toLocaleString()}
                      </TableCell>
                      <TableCell>{expense.vendor}</TableCell>
                      <TableCell>
                        <Chip
                          label={expense.paymentStatus}
                          color={
                            expense.paymentStatus === "completed"
                              ? "success"
                              : expense.paymentStatus === "pending"
                              ? "warning"
                              : "default"
                          }
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{expense.paidBy}</TableCell>
                      <TableCell>
                        {expense.paymentStatus === "pending" && (
                          <Tooltip title="Upload Receipt">
                            <IconButton
                              size="small"
                              onClick={() =>
                                handleUploadReceipt(expense._id, "expense")
                              }
                            >
                              <CloudUpload />
                            </IconButton>
                          </Tooltip>
                        )}
                        {expense.receiptId && (
                          <Tooltip title="View Receipt">
                            <IconButton
                              size="small"
                              onClick={() =>
                                handleViewReceipt(expense.receiptId.fileId)
                              }
                            >
                              <Visibility />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteExpense(expense._id)}
                          >
                            <Delete />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {/* Allocations Tab */}

        {tabValue === 3 && (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Budget Allocations
            </Typography>

            <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setAllocationDialog(true)}
              >
                Add Allocation
              </Button>
            </Box>

            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Category</TableCell>
                    <TableCell align="right">Amount (₹)</TableCell>
                    <TableCell>Notes</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {allocations.map((allocation) => (
                    <TableRow key={allocation._id}>
                      <TableCell>{allocation.category}</TableCell>
                      <TableCell align="right">
                        {allocation.amount.toLocaleString()}
                      </TableCell>
                      <TableCell>{allocation.notes}</TableCell>
                      <TableCell>
                        <Tooltip title="Edit">
                          <IconButton size="small">
                            <Edit />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            onClick={() =>
                              handleDeleteAllocation(allocation._id)
                            }
                          >
                            <Delete />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
      </Paper>

      {/* Budget Dialog */}
      <Dialog open={budgetDialog} onClose={() => setBudgetDialog(false)}>
        <DialogTitle>Update Budget</DialogTitle>
        <DialogContent sx={{ minWidth: 400 }}>
          <TextField
            label="Total Budget Amount"
            type="number"
            fullWidth
            margin="normal"
            value={newBudget.totalAllocated}
            onChange={(e) =>
              setNewBudget({
                ...newBudget,
                totalAllocated: parseFloat(e.target.value) || 0,
              })
            }
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Currency</InputLabel>
            <Select
              value={newBudget.currency}
              onChange={(e) =>
                setNewBudget({ ...newBudget, currency: e.target.value })
              }
            >
              <MenuItem value="INR">INR</MenuItem>
              <MenuItem value="USD">USD</MenuItem>
              <MenuItem value="EUR">EUR</MenuItem>
              <MenuItem value="GBP">GBP</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="Notes"
            multiline
            rows={3}
            fullWidth
            margin="normal"
            value={newBudget.note}
            onChange={(e) =>
              setNewBudget({ ...newBudget, note: e.target.value })
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBudgetDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleUpdateBudget}
            startIcon={<Save />}
          >
            Update Budget
          </Button>
        </DialogActions>
      </Dialog>

      {/* Sponsor Dialog */}
      <Dialog open={sponsorDialog} onClose={() => setSponsorDialog(false)}>
        <DialogTitle>Add Sponsor</DialogTitle>
        <DialogContent sx={{ minWidth: 400 }}>
          <TextField
            label="Sponsor Name"
            fullWidth
            margin="normal"
            value={newSponsor.name}
            onChange={(e) =>
              setNewSponsor({ ...newSponsor, name: e.target.value })
            }
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Sponsorship Type</InputLabel>
            <Select
              value={newSponsor.type}
              onChange={(e) =>
                setNewSponsor({ ...newSponsor, type: e.target.value })
              }
            >
              <MenuItem value="cash">Cash</MenuItem>
              <MenuItem value="in-kind">In-kind</MenuItem>
              <MenuItem value="services">Services</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="Amount"
            type="number"
            fullWidth
            margin="normal"
            value={newSponsor.amount}
            onChange={(e) =>
              setNewSponsor({
                ...newSponsor,
                amount: parseFloat(e.target.value) || 0,
              })
            }
          />
          <TextField
            label="Contact Person"
            fullWidth
            margin="normal"
            value={newSponsor.contactPerson}
            onChange={(e) =>
              setNewSponsor({ ...newSponsor, contactPerson: e.target.value })
            }
          />
          <TextField
            label="Logo Url"
            fullWidth
            margin="normal"
            value={newSponsor.logoUrl}
            onChange={(e) =>
              setNewSponsor({ ...newSponsor, logoUrl: e.target.value })
            }
          />
          <TextField
            label="Email"
            fullWidth
            margin="normal"
            value={newSponsor.contactEmail}
            onChange={(e) =>
              setNewSponsor({ ...newSponsor, contactEmail: e.target.value })
            }
          />
          <TextField
            label="Phone"
            fullWidth
            margin="normal"
            value={newSponsor.contactPhone}
            onChange={(e) =>
              setNewSponsor({ ...newSponsor, contactPhone: e.target.value })
            }
          />
          <TextField
            label="Notes"
            multiline
            rows={3}
            fullWidth
            margin="normal"
            value={newSponsor.notes}
            onChange={(e) =>
              setNewSponsor({ ...newSponsor, notes: e.target.value })
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSponsorDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleAddSponsor}
            startIcon={<Save />}
          >
            Add Sponsor
          </Button>
        </DialogActions>
      </Dialog>

      {/* Expense Dialog */}
      <Dialog open={expenseDialog} onClose={() => setExpenseDialog(false)}>
        <DialogTitle>Add Expense</DialogTitle>
        <DialogContent sx={{ minWidth: 400 }}>
          <TextField
            label="Title"
            fullWidth
            margin="normal"
            value={newExpense.title}
            onChange={(e) =>
              setNewExpense({ ...newExpense, title: e.target.value })
            }
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Category</InputLabel>
            <Select
              value={newExpense.category}
              onChange={(e) =>
                setNewExpense({ ...newExpense, category: e.target.value })
              }
            >
              {allocations.map((allocation) => (
                <MenuItem key={allocation._id} value={allocation.category}>
                  {allocation.category}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Amount"
            type="number"
            fullWidth
            margin="normal"
            value={newExpense.amount}
            onChange={(e) =>
              setNewExpense({
                ...newExpense,
                amount: parseFloat(e.target.value) || 0,
              })
            }
          />
          <TextField
            label="Vendor"
            fullWidth
            margin="normal"
            value={newExpense.vendor}
            onChange={(e) =>
              setNewExpense({ ...newExpense, vendor: e.target.value })
            }
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Payment Method</InputLabel>
            <Select
              value={newExpense.paymentMethod}
              onChange={(e) =>
                setNewExpense({ ...newExpense, paymentMethod: e.target.value })
              }
            >
              <MenuItem value="cash">Cash</MenuItem>
              <MenuItem value="card">Card</MenuItem>
              <MenuItem value="bank">Bank Transfer</MenuItem>
              <MenuItem value="upi">UPI</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="Paid By"
            fullWidth
            margin="normal"
            value={newExpense.paidBy}
            onChange={(e) =>
              setNewExpense({ ...newExpense, paidBy: e.target.value })
            }
          />
          <TextField
            label="Notes"
            multiline
            rows={3}
            fullWidth
            margin="normal"
            value={newExpense.notes}
            onChange={(e) =>
              setNewExpense({ ...newExpense, notes: e.target.value })
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExpenseDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleAddExpense}
            startIcon={<Save />}
          >
            Add Expense
          </Button>
        </DialogActions>
      </Dialog>

      {/* Allocation Dialog */}
      <Dialog
        open={allocationDialog}
        onClose={() => setAllocationDialog(false)}
      >
        <DialogTitle>Add Budget Allocation</DialogTitle>
        <DialogContent sx={{ minWidth: 400 }}>
          <TextField
            label="Category"
            fullWidth
            margin="normal"
            value={newAllocation.category}
            onChange={(e) =>
              setNewAllocation({ ...newAllocation, category: e.target.value })
            }
          />
          <TextField
            label="Amount"
            type="number"
            fullWidth
            margin="normal"
            value={newAllocation.amount}
            onChange={(e) =>
              setNewAllocation({
                ...newAllocation,
                amount: parseFloat(e.target.value),
              })
            }
          />
          <TextField
            label="Notes"
            multiline
            rows={3}
            fullWidth
            margin="normal"
            value={newAllocation.notes}
            onChange={(e) =>
              setNewAllocation({ ...newAllocation, notes: e.target.value })
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAllocationDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleAddAllocation}
            startIcon={<Save />}
          >
            Add Allocation
          </Button>
        </DialogActions>
      </Dialog>

      {/* Receipt Upload Dialog */}
      <Dialog open={receiptDialog} onClose={() => setReceiptDialog(false)}>
        <DialogTitle>Upload Receipt</DialogTitle>
        <DialogContent sx={{ minWidth: 400 }}>
          <Box sx={{ p: 2 }}>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Please upload a receipt document for this{" "}
              {currentItemForReceipt?.type}
            </Typography>
            <input
              type="file"
              accept="image/*,application/pdf"
              ref={
                currentItemForReceipt?.type === "expense"
                  ? fileInputRef
                  : sponsorFileInputRef
              }
              style={{ display: "block", marginTop: "10px" }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReceiptDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSubmitReceipt}
            startIcon={<CloudUpload />}
            disabled={uploadingReceipt}
          >
            {uploadingReceipt ? "Uploading..." : "Upload Receipt"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Receipt Dialog */}
      <Dialog
        open={viewReceiptDialog}
        onClose={() => setViewReceiptDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Receipt Document</DialogTitle>
        <DialogContent>
          {viewingReceiptUrl && (
            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <iframe
                src={`https://drive.google.com/file/d/${viewingReceiptUrl}/preview`}
                style={{ width: "100%", height: "500px" }}
                alt="Receipt"
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewReceiptDialog(false)}>Close</Button>
          <Button
            variant="contained"
            startIcon={<Download />}
            onClick={() => window.open(viewingReceiptUrl, "_blank")}
          >
            Download
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EventBudget;
