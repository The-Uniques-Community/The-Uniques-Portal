import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Avatar, Box, Chip, CircularProgress, Paper, Typography } from "@mui/material";
import HistoryIcon from '@mui/icons-material/History';
import ProgressIcon from '@mui/icons-material/QueryStats';

const ReportFeed = ({ reports, reportsLoading, scrollRef }) => {
  return (
    <Box 
      ref={scrollRef} 
      sx={{ 
        flexGrow: 1, 
        overflowY: "auto", 
        p: 3,
        backgroundColor: "background.default",
        position: "relative"
      }}
    >
      {/* Timeline Background Line */}
      {Array.isArray(reports) && reports.length > 0 && !reportsLoading && (
        <Box 
          sx={{ 
            position: "absolute",
            left: "44px",
            top: 24,
            bottom: 24,
            width: "2px",
            backgroundColor: "divider",
            zIndex: 0,
            display: { xs: "none", sm: "block" }
          }}
        />
      )}

      {reportsLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", p: 8 }}>
          <CircularProgress size={36} sx={{ color: "primary.main" }} />
        </Box>
      ) : Array.isArray(reports) && reports.length > 0 ? (
        <AnimatePresence>
          {reports.map((report) => (
            <motion.div 
              key={report._id} 
              initial={{ y: 15, opacity: 0 }} 
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              <Box 
                sx={{ 
                  display: "flex", 
                  gap: { xs: 1.5, sm: 2.5 }, 
                  mb: 3, 
                  position: "relative",
                  zIndex: 1 
                }}
              >
                {/* Premium Ring Avatar */}
                <Avatar 
                  sx={{ 
                    width: 40,
                    height: 40,
                    bgcolor: "background.drawer", 
                    color: "primary.main",
                    fontSize: "14px",
                    fontWeight: 700,
                    border: "2px solid",
                    borderColor: "primary.main",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
                  }}
                >
                  {report.studentId?.fullName?.[0]?.toUpperCase() || "U"}
                </Avatar>

                {/* Report Content Card */}
                <Paper 
                  elevation={0}
                  sx={{ 
                    p: 2.5, 
                    borderRadius: "12px", 
                    flexGrow: 1,
                    backgroundColor: "background.paper",
                    border: "1px solid",
                    borderColor: "divider",
                    transition: "transform 0.2s ease, border-color 0.2s ease",
                    "&:hover": {
                      borderColor: "action.disabled",
                      transform: "translateY(-1px)"
                    }
                  }}
                >
                  {/* Header Row */}
                  <Box 
                    sx={{ 
                      display: "flex", 
                      flexDirection: { xs: "column", sm: "row" },
                      alignItems: { xs: "flex-start", sm: "center" }, 
                      justifyContent: "space-between",
                      gap: 1,
                      mb: 1.5 
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
                      <Typography 
                        variant="subtitle2" 
                        sx={{ 
                          fontWeight: 600, 
                          color: "text.primary",
                          fontSize: "14px"
                        }}
                      >
                        {report.studentId?.fullName || "Member"}
                      </Typography>
                      
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          color: "text.subtext",
                          fontSize: "12px" 
                        }}
                      >
                        {report.submissionDate 
                          ? new Date(report.submissionDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + " • " + new Date(report.submissionDate).toLocaleDateString()
                          : "No date"
                        }
                      </Typography>
                    </Box>

                    {/* Styled Progress Metric Badge */}
                    {typeof report.progressPercent === "number" && (
                      <Chip
                        icon={<ProgressIcon style={{ fontSize: 14, color: "inherit" }} />}
                        label={`${report.progressPercent}% Completed`}
                        size="small"
                        sx={{ 
                          height: "24px",
                          fontSize: "11px",
                          fontWeight: 600,
                          backgroundColor: "action.hover",
                          color: "primary.main",
                          border: "1px solid",
                          borderColor: "divider",
                          borderRadius: "6px",
                          "& .MuiChip-icon": { ml: 0.5, mr: -0.5 }
                        }}
                      />
                    )}
                  </Box>

                  {/* Body Text */}
                  <Typography 
                    sx={{ 
                      color: "text.secondary", 
                      fontSize: "14.5px", 
                      lineHeight: 1.6,
                      whiteSpace: "pre-line" 
                    }}
                  >
                    {report.reportContent}
                  </Typography>
                </Paper>
              </Box>
            </motion.div>
          ))}
        </AnimatePresence>
      ) : (
        /* Empty State */
        <Box 
          sx={{ 
            display: "flex", 
            flexDirection: "column", 
            alignItems: "center", 
            justifyContent: "center", 
            height: "70vh", 
            textAlign: "center",
            px: 3
          }}
        >
          <Box 
            sx={{ 
              p: 2, 
              borderRadius: "50%", 
              backgroundColor: "action.hover", 
              mb: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <HistoryIcon sx={{ fontSize: 40, color: "text.subtext" }} />
          </Box>
          <Typography 
            variant="subtitle1" 
            sx={{ 
              fontWeight: 600, 
              color: "text.primary",
              mb: 0.5 
            }}
          >
            No reports recorded yet
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              color: "text.subtext", 
              maxWidth: 280 
            }}
          >
            Activity updates and milestone completions will be logged right here.
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default ReportFeed;