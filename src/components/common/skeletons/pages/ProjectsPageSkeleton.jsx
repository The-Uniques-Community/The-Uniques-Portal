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
      {/* Header Bar */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <BaseSkeleton variant="text" width={280} height={40} />
        <BaseSkeleton variant="rounded" width={140} height={40} sx={{ borderRadius: "8px" }} />
      </Box>

      {/* Metrics Row: 2 Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={0} sx={{ borderRadius: 2, border: "1px solid", borderColor: "divider" }}>
            <CardContent sx={{ p: 2.5, display: "flex", flexDirection: "column", gap: 1 }}>
              <BaseSkeleton variant="text" width="60%" height={18} />
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <BaseSkeleton variant="circular" width={32} height={32} />
                <BaseSkeleton variant="text" width="40%" height={32} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={0} sx={{ borderRadius: 2, border: "1px solid", borderColor: "divider" }}>
            <CardContent sx={{ p: 2.5, display: "flex", flexDirection: "column", gap: 1 }}>
              <BaseSkeleton variant="text" width="60%" height={18} />
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <BaseSkeleton variant="circular" width={32} height={32} />
                <BaseSkeleton variant="text" width="40%" height={32} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

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
