/**
 * @file ErrorBoundary.jsx
 * @description React Router Data Router error boundary fallback.
 * Catches rendering exceptions and displays a user-friendly recovery screen instead of a blank white screen.
 */
import React from "react";
import { useRouteError, useNavigate, Link } from "react-router-dom";
import { Box, Button, Container, Paper, Typography } from "@mui/material";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import HomeIcon from "@mui/icons-material/Home";
import RefreshIcon from "@mui/icons-material/Refresh";

const ErrorBoundary = () => {
  const error = useRouteError();
  const navigate = useNavigate();

  console.error("[Route ErrorBoundary caught an unhandled error]:", error);

  const errorMessage =
    error?.statusText ||
    error?.message ||
    (typeof error === "string" ? error : "An unexpected application error occurred.");

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
          border: "1px solid rgba(202, 0, 25, 0.2)",
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
          <ErrorOutlineIcon sx={{ fontSize: 40 }} />
        </Box>

        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          sx={{ fontWeight: 800, color: "text.primary" }}
        >
          Something Went Wrong
        </Typography>

        <Typography
          variant="body1"
          sx={{ color: "text.secondary", mb: 3, maxWidth: 440, mx: "auto" }}
        >
          {errorMessage}
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
            startIcon={<RefreshIcon />}
            onClick={() => window.location.reload()}
            sx={{ px: 3, py: 1.2, borderRadius: "8px", fontWeight: 600 }}
          >
            Reload Page
          </Button>

          <Button
            variant="outlined"
            size="large"
            startIcon={<HomeIcon />}
            component={Link}
            to="/"
            sx={{ px: 3, py: 1.2, borderRadius: "8px" }}
          >
            Back to Home
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default ErrorBoundary;
