import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  ArrowLeft, 
  Share2, 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Users as UsersIcon, 
  Award,
  Copy,
  Check
} from 'lucide-react';
import { 
  Tabs, 
  Tab, 
  CircularProgress, 
  TextField, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  FormHelperText, 
  RadioGroup, 
  FormControlLabel, 
  Radio, 
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button as MuiButton,
  Typography,
  Box,
  IconButton,
  Alert
} from '@mui/material';
import { Close, ContactMail } from '@mui/icons-material';
import { FaLinkedinIn, FaWhatsapp, FaTwitter, FaFacebookF } from "react-icons/fa";
import { toast } from 'react-toastify';
import { BASE_URL } from "@/config";
import Button from "@/utils/Buttons/Button";

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

const VALID_TEAM_TYPES = [
  "technical team",
  "branding team",
  "infra team", 
  "sponsors team", 
  "hospitality", 
  "guest-management"
];

const EventDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // State management
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("about");
  const [eventLeaders, setEventLeaders] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [teamsLoading, setTeamsLoading] = useState(false);

  // Share functionality state
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [customMessage, setCustomMessage] = useState('');
  const [copied, setCopied] = useState(false);

  // Registration functionality state
  const [registrationModalOpen, setRegistrationModalOpen] = useState(false);
  const [formFields, setFormFields] = useState([]);
  const [formValues, setFormValues] = useState({});
  const [formErrors, setFormErrors] = useState({});
  const [registrationLoading, setRegistrationLoading] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  // Helper functions
  const getNameInitials = (name) => {
    if (!name) return "??";
    const names = name.split(' ');
    if (names.length === 1) {
      return names[0].substring(0, 2).toUpperCase();
    }
    return (names[0].charAt(0) + names[1].charAt(0)).toUpperCase();
  };

  const getInitialsAvatar = (name) => {
    const initials = getNameInitials(name);
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=ca0019&color=ffffff&size=150&bold=true`;
  };

  const extractBannerFileId = (banner) => {
    if (!banner) return '1OSWCFdMnh8Y1wZoepQuup8HXzmcpxxKu';
    if (typeof banner === 'string') {
      return banner;
    } else {
      return banner.fileId || banner._id || '1OSWCFdMnh8Y1wZoepQuup8HXzmcpxxKu';
    }
  };

  // Fetch event data
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log("Fetching event with ID:", id);
        
        const response = await axios.get(`${BASE_URL}/api/events/${id}`);
        console.log("API Response:", response.data);
        
        // Handle different possible response structures
        let eventData = null;
        
        if (response.data) {
          eventData = response.data.data || 
                     response.data.event || 
                     response.data.result || 
                     response.data;
          
          if (Array.isArray(eventData)) {
            eventData = eventData[0];
          }
        }
        
        console.log("Processed event data:", eventData);
        
        if (eventData && (eventData._id || eventData.id)) {
          setEvent(eventData);
          
          // Set default custom message
          setCustomMessage(`Check out this amazing event: ${eventData.eventName}! 🎉`);
          
          // Set event leaders
          if (eventData.eventOrganizerBatch) {
            setEventLeaders([{
              name: eventData.eventOrganizerBatch,
              role: "Organizer",
              image: getInitialsAvatar(eventData.eventOrganizerBatch)
            }]);
          }
        } else {
          console.error("Invalid event data structure:", eventData);
          setError('Event not found or invalid data structure');
        }
      } catch (error) {
        console.error('Error fetching event:', error);
        if (error.response?.status === 404) {
          setError('Event not found');
        } else {
          setError('Failed to load event details');
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchEvent();
    } else {
      setError('No event ID provided');
      setLoading(false);
    }
  }, [id]);

  // Fetch team members
  const fetchTeamMembers = async (eventId) => {
    if (!eventId) return;
    
    try {
      setTeamsLoading(true);
      const response = await axios.get(`${BASE_URL}/api/events/${eventId}/members`);
      
      if (response.data && response.data.success && response.data.data) {
        const eventData = response.data.data;
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
        
        setTeamMembers(allMembers);
      } else {
        setTeamMembers([]);
      }
    } catch (error) {
      console.error("Error fetching team members:", error);
      setTeamMembers([]);
    } finally {
      setTeamsLoading(false);
    }
  };

  // Load team members when organizers tab is active
  useEffect(() => {
    if (event && event._id && activeTab === "organizers" && teamMembers.length === 0) {
      fetchTeamMembers(event._id);
    }
  }, [event, activeTab, teamMembers.length]);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    
    if (newValue === "organizers" && !teamMembers.length) {
      fetchTeamMembers(event._id);
    }
  };

  // Share functionality
  const currentUrl = window.location.href;

  const handleShare = (platform) => {
    const shareUrl = currentUrl;
    const shareText = customMessage || `Check out this event: ${event?.eventName}!`;
    const fullShareText = `${shareText}\n\n${shareUrl}`;

    switch (platform) {
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}&summary=${encodeURIComponent(shareText)}`, '_blank');
        break;
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(fullShareText)}`, '_blank');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`, '_blank');
        break;
      case 'copy':
        navigator.clipboard.writeText(fullShareText);
        setCopied(true);
        toast.success("Event link copied to clipboard!");
        setTimeout(() => setCopied(false), 2000);
        break;
      default:
        break;
    }
    setShareModalOpen(false);
  };

  // Registration functionality
  const handleRegisterForEvent = async () => {
    try {
      if (event.eventForm && event.eventForm.formId) {
        const formLoaded = await fetchFormFields();
        if (formLoaded) {
          setRegistrationModalOpen(true);
        } else {
          toast.error("Could not load registration form. Please try again later.");
        }
      } else {
        setRegistrationLoading(true);
        try {
          const response = await fetch(
            `${BASE_URL}/api/events/${id}/register`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
            }
          );

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Registration failed: ${response.status} ${errorText}`);
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

  const fetchFormFields = async () => {
    try {
      setFormErrors({});

      if (!event?.eventForm?.formId) {
        setFormErrors({ submit: "This event doesn't have a registration form." });
        return false;
      }

      let fields = [];

      if (event.eventForm.formId.fields && event.eventForm.formId.fields.length > 0) {
        fields = event.eventForm.formId.fields.map((field) => ({
          name: field.fieldName,
          label: field.fieldLabel,
          type: field.fieldType,
          placeholder: field.placeholder,
          required: field.required,
          options: field.options || [],
          helperText: "",
        }));
      } else if (event.eventForm.formFeilds && event.eventForm.formFeilds.length > 0) {
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
        setFormErrors({ submit: "No form fields found for this event." });
        return false;
      }

      setFormFields(fields);

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
      setFormErrors({ submit: "An error occurred while preparing the form." });
      return false;
    }
  };

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

    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: "",
      });
    }
  };

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

  const handleSubmitRegistrationForm = async () => {
    if (!validateForm()) return;

    try {
      setRegistrationLoading(true);

      const requestBody = {
        responses: formValues,
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
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Form submission failed (${response.status}): ${errorText}`);
      }

      const result = await response.json();

      if (result.success) {
        setRegistrationSuccess(true);
        setTimeout(() => {
          setRegistrationModalOpen(false);
          setRegistrationSuccess(false);
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
        submit: error.message || "An error occurred while submitting your registration. Please try again.",
      });
    } finally {
      setRegistrationLoading(false);
    }
  };

  const renderFormField = (field) => {
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

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center">
          <CircularProgress size={40} />
          <p className="mt-4 text-gray-600">Loading event details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Event Not Found</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/events')}
            className="bg-[#ca0019] text-white px-6 py-2 rounded-lg hover:bg-[#a00015] transition-colors"
          >
            Back to Events
          </button>
        </div>
      </div>
    );
  }

  if (!event) return null;

  // Check if this is the Bharat TechXperience Hackathon event
  const isBharatHackathon = event?.eventName === "Bharat TechXperience Hackathon 2.0";

  // Safety checks
  const safeEventGuests = Array.isArray(event.eventGuests) ? event.eventGuests : [];
  const safeEventGallery = Array.isArray(event.eventGallery) ? event.eventGallery : [];
  const safeEventSponsors = Array.isArray(event.sponsors) ? event.sponsors : [];

  const bannerFileId = extractBannerFileId(event.eventBanner);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Back Button and Share */}
      <div className="bg-white ">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-600 hover:text-[#ca0019] transition-colors"
            >
              <ArrowLeft size={20} />
              <span>Back</span>
            </button>

            <button
              onClick={() => setShareModalOpen(true)}
              className="flex items-center gap-2 bg-[#ca0019] text-white px-4 py-2 rounded-lg hover:bg-[#a00015] transition-colors"
            >
              <Share2 size={18} />
              <span>Share Event</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Banner */}
        <div className="w-full h-40 sm:h-60 md:h-96 border border-gray-200 rounded-xl overflow-hidden mb-8">
          <iframe
            src={`https://drive.google.com/file/d/${bannerFileId}/preview`}
            className="w-full h-full object-cover"
            title="Event banner"
            loading="lazy"
            allow="autoplay"
          />
        </div>

        {/* Profile Section */}
        <div className="bg-white rounded-lg  mb-8">
          <div className="px-4 sm:px-6 py-6 flex flex-col sm:flex-row justify-between items-start">
            <div className="flex flex-col sm:flex-row items-start sm:items-center w-full sm:w-auto mb-4 sm:mb-0">
              <div className="sm:ml-6">
                <h1 className="text-2xl sm:text-3xl font-bold">{event.eventName}</h1>
                <h2 className="text-lg sm:text-xl text-gray-500">{event.eventVenue}</h2>
                <div className="flex items-center text-gray-500 mt-2">
                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  <span className="text-sm sm:text-base">
                    {new Date(event.eventDate).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
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
                  bgColor="#ca0019"
                  border={4}
                  borderColor="#ca0019"
                  iconColor="black"
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

          {/* Tabs */}
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            textColor="primary"
            indicatorColor="primary"
            className="px-4 sm:px-6"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab value="about" label="About" />
            <Tab value="gallery" label="Gallery" />
            <Tab value="guests" label="Guests" />
            <Tab value="sponsors" label="Sponsors" />
            <Tab value="organizers" label="Organizers" />
            {isBharatHackathon && (
              <Tab value="partners" label="Community Partners" />
            )}
          </Tabs>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Dynamic Content */}
          <div className="md:col-span-2 bg-white rounded-lg  p-4 sm:p-6">
            {activeTab === "about" && (
              <>
                <h2 className="text-xl sm:text-2xl font-bold mb-4">About This Event</h2>
                <p className="text-gray-600 whitespace-pre-line text-sm sm:text-base mb-6">
                  {event.eventDescription}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            )}

            {activeTab === "gallery" && (
              <>
                <h2 className="text-xl sm:text-2xl font-bold mb-4">Event Gallery</h2>
                {safeEventGallery.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {safeEventGallery.map((image, index) => {
                      const driveFileId = typeof image === 'string' ? image :
                        (image.fileId || image._id || '');

                      return (
                        <div key={index} className="w-full h-48 sm:h-56 md:h-64 border border-gray-200 rounded-xl overflow-hidden">
                          <iframe
                            src={`https://drive.google.com/file/d/${driveFileId}/preview`}
                            className="w-full h-full object-cover"
                            loading="lazy"
                            title={`Event gallery image ${index + 1}`}
                            allow="autoplay"
                          />
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-gray-600 text-sm sm:text-base">No gallery images available for this event.</p>
                )}
              </>
            )}

            {activeTab === "guests" && (
              <>
                <h2 className="text-xl sm:text-2xl font-bold mb-4">Event Guests</h2>
                {safeEventGuests.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {safeEventGuests.map((guest, index) => {
                      const guestId = guest?.guestId || {};
                      const guestName = guestId?.guestName || "Unknown Guest";
                      const guestImage = guestId?.guestImage || getInitialsAvatar(guestName);
                      const guestDesignation = guestId?.guestDesignation || "No designation provided";
                      const guestTag = guest?.guestTag || "guest";
                      const guestCompany = guestId?.guestCompany || "No company provided";

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
                            <p className="text-xs sm:text-sm text-[#ca0019] capitalize">{guestCompany}</p>
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
            )}

            {activeTab === "sponsors" && (
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
            )}

            {activeTab === "organizers" && (
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
            )}

            {activeTab === "partners" && (
              <>
                <h2 className="text-xl sm:text-2xl font-bold mb-4">Community Partners</h2>
                <p className="text-gray-600 mb-6 text-sm sm:text-base">
                  We're proud to partner with these amazing tech communities who are supporting Bharat TechXperience Hackathon 2.0 with resources, mentorship, and outreach.
                </p>
                
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
            )}
          </div>

          {/* Event Status & Leadership - Right Side */}
          <div className="bg-white rounded-lg  p-4 sm:p-6 h-fit">
            <div className="mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-bold mb-2">Event Status</h2>
              <div className={`inline-block px-2 sm:px-3 py-1 rounded-full text-white text-xs sm:text-sm ${
                event.eventStatus === 'upcoming' ? 'bg-blue-500' :
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

            {/* Featured Guests Preview */}
            {safeEventGuests.length > 0 && (
              <div className="mt-4 sm:mt-6">
                <h2 className="text-lg sm:text-xl font-bold mb-2 sm:mb-4">Featured Guests</h2>
                <div className="space-y-2 sm:space-y-3">
                  {safeEventGuests.slice(0, 3).map((guest, index) => {
                    const guestId = guest?.guestId || {};
                    const guestName = guestId?.guestName || "Guest";
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

            {/* Featured Sponsors Preview */}
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

            {/* Partners Preview for Bharat Hackathon */}
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

            {/* Gallery Preview */}
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
                      />
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
      </div>

      {/* Share Modal */}
      <Dialog
        open={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          Share Event
          <IconButton
            aria-label="close"
            onClick={() => setShareModalOpen(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" color="text.secondary" paragraph>
            Share this event with your friends and network!
          </Typography>
          
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Custom Message"
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value)}
            placeholder="Add your personal message here..."
            margin="normal"
          />
          
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Share on:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              <MuiButton
                onClick={() => handleShare('linkedin')}
                startIcon={<FaLinkedinIn />}
                variant="outlined"
                size="small"
                sx={{ borderColor: '#0077B5', color: '#0077B5', '&:hover': { backgroundColor: '#0077B5', color: 'white' } }}
              >
                LinkedIn
              </MuiButton>
              <MuiButton
                onClick={() => handleShare('whatsapp')}
                startIcon={<FaWhatsapp />}
                variant="outlined"
                size="small"
                sx={{ borderColor: '#25D366', color: '#25D366', '&:hover': { backgroundColor: '#25D366', color: 'white' } }}
              >
                WhatsApp
              </MuiButton>
              <MuiButton
                onClick={() => handleShare('twitter')}
                startIcon={<FaTwitter />}
                variant="outlined"
                size="small"
                sx={{ borderColor: '#1DA1F2', color: '#1DA1F2', '&:hover': { backgroundColor: '#1DA1F2', color: 'white' } }}
              >
                Twitter
              </MuiButton>
              <MuiButton
                onClick={() => handleShare('facebook')}
                startIcon={<FaFacebookF />}
                variant="outlined"
                size="small"
                sx={{ borderColor: '#1877F2', color: '#1877F2', '&:hover': { backgroundColor: '#1877F2', color: 'white' } }}
              >
                Facebook
              </MuiButton>
            </Box>
          </Box>
          
          <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
            <Typography variant="subtitle2" gutterBottom>
              Event URL:
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" sx={{ wordBreak: 'break-all', flex: 1 }}>
                {currentUrl}
              </Typography>
              <IconButton
                onClick={() => handleShare('copy')}
                color="primary"
                size="small"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
              </IconButton>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <MuiButton onClick={() => setShareModalOpen(false)}>
            Close
          </MuiButton>
        </DialogActions>
      </Dialog>

      {/* Registration Modal */}
      <Dialog
        open={registrationModalOpen}
        onClose={() => setRegistrationModalOpen(false)}
        fullWidth
        maxWidth="md"
        PaperProps={{
          sx: { maxHeight: '90vh' }
        }}
      >
        <DialogTitle>
          Register for {event?.eventName}
          <IconButton
            aria-label="close"
            onClick={() => setRegistrationModalOpen(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ maxHeight: '70vh', overflowY: 'auto' }}>
          {registrationSuccess ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Check sx={{ fontSize: 64, color: 'green', mb: 2 }} />
              <Typography variant="h5" gutterBottom>
                Registration Successful!
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Thank you for registering. You will receive a confirmation email shortly.
              </Typography>
            </Box>
          ) : (
            <>
              <Typography variant="body2" color="text.secondary" paragraph>
                Please fill out the registration form below to secure your spot at this event.
              </Typography>
              
              {formErrors.submit && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {formErrors.submit}
                </Alert>
              )}

              <Box component="form" onSubmit={(e) => e.preventDefault()}>
                {formFields.map(renderFormField)}
              </Box>
            </>
          )}
        </DialogContent>
        {!registrationSuccess && (
          <DialogActions sx={{ p: 2 }}>
            <MuiButton 
              onClick={() => setRegistrationModalOpen(false)}
              disabled={registrationLoading}
            >
              Cancel
            </MuiButton>
            <MuiButton
              onClick={handleSubmitRegistrationForm}
              variant="contained"
              disabled={registrationLoading}
              sx={{ 
                backgroundColor: '#ca0019', 
                '&:hover': { backgroundColor: '#a00015' },
                minWidth: 120
              }}
            >
              {registrationLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Register Now'
              )}
            </MuiButton>
          </DialogActions>
        )}
      </Dialog>
    </div>
  );
};

export default EventDetailPage;
