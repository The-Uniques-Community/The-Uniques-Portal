import * as React from "react";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";

export default function Calender() {
    const [selectedDateRange, setSelectedDateRange] = React.useState([
        null,
        null,
      ]);
    
      const handleDateChange = (newValue) => {
        setSelectedDateRange(newValue);
      };
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DateCalendar />
    </LocalizationProvider>
  );
}
