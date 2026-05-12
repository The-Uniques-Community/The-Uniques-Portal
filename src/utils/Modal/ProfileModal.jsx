import * as React from "react";
import {
  Button,
  Modal,
  Tooltip,
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
} from "@mui/material";
import axios from "axios";
import { BASE_URL } from "@/config";
import tu from "@/assets/logos/tu.png";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import GitHubIcon from "@mui/icons-material/GitHub";
import XIcon from "@mui/icons-material/X";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import { Link } from "react-router";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import { ArrowUpRight, Award, Briefcase } from "lucide-react";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import AutoStoriesIcon from "@mui/icons-material/AutoStories";
import BusinessIcon from "@mui/icons-material/Business";
import PropTypes from "prop-types";
import LabelIcon from "@mui/icons-material/Label";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import LoginIcon from "@mui/icons-material/Login";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import VerifiedIcon from "@mui/icons-material/Verified";
import BlockIcon from "@mui/icons-material/Block";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
import InstagramIcon from "@mui/icons-material/Instagram";
import SchoolIcon from "@mui/icons-material/School";
import WorkIcon from "@mui/icons-material/Work";
import EventIcon from "@mui/icons-material/Event";
import AssignmentIcon from "@mui/icons-material/Assignment";
import PeopleIcon from "@mui/icons-material/People";
import AssessmentIcon from "@mui/icons-material/Assessment";
import DoneIcon from "@mui/icons-material/Done";
import ErrorIcon from "@mui/icons-material/Error";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import userIcon from "@/assets/img/user-icon.png"
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

const ProfileModal = ({ open, handleClose, user, refreshData }) => {
  const [blockLoading, setBlockLoading] = React.useState(false);
  const [value, setValue] = React.useState(0);
  const [fineModalOpen, setFineModalOpen] = React.useState(false);
  const [fineAmount, setFineAmount] = React.useState("");
  const [fineReason, setFineReason] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [alert, setAlert] = React.useState({
    open: false,
    message: "",
    severity: "success",
  });

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };
  const handleToggleBlockStatus = async () => {
    try {
      setBlockLoading(true);

      // Make API call to toggle block status
      const response = await axios.patch(
        `${BASE_URL}/api/admin/member/${user._id}/block`
      );

      // Show success message
      setAlert({
        open: true,
        message: user.isSuspended
          ? `${user.fullName} has been unblocked successfully`
          : `${user.fullName} has been blocked successfully`,
        severity: "success",
      });

      // Refresh data to show updated status
      if (refreshData && typeof refreshData === "function") {
        refreshData();
      }
    } catch (err) {
      console.error("Error toggling block status:", err);

      // Show error message
      setAlert({
        open: true,
        message: err.response?.data?.message ||
          "Failed to update block status. Please try again.",
        severity: "error",
      });
    } finally {
      setBlockLoading(false);
    }
  };
  // Status badge
  const getStatusBadge = () => {
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

  const getProxyImageUrl = (fileId) => {
    if (!fileId) return '/placeholder.svg'; // Fallback image
    return `${BASE_URL}/api/image-proxy/${fileId}`;
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
        `${BASE_URL}/api/admin/member/${user._id}/fine`,
        {
          amount: Number(fineAmount),
          reason: fineReason.trim(),
        }
      );

      // Show success message
      setAlert({
        open: true,
        message: `Fine of ₹${fineAmount} imposed successfully`,
        severity: "success",
      });

      // Close modal
      setFineModalOpen(false);

      // Refresh data to show updated fine status
      if (refreshData && typeof refreshData === "function") {
        refreshData();
      }
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

  return (
    <>
      <Modal open={open} onClose={handleClose}>
        <div className="h-screen overflow-y-scroll bg-white p-4">
          <div className="flex justify-end py-2 mb-3">
            <Tooltip title="Close" arrow>
              <div
                onClick={handleClose}
                className="p-3 w-12 h-12 rounded-full cursor-pointer flex items-center justify-center hover:bg-slate-200"
              >
                <CloseIcon fontSize="large" />
              </div>
            </Tooltip>
          </div>
          <div className="grid xl:grid-cols-4 lg:grid-cols-3 col-span-1 mb-7 gap-x-6 gap-y-5">
            <div className="xl:col-span-1 lg:col-span-1 col-span-1 flex gap-x-5 items-center">
              <div className="bg-black w-36 h-36 overflow-hidden rounded-full relative">
                <img
                  src={
                    user?.profilePic?.fileId
                      ? getProxyImageUrl(user.profilePic.fileId)
                      : userIcon
                  }
                  alt="Profile"
                  className="w-full h-full object-contain"
                />
                {user?.isVerified && (
                  <div className="absolute bottom-1 right-1 bg-white rounded-full p-1">
                    <VerifiedIcon color="primary" />
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">
                    //{user.role || "member"}
                  </span>
                  {getStatusBadge()}
                </div>
                <p className="text-3xl font-medium">{user.fullName}</p>
                <div className="flex justify-start gap-x-4 mt-3">
                  {user.githubProfile && (
                    <Link to={user.githubProfile || ""}>
                      <div className="w-7 h-7 p-1 bg-slate-500 rounded-full">
                        <div className="w-full h-full flex items-center justify-center">
                          <GitHubIcon fontSize="small" className="text-white" />
                        </div>
                      </div>
                    </Link>
                  )}
                  {user.linkedinProfile && (
                    <Link to={user.linkedinProfile || ""}>
                      <div className="w-7 h-7 p-1 bg-slate-500 rounded-full">
                        <div className="w-full h-full flex items-center justify-center">
                          <LinkedInIcon
                            fontSize="small"
                            className="text-white"
                          />
                        </div>
                      </div>
                    </Link>
                  )}
                  {user.twitterProfile && (
                    <Link to={user.twitterProfile || ""}>
                      <div className="w-7 h-7 p-1 bg-slate-500 rounded-full">
                        <div className="w-full h-full flex items-center justify-center">
                          <XIcon fontSize="small" className="text-white" />
                        </div>
                      </div>
                    </Link>
                  )}
                  {user.instagramProfile && (
                    <Link to={user.instagramProfile || ""}>
                      <div className="w-7 h-7 p-1 bg-slate-500 rounded-full">
                        <div className="w-full h-full flex items-center justify-center">
                          <InstagramIcon
                            fontSize="small"
                            className="text-white"
                          />
                        </div>
                      </div>
                    </Link>
                  )}
                  {user.whatsappContact && (
                    <Link to={`https://wa.me/${user.whatsappContact}` || ""}>
                      <div className="w-7 h-7 p-1 bg-slate-500 rounded-full">
                        <div className="w-full h-full flex items-center justify-center">
                          <WhatsAppIcon
                            fontSize="small"
                            className="text-white"
                          />
                        </div>
                      </div>
                    </Link>
                  )}
                </div>
              </div>
            </div>
            <div className="border-l p-5 xl:col-span-2 lg:col-span-1 col-span-1">
              <div className="flex items-center justify-start gap-x-3 mb-3">
                <img src={tu} className="h-7 w-7 object-contain" alt="" />
                <p className="text-slate-500">
                  <span className="font-medium">Batch:</span> {user.batch}
                </p>
              </div>
              <div className="flex items-center gap-x-3 mb-4">
                <AutoStoriesIcon fontSize="medium" className="text-slate-500" />
                <p className="text-slate-500">
                  <span className="font-medium">Course:</span> {user.course}
                </p>
              </div>
              <div className="flex items-center gap-x-3 mb-4">
                <LabelIcon fontSize="medium" className="text-slate-500" />
                <p className="text-slate-500">
                  <span className="font-medium">Admn No:</span> {user.admno}
                </p>
              </div>
              <div className="flex items-center gap-x-3 mb-4">
                <BusinessIcon fontSize="medium" className="text-slate-500" />
                <p className="text-slate-500">
                  <span className="font-medium">Placement:</span>{" "}
                  {user.isPlaced === true ? "Placed" : "Not Placed"}
                </p>
              </div>
              {parseInt(user.fineStatus) > 0 && (
                <div className="flex items-center gap-x-3 mb-4">
                  <CurrencyRupeeIcon
                    fontSize="medium"
                    className="text-red-500"
                  />
                  <p className="text-red-500">
                    <span className="font-medium">Fine Amount:</span> ₹
                    {user.fineStatus}
                  </p>
                </div>
              )}
              <div className="flex items-center justify-end gap-x-3 mb-4">
                <LoginIcon fontSize="small" className="text-slate-500" />
                <p className="text-slate-500 text-sm">
                  <span className="font-medium">User joined on:</span>{" "}
                  {formatDate(user.createdAt)}
                </p>
              </div>
            </div>
            <div className="col-span-1">
              <div className="flex flex-wrap items-center h-full gap-3">
                <Button
                  variant="contained"
                  color="primary"
                  size="medium"
                  startIcon={<CurrencyRupeeIcon />}
                  disabled={user.isSuspended}
                  onClick={handleOpenFineModal}
                >
                  Impose Fine
                </Button>
                <Button
                  variant="contained"
                  color={user.isSuspended ? "success" : "error"}
                  size="medium"
                  startIcon={
                    blockLoading ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : user.isSuspended ? (
                      <DoneIcon />
                    ) : (
                      <BlockIcon />
                    )
                  }
                  onClick={handleToggleBlockStatus}
                  disabled={blockLoading}
                >
                  {user.isSuspended ? "Unblock" : "Block"}
                </Button>
              </div>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-4 gap-4">
            <div className="lg:col-span-1 col-span-4">
              <h3 className="text-xl font-medium">Overview</h3>
              <div className="my-3 ">
                <div>
                  <p className="bg-black p-1 px-2 rounded-tr-full text-white">
                    BIO
                  </p>
                  <div className="py-3 px-2 bg-slate-50 border border-slate-200 rounded-b-md">
                    <div className="flex items-start mb-2 gap-x-3">
                      <BookmarkIcon
                        fontSize="small"
                        className="text-slate-500"
                      />
                      <p className="text-slate-500 text-sm">
                        {user.bio || "No bio available"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="my-3 ">
                <div>
                  <p className="bg-black p-1 px-2 rounded-tr-full text-white">
                    CONTACT INFORMATION
                  </p>
                  <div className="py-3 px-2 bg-slate-50 border border-slate-200 rounded-b-md">
                    <div className="flex items-center mb-2 gap-x-3">
                      <EmailIcon fontSize="small" className="text-slate-500" />
                      <p className="text-slate-500 text-sm">{user.email}</p>
                    </div>
                    {user.contact && (
                      <div className="flex items-center mb-2 gap-x-3">
                        <PhoneIcon
                          fontSize="small"
                          className="text-slate-500"
                        />
                        <p className="text-slate-500 text-sm">
                          <Link to={`tel:${user.contact}`}>{user.contact}</Link>
                        </p>
                      </div>
                    )}
                    {(user.address || user.city || user.state) && (
                      <div className="flex items-start mb-2 gap-x-3">
                        <LocationOnIcon
                          fontSize="small"
                          className="text-slate-500"
                        />
                        <p className="text-slate-500 text-sm">
                          {user.address}{" "}
                          {user.address && (user.city || user.state) && "|"}{" "}
                          {user.city}
                          {user.city && user.state && ","} {user.state}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="my-3 ">
                <div>
                  <p className="bg-black p-1 px-2 rounded-tr-full text-white">
                    SKILLS
                  </p>
                  <div className="py-3 bg-slate-50 border border-slate-200 rounded-b-md">
                    {user.skills && user.skills.length > 0 ? (
                      user.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="bg-slate-200 text-xs my-1 inline-block mx-1 p-1 px-2 rounded-full"
                        >
                          {skill}
                        </span>
                      ))
                    ) : (
                      <p className="text-slate-500 text-sm px-2">
                        No skills added yet
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="lg:col-span-3 col-span-4">
              <Box sx={{ width: "100%" }}>
                <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                  <Tabs
                    value={value}
                    onChange={handleChange}
                    variant="scrollable"
                    scrollButtons="auto"
                  >
                    <Tab
                      icon={<AssessmentIcon />}
                      iconPosition="start"
                      label="Statistics"
                      {...a11yProps(0)}
                    />
                    <Tab
                      icon={<Award size={20} />}
                      iconPosition="start"
                      label="Achievements"
                      {...a11yProps(1)}
                    />
                    <Tab
                      icon={<AssignmentIcon />}
                      iconPosition="start"
                      label="Certifications"
                      {...a11yProps(2)}
                    />
                    <Tab
                      icon={<AssignmentIcon />}
                      iconPosition="start"
                      label="Projects"
                      {...a11yProps(3)}
                    />
                    <Tab
                      icon={<WorkIcon />}
                      iconPosition="start"
                      label="Internships"
                      {...a11yProps(4)}
                    />
                    <Tab
                      icon={<EventIcon />}
                      iconPosition="start"
                      label="Events"
                      {...a11yProps(5)}
                    />
                  </Tabs>
                </Box>
                <CustomTabPanel value={value} index={0}>
                  <div className="space-y-6">
                    {/* Academic Performance */}
                    <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
                      <div className="flex items-center gap-2 mb-4">
                        <SchoolIcon className="text-[#ca0019]" />
                        <h4 className="text-lg font-medium">
                          Academic Performance
                        </h4>
                      </div>

                      {/* Overall CGPA */}
                      <div className="mb-6">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-gray-700">Overall CGPA</span>
                          <Chip
                            label={user.cgpa || "N/A"}
                            color={
                              !user.cgpa
                                ? "default"
                                : parseFloat(user.cgpa) >= 8.0
                                  ? "success"
                                  : parseFloat(user.cgpa) >= 6.0
                                    ? "primary"
                                    : "warning"
                            }
                            variant="outlined"
                          />
                        </div>
                      </div>

                      {/* Semester-wise SGPA */}
                      <div className="space-y-4">
                        <h5 className="text-gray-700 font-medium">
                          Semester Performance
                        </h5>

                        {user.semesterSGPA && user.semesterSGPA.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {user.semesterSGPA
                              .sort((a, b) => a.semester - b.semester)
                              .map((sem) => (
                                <div
                                  key={sem.semester}
                                  className="border border-gray-100 rounded p-3 bg-gray-50"
                                >
                                  <div className="flex justify-between mb-2">
                                    <span className="font-medium">
                                      Semester {sem.semester}
                                    </span>
                                    <Chip
                                      label={sem.sgpa.toFixed(2)}
                                      size="small"
                                      color={
                                        sem.sgpa >= 8.0
                                          ? "success"
                                          : sem.sgpa >= 6.0
                                            ? "primary"
                                            : "warning"
                                      }
                                    />
                                  </div>
                                  <LinearProgress
                                    variant="determinate"
                                    value={(sem.sgpa / 10) * 100}
                                    sx={{
                                      height: 8,
                                      borderRadius: 5,
                                      backgroundColor: "#e0e0e0",
                                      "& .MuiLinearProgress-bar": {
                                        backgroundColor:
                                          sem.sgpa >= 8.0
                                            ? "#4caf50"
                                            : sem.sgpa >= 6.0
                                              ? "#2196f3"
                                              : "#ff9800",
                                      },
                                    }}
                                  />
                                </div>
                              ))}
                          </div>
                        ) : (
                          <p className="text-gray-500">
                            No semester data available
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Supplementary Information */}
                    {user.semesterSupplementary &&
                      user.semesterSupplementary.length > 0 && (
                        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
                          <div className="flex items-center gap-2 mb-4">
                            <ErrorIcon className="text-amber-500" />
                            <h4 className="text-lg font-medium">
                              Supplementary Exams
                            </h4>
                          </div>

                          <div className="space-y-4">
                            {user.semesterSupplementary.map((sem) => (
                              <div
                                key={sem.semester}
                                className="border border-gray-100 rounded p-4"
                              >
                                <h5 className="font-medium mb-3">
                                  Semester {sem.semester}
                                </h5>

                                {sem.subjects.length > 0 ? (
                                  <div className="space-y-2">
                                    {sem.subjects.map((subject, idx) => (
                                      <div
                                        key={idx}
                                        className="flex justify-between items-center p-2 bg-gray-50 rounded"
                                      >
                                        <div>
                                          <p className="font-medium">
                                            {subject.subjectName}
                                          </p>
                                          <p className="text-xs text-gray-500">
                                            {subject.subjectCode}
                                          </p>
                                        </div>
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
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-gray-500">
                                    No supplementary subjects
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                    {/* Fine Status */}
                    {parseInt(user.fineStatus) > 0 && (
                      <div className="bg-red-50 border border-red-100 rounded-lg p-5">
                        <div className="flex items-center gap-2 mb-4">
                          <CurrencyRupeeIcon className="text-red-500" />
                          <h4 className="text-lg font-medium text-red-700">
                            Fine Details
                          </h4>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-red-700 font-medium">
                            Outstanding Amount
                          </span>
                          <Chip label={`₹${user.fineStatus}`} color="error" />
                        </div>

                        <p className="text-red-600 text-sm mt-3">
                          This fine must be cleared before the end of the
                          semester to avoid exam restrictions.
                        </p>
                      </div>
                    )}
                  </div>
                </CustomTabPanel>
                <CustomTabPanel value={value} index={1}>
                  {user.achievements && user.achievements.length > 0 ? (
                    <div className="mb-8">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {user.achievements.map((achievement, idx) => (
                          <div
                            key={idx}
                            className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-start gap-3">
                              <div
                                className={`text-white p-2 rounded-full flex items-center justify-center ${achievement.color || "bg-slate-100"
                                  }`}
                              >
                                {achievement.icon || (
                                  <Award className="w-10 h-10 text-slate-500" />
                                )}
                              </div>
                              <div>
                                <h5 className="font-medium text-gray-900">
                                  {achievement.title}
                                </h5>
                                <p className="text-sm text-gray-600 mt-1">
                                  {achievement.description}
                                </p>
                                {achievement.date && (
                                  <p className="text-xs text-gray-500 mt-1.5">
                                    {achievement.date || "------"}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No achievements added yet</p>
                    </div>
                  )}
                </CustomTabPanel>
                <CustomTabPanel value={value} index={2}>
                  <div>
                    <div className="grid grid-cols-1 xl:grid-cols-3 lg:grid-cols-3 gap-5">
                      {user.certifications && user.certifications.length > 0 ? (
                        user.certifications.map((certificate, idx) => {
                          // Convert Drive URL to preview URL for iframe embedding
                          const getPreviewUrl = (url) => {
                            if (!url) return null;

                            // For uc?id= format (direct download links)
                            if (url.includes("drive.google.com/uc?id=")) {
                              const fileId = url.split("id=")[1]?.split("&")[0];
                              if (fileId) {
                                const previewUrl = `https://drive.google.com/file/d/${fileId}/preview`;
                                return previewUrl;
                              }
                            }

                            return url;
                          };

                          // Get both the original URL (for direct viewing) and preview URL (for iframe)
                          const fileUrl = certificate?.fileUrl || null;
                          const previewUrl = fileUrl
                            ? getPreviewUrl(fileUrl)
                            : null;

                          return (
                            <div
                              key={idx}
                              className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                            >
                              <div className="aspect-[16/9] overflow-hidden bg-gray-50">
                                {previewUrl ? (
                                  <iframe
                                    src={previewUrl}
                                    className="w-full h-full"
                                    frameBorder="0"
                                    allowFullScreen
                                    loading="lazy"
                                    title={
                                      certificate.fileName ||
                                      `Certificate ${idx + 1}`
                                    }
                                    onError={(e) => {
                                      console.error(
                                        `Iframe load error for cert ${idx}:`,
                                        e
                                      );
                                      // If iframe fails, replace with fallback content
                                      e.target.style.display = "none";
                                      const parent = e.target.parentNode;
                                      const fallback =
                                        document.createElement("div");
                                      fallback.className =
                                        "flex flex-col items-center justify-center h-full";
                                      fallback.innerHTML = `
                        <div class="text-gray-400">
                          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                          <p class="mt-2 text-sm">Unable to preview certificate</p>
                        </div>
                      `;
                                      parent.appendChild(fallback);
                                    }}
                                  />
                                ) : (
                                  <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                    <AssignmentIcon style={{ fontSize: 40 }} />
                                    <p className="mt-2 text-sm">
                                      Preview not available
                                    </p>
                                  </div>
                                )}
                              </div>
                              <div className="p-4">
                                <h5 className="font-medium text-gray-900">
                                  {certificate.fileName ||
                                    `Certificate ${idx + 1}`}
                                </h5>

                                <div className="flex justify-between items-center mt-2">
                                  <p className="text-xs text-gray-500">
                                    {certificate.createdAt
                                      ? formatDate(certificate.createdAt)
                                      : "Date not available"}
                                  </p>

                                  {fileUrl && (
                                    <a
                                      href={fileUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-[#ca0019] text-sm font-medium flex items-center gap-1 hover:underline"
                                    >
                                      View <ArrowUpRight size={14} />
                                    </a>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="col-span-3 text-center py-8">
                          <p className="text-gray-500">
                            No certifications added yet
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </CustomTabPanel>

                <CustomTabPanel value={value} index={3}>
                  <div>
                    <div className="space-y-6 grid grid-cols-1 xl:grid-cols-2 lg:grid-cols-2 gap-5">
                      {user.projects && user.projects.length > 0 ? (
                        user.projects.map((project, idx) => (
                          <div
                            key={idx}
                            className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                          >
                            {project.imageUrl && (
                              <div className="aspect-[21/9] overflow-hidden bg-gray-50">
                                <img
                                  src={
                                    project.imageUrl ||
                                    "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
                                  }
                                  alt={project.title}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                            <div className="p-5">
                              <h5 className="font-medium text-lg text-gray-900">
                                {project.title}
                              </h5>
                              <p className="text-gray-700 my-3 leading-relaxed">
                                {project.description}
                              </p>
                              <div className="flex flex-wrap gap-2 mb-4">
                                {project.technologies &&
                                  project.technologies.map((tech, index) => (
                                    <span
                                      key={index}
                                      className="text-xs bg-gray-100 px-2.5 py-1 rounded-full"
                                    >
                                      {tech}
                                    </span>
                                  ))}
                              </div>
                              {project.link && (
                                <a
                                  href={project.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-[#ca0019] hover:underline flex items-center gap-1 font-medium"
                                >
                                  View Project <ArrowUpRight size={14} />
                                </a>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="col-span-2 text-center py-8">
                          <p className="text-gray-500">No projects added yet</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CustomTabPanel>
                <CustomTabPanel value={value} index={4}>
                  <div className="space-y-4">
                    {user.internships && user.internships.length > 0 ? (
                      user.internships.map((internship, idx) => (
                        <div
                          key={idx}
                          className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm"
                        >
                          <div className="flex items-start gap-4">
                            <div className="bg-slate-100 p-3 rounded-full">
                              <Briefcase className="text-slate-500" size={24} />
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between flex-wrap">
                                <h4 className="font-medium text-lg">
                                  {internship.title}
                                </h4>
                                <Chip
                                  label={internship.type || "Internship"}
                                  size="small"
                                  color={
                                    internship.type === "Remote"
                                      ? "info"
                                      : "default"
                                  }
                                />
                              </div>
                              <h5 className="text-[#ca0019] font-medium">
                                {internship.company}
                              </h5>

                              <div className="flex items-center gap-2 text-gray-500 text-sm mt-1">
                                <CalendarMonthIcon fontSize="small" />
                                <span>
                                  {internship.startDate} -{" "}
                                  {internship.endDate || "Present"}
                                </span>
                              </div>

                              <Divider className="my-3" />

                              <p className="text-gray-700 mt-2">
                                {internship.description}
                              </p>

                              {internship.skills && (
                                <div className="mt-3">
                                  <div className="flex flex-wrap gap-2">
                                    {internship.skills.map((skill, index) => (
                                      <Chip
                                        key={index}
                                        label={skill}
                                        size="small"
                                        variant="outlined"
                                        className="text-xs"
                                      />
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-500">
                          No internships added yet
                        </p>
                      </div>
                    )}
                  </div>
                </CustomTabPanel>
                <CustomTabPanel value={value} index={5}>
                  <div className="space-y-4">
                    {user.event_participation &&
                      user.event_participation.length > 0 ? (
                      <div>
                        <h4 className="font-medium text-lg mb-4 flex items-center gap-2">
                          <EventAvailableIcon className="text-[#ca0019]" />
                          Event Participation
                        </h4>

                        <Grid container spacing={3}>
                          {user.event_participation.map((event, idx) => (
                            <Grid item xs={12} md={6} key={idx}>
                              <div className="border border-gray-200 rounded-lg p-4 h-full bg-white shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start">
                                  <h5 className="font-medium">
                                    {event.eventName || "Event Title"}
                                  </h5>
                                  <Chip
                                    label={event.eventStatus || "Participated"}
                                    size="small"
                                    color={
                                      event.eventStatus === "upcoming"
                                        ? "primary"
                                        : event.eventStatus === "completed"
                                          ? "success"
                                          : "default"
                                    }
                                  />
                                </div>

                                <div className="mt-2 text-sm text-gray-600 flex items-center gap-1">
                                  <CalendarMonthIcon fontSize="small" />
                                  <span>{event.eventDate || "Event date"}</span>
                                </div>

                                {user.eventContributionType && (
                                  <div className="mt-3">
                                    <p className="text-sm text-gray-500 mb-1">
                                      Contribution as:
                                    </p>
                                    <div className="flex flex-wrap gap-1">
                                      {user.eventContributionType.map(
                                        (role, i) => (
                                          <Chip
                                            key={i}
                                            label={role}
                                            size="small"
                                            variant="outlined"
                                            className="text-xs"
                                          />
                                        )
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </Grid>
                          ))}
                        </Grid>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-500">
                          No event participation records found
                        </p>
                      </div>
                    )}
                  </div>
                </CustomTabPanel>
              </Box>
            </div>
          </div>
        </div>
      </Modal>

      {/* Fine Modal */}
      <Dialog
        open={fineModalOpen}
        onClose={handleCloseFineModal}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ borderBottom: "1px solid #eee", fontWeight: 500 }}>
          Impose Fine on {user.fullName}
        </DialogTitle>

        <DialogContent sx={{ py: 3 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2, mt: 2 }}>
              {error}
            </Alert>
          )}

          <div className="space-y-4 mt-2">
            <div>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Member Details
              </Typography>
              <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-md">
                <Avatar
                  src={user.profilePic?.fileUrl || userIcon}
                  alt={user.fullName}
                  sx={{ width: 40, height: 40 }}
                />
                <div>
                  <Typography variant="body1" className="font-medium">
                    {user.fullName}
                  </Typography>
                  <Typography variant="body2" className="text-gray-500">
                    {user.admno} • {user.batch}
                  </Typography>
                </div>
              </div>
            </div>

            <TextField
              label="Fine Amount (₹)"
              type="number"
              value={fineAmount}
              onChange={(e) => setFineAmount(e.target.value)}
              fullWidth
              variant="outlined"
              required
              inputProps={{ min: 1 }}
              placeholder="Enter amount in rupees"
              margin="normal"
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
              margin="normal"
            />

            {parseInt(user.fineStatus) > 0 && (
              <Alert severity="warning">
                This member already has an outstanding fine of ₹
                {user.fineStatus}. The new fine will be added to this amount.
              </Alert>
            )}
          </div>
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
    </>
  );
};

export default ProfileModal;
