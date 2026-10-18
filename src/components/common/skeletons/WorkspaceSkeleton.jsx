/**
 * @file WorkspaceSkeleton.jsx
 * @description Cockpit workspace skeleton for Uniques 360 (Member & Coordinator views).
 */

import React from "react";
import { Box, Grid, Paper } from "@mui/material";
import BaseSkeleton from "./BaseSkeleton";
import FeedSkeleton from "./FeedSkeleton";

const WorkspaceSkeleton = () => {
  return (
    <Grid
      container
      sx={{
        height: "calc(100vh - 100px)",
        bgcolor: "background.default",
        overflow: "hidden",
      }}
    >
      {/* Sidebar Task List Skeleton */}
      <Grid
        item
        xs={12}
        md={3}
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          borderRight: "1px solid",
          borderColor: "divider",
          p: 2,
          gap: 2,
        }}
      >
        {/* Search bar & filter pills */}
        <BaseSkeleton variant="rounded" width="100%" height={40} sx={{ borderRadius: "8px" }} />
        <Box sx={{ display: "flex", gap: 1 }}>
          <BaseSkeleton variant="rounded" width={60} height={26} sx={{ borderRadius: "14px" }} />
          <BaseSkeleton variant="rounded" width={75} height={26} sx={{ borderRadius: "14px" }} />
          <BaseSkeleton variant="rounded" width={65} height={26} sx={{ borderRadius: "14px" }} />
        </Box>

        {/* 5 Task Item rows */}
        {Array.from({ length: 5 }).map((_, idx) => (
          <Paper
            key={idx}
            elevation={0}
            sx={{
              p: 2,
              borderRadius: "10px",
              border: "1px solid",
              borderColor: "divider",
              display: "flex",
              flexDirection: "column",
              gap: 1,
            }}
          >
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <BaseSkeleton variant="text" width="65%" height={22} />
              <BaseSkeleton variant="rounded" width={50} height={18} sx={{ borderRadius: "4px" }} />
            </Box>
            <BaseSkeleton variant="text" width="40%" height={16} />
            <BaseSkeleton variant="rounded" width="100%" height={6} sx={{ borderRadius: "3px", mt: 0.5 }} />
          </Paper>
        ))}
      </Grid>

      {/* Main Workspace Frame Panel */}
      <Grid
        item
        xs={12}
        md={9}
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          backgroundColor: "background.default",
          p: { xs: 1.5, md: 3 },
          gap: 2.5,
        }}
      >
        <Paper
          elevation={0}
          sx={{
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            borderRadius: "14px",
            border: "1px solid",
            borderColor: "divider",
            overflow: "hidden",
            p: 3,
            gap: 2,
          }}
        >
          {/* Header Row */}
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <Box sx={{ width: "60%", display: "flex", flexDirection: "column", gap: 1 }}>
              <BaseSkeleton variant="text" width="70%" height={32} />
              <BaseSkeleton variant="text" width="40%" height={20} />
            </Box>
            <Box sx={{ display: "flex", gap: 1.5 }}>
              <BaseSkeleton variant="rounded" width={110} height={36} sx={{ borderRadius: "8px" }} />
              <BaseSkeleton variant="rounded" width={110} height={36} sx={{ borderRadius: "8px" }} />
            </Box>
          </Box>

          {/* Subheader info bar */}
          <Box sx={{ display: "flex", gap: 3, py: 1, borderTop: "1px solid", borderBottom: "1px solid", borderColor: "divider" }}>
            <BaseSkeleton variant="text" width={100} height={20} />
            <BaseSkeleton variant="text" width={120} height={20} />
            <BaseSkeleton variant="text" width={90} height={20} />
          </Box>

          {/* Feed Content */}
          <Box sx={{ flexGrow: 1, overflow: "hidden", pt: 1 }}>
            <FeedSkeleton count={3} />
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default WorkspaceSkeleton;
