import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  Stack,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  IconButton,
  Grid,
  Divider,
  FormHelperText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Autocomplete,
  Avatar,
  FormControlLabel,
  Checkbox,
  ImageList,
  ImageListItem,
  CircularProgress,
  Snackbar,
  Alert,
  InputAdornment
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import ImageIcon from '@mui/icons-material/Image';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ArrowBack } from "@mui/icons-material";

const EVENT_TYPES = [
  "Workshop",
  "Seminar",
  "Webinar",
  "Hackathon",
  "Competition",
  "Conference",
  "Fest",
  "Cultural",
  "Ideathon",
  "Sports",
  "Talk Show",
  "Meetup",
  "Others",
];

const EVENT_BATCHES = [
  "The Uniques 1.0",
  "The Uniques 2.0",
  "The Uniques 3.0",
  "The Uniques 4.0",
  "The Uniques 5.0",
];

const GUEST_TAGS = [
  "speaker",
  "moderator",
  "panelist",
  "judge",
  "mentor",
  "organizer",
  "sponsor",
  "partner",
  "chief guest",
  "others",
];

const FIELD_TYPES = [
  "text",
  "email",
  "number",
  "select",
  "checkbox",
  "radio",
  "date",
  "textarea",
  "file",
];

// Form field validation schema
const validationSchema = Yup.object({
  eventName: Yup.string().required("Event name is required"),
  eventDescription: Yup.string().required("Event description is required"),
  eventType: Yup.string().required("Event type is required"),
  eventDate: Yup.string().nullable(),
  eventTime: Yup.string(),
  eventVenue: Yup.string(),
  eventOrganizerBatch: Yup.string(),
});

// New guest form validation (using your model's field names)
const guestValidationSchema = Yup.object({
  guestName: Yup.string().required("Guest name is required"),
  guestEmail: Yup.string().email("Invalid email"),
  guestCompany: Yup.string(),
  guestDesignation: Yup.string(),
});

const EventForm = ({ event, onSuccess }) => {
  const navigate = useNavigate();
  // First define isEdit before using it in state declarations
  // const isEdit = Boolean(event);

  const [formFields, setFormFields] = useState(
    event?.eventForm?.formFeilds || []
  );
  const [bannerFile, setBannerFile] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(
    event?.eventBanner?.fileUrl || ""
  );
  // Add gallery states
  const [galleryFiles, setGalleryFiles] = useState([]);
  const [galleryPreviews, setGalleryPreviews] = useState([]);
  const [replaceExistingGallery, setReplaceExistingGallery] = useState(false);
  const [existingGallery, setExistingGallery] = useState([]);

  const [allGuests, setAllGuests] = useState([]);
  const [openGuestDialog, setOpenGuestDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const isEdit = Boolean(event);

  // Add sponsors state variables after other state variables
  const [hasSponsors, setHasSponsors] = useState(event?.sponsors && event.sponsors.length > 0);
  const [sponsors, setSponsors] = useState(event?.sponsors || []);
  const [currentReceipt, setCurrentReceipt] = useState(null);

  // Add sponsor type constants
  const SPONSOR_TYPES = ["cash", "in-kind", "services"];
  const SPONSOR_STATUS = ["pending", "received"];

  // Fetch all guests on component mount
  useEffect(() => {
    fetchGuests();

    // If editing an event, fetch its gallery images
    if (isEdit && event?._id) {
      fetchEventGallery(event._id);
    }
  }, [isEdit, event]);

  const fetchGuests = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/guest/get-all-guests"
      );
      setAllGuests(response.data.guests || []);
    } catch (error) {
      console.error("Error fetching guests:", error);
    }
  };

  // Fetch event gallery images
  const fetchEventGallery = async (eventId) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/events/${eventId}?populate=gallery`,
        { withCredentials: true }
      );
      if (response.data.event && response.data.event.eventGallery) {
        setExistingGallery(response.data.event.eventGallery || []);
      }
    } catch (error) {
      console.error("Error fetching event gallery:", error);
    }
  };

  // Handle banner file selection
  const handleBannerChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setBannerFile(file);

    // Create preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setBannerPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Handle gallery files selection
  const handleGalleryChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setGalleryFiles((prev) => [...prev, ...files]);

    // Create preview URLs for all selected files
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setGalleryPreviews((prev) => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  // Remove a gallery file from selection
  const removeGalleryFile = (index) => {
    setGalleryFiles((prev) => prev.filter((_, i) => i !== index));
    setGalleryPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const formatDateForInput = (dateString) => {
    if (!dateString) return "";

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";

    return date.toISOString().split("T")[0]; // Returns YYYY-MM-DD
  };

  const formik = useFormik({
    initialValues: {
      eventName: event?.eventName || "",
      eventDescription: event?.eventDescription || "",
      eventBanner: event?.eventBanner || "",
      eventDate: formatDateForInput(event?.eventDate) || "",
      eventTime: event?.eventTime || "",
      eventVenue: event?.eventVenue || "",
      eventOrganizerBatch: event?.eventOrganizerBatch || "",
      eventType: event?.eventType || "",
      eventStatus: event?.eventStatus || "upcoming",
      eventGuests: event?.eventGuests || [],
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);

        let eventId = isEdit ? event._id : null;
        let bannerId = values.eventBanner;

        // Step 1: Handle banner upload if a new file was selected
        if (bannerFile) {
          const bannerFormData = new FormData();
          bannerFormData.append("files", bannerFile);
          bannerFormData.append("eventName", values.eventName);
          bannerFormData.append("fileKey", "eventBanner");

          // If editing, include the event ID to update existing banner
          if (isEdit) {
            bannerFormData.append("eventId", eventId);
          }

          try {
            const uploadResponse = await axios.post(
              "http://localhost:5000/upload/event_file_upload",
              bannerFormData
            );

            if (
              uploadResponse.data.files &&
              uploadResponse.data.files.length > 0
            ) {
              bannerId = uploadResponse.data.files[0]._id;
              console.log("Banner uploaded successfully:", uploadResponse.data);
            }
          } catch (uploadError) {
            console.error("Error uploading banner:", uploadError);
            // Continue with form submission even if upload fails
          }
        }

        const galleryIds = [];

        // Step 2: Handle gallery uploads if any
        if (galleryFiles && galleryFiles.length > 0) {
          const galleryFormData = new FormData();

          // Add each gallery file to form data
          for (const file of galleryFiles) {
            galleryFormData.append("files", file);
          }

          galleryFormData.append("eventName", values.eventName);
          galleryFormData.append("fileKey", "eventGallery");

          // If editing, include the event ID to link files to existing event
          // and specify whether to replace existing gallery or add to it
          if (isEdit) {
            galleryFormData.append("eventId", eventId);
            galleryFormData.append(
              "replaceGallery",
              replaceExistingGallery ? "true" : "false"
            );
          }

          try {
            const galleryResponse = await axios.post(
              "http://localhost:5000/upload/event_file_upload",
              galleryFormData
            );

            if (
              galleryResponse.data.files &&
              galleryResponse.data.files.length > 0
            ) {
              galleryIds.push(
                ...galleryResponse.data.files.map((file) => file._id)
              );
            }
            console.log("Gallery uploads processed:", galleryResponse.data);

            // No need to update the form values as the backend handles the connections
          } catch (galleryError) {
            console.error("Error uploading gallery images:", galleryError);
            // Continue with form submission even if gallery upload fails
          }
        }

        // Inside formik.onSubmit, before creating eventData
        // Process receipt uploads if any
        if (currentReceipt) {
          const receiptFormData = new FormData();
          receiptFormData.append("files", currentReceipt.file);
          receiptFormData.append("eventName", values.eventName);
          receiptFormData.append("fileKey", "sponsorReceipt");

          try {
            const receiptResponse = await axios.post(
              "http://localhost:5000/upload/event_file_upload",
              receiptFormData
            );

            if (receiptResponse.data.files && receiptResponse.data.files.length > 0) {
              // Update the receipt ID in the sponsor
              const newSponsors = [...sponsors];
              newSponsors[currentReceipt.index].receiptId = receiptResponse.data.files[0]._id;
              delete newSponsors[currentReceipt.index].hasNewReceipt; // Remove temp flag
              setSponsors(newSponsors);
            }
          } catch (receiptError) {
            console.error("Error uploading receipt:", receiptError);
          }
        }

        // Step 3: Format event data for submission
        const formattedValues = { ...values };
        if (formattedValues.eventDate) {
          formattedValues.eventDate = new Date(
            formattedValues.eventDate
          ).toISOString();
        }

        console.log("eventGallery", galleryIds);

        // Update the eventData object to include sponsors
        const eventData = {
          ...formattedValues,
          eventBanner: bannerId,
          eventGallery: galleryIds,
          eventForm: {
            formFeilds: formFields
          },
          // Include sponsors data if hasSponsors is true
          sponsors: hasSponsors ? sponsors : []
        };

        // Step 4: Create or update the event
        let response;
        if (isEdit) {
          response = await axios.put(
            `http://localhost:5000/api/events/${eventId}`,
            eventData,
            { withCredentials: true }
          );
        } else {
          response = await axios.post(
            "http://localhost:5000/api/events",
            eventData,
            { withCredentials: true }
          );
          eventId = response.data.event._id; // Get new event ID for guest linking
        }

        //toast and redirect
        if (response.data.success || response.data.event) {
          // Set success message based on whether creating or editing
          const message = isEdit
            ? `Event "${values.eventName}" has been updated successfully!`
            : `Event "${values.eventName}" has been created successfully!`;

          setSuccessMessage(message);
          setShowSuccess(true);
          formik.resetForm();
          if (onSuccess) {
            onSuccess(response.data.event);
          }
        }
      } catch (error) {
        console.error("Error saving event:", error);
        setSuccessMessage("");
        setShowSuccess(false);
        // Show error to user (you could set state here to display an error message)
      } finally {
        setLoading(false);
      }
    },
  });

  // Guest dialog form
  const guestFormik = useFormik({
    initialValues: {
      guestName: "",
      guestEmail: "",
      guestContact: "",
      guestLinkedin: "",
      guestCompany: "",
      guestDesignation: "",
      guestImage: "",
    },
    validationSchema: guestValidationSchema,
    onSubmit: async (values) => {
      try {
        const response = await axios.post(
          "http://localhost:5000/api/guest/add-guest",
          values
        );
        if (response.data.success) {
          // Add the new guest to the list and close dialog
          setAllGuests([...allGuests, response.data.guest]);
          setOpenGuestDialog(false);

          // Reset the form
          guestFormik.resetForm();
        }
      } catch (error) {
        console.error("Error creating guest:", error);
      }
    },
  });

  const addGuest = () => {
    formik.setFieldValue("eventGuests", [
      ...formik.values.eventGuests,
      { guestId: "", guestTag: "others" },
    ]);
  };

  const removeGuest = (index) => {
    const newGuests = [...formik.values.eventGuests];
    newGuests.splice(index, 1);
    formik.setFieldValue("eventGuests", newGuests);
  };

  const handleGuestChange = (index, guest) => {
    const newGuests = [...formik.values.eventGuests];
    newGuests[index].guestId = guest._id;
    formik.setFieldValue("eventGuests", newGuests);
  };

  const addFormField = () => {
    setFormFields([
      ...formFields,
      {
        fieldName: `field_${formFields.length + 1}`,
        fieldType: "text",
        fieldLabel: "",
        placeholder: "",
        required: false,
        options: [],
      },
    ]);
  };

  const removeFormField = (index) => {
    const newFields = [...formFields];
    newFields.splice(index, 1);
    setFormFields(newFields);
  };

  const updateFormField = (index, field, value) => {
    const newFields = [...formFields];
    newFields[index][field] = value;
    setFormFields(newFields);
  };

  const addOption = (fieldIndex) => {
    const newFields = [...formFields];
    if (!newFields[fieldIndex].options) {
      newFields[fieldIndex].options = [];
    }
    newFields[fieldIndex].options.push("");
    setFormFields(newFields);
  };

  const updateOption = (fieldIndex, optionIndex, value) => {
    const newFields = [...formFields];
    newFields[fieldIndex].options[optionIndex] = value;
    setFormFields(newFields);
  };

  const removeOption = (fieldIndex, optionIndex) => {
    const newFields = [...formFields];
    newFields[fieldIndex].options.splice(optionIndex, 1);
    setFormFields(newFields);
  };

  // Find guest details by ID
  const findGuestById = (id) => {
    return allGuests.find((guest) => guest._id === id) || null;
  };

  // Add a new empty sponsor
  const addSponsor = () => {
    setSponsors([...sponsors, {
      name: "",
      amount: 0,
      type: "cash",
      receivedStatus: "pending",
      contactPerson: "",
      logoUrl: "",
      contactEmail: "",
      contactPhone: "",
      notes: "",
    }]);
    if (!hasSponsors) setHasSponsors(true);
  };

  // Remove a sponsor by index
  const removeSponsor = (index) => {
    const newSponsors = [...sponsors];
    newSponsors.splice(index, 1);
    setSponsors(newSponsors);
    if (newSponsors.length === 0) {
      setHasSponsors(false);
    }
  };

  // Update a sponsor field
  const updateSponsorField = (index, field, value) => {
    const newSponsors = [...sponsors];
    newSponsors[index][field] = value;
    setSponsors(newSponsors);
  };

  // Handle receipt file upload
  const handleReceiptUpload = (index, e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setCurrentReceipt({
      index,
      file
    });
    
    // Mark the sponsor as having a temporary receipt
    const newSponsors = [...sponsors];
    newSponsors[index].hasNewReceipt = true;
    setSponsors(newSponsors);
  };

  return (
    <Box sx={{ mx: "auto", p: 2 }}>
      <Snackbar
        open={showSuccess}
        autoHideDuration={6000}
        onClose={() => setShowSuccess(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setShowSuccess(false)}
          severity="success"
          variant="filled"
          sx={{ width: "100%" }}
        >
          {successMessage}
        </Alert>
      </Snackbar>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate(-1)}
        sx={{ mb: 1 }}
      >
        Back to Event
      </Button>
      <form onSubmit={formik.handleSubmit}>
        <Card elevation={0} sx={{ mb: 4, borderRadius: 2 }}>
          <CardContent>
            <Typography
              variant="h5"
              component="h2"
              sx={{ mb: 3, fontWeight: 500 }}
            >
              {isEdit ? "Edit Event" : "Create New Event"}
            </Typography>

            {/* Banner Upload */}
            <Box
              sx={{
                mb: 3,
                border: "1px dashed #ccc",
                borderRadius: 2,
                p: 2,
                textAlign: "center",
                position: "relative",
              }}
            >
              <input
                type="file"
                accept="image/*"
                id="banner-upload"
                style={{ display: "none" }}
                onChange={handleBannerChange}
              />

              {bannerPreview ? (
                <Box sx={{ position: "relative" }}>
                  <img
                    src={bannerPreview}
                    alt="Event Banner"
                    style={{
                      maxWidth: "100%",
                      maxHeight: "200px",
                      borderRadius: "8px",
                    }}
                  />
                  <IconButton
                    sx={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      bgcolor: "rgba(255,255,255,0.7)",
                    }}
                    onClick={() => {
                      setBannerFile(null);
                      setBannerPreview("");
                      formik.setFieldValue("eventBanner", "");
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              ) : (
                <label htmlFor="banner-upload">
                  <Button
                    component="span"
                    startIcon={<CloudUploadIcon />}
                    variant="outlined"
                    sx={{ mb: 1 }}
                  >
                    Upload Banner
                  </Button>
                  <Typography variant="body2" color="text.secondary">
                    Drag and drop or click to upload an event banner image
                  </Typography>
                </label>
              )}
            </Box>

            {/* Gallery Upload - NEW SECTION */}
            <Box
              sx={{
                mb: 3,
                border: "1px dashed #ccc",
                borderRadius: 2,
                p: 2,
                textAlign: "center",
                position: "relative",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Typography
                  variant="h6"
                  component="h3"
                  sx={{ fontWeight: 500 }}
                >
                  Event Gallery
                </Typography>

                <input
                  type="file"
                  accept="image/*"
                  id="gallery-upload"
                  multiple
                  style={{ display: "none" }}
                  onChange={handleGalleryChange}
                />

                <label htmlFor="gallery-upload">
                  <Button
                    component="span"
                    startIcon={<ImageIcon />}
                    variant="outlined"
                    sx={{ mb: 1 }}
                  >
                    Add Images
                  </Button>
                </label>
              </Box>

              {isEdit && existingGallery.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography
                    variant="subtitle2"
                    sx={{ mb: 1, fontWeight: 500 }}
                  >
                    Existing Gallery Images ({existingGallery.length})
                  </Typography>

                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={replaceExistingGallery}
                        onChange={(e) =>
                          setReplaceExistingGallery(e.target.checked)
                        }
                      />
                    }
                    label="Replace existing gallery with new uploads"
                  />

                  <ImageList
                    sx={{ maxHeight: 200, overflow: "auto" }}
                    cols={4}
                    rowHeight={100}
                  >
                    {existingGallery.map((galleryItem, index) => (
                      <ImageListItem key={galleryItem._id || index}>
                        <img
                          src={galleryItem.fileUrl}
                          alt={`Gallery image ${index + 1}`}
                          loading="lazy"
                          style={{ objectFit: "cover", height: "100%" }}
                        />
                      </ImageListItem>
                    ))}
                  </ImageList>
                </Box>
              )}

              {/* New Gallery Uploads */}
              {galleryPreviews.length > 0 && (
                <Box>
                  <Typography
                    variant="subtitle2"
                    sx={{ mb: 1, fontWeight: 500 }}
                  >
                    New Images to Upload ({galleryPreviews.length})
                  </Typography>

                  <ImageList
                    sx={{ maxHeight: 200, overflow: "auto" }}
                    cols={4}
                    rowHeight={100}
                  >
                    {galleryPreviews.map((preview, index) => (
                      <ImageListItem key={index} sx={{ position: "relative" }}>
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          loading="lazy"
                          style={{ objectFit: "cover", height: "100%" }}
                        />
                        <IconButton
                          size="small"
                          sx={{
                            position: "absolute",
                            top: 0,
                            right: 0,
                            bgcolor: "rgba(0,0,0,0.5)",
                            color: "white",
                            "&:hover": {
                              bgcolor: "rgba(0,0,0,0.7)",
                            },
                          }}
                          onClick={() => removeGalleryFile(index)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </ImageListItem>
                    ))}
                  </ImageList>
                </Box>
              )}

              {galleryPreviews.length === 0 && existingGallery.length === 0 && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontStyle: "italic", mt: 2 }}
                >
                  No gallery images selected. Click "Add Images" to upload event
                  photos.
                </Typography>
              )}
            </Box>

            <Stack spacing={3}>
              <TextField
                fullWidth
                id="eventName"
                name="eventName"
                label="Event Name"
                value={formik.values.eventName}
                onChange={formik.handleChange}
                error={
                  formik.touched.eventName && Boolean(formik.errors.eventName)
                }
                helperText={formik.touched.eventName && formik.errors.eventName}
              />

              <TextField
                fullWidth
                id="eventDescription"
                name="eventDescription"
                label="Event Description"
                multiline
                rows={4}
                value={formik.values.eventDescription}
                onChange={formik.handleChange}
                error={
                  formik.touched.eventDescription &&
                  Boolean(formik.errors.eventDescription)
                }
                helperText={
                  formik.touched.eventDescription &&
                  formik.errors.eventDescription
                }
              />

              <Grid spacing={2}>
                <Grid item xs={12} mb={2} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel id="eventType-label">Event Type</InputLabel>
                    <Select
                      labelId="eventType-label"
                      id="eventType"
                      name="eventType"
                      value={formik.values.eventType}
                      onChange={formik.handleChange}
                      label="Event Type"
                      error={
                        formik.touched.eventType &&
                        Boolean(formik.errors.eventType)
                      }
                    >
                      {EVENT_TYPES.map((type) => (
                        <MenuItem key={type} value={type}>
                          {type}
                        </MenuItem>
                      ))}
                    </Select>
                    {formik.touched.eventType && formik.errors.eventType && (
                      <FormHelperText error>
                        {formik.errors.eventType}
                      </FormHelperText>
                    )}
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel id="eventStatus-label">Event Status</InputLabel>
                    <Select
                      labelId="eventStatus-label"
                      id="eventStatus"
                      name="eventStatus"
                      value={formik.values.eventStatus}
                      onChange={formik.handleChange}
                      label="Event Status"
                    >
                      <MenuItem value="upcoming">Upcoming</MenuItem>
                      <MenuItem value="ongoing">Ongoing</MenuItem>
                      <MenuItem value="completed">Completed</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              <Grid spacing={2}>
                <Grid item mb={2} xs={12} sm={6}>
                  <TextField
                    fullWidth
                    id="eventDate"
                    name="eventDate"
                    label="Event Date"
                    type="date"
                    value={formik.values.eventDate}
                    onChange={formik.handleChange}
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    id="eventTime"
                    name="eventTime"
                    label="Event Time"
                    type="time"
                    value={formik.values.eventTime}
                    onChange={formik.handleChange}
                    InputLabelProps={{
                      shrink: true,
                    }}
                    inputProps={{
                      step: 300, // 5 min steps
                    }}
                  />
                </Grid>
              </Grid>

              <TextField
                fullWidth
                id="eventVenue"
                name="eventVenue"
                label="Event Venue"
                value={formik.values.eventVenue}
                onChange={formik.handleChange}
              />

              <FormControl fullWidth>
                <InputLabel id="eventOrganizerBatch-label">
                  Organizer Batch
                </InputLabel>
                <Select
                  labelId="eventOrganizerBatch-label"
                  id="eventOrganizerBatch"
                  name="eventOrganizerBatch"
                  value={formik.values.eventOrganizerBatch}
                  onChange={formik.handleChange}
                  label="Organizer Batch"
                >
                  {EVENT_BATCHES.map((batch) => (
                    <MenuItem key={batch} value={batch}>
                      {batch}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
          </CardContent>
        </Card>

        {/* Event Guests */}
        <Card elevation={0} sx={{ mb: 4, borderRadius: 2 }}>
          <CardContent>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Typography variant="h6" component="h3" sx={{ fontWeight: 500 }}>
                Event Guests
              </Typography>
              <Box>
                <Button
                  startIcon={<PersonAddIcon />}
                  onClick={() => setOpenGuestDialog(true)}
                  variant="outlined"
                  size="small"
                  sx={{ mr: 1 }}
                >
                  New Guest
                </Button>
                <Button
                  startIcon={<AddIcon />}
                  onClick={addGuest}
                  variant="outlined"
                  size="small"
                >
                  Add Guest
                </Button>
              </Box>
            </Box>

            {formik.values.eventGuests.map((guest, index) => {
              const guestData = findGuestById(guest.guestId);

              return (
                <Box
                  key={index}
                  sx={{
                    mb: 2,
                    p: 2,
                    border: "1px solid #e0e0e0",
                    borderRadius: 1,
                    position: "relative",
                  }}
                >
                  <IconButton
                    size="small"
                    onClick={() => removeGuest(index)}
                    sx={{
                      position: "absolute",
                      top: -12,
                      right: -12,
                      bgcolor: "#f5f5f5",
                      border: "1px solid #e0e0e0",
                      "&:hover": {
                        bgcolor: "#e5e5f5",
                      },
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>

                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={8}>
                      <Autocomplete
                        options={allGuests}
                        getOptionLabel={(option) => option.guestName || ""}
                        value={guestData || null}
                        onChange={(_, newValue) => {
                          if (newValue) {
                            handleGuestChange(index, newValue);
                          }
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Select Guest"
                            placeholder="Search for a guest..."
                            size="small"
                            fullWidth
                          />
                        )}
                        renderOption={(props, option) => (
                          <li {...props}>
                            <Stack
                              direction="row"
                              spacing={2}
                              alignItems="center"
                            >
                              <Avatar sx={{ width: 32, height: 32 }}>
                                {option.guestName?.charAt(0)}
                              </Avatar>
                              <Box>
                                <Typography variant="subtitle2">
                                  {option.guestName}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  {option.guestDesignation} at{" "}
                                  {option.guestCompany}
                                </Typography>
                              </Box>
                            </Stack>
                          </li>
                        )}
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Guest Role</InputLabel>
                        <Select
                          value={guest.guestTag}
                          onChange={(e) => {
                            const newGuests = [...formik.values.eventGuests];
                            newGuests[index].guestTag = e.target.value;
                            formik.setFieldValue("eventGuests", newGuests);
                          }}
                          label="Guest Role"
                        >
                          {GUEST_TAGS.map((tag) => (
                            <MenuItem key={tag} value={tag}>
                              {tag.charAt(0).toUpperCase() + tag.slice(1)}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>

                    {/* Show selected guest details */}
                    {guestData && (
                      <Grid item xs={12}>
                        <Box
                          sx={{
                            mt: 1,
                            p: 1,
                            bgcolor: "#f9f9f9",
                            borderRadius: 1,
                          }}
                        >
                          <Typography variant="body2" color="text.secondary">
                            <strong>{guestData.guestDesignation}</strong> at{" "}
                            {guestData.guestCompany}
                          </Typography>
                          {guestData.guestEmail && (
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ mt: 0.5 }}
                            >
                              Email: {guestData.guestEmail}
                            </Typography>
                          )}
                          {guestData.guestContact && (
                            <Typography variant="body2" color="text.secondary">
                              Contact: {guestData.guestContact}
                            </Typography>
                          )}
                        </Box>
                      </Grid>
                    )}
                  </Grid>
                </Box>
              );
            })}

            {formik.values.eventGuests.length === 0 && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontStyle: "italic", mt: 2 }}
              >
                No guests added yet. Click "Add Guest" to include event guests.
              </Typography>
            )}
          </CardContent>
        </Card>

        {/* Registration Form Fields */}
        <Card elevation={0} sx={{ mb: 4, borderRadius: 2 }}>
          <CardContent>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Typography variant="h6" component="h3" sx={{ fontWeight: 500 }}>
                Registration Form
              </Typography>
              <Button
                startIcon={<AddIcon />}
                onClick={addFormField}
                variant="outlined"
                size="small"
              >
                Add Field
              </Button>
            </Box>

            {formFields.map((field, fieldIndex) => (
              <Box
                key={fieldIndex}
                sx={{
                  mb: 3,
                  p: 2,
                  border: "1px solid #e0e0e0",
                  borderRadius: 1,
                  position: "relative",
                }}
              >
                <IconButton
                  size="small"
                  onClick={() => removeFormField(fieldIndex)}
                  sx={{
                    position: "absolute",
                    top: -12,
                    right: -12,
                    bgcolor: "#f5f5f5",
                    border: "1px solid #e0e0e0",
                    "&:hover": {
                      bgcolor: "#e5e5e5",
                    },
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>

                <Stack spacing={2}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        label="Field Name"
                        value={field.fieldName}
                        onChange={(e) =>
                          updateFormField(
                            fieldIndex,
                            "fieldName",
                            e.target.value
                          )
                        }
                        placeholder="e.g., full_name"
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Field Type</InputLabel>
                        <Select
                          value={field.fieldType}
                          onChange={(e) =>
                            updateFormField(
                              fieldIndex,
                              "fieldType",
                              e.target.value
                            )
                          }
                          label="Field Type"
                        >
                          {FIELD_TYPES.map((type) => (
                            <MenuItem key={type} value={type}>
                              {type}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        label="Field Label"
                        value={field.fieldLabel}
                        onChange={(e) =>
                          updateFormField(
                            fieldIndex,
                            "fieldLabel",
                            e.target.value
                          )
                        }
                        placeholder="e.g., Full Name"
                        size="small"
                      />
                    </Grid>
                  </Grid>

                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={8}>
                      <TextField
                        fullWidth
                        label="Placeholder"
                        value={field.placeholder || ""}
                        onChange={(e) =>
                          updateFormField(
                            fieldIndex,
                            "placeholder",
                            e.target.value
                          )
                        }
                        placeholder="e.g., Enter your full name"
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Required</InputLabel>
                        <Select
                          value={field.required ? "yes" : "no"}
                          onChange={(e) =>
                            updateFormField(
                              fieldIndex,
                              "required",
                              e.target.value === "yes"
                            )
                          }
                          label="Required"
                        >
                          <MenuItem value="yes">Yes</MenuItem>
                          <MenuItem value="no">No</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>

                  {/* Options for select, radio, checkbox */}
                  {["select", "radio", "checkbox"].includes(
                    field.fieldType
                  ) && (
                      <>
                        <Divider sx={{ my: 1 }}>Options</Divider>

                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            mb: 1,
                          }}
                        >
                          <Typography variant="body2" fontWeight={500}>
                            Field Options
                          </Typography>
                          <Button
                            startIcon={<AddIcon />}
                            onClick={() => addOption(fieldIndex)}
                            variant="text"
                            size="small"
                          >
                            Add Option
                          </Button>
                        </Box>

                        {field.options?.map((option, optionIndex) => (
                          <Box key={optionIndex} sx={{ display: "flex", mb: 1 }}>
                            <TextField
                              fullWidth
                              size="small"
                              value={option}
                              onChange={(e) =>
                                updateOption(
                                  fieldIndex,
                                  optionIndex,
                                  e.target.value
                                )
                              }
                              placeholder={`Option ${optionIndex + 1}`}
                            />
                            <IconButton
                              size="small"
                              onClick={() =>
                                removeOption(fieldIndex, optionIndex)
                              }
                              color="error"
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        ))}

                        {(!field.options || field.options.length === 0) && (
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ fontStyle: "italic", mt: 1 }}
                          >
                            No options added. Click "Add Option" to add field
                            options.
                          </Typography>
                        )}
                      </>
                    )}
                </Stack>
              </Box>
            ))}

            {formFields.length === 0 && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontStyle: "italic", mt: 2 }}
              >
                No form fields added yet. Click "Add Field" to create
                registration form.
              </Typography>
            )}
          </CardContent>
        </Card>

        {/* Sponsors Section */}
        <Card elevation={0} sx={{ mb: 4, borderRadius: 2 }}>
          <CardContent>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Typography variant="h6" component="h3" sx={{ fontWeight: 500 }}>
                Event Sponsors
              </Typography>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={hasSponsors}
                    onChange={(e) => {
                      setHasSponsors(e.target.checked);
                      if (e.target.checked && sponsors.length === 0) {
                        addSponsor();
                      }
                    }}
                  />
                }
                label="This event has sponsors"
              />
            </Box>

            {hasSponsors && (
              <>
                <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
                  <Button
                    startIcon={<AddIcon />}
                    onClick={addSponsor}
                    variant="outlined"
                    size="small"
                  >
                    Add Sponsor
                  </Button>
                </Box>

                {sponsors.map((sponsor, index) => (
                  <Box
                    key={index}
                    sx={{
                      mb: 3,
                      p: 2,
                      border: "1px solid #e0e0e0",
                      borderRadius: 1,
                      position: "relative",
                    }}
                  >
                    <IconButton
                      size="small"
                      onClick={() => removeSponsor(index)}
                      sx={{
                        position: "absolute",
                        top: -12,
                        right: -12,
                        bgcolor: "#f5f5f5",
                        border: "1px solid #e0e0e0",
                        "&:hover": {
                          bgcolor: "#e5e5e5",
                        },
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>

                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Sponsor Name"
                          value={sponsor.name}
                          onChange={(e) =>
                            updateSponsorField(index, "name", e.target.value)
                          }
                          placeholder="Enter sponsor organization name"
                          size="small"
                          required
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Amount"
                          value={sponsor.amount}
                          onChange={(e) =>
                            updateSponsorField(
                              index,
                              "amount",
                              isNaN(parseFloat(e.target.value)) ? 0 : parseFloat(e.target.value)
                            )
                          }
                          placeholder="0.00"
                          size="small"
                          required
                          type="number"
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">₹</InputAdornment>
                            ),
                          }}
                        />
                      </Grid>
                    </Grid>

                    <Grid container spacing={2} sx={{ mt: 0.5 }}>
                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth size="small">
                          <InputLabel>Sponsor Type</InputLabel>
                          <Select
                            value={sponsor.type}
                            onChange={(e) =>
                              updateSponsorField(index, "type", e.target.value)
                            }
                            label="Sponsor Type"
                          >
                            {SPONSOR_TYPES.map((type) => (
                              <MenuItem key={type} value={type}>
                                {type.charAt(0).toUpperCase() + type.slice(1)}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth size="small">
                          <InputLabel>Status</InputLabel>
                          <Select
                            value={sponsor.receivedStatus}
                            onChange={(e) =>
                              updateSponsorField(index, "receivedStatus", e.target.value)
                            }
                            label="Status"
                          >
                            {SPONSOR_STATUS.map((status) => (
                              <MenuItem key={status} value={status}>
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                    </Grid>

                    {sponsor.receivedStatus === "received" && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="body2" gutterBottom>
                          Receipt Upload 
                          {!sponsor.receiptId && !sponsor.hasNewReceipt && (
                            <span style={{ color: 'red' }}> (Required)</span>
                          )}
                        </Typography>
                        <input
                          type="file"
                          accept="image/*,application/pdf"
                          id={`receipt-upload-${index}`}
                          style={{ display: "none" }}
                          onChange={(e) => handleReceiptUpload(index, e)}
                        />
                        <label htmlFor={`receipt-upload-${index}`}>
                          <Button
                            variant="outlined"
                            component="span"
                            size="small"
                            startIcon={<CloudUploadIcon />}
                          >
                            {sponsor.receiptId || sponsor.hasNewReceipt ? "Change Receipt" : "Upload Receipt"}
                          </Button>
                        </label>
                        
                        {(sponsor.receiptId || sponsor.hasNewReceipt) && (
                          <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                            {sponsor.hasNewReceipt ? "New receipt selected" : "Receipt uploaded"}
                          </Typography>
                        )}
                      </Box>
                    )}

                    <Divider sx={{ my: 2 }} />
                    
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      Contact Information
                    </Typography>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Contact Person"
                          value={sponsor.contactPerson || ""}
                          onChange={(e) =>
                            updateSponsorField(index, "contactPerson", e.target.value)
                          }
                          size="small"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Logo URL"
                          value={sponsor.logoUrl || ""}
                          onChange={(e) =>
                            updateSponsorField(index, "logoUrl", e.target.value)
                          }
                          size="small"
                        />
                      </Grid>
                    </Grid>
                    
                    <Grid container spacing={2} sx={{ mt: 0.5 }}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Email"
                          value={sponsor.contactEmail || ""}
                          onChange={(e) =>
                            updateSponsorField(index, "contactEmail", e.target.value)
                          }
                          size="small"
                          type="email"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Phone"
                          value={sponsor.contactPhone || ""}
                          onChange={(e) =>
                            updateSponsorField(index, "contactPhone", e.target.value)
                          }
                          size="small"
                        />
                      </Grid>
                    </Grid>

                    <TextField
                      fullWidth
                      label="Notes"
                      value={sponsor.notes || ""}
                      onChange={(e) =>
                        updateSponsorField(index, "notes", e.target.value)
                      }
                      size="small"
                      multiline
                      rows={2}
                      sx={{ mt: 2 }}
                    />

                    {sponsor.receivedStatus === "received" && (
                      <TextField
                        fullWidth
                        label="Date Received"
                        type="date"
                        value={sponsor.dateReceived ? new Date(sponsor.dateReceived).toISOString().split('T')[0] : ""}
                        onChange={(e) =>
                          updateSponsorField(index, "dateReceived", e.target.value)
                        }
                        size="small"
                        sx={{ mt: 2 }}
                        InputLabelProps={{
                          shrink: true,
                        }}
                      />
                    )}
                  </Box>
                ))}

                {sponsors.length === 0 && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontStyle: "italic", mt: 2 }}
                  >
                    No sponsors added yet. Click "Add Sponsor" to include event sponsors.
                  </Typography>
                )}
              </>
            )}
          </CardContent>
        </Card>

        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 4 }}>
          <Button
            variant="contained"
            color="primary"
            type="submit"
            startIcon={<SaveIcon />}
            disableElevation
            disabled={loading}
            sx={{ borderRadius: 2, px: 4 }}
          >
            {loading ? (
              <>
                <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
                Saving...
              </>
            ) : isEdit ? (
              "Update Event"
            ) : (
              "Create Event"
            )}
          </Button>
        </Box>
      </form>

      {/* Guest Creation Dialog */}
      <Dialog
        open={openGuestDialog}
        onClose={() => setOpenGuestDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add New Guest</DialogTitle>
        <form onSubmit={guestFormik.handleSubmit}>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField
                fullWidth
                id="guestName"
                name="guestName"
                label="Guest Name"
                value={guestFormik.values.guestName}
                onChange={guestFormik.handleChange}
                error={
                  guestFormik.touched.guestName &&
                  Boolean(guestFormik.errors.guestName)
                }
                helperText={
                  guestFormik.touched.guestName && guestFormik.errors.guestName
                }
              />

              <TextField
                fullWidth
                id="guestEmail"
                name="guestEmail"
                label="Email Address"
                type="email"
                value={guestFormik.values.guestEmail}
                onChange={guestFormik.handleChange}
                error={
                  guestFormik.touched.guestEmail &&
                  Boolean(guestFormik.errors.guestEmail)
                }
                helperText={
                  guestFormik.touched.guestEmail &&
                  guestFormik.errors.guestEmail
                }
              />

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    id="guestCompany"
                    name="guestCompany"
                    label="Company/Organization"
                    value={guestFormik.values.guestCompany}
                    onChange={guestFormik.handleChange}
                    error={
                      guestFormik.touched.guestCompany &&
                      Boolean(guestFormik.errors.guestCompany)
                    }
                    helperText={
                      guestFormik.touched.guestCompany &&
                      guestFormik.errors.guestCompany
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    id="guestDesignation"
                    name="guestDesignation"
                    label="Designation"
                    value={guestFormik.values.guestDesignation}
                    onChange={guestFormik.handleChange}
                    error={
                      guestFormik.touched.guestDesignation &&
                      Boolean(guestFormik.errors.guestDesignation)
                    }
                    helperText={
                      guestFormik.touched.guestDesignation &&
                      guestFormik.errors.guestDesignation
                    }
                  />
                </Grid>
              </Grid>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    id="guestContact"
                    name="guestContact"
                    label="Contact Number"
                    value={guestFormik.values.guestContact}
                    onChange={guestFormik.handleChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    id="guestLinkedin"
                    name="guestLinkedin"
                    label="LinkedIn Profile"
                    value={guestFormik.values.guestLinkedin}
                    onChange={guestFormik.handleChange}
                  />
                </Grid>
              </Grid>

              <TextField
                fullWidth
                id="guestImage"
                name="guestImage"
                label="Image URL"
                placeholder="https://example.com/image.jpg"
                value={guestFormik.values.guestImage}
                onChange={guestFormik.handleChange}
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenGuestDialog(false)}>Cancel</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={guestFormik.isSubmitting}
            >
              {guestFormik.isSubmitting ? "Adding..." : "Add Guest"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default EventForm;
