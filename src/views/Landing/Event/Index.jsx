import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BASE_URL } from '@/config';
import Event from './Componant/Event';
import CommunityCard from '@/utils/Card/CommunityCard';
import Header from '@/utils/Header/index';
import CallToAction from '../homComponents/CallToAction';
import { 
  TextField, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel, 
  CircularProgress, 
  Alert, 
  Pagination,
  Box,
  useMediaQuery,
  useTheme,
  Chip
} from '@mui/material';
import { LocalActivityOutlined, CalendarMonth, EventAvailable } from '@mui/icons-material';

const Index = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEvent, setShowEvent] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [eventType, setEventType] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [eventTypes, setEventTypes] = useState([]);
  const [years, setYears] = useState([]);
  
  // Pagination state
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(12); // Items per page
  
  // State variables for categorized events
  const [ongoingEvents, setOngoingEvents] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [completedEvents, setCompletedEvents] = useState([]);
  
  // Stats for display
  const [eventStats, setEventStats] = useState({
    total: 0,
    ongoing: 0,
    upcoming: 0,
    completed: 0
  });

  // Fetch events with better API utilization
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        
        // Build query parameters for more efficient API usage
        const params = new URLSearchParams();
        params.append('limit', '100'); // Reasonable large limit for landing page
        
        // Add filters if selected
        if (eventType) params.append('type', eventType);
        
        const response = await axios.get(
          `${BASE_URL}/api/events?${params.toString()}`
        );
        
        if (response.data && Array.isArray(response.data.events)) {
          const eventsData = response.data.events;
          setEvents(eventsData);
          setFilteredEvents(eventsData);
          
          // Update stats
          setEventStats({
            total: response.data.total || eventsData.length,
            ongoing: response.data.totalOngoing || 0,
            upcoming: response.data.totalUpcoming || 0,
            completed: response.data.totalCompleted || 0
          });
          
          // Calculate total pages
          setTotalPages(response.data.totalPages || Math.ceil(eventsData.length / limit));

          // Extract unique event types
          const types = [...new Set(eventsData
            .filter(event => event.eventType)
            .map(event => event.eventType))];
          setEventTypes(types);
          
          // Extract unique years
          const uniqueYears = [...new Set(eventsData
            .filter(event => event.eventDate)
            .map(event => {
              try {
                return new Date(event.eventDate).getFullYear();
              } catch(e) {
                return null;
              }
            })
            .filter(Boolean))];
            
          setYears(uniqueYears.sort((a, b) => b - a));
        } else {
          setError('Invalid response format');
        }
      } catch (error) {
        console.error('Error fetching events:', error);
        setError('Failed to load events');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [eventType, limit]);

  // Client-side filtering for search, month and year
  useEffect(() => {
    let filtered = events;
    
    if (searchTerm.trim()) {
      filtered = filtered.filter(event => {
        return event.eventName && 
          event.eventName.toLowerCase().includes(searchTerm.trim().toLowerCase());
      });
    }
  
    if (month) {
      filtered = filtered.filter(event => {
        try {
          if (!event.eventDate) return false;
          
          const eventDate = new Date(event.eventDate);
          if (isNaN(eventDate.getTime())) return false;
          
          const eventMonth = eventDate.getMonth() + 1;
          return eventMonth === parseInt(month);
        } catch (e) {
          return false;
        }
      });
    }

    if (year) {
      filtered = filtered.filter(event => {
        try {
          if (!event.eventDate) return false;
          
          const eventDate = new Date(event.eventDate);
          if (isNaN(eventDate.getTime())) return false;
          
          return eventDate.getFullYear() === parseInt(year);
        } catch (e) {
          return false;
        }
      });
    }

    setFilteredEvents(filtered);
    
    // Reset pagination when filters change
    setPage(1);
  }, [searchTerm, month, year, events]);

  // Categorize events based on status and date
  useEffect(() => {
    const categorizeEvents = () => {
      // Use the explicit status when available, otherwise calculate based on date
      const ongoing = [];
      const upcoming = [];
      const completed = [];
      
      filteredEvents.forEach(event => {
        try {
          // First check if the event has an explicit status
          if (event.eventStatus) {
            const status = event.eventStatus.toLowerCase();
            
            switch(status) {
              case 'ongoing':
                ongoing.push(event);
                return;
              case 'upcoming':
                upcoming.push(event);
                return;
              case 'completed':
              case 'cancelled':
                completed.push(event);
                return;
            }
          }
          
          // Fall back to date-based categorization
          if (!event.eventDate) {
            completed.push(event);
            return;
          }
          
          const eventDate = new Date(event.eventDate);
          if (isNaN(eventDate.getTime())) {
            completed.push(event);
            return;
          }
          
          // Calculate event end date
          const eventEndDate = event.eventEndDate ? new Date(event.eventEndDate) : 
                              new Date(eventDate.getTime() + 24 * 60 * 60 * 1000);
          
          // Set to end of day
          eventEndDate.setHours(23, 59, 59, 999);
          
          // For date comparison, use only the date part
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          const eventDateOnly = new Date(eventDate);
          eventDateOnly.setHours(0, 0, 0, 0);
          
          if (today >= eventDateOnly && today <= eventEndDate) {
            ongoing.push(event);
          } else if (today < eventDateOnly) {
            upcoming.push(event);
          } else {
            completed.push(event);
          }
        } catch (e) {
          completed.push(event);
        }
      });
      
      // Sort events by date within each category
      const sortByDate = (a, b) => {
        try {
          if (!a.eventDate) return 1;
          if (!b.eventDate) return -1;
          
          return new Date(a.eventDate) - new Date(b.eventDate);
        } catch (e) {
          return 0;
        }
      };
      
      ongoing.sort(sortByDate);
      upcoming.sort(sortByDate);
      completed.sort((a, b) => sortByDate(b, a)); // Newest first
      
      setOngoingEvents(ongoing);
      setUpcomingEvents(upcoming);
      setCompletedEvents(completed);
    };
    
    categorizeEvents();
  }, [filteredEvents]);

  // Handle pagination change
  const handlePageChange = (event, value) => {
    setPage(value);
    window.scrollTo(0, 0);
  };

  // Get paginated portion of events
  const getPaginatedEvents = (eventList) => {
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    return eventList.slice(startIndex, endIndex);
  };
  
  // Create event category summary for display
  const EventSummary = () => (
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'center', 
      gap: 2, 
      flexWrap: 'wrap',
      mb: 2
    }}>
      <Chip 
        icon={<EventAvailable />}
        label={`Ongoing: ${ongoingEvents.length}`} 
        color="error" 
        variant="outlined" 
      />
      <Chip 
        icon={<CalendarMonth />}
        label={`Upcoming: ${upcomingEvents.length}`} 
        color="warning" 
        variant="outlined"
      />
      <Chip 
        icon={<LocalActivityOutlined />}
        label={`Completed: ${completedEvents.length}`} 
        color="success" 
        variant="outlined" 
      />
    </Box>
  );

  return (
    <>
      <Header 
        title="Join the Biggest Event of the Year 🎉" 
        subtitle="Don't miss out!" 
        chipLabel="Exclusive Event" 
      />
      
      {/* Filters Section */}
      <div className="flex flex-wrap justify-center gap-4 p-5">
        <TextField
          label="Search by Name"
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ width: isMobile ? '100%' : 'auto' }}
        />
        
        <FormControl 
          variant="outlined" 
          size="small" 
          sx={{ 
            minWidth: isMobile ? '100%' : 150
          }}
        >
          <InputLabel>Event Type</InputLabel>
          <Select 
            value={eventType} 
            onChange={(e) => setEventType(e.target.value)} 
            label="Event Type"
          >
            <MenuItem value="">All</MenuItem>
            {eventTypes.map(type => (
              <MenuItem key={type} value={type}>{type}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl 
          variant="outlined" 
          size="small" 
          sx={{ 
            minWidth: isMobile ? '100%' : 150
          }}
        >
          <InputLabel>Month</InputLabel>
          <Select 
            value={month} 
            onChange={(e) => setMonth(e.target.value)} 
            label="Month"
          >
            <MenuItem value="">All</MenuItem>
            {[...Array(12)].map((_, i) => (
              <MenuItem key={i + 1} value={i + 1}>
                {new Date(0, i).toLocaleString('default', { month: 'long' })}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl 
          variant="outlined" 
          size="small" 
          sx={{ 
            minWidth: isMobile ? '100%' : 150
          }}
        >
          <InputLabel>Year</InputLabel>
          <Select 
            value={year} 
            onChange={(e) => setYear(e.target.value)} 
            label="Year"
          >
            <MenuItem value="">All</MenuItem>
            {years.map(y => (
              <MenuItem key={y} value={y}>{y}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>
      
      {/* Event Summary Stats */}
      <EventSummary />
      
      {/* Loading and Error States */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      )}
      
      {error && !loading && (
        <Box sx={{ maxWidth: 600, mx: 'auto', my: 4, px: 2 }}>
          <Alert severity="error">{error}</Alert>
        </Box>
      )}
      
      {/* Event Listings */}
      {!loading && !error && (
        <div className="max-w-6xl mx-auto px-5">
          {/* Ongoing Events Section */}
          {ongoingEvents.length > 0 && (
            <div className="my-10">
              <div className="flex mb-2 md:mb-5 items-center">
                <span className="border-l-4 border-[#e03232] h-6 mr-3"></span>
                <h1 className="text-lg font-bold">Ongoing Events</h1>
              </div> 
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
                {ongoingEvents.map(event => (
                  <div 
                    key={event._id} 
                    onClick={() => { setSelectedEvent(event); setShowEvent(true); }} 
                    className="cursor-pointer transition-transform hover:scale-[1.02]"
                    role="button"
                    aria-label={`View details for ${event.eventName}`}
                    tabIndex={0}
                  >
                    <CommunityCard event={event} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upcoming Events Section */}
          {upcomingEvents.length > 0 && (
            <div className="my-10">
              <div className="flex mb-2 md:mb-5 items-center">
                <span className="border-l-4 border-orange-500 h-6 mr-3"></span>
                <h1 className="text-lg font-bold">Upcoming Events</h1>
              </div> 
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
                {getPaginatedEvents(upcomingEvents).map(event => (
                  <div 
                    key={event._id} 
                    onClick={() => { setSelectedEvent(event); setShowEvent(true); }} 
                    className="cursor-pointer transition-transform hover:scale-[1.02]"
                    role="button"
                    aria-label={`View details for ${event.eventName}`}
                    tabIndex={0}
                  >
                    <CommunityCard event={event} />
                  </div>
                ))}
              </div>
              
              {/* Pagination for upcoming events when needed */}
              {upcomingEvents.length > limit && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                  <Pagination 
                    count={Math.ceil(upcomingEvents.length / limit)} 
                    page={page} 
                    onChange={handlePageChange}
                    color="primary"
                  />
                </Box>
              )}
            </div>
          )}

          {/* Completed Events Section */}
          {completedEvents.length > 0 && (
            <div className="my-10">
              <div className="flex mb-2 md:mb-5 items-center">
                <span className="border-l-4 border-green-600 h-6 mr-3"></span>
                <h1 className="text-lg font-bold">Completed Events</h1>
              </div>  
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
                {getPaginatedEvents(completedEvents).map(event => (
                  <div 
                    key={event._id} 
                    onClick={() => { setSelectedEvent(event); setShowEvent(true); }} 
                    className="cursor-pointer transition-transform hover:scale-[1.02]"
                    role="button"
                    aria-label={`View details for ${event.eventName}`}
                    tabIndex={0}
                  >
                    <CommunityCard event={event} />
                  </div>
                ))}
              </div>
              
              {/* Pagination for completed events when needed */}
              {completedEvents.length > limit && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                  <Pagination 
                    count={Math.ceil(completedEvents.length / limit)} 
                    page={page} 
                    onChange={handlePageChange}
                    color="primary"
                  />
                </Box>
              )}
            </div>
          )}

          {/* No events message */}
          {ongoingEvents.length === 0 && upcomingEvents.length === 0 && completedEvents.length === 0 && (
            <div className="text-center py-12">
              <img 
                src="/assets/illustrations/no-data.svg" 
                alt="No events found" 
                className="w-64 mx-auto mb-4"
                onError={(e) => {e.target.style.display = 'none'}}
              />
              <p className="text-gray-500 text-lg">No events match your search criteria.</p>
              <button 
                onClick={() => {
                  setSearchTerm('');
                  setEventType('');
                  setMonth('');
                  setYear('');
                }}
                className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      )}
      
      {/* Call to action section */}
      <CallToAction />
      
      {/* Event detail modal */}
      {showEvent && selectedEvent && 
        <Event 
          event={selectedEvent} 
          onClose={() => setShowEvent(false)} 
        />
      }
    </>
  );
};

export default Index;
