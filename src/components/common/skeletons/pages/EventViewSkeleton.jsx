/**
 * @file EventViewSkeleton.jsx
 * @description Pixel-accurate skeleton for the Event Details (View) page.
 */

import React from "react";
import { Box, Card, CardContent, Grid, Paper } from "@mui/material";
import BaseSkeleton from "../BaseSkeleton";

const EventViewSkeleton = () => {
  return (
    <Box sx={{ width: "100%", p: 3, boxSizing: "border-box" }}>
      {/* Header Bar */}
      <Paper
        elevation={0}
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          p: 2.5,
          mb: 4,
          borderRadius: 2,
          border: "1px solid",
          borderColor: "divider",
          gap: 2,
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <BaseSkeleton variant="text" width={260} height={36} />
          <BaseSkeleton variant="text" width={180} height={20} />
        </Box>
        <Box sx={{ display: "flex", gap: 1.5 }}>
          <BaseSkeleton variant="rounded" width={120} height={40} sx={{ borderRadius: "8px" }} />
          <BaseSkeleton variant="rounded" width={140} height={40} sx={{ borderRadius: "8px" }} />
        </Box>
      </Paper>

      {/* Main Content Grid */}
      <Grid container spacing={3}>
        {/* Left Column (8 cols): Banner, Tabs, Content */}
        <Grid item xs={12} md={8}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
              display: "flex",
              flexDirection: "column",
              gap: 3,
            }}
          >
            {/* 350px Banner Skeleton */}
            <BaseSkeleton variant="rounded" width="100%" height={350} sx={{ borderRadius: 2 }} />

            {/* Tabs Row */}
            <Box sx={{ display: "flex", gap: 2, borderBottom: 1, borderColor: "divider", pb: 1.5 }}>
              <BaseSkeleton variant="rounded" width={80} height={32} sx={{ borderRadius: "6px" }} />
              <BaseSkeleton variant="rounded" width={90} height={32} sx={{ borderRadius: "6px" }} />
              <BaseSkeleton variant="rounded" width={110} height={32} sx={{ borderRadius: "6px" }} />
              <BaseSkeleton variant="rounded" width={110} height={32} sx={{ borderRadius: "6px" }} />
              <BaseSkeleton variant="rounded" width={80} height={32} sx={{ borderRadius: "6px" }} />
            </Box>

            {/* Tab Details Body */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <BaseSkeleton variant="text" width="95%" height={20} />
              <BaseSkeleton variant="text" width="90%" height={20} />
              <BaseSkeleton variant="text" width="75%" height={20} />
              <Box sx={{ display: "flex", gap: 3, mt: 2 }}>
                <BaseSkeleton variant="rounded" width={160} height={60} sx={{ borderRadius: "10px" }} />
                <BaseSkeleton variant="rounded" width={160} height={60} sx={{ borderRadius: "10px" }} />
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Right Column (4 cols): Meta Cards */}
        <Grid item xs={12} md={4}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {/* Status Card */}
            <Card elevation={0} sx={{ borderRadius: 2, border: "1px solid", borderColor: "divider", p: 2 }}>
              <CardContent sx={{ p: 1, display: "flex", flexDirection: "column", gap: 1.5 }}>
                <BaseSkeleton variant="text" width="50%" height={22} />
                <BaseSkeleton variant="rounded" width={90} height={26} sx={{ borderRadius: "12px" }} />
                <BaseSkeleton variant="rounded" width="100%" height={8} sx={{ borderRadius: "4px", mt: 1 }} />
              </CardContent>
            </Card>

            {/* Quick Info Card */}
            <Card elevation={0} sx={{ borderRadius: 2, border: "1px solid", borderColor: "divider", p: 2 }}>
              <CardContent sx={{ p: 1, display: "flex", flexDirection: "column", gap: 2 }}>
                <BaseSkeleton variant="text" width="60%" height={24} />
                {Array.from({ length: 4 }).map((_, idx) => (
                  <Box key={idx} sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <BaseSkeleton variant="circular" width={28} height={28} />
                    <Box sx={{ flex: 1 }}>
                      <BaseSkeleton variant="text" width="40%" height={16} />
                      <BaseSkeleton variant="text" width="70%" height={18} />
                    </Box>
                  </Box>
                ))}
              </CardContent>
            </Card>

            {/* Budget Card */}
            <Card elevation={0} sx={{ borderRadius: 2, border: "1px solid", borderColor: "divider", p: 2 }}>
              <CardContent sx={{ p: 1, display: "flex", flexDirection: "column", gap: 1.5 }}>
                <BaseSkeleton variant="text" width="50%" height={22} />
                <BaseSkeleton variant="text" width="65%" height={32} />
                <BaseSkeleton variant="text" width="40%" height={16} />
              </CardContent>
            </Card>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default EventViewSkeleton;
