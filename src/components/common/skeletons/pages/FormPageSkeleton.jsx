/**
 * @file FormPageSkeleton.jsx
 * @description Pixel-accurate skeleton for entity creation and edit forms (EventForm, ProjectForm).
 */

import React from "react";
import { Box, Grid, Paper } from "@mui/material";
import BaseSkeleton from "../BaseSkeleton";

const FormPageSkeleton = () => {
  return (
    <Box sx={{ width: "100%", p: { xs: 2, md: 4 }, maxWidth: 1000, mx: "auto", boxSizing: "border-box" }}>
      {/* Form Header */}
      <Box sx={{ mb: 4, display: "flex", flexDirection: "column", gap: 1 }}>
        <BaseSkeleton variant="text" width={260} height={38} />
        <BaseSkeleton variant="text" width={400} height={20} />
      </Box>

      {/* Main Form Paper */}
      <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, borderRadius: 3, border: "1px solid", borderColor: "divider", display: "flex", flexDirection: "column", gap: 4 }}>
        {/* Section 1 */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
          <BaseSkeleton variant="text" width={180} height={26} />
          <Grid container spacing={2.5}>
            <Grid item xs={12} sm={6}>
              <BaseSkeleton variant="rounded" width="100%" height={52} sx={{ borderRadius: "8px" }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <BaseSkeleton variant="rounded" width="100%" height={52} sx={{ borderRadius: "8px" }} />
            </Grid>
            <Grid item xs={12}>
              <BaseSkeleton variant="rounded" width="100%" height={90} sx={{ borderRadius: "8px" }} />
            </Grid>
          </Grid>
        </Box>

        {/* Media / Dropzone section */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          <BaseSkeleton variant="text" width={140} height={22} />
          <BaseSkeleton variant="rounded" width="100%" height={140} sx={{ borderRadius: "12px" }} />
        </Box>

        {/* Section 2 */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
          <BaseSkeleton variant="text" width={160} height={26} />
          <Grid container spacing={2.5}>
            <Grid item xs={12} sm={6}>
              <BaseSkeleton variant="rounded" width="100%" height={52} sx={{ borderRadius: "8px" }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <BaseSkeleton variant="rounded" width="100%" height={52} sx={{ borderRadius: "8px" }} />
            </Grid>
          </Grid>
        </Box>

        {/* Action Buttons */}
        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, pt: 2, borderTop: "1px solid", borderColor: "divider" }}>
          <BaseSkeleton variant="rounded" width={110} height={42} sx={{ borderRadius: "8px" }} />
          <BaseSkeleton variant="rounded" width={150} height={42} sx={{ borderRadius: "8px" }} />
        </Box>
      </Paper>
    </Box>
  );
};

export default FormPageSkeleton;
