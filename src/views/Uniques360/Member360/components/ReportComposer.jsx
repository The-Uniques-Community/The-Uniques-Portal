import React from "react";
import { Box, CircularProgress, IconButton, Paper, TextField } from "@mui/material";
import { AttachFile as AttachIcon, Send as SendIcon } from "@mui/icons-material";

const ReportComposer = ({ selectedTask, newReport, setNewReport, progressPercent, setProgressPercent, sending, onSubmit }) => {
  return (
    <Box sx={{ p: 3, borderTop: "1px solid #eee" }}>
      <Paper sx={{ p: 2, display: "flex", flexDirection: "column", gap: 1.5 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <IconButton>
          <AttachIcon />
        </IconButton>

        <TextField
          fullWidth
          multiline
          maxRows={5}
          placeholder={`Share progress on #${selectedTask.title}`}
          variant="standard"
          InputProps={{ disableUnderline: true }}
          value={newReport}
          onChange={(e) => setNewReport(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onSubmit();
            }
          }}
        />

          <IconButton color="primary" onClick={onSubmit} disabled={(!newReport.trim() && progressPercent === "") || sending}>
            {sending ? <CircularProgress size={20} /> : <SendIcon />}
          </IconButton>
        </Box>

        <TextField
          label="Progress %"
          type="number"
          size="small"
          value={progressPercent}
          onChange={(e) => setProgressPercent(e.target.value)}
          inputProps={{ min: 0, max: 100 }}
          helperText="Optional. Use 0-100 to update task progress."
        />
      </Paper>
    </Box>
  );
};

export default ReportComposer;
