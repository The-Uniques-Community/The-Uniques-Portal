import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify"; // Make sure this is installed
import dayjs from "dayjs"; // Make sure this is installed
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Card,
  CardContent,
  CardMedia,
  Tab,
  Tabs,
  CircularProgress,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Chip,
  Divider,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Autocomplete,
  Tooltip,
  Fade,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  FormControlLabel,
  FormHelperText,
  RadioGroup,
  Radio,
  Checkbox,
  Alert,
} from "@mui/material";

// Material UI Icons
import {
  PhotoCamera,
  Delete,
  PhotoLibrary,
  Edit,
  Save,
  Close,
  AttachMoney,
  Schedule,
  LocationOn,
  EventNote,
  Group,
  Add,
  PersonAdd,
  ContactMail,
  X,
} from "@mui/icons-material";

// Image gallery component
const Gallery = ({ images, onAddImage, onRemoveImage, readOnly }) => {
  return (
    <Box sx={{ mt: 2 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h6">Event Gallery</Typography>
        {!readOnly && (
          <Button
            variant="contained"
            startIcon={<PhotoCamera />}
            component="label"
            sx={{
              background: "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
              boxShadow: "0 3px 5px 2px rgba(33, 203, 243, .3)",
              transition: "transform 0.2s",
              "&:hover": { transform: "scale(1.02)" },
            }}
          >
            Add Images
            <input
              type="file"
              hidden
              accept="image/*"
              multiple
              onChange={onAddImage}
            />
          </Button>
        )}
      </Box>

      <Grid container spacing={2}>
        {images && images.length > 0 ? (
          images.map((image, index) => (
            <Grid item xs={6} md={4} lg={3} key={index}>
              <Card
                sx={{
                  position: "relative",
                  height: 200,
                  width: "100%",
                  borderRadius: "12px",
                  overflow: "hidden",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  transition: "transform 0.3s, box-shadow 0.3s",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: "0 6px 16px rgba(0,0,0,0.15)",
                  },
                }}
              >
                <iframe
                  class="drive-iframe"
                  src={`https://drive.google.com/file/d/${image.fileId}/preview`}
                  height={200}
                  width={"100%"}
                  allowFullScreen
                ></iframe>
                {!readOnly && (
                  <IconButton
                    sx={{
                      position: "absolute",
                      right: 8,
                      top: 8,
                      bgcolor: "rgba(0,0,0,0.5)",
                      color: "white",
                      "&:hover": { bgcolor: "rgba(255,0,0,0.7)" },
                    }}
                    size="small"
                    onClick={() => onRemoveImage(image._id || index)}
                  >
                    <Delete />
                  </IconButton>
                )}
              </Card>
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <Box
              sx={{
                p: 4,
                textAlign: "center",
                bgcolor: "background.paper",
                borderRadius: 2,
                boxShadow: "inset 0 0 8px rgba(0,0,0,0.05)",
              }}
            >
              <PhotoLibrary
                sx={{ fontSize: 60, color: "text.secondary", mb: 1 }}
              />
              <Typography color="text.secondary">
                No images in gallery
              </Typography>
            </Box>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

// Event view component
const EventView = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [editedEvent, setEditedEvent] = useState({});
  const [gallery, setGallery] = useState([]);
  const [formResponses, setFormResponses] = useState([]);
  const [guestDialogOpen, setGuestDialogOpen] = useState(false);
  const [availableGuests, setAvailableGuests] = useState([]);
  const [selectedGuest, setSelectedGuest] = useState(null);
  const [guestTag, setGuestTag] = useState("");
  const [registrationModalOpen, setRegistrationModalOpen] = useState(false);
  const [formFields, setFormFields] = useState([]);
  const [formValues, setFormValues] = useState({});
  const [formErrors, setFormErrors] = useState({});
  const [registrationLoading, setRegistrationLoading] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [newGuestDialogOpen, setNewGuestDialogOpen] = useState(false);
  const [newGuest, setNewGuest] = useState({
    guestName: "",
    guestEmail: "",
    guestContact: "",
    guestLinkedin: "",
    guestCompany: "",
    guestDesignation: "",
    guestImage: null,
  });
  
  // Loading states for manage buttons
  const [guestButtonLoading, setGuestButtonLoading] = useState(false);
  const [memberButtonLoading, setMemberButtonLoading] = useState(false);
  
  // Add these state variables near the other state declarations in EventView component
const [memberDialogOpen, setMemberDialogOpen] = useState(false);
const [availableMembers, setAvailableMembers] = useState([]);
const [selectedMember, setSelectedMember] = useState(null);
const [memberRole, setMemberRole] = useState("");
const [editingMemberId, setEditingMemberId] = useState(null);
const [teamType, setTeamType] = useState("technical team");
const [eventTeams, setEventTeams] = useState({});
const [teamMembers, setTeamMembers] = useState([]);
const [showTeamMembers, setShowTeamMembers] = useState(false);

// Define valid team types as a constant
const VALID_TEAM_TYPES = [
  "technical team",
  "branding team",
  "infra team", 
  "sponsors team", 
  "hospitality", 
  "guest-management"
];
// Add these functions after other similar functions in the component

// Fetch available members
// Fetch available members for selection
const fetchAvailableMembers = async () => {
  try {
    const response = await fetch(
      `https://theuniquesportal-server.vercel.app/api/admin/member`,
      {
        credentials: "include",
      }
    );
    const data = await response.json();

    if (data.success) {
      setAvailableMembers(data.data || []);
    } else {
      console.error("API returned error:", data);
      toast.error(data.message || "Failed to load members list");
    }
  } catch (error) {
    console.error("Error fetching available members:", error);
    toast.error("Failed to load members list. Please try again.");
  }
};

// Fetch event teams and their members
// Fetch event teams and their members
const fetchEventTeams = async () => {
  try {
    if (!id) {
      console.error("Event ID is missing");
      toast.error("Cannot load team data: Event ID is missing");
      return;
    }
    
    setLoading(true);
    const response = await fetch(
      `https://theuniquesportal-server.vercel.app/api/events/${id}/members`,
      {
        credentials: "include",
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch teams: ${response.status} ${errorText}`);
    }
    
    const data = await response.json();

    if (data.success) {
      const eventData = data.data;
      setEventTeams(eventData || {});
      
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
      
      setTeamMembers(allMembers);
      console.log("Teams loaded successfully:", allMembers);
    } else {
      toast.error(data.message || "Failed to load event teams");
    }
  } catch (error) {
    console.error("Error fetching event teams:", error);
    toast.error(`Error: ${error.message}`);
  } finally {
    setLoading(false);
  }
};

// Open manage members dialog
const handleOpenMemberDialog = async () => {
  setMemberButtonLoading(true);
  try {
    console.log("Fetching available members...");
    await fetchAvailableMembers();
    console.log("Available members:", availableMembers);
    
    setMemberDialogOpen(true);
    
    // Make sure we have the latest team data
    await fetchEventTeams();
  } catch (error) {
    console.error("Error loading members:", error);
  } finally {
    setMemberButtonLoading(false);
  }
};

// Close manage members dialog
const handleCloseMemberDialog = () => {
  setMemberDialogOpen(false);
  setSelectedMember(null);
  setMemberRole("");
  setEditingMemberId(null);
  setMemberButtonLoading(false);
};

// Add or update team members
const handleSaveMember = async () => {
  if (!selectedMember) return;

  try {
    setLoading(true);
    
    // Prepare the API endpoint
    const endpoint = `https://theuniquesportal-server.vercel.app/api/events/${id}/members/team/${teamType}/add`;
    
    const memberIds = [selectedMember._id];
    
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ memberIds }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to add member: ${response.status} ${errorText}`);
    }

    const result = await response.json();

    if (result.success) {
      // Refresh the event teams data
      await fetchEventTeams();
      toast.success(`Member added to ${teamType} successfully!`);
      
      // Reset form fields
      handleCloseMemberDialog();
    } else {
      throw new Error(result.message || "Failed to add member");
    }
  } catch (error) {
    console.error("Error adding member:", error);
    toast.error(`Error: ${error.message}`);
  } finally {
    setLoading(false);
  }
};

// Remove member from team
const handleRemoveMember = async (memberId, memberTeam) => {
  if (!memberId || !memberTeam) return;

  try {
    setLoading(true);

    const endpoint = `https://theuniquesportal-server.vercel.app/api/events/${id}/members/team/${memberTeam}/members`;
    
    const response = await fetch(endpoint, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ memberIds: [memberId] }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to remove member: ${response.status} ${errorText}`);
    }

    const result = await response.json();

    if (result.success) {
      // Refresh the event teams data
      await fetchEventTeams();
      toast.success("Member removed successfully!");
    } else {
      throw new Error(result.message || "Failed to remove member");
    }
  } catch (error) {
    console.error("Error removing member:", error);
    toast.error(`Error: ${error.message}`);
  } finally {
    setLoading(false);
  }
};

  // Fetch event data
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `https://theuniquesportal-server.vercel.app/api/events/${id}`
        );
        const data = await response.json();

        if (data.success) {
          setEvent(data.event);
          setEditedEvent(data.event);

          // Check if event has gallery images
          if (data.event.eventGallery && data.event.eventGallery.length > 0) {
            setGallery(data.event.eventGallery);
          }

          // Fetch form responses if event has a form
          if (data.event.eventForm && data.event.eventForm.formId) {
            fetchFormResponses(data.event._id);
          }
        }
      } catch (error) {
        console.error("Error fetching event details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  // Fetch available guests
  const fetchAvailableGuests = async () => {
    try {
      const response = await fetch(
        `https://theuniquesportal-server.vercel.app/api/guest/get-all-guests`
      );
      const data = await response.json();

      if (data.success) {
        setAvailableGuests(data.guests || []);
      }
    } catch (error) {
      console.error("Error fetching available guests:", error);
    }
  };

  // Fetch form responses
  const fetchFormResponses = async (eventId) => {
    try {
      const response = await fetch(
        `https://theuniquesportal-server.vercel.app/api/events/${eventId}/form-responses`,
        {
          credentials: "include",
        }
      );
      const data = await response.json();

      if (data.success) {
        setFormResponses(data.responses || []);
      }
    } catch (error) {
      console.error("Error fetching form responses:", error);
    }
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Toggle edit mode
  const handleToggleEditMode = () => {
    setEditMode(!editMode);
    if (editMode) {
      // Reset changes if canceling
      setEditedEvent(event);
    }
  };

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedEvent({
      ...editedEvent,
      [name]: value,
    });
  };

  // Handle date change
  const handleDateChange = (date) => {
    setEditedEvent({
      ...editedEvent,
      eventDate: date ? date.format("YYYY-MM-DD") : null,
    });
  };

  // Handle time change
  const handleTimeChange = (time) => {
    setEditedEvent({
      ...editedEvent,
      eventTime: time ? time.format("hh:mm A") : "",
    });
  };

  // Handle status change
  const handleStatusChange = (e) => {
    setEditedEvent({
      ...editedEvent,
      eventStatus: e.target.value,
    });
  };

  // Save event changes
  const handleSaveChanges = async () => {
    try {
      // Show loading indicator
      setLoading(true);

      const response = await fetch(
        `https://theuniquesportal-server.vercel.app/api/events/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(editedEvent),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to update event: ${response.status} ${errorText}`
        );
      }

      const data = await response.json();

      if (data.success) {
        setEvent(data.event);
        setEditMode(false);
        // Show success message
        toast.success("Event updated successfully!");
      } else {
        // Handle error from API response
        throw new Error(data.message || "Failed to update event");
      }
    } catch (error) {
      console.error("Error saving event changes:", error);
      toast.error(
        `Error: ${error.message || "Failed to save changes. Please try again."}`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAddImage = async (e) => {
    try {
      const files = Array.from(e.target.files);
      if (files.length === 0) return;

      // Get authentication token

      // Show loading state
      setLoading(true);

      // Show temporary local images while uploading
      const tempImages = files.map((file) => ({
        _id: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        url: URL.createObjectURL(file),
        isTemp: true,
      }));

      setGallery((prevGallery) => [...prevGallery, ...tempImages]);

      // Upload images to Drive
      const formData = new FormData();

      // Add required fields to formData
      formData.append("eventName", event.eventName);
      formData.append("fileKey", "eventGallery");
      formData.append("eventId", id);

      // Add files
      for (let file of files) {
        formData.append("files", file);
      }

      const uploadResponse = await fetch(
        "https://theuniquesportal-server.vercel.app/upload/event_file_upload",
        {
          method: "POST",

          credentials: "include",
          body: formData,
        }
      );

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        throw new Error(
          `Failed to upload images: ${uploadResponse.status} ${errorText}`
        );
      }

      const uploadResult = await uploadResponse.json();

      if (uploadResult.success !== false) {
        // Refresh the gallery
        const galleryResponse = await fetch(
          `https://theuniquesportal-server.vercel.app/api/events/${id}/gallery`
        );
        const galleryResult = await galleryResponse.json();

        if (galleryResult.success) {
          setGallery(galleryResult.gallery || []);
          toast.success("Images uploaded successfully!");
        }

        // Clean up temp image URLs
        tempImages.forEach((image) => {
          if (image.isTemp && image.url) {
            URL.revokeObjectURL(image.url);
          }
        });
      } else {
        throw new Error(uploadResult.message || "Failed to upload images");
      }
    } catch (error) {
      console.error("Error adding images:", error);
      toast.error(
        `Error: ${error.message || "Failed to add images. Please try again."}`
      );

      // If there was an error, remove temp images
      setGallery((prevGallery) => prevGallery.filter((img) => !img.isTemp));
    } finally {
      setLoading(false);
    }
  };

  // Remove image from gallery
  const handleRemoveImage = async (imageId) => {
    try {
      const response = await fetch(
        `https://theuniquesportal-server.vercel.app/api/events/${id}/gallery`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            imagesToRemove: [imageId],
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to remove image: ${response.status} ${errorText}`
        );
      }

      const result = await response.json();

      if (result.success) {
        setGallery(result.gallery);
      } else {
        throw new Error(result.message || "Failed to remove image");
      }
    } catch (error) {
      console.error("Error removing image:", error);
      toast.error("Failed to remove image. Please try again.");
    }
  };

  // Handle budget navigation
  const handleNavigateToBudget = () => {
    navigate(`/admin/events-overview/${id}/budget`);
  };

  // Handle event registration
  const handleRegisterForEvent = async () => {
    try {
      // If event has a form, open modal with form fields
      if (event.eventForm && event.eventForm.formId) {
        const formLoaded = await fetchFormFields();
        if (formLoaded) {
          setRegistrationModalOpen(true);
        } else {
          // If form couldn't be loaded, show an alert
          toast.error(
            "Could not load registration form. Please try again later."
          );
        }
      } else {
        // Simple registration without form
        setRegistrationLoading(true);

        try {
          const response = await fetch(
            `https://theuniquesportal-server.vercel.app/api/events/${id}/register`,
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

  // Open manage guests dialog
  const handleOpenGuestDialog = async () => {
    setGuestButtonLoading(true);
    try {
      await fetchAvailableGuests();
      setGuestDialogOpen(true);
    } catch (error) {
      console.error("Error loading guests:", error);
    } finally {
      setGuestButtonLoading(false);
    }
  };

  // Close manage guests dialog
  const handleCloseGuestDialog = () => {
    setGuestDialogOpen(false);
    setSelectedGuest(null);
    setGuestTag("");
    setGuestButtonLoading(false);
  };

  const handleOpenNewGuestDialog = () => {
    setNewGuest({
      guestName: "",
      guestEmail: "",
      guestContact: "",
      guestLinkedin: "",
      guestCompany: "",
      guestDesignation: "",
      guestImage: null,
    });
    setNewGuestDialogOpen(true);
  };

  const handleNewGuestInputChange = (e) => {
    const { name, value } = e.target;
    setNewGuest({ ...newGuest, [name]: value });
  };

  const handleSaveNewGuest = async () => {
    try {
      if (!newGuest.guestName) {
        toast.error("Guest name is required");
        return;
      }

      setLoading(true);
      const response = await fetch(
        "https://theuniquesportal-server.vercel.app/api/guest/add-guest",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(newGuest),
        }
      );

      const data = await response.json();

      if (data.success) {
        toast.success("New guest created successfully!");
        setNewGuestDialogOpen(false);
        // Refresh available guests list
        await fetchAvailableGuests();
        // Automatically select the newly created guest
        setSelectedGuest(data.guest);
      } else {
        toast.error(data.message || "Failed to create guest");
      }
    } catch (error) {
      console.error("Error creating new guest:", error);
      toast.error("An error occurred while creating the guest");
    } finally {
      setLoading(false);
    }
  };

  const handleAddGuest = async () => {
    if (!selectedGuest) return;

    try {
      setLoading(true);

      let guestIdToLink;
      let finalGuestTag = guestTag;

      // If selectedGuest is a string, it means a new name was typed (freeSolo)
      if (typeof selectedGuest === "string") {
        // First check if a guest with this name already exists in availableGuests
        const existingGuest = availableGuests.find(
          (g) => g.guestName?.toLowerCase() === selectedGuest.toLowerCase()
        );

        if (existingGuest) {
          guestIdToLink = existingGuest._id;
          if (!finalGuestTag) finalGuestTag = existingGuest.guestDesignation;
        } else {
          // Create a new guest record first
          const createResponse = await fetch(
            "https://theuniquesportal-server.vercel.app/api/guest/add-guest",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              credentials: "include",
              body: JSON.stringify({ guestName: selectedGuest }),
            }
          );
          const createData = await createResponse.json();
          if (createData.success) {
            guestIdToLink = createData.guest._id;
          } else {
            throw new Error(createData.message || "Failed to create new guest");
          }
        }
      } else {
        // Existing guest object selected
        guestIdToLink = selectedGuest._id;
        if (!finalGuestTag) finalGuestTag = selectedGuest.guestDesignation;
      }

      // Now link the guest to the event
      const response = await fetch(
        "https://theuniquesportal-server.vercel.app/api/events/link-guest",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            eventId: id,
            guestId: guestIdToLink,
            guestTag: finalGuestTag || "others",
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to add guest: ${response.status} ${errorText}`);
      }

      const result = await response.json();

      if (result.success) {
        // Refresh the event data to get updated guest list
        const eventResponse = await fetch(
          `https://theuniquesportal-server.vercel.app/api/events/${id}`
        );
        const eventData = await eventResponse.json();

        if (eventData.success) {
          setEvent(eventData.event);
          toast.success("Guest added successfully!");
        }

        // Reset form fields
        setSelectedGuest(null);
        setGuestTag("");
        handleCloseGuestDialog();
      } else {
        throw new Error(result.message || "Failed to add guest");
      }
    } catch (error) {
      console.error("Error adding guest:", error);
      toast.error(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Remove guest from event
  const handleRemoveGuest = async (guestId) => {
    if (!guestId) return;

    try {
      setLoading(true);

      // Method 1: Using event update endpoint since there's no direct remove guest endpoint
      const updatedEvent = { ...event };
      updatedEvent.eventGuests = updatedEvent.eventGuests.filter(
        (guest) => guest.guestId._id !== guestId
      );

      // Format the payload correctly for the API
      const payload = {
        ...updatedEvent,
        eventGuests: updatedEvent.eventGuests.map((guest) => ({
          guestId: guest.guestId._id,
          guestTag: guest.guestTag,
        })),
      };

      const response = await fetch(
        `https://theuniquesportal-server.vercel.app/api/events/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to remove guest: ${response.status} ${errorText}`
        );
      }

      const result = await response.json();

      if (result.success) {
        setEvent(result.event);
        toast.success("Guest removed successfully!");
      } else {
        throw new Error(result.message || "Failed to remove guest");
      }
    } catch (error) {
      console.error("Error removing guest:", error);
      toast.error(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle banner upload
  const handleUploadBanner = async (e) => {
    try {
      const file = e.target.files[0];
      if (!file) return;

      setLoading(true);

      // Create FormData for file upload
      const formData = new FormData();
      formData.append("eventName", event.eventName);
      formData.append("fileKey", "eventBanner");
      formData.append("eventId", id);
      formData.append("files", file);

      const response = await fetch(
        "https://theuniquesportal-server.vercel.app/upload/event_file_upload",
        {
          method: "POST",
          credentials: "include",
          body: formData,
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to upload banner: ${response.status} ${errorText}`
        );
      }

      const result = await response.json();

      if (result.success !== false) {
        // Refresh event data to get updated banner
        const eventResponse = await fetch(
          `https://theuniquesportal-server.vercel.app/api/events/${id}`
        );
        const eventData = await eventResponse.json();

        if (eventData.success) {
          setEvent(eventData.event);
          toast.success("Banner updated successfully!");
        }
      } else {
        throw new Error(result.message || "Failed to upload banner");
      }
    } catch (error) {
      console.error("Error uploading banner:", error);
      toast.error(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "";
    return dayjs(dateString).format("dddd, MMMM D, YYYY");
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
        `https://theuniquesportal-server.vercel.app/api/events/${id}/form-response`,
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
  if (id) {
    fetchEventTeams();
  }
}, [id]);

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

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "80vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!event) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" color="error">
          Event not found
        </Typography>
        <Button
          variant="contained"
          sx={{ mt: 2 }}
          onClick={() => navigate("/admin/events")}
        >
          Back to Events
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header with actions */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
          background:
            "linear-gradient(to right, rgba(255,255,255,0.9), rgba(255,255,255,0.7))",
          p: 2,
          borderRadius: 2,
          boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
        }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: "bold",
              background: "#ca0019",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {editMode ? "Edit Event" : event.eventName}
          </Typography>
          {!editMode && (
            <Typography variant="body1" color="text.secondary">
              {event.eventType} • {formatDate(event.eventDate)}
            </Typography>
          )}
        </Box>
        <Box sx={{ display: "flex", gap: 1 }}>
          {/* Register button beside heading */}
          {/* {event.eventForm && event.eventForm.formId && !editMode && (
            <Button
              variant="contained"
              color="secondary"
              startIcon={<ContactMail />}
              onClick={handleRegisterForEvent}
              disabled={registrationLoading}
              sx={{
                background: "linear-gradient(45deg, #FF5722 30%, #FFA726 90%)",
                boxShadow: "0 3px 5px 2px rgba(255, 105, 135, .3)",
                transition: "transform 0.2s",
                "&:hover": { transform: "scale(1.02)" },
              }}
            >
              {registrationLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Register Now"
              )}
            </Button>
          )} */}

          <Button
            variant={editMode ? "outlined" : "contained"}
            color={editMode ? "error" : "primary"}
            onClick={handleToggleEditMode}
            startIcon={editMode ? <Close /> : <Edit />}
            sx={{
              transition: "all 0.2s",
              ...(editMode
                ? {}
                : {
                    backgroundColor: "#ca0019",
                  }),
              "&:hover": {
                transform: "translateY(-2px)",
              },
            }}
          >
            {editMode ? "Cancel" : "Edit Event"}
          </Button>

          {editMode && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<Save />}
              onClick={handleSaveChanges}
              sx={{
                background: "linear-gradient(45deg, #4CAF50 30%, #8BC34A 90%)",
                boxShadow: "0 3px 5px 2px rgba(76, 175, 80, .3)",
                transition: "transform 0.2s",
                "&:hover": { transform: "translateY(-2px)" },
              }}
            >
              Save Changes
            </Button>
          )}

          <Button
            variant="outlined"
            startIcon={<AttachMoney />}
            onClick={handleNavigateToBudget}
            sx={{
              borderColor: "#4CAF50",
              color: "#4CAF50",
              transition: "all 0.2s",
              "&:hover": {
                borderColor: "#4CAF50",
                backgroundColor: "rgba(76, 175, 80, 0.08)",
                transform: "translateY(-2px)",
              },
            }}
          >
            Manage Budget
          </Button>
        </Box>
      </Box>

      {/* Main content */}
      <Grid container spacing={3}>
        {/* Left column */}
        <Grid item xs={12} md={8}>
          <Paper
            sx={{
              p: 3,
              mb: 3,
              borderRadius: 3,
              boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
              overflow: "hidden",
            }}
            elevation={2}
          >
            {/* Banner image */}
            <Box sx={{ position: "relative", mb: 3 }}>
              {event.eventBanner ? (
                <iframe
                  class="drive-iframe"
                  src={`https://drive.google.com/file/d/${event.eventBanner.fileId}/preview`}
                  width="100%"
                  height={350}
                ></iframe>
              ) : (
                <Box
                  sx={{
                    height: 350,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: "rgba(0,0,0,0.04)",
                    borderRadius: 2,
                  }}
                >
                  <PhotoCamera sx={{ fontSize: 60, color: "text.disabled" }} />
                </Box>
              )}

              {editMode && (
                <Button
                  variant="contained"
                  component="label"
                  startIcon={<PhotoCamera />}
                  sx={{
                    position: "absolute",
                    bottom: 16,
                    right: 16,
                    background: "rgba(0,0,0,0.7)",
                    "&:hover": {
                      background: "rgba(0,0,0,0.9)",
                    },
                  }}
                >
                  Change Banner
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleUploadBanner}
                  />
                </Button>
              )}
            </Box>

            {/* Tabs for different sections */}
            <Box sx={{ width: "100%" }}>
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                  "& .MuiTabs-indicator": {
                    height: 3,
                    borderRadius: 2,
                    backgroundColor: "primary.main",
                  },
                  "& .MuiTab-root": {
                    textTransform: "none",
                    fontWeight: 600,
                    fontSize: "0.95rem",
                    transition: "all 0.2s",
                    "&:hover": {
                      color: "primary.main",
                    },
                  },
                  mb: 1,
                }}
              >
                <Tab label="Details" />
                <Tab label="Gallery" />
                <Tab label="Form Responses" />
              </Tabs>

              <Divider sx={{ mb: 3 }} />

              <Box sx={{ py: 2 }}>
                {/* Details Tab */}
                {tabValue === 0 && (
                  <Box>
                    {editMode ? (
                      <Grid container spacing={3}>
                        <Grid item xs={12}>
                          <TextField
                            name="eventName"
                            label="Event Name"
                            value={editedEvent.eventName || ""}
                            onChange={handleInputChange}
                            fullWidth
                            required
                            variant="outlined"
                            sx={{ mb: 2 }}
                          />
                        </Grid>

                        <Grid item xs={12}>
                          <TextField
                            name="eventDescription"
                            label="Event Description"
                            value={editedEvent.eventDescription || ""}
                            onChange={handleInputChange}
                            multiline
                            rows={4}
                            fullWidth
                            variant="outlined"
                            sx={{ mb: 2 }}
                          />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                          <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker
                              label="Event Date"
                              value={
                                editedEvent.eventDate
                                  ? dayjs(editedEvent.eventDate)
                                  : null
                              }
                              onChange={handleDateChange}
                              slotProps={{
                                textField: {
                                  fullWidth: true,
                                  variant: "outlined",
                                },
                              }}
                              sx={{ mb: 2 }}
                            />
                          </LocalizationProvider>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                          <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <TimePicker
                              label="Event Time"
                              value={
                                editedEvent.eventTime
                                  ? dayjs(`2000-01-01T${editedEvent.eventTime}`)
                                  : null
                              }
                              onChange={handleTimeChange}
                              slotProps={{
                                textField: {
                                  fullWidth: true,
                                  variant: "outlined",
                                },
                              }}
                              sx={{ mb: 2 }}
                            />
                          </LocalizationProvider>
                        </Grid>

                        <Grid item xs={12}>
                          <TextField
                            name="eventVenue"
                            label="Event Venue"
                            value={editedEvent.eventVenue || ""}
                            onChange={handleInputChange}
                            fullWidth
                            variant="outlined"
                            sx={{ mb: 2 }}
                          />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                          <TextField
                            name="eventType"
                            label="Event Type"
                            value={editedEvent.eventType || ""}
                            onChange={handleInputChange}
                            fullWidth
                            variant="outlined"
                            sx={{ mb: 2 }}
                          />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                          <FormControl
                            fullWidth
                            variant="outlined"
                            sx={{ mb: 2 }}
                          >
                            <InputLabel>Event Status</InputLabel>
                            <Select
                              value={editedEvent.eventStatus || "upcoming"}
                              label="Event Status"
                              onChange={handleStatusChange}
                            >
                              <MenuItem value="upcoming">Upcoming</MenuItem>
                              <MenuItem value="ongoing">Ongoing</MenuItem>
                              <MenuItem value="completed">Completed</MenuItem>
                              <MenuItem value="cancelled">Cancelled</MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>

                        <Grid item xs={12}>
                          <TextField
                            name="eventOrganizerBatch"
                            label="Organizer Batch"
                            value={editedEvent.eventOrganizerBatch || ""}
                            onChange={handleInputChange}
                            fullWidth
                            variant="outlined"
                            sx={{ mb: 2 }}
                          />
                        </Grid>
                      </Grid>
                    ) : (
                      <Box>
                        {/* Description */}
                        <Typography
                          variant="subtitle1"
                          fontWeight="bold"
                          sx={{ mt: 2, mb: 1, fontSize: "1.1rem" }}
                        >
                          Description
                        </Typography>
                        <Typography
                          variant="body1"
                          paragraph
                          sx={{ lineHeight: 1.7, color: "text.primary" }}
                        >
                          {event.eventDescription ||
                            "No description available."}
                        </Typography>

                        {/* Event details */}
                        <Typography
                          variant="subtitle1"
                          fontWeight="bold"
                          sx={{ mt: 4, mb: 2, fontSize: "1.1rem" }}
                        >
                          Event Details
                        </Typography>

                        <Grid container spacing={3}>
                          <Grid item xs={12} sm={6}>
                            <Card
                              sx={{
                                bgcolor: "background.paper",
                                boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                                borderRadius: 2,
                                transition: "transform 0.2s",
                                "&:hover": {
                                  transform: "translateY(-3px)",
                                  boxShadow: "0 6px 16px rgba(0,0,0,0.1)",
                                },
                              }}
                            >
                              <CardContent
                                sx={{
                                  display: "flex",
                                  alignItems: "flex-start",
                                }}
                              >
                                <Schedule
                                  sx={{
                                    mr: 2,
                                    color: "primary.main",
                                    fontSize: 28,
                                  }}
                                />
                                <Box>
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{ mb: 0.5 }}
                                  >
                                    Date & Time
                                  </Typography>
                                  <Typography
                                    variant="body1"
                                    sx={{ fontWeight: 500 }}
                                  >
                                    {formatDate(event.eventDate)}
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    sx={{ color: "text.primary", mt: 0.5 }}
                                  >
                                    {event.eventTime}
                                  </Typography>
                                </Box>
                              </CardContent>
                            </Card>
                          </Grid>

                          <Grid item xs={12} sm={6}>
                            <Card
                              sx={{
                                bgcolor: "background.paper",
                                boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                                borderRadius: 2,
                                transition: "transform 0.2s",
                                "&:hover": {
                                  transform: "translateY(-3px)",
                                  boxShadow: "0 6px 16px rgba(0,0,0,0.1)",
                                },
                              }}
                            >
                              <CardContent
                                sx={{
                                  display: "flex",
                                  alignItems: "flex-start",
                                }}
                              >
                                <LocationOn
                                  sx={{
                                    mr: 2,
                                    color: "primary.main",
                                    fontSize: 28,
                                  }}
                                />
                                <Box>
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{ mb: 0.5 }}
                                  >
                                    Venue
                                  </Typography>
                                  <Typography
                                    variant="body1"
                                    sx={{ fontWeight: 500 }}
                                  >
                                    {event.eventVenue || "Venue not specified"}
                                  </Typography>
                                </Box>
                              </CardContent>
                            </Card>
                          </Grid>

                          <Grid item xs={12} sm={6}>
                            <Card
                              sx={{
                                bgcolor: "background.paper",
                                boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                                borderRadius: 2,
                                transition: "transform 0.2s",
                                "&:hover": {
                                  transform: "translateY(-3px)",
                                  boxShadow: "0 6px 16px rgba(0,0,0,0.1)",
                                },
                              }}
                            >
                              <CardContent
                                sx={{
                                  display: "flex",
                                  alignItems: "flex-start",
                                }}
                              >
                                <EventNote
                                  sx={{
                                    mr: 2,
                                    color: "primary.main",
                                    fontSize: 28,
                                  }}
                                />
                                <Box>
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{ mb: 0.5 }}
                                  >
                                    Event Type
                                  </Typography>
                                  <Typography
                                    variant="body1"
                                    sx={{ fontWeight: 500 }}
                                  >
                                    {event.eventType || "Not specified"}
                                  </Typography>
                                </Box>
                              </CardContent>
                            </Card>
                          </Grid>

                          <Grid item xs={12} sm={6}>
                            <Card
                              sx={{
                                bgcolor: "background.paper",
                                boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                                borderRadius: 2,
                                transition: "transform 0.2s",
                                "&:hover": {
                                  transform: "translateY(-3px)",
                                  boxShadow: "0 6px 16px rgba(0,0,0,0.1)",
                                },
                              }}
                            >
                              <CardContent
                                sx={{
                                  display: "flex",
                                  alignItems: "flex-start",
                                }}
                              >
                                <Group
                                  sx={{
                                    mr: 2,
                                    color: "primary.main",
                                    fontSize: 28,
                                  }}
                                />
                                <Box>
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{ mb: 0.5 }}
                                  >
                                    Organizer Batch
                                  </Typography>
                                  <Typography
                                    variant="body1"
                                    sx={{ fontWeight: 500 }}
                                  >
                                    {event.eventOrganizerBatch ||
                                      "Not specified"}
                                  </Typography>
                                </Box>
                              </CardContent>
                            </Card>
                          </Grid>
                        </Grid>

                        {/* Budget summary */}
                        {event.budget && event.budget.totalAllocated > 0 && (
                          <Box sx={{ mt: 4 }}>
                            <Typography
                              variant="subtitle1"
                              fontWeight="bold"
                              sx={{ mb: 2, fontSize: "1.1rem" }}
                            >
                              Budget Overview
                            </Typography>
                            <Card
                              sx={{
                                bgcolor: "background.paper",
                                boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                                borderRadius: 2,
                              }}
                            >
                              <CardContent>
                                <Grid container spacing={2}>
                                  <Grid item xs={4}>
                                    <Typography
                                      variant="body2"
                                      color="text.secondary"
                                    >
                                      Total Budget
                                    </Typography>
                                    <Typography
                                      variant="h6"
                                      sx={{
                                        fontWeight: 600,
                                        color: "text.primary",
                                      }}
                                    >
                                      ₹
                                      {event.budget.totalAllocated.toLocaleString()}
                                    </Typography>
                                  </Grid>
                                  <Grid item xs={4}>
                                    <Typography
                                      variant="body2"
                                      color="text.secondary"
                                    >
                                      Total Spent
                                    </Typography>
                                    <Typography
                                      variant="h6"
                                      sx={{
                                        fontWeight: 600,
                                        color: "text.primary",
                                      }}
                                    >
                                      ₹
                                      {event.budget.totalSpent.toLocaleString()}
                                    </Typography>
                                  </Grid>
                                  <Grid item xs={4}>
                                    <Typography
                                      variant="body2"
                                      color="text.secondary"
                                    >
                                      Remaining
                                    </Typography>
                                    <Typography
                                      variant="h6"
                                      sx={{ fontWeight: 600 }}
                                      color={
                                        event.budget.remaining >= 0
                                          ? "success.main"
                                          : "error.main"
                                      }
                                    >
                                      ₹{event.budget.remaining.toLocaleString()}
                                    </Typography>
                                  </Grid>
                                </Grid>
                                <Button
                                  variant="outlined"
                                  size="small"
                                  sx={{ mt: 2 }}
                                  onClick={handleNavigateToBudget}
                                >
                                  View Details
                                </Button>
                              </CardContent>
                            </Card>
                          </Box>
                        )}
                      </Box>
                    )}
                  </Box>
                )}

                {/* Gallery Tab */}
                {tabValue === 1 && (
                  <Gallery
                    images={gallery}
                    onAddImage={handleAddImage}
                    onRemoveImage={handleRemoveImage}
                    readOnly={!editMode}
                  />
                )}

                {/* Form Responses Tab */}
                {tabValue === 2 && (
                  <Box>
                    {event.eventForm && event.eventForm.formId ? (
                      <Box>
                        {/* Previous code for form preview section */}

                        <Divider sx={{ my: 3 }} />

                        <Typography
                          variant="subtitle1"
                          fontWeight="bold"
                          sx={{ mb: 2 }}
                        >
                          Submissions ({formResponses.length})
                        </Typography>

                        {formResponses.length > 0 ? (
                          (() => {
                            // Get all unique keys from all responses
                            const allKeys = new Set();
                            formResponses.forEach((response) => {
                              if (response.responses) {
                                Object.keys(response.responses).forEach((key) =>
                                  allKeys.add(key)
                                );
                              }
                            });
                            const responseKeys = Array.from(allKeys);

                            return (
                              <TableContainer
                                component={Paper}
                                sx={{
                                  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                                  borderRadius: 2,
                                  overflow: "hidden",
                                  overflowX: "auto", // Add horizontal scroll for many columns
                                }}
                              >
                                <Table>
                                  <TableHead
                                    sx={{ bgcolor: "rgba(0,0,0,0.02)" }}
                                  >
                                    <TableRow>
                                      {/* Fixed columns */}
                                      <TableCell
                                        sx={{
                                          fontWeight: "bold",
                                          minWidth: 180,
                                        }}
                                      >
                                        Respondent
                                      </TableCell>

                                      {/* Dynamic columns based on all possible response fields */}
                                      {responseKeys.map((key) => (
                                        <TableCell
                                          key={key}
                                          sx={{
                                            fontWeight: "bold",
                                            minWidth: 120,
                                          }}
                                        >
                                          {key}
                                        </TableCell>
                                      ))}

                                      {/* Fixed columns at the end */}
                                      {/* <TableCell
                                        sx={{
                                          fontWeight: "bold",
                                          minWidth: 100,
                                        }}
                                      >
                                        Status
                                      </TableCell> */}
                                      <TableCell
                                        sx={{
                                          fontWeight: "bold",
                                          minWidth: 150,
                                        }}
                                      >
                                        Submitted On
                                      </TableCell>
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    {formResponses.map((response, index) => (
                                      <TableRow
                                        key={response._id || index}
                                        sx={{
                                          "&:hover": {
                                            backgroundColor: "rgba(0,0,0,0.02)",
                                          },
                                          transition: "background-color 0.2s",
                                        }}
                                      >
                                        {/* Respondent info */}
                                        <TableCell>
                                          <Box
                                            sx={{
                                              display: "flex",
                                              alignItems: "center",
                                            }}
                                          >
                                            <Avatar
                                              sx={{
                                                mr: 1,
                                                width: 32,
                                                height: 32,
                                              }}
                                            >
                                              {(
                                                response.respondent?.member
                                                  ?.memberName ||
                                                response.respondent?.name ||
                                                "A"
                                              ).charAt(0)}
                                            </Avatar>
                                            <Box>
                                              <Typography
                                                variant="body2"
                                                sx={{ fontWeight: "medium" }}
                                              >
                                                {response.respondent?.member
                                                  ?.memberName ||
                                                  response.respondent?.name ||
                                                  ""}
                                              </Typography>
                                              <Typography
                                                variant="caption"
                                                color="text.secondary"
                                              >
                                                {response.respondent?.member
                                                  ?.memberEmail ||
                                                  response.respondent?.email ||
                                                  "No email"}
                                              </Typography>
                                            </Box>
                                          </Box>
                                        </TableCell>

                                        {/* Dynamic response values */}
                                        {responseKeys.map((key) => (
                                          <TableCell key={key}>
                                            {response.responses &&
                                            response.responses[key] !==
                                              undefined
                                              ? Array.isArray(
                                                  response.responses[key]
                                                )
                                                ? response.responses[key].join(
                                                    ", "
                                                  )
                                                : String(
                                                    response.responses[key]
                                                  )
                                              : "—"}
                                          </TableCell>
                                        ))}

                                        {/* Status */}
                                        {/* <TableCell>
                                          <Chip
                                            size="small"
                                            label={response.status}
                                            color={
                                              response.status === "approved"
                                                ? "success"
                                                : response.status === "rejected"
                                                ? "error"
                                                : "default"
                                            }
                                          />
                                        </TableCell> */}

                                        {/* Date */}
                                        <TableCell>
                                          {response.metadata?.submittedAt
                                            ? new Date(
                                                response.metadata.submittedAt
                                              ).toLocaleString()
                                            : response.createdAt
                                            ? new Date(
                                                response.createdAt
                                              ).toLocaleString()
                                            : "Unknown"}
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </TableContainer>
                            );
                          })()
                        ) : (
                          <Box
                            sx={{
                              p: 4,
                              textAlign: "center",
                              bgcolor: "background.paper",
                              borderRadius: 2,
                              boxShadow: "inset 0 0 8px rgba(0,0,0,0.05)",
                            }}
                          >
                            <Typography color="text.secondary">
                              No form responses yet
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    ) : (
                      <Box
                        sx={{
                          p: 4,
                          textAlign: "center",
                          bgcolor: "background.paper",
                          borderRadius: 2,
                          boxShadow: "inset 0 0 8px rgba(0,0,0,0.05)",
                        }}
                      >
                        <Typography color="text.secondary">
                          No registration form attached to this event
                        </Typography>
                      </Box>
                    )}
                  </Box>
                )}
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Right column - Side panel */}
        <Grid item xs={12} md={4}>
          {/* Event Status Card */}
          <Card
            sx={{
              mb: 3,
              borderRadius: 3,
              boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
              overflow: "hidden",
            }}
          >
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Event Status
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    backgroundColor:
                      event.eventStatus === "ongoing"
                        ? "#ff4d4f"
                        : event.eventStatus === "completed"
                        ? "#52c41a"
                        : event.eventStatus === "cancelled"
                        ? "#8c8c8c"
                        : "#faad14",
                    mr: 1,
                    boxShadow: `0 0 8px ${
                      event.eventStatus === "ongoing"
                        ? "#ff4d4f"
                        : event.eventStatus === "completed"
                        ? "#52c41a"
                        : event.eventStatus === "cancelled"
                        ? "#8c8c8c"
                        : "#faad14"
                    }`,
                  }}
                />
                <Typography
                  variant="body1"
                  sx={{
                    textTransform: "capitalize",
                    fontWeight: "medium",
                    color:
                      event.eventStatus === "ongoing"
                        ? "#cf1322"
                        : event.eventStatus === "completed"
                        ? "#389e0d"
                        : event.eventStatus === "cancelled"
                        ? "#595959"
                        : "#d48806",
                  }}
                >
                  {event.eventStatus}
                </Typography>
              </Box>

              {!editMode && (
                <FormControl fullWidth size="small" variant="outlined">
                  <InputLabel>Update Status</InputLabel>
                  <Select
                    value=""
                    label="Update Status"
                    onChange={async (e) => {
                      try {
                        setLoading(true);
                        const response = await fetch(
                          `https://theuniquesportal-server.vercel.app/api/events/${id}/status`,
                          {
                            method: "PATCH",
                            headers: {
                              "Content-Type": "application/json",
                            },
                            credentials: "include",
                            body: JSON.stringify({ status: e.target.value }),
                          }
                        );

                        if (!response.ok) {
                          const errorText = await response.text();
                          throw new Error(
                            `Failed to update status: ${response.status} ${errorText}`
                          );
                        }

                        const data = await response.json();

                        if (data.success) {
                          setEvent({
                            ...event,
                            eventStatus: data.event.eventStatus,
                          });
                        } else {
                          throw new Error(
                            data.message || "Failed to update status"
                          );
                        }
                      } catch (error) {
                        console.error("Error updating event status:", error);
                        toast.success(
                          `Error: ${
                            error.message ||
                            "Failed to update status. Please try again."
                          }`
                        );
                      } finally {
                        setLoading(false);
                      }
                    }}
                  >
                    <MenuItem value="upcoming">Upcoming</MenuItem>
                    <MenuItem value="ongoing">Ongoing</MenuItem>
                    <MenuItem value="completed">Completed</MenuItem>
                    <MenuItem value="cancelled">Cancelled</MenuItem>
                  </Select>
                </FormControl>
              )}
            </CardContent>
          </Card>

          {/* Guests Card */}
          <Card
            sx={{
              mb: 3,
              borderRadius: 3,
              boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
              overflow: "hidden",
            }}
          >
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Event Guests
                </Typography>
                <Chip
                  label={`${event.eventGuests?.length || 0} guests`}
                  size="small"
                  color="primary"
                  sx={{ fontWeight: 500 }}
                />
              </Box>

              {event.eventGuests && event.eventGuests.length > 0 ? (
                <List sx={{ overflowY: "auto", maxHeight: 300 }}>
                  {event.eventGuests.map((guest, index) => (
                    <ListItem
                      key={index}
                      alignItems="flex-start"
                      sx={{
                        px: 0,
                        transition: "background-color 0.2s",
                        "&:hover": { backgroundColor: "rgba(0,0,0,0.02)" },
                        borderRadius: 1,
                      }}
                      secondaryAction={
                        !editMode && (
                          <IconButton
                            edge="end"
                            size="small"
                            onClick={() =>
                              handleRemoveGuest(guest.guestId?._id)
                            }
                            sx={{
                              opacity: 0.6,
                              "&:hover": { opacity: 1, color: "error.main" },
                            }}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        )
                      }
                    >
                      <ListItemAvatar>
                        <Avatar
                          src={guest.guestId?.guestImage?.url}
                          sx={{
                            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                          }}
                        >
                          {guest.guestId?.guestName?.charAt(0) || "G"}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={guest.guestId?.guestName || "Unknown Guest"}
                        secondary={
                          <React.Fragment>
                            <Typography
                              variant="body2"
                              component="span"
                              sx={{ display: "block" }}
                            >
                              {guest.guestId?.guestDesignation}
                              {guest.guestId?.guestCompany && (
                                <>, {guest.guestId.guestCompany}</>
                              )}
                            </Typography>
                            {guest.guestTag && (
                              <Chip
                                label={guest.guestTag}
                                size="small"
                                sx={{ mt: 0.5, fontSize: "0.7rem" }}
                                variant="outlined"
                              />
                            )}
                          </React.Fragment>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Box
                  sx={{
                    p: 3,
                    textAlign: "center",
                    bgcolor: "background.paper",
                    borderRadius: 2,
                    boxShadow: "inset 0 0 8px rgba(0,0,0,0.05)",
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    No guests added to this event yet
                  </Typography>
                </Box>
              )}

              {!editMode && (
                <Button
                  variant="outlined"
                  startIcon={guestButtonLoading ? <CircularProgress size={16} /> : <PersonAdd />}
                  size="medium"
                  disabled={guestButtonLoading}
                  sx={{
                    mt: 2,
                    width: "100%",
                    borderColor: "primary.main",
                    color: "primary.main",
                    "&:hover": {
                      backgroundColor: "rgba(33, 150, 243, 0.08)",
                      borderColor: "primary.main",
                    },
                  }}
                  onClick={handleOpenGuestDialog}
                >
                  {guestButtonLoading ? "Loading Guests..." : "Manage Guests"}
                </Button>
              )}
            </CardContent>
          </Card>
          
          {/* Event Team Card - Replace existing card content */}
<Card
  sx={{
    mb: 3,
    borderRadius: 3,
    boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
    overflow: "hidden",
  }}
>
  <CardContent>
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        mb: 2,
      }}
    >
      <Typography variant="h6" sx={{ fontWeight: 600 }}>
        Event Team
      </Typography>
      <Box>
        <Chip
          label={`${teamMembers.length || 0} members`}
          size="small"
          color="primary"
          sx={{ fontWeight: 500, mr: 1 }}
        />
        <Chip
          label={`${Object.keys(
            teamMembers.reduce((acc, member) => {
              acc[member.teamType] = true;
              return acc;
            }, {})
          ).length} teams`}
          size="small"
          color="secondary"
          sx={{ fontWeight: 500 }}
        />
      </Box>
    </Box>

    {teamMembers.length > 0 ? (
      <List sx={{ overflowY: "auto", maxHeight: 300 }}>
        {VALID_TEAM_TYPES.map(teamType => {
          const teamData = teamMembers.filter(m => m.teamType === teamType);
          if (teamData.length === 0) return null;
          
          return (
            <Box key={teamType} sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ 
                fontWeight: 'bold',
                ml: 1,
                mb: 0.5 
              }}>
                {teamType.toUpperCase()}
              </Typography>
              <Divider sx={{ mb: 1 }} />
              
              {teamData.slice(0, 3).map((member) => (
                <ListItem
                  key={member._id}
                  alignItems="flex-start"
                  sx={{
                    px: 1,
                    py: 0.5,
                    transition: "background-color 0.2s",
                    "&:hover": { backgroundColor: "rgba(0,0,0,0.02)" },
                    borderRadius: 1,
                  }}
                >
                  <ListItemAvatar sx={{ minWidth: 40 }}>
                    <Avatar
                      src={member.profilePic?.url}
                      sx={{ width: 30, height: 30 }}
                    >
                      {member.fullName?.charAt(0) || "M"}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={member.fullName || "Unknown Member"}
                    secondary={member.email}
                    primaryTypographyProps={{ variant: 'body2' }}
                    secondaryTypographyProps={{ variant: 'caption' }}
                  />
                </ListItem>
              ))}
              
              {teamData.length > 3 && (
                <Typography variant="caption" color="primary" sx={{ ml: 7 }}>
                  + {teamData.length - 3} more members
                </Typography>
              )}
            </Box>
          );
        })}
      </List>
    ) : (
      <Box
        sx={{
          p: 3,
          textAlign: "center",
          bgcolor: "background.paper",
          borderRadius: 2,
          boxShadow: "inset 0 0 8px rgba(0,0,0,0.05)",
        }}
      >
        <Typography variant="body2" color="text.secondary">
          No team members added to this event yet
        </Typography>
      </Box>
    )}

    {!editMode && (
      <Button
        variant="outlined"
        startIcon={memberButtonLoading ? <CircularProgress size={16} /> : <PersonAdd />}
        size="medium"
        disabled={memberButtonLoading}
        sx={{
          mt: 2,
          width: "100%",
          borderColor: "secondary.main",
          color: "secondary.main",
          "&:hover": {
            backgroundColor: "rgba(156, 39, 176, 0.08)",
            borderColor: "secondary.main",
          },
        }}
        onClick={handleOpenMemberDialog}
      >
        {memberButtonLoading ? "Loading Members..." : "Manage Team Members"}
      </Button>
    )}
  </CardContent>
</Card>

          {/* Quick Stats Card */}
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
              overflow: "hidden",
              background: "linear-gradient(to right bottom, #f9f9f9, #ffffff)",
            }}
          >
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Quick Stats
              </Typography>

              <Grid container spacing={2}>
                {event.eventForm && (
                  <Grid item xs={6}>
                    <Card
                      sx={{
                        boxShadow: "none",
                        backgroundColor: "rgba(33, 150, 243, 0.04)",
                        borderRadius: 2,
                        transition: "transform 0.3s",
                        "&:hover": {
                          transform: "translateY(-4px)",
                        },
                      }}
                    >
                      <CardContent sx={{ textAlign: "center", p: 2 }}>
                        <Typography
                          variant="h4"
                          color="primary.main"
                          sx={{ fontWeight: 700 }}
                        >
                          {formResponses.length}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Registrations
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                )}

                {event.eventGallery && (
                  <Grid item xs={6}>
                    <Card
                      sx={{
                        boxShadow: "none",
                        backgroundColor: "rgba(76, 175, 80, 0.04)",
                        borderRadius: 2,
                        transition: "transform 0.3s",
                        "&:hover": {
                          transform: "translateY(-4px)",
                        },
                      }}
                    >
                      <CardContent sx={{ textAlign: "center", p: 2 }}>
                        <Typography
                          variant="h4"
                          sx={{ color: "#4caf50", fontWeight: 700 }}
                        >
                          {gallery.length}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Gallery Images
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                )}

                <Grid item xs={6}>
                  <Card
                    sx={{
                      boxShadow: "none",
                      backgroundColor: "rgba(255, 152, 0, 0.04)",
                      borderRadius: 2,
                      transition: "transform 0.3s",
                      "&:hover": {
                        transform: "translateY(-4px)",
                      },
                    }}
                  >
                    <CardContent sx={{ textAlign: "center", p: 2 }}>
                      <Typography
                        variant="h4"
                        sx={{ color: "#ff9800", fontWeight: 700 }}
                      >
                        {event.eventMembers?.length || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Team Members
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={6}>
                  <Card
                    sx={{
                      boxShadow: "none",
                      backgroundColor: "rgba(156, 39, 176, 0.04)",
                      borderRadius: 2,
                      transition: "transform 0.3s",
                      "&:hover": {
                        transform: "translateY(-4px)",
                      },
                    }}
                  >
                    <CardContent sx={{ textAlign: "center", p: 2 }}>
                      <Typography
                        variant="h4"
                        sx={{ color: "#9c27b0", fontWeight: 700 }}
                      >
                        {event.eventGuests?.length || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Guests
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Manage Guests Dialog */}
      <Dialog
        open={guestDialogOpen}
        onClose={handleCloseGuestDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Manage Event Guests</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Add New Guest
            </Typography>
            <Autocomplete
              freeSolo
              options={availableGuests || []}
              getOptionLabel={(option) => {
                if (typeof option === "string") return option;
                return option.guestName
                  ? `${option.guestName} - ${
                      option.guestDesignation || "No designation"
                    }`
                  : "";
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Guest Name"
                  placeholder="Type a name or select existing"
                  variant="outlined"
                  fullWidth
                />
              )}
              value={selectedGuest}
              onChange={(e, newValue) => setSelectedGuest(newValue)}
              onInputChange={(e, newInputValue) => {
                if (!selectedGuest || typeof selectedGuest === "string") {
                  setSelectedGuest(newInputValue);
                }
              }}
              sx={{ mb: 2 }}
            />
            <TextField
              label="Guest Tag (Optional)"
              variant="outlined"
              fullWidth
              value={guestTag}
              onChange={(e) => setGuestTag(e.target.value)}
              placeholder="Speaker, Judge, Mentor, etc."
              helperText="How would you like to describe this guest's role?"
            />
            <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<Add />}
                onClick={handleAddGuest}
                disabled={!selectedGuest}
                fullWidth
              >
                Add Guest to Event
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                startIcon={<PersonAdd />}
                onClick={handleOpenNewGuestDialog}
                fullWidth
              >
                Create New Guest
              </Button>
            </Box>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Typography variant="subtitle2" sx={{ mb: 2 }}>
            Current Guests
          </Typography>

          <List sx={{ bgcolor: "background.paper", borderRadius: 1 }}>
            {event.eventGuests && event.eventGuests.length > 0 ? (
              event.eventGuests.map((guest, index) => (
                <ListItem
                  key={index}
                  secondaryAction={
                    <IconButton
                      edge="end"
                      onClick={() => handleRemoveGuest(guest.guestId?._id)}
                      color="error"
                    >
                      <Delete />
                    </IconButton>
                  }
                >
                  <ListItemAvatar>
                    <Avatar src={guest.guestId?.guestImage?.url}>
                      {guest.guestId?.guestName?.charAt(0) || "G"}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={guest.guestId?.guestName || "Unknown Guest"}
                    secondary={
                      <>
                        {guest.guestId?.guestDesignation}
                        {guest.guestTag && (
                          <Chip
                            label={guest.guestTag}
                            size="small"
                            sx={{ ml: 1, fontSize: "0.7rem" }}
                            variant="outlined"
                          />
                        )}
                      </>
                    }
                  />
                </ListItem>
              ))
            ) : (
              <ListItem>
                <ListItemText
                  primary="No guests added"
                  secondary="Add guests from the form above"
                  sx={{ textAlign: "center", color: "text.secondary" }}
                />
              </ListItem>
            )}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseGuestDialog}>Close</Button>
        </DialogActions>
      </Dialog>
      {/* Add this just after the Manage Guests Dialog */}
      {/* Manage Members Dialog */}
      {/* Team-based Member Management Dialog */}
<Dialog
  open={memberDialogOpen}
  onClose={handleCloseMemberDialog}
  maxWidth="md"
  fullWidth
>
  <DialogTitle>Manage Event Team Members</DialogTitle>
  <DialogContent>
    {/* Add New Member Form */}
    <Box sx={{ mb: 3 }}>
      <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
        Add New Team Member
      </Typography>
      
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Team</InputLabel>
        <Select
          value={teamType}
          onChange={(e) => setTeamType(e.target.value)}
          label="Team"
        >
          {VALID_TEAM_TYPES.map((type) => (
            <MenuItem key={type} value={type}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </MenuItem>
          ))}
        </Select>
        <FormHelperText>
          Select which team this member will join
        </FormHelperText>
      </FormControl>
      
      <Autocomplete
        options={availableMembers || []}
        getOptionLabel={(option) =>
          option.fullName
            ? `${option.fullName} - ${option.email || "No email"}`
            : ""
        }
        renderInput={(params) => (
          <TextField
            {...params}
            label="Select Member"
            variant="outlined"
            fullWidth
            required
          />
        )}
        value={selectedMember}
        onChange={(e, newValue) => setSelectedMember(newValue)}
        sx={{ mb: 2 }}
      />
      
      <Button
        variant="contained"
        color="secondary"
        startIcon={<Add />}
        onClick={handleSaveMember}
        disabled={!selectedMember || !teamType}
        sx={{ mt: 1 }}
      >
        Add to Team
      </Button>
    </Box>

    <Divider sx={{ my: 3 }} />
    
    {/* Toggle View Button */}
    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
      <Typography variant="subtitle1" fontWeight="bold">
        Current Team Members
      </Typography>
      <Button
        variant="outlined"
        size="small"
        onClick={() => setShowTeamMembers(!showTeamMembers)}
      >
        {showTeamMembers ? "View by Member" : "View by Team"}
      </Button>
    </Box>
    
    {/* Display Team Members */}
    {showTeamMembers ? (
      // View By Team
      // View By Team (in the dialog)
VALID_TEAM_TYPES.map((type) => {
  // Find members with this team type
  const teamMembers = teamMembers.filter(m => m.teamType === type);
  
  return (
    <Box key={type} sx={{ mb: 3 }}>
      <Typography 
        variant="subtitle2" 
        sx={{ 
          mb: 1, 
          display: 'flex', 
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <span>
          {type.charAt(0).toUpperCase() + type.slice(1)} 
          <Chip 
            label={teamMembers.length} 
            size="small" 
            color="primary" 
            sx={{ ml: 1 }}
          />
        </span>
      </Typography>
      
      {teamMembers.length > 0 ? (
        <List dense sx={{ bgcolor: "background.paper", borderRadius: 1 }}>
          {teamMembers.map((member) => (
            <ListItem
              key={member._id}
              secondaryAction={
                <IconButton
                  edge="end"
                  size="small"
                  onClick={() => handleRemoveMember(member._id, type)}
                  color="error"
                >
                  <Delete fontSize="small" />
                </IconButton>
              }
            >
              <ListItemAvatar>
                <Avatar src={member.profilePic?.url}>
                  {member.fullName?.charAt(0) || "M"}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={member.fullName || "Unknown Member"}
                secondary={
                  <>
                    {member.email}
                    {member.batch && (
                      <Typography component="span" variant="caption" sx={{ ml: 1 }}>
                        • Batch: {member.batch}
                      </Typography>
                    )}
                  </>
                }
              />
            </ListItem>
          ))}
        </List>
      ) : (
        <Box sx={{ p: 1, bgcolor: "background.paper", borderRadius: 1, textAlign: "center" }}>
          <Typography variant="body2" color="text.secondary">
            No members in this team
          </Typography>
        </Box>
      )}
    </Box>
  );
})
    ) : (
      // View all members
      <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell>Member</TableCell>
              <TableCell>Team</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {teamMembers.length > 0 ? (
              teamMembers.map((member) => (
                <TableRow key={`${member._id}-${member.teamType}`}>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Avatar 
                        src={member.profilePic?.url} 
                        sx={{ width: 30, height: 30, mr: 1 }}
                      >
                        {member.fullName?.charAt(0) || "M"}
                      </Avatar>
                      <Box>
                        <Typography variant="body2">{member.fullName}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {member.email}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={member.teamType} 
                      size="small" 
                      color="primary" 
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => handleRemoveMember(member._id, member.teamType)}
                      color="error"
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} align="center">
                  <Typography variant="body2" color="text.secondary">
                    No team members added
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    )}
  </DialogContent>
  <DialogActions>
    <Button onClick={handleCloseMemberDialog}>Close</Button>
  </DialogActions>
</Dialog>

      {/* Registration Form Modal */}
      <Dialog
        open={registrationModalOpen}
        onClose={() => !registrationLoading && setRegistrationModalOpen(false)}
        fullWidth
        maxWidth="md"
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
            onClick={() =>
              !registrationLoading && setRegistrationModalOpen(false)
            }
            disabled={registrationLoading}
          >
            Cancel
          </Button>
          {!registrationSuccess && formFields.length > 0 && (
            <Button
              variant="contained"
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
      {/* New Guest Dialog */}
      <Dialog
        open={newGuestDialogOpen}
        onClose={() => setNewGuestDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create New Guest</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ pt: 1, display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              name="guestName"
              label="Guest Name"
              value={newGuest.guestName}
              onChange={handleNewGuestInputChange}
              fullWidth
              required
            />
            <TextField
              name="guestEmail"
              label="Guest Email"
              value={newGuest.guestEmail}
              onChange={handleNewGuestInputChange}
              fullWidth
            />
            <TextField
              name="guestDesignation"
              label="Designation"
              value={newGuest.guestDesignation}
              onChange={handleNewGuestInputChange}
              fullWidth
              placeholder="e.g. Senior Developer"
            />
            <TextField
              name="guestCompany"
              label="Company"
              value={newGuest.guestCompany}
              onChange={handleNewGuestInputChange}
              fullWidth
              placeholder="e.g. Google"
            />
            <TextField
              name="guestContact"
              label="Contact Number"
              value={newGuest.guestContact}
              onChange={handleNewGuestInputChange}
              fullWidth
            />
            <TextField
              name="guestLinkedin"
              label="LinkedIn URL"
              value={newGuest.guestLinkedin}
              onChange={handleNewGuestInputChange}
              fullWidth
            />
            <TextField
              name="guestImage"
              label="Image URL"
              value={newGuest.guestImage}
              onChange={handleNewGuestInputChange}
              fullWidth
              placeholder="https://example.com/image.jpg"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewGuestDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleSaveNewGuest}
            variant="contained"
            color="primary"
          >
            Create Guest
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EventView;
