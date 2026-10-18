/**
 * @file TopBarProgress.jsx
 * @description Slim 3px fixed-top indeterminate progress bar for seamless route transitions and background fetches.
 */

import React from "react";
import { Box, LinearProgress } from "@mui/material";

const TopBarProgress = () => {
  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 99999,
        pointerEvents: "none",
      }}
    >
      <LinearProgress
        sx={{
          height: 3,
          backgroundColor: "transparent",
          "& .MuiLinearProgress-bar": {
            backgroundColor: "#ca0019",
            backgroundImage: "linear-gradient(90deg, #ca0019 0%, #ff4d67 50%, #ca0019 100%)",
          },
        }}
      />
    </Box>
  );
};

export default TopBarProgress;
