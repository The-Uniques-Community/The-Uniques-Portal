import React, { useEffect, useState, useRef, forwardRef } from 'react';
import axios from 'axios';
import { BASE_URL } from '@/config';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import Eventmodel from '../Event/Componant/Event';
import { motion, AnimatePresence } from 'framer-motion';
import useEmblaCarousel from 'embla-carousel-react';
// Import MUI icons for the card
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import ScheduleOutlinedIcon from "@mui/icons-material/ScheduleOutlined";
// Import community card CSS
import "../../../utils/Card/communitycard.css";
// Import logo
import logo from "@/assets/logos/theuniquesCommunity.png";

// Utility function similar to shadcn's cn
const cn = (...classes) => {
  return classes.filter(Boolean).join(' ');
};

// Custom CommunityCard component
const CommunityCard = ({ event, onClick }) => {
  // Function to format the banner URL for Google Drive
  const getBannerUrl = (bannerData) => {
    if (!bannerData) return "";
    
    // Handle case where bannerData is an object with fileId property
    if (typeof bannerData === 'object' && bannerData.fileId) {
      return `https://drive.google.com/file/d/${bannerData.fileId}/preview`;
    }
    
    // Handle case where bannerData is an object with fileUrl property but no fileId
    if (typeof bannerData === 'object' && bannerData.fileUrl) {
      const fileUrl = bannerData.fileUrl;
      if (fileUrl.includes('/file/d/')) {
        const fileIdMatch = fileUrl.match(/\/file\/d\/([^\/]+)/);
        if (fileIdMatch && fileIdMatch[1]) {
          return `https://drive.google.com/file/d/${fileIdMatch[1]}/preview`;
        }
      }
      return bannerData.fileUrl;
    }
    
    // Convert to string if it's another type
    const bannerId = String(bannerData);
    
    // Check if it's already a complete URL
    if (bannerId.startsWith('https://')) {
      return bannerId;
    }
    
    // Format as Google Drive preview URL for simple ID string
    return `https://drive.google.com/file/d/${bannerId}/preview`;
  };
  
  return (
    <div className="card2 bg-slate-200 relative">
      {/* Add a transparent overlay div to capture mouse events */}
      <div className="absolute inset-0 z-20" style={{ pointerEvents: 'none' }}></div>
      
      <div className="top-sectionn relative">
        {event?.eventBanner ? (
          <>
            <iframe
              src={getBannerUrl(event.eventBanner)}
              className="w-full h-full border-0"
              title={event?.eventName || "Event"}
              loading="lazy"
              allowFullScreen
              style={{ pointerEvents: 'none' }} // Prevent iframe from capturing mouse events
            ></iframe>
            {/* Add an overlay to the iframe to ensure events still work */}
            <div className="absolute inset-0" style={{ pointerEvents: 'none' }}></div>
          </>
        ) : (
          <img 
            src={event.coverImage || "https://placehold.co/600x400?text=Event"} 
            alt={event?.eventName || "Event"} 
            className="w-full h-full object-cover"
            style={{ pointerEvents: 'none' }} // Prevent image from capturing mouse events
          />
        )}
        <div className="absolute text-xs font-medium text-[#ca0019] top-1 left-1 z-10">
          {event?.eventType?.[0] || "Event"}
        </div>
      </div>
      <div>
        <p className="text-xl pt-3 pb-1 px-3 font-medium">
          {event?.eventName 
            ? (event.eventName.length > 20 
              ? event.eventName.slice(0, 20) + "..." 
              : event.eventName) 
            : "Event"}
        </p>
        <div className="flex justify-start items-center gap-x-1 px-2">
          <LocationOnOutlinedIcon sx={{ fontSize: 16 }} className="text-slate-700" />
          <p className="text-xs text-slate-700">{event?.eventVenue || "Online"}</p>
        </div>
        <div className="h-[1px] w-[280px] mx-auto mt-3 bg-slate-400"></div>
        <div className="flex justify-start gap-x-5 items-center px-3 py-2">
          <div className="flex items-center gap-x-1">
            <CalendarMonthOutlinedIcon sx={{ fontSize: 14 }} />
            <p className="text-xs text-slate-700">
              {event?.eventDate ? new Date(event.eventDate).toDateString() : ""}
            </p>
          </div>
          <div className="flex items-center gap-x-1">
            <ScheduleOutlinedIcon sx={{ fontSize: 14 }} />
            <p className="text-xs text-slate-700">{event?.eventTime || "TBA"}</p>
          </div>
        </div>
        <div className="mt-3 relative">
          <div className="bordern"></div>
          <img
            src={logo}
            className="h-7 w-1/2 pb-2 px-3 object-contain object-left"
            alt="TU Logo"
            style={{ pointerEvents: 'none' }} // Prevent logo from capturing mouse events
          />
          <button
            onClick={onClick}
            className="absolute hover:bg-black duration-150 -bottom-2 text-sm -right-1 w-24 rounded-full text-white text-center bg-[#ca0019] py-[6px] z-30"
          >
            <div>Know More</div>
          </button>
        </div>
      </div>
    </div>
  );
};

// FollowPointer Components - Fixed implementation for better tracking
const FollowerPointerCard = ({ children, className, title, colorIndex = 0 }) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const ref = useRef(null);
  const [rect, setRect] = useState(null);
  const [isInside, setIsInside] = useState(false);

  // Update rect dimensions on resize and mount
  useEffect(() => {
    if (ref.current) {
      // Initial measurement
      setRect(ref.current.getBoundingClientRect());
      
      // Update on resize
      const updateRect = () => {
        if (ref.current) setRect(ref.current.getBoundingClientRect());
      };
      
      window.addEventListener('resize', updateRect);
      return () => window.removeEventListener('resize', updateRect);
    }
  }, []);

  const handleMouseMove = (e) => {
    if (rect) {
      // Calculate position relative to the container
      setMousePosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  };
  
  const handleMouseLeave = () => {
    setIsInside(false);
  };

  const handleMouseEnter = () => {
    setIsInside(true);
    // Update rect when mouse enters to ensure accurate positioning
    if (ref.current) {
      setRect(ref.current.getBoundingClientRect());
    }
  };
  
  return (
    <div
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      style={{ cursor: "none" }}
      ref={ref}
      className={cn("relative isolate", className)}
    >
      <AnimatePresence>
        {isInside && (
          <FollowPointer 
            x={mousePosition.x} 
            y={mousePosition.y} 
            title={title}
            colorIndex={colorIndex}
          />
        )}
      </AnimatePresence>
      <div className="relative z-10 pointer-events-auto">
        {children}
      </div>
    </div>
  );
};

const FollowPointer = ({ x, y, title, colorIndex }) => {
  const colors = [
    "#0ea5e9", "#737373", "#14b8a6", "#22c55e", 
    "#3b82f6", "#ef4444", "#eab308",
  ];
  
  // Use a consistent color based on the index
  const color = colors[colorIndex % colors.length];
  
  return (
    <motion.div
      className="absolute z-[9999] h-4 w-4 rounded-full pointer-events-none"
      style={{
        top: y,
        left: x,
      }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{ duration: 0.1 }}
    >
      <svg
        stroke="currentColor"
        fill="currentColor"
        strokeWidth="1"
        viewBox="0 0 16 16"
        className="h-6 w-6 -translate-x-[12px] -translate-y-[10px] -rotate-[70deg] transform stroke-sky-600 text-sky-500"
        height="1em"
        width="1em"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M14.082 2.182a.5.5 0 0 1 .103.557L8.528 15.467a.5.5 0 0 1-.917-.007L5.57 10.694.803 8.652a.5.5 0 0 1-.006-.916l12.728-5.657a.5.5 0 0 1 .556.103z"></path>
      </svg>
      <motion.div
        style={{ backgroundColor: color }}
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.5, opacity: 0 }}
        className="absolute top-0 left-0 min-w-max rounded-full px-2 py-2 text-xs whitespace-nowrap text-white transform -translate-x-1/2 translate-y-2 mt-2 shadow-lg"
      >
        {title || `Event Details`}
      </motion.div>
    </motion.div>
  );
};

// Carousel Components - Updated with responsive design
const Carousel = forwardRef(
  ({ className, opts, setApi, children, ...props }, ref) => {
    // Set up responsive options for the carousel
    const [emblaRef, emblaApi] = useEmblaCarousel({
      ...opts,
      axis: "x",
      breakpoints: {
        '(min-width: 768px)': { slidesToScroll: 2 },
        '(min-width: 1024px)': { slidesToScroll: 3 }
      },
      // Adjust slide alignment based on screen size
      align: window.innerWidth < 768 ? 'center' : 'start',
    });

    const [prevBtnDisabled, setPrevBtnDisabled] = useState(true);
    const [nextBtnDisabled, setNextBtnDisabled] = useState(false);
    // Track if we're on mobile
    const [isMobile, setIsMobile] = useState(window.innerWidth < 640);

    // Update mobile status on window resize
    useEffect(() => {
      const handleResize = () => {
        setIsMobile(window.innerWidth < 640);
      };
      
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }, []);

    const onSelect = React.useCallback(() => {
      if (!emblaApi) return;
      setPrevBtnDisabled(!emblaApi.canScrollPrev());
      setNextBtnDisabled(!emblaApi.canScrollNext());
    }, [emblaApi]);

    useEffect(() => {
      if (!emblaApi) return;
      onSelect();
      emblaApi.on("select", onSelect);
      if (setApi) setApi(emblaApi);
      
      return () => {
        emblaApi.off("select", onSelect);
      };
    }, [emblaApi, onSelect, setApi]);

    return (
      <div
        ref={ref}
        className={cn("relative px-2 md:px-0", className)}
        {...props}
      >
        <div ref={emblaRef} className="overflow-hidden">
          <div className="flex">{children}</div>
        </div>

        {/* Only show buttons on non-touch devices */}
        {!isMobile && (
          <>
            <button
              type="button"
              onClick={() => emblaApi?.scrollPrev()}
              disabled={prevBtnDisabled}
              className={cn(
                "absolute left-[-15px] sm:left-[-20px] md:left-[-30px] top-1/2 z-[999] -translate-y-1/2 rounded-full bg-white p-2 sm:p-3 shadow-[0_8px_16px_rgba(0,0,0,0.1)] border border-gray-100 hover:bg-gray-50 transition-all duration-300",
                prevBtnDisabled && "opacity-40 cursor-not-allowed hover:bg-white"
              )}
              aria-label="Previous slide"
            >
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 text-gray-700" />
            </button>

            <button
              type="button"
              onClick={() => emblaApi?.scrollNext()}
              disabled={nextBtnDisabled}
              className={cn(
                "absolute right-[-15px] sm:right-[-20px] md:right-[-30px] top-1/2 z-[999] -translate-y-1/2 rounded-full bg-white p-2 sm:p-3 shadow-[0_8px_16px_rgba(0,0,0,0.1)] border border-gray-100 hover:bg-gray-50 transition-all duration-300",
                nextBtnDisabled && "opacity-40 cursor-not-allowed hover:bg-white"
              )}
              aria-label="Next slide"
            >
              <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 text-gray-700" />
            </button>
          </>
        )}
        
        {/* Pagination dots for mobile */}
        {isMobile && (
          <div className="flex justify-center items-center mt-4">
            {Array.from({ length: Math.ceil(React.Children.count(children) / 1) }).map((_, index) => (
              <button
                key={index}
                onClick={() => emblaApi?.scrollTo(index)}
                className={`h-2 w-2 mx-1 rounded-full ${
                  emblaApi && emblaApi.selectedScrollSnap() === index
                    ? 'bg-[#ca0019]'
                    : 'bg-gray-300'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    );
  }
);

// Update CarouselItem component for better responsiveness
const CarouselItem = forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "min-w-0 px-1 sm:px-2 md:pl-4 relative",
      // Responsive sizing
      "flex-[0_0_85%] sm:flex-[0_0_65%] md:flex-[0_0_45%] lg:flex-[0_0_30%]",
      className
    )}
    {...props}
  />
));

CarouselItem.displayName = "CarouselItem";

// Main Event Component
const Event = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [carouselApi, setCarouselApi] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${BASE_URL}/api/events`);
        
        if (response.data && Array.isArray(response.data.events)) {
          const eventsData = response.data.events;
          
          // Filter and sort events
          const sortedEvents = eventsData
            .sort((a, b) => {
              // Sort by date, most recent first
              try {
                if (!a.eventDate) return 1;
                if (!b.eventDate) return -1;
                return new Date(b.eventDate) - new Date(a.eventDate);
              } catch (e) {
                return 0;
              }
            })
            .slice(0, 9); // Get the first 9 events
          
          setEvents(sortedEvents);
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
  }, []);

  const openEventModal = (event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
    document.body.style.overflow = 'hidden'; // Prevent scrolling when modal is open
  };

  const closeEventModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
    document.body.style.overflow = 'auto'; // Re-enable scrolling
  };

  const TitleComponent = ({ event }) => (
    <div className="flex items-center space-x-2">
      <div className="w-5 h-5 rounded-full bg-red-600 flex items-center justify-center text-white text-xs">
        {event.eventName?.charAt(0) || 'E'}
      </div>
      <p>{event.eventName || "Event"}</p>
    </div>
  );

  if (loading) {
    return (
      <div className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">Loading events...</div>
        </div>
      </div>
    );
  }

  if (error || !events.length) {
    return null; // Don't show anything if there's an error or no events
  }

  return (
    <section className="py-8 md:py-16 px-2 md:px-4 bg-transparent relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 md:mb-10 flex flex-col md:flex-row justify-between items-start md:items-center">
          <div className="w-full md:w-1/2 flex flex-col justify-center mb-4 md:mb-0">
            <div className="flex mb-2 md:mb-5 items-center">
              <span className="border-l-2 border-[#e03232] h-6 mr-3"></span>
              <h1 className="text-lg font-bold">OUR EVENTS</h1>
            </div>
            <h1 className="text-lg md:text-3xl font-semibold mb-4 md:mb-8">
              Experience the <span className="text-[#ca2c2c] text-3xl md:text-4xl lg:text-7xl md:py-3 block">excitement</span>
            </h1>
          </div>
          
          <Link 
            to="/events" 
            className="inline-flex items-center px-4 sm:px-5 py-2 bg-[#e03232] hover:bg-[#c52020] text-white text-sm sm:text-base font-medium rounded-lg transition-all duration-300"
          >
            View All
            <ArrowRight className="ml-2 w-4 h-4" />
          </Link>
        </div>

        <Carousel 
          setApi={setCarouselApi}
          className="w-full"
          opts={{
            align: 'start',
            loop: true,
            dragFree: true
          }}
        >
          {events.map((event, index) => (
            <CarouselItem key={event._id || index}>
              <div className="h-full">
                <FollowerPointerCard
                  title={<TitleComponent event={event} />}
                  className="w-full h-full"
                  colorIndex={index}
                >
                  <CommunityCard 
                    event={event} 
                    onClick={() => openEventModal(event)} 
                  />
                </FollowerPointerCard>
              </div>
            </CarouselItem>
          ))}
        </Carousel>
      </div>

      {/* Render the EventModel component when modal is open */}
      {isModalOpen && selectedEvent && (
        <Eventmodel
          event={selectedEvent}
          isOpen={isModalOpen}
          onClose={closeEventModal}
        />
      )}
    </section>
  );
};

export default Event;
