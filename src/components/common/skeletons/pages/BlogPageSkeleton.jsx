/**
 * @file BlogPageSkeleton.jsx
 * @description Pixel-accurate skeleton for the Blogs page.
 */

import React from "react";
import { Box, Container, Grid } from "@mui/material";
import BaseSkeleton from "../BaseSkeleton";
import { BlogCardSkeleton } from "../CardSkeleton";

const BlogPageSkeleton = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4, boxSizing: "border-box" }}>
      {/* Title */}
      <BaseSkeleton variant="text" width={180} height={40} sx={{ mb: 3 }} />

      {/* Actions Row */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4, flexWrap: "wrap", gap: 2 }}>
        <BaseSkeleton variant="rounded" width={160} height={40} sx={{ borderRadius: "8px" }} />
        <BaseSkeleton variant="rounded" width={250} height={40} sx={{ borderRadius: "8px" }} />
      </Box>

      {/* Grid of 6 Blog Cards */}
      <Grid container spacing={3}>
        {Array.from({ length: 6 }).map((_, idx) => (
          <Grid item xs={12} md={6} lg={4} key={idx}>
            <BlogCardSkeleton />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default BlogPageSkeleton;
