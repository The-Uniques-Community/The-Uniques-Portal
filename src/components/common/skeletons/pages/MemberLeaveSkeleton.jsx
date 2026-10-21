/**
 * @file MemberLeaveSkeleton.jsx
 * @description Pixel-accurate skeleton for the Member Leave Management page.
 */

import React from "react";
import { Box, Card, CardContent, Container, Grid } from "@mui/material";
import BaseSkeleton from "../BaseSkeleton";
import TableSkeleton from "../TableSkeleton";

const MemberLeaveSkeleton = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4, boxSizing: "border-box" }}>
      {/* ModernHeader Skeleton */}
      <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <BaseSkeleton variant="text" width={260} height={38} />
          <BaseSkeleton variant="text" width={380} height={20} />
        </Box>
        <BaseSkeleton variant="rounded" width={180} height={40} sx={{ borderRadius: "8px" }} />
      </Box>

      {/* 4 Leave Statistics Cards */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {Array.from({ length: 4 }).map((_, idx) => (
          <Grid item xs={12} sm={6} md={3} key={idx}>
            <Card elevation={0} sx={{ borderRadius: 2, border: "1px solid", borderColor: "divider" }}>
              <CardContent sx={{ p: 2.5, display: "flex", flexDirection: "column", gap: 1 }}>
                <BaseSkeleton variant="text" width="60%" height={16} />
                <BaseSkeleton variant="text" width="30%" height={32} />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* ModernTable (7 columns) */}
      <TableSkeleton rows={5} columns={7} />
    </Container>
  );
};

export default MemberLeaveSkeleton;
