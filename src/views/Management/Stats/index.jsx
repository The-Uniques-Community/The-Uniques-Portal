/**
 * @file index.jsx
 * @description Public landing page impact metrics configuration console (revenue generated, partners, projects delivered, community events).
 * @architecture Routed via `/admin/stats` or `/coordinator/stats`. Reads and updates `@/utils/stats/statsData` (`getStoredStats`, `fetchStats`, `saveStoredStats`, `resetStoredStats`). Dispatches and listens for the `stats-updated` custom window event.
 * @agent_note Numerical metrics updated here directly power the animated counter numbers on the public landing page "Our Achievements - Making an Impact" section.
 */

import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Card,
  CardContent,
  Snackbar,
  Alert,
  Divider,
  useTheme,
  InputAdornment,
  CircularProgress,
} from "@mui/material";
import BarChart from '@mui/icons-material/BarChart';
import People from '@mui/icons-material/People';
import Lightbulb from '@mui/icons-material/Lightbulb';
import EventNote from '@mui/icons-material/EventNote';
import Save from '@mui/icons-material/Save';
import RestartAlt from '@mui/icons-material/RestartAlt';
import RefreshIcon from '@mui/icons-material/Refresh';
import {
  getStoredStats,
  fetchStats,
  saveStoredStats,
  resetStoredStats,
  DEFAULT_STATS,
} from "@/utils/stats/statsData";

/**
 * @component StatsManagement
 * @description Administrative metrics console with live preview cards and an edit form to synchronize organizational KPI figures with the public portal.
 * @state {Object} stats - Numerical metrics `{ Earnings, Clients, Projects, Events }`.
 * @state {boolean} loading - Loading indicator for fetching fresh metrics.
 * @state {boolean} saving - Spinner state during metrics persistence.
 * @state {Object} snackbar - Notification feedback state `{ open, message, severity }`.
 * @api `fetchStats` - Fetches live impact numbers from backend.
 * @api `saveStoredStats` - Persists updated metrics to backend and local storage.
 * @api `resetStoredStats` - Reverts metrics back to default baseline values.
 */
const StatsManagement = () => {
  const theme = useTheme();
  const [stats, setStats] = useState(() => getStoredStats());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const loadLatestStats = async () => {
    setLoading(true);
    try {
      const cached = getStoredStats();
      if (cached) setStats(cached);
      const fresh = await fetchStats();
      if (fresh) setStats(fresh);
    } catch (err) {
      console.error("Error loading stats:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLatestStats();

    const handleUpdate = (e) => {
      if (e.detail) setStats(e.detail);
    };
    window.addEventListener("stats-updated", handleUpdate);
    return () => window.removeEventListener("stats-updated", handleUpdate);
  }, []);

  const handleInputChange = (field) => (e) => {
    const val = e.target.value;
    // Allow empty string while typing, else convert to number
    setStats((prev) => ({
      ...prev,
      [field]: val === "" ? "" : Number(val),
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await saveStoredStats({
        Earnings: Number(stats.Earnings) || 0,
        Clients: Number(stats.Clients) || 0,
        Projects: Number(stats.Projects) || 0,
        Events: Number(stats.Events) || 0,
      });
      setStats(updated);
      setSnackbar({
        open: true,
        message: "Metrics updated successfully! Landing page reflects changes immediately.",
        severity: "success",
      });
    } catch (err) {
      console.error("Error saving stats:", err);
      setSnackbar({
        open: true,
        message: "Failed to save stats to server.",
        severity: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    setSaving(true);
    try {
      const def = await resetStoredStats();
      setStats(def);
      setSnackbar({
        open: true,
        message: "Stats reset to default values and synced with landing page.",
        severity: "info",
      });
    } catch (err) {
      console.error("Error resetting stats:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1200, mx: "auto" }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: "bold", mb: 1, color: "#ca0019" }}>
            Stats & Impact Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Coordinator login karke jo bhi metrics update karega wo direct landing page ke "Our Achievements - Making an Impact" section par reflect hoga.
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={loading ? <CircularProgress size={16} /> : <RefreshIcon />}
          onClick={loadLatestStats}
          disabled={loading}
          sx={{ color: "#ca0019", borderColor: "#ca0019", "&:hover": { bgcolor: "#ffebee", borderColor: "#ca0019" } }}
        >
          Refresh Stats
        </Button>
      </Box>

      {/* Live Preview Cards Section */}
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
        Live Preview (Landing Page View)
      </Typography>
      <Grid container spacing={3} sx={{ mb: 5 }}>
        {/* Revenue */}
        <Grid item xs={12} sm={6} md={3}>
          <Card
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "background.paper",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: 2,
                  bgcolor: "rgba(202, 0, 25, 0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#ca0019",
                  mr: 2,
                }}
              >
                <BarChart />
              </Box>
              <Box sx={{ flexGrow: 1, height: 1, bgcolor: "divider" }} />
            </Box>
            <Typography variant="h4" sx={{ fontWeight: "bold", color: "text.primary" }}>
              ₹{Number(stats.Earnings || 0).toLocaleString()}
              <span style={{ color: "#ca0019", fontSize: "1.2rem", marginLeft: 4 }}>+</span>
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontWeight: 500 }}>
              Revenue Generated
            </Typography>
          </Card>
        </Grid>

        {/* Tech Partners */}
        <Grid item xs={12} sm={6} md={3}>
          <Card
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "background.paper",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: 2,
                  bgcolor: "rgba(202, 0, 25, 0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#ca0019",
                  mr: 2,
                }}
              >
                <People />
              </Box>
              <Box sx={{ flexGrow: 1, height: 1, bgcolor: "divider" }} />
            </Box>
            <Typography variant="h4" sx={{ fontWeight: "bold", color: "text.primary" }}>
              {Number(stats.Clients || 0).toLocaleString()}
              <span style={{ color: "#ca0019", fontSize: "1.2rem", marginLeft: 4 }}>+</span>
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontWeight: 500 }}>
              Tech Partners
            </Typography>
          </Card>
        </Grid>

        {/* Projects Delivered */}
        <Grid item xs={12} sm={6} md={3}>
          <Card
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "background.paper",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: 2,
                  bgcolor: "rgba(202, 0, 25, 0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#ca0019",
                  mr: 2,
                }}
              >
                <Lightbulb />
              </Box>
              <Box sx={{ flexGrow: 1, height: 1, bgcolor: "divider" }} />
            </Box>
            <Typography variant="h4" sx={{ fontWeight: "bold", color: "text.primary" }}>
              {Number(stats.Projects || 0).toLocaleString()}
              <span style={{ color: "#ca0019", fontSize: "1.2rem", marginLeft: 4 }}>+</span>
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontWeight: 500 }}>
              Projects Delivered
            </Typography>
          </Card>
        </Grid>

        {/* Community Events */}
        <Grid item xs={12} sm={6} md={3}>
          <Card
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "background.paper",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: 2,
                  bgcolor: "rgba(202, 0, 25, 0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#ca0019",
                  mr: 2,
                }}
              >
                <EventNote />
              </Box>
              <Box sx={{ flexGrow: 1, height: 1, bgcolor: "divider" }} />
            </Box>
            <Typography variant="h4" sx={{ fontWeight: "bold", color: "text.primary" }}>
              {Number(stats.Events || 0).toLocaleString()}
              <span style={{ color: "#ca0019", fontSize: "1.2rem", marginLeft: 4 }}>+</span>
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontWeight: 500 }}>
              Community Events
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Edit Form Card */}
      <Paper
        component="form"
        onSubmit={handleSave}
        elevation={0}
        sx={{
          p: { xs: 3, md: 4 },
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
          Edit Metrics Values
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Enter numeric values. The numbers will automatically animate on the landing page.
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Revenue Generated (₹)"
              type="number"
              value={stats.Earnings}
              onChange={handleInputChange("Earnings")}
              InputProps={{
                startAdornment: <InputAdornment position="start">₹</InputAdornment>,
              }}
              helperText="E.g., 860000 will display as ₹860,000+"
              required
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Tech Partners"
              type="number"
              value={stats.Clients}
              onChange={handleInputChange("Clients")}
              helperText="E.g., 100 will display as 100+"
              required
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Projects Delivered"
              type="number"
              value={stats.Projects}
              onChange={handleInputChange("Projects")}
              helperText="E.g., 150 will display as 150+"
              required
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Community Events"
              type="number"
              value={stats.Events}
              onChange={handleInputChange("Events")}
              helperText="E.g., 40 will display as 40+"
              required
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 4 }} />

        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
          <Button
            variant="outlined"
            color="inherit"
            startIcon={<RestartAlt />}
            onClick={handleReset}
            disabled={saving || loading}
            sx={{ borderRadius: 2 }}
          >
            Reset to Default
          </Button>

          <Button
            type="submit"
            variant="contained"
            disabled={saving || loading}
            startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <Save />}
            sx={{
              bgcolor: "#ca0019",
              "&:hover": { bgcolor: "#a30014" },
              px: 4,
              py: 1,
              fontWeight: 600,
              borderRadius: 2,
            }}
          >
            {saving ? "Saving Changes..." : "Save Changes"}
          </Button>
        </Box>
      </Paper>

      {/* Snackbar Notification */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default StatsManagement;
