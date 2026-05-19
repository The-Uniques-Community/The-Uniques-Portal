"use client";

import { useState, useEffect, useRef } from "react";
import {
  Button,
  Chip,
  LinearProgress,
  Grid,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert,
  CircularProgress,
  Typography,
  Avatar,
  IconButton,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Switch,
  FormControlLabel,
  Paper,
  Container,
  Breadcrumbs,
  Card,
  CardContent,
  CardMedia,
  Rating,
  Stack,
  Tooltip,
  useTheme,
} from "@mui/material";
import axios from "axios";
import tu from "@/assets/logos/tu.png";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import GitHubIcon from "@mui/icons-material/GitHub";
import XIcon from "@mui/icons-material/X";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import { Link } from "react-router";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import { ArrowUpRight, Award, Briefcase, Home, Upload } from "lucide-react";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import AutoStoriesIcon from "@mui/icons-material/AutoStories";
import BusinessIcon from "@mui/icons-material/Business";
import PropTypes from "prop-types";
import LabelIcon from "@mui/icons-material/Label";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import LoginIcon from "@mui/icons-material/Login";
import EditIcon from "@mui/icons-material/Edit";
import VerifiedIcon from "@mui/icons-material/Verified";
import BlockIcon from "@mui/icons-material/Block";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
import InstagramIcon from "@mui/icons-material/Instagram";
import SchoolIcon from "@mui/icons-material/School";
import WorkIcon from "@mui/icons-material/Work";
import EventIcon from "@mui/icons-material/Event";
import AssignmentIcon from "@mui/icons-material/Assignment";
import AssessmentIcon from "@mui/icons-material/Assessment";
import DoneIcon from "@mui/icons-material/Done";
import ErrorIcon from "@mui/icons-material/Error";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import UploadIcon from "@mui/icons-material/Upload";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import Menu from "@mui/material/Menu";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import CodeIcon from "@mui/icons-material/Code";
import LanguageIcon from "@mui/icons-material/Language";
import BarChartIcon from "@mui/icons-material/BarChart";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// API base URL
const API_BASE_URL = "http://localhost:5000";

function CustomTabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

CustomTabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

// Add this helper function near the top of your component
const getProxyImageUrl = (fileId) => {
  if (!fileId) return "/placeholder.svg"; // Fallback image
  return `${API_BASE_URL}/api/image-proxy/${fileId}`;
};

const Index = () => {
  const theme = useTheme();
  const [value, setValue] = useState(0);
  const [fineModalOpen, setFineModalOpen] = useState(false);
  const [fineAmount, setFineAmount] = useState("");
  const [fineReason, setFineReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [alert, setAlert] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // CRUD state management
  const [editMode, setEditMode] = useState({
    profile: false,
    skills: false,
    bio: false,
  });
  const [editedUser, setEditedUser] = useState({});
  const [skillInput, setSkillInput] = useState("");

  // Profile picture upload
  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePictureDialogOpen, setProfilePictureDialogOpen] =
    useState(false);
  const profilePictureInputRef = useRef(null);

  // Achievement CRUD states
  const [achievementDialogOpen, setAchievementDialogOpen] = useState(false);
  const [currentAchievement, setCurrentAchievement] = useState({
    title: "",
    description: "",
    date: "",
  });
  const [achievementEditIndex, setAchievementEditIndex] = useState(-1);

  // Certification CRUD states
  const [certificationDialogOpen, setCertificationDialogOpen] = useState(false);
  const [currentCertification, setCurrentCertification] = useState({
    fileName: "",
    fileUrl: "",
    fileId: "",
  });
  const [certificationFile, setCertificationFile] = useState(null);
  const [certificationEditIndex, setCertificationEditIndex] = useState(-1);

  // Project CRUD states
  const [projectDialogOpen, setProjectDialogOpen] = useState(false);
  const [currentProject, setCurrentProject] = useState({
    title: "",
    description: "",
    technologies: [],
    link: "",
    imageUrl: "",
  });
  const [projectTechInput, setProjectTechInput] = useState("");
  const [projectImage, setProjectImage] = useState(null);
  const [projectEditIndex, setProjectEditIndex] = useState(-1);

  // Internship CRUD states
  const [internshipDialogOpen, setInternshipDialogOpen] = useState(false);
  const [currentInternship, setCurrentInternship] = useState({
    title: "",
    company: "",
    type: "",
    startDate: "",
    endDate: "",
    description: "",
    skills: [],
  });
  const [internshipSkillInput, setInternshipSkillInput] = useState("");
  const [internshipEditIndex, setInternshipEditIndex] = useState(-1);
  const [currentlyWorking, setCurrentlyWorking] = useState(false);

  // Event CRUD states
  const [eventDialogOpen, setEventDialogOpen] = useState(false);
  const [currentEvent, setCurrentEvent] = useState({
    eventName: "",
    eventDate: "",
    eventStatus: "completed",
    eventContributionType: [],
  });
  const [eventContributionInput, setEventContributionInput] = useState("");
  const [eventEditIndex, setEventEditIndex] = useState(-1);

  // Academic CRUD states
  const [semesterDialogOpen, setSemesterDialogOpen] = useState(false);
  const [currentSemester, setCurrentSemester] = useState({
    semester: "",
    sgpa: "",
  });
  const [semesterEditIndex, setSemesterEditIndex] = useState(-1);

  // Menu states for item actions
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [menuItemType, setMenuItemType] = useState("");
  const [menuItemIndex, setMenuItemIndex] = useState(-1);

  // Fetch user profile data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setPageLoading(true);
        const response = await axios.get(
          `${API_BASE_URL}/api/member/getProfile`,
          {
            withCredentials: true,
          }
        );

        if (response.data && response.data.member) {
          setUser(response.data.member);
          setEditedUser(response.data.member);
        } else {
          setError("Failed to load profile data");
        }
      } catch (err) {
        console.error("Error fetching profile data:", err);
        setError("Failed to load profile. Please try again.");
      } finally {
        setPageLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Refresh data function
  const refreshData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_BASE_URL}/api/member/getProfile`,
        {
          withCredentials: true,
        }
      );

      if (response.data && response.data.member) {
        setUser(response.data.member);
        setEditedUser(response.data.member);
        setAlert({
          open: true,
          message: "Profile data refreshed successfully",
          severity: "success",
        });
      }
    } catch (err) {
      console.error("Error refreshing profile data:", err);
      setAlert({
        open: true,
        message: "Failed to refresh profile data",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  // Status badge
  const getStatusBadge = () => {
    if (!user) return null;

    if (user.isSuspended) {
      return (
        <Chip
          icon={<BlockIcon />}
          label="Suspended"
          color="error"
          size="small"
        />
      );
    } else if (user.isVerified) {
      return (
        <Chip
          icon={<VerifiedIcon />}
          label="Verified"
          color="success"
          size="small"
        />
      );
    } else {
      return <Chip label={user.profileStatus} color="default" size="small" />;
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Handle opening fine modal
  const handleOpenFineModal = () => {
    setFineModalOpen(true);
    setFineAmount("");
    setFineReason("");
    setError(null);
  };

  // Handle closing fine modal
  const handleCloseFineModal = () => {
    setFineModalOpen(false);
  };

  // Handle imposing fine
  const handleImposeFine = async () => {
    // Validate inputs
    if (!fineAmount || fineAmount <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    if (!fineReason.trim()) {
      setError("Please provide a reason for the fine");
      return;
    }

    try {
      setLoading(true);

      // Make API call to impose fine
      await axios.post(
        `${API_BASE_URL}/api/admin/member/${user._id}/fine`,
        {
          amount: Number(fineAmount),
          reason: fineReason.trim(),
        },
        {
          withCredentials: true,
        }
      );

      // Show success message
      setAlert({
        open: true,
        message: `Fine of Γé╣${fineAmount} imposed successfully`,
        severity: "success",
      });

      // Close modal
      setFineModalOpen(false);

      // Refresh data to show updated fine status
      refreshData();
    } catch (err) {
      console.error("Error imposing fine:", err);
      setError(
        err.response?.data?.message ||
          "Failed to impose fine. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Toggle edit mode for profile sections
  const toggleEditMode = (section) => {
    setEditMode({
      ...editMode,
      [section]: !editMode[section],
    });

    // Reset to original data if canceling edit
    if (editMode[section]) {
      setEditedUser({ ...user });
    }
  };

  // Handle input change for profile editing
  const handleProfileInputChange = (e) => {
    const { name, value } = e.target;
    setEditedUser({
      ...editedUser,
      [name]: value,
    });
  };

  // Save profile changes
  const saveProfileChanges = async (section) => {
    try {
      setLoading(true);

      let dataToUpdate = {};

      if (section === "profile") {
        dataToUpdate = {
          fullName: editedUser.fullName,
          email: editedUser.email,
          contact: editedUser.contact,
          address: editedUser.address,
          city: editedUser.city,
          state: editedUser.state,
          linkedinProfile: editedUser.linkedinProfile,
          githubProfile: editedUser.githubProfile,
          twitterProfile: editedUser.twitterProfile,
          instagramProfile: editedUser.instagramProfile,
          whatsappContact: editedUser.whatsappContact,
        };
      } else if (section === "bio") {
        dataToUpdate = { bio: editedUser.bio };
      } else if (section === "skills") {
        dataToUpdate = {
          skills: Array.isArray(editedUser.skills) ? editedUser.skills : [],
        };
      }

      await axios.put(
        `${API_BASE_URL}/api/member/members/${user._id}/editProfile`,
        dataToUpdate,
        { withCredentials: true }
      );

      setAlert({
        open: true,
        message: "Profile updated successfully",
        severity: "success",
      });

      toggleEditMode(section);
      refreshData();
    } catch (err) {
      console.error("Error updating profile:", err);
      setAlert({
        open: true,
        message: err.response?.data?.message || "Failed to update profile",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // Add a skill
  const addSkill = () => {
    if (skillInput.trim() === "") return;

    const updatedSkills = [...(editedUser.skills || []), skillInput.trim()];
    setEditedUser({
      ...editedUser,
      skills: updatedSkills,
    });
    setSkillInput("");
  };

  // Remove a skill
  const removeSkill = (index) => {
    const updatedSkills = [...(editedUser.skills || [])];
    updatedSkills.splice(index, 1);
    setEditedUser({
      ...editedUser,
      skills: updatedSkills,
    });
  };

  // Profile picture handling
  const handleProfilePictureClick = () => {
    setProfilePictureDialogOpen(true);
  };

  const handleProfilePictureChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setProfilePicture(e.target.files[0]);
    }
  };

  const uploadProfilePicture = async () => {
    if (!profilePicture) {
      setError("Please select an image to upload");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("mainFolderName", user.batch);
      formData.append("studentId", user.admno);
      formData.append("subfolder", "profile");
      formData.append("memberId", user._id);
      formData.append("files", profilePicture);

      const uploadResponse = await axios.post(
        `${API_BASE_URL}/upload/file_upload`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        }
      );

      setAlert({
        open: true,
        message: "Profile picture updated successfully",
        severity: "success",
      });

      setProfilePictureDialogOpen(false);
      refreshData();
    } catch (err) {
      console.error("Error uploading profile picture:", err);
      setError(
        err.response?.data?.message || "Failed to upload profile picture"
      );
    } finally {
      setLoading(false);
    }
  };

  // Achievement CRUD operations
  const openAchievementDialog = (achievement = null, index = -1) => {
    if (achievement) {
      setCurrentAchievement({ ...achievement });
      setAchievementEditIndex(index);
    } else {
      setCurrentAchievement({
        title: "",
        description: "",
        date: "",
      });
      setAchievementEditIndex(-1);
    }
    setAchievementDialogOpen(true);
  };

  const handleAchievementInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentAchievement({
      ...currentAchievement,
      [name]: value,
    });
  };

  const saveAchievement = async () => {
    try {
      setLoading(true);

      // Validate
      if (!currentAchievement.title.trim()) {
        setError("Title is required");
        return;
      }

      const updatedAchievements = [...(user.achievements || [])];

      if (achievementEditIndex >= 0) {
        // Update existing achievement
        updatedAchievements[achievementEditIndex] = currentAchievement;
      } else {
        // Add new achievement
        updatedAchievements.push(currentAchievement);
      }

      // Make API call to update achievements
      await axios.put(
        `${API_BASE_URL}/api/member/members/${user._id}/achievements`,
        { achievements: updatedAchievements },
        {
          withCredentials: true,
        }
      );

      // Show success message
      setAlert({
        open: true,
        message:
          achievementEditIndex >= 0
            ? "Achievement updated successfully"
            : "Achievement added successfully",
        severity: "success",
      });

      // Close dialog
      setAchievementDialogOpen(false);

      // Refresh data
      refreshData();
    } catch (err) {
      console.error("Error saving achievement:", err);
      setError(
        err.response?.data?.message ||
          "Failed to save achievement. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const deleteAchievement = async (index) => {
    try {
      setLoading(true);

      const updatedAchievements = [...(user.achievements || [])];
      updatedAchievements.splice(index, 1);

      // Make API call to update achievements
      await axios.put(
        `${API_BASE_URL}/api/member/members/${user._id}/achievements`,
        { achievements: updatedAchievements },
        {
          withCredentials: true,
        }
      );

      // Show success message
      setAlert({
        open: true,
        message: "Achievement deleted successfully",
        severity: "success",
      });

      // Close menu
      handleMenuClose();

      // Refresh data
      refreshData();
    } catch (err) {
      console.error("Error deleting achievement:", err);
      setAlert({
        open: true,
        message: err.response?.data?.message || "Failed to delete achievement",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // Certification CRUD operations
  const openCertificationDialog = (certification = null, index = -1) => {
    if (certification) {
      setCurrentCertification({ ...certification });
      setCertificationEditIndex(index);
    } else {
      setCurrentCertification({
        fileName: "",
        fileUrl: "",
        fileId: "",
      });
      setCertificationEditIndex(-1);
    }
    setCertificationFile(null);
    setCertificationDialogOpen(true);
  };

  const handleCertificationInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentCertification({
      ...currentCertification,
      [name]: value,
    });
  };

  const handleCertificationFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setCertificationFile(e.target.files[0]);
      setCurrentCertification({
        ...currentCertification,
        fileName: e.target.files[0].name,
      });
    }
  };

  const saveCertification = async () => {
    try {
      setLoading(true);

      // Validate
      if (!currentCertification.fileName.trim()) {
        setError("Certificate name is required");
        return;
      }

      if (certificationEditIndex === -1 && !certificationFile) {
        setError("Please upload a certificate file");
        return;
      }

      let fileData = {};

      // If there's a new file, upload it first
      if (certificationFile) {
        const formData = new FormData();
        formData.append("mainFolderName", user.batch);
        formData.append("studentId", user.admno);
        formData.append("subfolder", "certificate");
        formData.append("memberId", user._id);
        formData.append("files", certificationFile);

        const uploadResponse = await axios.post(
          `${API_BASE_URL}/upload/file_upload`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
            withCredentials: true,
          }
        );

        if (uploadResponse?.data?.files?.length > 0) {
          fileData = {
            fileUrl: uploadResponse.data.files[0].fileUrl,
            fileId: uploadResponse.data.files[0].fileId,
          };
        } else {
          throw new Error("File upload failed");
        }
      }

      const updatedCertifications = [...(user.certifications || [])];

      // if (certificationEditIndex >= 0) {
      //   // Update existing certification
      //   updatedCertifications[certificationEditIndex] = {
      //     ...currentCertification,
      //     ...(certificationFile ? fileData : {}),
      //   };
      // } else {
      //   // Add new certification
      //   updatedCertifications.push({
      //     ...currentCertification,
      //     ...fileData,
      //     createdAt: new Date().toISOString(),
      //   });
      // }

      // Make API call to update certifications
      // await axios.put(
      //   `${API_BASE_URL}/api/member/members/${user._id}/certifications`,
      //   { certifications: updatedCertifications },
      //   {
      //     withCredentials: true,
      //   }
      // );

      // Show success message
      setAlert({
        open: true,
        message:
          certificationEditIndex >= 0
            ? "Certification updated successfully"
            : "Certification added successfully",
        severity: "success",
      });

      // Close dialog
      setCertificationDialogOpen(false);

      // Refresh data
      refreshData();
    } catch (err) {
      console.error("Error saving certification:", err);
      setError(
        err.response?.data?.message ||
          "Failed to save certification. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const deleteCertification = async (index) => {
    try {
      setLoading(true);

      const updatedCertifications = [...(user.certifications || [])];
      updatedCertifications.splice(index, 1);

      // Make API call to update certifications
      await axios.put(
        `${API_BASE_URL}/api/member/members/${user._id}/certifications`,
        { certifications: updatedCertifications },
        {
          withCredentials: true,
        }
      );

      // Show success message
      setAlert({
        open: true,
        message: "Certification deleted successfully",
        severity: "success",
      });

      // Close menu
      handleMenuClose();

      // Refresh data
      refreshData();
    } catch (err) {
      console.error("Error deleting certification:", err);
      setAlert({
        open: true,
        message:
          err.response?.data?.message || "Failed to delete certification",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // Project CRUD operations
  const openProjectDialog = (project = null, index = -1) => {
    if (project) {
      setCurrentProject({ ...project });
      setProjectEditIndex(index);
    } else {
      setCurrentProject({
        title: "",
        description: "",
        technologies: [],
        link: "",
        imageUrl: "",
      });
      setProjectEditIndex(-1);
    }
    setProjectImage(null);
    setProjectDialogOpen(true);
  };

  const handleProjectInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentProject({
      ...currentProject,
      [name]: value,
    });
  };

  const handleProjectImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setProjectImage(e.target.files[0]);
    }
  };

  const addProjectTechnology = () => {
    if (projectTechInput.trim() === "") return;

    const updatedTechnologies = [
      ...(currentProject.technologies || []),
      projectTechInput.trim(),
    ];
    setCurrentProject({
      ...currentProject,
      technologies: updatedTechnologies,
    });
    setProjectTechInput("");
  };

  const removeProjectTechnology = (index) => {
    const updatedTechnologies = [...(currentProject.technologies || [])];
    updatedTechnologies.splice(index, 1);
    setCurrentProject({
      ...currentProject,
      technologies: updatedTechnologies,
    });
  };

  const saveProject = async () => {
    try {
      setLoading(true);

      if (!currentProject.title.trim()) {
        setError("Project title is required");
        return;
      }

      let imageUrl = currentProject.imageUrl;

      if (projectImage) {
        const formData = new FormData();
        formData.append("mainFolderName", user.batch);
        formData.append("studentId", user.admno);
        formData.append("subfolder", "projects");
        formData.append("memberId", user._id);
        formData.append("files", projectImage);

        const uploadResponse = await axios.post(
          `${API_BASE_URL}/upload/file_upload`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
            withCredentials: true,
          }
        );

        if (uploadResponse?.data?.files?.length > 0) {
          imageUrl = uploadResponse.data.files[0].fileUrl;
        } else {
          throw new Error("File upload failed");
        }
      }

      const updatedProjects = [...(user.projects || [])];

      if (projectEditIndex >= 0) {
        updatedProjects[projectEditIndex] = { ...currentProject, imageUrl };
      } else {
        updatedProjects.push({ ...currentProject, imageUrl });
      }

      await axios.put(
        `${API_BASE_URL}/api/member/members/${user._id}/projects`,
        { projects: updatedProjects },
        { withCredentials: true }
      );

      setAlert({
        open: true,
        message:
          projectEditIndex >= 0
            ? "Project updated successfully"
            : "Project added successfully",
        severity: "success",
      });

      setProjectDialogOpen(false);
      refreshData();
    } catch (err) {
      console.error("Error saving project:", err);
      setError(
        err.response?.data?.message ||
          "Failed to save project. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const deleteProject = async (index) => {
    try {
      setLoading(true);

      const updatedProjects = [...(user.projects || [])];
      updatedProjects.splice(index, 1);

      await axios.put(
        `${API_BASE_URL}/api/member/members/${user._id}/projects`,
        { projects: updatedProjects },
        { withCredentials: true }
      );

      setAlert({
        open: true,
        message: "Project deleted successfully",
        severity: "success",
      });

      handleMenuClose();
      refreshData();
    } catch (err) {
      console.error("Error deleting project:", err);
      setAlert({
        open: true,
        message: err.response?.data?.message || "Failed to delete project.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // Internship CRUD operations
  const openInternshipDialog = (internship = null, index = -1) => {
    if (internship) {
      setCurrentInternship({ ...internship });
      setInternshipEditIndex(index);
      setCurrentlyWorking(!internship.endDate);
    } else {
      setCurrentInternship({
        title: "",
        company: "",
        type: "",
        startDate: "",
        endDate: "",
        description: "",
        skills: [],
      });
      setInternshipEditIndex(-1);
      setCurrentlyWorking(false);
    }
    setInternshipDialogOpen(true);
  };

  const handleInternshipInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentInternship({
      ...currentInternship,
      [name]: value,
    });
  };

  const addInternshipSkill = () => {
    if (internshipSkillInput.trim() === "") return;

    const updatedSkills = [
      ...(currentInternship.skills || []),
      internshipSkillInput.trim(),
    ];
    setCurrentInternship({
      ...currentInternship,
      skills: updatedSkills,
    });
    setInternshipSkillInput("");
  };

  const removeInternshipSkill = (index) => {
    const updatedSkills = [...(currentInternship.skills || [])];
    updatedSkills.splice(index, 1);
    setCurrentInternship({
      ...currentInternship,
      skills: updatedSkills,
    });
  };

  const saveInternship = async () => {
    try {
      setLoading(true);

      // Validate
      if (
        !currentInternship.title.trim() ||
        !currentInternship.company.trim()
      ) {
        setError("Title and company are required");
        return;
      }

      if (!currentInternship.startDate) {
        setError("Start date is required");
        return;
      }

      // Handle currently working case
      const internshipToSave = {
        ...currentInternship,
        endDate: currentlyWorking ? "" : currentInternship.endDate,
      };

      const updatedInternships = [...(user.internships || [])];

      if (internshipEditIndex >= 0) {
        // Update existing internship
        updatedInternships[internshipEditIndex] = internshipToSave;
      } else {
        // Add new internship
        updatedInternships.push(internshipToSave);
      }

      // Make API call to update internships
      await axios.put(
        `${API_BASE_URL}/api/member/members/${user._id}/internships`,
        { internships: updatedInternships },
        {
          withCredentials: true,
        }
      );

      // Show success message
      setAlert({
        open: true,
        message:
          internshipEditIndex >= 0
            ? "Internship updated successfully"
            : "Internship added successfully",
        severity: "success",
      });

      // Close dialog
      setInternshipDialogOpen(false);

      // Refresh data
      refreshData();
    } catch (err) {
      console.error("Error saving internship:", err);
      setError(
        err.response?.data?.message ||
          "Failed to save internship. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const deleteInternship = async (index) => {
    try {
      setLoading(true);

      const updatedInternships = [...(user.internships || [])];
      updatedInternships.splice(index, 1);

      // Make API call to update internships
      await axios.put(
        `${API_BASE_URL}/api/member/members/${user._id}/internships`,
        { internships: updatedInternships },
        {
          withCredentials: true,
        }
      );

      // Show success message
      setAlert({
        open: true,
        message: "Internship deleted successfully",
        severity: "success",
      });

      // Close menu
      handleMenuClose();

      // Refresh data
      refreshData();
    } catch (err) {
      console.error("Error deleting internship:", err);
      setAlert({
        open: true,
        message: err.response?.data?.message || "Failed to delete internship",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // Event CRUD operations
  const openEventDialog = (event = null, index = -1) => {
    if (event) {
      setCurrentEvent({ ...event });
      setEventEditIndex(index);
    } else {
      setCurrentEvent({
        eventName: "",
        eventDate: "",
        eventStatus: "completed",
        eventContributionType: [],
      });
      setEventEditIndex(-1);
    }
    setEventDialogOpen(true);
  };

  const handleEventInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentEvent({
      ...currentEvent,
      [name]: value,
    });
  };

  const addEventContribution = () => {
    if (eventContributionInput.trim() === "") return;

    const updatedContributions = [
      ...(currentEvent.eventContributionType || []),
      eventContributionInput.trim(),
    ];
    setCurrentEvent({
      ...currentEvent,
      eventContributionType: updatedContributions,
    });
    setEventContributionInput("");
  };

  const removeEventContribution = (index) => {
    const updatedContributions = [
      ...(currentEvent.eventContributionType || []),
    ];
    updatedContributions.splice(index, 1);
    setCurrentEvent({
      ...currentEvent,
      eventContributionType: updatedContributions,
    });
  };

  const saveEvent = async () => {
    try {
      setLoading(true);

      // Validate
      if (!currentEvent.eventName.trim()) {
        setError("Event name is required");
        return;
      }

      if (!currentEvent.eventDate) {
        setError("Event date is required");
        return;
      }

      const updatedEvents = [...(user.event_participation || [])];

      if (eventEditIndex >= 0) {
        // Update existing event
        updatedEvents[eventEditIndex] = currentEvent;
      } else {
        // Add new event
        updatedEvents.push(currentEvent);
      }

      // Make API call to update events
      await axios.put(
        `${API_BASE_URL}/api/member/members/${user._id}/events`,
        { event_participation: updatedEvents },
        {
          withCredentials: true,
        }
      );

      // Show success message
      setAlert({
        open: true,
        message:
          eventEditIndex >= 0
            ? "Event updated successfully"
            : "Event added successfully",
        severity: "success",
      });

      // Close dialog
      setEventDialogOpen(false);

      // Refresh data
      refreshData();
    } catch (err) {
      console.error("Error saving event:", err);
      setError(
        err.response?.data?.message || "Failed to save event. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const deleteEvent = async (index) => {
    try {
      setLoading(true);

      const updatedEvents = [...(user.event_participation || [])];
      updatedEvents.splice(index, 1);

      // Make API call to update events
      await axios.put(
        `${API_BASE_URL}/api/member/members/${user._id}/events`,
        { event_participation: updatedEvents },
        {
          withCredentials: true,
        }
      );

      // Show success message
      setAlert({
        open: true,
        message: "Event deleted successfully",
        severity: "success",
      });

      // Close menu
      handleMenuClose();

      // Refresh data
      refreshData();
    } catch (err) {
      console.error("Error deleting event:", err);
      setAlert({
        open: true,
        message: err.response?.data?.message || "Failed to delete event",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // Academic CRUD operations
  const openSemesterDialog = (semester = null, index = -1) => {
    if (semester) {
      setCurrentSemester({ ...semester });
      setSemesterEditIndex(index);
    } else {
      setCurrentSemester({
        semester: "",
        sgpa: "",
      });
      setSemesterEditIndex(-1);
    }
    setSemesterDialogOpen(true);
  };

  const handleSemesterInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentSemester({
      ...currentSemester,
      [name]: value,
    });
  };

  const saveSemester = async () => {
    try {
      setLoading(true);

      // Validate
      if (!currentSemester.semester) {
        setError("Semester number is required");
        return;
      }

      if (
        !currentSemester.sgpa ||
        isNaN(currentSemester.sgpa) ||
        currentSemester.sgpa < 0 ||
        currentSemester.sgpa > 10
      ) {
        setError("Valid SGPA between 0-10 is required");
        return;
      }

      const updatedSemesters = [...(user.semesterSGPA || [])];

      if (semesterEditIndex >= 0) {
        // Update existing semester
        updatedSemesters[semesterEditIndex] = {
          ...currentSemester,
          sgpa: Number.parseFloat(currentSemester.sgpa),
          semester: Number.parseInt(currentSemester.semester),
        };
      } else {
        // Add new semester
        updatedSemesters.push({
          ...currentSemester,
          sgpa: Number.parseFloat(currentSemester.sgpa),
          semester: Number.parseInt(currentSemester.semester),
        });
      }

      // Make API call to update semesters
      await axios.put(
        `${API_BASE_URL}/api/member/members/${user._id}/academics`,
        { semesterSGPA: updatedSemesters },
        {
          withCredentials: true,
        }
      );

      // Show success message
      setAlert({
        open: true,
        message:
          semesterEditIndex >= 0
            ? "Semester data updated successfully"
            : "Semester data added successfully",
        severity: "success",
      });

      // Close dialog
      setSemesterDialogOpen(false);

      // Refresh data
      refreshData();
    } catch (err) {
      console.error("Error saving semester data:", err);
      setError(
        err.response?.data?.message ||
          "Failed to save semester data. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const deleteSemester = async (index) => {
    try {
      setLoading(true);

      const updatedSemesters = [...(user.semesterSGPA || [])];
      updatedSemesters.splice(index, 1);

      // Make API call to update semesters
      await axios.put(
        `${API_BASE_URL}/api/member/members/${user._id}/academics`,
        { semesterSGPA: updatedSemesters },
        {
          withCredentials: true,
        }
      );

      // Show success message
      setAlert({
        open: true,
        message: "Semester data deleted successfully",
        severity: "success",
      });

      // Close menu
      handleMenuClose();

      // Refresh data
      refreshData();
    } catch (err) {
      console.error("Error deleting semester data:", err);
      setAlert({
        open: true,
        message:
          err.response?.data?.message || "Failed to delete semester data",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // Menu handlers for item actions
  const handleMenuOpen = (event, type, index) => {
    setMenuAnchorEl(event.currentTarget);
    setMenuItemType(type);
    setMenuItemIndex(index);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setMenuItemType("");
    setMenuItemIndex(-1);
  };

  const handleMenuAction = (action) => {
    handleMenuClose();

    if (action === "edit") {
      switch (menuItemType) {
        case "achievement":
          openAchievementDialog(
            user.achievements[menuItemIndex],
            menuItemIndex
          );
          break;
        case "certification":
          openCertificationDialog(
            user.certifications[menuItemIndex],
            menuItemIndex
          );
          break;
        case "project":
          openProjectDialog(user.projects[menuItemIndex], menuItemIndex);
          break;
        case "internship":
          openInternshipDialog(user.internships[menuItemIndex], menuItemIndex);
          break;
        case "event":
          openEventDialog(
            user.event_participation[menuItemIndex],
            menuItemIndex
          );
          break;
        case "semester":
          openSemesterDialog(user.semesterSGPA[menuItemIndex], menuItemIndex);
          break;
        default:
          break;
      }
    } else if (action === "delete") {
      switch (menuItemType) {
        case "achievement":
          deleteAchievement(menuItemIndex);
          break;
        case "certification":
          deleteCertification(menuItemIndex);
          break;
        case "project":
          deleteProject(menuItemIndex);
          break;
        case "internship":
          deleteInternship(menuItemIndex);
          break;
        case "event":
          deleteEvent(menuItemIndex);
          break;
        case "semester":
          deleteSemester(menuItemIndex);
          break;
        default:
          break;
      }
    }
  };

  // Prepare data for charts
  const prepareSemesterData = () => {
    if (!user?.semesterSGPA || user.semesterSGPA.length === 0) return [];

    return user.semesterSGPA
      .sort((a, b) => a.semester - b.semester)
      .map((sem) => ({
        name: `Sem ${sem.semester}`,
        sgpa: sem.sgpa,
        fill: "#ca0019",
      }));
  };

  const prepareSkillsData = () => {
    if (!user?.skills || user.skills.length === 0) return [];

    // Group similar skills and count them
    const skillsCount = {};
    user.skills.forEach((skill) => {
      skillsCount[skill] = (skillsCount[skill] || 0) + 1;
    });

    // Convert to array for pie chart
    return Object.keys(skillsCount).map((skill) => ({
      name: skill,
      value: skillsCount[skill],
    }));
  };

  const COLORS = [
    "#ca0019",
    "#333333",
    "#555555",
    "#777777",
    "#999999",
    "#bbbbbb",
    "#dddddd",
    "#eeeeee",
  ];

  // If page is loading, show loading indicator
  if (pageLoading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "80vh",
            flexDirection: "column",
          }}
        >
          <CircularProgress size={60} sx={{ mb: 3, color: "#ca0019" }} />
          <Typography variant="h6" color="textSecondary">
            Loading profile...
          </Typography>
        </Box>
      </Container>
    );
  }

  // If there's an error loading the profile, show error message
  if (error && !user) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <Typography variant="h5" color="error" gutterBottom>
            Error Loading Profile
          </Typography>
          <Typography variant="body1" paragraph>
            {error}
          </Typography>
          <Button variant="contained" color="primary" onClick={refreshData}>
            Try Again
          </Button>
        </Paper>
      </Container>
    );
  }

  // If user data is not available, show message
  if (!user) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <Typography variant="h5" gutterBottom>
            Profile Not Found
          </Typography>
          <Typography variant="body1" paragraph>
            Unable to load profile information. Please try again later.
          </Typography>
          <Button variant="contained" color="primary" onClick={refreshData}>
            Refresh
          </Button>
        </Paper>
      </Container>
    );
  }

  const userRole = user?.role || "member";

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs
        separator={<NavigateNextIcon fontSize="small" />}
        aria-label="breadcrumb"
        sx={{ mb: 3 }}
      >
        <Link to="/" style={{ display: "flex", alignItems: "center" }}>
          <Home size={16} style={{ marginRight: 4 }} />
          Back to Home
        </Link>
      </Breadcrumbs>

      <Paper elevation={3} sx={{ p: 4, mb: 4, borderRadius: 2 }}>
        <Grid container spacing={3}>
          <Grid
            item
            xs={12}
            md={3}
            lg={2}
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Box sx={{ position: "relative" }}>
              <Avatar
                src={
                  user?.profilePic?.fileId
                    ? getProxyImageUrl(user.profilePic.fileId)
                    : "/placeholder.svg"
                }
                alt={user.fullName}
                sx={{
                  width: 120,
                  height: 120,
                  border: "4px solid", borderColor: "divider",
                  boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
                  cursor: "pointer",
                  transition: "transform 0.2s",
                  "&:hover": {
                    transform: "scale(1.05)",
                  },
                }}
                onClick={handleProfilePictureClick}
              />
              <IconButton
                sx={{
                  position: "absolute",
                  bottom: 10,
                  right: -10,
                  bgcolor: "#ca0019",
                  color: "white",
                  boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
                  "&:hover": {
                    bgcolor: "#a30014",
                  },
                }}
                size="small"
                onClick={handleProfilePictureClick}
              >
                <Upload size={16} />
              </IconButton>
            </Box>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs text-slate-500 font-medium uppercase">
                {userRole}
              </span>
              {getStatusBadge()}
            </div>
            {editMode.profile ? (
              <TextField
                name="fullName"
                value={editedUser.fullName || ""}
                onChange={handleProfileInputChange}
                size="small"
                fullWidth
                sx={{ mb: 2 }}
              />
            ) : (
              <Typography
                variant="h5"
                fontWeight="600"
                align="center"
                gutterBottom
              >
                {user.fullName}
              </Typography>
            )}
            <Box
              sx={{ display: "flex", gap: 1, mb: 2, justifyContent: "center" }}
            >
              {!editMode.profile && (
                <>
                  {user.githubProfile && (
                    <Tooltip title="GitHub">
                      <IconButton
                        component="a"
                        href={user.githubProfile}
                        target="_blank"
                        size="small"
                        sx={{
                          bgcolor: "rgba(0,0,0,0.1)",
                          "&:hover": { bgcolor: "rgba(0,0,0,0.2)" },
                        }}
                      >
                        <GitHubIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                  {user.linkedinProfile && (
                    <Tooltip title="LinkedIn">
                      <IconButton
                        component="a"
                        href={user.linkedinProfile}
                        target="_blank"
                        size="small"
                        sx={{
                          bgcolor: "rgba(10,102,194,0.1)",
                          color: "#0a66c2",
                          "&:hover": { bgcolor: "rgba(10,102,194,0.2)" },
                        }}
                      >
                        <LinkedInIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                  {user.twitterProfile && (
                    <Tooltip title="Twitter">
                      <IconButton
                        component="a"
                        href={user.twitterProfile}
                        target="_blank"
                        size="small"
                        sx={{
                          bgcolor: "rgba(29,161,242,0.1)",
                          color: "#1da1f2",
                          "&:hover": { bgcolor: "rgba(29,161,242,0.2)" },
                        }}
                      >
                        <XIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                  {user.instagramProfile && (
                    <Tooltip title="Instagram">
                      <IconButton
                        component="a"
                        href={user.instagramProfile}
                        target="_blank"
                        size="small"
                        sx={{
                          bgcolor: "rgba(225,48,108,0.1)",
                          color: "#e1306c",
                          "&:hover": { bgcolor: "rgba(225,48,108,0.2)" },
                        }}
                      >
                        <InstagramIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                  {user.whatsappContact && (
                    <Tooltip title="WhatsApp">
                      <IconButton
                        component="a"
                        href={`https://wa.me/${user.whatsappContact}`}
                        target="_blank"
                        size="small"
                        sx={{
                          bgcolor: "rgba(37,211,102,0.1)",
                          color: "#25d366",
                          "&:hover": { bgcolor: "rgba(37,211,102,0.2)" },
                        }}
                      >
                        <WhatsAppIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                </>
              )}
            </Box>
            {editMode.profile && (
              <Box sx={{ display: "flex", gap: 1, mt: 1, width: "100%" }}>
                <Button
                  size="small"
                  variant="contained"
                  color="primary"
                  onClick={() => saveProfileChanges("profile")}
                  disabled={loading}
                  startIcon={
                    loading ? <CircularProgress size={20} /> : <SaveIcon />
                  }
                  fullWidth
                >
                  Save
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => toggleEditMode("profile")}
                  startIcon={<CancelIcon />}
                  fullWidth
                >
                  Cancel
                </Button>
              </Box>
            )}
          </Grid>

          <Grid item xs={12} md={6} lg={7}>
            <Box sx={{ pl: { md: 3 }, borderLeft: { md: "1px solid" }, borderColor: "divider" }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <AutoStoriesIcon
                      fontSize="small"
                      sx={{ color: "text.secondary", mr: 1 }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      <strong>Course:</strong> {user.course}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <LabelIcon
                      fontSize="small"
                      sx={{ color: "text.secondary", mr: 1 }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      <strong>Admission No:</strong> {user.admno}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <BusinessIcon
                      fontSize="small"
                      sx={{ color: "text.secondary", mr: 1 }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      <strong>Placement:</strong>{" "}
                      {user.isPlaced === true ? "Placed" : "Not Placed"}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <img
                      src={tu || "/placeholder.svg"}
                      style={{ width: 20, height: 20, marginRight: 8 }}
                      alt="University"
                    />
                    <Typography variant="body2" color="text.secondary">
                      <strong>Batch:</strong> {user.batch}
                    </Typography>
                  </Box>
                  {Number.parseInt(user.fineStatus) > 0 && (
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      <CurrencyRupeeIcon
                        fontSize="small"
                        sx={{ color: "error.main", mr: 1 }}
                      />
                      <Typography variant="body2" color="error.main">
                        <strong>Fine Amount:</strong> Γé╣{user.fineStatus}
                      </Typography>
                    </Box>
                  )}
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <LoginIcon
                      fontSize="small"
                      sx={{ color: "text.secondary", mr: 1 }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      <strong>Joined:</strong> {formatDate(user.createdAt)}
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle1" fontWeight="600" gutterBottom>
                    Contact Information
                  </Typography>

                  {editMode.profile ? (
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Email"
                          name="email"
                          value={editedUser.email || ""}
                          onChange={handleProfileInputChange}
                          size="small"
                          fullWidth
                          margin="dense"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Contact"
                          name="contact"
                          value={editedUser.contact || ""}
                          onChange={handleProfileInputChange}
                          size="small"
                          fullWidth
                          margin="dense"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Address"
                          name="address"
                          value={editedUser.address || ""}
                          onChange={handleProfileInputChange}
                          size="small"
                          fullWidth
                          margin="dense"
                        />
                      </Grid>
                      <Grid item xs={12} sm={3}>
                        <TextField
                          label="City"
                          name="city"
                          value={editedUser.city || ""}
                          onChange={handleProfileInputChange}
                          size="small"
                          fullWidth
                          margin="dense"
                        />
                      </Grid>
                      <Grid item xs={12} sm={3}>
                        <TextField
                          label="State"
                          name="state"
                          value={editedUser.state || ""}
                          onChange={handleProfileInputChange}
                          size="small"
                          fullWidth
                          margin="dense"
                        />
                      </Grid>
                    </Grid>
                  ) : (
                    <>
                      <Box
                        sx={{ display: "flex", alignItems: "center", mb: 1.5 }}
                      >
                        <EmailIcon
                          fontSize="small"
                          sx={{ color: "text.secondary", mr: 1 }}
                        />
                        <Typography variant="body2">{user.email}</Typography>
                      </Box>
                      {user.contact && (
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            mb: 1.5,
                          }}
                        >
                          <PhoneIcon
                            fontSize="small"
                            sx={{ color: "text.secondary", mr: 1 }}
                          />
                          <Typography variant="body2">
                            <Link to={`tel:${user.contact}`}>
                              {user.contact}
                            </Link>
                          </Typography>
                        </Box>
                      )}
                      {(user.address || user.city || user.state) && (
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "flex-start",
                            mb: 1.5,
                          }}
                        >
                          <LocationOnIcon
                            fontSize="small"
                            sx={{ color: "text.secondary", mr: 1, mt: 0.3 }}
                          />
                          <Typography variant="body2">
                            {user.address}{" "}
                            {user.address && (user.city || user.state) && "|"}{" "}
                            {user.city}
                            {user.city && user.state && ","} {user.state}
                          </Typography>
                        </Box>
                      )}
                    </>
                  )}
                </Grid>
              </Grid>
            </Box>
          </Grid>

          <Grid item xs={12} md={3} lg={3}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                height: "100%",
                justifyContent: "center",
              }}
            >
              <Stack
                direction="row"
                spacing={1}
                sx={{ mb: 2, flexWrap: "wrap", gap: 1 }}
              >
                {!editMode.profile ? (
                  <Button
                    variant="outlined"
                    color="primary"
                    size="small"
                    startIcon={<EditIcon />}
                    onClick={() => toggleEditMode("profile")}
                    sx={{
                      borderColor: "#ca0019",
                      color: "#ca0019",
                      "&:hover": {
                        borderColor: "#a30014",
                        backgroundColor: "rgba(202, 0, 25, 0.04)",
                      },
                    }}
                  >
                    Edit Profile
                  </Button>
                ) : null}

                {userRole === "admin" && (
                  <>
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<CurrencyRupeeIcon />}
                      disabled={user.isSuspended}
                      onClick={handleOpenFineModal}
                      sx={{
                        bgcolor: "#ca0019",
                        "&:hover": {
                          bgcolor: "#a30014",
                        },
                      }}
                    >
                      Impose Fine
                    </Button>
                    <Button
                      variant="contained"
                      color={user.isSuspended ? "success" : "error"}
                      size="small"
                      startIcon={
                        user.isSuspended ? <DoneIcon /> : <BlockIcon />
                      }
                    >
                      {user.isSuspended ? "Unblock" : "Block"}
                    </Button>
                  </>
                )}
              </Stack>

              {user.cgpa && (
                <Card
                  sx={{
                    mb: 2,
                    bgcolor: "background.paper",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                    borderRadius: 2,
                    overflow: "hidden",
                    border: "1px solid", borderColor: "divider",
                  }}
                >
                  <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      gutterBottom
                    >
                      Overall CGPA
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Typography
                        variant="h4"
                        fontWeight="bold"
                        color="#ca0019"
                      >
                        {user.cgpa}
                      </Typography>
                      <Rating
                        value={Number.parseFloat(user.cgpa) / 2}
                        precision={0.5}
                        readOnly
                        max={5}
                        sx={{
                          "& .MuiRating-iconFilled": {
                            color: "#ca0019",
                          },
                        }}
                      />
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={(Number.parseFloat(user.cgpa) / 10) * 100}
                      sx={{
                        height: 8,
                        borderRadius: 5,
                        mt: 1,
                        backgroundColor: theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.08)" : "rgba(0,0,0,0.05)",
                        "& .MuiLinearProgress-bar": {
                          backgroundColor: "#ca0019",
                        },
                      }}
                    />
                  </CardContent>
                </Card>
              )}

              {user.skills && user.skills.length > 0 && (
                <Card
                  sx={{
                    bgcolor: "background.paper",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                    borderRadius: 2,
                    border: "1px solid", borderColor: "divider",
                  }}
                >
                  <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 1,
                      }}
                    >
                      <Typography variant="subtitle2" color="text.secondary">
                        Top Skills
                      </Typography>
                      {!editMode.skills && (
                        <IconButton
                          size="small"
                          onClick={() => toggleEditMode("skills")}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      )}
                    </Box>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                      {user.skills.slice(0, 5).map((skill, index) => (
                        <Chip
                          key={index}
                          label={skill}
                          size="small"
                          sx={{
                            bgcolor: "rgba(202, 0, 25, 0.08)",
                            color: "#ca0019",
                            borderColor: "rgba(202, 0, 25, 0.3)",
                          }}
                          variant="outlined"
                        />
                      ))}
                      {user.skills.length > 5 && (
                        <Chip
                          label={`+${user.skills.length - 5} more`}
                          size="small"
                          variant="outlined"
                        />
                      )}
                    </Box>
                  </CardContent>
                </Card>
              )}
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <Paper elevation={3} sx={{ p: 0, borderRadius: 2 }}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={value}
            onChange={handleChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              "& .MuiTab-root": {
                fontWeight: 500,
                transition: "0.3s",
                "&.Mui-selected": {
                  color: "#ca0019",
                },
              },
              "& .MuiTabs-indicator": {
                backgroundColor: "#ca0019",
              },
            }}
          >
            <Tab
              icon={<BarChartIcon />}
              iconPosition="start"
              label="Statistics"
              {...a11yProps(0)}
            />
            <Tab
              icon={<EmojiEventsIcon />}
              iconPosition="start"
              label="Achievements"
              {...a11yProps(1)}
            />
            <Tab
              icon={<BookmarkIcon />}
              iconPosition="start"
              label="Bio"
              {...a11yProps(2)}
            />
            <Tab
              icon={<AssignmentIcon />}
              iconPosition="start"
              label="Certifications"
              {...a11yProps(3)}
            />
            <Tab
              icon={<CodeIcon />}
              iconPosition="start"
              label="Projects"
              {...a11yProps(4)}
            />
            <Tab
              icon={<WorkIcon />}
              iconPosition="start"
              label="Internships"
              {...a11yProps(5)}
            />
            {/* <Tab
              icon={<EventIcon />}
              iconPosition="start"
              label="Events"
              {...a11yProps(6)}
            /> */}
          </Tabs>
        </Box>

        {/* Statistics Tab */}
        <CustomTabPanel value={value} index={0}>
          <Grid container spacing={4}>
            {/* Academic Performance */}
            <Grid item xs={12} md={7}>
              <Paper
                elevation={2}
                sx={{ p: 3, borderRadius: 2, bgcolor: "background.paper" }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    mb: 3,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <SchoolIcon sx={{ color: "#ca0019", mr: 1 }} />
                    <Typography variant="h6">Academic Performance</Typography>
                  </Box>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={() => openSemesterDialog()}
                    sx={{
                      borderColor: "#ca0019",
                      color: "#ca0019",
                      "&:hover": {
                        borderColor: "#a30014",
                        backgroundColor: "rgba(202, 0, 25, 0.04)",
                      },
                    }}
                  >
                    Add Semester
                  </Button>
                </Box>

                {/* SGPA Chart */}
                {user.semesterSGPA && user.semesterSGPA.length > 0 ? (
                  <Box
                    sx={{
                      height: 300,
                      mb: 3,
                      bgcolor: "background.paper",
                      p: 2,
                      borderRadius: 2,
                      border: "1px solid", borderColor: "divider",
                    }}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={prepareSemesterData()}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="name" />
                        <YAxis domain={[0, 10]} />
                        <RechartsTooltip
                          formatter={(value) => [
                            `${value} SGPA`,
                            "Performance",
                          ]}
                        />
                        <Legend />
                        <Bar dataKey="sgpa" name="SGPA" fill="#ca0019" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                ) : (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 3 }}
                  >
                    No semester data available to display chart
                  </Typography>
                )}

                {/* Semester-wise SGPA */}
                <Typography variant="subtitle1" gutterBottom>
                  Semester Performance
                </Typography>

                {user.semesterSGPA && user.semesterSGPA.length > 0 ? (
                  <Grid container spacing={2}>
                    {user.semesterSGPA
                      .sort((a, b) => a.semester - b.semester)
                      .map((sem, index) => (
                        <Grid item xs={12} sm={6} md={4} key={sem.semester}>
                          <Paper
                            elevation={1}
                            sx={{
                              p: 2,
                              borderRadius: 2,
                              position: "relative",
                              borderLeft: `4px solid #ca0019`,
                              transition: "transform 0.2s, box-shadow 0.2s",
                              "&:hover": {
                                transform: "translateY(-4px)",
                                boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
                              },
                            }}
                          >
                            <IconButton
                              size="small"
                              sx={{ position: "absolute", top: 1, right: -5 }}
                              onClick={(e) =>
                                handleMenuOpen(e, "semester", index)
                              }
                            >
                              <MoreVertIcon fontSize="small" />
                            </IconButton>
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                mb: 1,
                              }}
                            >
                              <Typography variant="subtitle2">
                                Semester {sem.semester}
                              </Typography>
                              <Chip
                                label={sem.sgpa.toFixed(2)}
                                size="small"
                                sx={{ bgcolor: "#ca0019", color: "white" }}
                              />
                            </Box>
                            <LinearProgress
                              variant="determinate"
                              value={(sem.sgpa / 10) * 100}
                              sx={{
                                height: 8,
                                borderRadius: 5,
                                backgroundColor: theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.08)" : "rgba(0,0,0,0.05)",
                                "& .MuiLinearProgress-bar": {
                                  backgroundColor: "#ca0019",
                                },
                              }}
                            />
                          </Paper>
                        </Grid>
                      ))}
                  </Grid>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No semester data available
                  </Typography>
                )}
              </Paper>
            </Grid>

            {/* Skills & Supplementary */}
            <Grid item xs={12} md={5}>
              {/* Skills Distribution */}
              <Paper
                elevation={2}
                sx={{ p: 3, borderRadius: 2, mb: 4, bgcolor: "background.paper" }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    mb: 3,
                  }}
                >
                  <Typography variant="h6">Skills Distribution</Typography>
                  <IconButton
                    size="small"
                    onClick={() => toggleEditMode("skills")}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Box>

                {user.skills && user.skills.length > 0 ? (
                  <Box
                    sx={{
                      height: 250,
                      display: "flex",
                      justifyContent: "center",
                      bgcolor: "background.paper",
                      p: 2,
                      borderRadius: 2,
                      border: "1px solid", borderColor: "divider",
                    }}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={prepareSkillsData()}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name }) => name}
                        >
                          {prepareSkillsData().map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <RechartsTooltip
                          formatter={(value, name) => [`${value} skills`, name]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                ) : (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      height: 200,
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      No skills data available
                    </Typography>
                  </Box>
                )}

                {editMode.skills ? (
                  <Box sx={{ mt: 2 }}>
                    <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                      <TextField
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        size="small"
                        placeholder="Add a skill"
                        fullWidth
                      />
                      <Button
                        variant="contained"
                        onClick={addSkill}
                        size="small"
                        sx={{
                          bgcolor: "#ca0019",
                          "&:hover": {
                            bgcolor: "#a30014",
                          },
                        }}
                      >
                        Add
                      </Button>
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 0.5,
                        mb: 2,
                      }}
                    >
                      {editedUser.skills &&
                        editedUser.skills.map((skill, index) => (
                          <Chip
                            key={index}
                            label={skill}
                            onDelete={() => removeSkill(index)}
                            size="small"
                            sx={{
                              bgcolor: "rgba(202, 0, 25, 0.08)",
                              color: "#ca0019",
                              borderColor: "rgba(202, 0, 25, 0.3)",
                            }}
                          />
                        ))}
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "flex-end",
                        gap: 1,
                      }}
                    >
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => saveProfileChanges("skills")}
                        disabled={loading}
                        startIcon={
                          loading ? (
                            <CircularProgress size={20} />
                          ) : (
                            <SaveIcon />
                          )
                        }
                        sx={{
                          bgcolor: "#ca0019",
                          "&:hover": {
                            bgcolor: "#a30014",
                          },
                        }}
                      >
                        Save
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => toggleEditMode("skills")}
                        startIcon={<CancelIcon />}
                      >
                        Cancel
                      </Button>
                    </Box>
                  </Box>
                ) : null}
              </Paper>

              {/* Bio Section */}
              <Paper
                elevation={2}
                sx={{ p: 3, borderRadius: 2, mb: 4, bgcolor: "background.paper" }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    mb: 2,
                  }}
                >
                  <Typography variant="h6">Bio</Typography>
                  {!editMode.bio && (
                    <IconButton
                      size="small"
                      onClick={() => toggleEditMode("bio")}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  )}
                </Box>

                {editMode.bio ? (
                  <Box sx={{ mt: 1 }}>
                    <TextField
                      name="bio"
                      value={editedUser.bio || ""}
                      onChange={handleProfileInputChange}
                      multiline
                      rows={4}
                      fullWidth
                      placeholder="Tell us about yourself"
                      variant="outlined"
                    />
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "flex-end",
                        gap: 1,
                        mt: 2,
                      }}
                    >
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => saveProfileChanges("bio")}
                        disabled={loading}
                        startIcon={
                          loading ? (
                            <CircularProgress size={20} />
                          ) : (
                            <SaveIcon />
                          )
                        }
                        sx={{
                          bgcolor: "#ca0019",
                          "&:hover": {
                            bgcolor: "#a30014",
                          },
                        }}
                      >
                        Save
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => toggleEditMode("bio")}
                        startIcon={<CancelIcon />}
                      >
                        Cancel
                      </Button>
                    </Box>
                  </Box>
                ) : (
                  <Typography
                    variant="body2"
                    color={user.bio ? "text.primary" : "text.secondary"}
                    sx={{ mt: 1 }}
                  >
                    {user.bio || "No bio available"}
                  </Typography>
                )}
              </Paper>

              {/* Supplementary Information */}
              {user.semesterSupplementary &&
                user.semesterSupplementary.length > 0 && (
                  <Paper
                    elevation={2}
                    sx={{ p: 3, borderRadius: 2, bgcolor: "background.paper" }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      <ErrorIcon sx={{ color: "#ca0019", mr: 1 }} />
                      <Typography variant="h6">Supplementary Exams</Typography>
                    </Box>

                    <Box sx={{ mt: 2 }}>
                      {user.semesterSupplementary.map((sem) => (
                        <Box key={sem.semester} sx={{ mb: 3 }}>
                          <Typography variant="subtitle1" gutterBottom>
                            Semester {sem.semester}
                          </Typography>

                          {sem.subjects.length > 0 ? (
                            <Grid container spacing={1}>
                              {sem.subjects.map((subject, idx) => (
                                <Grid item xs={12} key={idx}>
                                  <Paper
                                    variant="outlined"
                                    sx={{
                                      p: 1.5,
                                      display: "flex",
                                      justifyContent: "space-between",
                                      alignItems: "center",
                                      borderLeft: `3px solid ${
                                        subject.status === "passed"
                                          ? "#4caf50"
                                          : subject.status === "failed"
                                          ? "#ca0019"
                                          : "#ff9800"
                                      }`,
                                    }}
                                  >
                                    <Box>
                                      <Typography
                                        variant="body2"
                                        fontWeight="medium"
                                      >
                                        {subject.subjectName}
                                      </Typography>
                                      <Typography
                                        variant="caption"
                                        color="text.secondary"
                                      >
                                        {subject.subjectCode}
                                      </Typography>
                                    </Box>
                                    <Chip
                                      label={subject.status.toUpperCase()}
                                      size="small"
                                      color={
                                        subject.status === "passed"
                                          ? "success"
                                          : subject.status === "failed"
                                          ? "error"
                                          : "warning"
                                      }
                                    />
                                  </Paper>
                                </Grid>
                              ))}
                            </Grid>
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              No supplementary subjects
                            </Typography>
                          )}
                        </Box>
                      ))}
                    </Box>
                  </Paper>
                )}
            </Grid>
          </Grid>
        </CustomTabPanel>

        {/* Achievements Tab */}
        <CustomTabPanel value={value} index={1}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
            }}
          >
            <Typography variant="h6">Achievements</Typography>
            <Button
              variant="contained"
              size="small"
              startIcon={<AddIcon />}
              onClick={() => openAchievementDialog()}
              sx={{
                bgcolor: "#ca0019",
                "&:hover": {
                  bgcolor: "#a30014",
                },
              }}
            >
              Add Achievement
            </Button>
          </Box>

          {user.achievements && user.achievements.length > 0 ? (
            <Grid container spacing={3}>
              {user.achievements.map((achievement, idx) => (
                <Grid item xs={12} sm={6} md={4} key={idx}>
                  <Paper
                    elevation={2}
                    sx={{
                      p: 3,
                      borderRadius: 2,
                      height: "100%",
                      transition: "transform 0.2s, box-shadow 0.2s",
                      "&:hover": {
                        transform: "translateY(-4px)",
                        boxShadow: 4,
                      },
                      bgcolor: "background.paper",
                    }}
                  >
                    <Box sx={{ position: "relative" }}>
                      <IconButton
                        size="small"
                        sx={{ position: "absolute", top: -8, right: -8 }}
                        onClick={(e) => handleMenuOpen(e, "achievement", idx)}
                      >
                        <MoreVertIcon fontSize="small" />
                      </IconButton>

                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 2,
                        }}
                      >
                        <Avatar
                          sx={{
                            bgcolor: "rgba(202, 0, 25, 0.1)",
                            color: "#ca0019",
                            width: 50,
                            height: 50,
                          }}
                        >
                          <Award />
                        </Avatar>

                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6" gutterBottom>
                            {achievement.title}
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            paragraph
                          >
                            {achievement.description}
                          </Typography>
                          {achievement.date && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ display: "flex", alignItems: "center" }}
                            >
                              <CalendarMonthIcon
                                fontSize="inherit"
                                sx={{ mr: 0.5 }}
                              />
                              {formatDate(achievement.date)}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Paper
              sx={{
                p: 4,
                textAlign: "center",
                borderRadius: 2,
                bgcolor: "background.paper",
              }}
            >
              <Typography variant="body1" color="text.secondary" paragraph>
                No achievements added yet
              </Typography>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => openAchievementDialog()}
                sx={{
                  borderColor: "#ca0019",
                  color: "#ca0019",
                  "&:hover": {
                    borderColor: "#a30014",
                    backgroundColor: "rgba(202, 0, 25, 0.04)",
                  },
                }}
              >
                Add Your First Achievement
              </Button>
            </Paper>
          )}
        </CustomTabPanel>

        {/* Bio Tab */}
        <CustomTabPanel value={value} index={2}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
            }}
          >
            <Typography variant="h6">About Me</Typography>
            {!editMode.bio && (
              <Button
                variant="outlined"
                size="small"
                startIcon={<EditIcon />}
                onClick={() => toggleEditMode("bio")}
                sx={{
                  borderColor: "#ca0019",
                  color: "#ca0019",
                  "&:hover": {
                    borderColor: "#a30014",
                    backgroundColor: "rgba(202, 0, 25, 0.04)",
                  },
                }}
              >
                Edit Bio
              </Button>
            )}
          </Box>

          <Paper
            elevation={2}
            sx={{
              p: 4,
              borderRadius: 2,
              bgcolor: "background.paper",
            }}
          >
            {editMode.bio ? (
              <Box>
                <TextField
                  name="bio"
                  value={editedUser.bio || ""}
                  onChange={handleProfileInputChange}
                  multiline
                  rows={6}
                  fullWidth
                  placeholder="Tell us about yourself, your interests, goals, and aspirations..."
                  variant="outlined"
                />
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: 1,
                    mt: 2,
                  }}
                >
                  <Button
                    variant="contained"
                    onClick={() => saveProfileChanges("bio")}
                    disabled={loading}
                    startIcon={
                      loading ? <CircularProgress size={20} /> : <SaveIcon />
                    }
                    sx={{
                      bgcolor: "#ca0019",
                      "&:hover": {
                        bgcolor: "#a30014",
                      },
                    }}
                  >
                    Save
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => toggleEditMode("bio")}
                    startIcon={<CancelIcon />}
                  >
                    Cancel
                  </Button>
                </Box>
              </Box>
            ) : (
              <>
                {user.bio ? (
                  <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
                    {user.bio}
                  </Typography>
                ) : (
                  <Box sx={{ textAlign: "center", py: 4 }}>
                    <Typography
                      variant="body1"
                      color="text.secondary"
                      paragraph
                    >
                      No bio information available
                    </Typography>
                    <Button
                      variant="outlined"
                      startIcon={<EditIcon />}
                      onClick={() => toggleEditMode("bio")}
                      sx={{
                        borderColor: "#ca0019",
                        color: "#ca0019",
                        "&:hover": {
                          borderColor: "#a30014",
                          backgroundColor: "rgba(202, 0, 25, 0.04)",
                        },
                      }}
                    >
                      Add Bio
                    </Button>
                  </Box>
                )}
              </>
            )}
          </Paper>

          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>
              Skills
            </Typography>
            <Paper
              elevation={2}
              sx={{
                p: 3,
                borderRadius: 2,
                bgcolor: "background.paper",
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
                <Typography variant="subtitle1">My Skills</Typography>
                {!editMode.skills && (
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<EditIcon />}
                    onClick={() => toggleEditMode("skills")}
                    sx={{
                      borderColor: "#ca0019",
                      color: "#ca0019",
                      "&:hover": {
                        borderColor: "#a30014",
                        backgroundColor: "rgba(202, 0, 25, 0.04)",
                      },
                    }}
                  >
                    Edit Skills
                  </Button>
                )}
              </Box>

              {editMode.skills ? (
                <Box>
                  <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                    <TextField
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      size="small"
                      placeholder="Add a skill"
                      fullWidth
                    />
                    <Button
                      variant="contained"
                      onClick={addSkill}
                      sx={{
                        bgcolor: "#ca0019",
                        "&:hover": {
                          bgcolor: "#a30014",
                        },
                      }}
                    >
                      Add
                    </Button>
                  </Box>
                  <Box
                    sx={{ display: "flex", flexWrap: "wrap", gap: 0.8, mb: 2 }}
                  >
                    {editedUser.skills &&
                      editedUser.skills.map((skill, index) => (
                        <Chip
                          key={index}
                          label={skill}
                          onDelete={() => removeSkill(index)}
                          sx={{
                            bgcolor: "rgba(202, 0, 25, 0.08)",
                            color: "#ca0019",
                            borderColor: "rgba(202, 0, 25, 0.3)",
                          }}
                        />
                      ))}
                  </Box>
                  <Box
                    sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}
                  >
                    <Button
                      variant="contained"
                      onClick={() => saveProfileChanges("skills")}
                      disabled={loading}
                      startIcon={
                        loading ? <CircularProgress size={20} /> : <SaveIcon />
                      }
                      sx={{
                        bgcolor: "#ca0019",
                        "&:hover": {
                          bgcolor: "#a30014",
                        },
                      }}
                    >
                      Save
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() => toggleEditMode("skills")}
                      startIcon={<CancelIcon />}
                    >
                      Cancel
                    </Button>
                  </Box>
                </Box>
              ) : (
                <>
                  {user.skills && user.skills.length > 0 ? (
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.8 }}>
                      {user.skills.map((skill, index) => (
                        <Chip
                          key={index}
                          label={skill}
                          sx={{
                            bgcolor: "rgba(202, 0, 25, 0.08)",
                            color: "#ca0019",
                            borderColor: "rgba(202, 0, 25, 0.3)",
                          }}
                        />
                      ))}
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No skills added yet
                    </Typography>
                  )}
                </>
              )}
            </Paper>
          </Box>
        </CustomTabPanel>

        {/* Certifications Tab */}
        <CustomTabPanel value={value} index={3}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
            }}
          >
            <Typography variant="h6">Certifications</Typography>
            <Button
              variant="contained"
              size="small"
              startIcon={<AddIcon />}
              onClick={() => openCertificationDialog()}
              sx={{
                bgcolor: "#ca0019",
                "&:hover": {
                  bgcolor: "#a30014",
                },
              }}
            >
              Add Certification
            </Button>
          </Box>

          {user.certifications && user.certifications.length > 0 ? (
            <Grid container spacing={3}>
              {user.certifications.map((certificate, idx) => (
                <Grid item xs={12} sm={6} md={4} key={idx}>
                  <Card elevation={2} md={4} key={idx} />
                  <Card
                    elevation={2}
                    sx={{
                      height: "100%",
                      borderRadius: 2,
                      transition: "transform 0.2s, box-shadow 0.2s",
                      "&:hover": {
                        transform: "translateY(-4px)",
                        boxShadow: 4,
                      },
                      bgcolor: "background.paper",
                    }}
                  >
                    <Box sx={{ position: "relative" }}>
                      <IconButton
                        size="small"
                        sx={{
                          position: "absolute",
                          top: 8,
                          right: 8,
                          zIndex: 2,
                          bgcolor: "rgba(255,255,255,0.8)",
                          "&:hover": {
                            bgcolor: "rgba(255,255,255,0.9)",
                          },
                        }}
                        onClick={(e) => handleMenuOpen(e, "certification", idx)}
                      >
                        <MoreVertIcon fontSize="small" />
                      </IconButton>

                      <CardMedia
                        component="iframe"
                        src={`https://drive.google.com/file/d/${certificate.fileId}/preview`}
                        sx={{
                          height: 180,
                          border: "none",
                        }}
                        title={certificate.fileName}
                      />
                    </Box>

                    <CardContent>
                      <Typography
                        variant="subtitle1"
                        fontWeight="medium"
                        gutterBottom
                      >
                        {certificate.fileName || `Certificate ${idx + 1}`}
                      </Typography>

                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          mt: 1,
                        }}
                      >
                        <Typography variant="caption" color="text.secondary">
                          {certificate.createdAt
                            ? formatDate(certificate.createdAt)
                            : "Date not available"}
                        </Typography>

                        {certificate.fileUrl && (
                          <Button
                            component="a"
                            href={certificate.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            size="small"
                            endIcon={<ArrowUpRight size={14} />}
                            sx={{ color: "#ca0019" }}
                          >
                            View
                          </Button>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Paper
              sx={{
                p: 4,
                textAlign: "center",
                borderRadius: 2,
                bgcolor: "background.paper",
              }}
            >
              <Typography variant="body1" color="text.secondary" paragraph>
                No certifications added yet
              </Typography>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => openCertificationDialog()}
                sx={{
                  borderColor: "#ca0019",
                  color: "#ca0019",
                  "&:hover": {
                    borderColor: "#a30014",
                    backgroundColor: "rgba(202, 0, 25, 0.04)",
                  },
                }}
              >
                Add Your First Certification
              </Button>
            </Paper>
          )}
        </CustomTabPanel>

        {/* Projects Tab */}
        <CustomTabPanel value={value} index={4}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
            }}
          >
            <Typography variant="h6">Projects</Typography>
            <Button
              variant="contained"
              size="small"
              startIcon={<AddIcon />}
              onClick={() => openProjectDialog()}
              sx={{
                bgcolor: "#ca0019",
                "&:hover": {
                  bgcolor: "#a30014",
                },
              }}
            >
              Add Project
            </Button>
          </Box>

          {user.projects && user.projects.length > 0 ? (
            <Grid container spacing={3}>
              {user.projects.map((project, idx) => (
                <Grid item xs={12} sm={6} key={idx}>
                  <Card
                    elevation={2}
                    sx={{
                      height: "100%",
                      borderRadius: 2,
                      transition: "transform 0.2s, box-shadow 0.2s",
                      "&:hover": {
                        transform: "translateY(-4px)",
                        boxShadow: 4,
                      },
                      bgcolor: "background.paper",
                    }}
                  >
                    <Box sx={{ position: "relative" }}>
                      <IconButton
                        size="small"
                        sx={{
                          position: "absolute",
                          top: 8,
                          right: 8,
                          zIndex: 2,
                          bgcolor: "rgba(255,255,255,0.8)",
                          "&:hover": {
                            bgcolor: "rgba(255,255,255,0.9)",
                          },
                        }}
                        onClick={(e) => handleMenuOpen(e, "project", idx)}
                      >
                        <MoreVertIcon fontSize="small" />
                      </IconButton>

                      {project.imageUrl && (
                        <CardMedia
                          component="img"
                          height="180"
                          image={project.imageUrl || "/placeholder.svg"}
                          alt={project.title}
                        />
                      )}
                    </Box>

                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {project.title}
                      </Typography>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        paragraph
                      >
                        {project.description}
                      </Typography>

                      <Box
                        sx={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: 0.5,
                          mb: 2,
                        }}
                      >
                        {project.technologies &&
                          project.technologies.map((tech, index) => (
                            <Chip
                              key={index}
                              label={tech}
                              size="small"
                              sx={{
                                bgcolor: "rgba(202, 0, 25, 0.08)",
                                color: "#ca0019",
                                borderColor: "rgba(202, 0, 25, 0.3)",
                              }}
                            />
                          ))}
                      </Box>

                      {project.link && (
                        <Button
                          component="a"
                          href={project.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          size="small"
                          startIcon={<LanguageIcon />}
                          endIcon={<ArrowUpRight size={14} />}
                          sx={{ color: "#ca0019" }}
                        >
                          View Project
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Paper
              sx={{
                p: 4,
                textAlign: "center",
                borderRadius: 2,
                bgcolor: "background.paper",
              }}
            >
              <Typography variant="body1" color="text.secondary" paragraph>
                No projects added yet
              </Typography>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => openProjectDialog()}
                sx={{
                  borderColor: "#ca0019",
                  color: "#ca0019",
                  "&:hover": {
                    borderColor: "#a30014",
                    backgroundColor: "rgba(202, 0, 25, 0.04)",
                  },
                }}
              >
                Add Your First Project
              </Button>
            </Paper>
          )}
        </CustomTabPanel>

        {/* Internships Tab */}
        <CustomTabPanel value={value} index={5}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
            }}
          >
            <Typography variant="h6">Internships</Typography>
            <Button
              variant="contained"
              size="small"
              startIcon={<AddIcon />}
              onClick={() => openInternshipDialog()}
              sx={{
                bgcolor: "#ca0019",
                "&:hover": {
                  bgcolor: "#a30014",
                },
              }}
            >
              Add Internship
            </Button>
          </Box>

          {user.internships && user.internships.length > 0 ? (
            <Grid container spacing={3}>
              {user.internships.map((internship, idx) => (
                <Grid item xs={12} md={6} key={idx}>
                  <Paper
                    elevation={2}
                    sx={{
                      p: 3,
                      borderRadius: 2,
                      height: "100%",
                      position: "relative",
                      bgcolor: "background.paper",
                      transition: "transform 0.2s, box-shadow 0.2s",
                      "&:hover": {
                        transform: "translateY(-4px)",
                        boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
                      },
                    }}
                  >
                    <IconButton
                      size="small"
                      sx={{ position: "absolute", top: 8, right: 8 }}
                      onClick={(e) => handleMenuOpen(e, "internship", idx)}
                    >
                      <MoreVertIcon fontSize="small" />
                    </IconButton>

                    <Box sx={{ display: "flex", gap: 2 }}>
                      <Avatar
                        sx={{
                          bgcolor: "rgba(202, 0, 25, 0.1)",
                          color: "#ca0019",
                          width: 50,
                          height: 50,
                        }}
                      >
                        <Briefcase />
                      </Avatar>

                      <Box sx={{ flex: 1 }}>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            flexWrap: "wrap",
                            mb: 1,
                          }}
                        >
                          <Typography variant="h6">
                            {internship.title}
                          </Typography>
                          <Chip
                            label={internship.type || "Internship"}
                            size="small"
                            sx={{
                              bgcolor: "rgba(202, 0, 25, 0.08)",
                              color: "#ca0019",
                            }}
                          />
                        </Box>

                        <Typography
                          variant="subtitle1"
                          color="#ca0019"
                          gutterBottom
                        >
                          {internship.company}
                        </Typography>

                        <Typography
                          variant="body2"
                          sx={{ display: "flex", alignItems: "center", mb: 2 }}
                        >
                          <CalendarMonthIcon
                            fontSize="small"
                            sx={{ mr: 0.5 }}
                          />
                          {internship.startDate} -{" "}
                          {internship.endDate || "Present"}
                        </Typography>

                        <Divider sx={{ my: 2 }} />

                        <Typography variant="body2" paragraph>
                          {internship.description}
                        </Typography>

                        {internship.skills && internship.skills.length > 0 && (
                          <Box sx={{ mt: 2 }}>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              gutterBottom
                            >
                              Skills Used:
                            </Typography>
                            <Box
                              sx={{
                                display: "flex",
                                flexWrap: "wrap",
                                gap: 0.5,
                                mt: 0.5,
                              }}
                            >
                              {internship.skills.map((skill, index) => (
                                <Chip
                                  key={index}
                                  label={skill}
                                  size="small"
                                  variant="outlined"
                                  sx={{
                                    bgcolor: "rgba(202, 0, 25, 0.08)",
                                    color: "#ca0019",
                                    borderColor: "rgba(202, 0, 25, 0.3)",
                                  }}
                                />
                              ))}
                            </Box>
                          </Box>
                        )}
                      </Box>
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Paper
              sx={{
                p: 4,
                textAlign: "center",
                borderRadius: 2,
                bgcolor: "background.paper",
              }}
            >
              <Typography variant="body1" color="text.secondary" paragraph>
                No internships added yet
              </Typography>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => openInternshipDialog()}
                sx={{
                  borderColor: "#ca0019",
                  color: "#ca0019",
                  "&:hover": {
                    borderColor: "#a30014",
                    backgroundColor: "rgba(202, 0, 25, 0.04)",
                  },
                }}
              >
                Add Your First Internship
              </Button>
            </Paper>
          )}
        </CustomTabPanel>

        {/* Events Tab */}
        <CustomTabPanel value={value} index={6}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <EventAvailableIcon sx={{ color: "#ca0019", mr: 1 }} />
              <Typography variant="h6">Event Participation</Typography>
            </Box>
            <Button
              variant="contained"
              size="small"
              startIcon={<AddIcon />}
              onClick={() => openEventDialog()}
              sx={{
                bgcolor: "#ca0019",
                "&:hover": {
                  bgcolor: "#a30014",
                },
              }}
            >
              Add Event
            </Button>
          </Box>

          {user.event_participation && user.event_participation.length > 0 ? (
            <Grid container spacing={3}>
              {user.event_participation.map((event, idx) => (
                <Grid item xs={12} sm={6} md={4} key={idx}>
                  <Paper
                    elevation={2}
                    sx={{
                      p: 3,
                      borderRadius: 2,
                      height: "100%",
                      position: "relative",
                      borderTop: `4px solid #ca0019`,
                      bgcolor: "background.paper",
                      transition: "transform 0.2s, box-shadow 0.2s",
                      "&:hover": {
                        transform: "translateY(-4px)",
                        boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
                      },
                    }}
                  >
                    <IconButton
                      size="small"
                      sx={{ position: "absolute", top: 8, right: 8 }}
                      onClick={(e) => handleMenuOpen(e, "event", idx)}
                    >
                      <MoreVertIcon fontSize="small" />
                    </IconButton>

                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        mb: 2,
                      }}
                    >
                      <Typography variant="h6">
                        {event.eventName || "Event Title"}
                      </Typography>
                      <Chip
                        label={event.eventStatus || "Participated"}
                        size="small"
                        sx={{
                          bgcolor: "rgba(202, 0, 25, 0.08)",
                          color: "#ca0019",
                        }}
                      />
                    </Box>

                    <Typography
                      variant="body2"
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        mb: 3,
                        color: "text.secondary",
                      }}
                    >
                      <CalendarMonthIcon fontSize="small" sx={{ mr: 0.5 }} />
                      {event.eventDate || "Event date"}
                    </Typography>

                    {event.eventContributionType &&
                      event.eventContributionType.length > 0 && (
                        <Box>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            gutterBottom
                          >
                            Contribution as:
                          </Typography>
                          <Box
                            sx={{
                              display: "flex",
                              flexWrap: "wrap",
                              gap: 0.5,
                              mt: 0.5,
                            }}
                          >
                            {event.eventContributionType.map((role, i) => (
                              <Chip
                                key={i}
                                label={role}
                                size="small"
                                variant="outlined"
                                sx={{
                                  bgcolor: "rgba(202, 0, 25, 0.08)",
                                  color: "#ca0019",
                                  borderColor: "rgba(202, 0, 25, 0.3)",
                                }}
                              />
                            ))}
                          </Box>
                        </Box>
                      )}
                  </Paper>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Paper
              sx={{
                p: 4,
                textAlign: "center",
                borderRadius: 2,
                bgcolor: "background.paper",
              }}
            >
              <Typography variant="body1" color="text.secondary" paragraph>
                No event participation records found
              </Typography>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => openEventDialog()}
                sx={{
                  borderColor: "#ca0019",
                  color: "#ca0019",
                  "&:hover": {
                    borderColor: "#a30014",
                    backgroundColor: "rgba(202, 0, 25, 0.04)",
                  },
                }}
              >
                Add Your First Event
              </Button>
            </Paper>
          )}
        </CustomTabPanel>
      </Paper>

      {/* Fine Modal */}
      <Dialog
        open={fineModalOpen}
        onClose={handleCloseFineModal}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ borderBottom: "1px solid", borderColor: "divider", fontWeight: 500 }}>
          Impose Fine on {user.fullName}
        </DialogTitle>

        <DialogContent sx={{ py: 3 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2, mt: 2 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 3 }}>
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Member Details
              </Typography>
              <Paper
                variant="outlined"
                sx={{ p: 2, bgcolor: "background.default" }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Avatar
                    src={`https://drive.google.com/uc?id=${user?.profilePic?.fileId}`}
                    alt={user.fullName}
                    sx={{ width: 40, height: 40 }}
                  />
                  <Box>
                    <Typography variant="body1" fontWeight="medium">
                      {user.fullName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {user.admno} ΓÇó {user.batch}
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Box>

            <TextField
              label="Fine Amount (Γé╣)"
              type="number"
              value={fineAmount}
              onChange={(e) => setFineAmount(e.target.value)}
              fullWidth
              variant="outlined"
              required
              inputProps={{ min: 1 }}
              placeholder="Enter amount in rupees"
            />

            <TextField
              label="Reason for Fine"
              value={fineReason}
              onChange={(e) => setFineReason(e.target.value)}
              fullWidth
              multiline
              rows={3}
              variant="outlined"
              required
              placeholder="Provide a clear reason for imposing this fine"
            />

            {Number.parseInt(user.fineStatus) > 0 && (
              <Alert severity="warning">
                This member already has an outstanding fine of Γé╣
                {user.fineStatus}. The new fine will be added to this amount.
              </Alert>
            )}
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseFineModal} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleImposeFine}
            disabled={loading}
            sx={{
              bgcolor: "#ca0019",
              "&:hover": { bgcolor: "#a30014" },
              color: "white",
            }}
            startIcon={
              loading ? <CircularProgress size={20} color="inherit" /> : null
            }
          >
            {loading ? "Processing..." : "Impose Fine"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Profile Picture Dialog */}
      <Dialog
        open={profilePictureDialogOpen}
        onClose={() => setProfilePictureDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Update Profile Picture</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2, mt: 2 }}>
              {error}
            </Alert>
          )}
          <Box
            sx={{
              mt: 2,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 3,
            }}
          >
            <Avatar
              src={
                profilePicture
                  ? URL.createObjectURL(profilePicture)
                  : getProxyImageUrl(user.profilePic.fileId)
              }
              alt={user.fullName}
              sx={{
                width: 150,
                height: 150,
                mb: 2,
                border: "4px solid", borderColor: "divider",
                boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
              }}
            />

            <Paper
              variant="outlined"
              sx={{
                p: 3,
                borderStyle: "dashed",
                width: "100%",
                textAlign: "center",
              }}
            >
              <input
                type="file"
                id="profile-picture"
                accept="image/*"
                onChange={handleProfilePictureChange}
                style={{ display: "none" }}
                ref={profilePictureInputRef}
              />
              <label htmlFor="profile-picture">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<UploadIcon />}
                  fullWidth
                  sx={{
                    borderColor: "#ca0019",
                    color: "#ca0019",
                    "&:hover": {
                      borderColor: "#a30014",
                      backgroundColor: "rgba(202, 0, 25, 0.04)",
                    },
                  }}
                >
                  {profilePicture ? "Change Image" : "Upload Profile Picture"}
                </Button>
              </label>
              {profilePicture && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 2 }}
                >
                  Selected image: {profilePicture.name}
                </Typography>
              )}
            </Paper>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setProfilePictureDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={uploadProfilePicture}
            disabled={loading || !profilePicture}
            startIcon={loading ? <CircularProgress size={20} /> : null}
            sx={{
              bgcolor: "#ca0019",
              "&:hover": { bgcolor: "#a30014" },
              color: "white",
            }}
          >
            {loading ? "Uploading..." : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Achievement Dialog */}
      <Dialog
        open={achievementDialogOpen}
        onClose={() => setAchievementDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {achievementEditIndex >= 0 ? "Edit Achievement" : "Add Achievement"}
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2, mt: 2 }}>
              {error}
            </Alert>
          )}
          <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 3 }}>
            <TextField
              label="Title"
              name="title"
              value={currentAchievement.title}
              onChange={handleAchievementInputChange}
              fullWidth
              required
            />
            <TextField
              label="Description"
              name="description"
              value={currentAchievement.description}
              onChange={handleAchievementInputChange}
              fullWidth
              multiline
              rows={3}
            />
            <TextField
              label="Date"
              name="date"
              type="date"
              value={currentAchievement.date}
              onChange={handleAchievementInputChange}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAchievementDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={saveAchievement}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
            sx={{
              bgcolor: "#ca0019",
              "&:hover": { bgcolor: "#a30014" },
              color: "white",
            }}
          >
            {loading ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Certification Dialog */}
      <Dialog
        open={certificationDialogOpen}
        onClose={() => setCertificationDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {certificationEditIndex >= 0
            ? "Edit Certification"
            : "Add Certification"}
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2, mt: 2 }}>
              {error}
            </Alert>
          )}
          <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 3 }}>
            <TextField
              label="Certificate Name"
              name="fileName"
              value={currentCertification.fileName}
              onChange={handleCertificationInputChange}
              fullWidth
              required
            />
            <Paper variant="outlined" sx={{ p: 3, borderStyle: "dashed" }}>
              <input
                type="file"
                id="certification-file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleCertificationFileChange}
                style={{ display: "none" }}
              />
              <label htmlFor="certification-file">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<FileUploadIcon />}
                  fullWidth
                  sx={{
                    borderColor: "#ca0019",
                    color: "#ca0019",
                    "&:hover": {
                      borderColor: "#a30014",
                      backgroundColor: "rgba(202, 0, 25, 0.04)",
                    },
                  }}
                >
                  {certificationFile
                    ? certificationFile.name
                    : "Upload Certificate"}
                </Button>
              </label>
              {certificationFile && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 2 }}
                >
                  Selected file: {certificationFile.name}
                </Typography>
              )}
              {certificationEditIndex >= 0 && !certificationFile && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 2 }}
                >
                  Current file will be kept if no new file is uploaded
                </Typography>
              )}
            </Paper>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCertificationDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={saveCertification}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
            sx={{
              bgcolor: "#ca0019",
              "&:hover": { bgcolor: "#a30014" },
              color: "white",
            }}
          >
            {loading ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Project Dialog */}
      <Dialog
        open={projectDialogOpen}
        onClose={() => setProjectDialogOpen(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          {projectEditIndex >= 0 ? "Edit Project" : "Add Project"}
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2, mt: 2 }}>
              {error}
            </Alert>
          )}
          <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 3 }}>
            <TextField
              label="Project Title"
              name="title"
              value={currentProject.title}
              onChange={handleProjectInputChange}
              fullWidth
              required
            />
            <TextField
              label="Description"
              name="description"
              value={currentProject.description}
              onChange={handleProjectInputChange}
              fullWidth
              multiline
              rows={3}
            />
            <TextField
              label="Project Link"
              name="link"
              value={currentProject.link}
              onChange={handleProjectInputChange}
              fullWidth
              placeholder="https://github.com/username/project"
            />

            {/* <Paper variant="outlined" sx={{ p: 3, borderStyle: "dashed" }}>
              <input
                type="file"
                id="project-image"
                accept="image/*"
                onChange={handleProjectImageChange}
                style={{ display: "none" }}
              />
              <label htmlFor="project-image">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<UploadIcon />}
                  fullWidth
                  sx={{
                    borderColor: "#ca0019",
                    color: "#ca0019",
                    "&:hover": {
                      borderColor: "#a30014",
                      backgroundColor: "rgba(202, 0, 25, 0.04)",
                    },
                  }}
                >
                  {projectImage ? projectImage.name : "Upload Project Image"}
                </Button>
              </label>
              {projectImage && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 2 }}
                >
                  Selected image: {projectImage.name}
                </Typography>
              )}
              {projectEditIndex >= 0 &&
                !projectImage &&
                currentProject.imageUrl && (
                  <Box sx={{ mt: 2 }}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      gutterBottom
                    >
                      Current image:
                    </Typography>
                    <img
                      src={currentProject.imageUrl || "/placeholder.svg"}
                      alt="Current project"
                      style={{
                        height: 80,
                        objectFit: "cover",
                        borderRadius: 4,
                      }}
                    />
                  </Box>
                )}
            </Paper> */}

            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Technologies Used
              </Typography>
              <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                <TextField
                  value={projectTechInput}
                  onChange={(e) => setProjectTechInput(e.target.value)}
                  size="small"
                  placeholder="Add a technology"
                  fullWidth
                />
                <Button
                  variant="contained"
                  onClick={addProjectTechnology}
                  sx={{
                    bgcolor: "#ca0019",
                    "&:hover": {
                      bgcolor: "#a30014",
                    },
                  }}
                >
                  Add
                </Button>
              </Box>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                {currentProject.technologies &&
                  currentProject.technologies.map((tech, index) => (
                    <Chip
                      key={index}
                      label={tech}
                      onDelete={() => removeProjectTechnology(index)}
                      size="small"
                      sx={{
                        bgcolor: "rgba(202, 0, 25, 0.08)",
                        color: "#ca0019",
                        borderColor: "rgba(202, 0, 25, 0.3)",
                      }}
                    />
                  ))}
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setProjectDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={saveProject}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
            sx={{
              bgcolor: "#ca0019",
              "&:hover": { bgcolor: "#a30014" },
              color: "white",
            }}
          >
            {loading ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Internship Dialog */}
      <Dialog
        open={internshipDialogOpen}
        onClose={() => setInternshipDialogOpen(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          {internshipEditIndex >= 0 ? "Edit Internship" : "Add Internship"}
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2, mt: 2 }}>
              {error}
            </Alert>
          )}
          <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Position/Title"
                  name="title"
                  value={currentInternship.title}
                  onChange={handleInternshipInputChange}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Company"
                  name="company"
                  value={currentInternship.company}
                  onChange={handleInternshipInputChange}
                  fullWidth
                  required
                />
              </Grid>
            </Grid>

            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select
                name="type"
                value={currentInternship.type || ""}
                label="Type"
                onChange={handleInternshipInputChange}
              >
                <MenuItem value="On-site">On-site</MenuItem>
                <MenuItem value="Remote">Remote</MenuItem>
                <MenuItem value="Hybrid">Hybrid</MenuItem>
              </Select>
              <FormHelperText>Select internship type</FormHelperText>
            </FormControl>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Start Date"
                  name="startDate"
                  type="date"
                  value={currentInternship.startDate}
                  onChange={handleInternshipInputChange}
                  fullWidth
                  required
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={currentlyWorking}
                        onChange={(e) => setCurrentlyWorking(e.target.checked)}
                      />
                    }
                    label="Currently Working"
                  />

                  {!currentlyWorking && (
                    <TextField
                      label="End Date"
                      name="endDate"
                      type="date"
                      value={currentInternship.endDate}
                      onChange={handleInternshipInputChange}
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                    />
                  )}
                </Box>
              </Grid>
            </Grid>

            <TextField
              label="Description"
              name="description"
              value={currentInternship.description}
              onChange={handleInternshipInputChange}
              fullWidth
              multiline
              rows={3}
            />

            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Skills Used
              </Typography>
              <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                <TextField
                  value={internshipSkillInput}
                  onChange={(e) => setInternshipSkillInput(e.target.value)}
                  size="small"
                  placeholder="Add a skill"
                  fullWidth
                />
                <Button
                  variant="contained"
                  onClick={addInternshipSkill}
                  sx={{
                    bgcolor: "#ca0019",
                    "&:hover": {
                      bgcolor: "#a30014",
                    },
                  }}
                >
                  Add
                </Button>
              </Box>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                {currentInternship.skills &&
                  currentInternship.skills.map((skill, index) => (
                    <Chip
                      key={index}
                      label={skill}
                      onDelete={() => removeInternshipSkill(index)}
                      size="small"
                      sx={{
                        bgcolor: "rgba(202, 0, 25, 0.08)",
                        color: "#ca0019",
                        borderColor: "rgba(202, 0, 25, 0.3)",
                      }}
                    />
                  ))}
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInternshipDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={saveInternship}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
            sx={{
              bgcolor: "#ca0019",
              "&:hover": { bgcolor: "#a30014" },
              color: "white",
            }}
          >
            {loading ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Event Dialog */}
      <Dialog
        open={eventDialogOpen}
        onClose={() => setEventDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {eventEditIndex >= 0 ? "Edit Event" : "Add Event"}
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2, mt: 2 }}>
              {error}
            </Alert>
          )}
          <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 3 }}>
            <TextField
              label="Event Name"
              name="eventName"
              value={currentEvent.eventName}
              onChange={handleEventInputChange}
              fullWidth
              required
            />

            <TextField
              label="Event Date"
              name="eventDate"
              type="date"
              value={currentEvent.eventDate}
              onChange={handleEventInputChange}
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
            />

            <FormControl fullWidth>
              <InputLabel>Event Status</InputLabel>
              <Select
                name="eventStatus"
                value={currentEvent.eventStatus || "completed"}
                label="Event Status"
                onChange={handleEventInputChange}
              >
                <MenuItem value="upcoming">Upcoming</MenuItem>
                <MenuItem value="ongoing">Ongoing</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
              </Select>
            </FormControl>

            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Contribution Types
              </Typography>
              <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                <TextField
                  value={eventContributionInput}
                  onChange={(e) => setEventContributionInput(e.target.value)}
                  size="small"
                  placeholder="Add a contribution type"
                  fullWidth
                />
                <Button
                  variant="contained"
                  onClick={addEventContribution}
                  sx={{
                    bgcolor: "#ca0019",
                    "&:hover": {
                      bgcolor: "#a30014",
                    },
                  }}
                >
                  Add
                </Button>
              </Box>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                {currentEvent.eventContributionType &&
                  currentEvent.eventContributionType.map(
                    (contribution, index) => (
                      <Chip
                        key={index}
                        label={contribution}
                        onDelete={() => removeEventContribution(index)}
                        size="small"
                        sx={{
                          bgcolor: "rgba(202, 0, 25, 0.08)",
                          color: "#ca0019",
                          borderColor: "rgba(202, 0, 25, 0.3)",
                        }}
                      />
                    )
                  )}
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEventDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={saveEvent}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
            sx={{
              bgcolor: "#ca0019",
              "&:hover": { bgcolor: "#a30014" },
              color: "white",
            }}
          >
            {loading ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Semester Dialog */}
      <Dialog
        open={semesterDialogOpen}
        onClose={() => setSemesterDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {semesterEditIndex >= 0 ? "Edit Semester" : "Add Semester"}
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2, mt: 2 }}>
              {error}
            </Alert>
          )}
          <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 3 }}>
            <FormControl fullWidth>
              <InputLabel>Semester</InputLabel>
              <Select
                name="semester"
                value={currentSemester.semester || ""}
                label="Semester"
                onChange={handleSemesterInputChange}
                required
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                  <MenuItem key={sem} value={sem}>
                    Semester {sem}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="SGPA"
              name="sgpa"
              type="number"
              value={currentSemester.sgpa}
              onChange={handleSemesterInputChange}
              fullWidth
              required
              inputProps={{
                min: 0,
                max: 10,
                step: 0.01,
              }}
              helperText="Enter SGPA between 0-10"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSemesterDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={saveSemester}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
            sx={{
              bgcolor: "#ca0019",
              "&:hover": { bgcolor: "#a30014" },
              color: "white",
            }}
          >
            {loading ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Item Action Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleMenuAction("edit")}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} /> Edit
        </MenuItem>
        <MenuItem onClick={() => handleMenuAction("delete")}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} /> Delete
        </MenuItem>
      </Menu>

      {/* Alert Snackbar */}
      <Snackbar
        open={alert.open}
        autoHideDuration={6000}
        onClose={() => setAlert({ ...alert, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setAlert({ ...alert, open: false })}
          severity={alert.severity}
        >
          {alert.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Index;
