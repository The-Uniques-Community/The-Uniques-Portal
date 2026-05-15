import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Avatar, Box, Chip, CircularProgress, Paper, Typography } from "@mui/material";
import { History as HistoryIcon } from "@mui/icons-material";

const ReportFeed = ({ reports, reportsLoading, scrollRef }) => {
  return (
    <Box ref={scrollRef} sx={{ flexGrow: 1, overflowY: "auto", p: 3 }}>
      {reportsLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 5 }}>
          <CircularProgress />
        </Box>
      ) : Array.isArray(reports) && reports.length > 0 ? (
        <AnimatePresence>
          {reports.map((report) => (
            <motion.div key={report._id} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
              <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
                <Avatar sx={{ bgcolor: "#ca0019" }}>{report.studentId?.fullName?.[0] || "U"}</Avatar>
                <Paper sx={{ p: 2, borderRadius: 3, flexGrow: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    {report.studentId?.fullName || "Member"}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {report.submissionDate ? new Date(report.submissionDate).toLocaleString() : "No date"}
                  </Typography>
                  {typeof report.progressPercent === "number" && (
                    <Chip
                      label={`${report.progressPercent}% progress`}
                      size="small"
                      color="primary"
                      variant="outlined"
                      sx={{ ml: 1 }}
                    />
                  )}
                  <Typography sx={{ mt: 1 }}>{report.reportContent}</Typography>
                </Paper>
              </Box>
            </motion.div>
          ))}
        </AnimatePresence>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", opacity: 0.4 }}>
          <HistoryIcon sx={{ fontSize: 80 }} />
          <Typography variant="h6">No Reports Yet</Typography>
        </Box>
      )}
    </Box>
  );
};

export default ReportFeed;
