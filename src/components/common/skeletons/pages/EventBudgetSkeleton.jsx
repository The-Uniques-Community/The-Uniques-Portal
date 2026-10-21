/**
 * @file EventBudgetSkeleton.jsx
 * @description Pixel-accurate skeleton for Event Budget Management.
 */

import React from "react";
import { Box, Card, CardContent, Grid, Paper } from "@mui/material";
import BaseSkeleton from "../BaseSkeleton";
import TableSkeleton from "../TableSkeleton";

const EventBudgetSkeleton = () => {
  return (
    <Box sx={{ width: "100%", p: 3, boxSizing: "border-box" }}>
      {/* Header with actions */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          mb: 3,
          gap: 2,
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <BaseSkeleton variant="rounded" width={110} height={32} sx={{ borderRadius: "6px" }} />
          <BaseSkeleton variant="text" width={280} height={38} />
          <BaseSkeleton variant="text" width={180} height={20} />
          <BaseSkeleton variant="text" width={120} height={16} />
        </Box>
        <Box sx={{ display: "flex", gap: 1.5 }}>
          <BaseSkeleton variant="rounded" width={150} height={40} sx={{ borderRadius: "8px" }} />
          <BaseSkeleton variant="rounded" width={140} height={40} sx={{ borderRadius: "8px" }} />
        </Box>
      </Box>

      {/* 3 Budget Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {Array.from({ length: 3 }).map((_, idx) => (
          <Grid item xs={12} md={4} key={idx}>
            <Card elevation={0} sx={{ borderRadius: 2, border: "1px solid", borderColor: "divider" }}>
              <CardContent sx={{ p: 2.5, display: "flex", flexDirection: "column", gap: 1.5 }}>
                <BaseSkeleton variant="text" width="60%" height={18} />
                <BaseSkeleton variant="text" width="50%" height={36} />
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 1 }}>
                  <BaseSkeleton variant="rounded" width={70} height={22} sx={{ borderRadius: "10px" }} />
                  <BaseSkeleton variant="text" width="30%" height={16} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Tabs Row */}
      <Box sx={{ display: "flex", gap: 2, borderBottom: 1, borderColor: "divider", pb: 1.5, mb: 3 }}>
        <BaseSkeleton variant="rounded" width={100} height={36} sx={{ borderRadius: "8px" }} />
        <BaseSkeleton variant="rounded" width={120} height={36} sx={{ borderRadius: "8px" }} />
        <BaseSkeleton variant="rounded" width={130} height={36} sx={{ borderRadius: "8px" }} />
        <BaseSkeleton variant="rounded" width={90} height={36} sx={{ borderRadius: "8px" }} />
      </Box>

      {/* Budget Table */}
      <TableSkeleton rows={5} columns={6} />
    </Box>
  );
};

export default EventBudgetSkeleton;
