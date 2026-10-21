/**
 * @file DashboardPageSkeleton.jsx
 * @description Pixel-accurate skeleton for Management Dashboard (Admin & Coordinator).
 */

import React from "react";
import { Box, Paper } from "@mui/material";
import BaseSkeleton from "../BaseSkeleton";
import { StatCardSkeleton } from "../StatsSkeleton";
import TableSkeleton from "../TableSkeleton";

const DashboardPageSkeleton = () => {
  return (
    <Box sx={{ width: "100%", boxSizing: "border-box" }}>
      {/* Main Dashboard Layout */}
      <Box
        className="grid xl:grid-cols-5 lg:grid-cols-4 md:grid-cols-3 grid-cols-1 gap-5 md:px-4 px-2 py-5 mb-5"
      >
        {/* Left Column (4/5 on XL, 3/4 on LG, 2/3 on MD) */}
        <Box className="xl:col-span-4 lg:col-span-3 md:col-span-2">
          {/* Banner Skeleton */}
          <BaseSkeleton
            variant="rounded"
            width="100%"
            height={200}
            sx={{ borderRadius: "16px" }}
          />

          {/* 4 Stat Cards Grid */}
          <Box className="grid xl:grid-cols-4 lg:grid-cols-2 md:grid-cols-2 place-items-stretch grid-cols-1 gap-5 mt-5">
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </Box>

          {/* Newly Added Members Section */}
          <Box sx={{ px: 1, py: 3, my: 2 }}>
            <BaseSkeleton variant="text" width={220} height={34} sx={{ mb: 2.5 }} />
            <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 2 }}>
              {Array.from({ length: 7 }).map((_, idx) => (
                <Paper
                  key={idx}
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: "14px",
                    border: "1px solid",
                    borderColor: "divider",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 1,
                    minWidth: 100,
                    bgcolor: "background.paper",
                  }}
                >
                  <BaseSkeleton variant="circular" width={56} height={56} />
                  <BaseSkeleton variant="text" width={70} height={18} />
                  <BaseSkeleton variant="text" width={50} height={14} />
                </Paper>
              ))}
            </Box>
          </Box>
        </Box>

        {/* Right Column (1/5 on XL, 1/4 on LG, 1/3 on MD) */}
        <Box className="xl:col-span-1 lg:col-span-1 md:col-span-1">
          {/* Calendar Card */}
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              mb: 4,
              borderRadius: "16px",
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "background.paper",
              height: 310,
              boxSizing: "border-box",
            }}
          >
            <BaseSkeleton variant="text" width="60%" height={26} sx={{ mb: 2 }} />
            <BaseSkeleton variant="rounded" width="100%" height={230} sx={{ borderRadius: "10px" }} />
          </Paper>

          {/* Event Stream Card */}
          <Paper
            elevation={0}
            sx={{
              borderRadius: "16px",
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "background.paper",
              overflow: "hidden",
            }}
          >
            <Box sx={{ p: 2.25, borderBottom: "1px solid", borderColor: "divider" }}>
              <BaseSkeleton variant="text" width="55%" height={24} />
              <BaseSkeleton variant="text" width="80%" height={16} sx={{ mt: 0.5 }} />
            </Box>
            <Box sx={{ p: 2, display: "flex", flexDirection: "column", gap: 2 }}>
              {Array.from({ length: 4 }).map((_, idx) => (
                <Box key={idx} sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <BaseSkeleton variant="rounded" width={42} height={42} sx={{ borderRadius: "8px", flexShrink: 0 }} />
                  <Box sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 0.5 }}>
                    <BaseSkeleton variant="text" width="75%" height={18} />
                    <BaseSkeleton variant="text" width="50%" height={14} />
                  </Box>
                </Box>
              ))}
            </Box>
          </Paper>
        </Box>
      </Box>

      {/* Member Filters Table Section */}
      <Box sx={{ mx: { xs: 1, sm: 3 }, mb: 6 }}>
        <BaseSkeleton variant="text" width={180} height={32} sx={{ mb: 2 }} />
        {/* Tabs Bar */}
        <Box sx={{ display: "flex", gap: 2, mb: 3, borderBottom: "1px solid", borderColor: "divider", pb: 1 }}>
          <BaseSkeleton variant="rounded" width={160} height={36} sx={{ borderRadius: "8px" }} />
          <BaseSkeleton variant="rounded" width={200} height={36} sx={{ borderRadius: "8px" }} />
        </Box>
        {/* Table */}
        <TableSkeleton rows={5} columns={7} />
      </Box>
    </Box>
  );
};

export default DashboardPageSkeleton;
