/**
 * @file CardSkeleton.jsx
 * @description Domain-specific card skeletons shaped and positioned exactly as Member, Trainer, Event, and Blog cards.
 */

import React from "react";
import { Box, Paper } from "@mui/material";
import BaseSkeleton from "./BaseSkeleton";

export const MemberCardSkeleton = () => (
  <Paper
    elevation={0}
    sx={{
      width: "100%",
      borderRadius: "12px",
      border: "1px solid",
      borderColor: "divider",
      p: 2.5,
      display: "flex",
      flexDirection: "column",
      gap: 2,
      bgcolor: "background.paper",
      boxSizing: "border-box",
    }}
  >
    {/* Header: Status pill on left, actions on right */}
    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <BaseSkeleton variant="rounded" width={68} height={22} sx={{ borderRadius: "12px" }} />
      <Box sx={{ display: "flex", gap: 1 }}>
        <BaseSkeleton variant="circular" width={26} height={26} />
        <BaseSkeleton variant="circular" width={26} height={26} />
      </Box>
    </Box>

    {/* Avatar + Name + Bio */}
    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
      <BaseSkeleton variant="circular" width={64} height={64} sx={{ flexShrink: 0 }} />
      <Box sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 0.75 }}>
        <BaseSkeleton variant="text" width="70%" height={22} />
        <BaseSkeleton variant="text" width="90%" height={16} />
      </Box>
    </Box>

    {/* Social Media Links (4 circular 40x40 icon buttons) */}
    <Box sx={{ display: "flex", gap: 1.5, my: 0.5 }}>
      <BaseSkeleton variant="circular" width={40} height={40} />
      <BaseSkeleton variant="circular" width={40} height={40} />
      <BaseSkeleton variant="circular" width={40} height={40} />
      <BaseSkeleton variant="circular" width={40} height={40} />
    </Box>

    {/* View Details Button */}
    <BaseSkeleton variant="rounded" width="100%" height={38} sx={{ borderRadius: "8px", mt: "auto" }} />
  </Paper>
);

export const TrainerCardSkeleton = () => (
  <Paper
    elevation={0}
    sx={{
      width: "100%",
      borderRadius: "12px",
      border: "1px solid",
      borderColor: "divider",
      p: 2.5,
      display: "flex",
      flexDirection: "column",
      gap: 2,
      bgcolor: "background.paper",
      boxSizing: "border-box",
    }}
  >
    {/* Header: Batch badge on left, status on right */}
    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <BaseSkeleton variant="rounded" width={80} height={22} sx={{ borderRadius: "12px" }} />
      <BaseSkeleton variant="rounded" width={60} height={22} sx={{ borderRadius: "12px" }} />
    </Box>

    {/* Avatar + Trainer Details */}
    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
      <BaseSkeleton variant="circular" width={64} height={64} sx={{ flexShrink: 0 }} />
      <Box sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 0.75 }}>
        <BaseSkeleton variant="text" width="70%" height={22} />
        <BaseSkeleton variant="text" width="90%" height={16} />
      </Box>
    </Box>

    {/* Social Media Links (4 circular 40x40 buttons) */}
    <Box sx={{ display: "flex", gap: 1.5, my: 0.5 }}>
      <BaseSkeleton variant="circular" width={40} height={40} />
      <BaseSkeleton variant="circular" width={40} height={40} />
      <BaseSkeleton variant="circular" width={40} height={40} />
      <BaseSkeleton variant="circular" width={40} height={40} />
    </Box>

    {/* View Details Button */}
    <BaseSkeleton variant="rounded" width="100%" height={38} sx={{ borderRadius: "8px", mt: "auto" }} />
  </Paper>
);

export const EventCardSkeleton = () => (
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
      bgcolor: "background.paper",
      boxSizing: "border-box",
    }}
  >
    {/* 16:9 Banner */}
    <BaseSkeleton variant="rounded" width="100%" height={180} sx={{ borderRadius: "12px" }} />
    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 0.5 }}>
      <BaseSkeleton variant="rounded" width={75} height={22} sx={{ borderRadius: "12px" }} />
      <BaseSkeleton variant="text" width={60} height={20} />
    </Box>
    <BaseSkeleton variant="text" width="85%" height={24} />
    <BaseSkeleton variant="text" width="95%" height={16} />
    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 1 }}>
      <BaseSkeleton variant="text" width="40%" height={20} />
      <BaseSkeleton variant="rounded" width={80} height={32} sx={{ borderRadius: "8px" }} />
    </Box>
  </Paper>
);

export const BlogCardSkeleton = () => (
  <Paper
    elevation={0}
    sx={{
      width: "100%",
      height: "100%",
      borderRadius: "12px",
      overflow: "hidden",
      border: "1px solid",
      borderColor: "divider",
      display: "flex",
      flexDirection: "column",
      bgcolor: "background.paper",
      boxSizing: "border-box",
    }}
  >
    <BaseSkeleton variant="rectangular" width="100%" height={140} />
    <Box sx={{ p: 2.5, display: "flex", flexDirection: "column", gap: 1.5, flexGrow: 1 }}>
      <BaseSkeleton variant="rounded" width={70} height={20} sx={{ borderRadius: "10px" }} />
      <BaseSkeleton variant="text" width="85%" height={24} />
      <BaseSkeleton variant="text" width="100%" height={16} />
      <BaseSkeleton variant="text" width="60%" height={16} />
      <Box sx={{ display: "flex", gap: 1, mt: "auto", pt: 1 }}>
        <BaseSkeleton variant="rounded" width={50} height={20} sx={{ borderRadius: "8px" }} />
        <BaseSkeleton variant="rounded" width={60} height={20} sx={{ borderRadius: "8px" }} />
      </Box>
    </Box>
  </Paper>
);

/**
 * CardSkeleton
 * @param {Object} props
 * @param {'member'|'trainer'|'event'|'blog'} [props.type='member']
 * @param {number} [props.count=1]
 * @param {string} [props.className]
 */
const CardSkeleton = ({ type = "member", count = 1, className = "" }) => {
  const items = Array.from({ length: count });

  const renderItem = () => {
    switch (type) {
      case "trainer":
        return <TrainerCardSkeleton />;
      case "event":
        return <EventCardSkeleton />;
      case "blog":
        return <BlogCardSkeleton />;
      case "member":
      default:
        return <MemberCardSkeleton />;
    }
  };

  if (count === 1) {
    return <Box className={className}>{renderItem()}</Box>;
  }

  return (
    <Box
      className={
        className ||
        "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full"
      }
    >
      {items.map((_, idx) => (
        <React.Fragment key={idx}>{renderItem()}</React.Fragment>
      ))}
    </Box>
  );
};

export default CardSkeleton;
