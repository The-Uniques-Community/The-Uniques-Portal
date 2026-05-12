import { useState, useEffect, useCallback } from "react"
import axios from 'axios'
import { BASE_URL } from '@/config';
import { motion, AnimatePresence } from "framer-motion"
import { Play, ChevronRight, ChevronLeft } from "lucide-react"
import useEmblaCarousel from "embla-carousel-react"
import Autoplay from "embla-carousel-autoplay"
import { Calendar as CalendarIcon, MapPin as MapPinIcon } from 'lucide-react'
import Eventmodel from '../Event/Componant/Event' // Import the EventModel component

// Update the helper function to use your proxy endpoint
const getProxiedImageUrl = (fileId) => {
  if (!fileId) return "/placeholder.svg"
  return `${BASE_URL}/api/image-proxy/${fileId}`
}

// Update the transformEventToDestination function
const transformEventToDestination = (event) => {
  const shortenedDescription = event.eventDescription?.slice(0, 150) + "..."
  const formattedDate = new Date(event.eventDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  return {
    id: event._id,
    name: event.eventName,
    title: event.eventName,
    description: shortenedDescription,
    price: event.eventFee ? `₹${event.eventFee}` : "",
    level: event.eventType || "Community Event",
    duration: formattedDate,
    distance: event.eventVenue,
    image: getProxiedImageUrl(event.eventBanner?.fileId),
    images: event.eventGallery?.map(img => getProxiedImageUrl(img.fileId)) || [],
    isHot: event.eventStatus === 'completed',
    attendees: event.eventGuests?.length || 0,
    // Store the original event data for the modal
    originalEvent: event,
    tabContent: {
      Highlights: {
        title: "Event Highlights",
        description: shortenedDescription,
        highlights: [
          `${event.eventGuests?.length || 0} Guests`,
          `Organized by ${event.eventOrganizer || 'The Uniques'}`,
          `${event.eventType || 'Community'} Event`,
          `Venue: ${event.eventVenue || 'TBD'}`
        ],
      },
      KeyTakaway: {
        title: "Key Takeaways",
        description: event.eventDescription.slice(0, 300) + "...",
        highlights: [
          event.eventHighlights?.split('\n') || 
          ['Networking Opportunity', 'Skill Development', 'Community Building']
        ].flat(),
      },
      Guests: {
        title: "Featured Guests",
        description: "Distinguished guests who graced the event",
        highlights: event.eventGuests?.map(guest => 
          `${guest.guestId?.guestName || 'Guest'} - ${guest.guestId?.guestDesignation || ''} ${guest.guestId?.guestCompany ? `(${guest.guestId.guestCompany})` : ''}`
        ) || ['Join our next event to network with industry professionals'],
      },
    },
  }
}

export default function Highlight() {
  const [activeTab, setActiveTab] = useState("Highlights")
  const [activeDestination, setActiveDestination] = useState(null)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [destinations, setDestinations] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Add state for the event modal
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState(null)

  // Main carousel
  const [mainViewportRef, mainEmblaApi] = useEmblaCarousel(
    {
      loop: true,
      draggable: false,
      skipSnaps: false,
    },
    [Autoplay({ delay: 10000, stopOnInteraction: true })],
  )

  // Thumbnail carousel
  const [thumbViewportRef, thumbEmblaApi] = useEmblaCarousel({
    containScroll: "keepSnaps",
    dragFree: true,
  })

  const onThumbClick = useCallback(
    (index) => {
      if (!mainEmblaApi || !thumbEmblaApi) return
      mainEmblaApi.scrollTo(index)
    },
    [mainEmblaApi, thumbEmblaApi],
  )

  const onSelect = useCallback(() => {
    if (!mainEmblaApi || !thumbEmblaApi) return
    const index = mainEmblaApi.selectedScrollSnap()
    setSelectedIndex(index)
    setActiveDestination(destinations[index])
    thumbEmblaApi.scrollTo(index)
  }, [mainEmblaApi, thumbEmblaApi, destinations])

  useEffect(() => {
    if (!mainEmblaApi) return
    onSelect()
    mainEmblaApi.on("select", onSelect)
    return () => {
      mainEmblaApi.off("select", onSelect)
    }
  }, [mainEmblaApi, onSelect])

  const scrollPrev = useCallback(() => {
    if (mainEmblaApi) mainEmblaApi.scrollPrev()
  }, [mainEmblaApi])

  const scrollNext = useCallback(() => {
    if (mainEmblaApi) mainEmblaApi.scrollNext()
  }, [mainEmblaApi])

  // Add functions to open and close the event modal
  const openEventModal = (destination) => {
    setSelectedEvent(destination.originalEvent)
    setIsModalOpen(true)
    document.body.style.overflow = 'hidden' // Prevent scrolling when modal is open
  }

  const closeEventModal = () => {
    setIsModalOpen(false)
    setSelectedEvent(null)
    document.body.style.overflow = 'auto' // Re-enable scrolling
  }

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true)
        const response = await axios.get(`${BASE_URL}/api/events`, {
          params: {
            status: 'completed',  // Only fetch completed events
            limit: 10  // Adjust limit as needed
          }
        })
        
        // Transform the events from the response
        const transformedEvents = response.data.events.map(transformEventToDestination)
        setDestinations(transformedEvents)
        setActiveDestination(transformedEvents[0])
      } catch (error) {
        console.error('Error fetching events:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [])

  if (loading) {
    return (
      <div className="container w-full mx-auto px-4 flex items-center justify-center h-[630px]">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-red-500"></div>
      </div>
    )
  }

  // Update the main container styles
  return (
    <div className="container w-full mx-auto px-4 py-12"> {/* Added padding-y */}
      {destinations.length === 0 ? (
        <div className="w-11/12 mx-auto bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl overflow-hidden shadow-2xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent">No events available</h2>
          <p className="mt-4 text-gray-300">Check back later for upcoming events</p>
        </div>
      ) : (
        <div className="w-11/12 mx-auto bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl overflow-hidden shadow-2xl border border-gray-800">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Featured destination - left side with infinite carousel */}
            <div className="relative lg:h-[630px] overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-gray-900/10 to-gray-900/60 z-10"></div>
              <div className="h-full overflow-hidden" ref={mainViewportRef}>
                <div className="flex h-full">
                  {destinations.map((destination) => (
                    <div key={`main-${destination.id}`} className="relative flex-shrink-0 w-full h-full">
                      <img
                        src={destination.image}
                        alt={destination.name}
                        className="object-contain w-full h-full transform hover:scale-105 transition-transform duration-700"
                      />
                      {destination.isHot && (
                        <div className="absolute top-6 left-6 bg-gradient-to-r from-red-600 to-red-500 text-white text-xs font-bold px-4 py-2 rounded-full z-20 shadow-lg backdrop-blur-sm">
                          Featured Event
                        </div>
                      )}
                      <div className="absolute bottom-0 left-0 p-8 z-20 w-full bg-gradient-to-t from-gray-900 via-gray-900/80 to-transparent">
                        <h2 className="text-3xl font-bold mb-12 text-white">{destination.name}</h2>
                        <div className="flex items-center gap-6 text-gray-200">
                          <div className="flex items-center gap-2">
                            <CalendarIcon className="w-4 h-4" />
                            <span>{destination.duration}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPinIcon className="w-4 h-4" />
                            <span>{destination.distance}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Thumbnail navigation in top-right corner */}
              <div className="absolute bottom-4 right-4 z-20 bg-gray-900/70 p-2 rounded-lg">
                <div className="overflow-hidden" ref={thumbViewportRef}>
                  <div className="flex gap-2">
                    {destinations.map((destination, index) => (
                      <button
                        key={`thumb-${destination.id}`}
                        onClick={() => onThumbClick(index)}
                        className={`relative flex-shrink-0 w-20 h-12 rounded-md overflow-hidden border-2 transition-all ${
                          index === selectedIndex ? "border-red-500" : "border-transparent"
                        }`}
                      >
                        <img
                          src={destination.image}
                          alt={destination.name}
                          className="object-cover w-full h-full" // Changed from object-contain
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Navigation buttons */}
              <button
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 rounded-full p-2 backdrop-blur-sm z-10"
                onClick={scrollPrev}
              >
                <ChevronLeft className="w-6 h-6 text-white" />
              </button>
              <button
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 rounded-full p-2 backdrop-blur-sm z-10"
                onClick={scrollNext}
              >
                <ChevronRight className="w-6 h-6 text-white" />
              </button>
            </div>

            {/* Destination details - right side */}
            <div className="bg-white/95 backdrop-blur-md p-8 rounded-r-2xl">
              <div className="flex justify-between mb-8">
                <div className="flex space-x-8"> {/* Increased spacing */}
                  {["Highlights", "KeyTakaway", "Guests"].map((tab) => (
                    <button
                      key={tab}
                      className={`pb-2 font-medium transition-all ${
                        activeTab === tab 
                          ? "text-gray-900 border-b-2 border-red-500 scale-105" 
                          : "text-gray-400 hover:text-gray-600"
                      }`}
                      onClick={() => setActiveTab(tab)}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={`${activeDestination?.id}-${activeTab}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                  className="mb-8 space-y-6" // Added vertical spacing
                >
                  <div className="flex justify-between items-start">
                    <h3 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                      {activeDestination?.tabContent[activeTab].title}
                    </h3>
                    <span className="text-2xl font-bold bg-gradient-to-r from-red-600 to-red-500 bg-clip-text text-transparent">
                      {activeDestination?.price}
                    </span>
                  </div>

                  <p className="text-gray-600 leading-relaxed">
                    {activeDestination?.tabContent[activeTab].description}
                  </p>

                  <div className="bg-gray-50 rounded-xl p-6"> {/* Added container for highlights */}
                    <h4 className="font-semibold text-gray-900 mb-4">Highlights</h4>
                    <ul className="grid gap-3">
                      {activeDestination?.tabContent[activeTab].highlights.map((highlight, index) => (
                        <li key={index} className="flex items-center gap-3 text-gray-600">
                          <div className="w-2 h-2 rounded-full bg-gradient-to-r from-red-500 to-red-600"></div>
                          {highlight}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                    <div>
                      <div className="text-gray-500 text-sm font-medium">Type</div>
                      <div className="font-semibold text-gray-900">{activeDestination?.level}</div>
                    </div>
                    <div>
                      <div className="text-gray-500 text-sm font-medium">Date</div>
                      <div className="font-semibold text-gray-900">{activeDestination?.duration}</div>
                    </div>
                    {/* Updated button to open the modal */}
                    <motion.button
                      className="bg-gradient-to-r from-red-600 to-red-500 text-white rounded-full px-6 py-2.5 hover:shadow-lg transition-shadow flex items-center gap-2"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => openEventModal(activeDestination)}
                    >
                      Learn more
                      <ChevronRight className="w-4 h-4" />
                    </motion.button>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      )}

      {/* Render the EventModel component when modal is open */}
      {isModalOpen && selectedEvent && (
        <Eventmodel
          event={selectedEvent}
          isOpen={isModalOpen}
          onClose={closeEventModal}
        />
      )}
    </div>
  )
}
