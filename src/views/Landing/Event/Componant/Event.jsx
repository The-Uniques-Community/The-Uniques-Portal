import { useState, useEffect } from 'react';
import axios from 'axios';
import { BASE_URL } from '@/config';
import { Users, X, Calendar, Clock, MapPin, User, Users as UsersIcon, Award } from 'lucide-react';
import Button from "@/utils/Buttons/Button";
import { Tabs, Tab } from '@mui/material';
import { CircularProgress, TextField, FormControl, InputLabel, Select, MenuItem, FormHelperText, RadioGroup, FormControlLabel, Radio, Checkbox } from '@mui/material';
import { toast } from 'react-toastify';
import { Dialog, DialogContent, Typography, Box, DialogTitle, IconButton } from '@mui/material';
import { Close } from '@mui/icons-material';
import { Alert, DialogActions } from '@mui/material';
import { ContactMail } from '@mui/icons-material';


// Static data for community partners (only for Bharat TechXperience Hackathon 2.0)
const COMMUNITY_PARTNERS = [
    {
      name: "Google Developer Groups Chandigarh",
      logo: "https://bharat-tech-xperience.theuniques.in/static/media/gdg%20chandigarh.43ca0a92cc45f4c3bcc9.png",
      description: "A community of developers interested in Google's developer technologies.",
      website: "https://gdg.community.dev/gdg-chandigarh/"
    },
    {
      name: "Google Developer Groups Jalandhar",
      logo: "https://bharat-tech-xperience.theuniques.in/static/media/cp-gdg%20jalandhar.4872d2376bb3273dde32.png",
      description: "An initiative to concentrate the efforts of many developers in and around Punjab to learn and share Google products.",
      website: "https://gdg.community.dev/gdg-jalandhar/"
    },
    {
      name: "Google Developer Groups Ludhiana",
      logo: "https://bharat-tech-xperience.theuniques.in/static/media/cp-gdg%20ludhiana.78b882f7fdc3b6b0619f.png",
      description: "A platform for developers in Ludhiana to learn, network, and collaborate on Google technologies.",
      website: "https://gdg.community.dev/gdg-ludhiana/"
    },
    {
      name: "Google Developer Groups On Campus - DAV University",
      logo: "https://bharat-tech-xperience.theuniques.in/static/media/dav.b61c694bc933f8c72663.png",
      description: "A university-based community at DAV University, Jalandhar for students interested in Google technologies.",
      website: "https://gdg.community.dev/gdg-on-campus-dav-university-jalandhar-india/"
    },
    {
      name: "TensorFlow User Group Jalandhar",
      logo: "https://zko8va4y8i.ufs.sh/f/GunMk0mxX0j1eFZcb2aqBE3Tc9OfeNG6Ht0Q1DCAhwvkjIs2",
      description: "A community focused on exploring machine learning through TensorFlow.",
      website: "https://www.commudle.com/users/TFUG_Jalandhar"
    },
    {
      name: "BugBar",
      logo: "https://zko8va4y8i.ufs.sh/f/GunMk0mxX0j1fT1nYeZmdZB8h7Gy9E4PH6l5JzgQ0ncsxka2",
      description: "A community focused on technology and innovation.",
      website: null
    },
    {
      name: "CODEHAT THE MAGIC OF CODE",
      logo: "https://zko8va4y8i.ufs.sh/f/GunMk0mxX0j1rz8iUDQRMqkfSpwsFOXIj2goWx8nGybmucet",
      description: "A community centered around the magic and power of coding.",
      website: null
    },
    {
      name: "Google Developer Groups On Campus - NIT JALANDHAR",
      logo: "https://bharat-tech-xperience.theuniques.in/static/media/nit.120bad5231a209fe72f7.jpg",
      description: "The Google Developer Student Club at the National Institute of Technology, Jalandhar.",
      website: "https://gdg.community.dev/gdg-on-campus-dr-b-r-ambedkar-national-institute-of-technology-jalandhar-india/"
    },
    {
      name: "Google Developer Groups On Campus - RIET CONGOWAL",
      logo: "https://bharat-tech-xperience.theuniques.in/static/media/slite.83eb41537ac66a4cbde6.png",
      description: "A Google Developer Group on campus at RIET Congowal.",
      website: null
    },
    {
      name: "GeeksForGeeks (ARESEC CHAPTER)",
      logo: "https://bharat-tech-xperience.theuniques.in/static/media/gfg.077a7e9ff5911c708565.jpg",
      description: "The ARESEC chapter of GeeksForGeeks, a community focused on computer science and programming.",
      website: "https://www.geeksforgeeks.org/"
    },
    {
      name: "acm-w",
      logo: "https://bmnmsbiymz.ufs.sh/f/1V3V2P4kpAumRKOIeRmu2iQAmoaFD3d9eMskP7J6LXV4IRly",
      description: "ACM-W supports, celebrates, and advocates for the full engagement of women in all aspects of the computing field.",
      website: "https://women.acm.org/"
    },
    {
      name: "OPEN SOURCE CHANDIGARH",
      logo: "https://bharat-tech-xperience.theuniques.in/static/media/open.f20a841a307eb8c05f28.png",
      description: "A community in Chandigarh focused on open-source technologies, powered by Chitkara University, Punjab.",
      website: "https://github.com/Open-Source-Chandigarh"
    }
  ];

export default function Eventmodel({ event, isOpen, onClose }) {
    const [activeTab, setActiveTab] = useState("about");
    const [allEvents, setAllEvents] = useState([]);
    const [filteredEvents, setFilteredEvents] = useState([]);
    const [eventTypes, setEventTypes] = useState([]);
    const [eventLeaders, setEventLeaders] = useState([]);
    const [selectedDetailEvent, setSelectedDetailEvent] = useState(null);
    // State for registration functionality
    const [registrationModalOpen, setRegistrationModalOpen] = useState(false);
    const [formFields, setFormFields] = useState([]);
    const [formValues, setFormValues] = useState({});
    const [formErrors, setFormErrors] = useState({});
    const [registrationLoading, setRegistrationLoading] = useState(false);
    const [registrationSuccess, setRegistrationSuccess] = useState(false);
    // Add these state variables at the beginning of your component
const [teamMembers, setTeamMembers] = useState([]);
const [teamsLoading, setTeamsLoading] = useState(false);

// Define valid team types as a constant
const VALID_TEAM_TYPES = [
  "technical team",
  "branding team",
  "infra team", 
  "sponsors team", 
  "hospitality", 
  "guest-management"
];

// Add this function to fetch team members
// Update the fetchTeamMembers function to use the correct API endpoint
const fetchTeamMembers = async (eventId) => {
  if (!eventId) {
    console.error("Missing event ID when fetching team members");
    return;
  }
  
  try {
    setTeamsLoading(true);
    console.log(`Fetching team members for event: ${eventId}`);
    
    // Use the same base URL as your other API calls
    const response = await axios.get(`${BASE_URL}/api/events/${eventId}/members`, {
      credentials: "include"
    });
    
    console.log("Team members API response:", response.data);
    
    if (response.data && response.data.success && response.data.data) {
      const eventData = response.data.data;
      
      // Transform event members data for UI display
      const allMembers = [];
      
      if (eventData && eventData.eventMembers) {
        eventData.eventMembers.forEach(team => {
          if (team.contributionTeam && team.contributionTeam.length > 0) {
            team.contributionTeam.forEach(member => {
              allMembers.push({
                ...member,
                teamType: team.contributionType
              });
            });
          }
        });
      }
      
      console.log(`Found ${allMembers.length} team members across all teams`);
      setTeamMembers(allMembers);
    } else {
      console.warn("Invalid or empty response from team members API:", response.data);
      setTeamMembers([]);
    }
  } catch (error) {
    console.error("Error fetching team members:", error);
    toast.error("Failed to load team information. Please try again later.");
    setTeamMembers([]);
  } finally {
    setTeamsLoading(false);
  }
};
    // Check if this is the Bharat TechXperience Hackathon event
    const isBharatHackathon = event?.eventName === "Bharat TechXperience Hackathon 2.0";

    // Helper function to get initials from name
    const getNameInitials = (name) => {
        if (!name) return "??";
        const names = name.split(' ');
        if (names.length === 1) {
            return names[0].substring(0, 2).toUpperCase();
        }
        return (names[0].charAt(0) + names[1].charAt(0)).toUpperCase();
    };

    // Helper function to generate initials avatar URL
    const getInitialsAvatar = (name) => {
        const initials = getNameInitials(name);
        // Using UI Avatars service to generate avatar with brand color background
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=ca0019&color=ffffff&size=150&bold=true`;
    };

    // Handle event registration when button is clicked
    const handleRegisterForEvent = async () => {
        try {
            // If event has a form, open modal with form fields
            if (event.eventForm && event.eventForm.formId) {
                const formLoaded = await fetchFormFields();
                if (formLoaded) {
                    setRegistrationModalOpen(true);
                } else {
                    // If form couldn't be loaded, show an alert
                    toast.error("Could not load registration form. Please try again later.");
                }
            } else {
                // Simple registration without form
                setRegistrationLoading(true);

                try {
                    const response = await fetch(
                        `${BASE_URL}/api/events/${event._id}/register`,
                        {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            credentials: "include",
                        }
                    );

                    if (!response.ok) {
                        const errorText = await response.text();
                        throw new Error(
                            `Registration failed: ${response.status} ${errorText}`
                        );
                    }

                    const result = await response.json();
                    if (result.success) {
                        toast.success("Successfully registered for this event!");
                    } else {
                        throw new Error(result.message || "Registration failed");
                    }
                } catch (error) {
                    console.error("Registration API error:", error);
                    toast.error(`Registration failed: ${error.message}`);
                } finally {
                    setRegistrationLoading(false);
                }
            }
        } catch (error) {
            console.error("Error registering for event:", error);
            toast.error(`Error: ${error.message}`);
            setRegistrationLoading(false);
        }
    };

    // Fetch form fields from the event
    const fetchFormFields = async () => {
        try {
            // Reset any previous form data
            setFormErrors({});

            // Check if event has form data
            if (!event?.eventForm?.formId) {
                setFormErrors({
                    submit: "This event doesn't have a registration form.",
                });
                return false;
            }

            // Extract form fields directly from event object
            // Handle both cases: form fields in formId object or in formFeilds array
            let fields = [];

            if (
                event.eventForm.formId.fields &&
                event.eventForm.formId.fields.length > 0
            ) {
                // Fields from the formId object
                fields = event.eventForm.formId.fields.map((field) => ({
                    name: field.fieldName,
                    label: field.fieldLabel,
                    type: field.fieldType,
                    placeholder: field.placeholder,
                    required: field.required,
                    options: field.options || [],
                    helperText: "",
                }));
            } else if (
                event.eventForm.formFeilds &&
                event.eventForm.formFeilds.length > 0
            ) {
                // Fields from the formFeilds array (note: handling the typo in "Feilds")
                fields = event.eventForm.formFeilds.map((field) => ({
                    name: field.fieldName,
                    label: field.fieldLabel,
                    type: field.fieldType,
                    placeholder: field.placeholder,
                    required: field.required,
                    options: field.options || [],
                    helperText: "",
                }));
            }

            if (fields.length === 0) {
                setFormErrors({
                    submit: "No form fields found for this event.",
                });
                return false;
            }

            setFormFields(fields);

            // Initialize form values
            const initialValues = {};
            fields.forEach((field) => {
                if (field.type === "checkbox") {
                    initialValues[field.name] = [];
                } else {
                    initialValues[field.name] = "";
                }
            });

            setFormValues(initialValues);
            return true;
        } catch (error) {
            console.error("Error setting up form fields:", error);
            setFormErrors({
                submit: "An error occurred while preparing the form.",
            });
            return false;
        }
    };

    // Handle form input changes
    const handleFormInputChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (type === "checkbox") {
            const updatedValues = formValues[name] || [];
            if (checked) {
                setFormValues({
                    ...formValues,
                    [name]: [...updatedValues, value],
                });
            } else {
                setFormValues({
                    ...formValues,
                    [name]: updatedValues.filter((item) => item !== value),
                });
            }
        } else {
            setFormValues({
                ...formValues,
                [name]: value,
            });
        }

        // Clear error when user types
        if (formErrors[name]) {
            setFormErrors({
                ...formErrors,
                [name]: "",
            });
        }
    };

    // Validate form before submission
    const validateForm = () => {
        const errors = {};
        formFields.forEach((field) => {
            if (
                field.required &&
                (!formValues[field.name] ||
                    (Array.isArray(formValues[field.name]) &&
                        formValues[field.name].length === 0))
            ) {
                errors[field.name] = "This field is required";
            }
        });

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Submit form response
    const handleSubmitRegistrationForm = async () => {
        if (!validateForm()) return;

        try {
            setRegistrationLoading(true);

            // Prepare the request body according to the API expectations
            const requestBody = {
                responses: formValues,
                // Include respondent info if user is not authenticated
                respondentInfo: {
                    name: formValues.name || "",
                    email: formValues.email || "",
                    phone: formValues.phone || "",
                },
            };

            const response = await fetch(
                `${BASE_URL}/api/events/${event._id}/form-response`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify(requestBody),
                }
            );

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(
                    `Form submission failed (${response.status}): ${errorText}`
                );
            }

            const result = await response.json();

            if (result.success) {
                setRegistrationSuccess(true);
                setTimeout(() => {
                    setRegistrationModalOpen(false);
                    setRegistrationSuccess(false); // Reset for future submissions
                    // Clear form values for new submissions
                    const initialValues = {};
                    formFields.forEach((field) => {
                        if (field.type === "checkbox") {
                            initialValues[field.name] = [];
                        } else {
                            initialValues[field.name] = "";
                        }
                    });
                    setFormValues(initialValues);
                }, 2000);
            } else {
                throw new Error(result.message || "Registration failed");
            }
        } catch (error) {
            console.error("Error submitting form response:", error);
            setFormErrors({
                submit:
                    error.message ||
                    "An error occurred while submitting your registration. Please try again.",
            });
        } finally {
            setRegistrationLoading(false);
        }
    };
    useEffect(() => {
  if (event && event._id && activeTab === "organizers" && teamMembers.length === 0) {
    fetchTeamMembers(event._id);
  }
}, [event, activeTab]);

    // Render form field based on type
    const renderFormField = (field) => {
        // Map fieldType to appropriate input type
        const fieldType = field.type || field.fieldType;
        const fieldName = field.name || field.fieldName;
        const fieldLabel = field.label || field.fieldLabel;

        switch (fieldType) {
            case "text":
            case "email":
            case "number":
            case "tel":
            case "url":
                return (
                    <TextField
                        key={fieldName}
                        name={fieldName}
                        label={fieldLabel}
                        type={fieldType}
                        value={formValues[fieldName] || ""}
                        onChange={handleFormInputChange}
                        fullWidth
                        required={field.required}
                        placeholder={field.placeholder || ""}
                        error={!!formErrors[fieldName]}
                        helperText={formErrors[fieldName] || field.helperText}
                        margin="normal"
                        variant="outlined"
                    />
                );

            case "textarea":
                return (
                    <TextField
                        key={fieldName}
                        name={fieldName}
                        label={fieldLabel}
                        multiline
                        rows={4}
                        value={formValues[fieldName] || ""}
                        onChange={handleFormInputChange}
                        fullWidth
                        required={field.required}
                        placeholder={field.placeholder || ""}
                        error={!!formErrors[fieldName]}
                        helperText={formErrors[fieldName] || field.helperText}
                        margin="normal"
                        variant="outlined"
                    />
                );

            case "select":
                return (
                    <FormControl
                        key={fieldName}
                        fullWidth
                        margin="normal"
                        error={!!formErrors[fieldName]}
                        required={field.required}
                    >
                        <InputLabel>{fieldLabel}</InputLabel>
                        <Select
                            name={fieldName}
                            value={formValues[fieldName] || ""}
                            onChange={handleFormInputChange}
                            label={fieldLabel}
                        >
                            {field.options?.map((option) => (
                                <MenuItem
                                    key={option.value || option}
                                    value={option.value || option}
                                >
                                    {option.label || option}
                                </MenuItem>
                            ))}
                        </Select>
                        {(formErrors[fieldName] || field.helperText) && (
                            <FormHelperText>
                                {formErrors[fieldName] || field.helperText}
                            </FormHelperText>
                        )}
                    </FormControl>
                );

            case "radio":
                return (
                    <FormControl
                        key={fieldName}
                        component="fieldset"
                        margin="normal"
                        error={!!formErrors[fieldName]}
                        required={field.required}
                        fullWidth
                    >
                        <Typography component="legend">{fieldLabel}</Typography>
                        <RadioGroup
                            name={fieldName}
                            value={formValues[fieldName] || ""}
                            onChange={handleFormInputChange}
                        >
                            {field.options?.map((option) => (
                                <FormControlLabel
                                    key={option.value || option}
                                    value={option.value || option}
                                    control={<Radio />}
                                    label={option.label || option}
                                />
                            ))}
                        </RadioGroup>
                        {(formErrors[fieldName] || field.helperText) && (
                            <FormHelperText>
                                {formErrors[fieldName] || field.helperText}
                            </FormHelperText>
                        )}
                    </FormControl>
                );

            case "checkbox":
                return (
                    <FormControl
                        key={fieldName}
                        component="fieldset"
                        margin="normal"
                        error={!!formErrors[fieldName]}
                        required={field.required}
                        fullWidth
                    >
                        <Typography component="legend">{fieldLabel}</Typography>
                        {field.options?.map((option) => (
                            <FormControlLabel
                                key={option.value || option}
                                control={
                                    <Checkbox
                                        name={fieldName}
                                        value={option.value || option}
                                        checked={(formValues[fieldName] || []).includes(
                                            option.value || option
                                        )}
                                        onChange={handleFormInputChange}
                                    />
                                }
                                label={option.label || option}
                            />
                        ))}
                        {(formErrors[fieldName] || field.helperText) && (
                            <FormHelperText>
                                {formErrors[fieldName] || field.helperText}
                            </FormHelperText>
                        )}
                    </FormControl>
                );

            default:
                return null;
        }
    };

    useEffect(() => {
        // Fetch all events to populate related events and tabs
        axios.get(`${BASE_URL}/api/events`)
            .then(response => {
                const events = response.data.data || response.data || [];
                setAllEvents(events);

                // Extract unique event types for tabs
                const types = [...new Set(events.map(e => e.eventType).filter(Boolean))];
                setEventTypes(types);

                // Filter events by current event type
                if (event && event.eventType) {
                    const filtered = events.filter(e =>
                        e.eventType === event.eventType && e._id !== event._id
                    );
                    setFilteredEvents(filtered);
                }

                // Extract event organizers/leaders from the batch info
                if (event && event.eventOrganizerBatch) {
                    setEventLeaders([{
                        name: event.eventOrganizerBatch,
                        role: "Organizer",
                        // Use initials avatar for organizer
                        image: getInitialsAvatar(event.eventOrganizerBatch)
                    }]);
                }

                // If the current event doesn't have populated gallery data, you might need to fetch it
                if (event && (!event.eventGallery || event.eventGallery.length === 0)) {
                    axios.get(`${BASE_URL}/api/events/${event._id}/gallery`)
                        .catch(err => console.error("Error fetching gallery:", err));
                }
            })
            .catch(error => {
                console.error("Error fetching events:", error);
                setAllEvents([]);
                setFilteredEvents([]);
            });
    }, [event]);

    const handleChange = (event, newValue) => {
  setActiveTab(newValue);
  
  // Filter events based on selected tab
  if (newValue === "organizers" && !teamMembers.length) {
    fetchTeamMembers(event._id);
  } else if (newValue !== "about" && newValue !== "guests" && newValue !== "organizers" && 
      newValue !== "gallery" && newValue !== "sponsors" && newValue !== "partners") {
    const filtered = allEvents.filter(e =>
      e.eventType === newValue && e._id !== event._id
    );
    setFilteredEvents(filtered);
  }
};

    const fetchEventDetails = async (eventId) => {
        try {
            const response = await axios.get(`${BASE_URL}/api/events/${eventId}`);
            setSelectedDetailEvent(response.data.data || response.data);
        } catch (error) {
            console.error("Error fetching event details:", error);
        }
    };

    // Helper function to extract Google Drive file ID from event banner
    const extractBannerFileId = (banner) => {
        if (!banner) return '1OSWCFdMnh8Y1wZoepQuup8HXzmcpxxKu'; // Default fallback

        if (typeof banner === 'string') {
            return banner;
        } else {
            // If banner is an object, try to extract fileId or _id
            return banner.fileId || banner._id || '1OSWCFdMnh8Y1wZoepQuup8HXzmcpxxKu';
        }
    };

    // If no event is provided, show a loading state
    if (!event) {
        return <div>Loading event information...</div>;
    }

    // Safety check to ensure eventGuests is always an array
    const safeEventGuests = Array.isArray(event.eventGuests) ? event.eventGuests : [];

    // Safety check to ensure eventGallery is always an array
    const safeEventGallery = Array.isArray(event.eventGallery) ? event.eventGallery : [];

    // Safety check to ensure sponsors is always an array
    const safeEventSponsors = Array.isArray(event.sponsors) ? event.sponsors : [];

    // Extract banner file ID
    const bannerFileId = extractBannerFileId(event.eventBanner);

    return (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-[9999999] p-2 sm:p-4 overflow-hidden">
            <div className="bg-white w-full max-w-7xl mx-auto h-[90vh] sm:h-[85vh] md:h-[90vh] overflow-auto rounded-xl shadow-lg relative p-3 sm:p-4 md:p-6">

                {/* Close Button */}
                <button onClick={onClose} className="absolute top-2 sm:top-4 right-2 sm:right-4 bg-red-500 text-white p-2 rounded-full hover:bg-red-700 z-10">
                    <X size={20} />
                </button>

                {/* Header Banner - Dynamic from backend */}
                <div className="w-full h-40 sm:h-60 md:h-96 border-b border-gray-300 rounded-xl">
                    <iframe
                        src={`https://drive.google.com/file/d/${bannerFileId}/preview`}
                        className="w-full h-full object-cover rounded-xl"
                        title="Event banner"
                        loading="lazy"
                        allow="autoplay"
                    ></iframe>
                </div>

                {/* Profile Section */}
                <div className="px-2 sm:px-4 md:px-6 py-4 flex flex-col sm:flex-row justify-between items-start border-gray-300">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center w-full sm:w-auto mb-4 sm:mb-0">

                        <div className="sm:ml-6">
                            <h1 className="text-2xl sm:text-3xl font-bold">{event.eventName}</h1>
                            <h2 className="text-lg sm:text-xl text-gray-500">{event.eventVenue}</h2>
                            <div className="flex items-center text-gray-500 mt-2">
                                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                                <span className="text-sm sm:text-base">{new Date(event.eventDate).toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}</span>
                            </div>
                            <div className="flex items-center text-gray-500 mt-1">
                                <Clock className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                                <span className="text-sm sm:text-base">{event.eventTime}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex space-x-3 w-full sm:w-auto justify-end">
            
                        {event.eventForm && event.eventForm.formId && event.eventStatus === 'upcoming' && (
                            <Button

                                color="white"
                                bgColor="#ca0019" border={4} borderColor="#ca0019" iconColor="black"
                                startIcon={<ContactMail />}
                                onClick={handleRegisterForEvent}
                                disabled={registrationLoading}
                            >
                                {registrationLoading ? (
                                    <CircularProgress size={24} color="inherit" />
                                ) : (
                                    "Register Now"
                                )}
                            </Button>
                        )}

                    </div>
                </div>

                {/* Dynamic Tabs */}
                <Tabs
                    value={activeTab}
                    onChange={handleChange}
                    textColor="primary"
                    indicatorColor="primary"
                    className="px-2 sm:px-4 md:px-6"
                    variant="scrollable"
                    scrollButtons="auto"
                >
                    <Tab value="about" label="About" />
                    {eventTypes.map(type => (
                        <Tab key={type} value={type} label={type} />
                    ))}
                    <Tab value="gallery" label="Gallery" />
                    <Tab value="guests" label="Guests" />
                    <Tab value="sponsors" label="Sponsors" />
                    <Tab value="organizers" label="Organizers" />
                    {/* Show Community Partners tab only for Bharat TechXperience Hackathon */}
                    {isBharatHackathon && (
                        <Tab value="partners" label="Community Partners" />
                    )}
                </Tabs>

                {/* Main Content */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 p-2 sm:p-4 md:p-6">

                    {/* Dynamic Content */}
                    <div className="md:col-span-2 border-b border-t border-gray-300 p-3 sm:p-4">
                        {activeTab === "about" ? (
                            <>
                                <h2 className="text-xl sm:text-2xl font-bold mb-4">About This Event</h2>
                                <p className="text-gray-600 whitespace-pre-line text-sm sm:text-base">{event.eventDescription}</p>

                                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="bg-gray-100 p-3 sm:p-4 rounded-lg">
                                        <div className="flex items-center">
                                            <Calendar className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-gray-700" />
                                            <h3 className="font-semibold text-gray-700 text-sm sm:text-base">Date</h3>
                                        </div>
                                        <p className="mt-1 text-gray-600 ml-6 sm:ml-7 text-xs sm:text-sm">
                                            {new Date(event.eventDate).toLocaleDateString('en-US', {
                                                weekday: 'long',
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </p>
                                    </div>

                                    <div className="bg-gray-100 p-3 sm:p-4 rounded-lg">
                                        <div className="flex items-center">
                                            <Clock className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-gray-700" />
                                            <h3 className="font-semibold text-gray-700 text-sm sm:text-base">Time</h3>
                                        </div>
                                        <p className="mt-1 text-gray-600 ml-6 sm:ml-7 text-xs sm:text-sm">{event.eventTime}</p>
                                    </div>

                                    <div className="bg-gray-100 p-3 sm:p-4 rounded-lg">
                                        <div className="flex items-center">
                                            <MapPin className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-gray-700" />
                                            <h3 className="font-semibold text-gray-700 text-sm sm:text-base">Venue</h3>
                                        </div>
                                        <p className="mt-1 text-gray-600 ml-6 sm:ml-7 text-xs sm:text-sm">{event.eventVenue}</p>
                                    </div>

                                    <div className="bg-gray-100 p-3 sm:p-4 rounded-lg">
                                        <div className="flex items-center">
                                            <User className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-gray-700" />
                                            <h3 className="font-semibold text-gray-700 text-sm sm:text-base">Organizer</h3>
                                        </div>
                                        <p className="mt-1 text-gray-600 ml-6 sm:ml-7 text-xs sm:text-sm">{event.eventOrganizerBatch}</p>
                                    </div>
                                </div>
                            </>
                        ) : activeTab === "gallery" ? (
                            <>
                                <h2 className="text-xl sm:text-2xl font-bold mb-4">Event Gallery</h2>
                                {safeEventGallery && safeEventGallery.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {safeEventGallery.map((image, index) => {
                                            // Extract the Google Drive file ID from the image object
                                            const driveFileId = typeof image === 'string' ? image :
                                                (image.fileId || image._id || '');

                                            return (
                                                <div key={index} className="w-full h-48 sm:h-56 md:h-64 border border-gray-200 rounded-xl overflow-hidden">
                                                    <iframe
                                                        src={`https://drive.google.com/file/d/${driveFileId}/preview`}
                                                        className="w-full h-full object-cover rounded-xl"
                                                        loading="lazy"
                                                        title={`Event gallery image ${index + 1}`}
                                                        allow="autoplay"
                                                    ></iframe>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <p className="text-gray-600 text-sm sm:text-base">No gallery images available for this event.</p>
                                )}
                            </>
                        ) : activeTab === "guests" ? (
                            <>
                                <h2 className="text-xl sm:text-2xl font-bold mb-4">Event Guests</h2>
                                {safeEventGuests.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {safeEventGuests.map((guest, index) => {
                                            // Safely access nested properties
                                            const guestId = guest?.guestId || {};
                                            const guestName = guestId?.guestName || "Unknown Guest";
                                            // Use initials if no image is available
                                            const guestImage = guestId?.guestImage || getInitialsAvatar(guestName);
                                            const guestDesignation = guestId?.guestDesignation || "No designation provided";
                                            const guestTag = guest?.guestTag || "guest";
                                            const guestCompany = guestId?.guestCompany || "No company provided"; // Corrected variable name

                                            return (
                                                <div key={index} className="border rounded-lg p-3 sm:p-4 flex items-center">
                                                    <img
                                                        src={guestImage}
                                                        className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover"
                                                        alt={guestName}
                                                    />
                                                    <div className="ml-3 sm:ml-4">
                                                        <h3 className="font-semibold text-sm sm:text-base">{guestName}</h3>
                                                        <p className="text-xs sm:text-sm text-gray-500">{guestDesignation}</p>
                                                        <p className="!text-[14px] sm:text-sm text-[#ca0019] capitalize">{guestCompany}</p>
                                                        <p className="text-xs sm:text-sm text-gray-600 capitalize">{guestTag}</p>
                                                       
                                                       
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <p className="text-gray-600 text-sm sm:text-base">No guests listed for this event.</p>
                                )}
                            </>
                        ) : activeTab === "sponsors" ? (
                            <>
                                <h2 className="text-xl sm:text-2xl font-bold mb-4">Event Sponsors</h2>
                                {safeEventSponsors.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {safeEventSponsors.map((sponsor, index) => (
                                            <div key={index} className="border rounded-lg p-3 sm:p-4 flex items-center">
                                                <img
                                                    src={sponsor.logoUrl || "https://t4.ftcdn.net/jpg/03/64/21/11/360_F_364211147_1qgLVxv1Tcq0Ohz3FawUfrtONzz8nq3e.jpg"}
                                                    className="w-12 h-12 sm:w-16 sm:h-16 object-cover"
                                                    alt={sponsor.name}
                                                />
                                                <div className="ml-3 sm:ml-4">
                                                    <h3 className="font-semibold text-sm sm:text-base">{sponsor.name}</h3>
                                                    <p className="text-xs sm:text-sm text-gray-600 capitalize">{sponsor.type}</p>
                                                    {sponsor.notes && <p className="text-xs sm:text-sm text-gray-500">{sponsor.notes}</p>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-600 text-sm sm:text-base">No sponsors listed for this event.</p>
                                )}
                            </>
                        ) : activeTab === "organizers" ? (
  <>
    <h2 className="text-xl sm:text-2xl font-bold mb-4">Event Organizers</h2>
    <div className="border rounded-lg p-3 sm:p-4 mb-6">
      <h3 className="font-semibold text-base sm:text-lg">{event.eventOrganizerBatch}</h3>
      <p className="text-gray-600 mt-2 text-sm sm:text-base">
        The event is organized by {event.eventOrganizerBatch}, a group of passionate individuals dedicated to creating impactful experiences.
      </p>
    </div>
    
    <h3 className="text-lg font-semibold mb-3">Team Members</h3>
    
    {teamsLoading ? (
      <div className="flex justify-center py-8">
        <CircularProgress size={40} />
      </div>
    ) : teamMembers.length > 0 ? (
      <div className="space-y-6">
        {VALID_TEAM_TYPES.map(teamType => {
          // Get members for this team type
          const members = teamMembers.filter(m => m.teamType === teamType);
          if (members.length === 0) return null;
          
          return (
            <div key={teamType} className="border rounded-lg p-3 sm:p-4">
              <h4 className="font-semibold mb-3 text-[#ca0019] capitalize">
                {teamType.replace('-', ' ')}
                <span className="ml-2 text-sm bg-gray-100 px-2 py-1 rounded-full text-gray-600">
                  {members.length} members
                </span>
              </h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {members.map(member => (
                  <div key={member._id} className="flex items-center p-2 border-b border-gray-100">
                    <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
                      <img 
                        src={member.profilePic?.url || getInitialsAvatar(member.fullName)} 
                        alt={member.fullName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{member.fullName}</p>
                      <p className="text-xs text-gray-500">
                        {member.batch && `Batch: ${member.batch}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    ) : (
      <div className="text-center py-6 bg-gray-50 rounded-lg">
        <UsersIcon className="mx-auto w-12 h-12 text-gray-400 mb-2" />
        <p className="text-gray-500">No team members found for this event</p>
      </div>
    )}
  </>
)  : activeTab === "partners" ? (
                            <>
                                <h2 className="text-xl sm:text-2xl font-bold mb-4">Community Partners</h2>
                                <p className="text-gray-600 mb-6 text-sm sm:text-base">
                                  We're proud to partner with these amazing tech communities who are supporting Bharat TechXperience Hackathon 2.0 with resources, mentorship, and outreach.
                                </p>
                                
                                {/* Modern styled community partners grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                  {COMMUNITY_PARTNERS.map((partner, idx) => (
                                    <div key={idx} className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-100">
                                      <div className="h-36 bg-black flex items-center justify-center p-4">
                                        <img 
                                          src={partner.logo} 
                                          alt={`${partner.name} logo`} 
                                          className="max-h-28 max-w-full object-contain"
                                        />
                                      </div>
                                      <div className="p-4">
                                        <h3 className="font-bold text-lg text-gray-800">{partner.name}</h3>
                                        <p className="text-sm text-gray-600 mt-1">{partner.description}</p>
                                        <div className="mt-4 flex items-center">
                                          <Award size={16} className="text-[#ca0019] mr-2" />
                                          <a 
                                            href={partner.website} 
                                            target="_blank" 
                                            rel="noopener noreferrer" 
                                            className="text-[#ca0019] text-sm font-medium hover:underline"
                                          >
                                            Visit Website
                                          </a>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>

                                <div className="mt-8 bg-gradient-to-r from-red-50 to-pink-50 p-4 rounded-lg border border-red-100">
                                  <h3 className="font-semibold text-gray-800">Become a Community Partner</h3>
                                  <p className="text-sm text-gray-700 mt-2">
                                    If your community would like to collaborate with us for the hackathon, please reach out at <a href="mailto:partners@bharathackathon.tech" className="text-[#ca0019] hover:underline">partners@bharathackathon.tech</a>
                                  </p>
                                </div>
                            </>
                        ) : (
                            <>
                                <h2 className="text-xl sm:text-2xl font-bold mb-4">Related {activeTab} Events</h2>
                                {filteredEvents && filteredEvents.length > 0 ? (
                                    <ul className="space-y-3 sm:space-y-4">
                                        {filteredEvents.map(relatedEvent => {
                                            // Extract banner ID for related events
                                            const relatedBannerId = extractBannerFileId(relatedEvent.eventBanner);

                                            return (
                                                <li key={relatedEvent._id} className="p-3 sm:p-4 border rounded-md shadow-md">
                                                    <div className="flex flex-col sm:flex-row">
                                                        <div className="w-full sm:w-20 h-32 sm:h-20 mb-2 sm:mb-0 rounded-md overflow-hidden">
                                                            <iframe
                                                                src={`https://drive.google.com/file/d/${relatedBannerId}/preview`}
                                                                className="w-full h-full object-cover"
                                                                loading="lazy"
                                                                title={`${relatedEvent.eventName} banner`}
                                                                allow="autoplay"
                                                            ></iframe>
                                                        </div>
                                                        <div className="sm:ml-4">
                                                            <strong className="text-sm sm:text-base">{relatedEvent.eventName}</strong>
                                                            <div className="text-xs sm:text-sm text-gray-500">
                                                                <div className="flex items-center mt-1">
                                                                    <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                                                                    {new Date(relatedEvent.eventDate).toLocaleDateString()}
                                                                </div>
                                                                <div className="flex items-center mt-1">
                                                                    <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                                                                    {relatedEvent.eventTime}
                                                                </div>
                                                            </div>
                                                            <button
                                                                onClick={() => fetchEventDetails(relatedEvent._id)}
                                                                className="mt-2 text-blue-500 hover:underline text-xs sm:text-sm"
                                                            >
                                                                Know More
                                                            </button>
                                                        </div>
                                                    </div>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                ) : (
                                    <p className="text-gray-600 text-sm sm:text-base">No related {activeTab} events found.</p>
                                )}
                            </>
                        )}
                    </div>

                    {/* Event Status & Leadership - Right Side */}
                    <div className="border border-gray-300 p-3 sm:p-4 rounded-2xl">
                        <div className="mb-4 sm:mb-6">
                            <h2 className="text-lg sm:text-xl font-bold mb-2">Event Status</h2>
                            <div className={`inline-block px-2 sm:px-3 py-1 rounded-full text-white text-xs sm:text-sm ${event.eventStatus === 'upcoming' ? 'bg-blue-500' :
                                event.eventStatus === 'ongoing' ? 'bg-green-500' : 'bg-gray-500'
                                }`}>
                                {(event.eventStatus || "").charAt(0).toUpperCase() + (event.eventStatus || "").slice(1)}
                            </div>
                        </div>

                        <h2 className="text-lg sm:text-xl font-bold mb-2 sm:mb-4">Community Leaders</h2>
                        <div className="space-y-3 sm:space-y-4">
                            {eventLeaders.map((leader, index) => (
                                <div key={index} className="flex justify-between items-center border-b pb-2">
                                    <div className="flex items-center">
                                        <img
                                            src={leader.image}
                                            className="rounded-full w-10 h-10 sm:w-12 sm:h-12 border border-gray-300 object-cover"
                                            alt={leader.name}
                                        />
                                        <div className="ml-2 sm:ml-3">
                                            <h3 className="font-medium text-sm sm:text-base">{leader.name}</h3>
                                            <p className="text-xs sm:text-sm text-gray-500">{leader.role}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {safeEventGuests.length > 0 && (
                            <div className="mt-4 sm:mt-6">
                                <h2 className="text-lg sm:text-xl font-bold mb-2 sm:mb-4">Featured Guests</h2>
                                <div className="space-y-2 sm:space-y-3">
                                    {safeEventGuests.slice(0, 3).map((guest, index) => {
                                        // Safely access nested properties 
                                        const guestId = guest?.guestId || {};
                                        const guestName = guestId?.guestName || "Guest";
                                        // Use initials avatar if no image is available
                                        const guestImage = guestId?.guestImage || getInitialsAvatar(guestName);
                                        const guestTag = guest?.guestTag || "guest";

                                        return (
                                            <div key={index} className="flex items-center">
                                                <img
                                                    src={guestImage}
                                                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover"
                                                    alt={guestName}
                                                />
                                                <div className="ml-2 sm:ml-3">
                                                    <h3 className="font-medium text-xs sm:text-sm">{guestName}</h3>
                                                    <p className="text-xs text-gray-500">{guestTag}</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {safeEventGuests.length > 3 && (
                                        <button
                                            onClick={() => setActiveTab("guests")}
                                            className="text-blue-500 text-xs sm:text-sm hover:underline mt-1 sm:mt-2"
                                        >
                                            View all {safeEventGuests.length} guests
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}

                        {safeEventSponsors.length > 0 && (
                            <div className="mt-4 sm:mt-6">
                                <h2 className="text-lg sm:text-xl font-bold mb-2 sm:mb-4">Featured Sponsors</h2>
                                <div className="space-y-2 sm:space-y-3">
                                    {safeEventSponsors.slice(0, 3).map((sponsor, index) => (
                                        <div key={index} className="flex items-center">
                                            <img
                                                src={sponsor.logoUrl || "https://t4.ftcdn.net/jpg/03/64/21/11/360_F_364211147_1qgLVxv1Tcq0Ohz3FawUfrtONzz8nq3e.jpg"}
                                                className="w-8 h-8 sm:w-10 sm:h-10 object-cover"
                                                alt={sponsor.name}
                                            />
                                            <div className="ml-2 sm:ml-3">
                                                <h3 className="font-medium text-xs sm:text-sm">{sponsor.name}</h3>
                                                <p className="text-xs text-gray-500 capitalize">{sponsor.type}</p>
                                            </div>
                                        </div>
                                    ))}
                                    {safeEventSponsors.length > 3 && (
                                        <button
                                            onClick={() => setActiveTab("sponsors")}
                                            className="text-blue-500 text-xs sm:text-sm hover:underline mt-1 sm:mt-2"
                                        >
                                            View all {safeEventSponsors.length} sponsors
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Show Partners preview if this is Bharat TechXperience Hackathon */}
                        {isBharatHackathon && (
                            <div className="mt-4 sm:mt-6">
                                <h2 className="text-lg sm:text-xl font-bold mb-2 sm:mb-4">Community Partners</h2>
                                <div className="space-y-2 sm:space-y-3">
                                    {COMMUNITY_PARTNERS.slice(0, 3).map((partner, index) => (
                                        <div key={index} className="flex items-center">
                                            <img
                                                src={partner.logo}
                                                className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
                                                alt={partner.name}
                                            />
                                            <div className="ml-2 sm:ml-3">
                                                <h3 className="font-medium text-xs sm:text-sm">{partner.name}</h3>
                                            </div>
                                        </div>
                                        
                                    ))}
                                    <button
                                        onClick={() => setActiveTab("partners")}
                                        className="text-blue-500 text-xs sm:text-sm hover:underline mt-1 sm:mt-2"
                                    >
                                        View all {COMMUNITY_PARTNERS.length} partners
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Show gallery preview if available */}
                        {safeEventGallery.length > 0 && (
                            <div className="mt-4 sm:mt-6">
                                <h2 className="text-lg sm:text-xl font-bold mb-2 sm:mb-4">Gallery Preview</h2>
                                <div className="space-y-2">
                                    <div className="h-32 border border-gray-200 rounded-xl overflow-hidden">
                                        {safeEventGallery[0] && (
                                            <iframe
                                                src={`https://drive.google.com/file/d/${typeof safeEventGallery[0] === 'string' ? safeEventGallery[0] : (safeEventGallery[0].fileId || safeEventGallery[0]._id || '')}/preview`}
                                                className="w-full h-full object-cover"
                                                loading="lazy"
                                                title="Gallery preview"
                                                allow="autoplay"
                                            ></iframe>
                                        )}
                                    </div>
                                    {safeEventGallery.length > 1 && (
                                        <button
                                            onClick={() => setActiveTab("gallery")}
                                            className="text-blue-500 text-xs sm:text-sm hover:underline mt-1"
                                        >
                                            View all {safeEventGallery.length} images
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Event Details Popup */}
                {selectedDetailEvent && (
                    <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50 p-2 sm:p-4">
                        <div className="bg-white w-11/12 md:w-2/3 lg:w-1/2 p-3 sm:p-6 rounded-xl shadow-lg relative max-h-[80vh] overflow-y-auto">
                            <button
                                onClick={() => setSelectedDetailEvent(null)}
                                className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-red-500 text-white p-2 rounded-full hover:bg-red-700"
                            >
                                <X size={20} />
                            </button>

                            <div className="flex flex-col md:flex-row gap-4 sm:gap-6">
                                <div className="md:w-1/3 h-40 sm:h-48 md:h-64 rounded-lg overflow-hidden">
                                    <iframe
                                        src={`https://drive.google.com/file/d/${extractBannerFileId(selectedDetailEvent.eventBanner)}/preview`}
                                        className="w-full h-full object-cover"
                                        loading="lazy"
                                        title={`${selectedDetailEvent.eventName} banner`}
                                        allow="autoplay"
                                    ></iframe>
                                </div>

                                <div className="md:w-2/3">
                                    <h2 className="text-xl sm:text-2xl font-bold">{selectedDetailEvent.eventName}</h2>

                                    <div className="flex flex-wrap gap-2 mt-2">
                                        <span className="bg-gray-200 text-gray-800 px-2 py-1 rounded text-xs sm:text-sm">
                                            {selectedDetailEvent.eventType}
                                        </span>
                                        <span className={`px-2 py-1 rounded text-xs sm:text-sm text-white ${selectedDetailEvent.eventStatus === 'upcoming' ? 'bg-blue-500' :
                                            selectedDetailEvent.eventStatus === 'ongoing' ? 'bg-green-500' : 'bg-gray-500'
                                            }`}>
                                            {selectedDetailEvent.eventStatus}
                                        </span>
                                    </div>

                                    <div className="mt-4 space-y-2 text-gray-700">
                                        <div className="flex items-center">
                                            <Calendar className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-gray-500" />
                                            <span className="text-xs sm:text-sm">{new Date(selectedDetailEvent.eventDate).toLocaleDateString('en-US', {
                                                weekday: 'long',
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}</span>
                                        </div>

                                        <div className="flex items-center">
                                            <Clock className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-gray-500" />
                                            <span className="text-xs sm:text-sm">{selectedDetailEvent.eventTime}</span>
                                        </div>

                                        <div className="flex items-center">
                                            <MapPin className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-gray-500" />
                                            <span className="text-xs sm:text-sm">{selectedDetailEvent.eventVenue}</span>
                                        </div>

                                        <div className="flex items-center">
                                            <UsersIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-gray-500" />
                                            <span className="text-xs sm:text-sm">{selectedDetailEvent.eventOrganizerBatch}</span>
                                        </div>
                                    </div>

                                    <div className="mt-4">
                                        <h3 className="font-semibold text-base sm:text-lg mb-2">Description</h3>
                                        <p className="text-gray-600 text-xs sm:text-sm">{selectedDetailEvent.eventDescription}</p>
                                    </div>

                                    <div className="mt-6 flex justify-end gap-3">
                                        <Button
                                            color="white"
                                            bgColor="#ca0019"
                                            border={4}
                                            borderColor="#ca0019"
                                            iconColor="black"
                                            onClick={() => {
                                                setSelectedDetailEvent(null);
                                                onClose();
                                                // You could navigate to the event's full page here
                                            }}
                                        >
                                            View Full Details
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            {/* Registration Form Modal */}
            <Dialog
                open={registrationModalOpen}
                onClose={() => !registrationLoading && setRegistrationModalOpen(false)}
                fullWidth
                maxWidth="md"
                sx={{
                    zIndex: 99999999, // Higher than the parent modal's z-index
                    '& .MuiBackdrop-root': {
                        backgroundColor: 'rgba(0, 0, 0, 0.7)' // Making backdrop darker for better visibility
                    }
                }}
            >
                <DialogTitle>
                    Registration Form: {event?.eventName}
                    <IconButton
                        aria-label="close"
                        onClick={() =>
                            !registrationLoading && setRegistrationModalOpen(false)
                        }
                        sx={{ position: "absolute", right: 8, top: 8 }}
                    >
                        <Close />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers>
                    {registrationSuccess ? (
                        <Alert severity="success" sx={{ mb: 2 }}>
                            Your form has been submitted successfully! Thank you for your
                            response.
                        </Alert>
                    ) : (
                        <>
                            {formErrors.submit && (
                                <Alert severity="error" sx={{ mb: 2 }}>
                                    {formErrors.submit}
                                </Alert>
                            )}

                            <Typography variant="body2" color="text.secondary" paragraph>
                                Please complete the following form to register for this event.
                                Fields marked with * are required.
                            </Typography>

                            {formFields.length > 0 ? (
                                formFields.map((field) => renderFormField(field))
                            ) : (
                                <Box
                                    sx={{
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        py: 4,
                                    }}
                                >
                                    <CircularProgress sx={{ mb: 2 }} />
                                    <Typography>Loading form fields...</Typography>
                                </Box>
                            )}
                        </>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button
                        color="white"
                        bgColor="#ca0019" border={4} borderColor="#ca0019" iconColor="black"
                        onClick={() =>
                            !registrationLoading && setRegistrationModalOpen(false)
                        }
                        disabled={registrationLoading}
                    >
                        Cancel
                    </Button>
                    {!registrationSuccess && formFields.length > 0 && (
                        <Button
                            color="white"
                            bgColor="#ca0019" border={4} borderColor="#ca0019" iconColor="black"
                            onClick={handleSubmitRegistrationForm}
                            disabled={registrationLoading}
                            startIcon={
                                registrationLoading ? <CircularProgress size={20} /> : null
                            }
                        >
                            {registrationLoading ? "Submitting..." : "Submit Registration"}
                        </Button>
                    )}
                </DialogActions>
            </Dialog>
        </div>
    );
}
