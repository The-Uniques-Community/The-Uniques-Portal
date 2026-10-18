import * as React from "react";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { Box, Paper, Typography, useTheme } from "@mui/material";
import { alpha } from "@mui/material/styles";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";

export default function Calender() {
  const theme = useTheme();

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: "16px",
        border: "1px solid",
        borderColor: "divider",
        overflow: "hidden",
        bgcolor: "background.paper",
        boxShadow: `0 14px 40px ${alpha("#000", theme.palette.mode === "dark" ? 0.28 : 0.08)}`,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, p: 2.25, pb: 0.5 }}>
        <Box
          sx={{
            width: 34,
            height: 34,
            borderRadius: "8px",
            display: "grid",
            placeItems: "center",
            color: "primary.main",
            bgcolor: alpha(theme.palette.primary.main, 0.11),
          }}
        >
          <CalendarMonthOutlinedIcon fontSize="small" />
        </Box>
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "text.primary", lineHeight: 1.15 }}>
            Calendar
          </Typography>
          <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>
            Monthly event rhythm
          </Typography>
        </Box>
      </Box>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DateCalendar
          sx={{
            width: "100%",
            maxHeight: 346,
            "& .MuiPickersCalendarHeader-root": { px: 2.25 },
            "& .MuiPickersCalendarHeader-label": { fontWeight: 800, color: "text.primary" },
            "& .MuiDayCalendar-weekDayLabel": { fontWeight: 800, color: "text.secondary" },
            "& .MuiPickersDay-root": {
              fontWeight: 600,
              borderRadius: "8px",
              "&.Mui-selected": {
                bgcolor: "primary.main",
                color: "primary.contrastText",
              },
            },
          }}
        />
      </LocalizationProvider>
    </Paper>
  );
}
