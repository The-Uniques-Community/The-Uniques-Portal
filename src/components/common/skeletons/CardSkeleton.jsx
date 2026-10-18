/**
 * @file CardSkeleton.jsx
 * @description Domain-specific card skeleton for Member, Trainer, and Event card grids.
 */

import React from "react";
import { Box, Paper } from "@mui/material";
import BaseSkeleton from "./BaseSkeleton";

const MemberCardItem = () => (
  <Paper
    elevation={0}
    sx={{
      width: "100%",
      maxWidth: 320,
      borderRadius: "16px",
      overflow: "hidden",
      border: "1px solid",
      borderColor: "divider",
      p: 2,
      display: "flex",
      flexDirection: "column",
      gap: 1.5,
    }}
  >
    {/* Avatar / Photo block */}
    <BaseSkeleton variant="rounded" width="100%" height={220} sx={{ borderRadius: "12px" }} />
    {/* Badge & Cohort pill */}
    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 0.5 }}>
      <BaseSkeleton variant="rounded" width={80} height={22} sx={{ borderRadius: "12px" }} />
      <BaseSkeleton variant="rounded" width={50} height={20} sx={{ borderRadius: "12px" }} />
    </Box>
    {/* Name line */}
    <BaseSkeleton variant="text" width="75%" height={26} />
    {/* Domain/Role line */}
    <BaseSkeleton variant="text" width="50%" height={20} />
    {/* Tags/Chips row */}
    <Box sx={{ display: "flex", gap: 1, mt: 0.5 }}>
      <BaseSkeleton variant="rounded" width={55} height={24} sx={{ borderRadius: "8px" }} />
      <BaseSkeleton variant="rounded" width={65} height={24} sx={{ borderRadius: "8px" }} />
      <BaseSkeleton variant="rounded" width={45} height={24} sx={{ borderRadius: "8px" }} />
    </Box>
  </Paper>
);

const TrainerCardItem = () => (
  <Paper
    elevation={0}
    sx={{
      width: "100%",
      borderRadius: "16px",
      overflow: "hidden",
      border: "1px solid",
      borderColor: "divider",
      p: 2.5,
      display: "flex",
      flexDirection: "column",
      gap: 1.5,
    }}
  >
    <BaseSkeleton variant="rounded" width="100%" height={240} sx={{ borderRadius: "12px" }} />
    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 0.5 }}>
      <BaseSkeleton variant="rounded" width={90} height={24} sx={{ borderRadius: "12px" }} />
    </Box>
    <BaseSkeleton variant="text" width="70%" height={28} />
    <BaseSkeleton variant="text" width="45%" height={20} />
    <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
      <BaseSkeleton variant="circular" width={32} height={32} />
      <BaseSkeleton variant="circular" width={32} height={32} />
      <BaseSkeleton variant="circular" width={32} height={32} />
    </Box>
  </Paper>
);

const EventCardItem = () => (
  <Paper
    elevation={0}
    sx={{
      width: "100%",
      borderRadius: "16px",
      overflow: "hidden",
      border: "1px solid",
      borderColor: "divider",
      p: 2,
      display: "flex",
      flexDirection: "column",
      gap: 1.5,
    }}
  >
    {/* 16:9 Banner */}
    <BaseSkeleton variant="rounded" width="100%" height={180} sx={{ borderRadius: "12px" }} />
    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 0.5 }}>
      <BaseSkeleton variant="rounded" width={75} height={22} sx={{ borderRadius: "12px" }} />
      <BaseSkeleton variant="text" width={60} height={20} />
    </Box>
    <BaseSkeleton variant="text" width="85%" height={26} />
    <BaseSkeleton variant="text" width="95%" height={18} />
    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 1 }}>
      <BaseSkeleton variant="text" width="40%" height={20} />
      <BaseSkeleton variant="rounded" width={80} height={32} sx={{ borderRadius: "8px" }} />
    </Box>
  </Paper>
);

/**
 * CardSkeleton
 * @param {Object} props
 * @param {'member'|'trainer'|'event'} [props.type='member']
 * @param {number} [props.count=1]
 * @param {string} [props.className]
 */
const CardSkeleton = ({ type = "member", count = 1, className = "" }) => {
  const items = Array.from({ length: count });

  const renderItem = () => {
    switch (type) {
      case "trainer":
        return <TrainerCardItem />;
      case "event":
        return <EventCardItem />;
      case "member":
      default:
        return <MemberCardItem />;
    }
  };

  if (count === 1) {
    return <Box className={className}>{renderItem()}</Box>;
  }

  return (
    <Box
      className={
        className ||
        "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full place-items-center"
      }
    >
      {items.map((_, idx) => (
        <React.Fragment key={idx}>{renderItem()}</React.Fragment>
      ))}
    </Box>
  );
};

export default CardSkeleton;
