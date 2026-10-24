/**
 * @file ProjectsPageSkeleton.jsx
 * @description Pixel-accurate skeleton for the Projects Overview / Management page.
 */

import React from "react";
import { Box, Card, CardContent, Grid, Paper } from "@mui/material";
import BaseSkeleton from "../BaseSkeleton";
import TableSkeleton from "../TableSkeleton";

const ProjectsPageSkeleton = () => {
  return (
    <Box sx={{ width: "100%", p: { xs: 1.5, sm: 2, md: 3 }, boxSizing: "border-box" }}>
      {/* ModernHeader Bar */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" },
          mb: 4,
          gap: 2,
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <BaseSkeleton variant="text" width={280} height={40} />
          <BaseSkeleton variant="text" width={380} height={20} />
        </Box>
        <BaseSkeleton variant="rounded" width={140} height={42} sx={{ borderRadius: "8px" }} />
      </Box>

      {/* Metrics Row: 2 Compact Cards */}
      <Grid container spacing={2.5} sx={{ mb: 3.5 }}>
        {[1, 2].map((i) => (
          <Grid item xs={12} sm={6} md={3} key={i}>
            <Card elevation={0} sx={{ borderRadius: "14px", border: "1px solid", borderColor: "divider" }}>
              <CardContent sx={{ p: 2.25, display: "flex", flexDirection: "column", gap: 1 }}>
                <BaseSkeleton variant="text" width="50%" height={16} />
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mt: 0.5 }}>
                  <BaseSkeleton variant="rounded" width={36} height={36} sx={{ borderRadius: "9px" }} />
                  <BaseSkeleton variant="text" width="40%" height={32} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Table Header Bar */}
      <Box sx={{ mb: 2 }}>
        <BaseSkeleton variant="text" width={140} height={32} />
      </Box>

      {/* Search Filter Bar */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 3,
          borderRadius: "12px",
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
        }}
      >
        <BaseSkeleton variant="rounded" width="100%" height={40} sx={{ borderRadius: "8px" }} />
      </Paper>

      {/* Projects Table (5 columns) */}
      <TableSkeleton rows={6} columns={5} />
    </Box>
  );
};

export default ProjectsPageSkeleton;

