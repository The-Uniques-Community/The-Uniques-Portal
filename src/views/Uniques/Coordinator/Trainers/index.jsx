import React, { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import axios from "axios";
import { BASE_URL } from "@/config";

import { TrainerCardDashboard } from "@/utils/Card/TrainerCardDashboard";
import {
    Grid,
    TextField,
    InputAdornment,
    Typography,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Chip,
    Avatar,
    Menu,
    // MenuItem,
    MenuItem,
    ListItemIcon,
    Radio,
    RadioGroup,
    FormControlLabel,
    FormControl,
    FormLabel,
    Select,
    InputLabel,
    FormHelperText
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import SchoolIcon from "@mui/icons-material/School";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import RefreshIcon from "@mui/icons-material/Refresh";
import CustomLoader from "@/utils/Loader/CustomLoader";
import tu from "@/assets/logos/tu.png";

const Trainers = () => {
    const burl = BASE_URL; // Ideally this should come from env or context
    const [search, setSearch] = useState("");
    const [trainers, setTrainers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [tabValue, setTabValue] = useState("1");
    const [openDialog, setOpenDialog] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedTrainer, setSelectedTrainer] = useState(null);
    const [anchorEl, setAnchorEl] = useState(null);
    const [menuTrainerId, setMenuTrainerId] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedImage(e.target.files[0]);
        }
    };

    // Fetch Trainers from Backend
    // Fetch Trainers from Backend
    const fetchTrainers = async (showLoading = true) => {
        if (showLoading) setLoading(true);
        try {
            const response = await axios.get(`${burl}/api/admin/trainers/all-trainers`);
            setTrainers(response.data);
        } catch (error) {
            console.error("Error fetching trainers:", error);
            toast.error(error.response?.data?.message || "Failed to fetch trainers.");
        } finally {
            if (showLoading) setLoading(false);
        }
    };

    const getProxyImageUrl = (profilePic) => {
        if (!profilePic) return "/placeholder.svg";
        const fileId = profilePic.fileId || (typeof profilePic === 'string' ? profilePic : null);
        if (fileId) return `${burl}/api/image-proxy/${fileId}`;
        return "/placeholder.svg";
    };

    useEffect(() => {
        fetchTrainers();
    }, []);

    // Validation Schema
    const validationSchema = Yup.object({
        fullName: Yup.string().required("Full Name is required"),
        email: Yup.string().email("Invalid email address").required("Email is required"),
        contact: Yup.string().required("Phone Number is required"),
        origin: Yup.string().required("Origin is required"),
        designation: Yup.string().when("origin", {
            is: "external",
            then: (schema) => schema.required("Designation is required"),
            otherwise: (schema) => schema.notRequired(),
        }),
        trainerBatch: Yup.string().when("origin", {
            is: "uniques",
            then: (schema) => schema.required("Trainer Batch is required"),
            otherwise: (schema) => schema.notRequired(),
        }),
        teachingBatch: Yup.string().required("Teaching Batch is required"),
        course: Yup.string().required("Course is required"),
        bio: Yup.string().required("Bio is required"),
        skills: Yup.string(),
    });

    // Formik
    const formik = useFormik({
        initialValues: {
            fullName: "",
            email: "",
            contact: "",
            origin: "uniques",
            designation: "",
            trainerBatch: "",
            teachingBatch: "",
            course: "",
            bio: "",
            skills: "",
        },
        validationSchema: validationSchema,
        onSubmit: async (values) => {
            // Process skills string to array
            const skillsArray = values.skills ? values.skills.split(',').map(s => s.trim()) : [];
            const payload = { ...values, skills: skillsArray };

            try {
                let trainerId;
                let trainerName = values.fullName;

                if (selectedTrainer) {
                    // Update Logic
                    const response = await axios.put(`${burl}/api/admin/trainers/update-trainer/${selectedTrainer._id}`, payload);
                    trainerId = selectedTrainer._id;
                    toast.success("Trainer updated successfully!");
                } else {
                    // Add Logic
                    const response = await axios.post(`${burl}/api/admin/trainers/add-trainer`, payload);
                    trainerId = response.data.trainer._id;
                    toast.success("Trainer added successfully!");
                }

                if (selectedImage && trainerId) {
                    try {
                        const formData = new FormData();
                        formData.append("trainerId", trainerId);
                        formData.append("trainerName", trainerName);
                        formData.append("file", selectedImage);

                        await axios.post(`${burl}/upload/trainer_file_upload`, formData, {
                            headers: { "Content-Type": "multipart/form-data" },
                        });
                    } catch (uploadErr) {
                        console.error("Image upload failed:", uploadErr);
                        toast.warn("Trainer saved, but image upload failed.");
                    }
                }

                fetchTrainers(false);
                handleCloseDialog();
            } catch (error) {
                console.error("Error saving trainer:", error);
                toast.error(error.response?.data?.message || "An error occurred.");
            }
        },
    });


    const handleRefresh = () => {
        fetchTrainers();
        toast.info("Trainers list refreshed.");
    };
    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const handleOpenDialog = (trainer = null) => {
        setSelectedTrainer(trainer);
        if (trainer) {
            formik.setValues({
                fullName: trainer.fullName,
                email: trainer.email,
                contact: trainer.contact || "",
                origin: trainer.origin || "uniques",
                designation: trainer.designation || "",
                trainerBatch: trainer.trainerBatch || "",
                teachingBatch: trainer.teachingBatch || trainer.batch || "", // Fallback for old data
                course: trainer.course,
                bio: trainer.bio,
                skills: Array.isArray(trainer.skills) ? trainer.skills.join(", ") : trainer.skills,
            });
        } else {
            formik.resetForm();
        }
        setOpenDialog(true);
        handleCloseMenu();
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedTrainer(null);
        setSelectedImage(null);
        formik.resetForm();
    };

    const handleOpenDeleteDialog = (trainer) => {
        setSelectedTrainer(trainer);
        setDeleteDialogOpen(true);
        handleCloseMenu();
    };

    const handleDeleteTrainer = async () => {
        try {
            await axios.delete(`${burl}/api/admin/trainers/delete-trainer/${selectedTrainer._id}`);
            toast.success("Trainer deleted successfully!");
            fetchTrainers();
        } catch (error) {
            console.error("Error deleting trainer:", error);
            toast.error(error.response?.data?.message || "Failed to delete trainer.");
        }
        setDeleteDialogOpen(false);
        setSelectedTrainer(null);
    };

    const handleMenuClick = (event, trainerId) => {
        setAnchorEl(event.currentTarget);
        setMenuTrainerId(trainerId);
    };

    const handleCloseMenu = () => {
        setAnchorEl(null);
        setMenuTrainerId(null);
    };

    const filteredTrainers = trainers.filter(trainer =>
        trainer.fullName.toLowerCase().includes(search.toLowerCase()) ||
        trainer.email.toLowerCase().includes(search.toLowerCase()) ||
        (Array.isArray(trainer.skills) && trainer.skills.some(skill => skill.toLowerCase().includes(search.toLowerCase())))
    );

    return (
        <Box sx={{ width: "100%", typography: "body1", p: 3 }}>
            <ToastContainer position="top-right" autoClose={3000} />
            {loading && <CustomLoader />}
            {/* Header */}
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#ca0019', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SchoolIcon fontSize="large" /> Trainers Overview
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                        variant="outlined"
                        startIcon={<RefreshIcon />}
                        onClick={handleRefresh}
                        sx={{
                            color: "#ca0019",
                            borderColor: "#ca0019",
                            "&:hover": { bgcolor: "#ffebee", borderColor: "#ca0019" },
                            textTransform: 'none'
                        }}
                    >
                        Refresh
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<PersonAddIcon />}
                        onClick={() => handleOpenDialog()}
                        sx={{
                            bgcolor: "#ca0019",
                            "&:hover": { bgcolor: "#a30014" },
                            textTransform: 'none'
                        }}
                    >
                        Add Trainer
                    </Button>
                </Box>
            </Box>

            {/* Tabs */}
            <TabContext value={tabValue}>
                <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
                    <TabList onChange={handleTabChange} aria-label="Trainer tabs"
                        sx={{
                            '& .MuiTab-root': { fontWeight: 600, textTransform: 'none', fontSize: '1rem' },
                            '& .Mui-selected': { color: '#ca0019 !important' },
                            '& .MuiTabs-indicator': { backgroundColor: '#ca0019' },
                        }}
                    >
                        <Tab label="Profiles" value="1" />
                        <Tab label="Manage" value="2" />
                    </TabList>
                </Box>

                {/* Search Bar (Common) */}
                <Box sx={{ mb: 4, display: 'flex', alignItems: 'center' }}>
                    <TextField
                        placeholder="Search trainers..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        variant="outlined"
                        size="small"
                        fullWidth
                        sx={{ maxWidth: '400px', bgcolor: 'background.paper' }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            ),
                        }}
                    />
                </Box>

                {/* Profiles Tab */}
                <TabPanel value="1" sx={{ p: 0 }}>
                    <div className="grid xl:grid-cols-4 md:grid-cols-3 grid-cols-1 sm:grid-cols-1 gap-4">
                        {filteredTrainers.length > 0 ? (
                            filteredTrainers.map((trainer) => (
                                <TrainerCardDashboard
                                    key={trainer._id}
                                    user={trainer}
                                />
                            ))
                        ) : (
                            <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', mt: 4 }}>
                                No trainers found matching your search.
                            </Typography>
                        )}
                    </div>
                </TabPanel>

                {/* Manage Tab */}
                <TabPanel value="2" sx={{ p: 0 }}>
                    <TableContainer component={Paper} elevation={2} sx={{ borderRadius: 2 }}>
                        <Table>
                            <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Teaching Batch</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Course</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                                    {/* <TableCell sx={{ fontWeight: 'bold' }}>Skills</TableCell> */}
                                    <TableCell sx={{ fontWeight: 'bold', textAlign: 'right' }}>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredTrainers.length > 0 ? (
                                    filteredTrainers.map((trainer) => (
                                        <TableRow key={trainer._id} hover>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                    <Avatar src={getProxyImageUrl(trainer.profilePic)} alt={trainer.fullName} />
                                                    <Typography variant="subtitle2">{trainer.fullName}</Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell>{trainer.email}</TableCell>
                                            {/* <TableCell>{trainer.email}</TableCell> */}
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <img src={tu} alt="TU" style={{ width: 20, height: 20, objectFit: 'contain' }} />
                                                    <Chip label={trainer.teachingBatch || trainer.batch} size="small" variant="outlined" />
                                                </Box>
                                            </TableCell>
                                            <TableCell>{trainer.course}</TableCell>
                                            {/* <TableCell>
                                                <Chip
                                                    label={trainer.teachingBatch || trainer.batch}
                                                    size="small"
                                                    variant="outlined"
                                                />
                                            </TableCell> */}
                                            {/* <TableCell>{trainer.course}</TableCell> */}
                                            <TableCell>
                                                {/* <Chip
                                                    label={trainer.origin === 'external' ? (trainer.designation || 'External') : 'Uniques'}
                                                    size="small"
                                                    color={trainer.origin === 'uniques' ? 'primary' : 'secondary'}
                                                    variant="filled"
                                                    sx={{ mr: 1 }}
                                                /> */}
                                                <Chip
                                                    label={trainer.profileStatus}
                                                    size="small"
                                                    color={trainer.profileStatus === 'active' ? 'success' : 'default'}
                                                    sx={{ textTransform: 'capitalize' }}
                                                />
                                            </TableCell>
                                            {/* <TableCell>
                                                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                                    {trainer.skills.slice(0, 2).map((skill, idx) => (
                                                        <Chip key={idx} label={skill} size="small" sx={{ fontSize: '0.7rem' }} />
                                                    ))}
                                                    {trainer.skills.length > 2 && <Chip label={`+${trainer.skills.length - 2}`} size="small" sx={{ fontSize: '0.7rem' }} />}
                                                </Box>
                                            </TableCell> */}
                                            <TableCell sx={{ textAlign: 'right' }}>
                                                <IconButton
                                                    aria-label="more"
                                                    aria-controls={`menu-${trainer._id}`}
                                                    aria-haspopup="true"
                                                    onClick={(e) => handleMenuClick(e, trainer._id)}
                                                >
                                                    <MoreVertIcon />
                                                </IconButton>
                                                <Menu
                                                    id={`menu-${trainer._id}`}
                                                    anchorEl={anchorEl}
                                                    keepMounted
                                                    open={Boolean(anchorEl) && menuTrainerId === trainer._id}
                                                    onClose={handleCloseMenu}
                                                >
                                                    <MenuItem onClick={() => handleOpenDialog(trainer)}>
                                                        <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>
                                                        Edit
                                                    </MenuItem>
                                                    <MenuItem onClick={() => handleOpenDeleteDialog(trainer)} sx={{ color: 'error.main' }}>
                                                        <ListItemIcon><DeleteIcon fontSize="small" color="error" /></ListItemIcon>
                                                        Delete
                                                    </MenuItem>
                                                </Menu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                                            <Typography variant="body1" color="text.secondary">
                                                No trainers found.
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </TabPanel>
            </TabContext>

            {/* Add/Edit Dialog */}
            <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="sm">
                <DialogTitle sx={{ fontWeight: 'bold' }}>
                    {selectedTrainer ? "Edit Trainer" : "Add New Trainer"}
                </DialogTitle>
                <DialogContent dividers>
                    <form onSubmit={formik.handleSubmit}>
                        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 2 }}>
                            <Box sx={{ gridColumn: 'span 12' }}>
                                <TextField
                                    fullWidth
                                    id="fullName"
                                    name="fullName"
                                    label="Full Name"
                                    value={formik.values.fullName}
                                    onChange={formik.handleChange}
                                    error={formik.touched.fullName && Boolean(formik.errors.fullName)}
                                    helperText={formik.touched.fullName && formik.errors.fullName}
                                />
                            </Box>
                            <Box sx={{ gridColumn: 'span 12' }}>
                                <TextField
                                    fullWidth
                                    id="email"
                                    name="email"
                                    label="Email Address"
                                    value={formik.values.email}
                                    onChange={formik.handleChange}
                                    error={formik.touched.email && Boolean(formik.errors.email)}
                                    helperText={formik.touched.email && formik.errors.email}
                                />
                            </Box>
                            <Box sx={{ gridColumn: 'span 12' }}>
                                <TextField
                                    fullWidth
                                    id="contact"
                                    name="contact"
                                    label="Phone Number"
                                    value={formik.values.contact}
                                    onChange={formik.handleChange}
                                    error={formik.touched.contact && Boolean(formik.errors.contact)}
                                    helperText={formik.touched.contact && formik.errors.contact}
                                />
                            </Box>
                            <Box sx={{ gridColumn: 'span 12' }}>
                                <FormControl component="fieldset">
                                    <FormLabel component="legend">Origin</FormLabel>
                                    <RadioGroup
                                        row
                                        aria-label="origin"
                                        name="origin"
                                        value={formik.values.origin}
                                        onChange={formik.handleChange}
                                    >
                                        <FormControlLabel value="uniques" control={<Radio color="primary" />} label="Uniques" />
                                        <FormControlLabel value="external" control={<Radio color="primary" />} label="External" />
                                    </RadioGroup>
                                </FormControl>
                            </Box>

                            {formik.values.origin === 'uniques' && (
                                <Box sx={{ gridColumn: 'span 6' }}>
                                    <FormControl fullWidth error={formik.touched.trainerBatch && Boolean(formik.errors.trainerBatch)}>
                                        <InputLabel id="trainer-batch-label">Uniques Batch (From)</InputLabel>
                                        <Select
                                            labelId="trainer-batch-label"
                                            id="trainerBatch"
                                            name="trainerBatch"
                                            value={formik.values.trainerBatch}
                                            label="Uniques Batch (From)"
                                            onChange={formik.handleChange}
                                        >
                                            <MenuItem value="The Uniques 1.0">The Uniques 1.0</MenuItem>
                                            <MenuItem value="The Uniques 2.0">The Uniques 2.0</MenuItem>
                                            <MenuItem value="The Uniques 3.0">The Uniques 3.0</MenuItem>
                                            <MenuItem value="The Uniques 4.0">The Uniques 4.0</MenuItem>
                                            <MenuItem value="The Uniques 5.0">The Uniques 5.0</MenuItem>
                                        </Select>
                                        {formik.touched.trainerBatch && formik.errors.trainerBatch && (
                                            <FormHelperText>{formik.errors.trainerBatch}</FormHelperText>
                                        )}
                                    </FormControl>
                                </Box>
                            )}

                            {formik.values.origin === 'external' && (
                                <Box sx={{ gridColumn: 'span 6' }}>
                                    <TextField
                                        fullWidth
                                        id="designation"
                                        name="designation"
                                        label="Designation"
                                        value={formik.values.designation}
                                        onChange={formik.handleChange}
                                        error={formik.touched.designation && Boolean(formik.errors.designation)}
                                        helperText={formik.touched.designation && formik.errors.designation}
                                    />
                                </Box>
                            )}

                            <Box sx={{ gridColumn: 'span 6' }}>
                                <FormControl fullWidth error={formik.touched.teachingBatch && Boolean(formik.errors.teachingBatch)}>
                                    <InputLabel id="teaching-batch-label">Teaching Batch</InputLabel>
                                    <Select
                                        labelId="teaching-batch-label"
                                        id="teachingBatch"
                                        name="teachingBatch"
                                        value={formik.values.teachingBatch}
                                        label="Teaching Batch"
                                        onChange={formik.handleChange}
                                    >
                                        <MenuItem value="The Uniques 1.0">The Uniques 1.0</MenuItem>
                                        <MenuItem value="The Uniques 2.0">The Uniques 2.0</MenuItem>
                                        <MenuItem value="The Uniques 3.0">The Uniques 3.0</MenuItem>
                                        <MenuItem value="The Uniques 4.0">The Uniques 4.0</MenuItem>
                                        <MenuItem value="The Uniques 5.0">The Uniques 5.0</MenuItem>
                                    </Select>
                                    {formik.touched.teachingBatch && formik.errors.teachingBatch && (
                                        <FormHelperText>{formik.errors.teachingBatch}</FormHelperText>
                                    )}
                                </FormControl>
                            </Box>
                            <Box sx={{ gridColumn: 'span 6' }}>
                                <TextField
                                    fullWidth
                                    id="course"
                                    name="course"
                                    label="Course"
                                    value={formik.values.course}
                                    onChange={formik.handleChange}
                                    error={formik.touched.course && Boolean(formik.errors.course)}
                                    helperText={formik.touched.course && formik.errors.course}
                                />
                            </Box>
                            <Box sx={{ gridColumn: 'span 12' }}>
                                <TextField
                                    fullWidth
                                    id="skills"
                                    name="skills"
                                    label="Skills (comma separated)"
                                    placeholder="React, Node.js, Python"
                                    value={formik.values.skills}
                                    onChange={formik.handleChange}
                                    error={formik.touched.skills && Boolean(formik.errors.skills)}
                                    helperText={formik.touched.skills && formik.errors.skills}
                                />
                            </Box>
                            <Box sx={{ gridColumn: 'span 12' }}>
                                <TextField
                                    fullWidth
                                    id="bio"
                                    name="bio"
                                    label="Bio"
                                    multiline
                                    rows={3}
                                    value={formik.values.bio}
                                    onChange={formik.handleChange}
                                    error={formik.touched.bio && Boolean(formik.errors.bio)}
                                    helperText={formik.touched.bio && formik.errors.bio}
                                />
                            </Box>

                            <Box sx={{ gridColumn: 'span 12' }}>
                                <Typography variant="subtitle2" gutterBottom>Profile Image</Typography>
                                <input
                                    accept="image/*"
                                    type="file"
                                    onChange={handleFileChange}
                                    style={{ display: 'block', width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
                                />
                                <Typography variant="caption" color="textSecondary">
                                    {selectedTrainer ? "Upload to replace current image." : "Upload an image."}
                                </Typography>
                            </Box>
                        </Box>
                    </form>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={handleCloseDialog} color="inherit">Cancel</Button>
                    <Button onClick={formik.handleSubmit} variant="contained" sx={{ bgcolor: "#ca0019", "&:hover": { bgcolor: "#a30014" } }}>
                        {selectedTrainer ? "Update Trainer" : "Add Trainer"}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete trainer <strong>{selectedTrainer?.fullName}</strong>?
                        This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setDeleteDialogOpen(false)} color="inherit">Cancel</Button>
                    <Button onClick={handleDeleteTrainer} variant="contained" color="error">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

        </Box>
    );
};

export default Trainers;
