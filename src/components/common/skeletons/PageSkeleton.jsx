/**
 * @file PageSkeleton.jsx
 * @description Comprehensive page-level skeleton used for route transitions and lazy component fallbacks.
 */

import React from "react";
import { Box, Container } from "@mui/material";
import TopBarProgress from "../loaders/TopBarProgress";
import BaseSkeleton from "./BaseSkeleton";
import CardSkeleton from "./CardSkeleton";

/**
 * PageSkeleton
 * @param {Object} props
 * @param {'cards'|'table'|'simple'} [props.variant='cards']
 */
const PageSkeleton = ({ variant = "cards" }) => {
  return (
    <Box sx={{ width: "100%", minHeight: "80vh", py: { xs: 4, md: 8 } }}>
      <TopBarProgress />
      <Container maxWidth="xl">
        {/* Header Breadcrumb & Title */}
        <Box sx={{ mb: 4, display: "flex", flexDirection: "column", gap: 1.5 }}>
          <BaseSkeleton variant="rounded" width={100} height={24} sx={{ borderRadius: "12px" }} />
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
            <Box sx={{ width: { xs: "100%", md: "50%" } }}>
              <BaseSkeleton variant="text" width="60%" height={40} />
              <BaseSkeleton variant="text" width="85%" height={22} />
            </Box>
            <Box sx={{ display: "flex", gap: 1.5 }}>
              <BaseSkeleton variant="rounded" width={120} height={40} sx={{ borderRadius: "8px" }} />
              <BaseSkeleton variant="rounded" width={120} height={40} sx={{ borderRadius: "8px" }} />
            </Box>
          </Box>
        </Box>

        {/* Content Section */}
        {variant === "cards" && (
          <CardSkeleton type="member" count={8} />
        )}
      </Container>
    </Box>
  );
};

export default PageSkeleton;
