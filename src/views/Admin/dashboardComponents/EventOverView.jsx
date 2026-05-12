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

const EventOverView = ({ event }) => {
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

  // Format date for display if it's a Date object
  const formatDateForInput = (dateString) => {
    if (!dateString) return "";

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";

    return date.toISOString().split("T")[0]; // Returns YYYY-MM-DD
  };


  return (
    <div className="w-[96%] relative my-2 mx-auto rounded-md border border-slate-200 p-2">
      <div className="absolute bottom-0 right-0 bg-[#ca0019] text-white text-xs px-2">
        <p>Event</p>
      </div>
      
      {/* Status indicator */}
      <div className="flex justify-between items-start">
        {eventType && (
          <Chip 
            label={eventType}
            size="small"
            className="bg-blue-50 text-blue-700 text-xs"
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
      <div className="mt-2">
        <Tooltip title={eventName} arrow>
          <h2 className="text-lg font-semibold ps-3 flex items-center gap-x-1 text-slate-700">
            <span className={`inline-block w-3 h-3 rounded-full ${
              eventStatus === 'upcoming' ? 'bg-[#ca0019]' : 
              eventStatus === 'ongoing' ? 'bg-amber-500' : 
              'bg-green-600'
            }`}></span>
            {eventName ? 
              (eventName.length > 20 ? eventName.slice(0, 16) + "..." : eventName) : 
              "Can't Load Name"}
          </h2>
        </Tooltip>
        
        {/* Brief description if available */}
        {eventDescription && (
          <Tooltip title={eventDescription} arrow>
            <p className="text-xs text-slate-500 ps-7 mb-1">
              {eventDescription.length > 45 ? eventDescription.slice(0, 45) + "..." : eventDescription}
            </p>
          </Tooltip>
        )}
      </div>
      
      {/* Event details - row 1 */}
      <div className="flex flex-wrap justify-start gap-x-5 items-center px-3 py-2">
        <div className="flex items-center gap-x-1">
          <CalendarMonthOutlinedIcon sx={{ fontSize: 14, color: "#64748b" }} />
          <p className="text-sm text-slate-500">{formatDateForInput(eventDate)}</p>
        </div>
        {eventTime && (
          <div className="flex items-center gap-x-1">
            <ScheduleOutlinedIcon sx={{ fontSize: 14, color: '#64748b' }} />
            <p className="text-sm text-slate-500">{eventTime}</p>
          </div>
        )}
      </div>
      
      {/* Event details - row 2 (if applicable) */}
      {(eventVenue || eventOrganizerBatch) && (
        <div className="flex flex-wrap justify-start gap-x-5 items-center px-3 pb-2">
          {eventVenue && (
            <div className="flex items-center gap-x-1">
              <LocationOnOutlinedIcon sx={{ fontSize: 14, color: '#64748b' }} />
              <Tooltip title={eventVenue} arrow>
                <p className="text-sm text-slate-500">
                  {eventVenue.length > 15 ? eventVenue.slice(0, 15) + "..." : eventVenue}
                </p>
              </Tooltip>
            </div>
          )}
          
          {eventOrganizerBatch && (
            <div className="flex items-center gap-x-1">
              <GroupsOutlinedIcon sx={{ fontSize: 14, color: '#64748b' }} />
              <p className="text-sm text-slate-500">{eventOrganizerBatch}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EventOverView;
