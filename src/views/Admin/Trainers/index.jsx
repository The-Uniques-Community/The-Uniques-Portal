import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  CircularProgress,
  Alert,
  Avatar,
  Tab,
  Tabs
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import { getAllTrainers, addTrainer, updateTrainer, deleteTrainer, uploadTrainerImage } from "@/utils/adminTrainer";
import { BASE_URL } from "@/config";

const Trainers = () => {
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);
  const [currentTrainer, setCurrentTrainer] = useState(null);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    contact: "",
    origin: "uniques", // uniques or external
    designation: "",
    trainerBatch: "",
    teachingBatch: "The Uniques 4.0", // Default
    course: "", // e.g., C++, Web Dev
    bio: "",
    linkedinProfile: "",
    githubProfile: "",
    skills: "" // comma separated for input
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [tabValue, setTabValue] = useState(0);

  const fetchTrainers = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const data = await getAllTrainers();
      setTrainers(data);
    } catch (err) {
      setError("Failed to fetch trainers");
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrainers();
  }, []);

  const handleOpen = (trainer = null) => {
    if (trainer) {
      setCurrentTrainer(trainer);
      setFormData({
        fullName: trainer.fullName,
        email: trainer.email,
        contact: trainer.contact,
        origin: trainer.origin,
        designation: trainer.designation || "",
        trainerBatch: trainer.trainerBatch || "",
        teachingBatch: trainer.teachingBatch,
        course: trainer.course,
        bio: trainer.bio || "",
        linkedinProfile: trainer.linkedinProfile || "",
        githubProfile: trainer.githubProfile || "",
        skills: trainer.skills ? trainer.skills.join(", ") : ""
      });
    } else {
      setCurrentTrainer(null);
      setFormData({
        fullName: "",
        email: "",
        contact: "",
        origin: "uniques",
        designation: "",
        trainerBatch: "",
        teachingBatch: "The Uniques 4.0",
        course: "",
        bio: "",
        linkedinProfile: "",
        githubProfile: "",
        skills: ""
      });
    }
    setSelectedImage(null);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setCurrentTrainer(null);
    setSelectedImage(null);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedImage(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    try {
      setUploading(true);
      const skillsArray = formData.skills.split(",").map(skill => skill.trim()).filter(Boolean);
      const dataToSend = { ...formData, skills: skillsArray };

      let trainerId;
      let trainerName = formData.fullName;

      if (currentTrainer) {
        await updateTrainer(currentTrainer._id, dataToSend);
        trainerId = currentTrainer._id;
      } else {
        const response = await addTrainer(dataToSend);
        trainerId = response.trainer._id;
      }

      if (selectedImage && trainerId) {
        try {
          await uploadTrainerImage(trainerId, trainerName, selectedImage);
        } catch (uploadErr) {
          console.error("Image upload failed:", uploadErr);
          // Optional: Add toast here if Admin dashboard has toast support (it seems to use Alert currently)
        }
      }

      fetchTrainers(false);
      handleClose();
    } catch (err) {
      console.error("Error saving trainer:", err);
      // Could set a form error state here
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this trainer?")) {
      try {
        await deleteTrainer(id);
        fetchTrainers();
      } catch (err) {
        console.error("Error deleting trainer:", err);
      }
    }
  };

  const getProxyImageUrl = (fileData) => {
    if (!fileData) return "";
    const fileId = typeof fileData === 'object' ? fileData.fileId : fileData;
    // Assuming backend file object structure or ID.
    // Actually our backend returns file object in profilePic often populated, or just ID.
    // Code in existing components uses: http://localhost:5000/api/image-proxy/[fileId]
    // The googleDriveUpload route saves File document.
    // The File document has `fileId` (Google Drive ID).
    // The `profilePic` field in Trainer might be populated with File doc.
    const driveId = fileData.fileId || fileData; 
    // Wait, if it's a File document, use .fileId for Google Drive ID, but image-proxy usually takes the MongoDB ID of the File document? 
    // Let's check `Member` usage.
    // Member usage: `getProxyImageUrl(member.profilePic)` where profilePic is File ID.
    // If profilePic is populated, it's an object.
    
    // Let's assume profilePic is the ID of the File document (or populated object with _id).
    // Using simple logic:
    const id =  fileData.fileId || fileData;
    return `${BASE_URL}/api/image-proxy/${id}`;
  };

  // Helper to filter trainers based on tab
  const getFilteredTrainers = () => {
    if (tabValue === 0) return trainers; // All
    if (tabValue === 1) return trainers.filter(t => t.origin === 'uniques'); // Internal
    if (tabValue === 2) return trainers.filter(t => t.origin === 'external'); // Industry
    return trainers;
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Trainers Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
          sx={{ bgcolor: "#ca0019", "&:hover": { bgcolor: "#a30014" } }}
        >
          Add Trainer
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ mb: 2 }}>
        <Tab label="All Trainers" />
        <Tab label="Student Mentors" />
        <Tab label="Industry Pros" />
      </Tabs>

      {loading ? (
        <CircularProgress />
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Image</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Course</TableCell>
                <TableCell>Batch</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {getFilteredTrainers().map((trainer) => (
                <TableRow key={trainer._id}>
                  <TableCell>
                    <Avatar 
                      src={trainer.profilePic ? getProxyImageUrl(trainer.profilePic) : ""} 
                      alt={trainer.fullName}
                      sx={{ width: 50, height: 50 }}
                    >
                      {trainer.fullName.charAt(0)}
                    </Avatar>
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle2">{trainer.fullName}</Typography>
                    <Typography variant="caption" color="textSecondary">{trainer.email}</Typography>
                  </TableCell>
                  <TableCell>
                    {trainer.origin === "external" ? 
                      `Industry Pro (${trainer.designation})` : 
                      "Student Mentor"
                    }
                  </TableCell>
                  <TableCell>{trainer.course}</TableCell>
                  <TableCell>{trainer.teachingBatch}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleOpen(trainer)} color="primary">
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(trainer._id)} color="error">
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {getFilteredTrainers().length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No trainers found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Add/Edit Modal */}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>{currentTrainer ? "Edit Trainer" : "Add Trainer"}</DialogTitle>
        <DialogContent dividers>
          <Box component="form" sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <TextField
              label="Full Name"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              fullWidth
              required
            />
            <TextField
              label="Email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              fullWidth
              required
            />
            <TextField
              label="Contact"
              name="contact"
              value={formData.contact}
              onChange={handleChange}
              fullWidth
              required
            />
             <FormControl fullWidth>
              <InputLabel>Origin</InputLabel>
              <Select
                label="Origin"
                name="origin"
                value={formData.origin}
                onChange={handleChange}
              >
                <MenuItem value="uniques">Student Mentor (Uniques)</MenuItem>
                <MenuItem value="external">Industry Professional</MenuItem>
              </Select>
            </FormControl>
            
            {formData.origin === "external" ? (
              <TextField
                label="Designation"
                name="designation"
                value={formData.designation}
                onChange={handleChange}
                fullWidth
                helperText="e.g. Senior Engineer at Google"
              />
            ) : (
              <TextField
                label="Trainer Batch (Their Batch)"
                name="trainerBatch"
                value={formData.trainerBatch}
                onChange={handleChange}
                fullWidth
                helperText="e.g. The Uniques 3.0"
              />
            )}

            <FormControl fullWidth>
              <InputLabel>Teaching Batch</InputLabel>
              <Select
                label="Teaching Batch"
                name="teachingBatch"
                value={formData.teachingBatch}
                onChange={handleChange}
              >
                <MenuItem value="The Uniques 1.0">The Uniques 1.0</MenuItem>
                <MenuItem value="The Uniques 2.0">The Uniques 2.0</MenuItem>
                <MenuItem value="The Uniques 3.0">The Uniques 3.0</MenuItem>
                <MenuItem value="The Uniques 4.0">The Uniques 4.0</MenuItem>
                <MenuItem value="The Uniques 5.0">The Uniques 5.0</MenuItem>
              </Select>
              <FormHelperText>Batch they are teaching</FormHelperText>
            </FormControl>
             <TextField
              label="Course"
              name="course"
              value={formData.course}
              onChange={handleChange}
              fullWidth
              required
            />
             <TextField
              label="Skills (comma separated)"
              name="skills"
              value={formData.skills}
              onChange={handleChange}
              fullWidth
              sx={{ gridColumn: 'span 2' }}
            />
             <TextField
              label="Bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              fullWidth
              multiline
              rows={3}
              sx={{ gridColumn: 'span 2' }}
            />
            <TextField
              label="LinkedIn Profile"
              name="linkedinProfile"
              value={formData.linkedinProfile}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              label="GitHub Profile"
              name="githubProfile"
              value={formData.githubProfile}
              onChange={handleChange}
              fullWidth
            />
            
            <Box sx={{ gridColumn: 'span 2', mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>Profile Image</Typography>
              <input
                accept="image/*"
                type="file"
                onChange={handleFileChange}
                style={{ display: 'block', width: '100%', padding: '10px', border: '1px solid #ddd' }}
              />
              <Typography variant="caption" color="textSecondary">
                {currentTrainer ? "Upload to replace current image." : "Upload an image."}
              </Typography>
            </Box>

          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            disabled={uploading}
            sx={{ bgcolor: "#ca0019", "&:hover": { bgcolor: "#a30014" } }}
          >
            {uploading ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Trainers;
