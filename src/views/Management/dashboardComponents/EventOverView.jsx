/**
 * @file EventOverView.jsx
 * @description Compact preview card displaying essential event details and lifecycle status for the Management Dashboard.
 * @architecture Rendered inside the Management Dashboard (`views/Management/Dashboard`) event list feed; receives individual event objects retrieved via `eventService`.
 * @agent_note Supports diverse event statuses ('upcoming', 'ongoing', 'completed') with reactive color tags and truncates descriptions to preserve compact card layouts.
 */

import React from "react";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import ScheduleOutlinedIcon from "@mui/icons-material/ScheduleOutlined";
import BeenhereIcon from '@mui/icons-material/Beenhere';
import HourglassBottomIcon from '@mui/icons-material/HourglassBottom';
import Tooltip from '@mui/material/Tooltip';
import UpcomingIcon from '@mui/icons-material/Upcoming';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import Chip from '@mui/material/Chip';
import { useTheme } from "@mui/material/styles";
import { alpha } from "@mui/material/styles";
import { Box, Typography } from "@mui/material";

/**
 * @component EventOverView
 * @description Renders a card displaying event meta information including title, status badges, date, time, venue, and organizer batch.
 * @param {Object} props - Component properties.
 * @param {Object} props.event - The event data object.
 * @param {string} [props.event.eventName] - Name or title of the event.
 * @param {string} [props.event.eventStatus] - Current status ('upcoming' | 'ongoing' | 'completed').
 * @param {string} [props.event.eventType] - Categorization of the event.
 * @param {string|Date} [props.event.eventDate] - Date string or Date object for the scheduled event.
 * @param {string} [props.event.eventTime] - Time string of the event.
 * @param {string} [props.event.eventVenue] - Physical or virtual location of the event.
 * @param {string} [props.event.eventOrganizerBatch] - Batch code of the student organizers.
 * @param {string} [props.event.eventDescription] - Short description summary of the event.
 * @state None - Pure presentation component reading theme tokens.
 * @api None - No direct API calls initiated.
 */
const EventOverView = ({ event }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  // Destructure event properties with defaults
  const {
    eventStatus = "upcoming",
    eventName = "",
    eventDescription = "",
    eventDate,
    eventTime,
    eventVenue,
    eventOrganizerBatch,
    eventType
  } = event || {};

  /**
   * @desc Formats an ISO date string or Date instance into a standard YYYY-MM-DD display representation.
   * @param {string|Date} dateString - Input date to format.
   * @returns {string} Formatted date string (YYYY-MM-DD) or empty string if invalid.
   */
  const formatDateForInput = (dateString) => {
    if (!dateString) return "";

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";

    return date.toISOString().split("T")[0]; // Returns YYYY-MM-DD
  };

  return (
    <Box
      sx={{
        position: "relative",
        width: "96%",
        mx: "auto",
        my: 1.25,
        p: 2,
        overflow: "hidden",
        borderRadius: "14px",
        border: "1px solid",
        borderColor: "divider",
        background:
          theme.palette.mode === "dark"
            ? alpha(theme.palette.background.paper, 0.72)
            : `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${alpha(theme.palette.primary.main, 0.035)} 100%)`,
        boxShadow: `0 10px 30px ${alpha("#000", isDark ? 0.22 : 0.06)}`,
        transition: "all 0.2s ease",
        "&:hover": {
          transform: "translateY(-2px)",
          borderColor: alpha(theme.palette.primary.main, 0.45),
          boxShadow: `0 16px 34px ${alpha(theme.palette.primary.main, 0.14)}`,
        },
      }}
    >
      <Box
        sx={{
          position: "absolute",
          bottom: 0,
          right: 0,
          color: "white",
          bgcolor: "primary.main",
          px: 1.2,
          py: 0.35,
          fontSize: 11,
          fontWeight: 800,
          borderTopLeftRadius: "8px",
        }}
      >
        Event
      </Box>
      
      {/* Status indicator */}
      <div className="flex justify-between items-start gap-2">
        {eventType && (
          <Chip 
            label={eventType}
            size="small"
            style={{
              backgroundColor: isDark ? "rgba(33, 150, 243, 0.15)" : "#e3f2fd",
              color: isDark ? "#90caf9" : "#1976d2"
            }}
            className="text-xs"
          />
        )}
        <div>
          {eventStatus === "upcoming" ? (
            <div className="flex items-center gap-x-1">
              <UpcomingIcon sx={{ fontSize: 10, fontWeight: 500, color: '#dc2626' }} />
              <p className="text-xs font-medium text-red-600">Upcoming</p>
            </div>
          ) : eventStatus === "ongoing" ? (
            <div className="flex items-center gap-x-1">
              <HourglassBottomIcon sx={{ fontSize: 10, fontWeight: 500, color: '#f59e0b' }} />
              <p className="text-xs font-medium text-amber-600">Ongoing</p>
            </div>
          ) : (
            <div className="flex items-center gap-x-1">
              <BeenhereIcon sx={{ fontSize: 10, fontWeight: 500, color: '#16a34a' }} />
              <p className="text-xs text-green-600">Completed</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Event name with tooltip */}
      <div className="mt-3">
        <Tooltip title={eventName} arrow>
          <Typography
            variant="h6"
            sx={{
              color: "text.primary",
              fontSize: "1.05rem",
              fontWeight: 900,
              display: "flex",
              alignItems: "center",
              gap: 1,
              lineHeight: 1.25,
            }}
          >
            <span className={`inline-block w-3 h-3 rounded-full ${
              eventStatus === 'upcoming' ? 'bg-[#ca0019]' : 
              eventStatus === 'ongoing' ? 'bg-amber-500' : 
              'bg-green-600'
            }`}></span>
            {eventName ? 
              (eventName.length > 20 ? eventName.slice(0, 16) + "..." : eventName) : 
              "Can't Load Name"}
          </Typography>
        </Tooltip>
        
        {/* Brief description if available */}
        {eventDescription && (
          <p 
            style={{ color: theme.palette.text.secondary }}
            className="text-xs ps-7 mb-1"
          >
            {eventDescription.length > 45 ? eventDescription.slice(0, 45) + "..." : eventDescription}
          </p>
        )}
      </div>
      
      {/* Event details - row 1 */}
      <div className="flex flex-wrap justify-start gap-x-5 items-center px-3 py-2">
        <div className="flex items-center gap-x-1">
          <CalendarMonthOutlinedIcon sx={{ fontSize: 14, color: theme.palette.text.secondary }} />
          <p style={{ color: theme.palette.text.secondary }} className="text-sm">{formatDateForInput(eventDate)}</p>
        </div>
        {eventTime && (
          <div className="flex items-center gap-x-1">
            <ScheduleOutlinedIcon sx={{ fontSize: 14, color: theme.palette.text.secondary }} />
            <p style={{ color: theme.palette.text.secondary }} className="text-sm">{eventTime}</p>
          </div>
        )}
      </div>
      
      {/* Event details - row 2 (if applicable) */}
      {(eventVenue || eventOrganizerBatch) && (
        <div className="flex flex-wrap justify-start gap-x-5 items-center px-3 pb-2">
          {eventVenue && (
            <div className="flex items-center gap-x-1">
              <LocationOnOutlinedIcon sx={{ fontSize: 14, color: theme.palette.text.secondary }} />
              <Tooltip title={eventVenue} arrow>
                <p style={{ color: theme.palette.text.secondary }} className="text-sm">
                  {eventVenue.length > 15 ? eventVenue.slice(0, 15) + "..." : eventVenue}
                </p>
              </Tooltip>
            </div>
          )}
          
          {eventOrganizerBatch && (
            <div className="flex items-center gap-x-1">
              <GroupsOutlinedIcon sx={{ fontSize: 14, color: theme.palette.text.secondary }} />
              <p style={{ color: theme.palette.text.secondary }} className="text-sm">{eventOrganizerBatch}</p>
            </div>
          )}
        </div>
      )}
    </Box>
  );
};

export default EventOverView;

