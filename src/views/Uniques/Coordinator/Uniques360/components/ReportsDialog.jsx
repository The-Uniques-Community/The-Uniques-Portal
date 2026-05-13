import React from "react";
import {
  Avatar,
  Box,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Paper,
  Typography,
} from "@mui/material";

const ReportsDialog = ({ open, onClose, task, reports, loading }) => {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>
        {task ? `Reports for ${task.title}` : "Task Reports"}
      </DialogTitle>

      <DialogContent>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
            <CircularProgress />
          </Box>
        ) : Array.isArray(reports) && reports.length > 0 ? (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, py: 1 }}>
            {reports.map((report) => (
              <Paper key={report._id} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
                  <Avatar sx={{ bgcolor: "#ca0019" }}>
                    {report.studentId?.fullName?.[0] || "U"}
                  </Avatar>

                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      {report.studentId?.fullName || "Member"}
                    </Typography>

                    <Typography variant="caption" color="text.secondary">
                      {report.submissionDate
                        ? new Date(report.submissionDate).toLocaleString()
                        : "No date"}
                    </Typography>

                    <Typography sx={{ mt: 1 }}>{report.reportContent}</Typography>
                  </Box>
                </Box>
              </Paper>
            ))}
          </Box>
        ) : (
          <Typography sx={{ p: 2 }} color="text.secondary">
            No reports found for this task.
          </Typography>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ReportsDialog;