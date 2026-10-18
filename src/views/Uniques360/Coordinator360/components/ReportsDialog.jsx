import React from "react";
import {
  Avatar,
  Box,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Paper,
  Typography,
} from "@mui/material";
import ReportIcon from '@mui/icons-material/AssignmentOutlined';
import TimeIcon from '@mui/icons-material/AccessTimeOutlined';

const ReportsDialog = ({ open, onClose, task, reports, loading }) => {
  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      fullWidth 
      maxWidth="md"
      PaperProps={{
        sx: {
          borderRadius: "14px",
          backgroundColor: "background.paper",
          backgroundImage: "none",
          border: "1px solid",
          borderColor: "divider",
          p: 1,
        }
      }}
    >
      <DialogTitle 
        sx={{ 
          pb: 1.5, 
          fontSize: "19px", 
          fontWeight: 700,
          color: "text.primary" 
        }}
      >
        {task ? `Activity Log: ${task.title}` : "Task Activity Reports"}
      </DialogTitle>

      <DialogContent sx={{ minHeight: "200px" }}>
        {loading ? (
          /* Loading Overlay State */
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 8 }}>
            <CircularProgress size={36} sx={{ color: "primary.main" }} />
          </Box>
        ) : Array.isArray(reports) && reports.length > 0 ? (
          /* Active Scrollable Stream List Container */
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, py: 1 }}>
            {reports.map((report) => (
              <Paper 
                key={report._id} 
                variant="outlined" 
                sx={{ 
                  p: 2.5, 
                  borderRadius: "10px",
                  borderColor: "divider",
                  backgroundColor: "background.default"
                }}
              >
                <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
                  {/* Dynamic Adaptive Avatar Badge */}
                  <Avatar 
                    sx={{ 
                      width: 36, 
                      height: 36, 
                      fontSize: "13px", 
                      fontWeight: 700, 
                      bgcolor: "primary.main", 
                      color: "primary.light" 
                    }}
                  >
                    {report.studentId?.fullName?.[0]?.toUpperCase() || "M"}
                  </Avatar>

                  <Box sx={{ flexGrow: 1 }}>
                    {/* Header Row Meta Layer */}
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 2, flexWrap: "wrap", mb: 1 }}>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: "14px", color: "text.primary" }}>
                          {report.studentId?.fullName || "Team Member"}
                        </Typography>
                        
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.25, color: "text.subtext" }}>
                          <TimeIcon sx={{ fontSize: 13 }} />
                          <Typography variant="caption" sx={{ fontSize: "11.5px", fontWeight: 500 }}>
                            {report.submissionDate
                              ? new Date(report.submissionDate).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })
                              : "Timestamp unavailable"}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Highlighted Progress Tracker Tag */}
                      {typeof report.progressPercent === "number" && (
                        <Chip
                          label={`${report.progressPercent}% Target Progress`}
                          size="small"
                          sx={{ 
                            height: "24px",
                            borderRadius: "4px",
                            fontSize: "11px",
                            fontWeight: 600,
                            borderColor: "divider",
                            backgroundColor: "action.hover",
                            color: "text.primary"
                          }}
                          variant="outlined"
                        />
                      )}
                    </Box>

                    {/* Main Text Content Frame */}
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        mt: 1.5, 
                        lineHeight: 1.6, 
                        color: "text.secondary",
                        fontSize: "13.5px",
                        letterSpacing: "0.1px",
                        whiteSpace: "pre-line"
                      }}
                    >
                      {report.reportContent}
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            ))}
          </Box>
        ) : (
          /* Empty Feed Visual State Component Placeholder */
          <Box 
            sx={{ 
              display: "flex", 
              flexDirection: "column", 
              alignItems: "center", 
              justifyContent: "center", 
              py: 6,
              gap: 1.5 
            }}
          >
            <Box 
              sx={{ 
                p: 2, 
                borderRadius: "50%", 
                backgroundColor: "action.hover",
                border: "1px dashed",
                borderColor: "divider",
                color: "text.subtext",
                display: "inline-flex"
              }}
            >
              <ReportIcon sx={{ fontSize: 26 }} />
            </Box>
            <Typography variant="body2" sx={{ color: "text.secondary", fontWeight: 500 }}>
              No status logs have been posted for this task yet.
            </Typography>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ReportsDialog;