import React from "react";
import { createPortal } from "react-dom";
import { Box, Typography, LinearProgress } from "@mui/material";
import { useThemeContext } from "../../theme/ThemeProvider";
import logoCommunity from "../../assets/logos/theuniquesCommunity.png";
import logoWhite from "../../assets/logos/uniqueswhite.png";

const CustomLoader = () => {
  const { isDarkMode } = useThemeContext();

  return createPortal(
    <Box sx={{ 
      fixed: "inset-0",
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 9999,
      display: 'flex', 
      flexDirection: 'column',
      justifyContent: 'center', 
      alignItems: 'center',
      bgcolor: isDarkMode ? "#121212" : "#ffffff",
      gap: 3
    }}>
      <Box 
        component="img" 
        src={isDarkMode ? logoWhite : logoCommunity} 
        alt="The Uniques Logo"
        sx={{ height: isDarkMode ? 70 : 90, mb: 1, filter: isDarkMode ? "none" : "drop-shadow(0px 2px 4px rgba(0,0,0,0.1))" }}
      />
      <Box sx={{ width: '320px' }}>
        <LinearProgress sx={{ 
          height: 3, 
          borderRadius: 1,
          bgcolor: isDarkMode ? "#333" : "#f0f0f0",
          "& .MuiLinearProgress-bar": { bgcolor: "#ca0019" }
        }} />
      </Box>
      <Typography variant="caption" sx={{ color: "text.secondary", letterSpacing: 2, fontWeight: "medium", textTransform: "uppercase" }}>
        Preparing Your Workspace
      </Typography>
    </Box>,
    document.body
  );
};

export default CustomLoader;
