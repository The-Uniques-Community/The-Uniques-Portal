/**
 * @file ProfilePageSkeleton.jsx
 * @description Pixel-accurate skeleton for the Profile page.
 */

import React from "react";
import { Box, Card, CardContent, Container, Grid, Paper } from "@mui/material";
import BaseSkeleton from "../BaseSkeleton";

const ProfilePageSkeleton = () => {
  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, md: 4 }, minHeight: "100vh", boxSizing: "border-box" }}>
      {/* Profile Header Card */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, md: 4 },
          mb: 4,
          borderRadius: "16px",
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            alignItems: { xs: "center", md: "flex-start" },
            gap: 3,
          }}
        >
          {/* Avatar (120x120) */}
          <BaseSkeleton
            variant="circular"
            width={120}
            height={120}
            sx={{ flexShrink: 0 }}
          />

          {/* User Details */}
          <Box sx={{ flex: 1, minWidth: 0, width: "100%", display: "flex", flexDirection: "column", gap: 1.5 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
              <BaseSkeleton variant="text" width={220} height={36} />
              <BaseSkeleton variant="rounded" width={80} height={24} sx={{ borderRadius: "6px" }} />
            </Box>
            <BaseSkeleton variant="text" width={180} height={20} />

            {/* Course & Batch row */}
            <Box sx={{ display: "flex", gap: 3, my: 0.5 }}>
              <BaseSkeleton variant="rounded" width={120} height={24} sx={{ borderRadius: "6px" }} />
              <BaseSkeleton variant="rounded" width={110} height={24} sx={{ borderRadius: "6px" }} />
            </Box>

            {/* Social Icons + Edit Button */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mt: 1, flexWrap: "wrap" }}>
              <BaseSkeleton variant="circular" width={40} height={40} />
              <BaseSkeleton variant="circular" width={40} height={40} />
              <BaseSkeleton variant="circular" width={40} height={40} />
              <BaseSkeleton variant="rounded" width={130} height={40} sx={{ borderRadius: "10px", ml: { sm: 1 } }} />
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Main Layout Grid */}
      <Grid container spacing={3}>
        {/* Left Column (8 cols): Tabs & Panels */}
        <Grid item xs={12} md={8}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2, md: 3 },
              borderRadius: "16px",
              border: "1px solid",
              borderColor: "divider",
              display: "flex",
              flexDirection: "column",
              gap: 2.5,
            }}
          >
            {/* Tabs */}
            <Box sx={{ display: "flex", gap: 2, borderBottom: 1, borderColor: "divider", pb: 1.5 }}>
              <BaseSkeleton variant="rounded" width={110} height={36} sx={{ borderRadius: "8px" }} />
              <BaseSkeleton variant="rounded" width={140} height={36} sx={{ borderRadius: "8px" }} />
              <BaseSkeleton variant="rounded" width={150} height={36} sx={{ borderRadius: "8px" }} />
            </Box>

            {/* Tab content body */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, pt: 1 }}>
              <BaseSkeleton variant="text" width="95%" height={20} />
              <BaseSkeleton variant="text" width="90%" height={20} />
              <BaseSkeleton variant="text" width="85%" height={20} />
              <BaseSkeleton variant="text" width="70%" height={20} />
              <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
                <BaseSkeleton variant="rounded" width="100%" height={80} sx={{ borderRadius: "12px" }} />
                <BaseSkeleton variant="rounded" width="100%" height={80} sx={{ borderRadius: "12px" }} />
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Right Column (4 cols): Metadata Cards */}
        <Grid item xs={12} md={4}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {/* Contact Info Card */}
            <Card elevation={0} sx={{ borderRadius: "16px", border: "1px solid", borderColor: "divider", p: 2 }}>
              <CardContent sx={{ p: 1, display: "flex", flexDirection: "column", gap: 2 }}>
                <BaseSkeleton variant="text" width="55%" height={24} />
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <BaseSkeleton variant="circular" width={32} height={32} />
                  <BaseSkeleton variant="text" width="60%" height={18} />
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <BaseSkeleton variant="circular" width={32} height={32} />
                  <BaseSkeleton variant="text" width="50%" height={18} />
                </Box>
              </CardContent>
            </Card>

            {/* Activity & Metrics Card */}
            <Card elevation={0} sx={{ borderRadius: "16px", border: "1px solid", borderColor: "divider", p: 2 }}>
              <CardContent sx={{ p: 1, display: "flex", flexDirection: "column", gap: 2 }}>
                <BaseSkeleton variant="text" width="60%" height={24} />
                <BaseSkeleton variant="rounded" width="100%" height={60} sx={{ borderRadius: "10px" }} />
                <BaseSkeleton variant="rounded" width="100%" height={60} sx={{ borderRadius: "10px" }} />
              </CardContent>
            </Card>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ProfilePageSkeleton;
