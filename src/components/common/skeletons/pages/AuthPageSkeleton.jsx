/**
 * @file AuthPageSkeleton.jsx
 * @description Page-accurate skeleton for Login and Authentication views.
 * Mirrors the exact 2-column layout (form card + brand illustration).
 */

import React from "react";
import { Box, Paper } from "@mui/material";
import BaseSkeleton from "../BaseSkeleton";

export const AuthPageSkeleton = () => {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-evenly",
        px: 2,
        py: 4,
        flexDirection: { xs: "column", md: "row" },
        gap: 4,
        bgcolor: "background.default",
      }}
    >
      {/* Left Column: Form Container */}
      <Box
        sx={{
          width: "100%",
          maxWidth: 480,
          p: 3,
          display: "flex",
          flexDirection: "column",
          gap: 2.5,
        }}
      >
        {/* Logo */}
        <BaseSkeleton variant="rounded" width={190} height={50} sx={{ borderRadius: "8px", mb: 1 }} />

        {/* OAuth Button */}
        <BaseSkeleton variant="rounded" width="100%" height={46} sx={{ borderRadius: "8px" }} />

        {/* Divider */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 2, my: 1 }}>
          <BaseSkeleton variant="rectangular" width="30%" height={1} />
          <BaseSkeleton variant="text" width={24} height={16} />
          <BaseSkeleton variant="rectangular" width="30%" height={1} />
        </Box>

        {/* Heading */}
        <BaseSkeleton variant="text" width="65%" height={38} />

        {/* Inputs */}
        <BaseSkeleton variant="rounded" width="100%" height={54} sx={{ borderRadius: "8px" }} />
        <BaseSkeleton variant="rounded" width="100%" height={54} sx={{ borderRadius: "8px" }} />

        {/* Action Row */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <BaseSkeleton variant="text" width={110} height={20} />
          <BaseSkeleton variant="text" width={120} height={20} />
        </Box>

        {/* Submit Button */}
        <BaseSkeleton variant="rounded" width="100%" height={46} sx={{ borderRadius: "8px", mt: 1 }} />
      </Box>

      {/* Right Column: Visual Artwork Placeholder */}
      <Box
        sx={{
          display: { xs: "none", md: "flex" },
          justifyContent: "center",
          alignItems: "center",
          maxWidth: 500,
          width: "100%",
        }}
      >
        <BaseSkeleton
          variant="rounded"
          width={400}
          height={400}
          sx={{ borderRadius: "24px" }}
        />
      </Box>
    </Box>
  );
};

export default AuthPageSkeleton;
