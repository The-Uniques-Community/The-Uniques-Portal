/**
 * @file Unauthorized.jsx
 * @description 401 Unauthorized error view presented when an authenticated user attempts to access a route forbidden by RBAC policies.
 * @architecture Rendered by Route Guard components when authorization checks fail, routing back to user-appropriate dashboards via getRoleDashboard.
 * @agent_note Extracts the role from localStorage (`role` or `user.role`) to construct a dynamic return path via getRoleDashboard().
 */

import React from "react";
import { Box, Button, Container, Paper, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DashboardIcon from "@mui/icons-material/Dashboard";
import { getRoleDashboard } from "@/routes/paths";

/**
 * @component Unauthorized
 * @description Renders a 401 Unauthorized warning screen displaying current user role with navigation links to home or role dashboard.
 */
const Unauthorized = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  const userRole =
    localStorage.getItem("role") ||
    (() => {
      try {
        return JSON.parse(localStorage.getItem("user") || "{}").role;
      } catch {
        return null;
      }
    })();

  const dashboardPath = getRoleDashboard(userRole);

  return (
    <Container
      maxWidth="sm"
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        py: 4,
      }}
    >
      <Paper
        elevation={4}
        sx={{
          p: { xs: 3, sm: 5 },
          borderRadius: "16px",
          textAlign: "center",
          backgroundColor: theme.palette.background.paper,
          border: `1px solid ${theme.palette.divider}`,
          width: "100%",
        }}
      >
        <Box
          sx={{
            width: 72,
            height: 72,
            borderRadius: "50%",
            backgroundColor: "error.light",
            color: "error.main",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mx: "auto",
            mb: 3,
            opacity: 0.9,
          }}
        >
          <LockOutlinedIcon sx={{ fontSize: 40 }} />
        </Box>

        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          sx={{ fontWeight: 800, color: "text.primary" }}
        >
          401 - Unauthorized
        </Typography>

        <Typography
          variant="body1"
          sx={{ color: "text.secondary", mb: 3, maxWidth: 420, mx: "auto" }}
        >
          You do not have the required permissions to view this resource.
          {userRole && (
            <Box component="span" sx={{ display: "block", mt: 1, fontWeight: 600 }}>
              Current Role: <span className="capitalize">{userRole}</span>
            </Box>
          )}
        </Typography>

        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            gap: 2,
            justifyContent: "center",
            mt: 4,
          }}
        >
          <Button
            variant="contained"
            color="primary"
            size="large"
            startIcon={<DashboardIcon />}
            onClick={() => navigate(dashboardPath)}
            sx={{ px: 3, py: 1.2, borderRadius: "8px", fontWeight: 600 }}
          >
            Go to Your Dashboard
          </Button>

          <Button
            variant="outlined"
            size="large"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate("/")}
            sx={{ px: 3, py: 1.2, borderRadius: "8px" }}
          >
            Login Page
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default Unauthorized;
