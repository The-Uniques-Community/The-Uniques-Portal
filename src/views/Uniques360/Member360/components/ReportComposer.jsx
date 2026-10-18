import React, { useRef } from "react";
import { Box, CircularProgress, IconButton, Paper, TextField, InputAdornment, Typography } from "@mui/material";
import SendIcon from '@mui/icons-material/Send';
import ProgressIcon from '@mui/icons-material/QueryStats';

const ReportComposer = ({ selectedTask, newReport, setNewReport, progressPercent, setProgressPercent, sending, onSubmit }) => {
  const fileInputRef = useRef(null);

  const handleAttachClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log("Selected file:", file);
    }
  };

  return (
    <Box 
      sx={{ 
        p: 2.5, 
        borderTop: "1px solid", 
        borderColor: "divider",
        backgroundColor: "background.default"
      }}
    >
      <Paper 
        elevation={0} 
        sx={{ 
          p: 2, 
          display: "flex", 
          flexDirection: "column", 
          gap: 2, 
          borderRadius: "12px",
          border: "1px solid",
          borderColor: "divider",
          backgroundColor: "background.paper",
          transition: "border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
          "&:focus-within": {
            borderColor: "primary.main",
            boxShadow: (theme) => `0 0 0 1px ${theme.palette.primary.main}`,
          }
        }}
      >
        {/* Input Text Area */}
        <Box sx={{ display: "flex", alignItems: "flex-start", width: "100%" }}>
          <TextField
            fullWidth
            multiline
            minRows={2}
            maxRows={6}
            placeholder={`Share progress on #${selectedTask?.title || "task"}`}
            variant="standard"
            InputProps={{ 
              disableUnderline: true,
              style: { 
                fontSize: "15px",
                lineHeight: "1.5",
              }
            }}
            value={newReport}
            onChange={(e) => setNewReport(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                if (newReport.trim() || progressPercent !== "") onSubmit();
              }
            }}
            sx={{
              "& .MuiInputBase-input::placeholder": {
                color: "text.subtext",
                opacity: 1,
              }
            }}
          />
        </Box>

        {/* Action / Meta Footer Bar */}
        <Box 
          sx={{ 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "space-between",
            pt: 1.5,
            borderTop: "1px solid",
            borderColor: "divider"
          }}
        >
          {/* Left Side: Controls & Metric Inline inputs */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            {/* Attachment Button */}
            <input type="file" ref={fileInputRef} style={{ display: "none" }} onChange={handleFileChange} />
            {/* <IconButton 
              onClick={handleAttachClick}
              size="small"
              sx={{
                color: "text.secondary",
                border: "1px solid",
                borderColor: "divider",
                borderRadius: "6px",
                padding: "6px",
                transition: "all 0.15s ease-in-out",
                "&:hover": {
                  backgroundColor: "action.hover",
                  color: "text.primary",
                }
              }}
            >
              <AttachIcon fontSize="small" />
            </IconButton> */}

            {/* Inline Premium Progress Input */}
            <TextField
              type="number"
              size="small"
              placeholder="Prog %"
              value={progressPercent}
              onChange={(e) => {
                const val = e.target.value;
                if (val === "" || (Number(val) >= 0 && Number(val) <= 100)) {
                  setProgressPercent(val);
                }
              }}
              InputProps={{
                disableUnderline: true,
                startAdornment: (
                  <InputAdornment position="start" sx={{ color: "text.subtext", mr: 0.5 }}>
                    <ProgressIcon sx={{ fontSize: 16 }} />
                  </InputAdornment>
                ),
                endAdornment: progressPercent !== "" && (
                  <InputAdornment position="end">
                    <Typography variant="caption" sx={{ color: "text.subtext", fontWeight: 600 }}>%</Typography>
                  </InputAdornment>
                ),
                style: {
                  fontSize: "13px",
                  height: "30px",
                  padding: "0 8px",
                }
              }}
              variant="standard"
              sx={{
                width: "95px",
                border: "1px solid",
                borderColor: "divider",
                borderRadius: "6px",
                backgroundColor: "background.default",
                transition: "all 0.15s ease-in-out",
                "&:focus-within": {
                  borderColor: "action.disabled",
                  backgroundColor: "action.focus"
                },
                "& input[::-webkit-outer-spin-button], & input[::-webkit-inner-spin-button]": {
                  "-webkit-appearance": "none",
                  margin: 0,
                },
                "& input[type=number]": {
                  "-moz-appearance": "textfield",
                },
              }}
            />
          </Box>

          {/* Right Side: Send Trigger */}
          <IconButton 
            onClick={onSubmit} 
            disabled={(!newReport.trim() && progressPercent === "") || sending}
            size="small"
            sx={{
              backgroundColor: "primary.main",
              color: "primary.light",
              borderRadius: "8px",
              padding: "8px 12px",
              transition: "all 0.15s ease-in-out",
              "&:hover": {
                backgroundColor: "primary.main",
                opacity: 0.9,
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
              },
              "&.Mui-disabled": {
                backgroundColor: "action.disabled",
                color: "text.disabled"
              }
            }}
          >
            {sending ? (
              <CircularProgress size={18} color="inherit" />
            ) : (
              <SendIcon sx={{ fontSize: 18 }} />
            )}
          </IconButton>
        </Box>
      </Paper>
    </Box>
  );
};

export default ReportComposer;