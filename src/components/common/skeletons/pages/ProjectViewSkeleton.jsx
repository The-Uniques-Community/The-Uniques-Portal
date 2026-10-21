/**
 * @file ProjectViewSkeleton.jsx
 * @description Pixel-accurate skeleton for the Project Details (View) page.
 */

import React from "react";
import { Box, Card, CardContent, Grid, Paper } from "@mui/material";
import BaseSkeleton from "../BaseSkeleton";

const ProjectViewSkeleton = () => {
  return (
    <Box sx={{ width: "100%", p: { xs: 1.5, sm: 3, md: 4 }, boxSizing: "border-box" }}>
      {/* Header Bar */}
      <Paper
        elevation={0}
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          p: { xs: 2, sm: 3 },
          mb: 4,
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
          gap: 2,
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <BaseSkeleton variant="text" width={280} height={36} />
          <BaseSkeleton variant="text" width={220} height={20} />
        </Box>
        <Box sx={{ display: "flex", gap: 1.5 }}>
          <BaseSkeleton variant="rounded" width={130} height={42} sx={{ borderRadius: "8px" }} />
          <BaseSkeleton variant="rounded" width={140} height={42} sx={{ borderRadius: "8px" }} />
        </Box>
      </Paper>

      {/* Main Content Grid */}
      <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }}>
        {/* Left Column (8 cols): Banner Preview, Tabs, Deep Content */}
        <Grid item xs={12} md={8}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3,
                border: "1px solid",
                borderColor: "divider",
                display: "flex",
                flexDirection: "column",
                gap: 2.5,
              }}
            >
              {/* Preview Banner */}
              <BaseSkeleton variant="rounded" width="100%" height={300} sx={{ borderRadius: "12px" }} />

              {/* Tabs Navigation */}
              <Box sx={{ display: "flex", gap: 1.5, borderBottom: 1, borderColor: "divider", pb: 1 }}>
                <BaseSkeleton variant="rounded" width={90} height={36} sx={{ borderRadius: "8px" }} />
                <BaseSkeleton variant="rounded" width={110} height={36} sx={{ borderRadius: "8px" }} />
                <BaseSkeleton variant="rounded" width={100} height={36} sx={{ borderRadius: "8px" }} />
                <BaseSkeleton variant="rounded" width={80} height={36} sx={{ borderRadius: "8px" }} />
                <BaseSkeleton variant="rounded" width={80} height={36} sx={{ borderRadius: "8px" }} />
              </Box>

              {/* Deep Details Section */}
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
                <BaseSkeleton variant="text" width="95%" height={20} />
                <BaseSkeleton variant="text" width="90%" height={20} />
                <BaseSkeleton variant="text" width="80%" height={20} />
                <BaseSkeleton variant="text" width="60%" height={20} />
                <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 1.5 }}>
                  <BaseSkeleton variant="text" width={180} height={24} />
                  <BaseSkeleton variant="rounded" width="100%" height={40} sx={{ borderRadius: "8px" }} />
                  <BaseSkeleton variant="rounded" width="100%" height={40} sx={{ borderRadius: "8px" }} />
                </Box>
              </Box>
            </Paper>
          </Box>
        </Grid>

        {/* Right Column (4 cols): Meta Cards */}
        <Grid item xs={12} md={4}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {/* Status & Core Meta Card */}
            <Card elevation={0} sx={{ borderRadius: 3, border: "1px solid", borderColor: "divider", p: 2 }}>
              <CardContent sx={{ p: 1, display: "flex", flexDirection: "column", gap: 1.5 }}>
                <BaseSkeleton variant="text" width="50%" height={22} />
                <BaseSkeleton variant="rounded" width={90} height={26} sx={{ borderRadius: "12px" }} />
                <BaseSkeleton variant="text" width="70%" height={18} />
              </CardContent>
            </Card>

            {/* Technologies Card */}
            <Card elevation={0} sx={{ borderRadius: 3, border: "1px solid", borderColor: "divider", p: 2 }}>
              <CardContent sx={{ p: 1, display: "flex", flexDirection: "column", gap: 1.5 }}>
                <BaseSkeleton variant="text" width="60%" height={22} />
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1 }}>
                  <BaseSkeleton variant="rounded" width={65} height={26} sx={{ borderRadius: "14px" }} />
                  <BaseSkeleton variant="rounded" width={80} height={26} sx={{ borderRadius: "14px" }} />
                  <BaseSkeleton variant="rounded" width={70} height={26} sx={{ borderRadius: "14px" }} />
                  <BaseSkeleton variant="rounded" width={60} height={26} sx={{ borderRadius: "14px" }} />
                </Box>
              </CardContent>
            </Card>

            {/* Team Card */}
            <Card elevation={0} sx={{ borderRadius: 3, border: "1px solid", borderColor: "divider", p: 2 }}>
              <CardContent sx={{ p: 1, display: "flex", flexDirection: "column", gap: 2 }}>
                <BaseSkeleton variant="text" width="50%" height={22} />
                {Array.from({ length: 3 }).map((_, idx) => (
                  <Box key={idx} sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <BaseSkeleton variant="circular" width={36} height={36} />
                    <Box sx={{ flex: 1 }}>
                      <BaseSkeleton variant="text" width="60%" height={18} />
                      <BaseSkeleton variant="text" width="40%" height={14} />
                    </Box>
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProjectViewSkeleton;
