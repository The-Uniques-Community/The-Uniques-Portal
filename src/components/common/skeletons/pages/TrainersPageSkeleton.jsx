/**
 * @file TrainersPageSkeleton.jsx
 * @description Pixel-accurate skeleton for the Trainers Overview page.
 */

import React from "react";
import { Box, Paper } from "@mui/material";
import BaseSkeleton from "../BaseSkeleton";
import { TrainerCardSkeleton } from "../CardSkeleton";

const TrainersPageSkeleton = () => {
  return (
    <Box sx={{ width: "100%", p: { xs: 2, md: 3 }, boxSizing: "border-box" }}>
      {/* Header Tabs: Profiles, Manage */}
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3, display: "flex", gap: 2 }}>
        <BaseSkeleton variant="rounded" width={90} height={40} sx={{ borderRadius: "8px" }} />
        <BaseSkeleton variant="rounded" width={90} height={40} sx={{ borderRadius: "8px" }} />
      </Box>

      {/* Search Bar */}
      <Box sx={{ mb: 4 }}>
        <BaseSkeleton variant="rounded" width={380} height={40} sx={{ borderRadius: "8px" }} />
      </Box>

      {/* Grid of Trainer Cards */}
      <Box className="grid xl:grid-cols-4 md:grid-cols-3 grid-cols-1 sm:grid-cols-1 gap-4 w-full">
        {Array.from({ length: 8 }).map((_, idx) => (
          <TrainerCardSkeleton key={idx} />
        ))}
      </Box>
    </Box>
  );
};

export default TrainersPageSkeleton;
