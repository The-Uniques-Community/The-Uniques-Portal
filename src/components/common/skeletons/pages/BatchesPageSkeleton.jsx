/**
 * @file BatchesPageSkeleton.jsx
 * @description Pixel-accurate skeleton for the Batches Profile Management page.
 */

import React from "react";
import { Box, Card, Grid, Paper, Stack } from "@mui/material";
import BaseSkeleton from "../BaseSkeleton";

const BatchesPageSkeleton = () => {
  return (
    <Box sx={{ width: "100%", p: { xs: 2, md: 4 }, minHeight: "100vh", boxSizing: "border-box" }}>
      {/* Top Page Header */}
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <BaseSkeleton variant="rounded" width={48} height={48} sx={{ borderRadius: "12px" }} />
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
            <BaseSkeleton variant="text" width={260} height={34} />
            <BaseSkeleton variant="text" width={400} height={18} />
          </Box>
        </Stack>
      </Box>

      {/* Batch Selector Bar */}
      <Card elevation={0} sx={{ mb: 4, p: 2.5, borderRadius: "14px", border: "1px solid", borderColor: "divider" }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={8} md={6}>
            <BaseSkeleton variant="rounded" width="100%" height={40} sx={{ borderRadius: "10px" }} />
          </Grid>
          <Grid item xs={12} sm={4} md={6}>
            <Box sx={{ display: "flex", justifyContent: { xs: "flex-start", sm: "flex-end" } }}>
              <BaseSkeleton variant="rounded" width={150} height={40} sx={{ borderRadius: "10px" }} />
            </Box>
          </Grid>
        </Grid>
      </Card>

      {/* Main Content Grid: Editor (Left) & Preview (Right) */}
      <Grid container spacing={3}>
        {/* Editor Card (Left) */}
        <Grid item xs={12} lg={6}>
          <Card elevation={0} sx={{ borderRadius: "16px", p: 3, border: "1px solid", borderColor: "divider" }}>
            <BaseSkeleton variant="text" width={180} height={28} sx={{ mb: 2 }} />
            <Stack spacing={2.5}>
              <BaseSkeleton variant="rounded" width="100%" height={42} sx={{ borderRadius: "8px" }} />
              <BaseSkeleton variant="rounded" width="100%" height={42} sx={{ borderRadius: "8px" }} />
              {/* Photo Upload Dropzone */}
              <BaseSkeleton variant="rounded" width="100%" height={120} sx={{ borderRadius: "12px" }} />
              {/* Description TextArea */}
              <BaseSkeleton variant="rounded" width="100%" height={150} sx={{ borderRadius: "8px" }} />
              {/* Action Buttons */}
              <Box sx={{ display: "flex", justifyContent: "space-between", pt: 1 }}>
                <BaseSkeleton variant="rounded" width={140} height={40} sx={{ borderRadius: "10px" }} />
                <BaseSkeleton variant="rounded" width={140} height={40} sx={{ borderRadius: "10px" }} />
              </Box>
            </Stack>
          </Card>
        </Grid>

        {/* Live Website Preview Card (Right) */}
        <Grid item xs={12} lg={6}>
          <Card elevation={0} sx={{ borderRadius: "16px", p: 3, border: "1px solid", borderColor: "divider" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <BaseSkeleton variant="circular" width={24} height={24} />
              <BaseSkeleton variant="text" width={190} height={26} />
            </Box>
            <Paper elevation={0} sx={{ p: 3, borderRadius: "14px", border: "1px solid", borderColor: "divider" }}>
              <BaseSkeleton variant="rounded" width="100%" height={260} sx={{ borderRadius: "12px", mb: 2.5 }} />
              <BaseSkeleton variant="text" width="60%" height={30} sx={{ mb: 1.5 }} />
              <BaseSkeleton variant="text" width="95%" height={18} />
              <BaseSkeleton variant="text" width="90%" height={18} />
              <BaseSkeleton variant="text" width="80%" height={18} />
            </Paper>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default BatchesPageSkeleton;
