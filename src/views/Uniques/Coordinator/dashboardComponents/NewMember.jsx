import React, { useState } from "react";
import {
  Button,
  Card,
  CardContent,
  Avatar,
  Modal,
  Box,
  Tabs,
  Tab,
  Chip,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  Snackbar,
  Alert,
  CircularProgress,
} from "@mui/material";
import { FaEye } from "react-icons/fa";
import InfoIcon from "@mui/icons-material/Info";
import PushPinIcon from "@mui/icons-material/PushPin";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import CallIcon from "@mui/icons-material/Call";
import SchoolIcon from "@mui/icons-material/School";
import WarningIcon from "@mui/icons-material/Warning";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import GitHubIcon from "@mui/icons-material/GitHub";
import InstagramIcon from "@mui/icons-material/Instagram";
import TwitterIcon from "@mui/icons-material/Twitter";
import WorkIcon from "@mui/icons-material/Work";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import CodeIcon from "@mui/icons-material/Code";
import BadgeIcon from "@mui/icons-material/Badge";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import BlockIcon from "@mui/icons-material/Block";
import DoneIcon from "@mui/icons-material/Done";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
import axios from "axios";
import { BASE_URL } from "@/config";
import userIcon from "@/assets/img/user-icon.png";
import tu from "@/assets/logos/tu.png";

export const NewMember = ({ user, refreshData }) => {
  const [open, setOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [expandedSemesters, setExpandedSemesters] = useState({});

  // API related states
  const [loading, setLoading] = useState(false);
  const [blockLoading, setBlockLoading] = useState(false);
  const [suspendLoading, setSuspendLoading] = useState(false);
  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false);
  const [suspendReason, setSuspendReason] = useState("");
  const [fineDialogOpen, setFineDialogOpen] = useState(false);
  const [fineAmount, setFineAmount] = useState("");
  const [fineReason, setFineReason] = useState("");
  const [alert, setAlert] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const toggleSemesterExpand = (semester) => {
    setExpandedSemesters((prev) => ({
      ...prev,
      [semester]: !prev[semester],
    }));
  };

  const getProxyImageUrl = (fileId) => {
    if (!fileId) return "/placeholder.svg"; // Fallback image
    return `${BASE_URL}/api/image-proxy/${fileId}`;
  };
  // Get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-500";
      case "pending":
        return "bg-yellow-500";
      case "inactive":
        return "bg-gray-500";
      case "blocked":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  // Handle block/unblock user
  const handleToggleBlock = async () => {
    try {
      setBlockLoading(true);

      // API call to toggle block status
      const response = await axios.patch(
        `${BASE_URL}/api/admin/member/${user._id}/block`
      );

      // Show success message
      setAlert({
        open: true,
        message: response.data.message,
        severity: "success",
      });

      // Refresh data to show updated status
      if (refreshData && typeof refreshData === "function") {
        refreshData();
      }
    } catch (error) {
      console.error("Error toggling block status:", error);

      setAlert({
        open: true,
        message:
          error.response?.data?.message || "Failed to update block status",
        severity: "error",
      });
    } finally {
      setBlockLoading(false);
    }
  };

  // Handle suspend dialog open
  const handleOpenSuspendDialog = () => {
    setSuspendReason("");
    setSuspendDialogOpen(true);
  };

  // Handle suspend/unsuspend user
  const handleToggleSuspend = async () => {
    // If user is already suspended, we can unsuspend without a reason
    // If not, we need to check if a reason is provided
    if (!user.isSuspended && (!suspendReason || suspendReason.trim() === "")) {
      setAlert({
        open: true,
        message: "Please provide a reason for suspension",
        severity: "error",
      });
      return;
    }

    try {
      setSuspendLoading(true);

      // API call to toggle suspend status
      const response = await axios.patch(
        `${BASE_URL}/api/admin/member/${user._id}/suspend`,
        {
          reason: suspendReason,
        }
      );

      // Close the dialog if open
      setSuspendDialogOpen(false);

      // Show success message
      setAlert({
        open: true,
        message: response.data.message,
        severity: "success",
      });

      // Refresh data to show updated status
      if (refreshData && typeof refreshData === "function") {
        refreshData();
      }
    } catch (error) {
      console.error("Error toggling suspend status:", error);

      setAlert({
        open: true,
        message:
          error.response?.data?.message || "Failed to update suspension status",
        severity: "error",
      });
    } finally {
      setSuspendLoading(false);
    }
  };

  // Handle fine dialog open
  const handleOpenFineDialog = () => {
    setFineAmount("");
    setFineReason("");
    setFineDialogOpen(true);
  };

  // Handle imposing fine
  const handleImposeFine = async () => {
    // Validate inputs
    if (!fineAmount || fineAmount <= 0) {
      setAlert({
        open: true,
        message: "Please enter a valid amount",
        severity: "error",
      });
      return;
    }

    if (!fineReason.trim()) {
      setAlert({
        open: true,
        message: "Please provide a reason for the fine",
        severity: "error",
      });
      return;
    }

    try {
      setLoading(true);

      // API call to impose fine
      const response = await axios.post(
        `${BASE_URL}/api/admin/fine/members/${user._id}/fines`,
        {
          amount: Number(fineAmount),
          reason: fineReason.trim(),
        }
      );

      // Close the dialog
      setFineDialogOpen(false);

      // Show success message
      setAlert({
        open: true,
        message: response.data.message,
        severity: "success",
      });

      // Refresh data to show updated fine status
      if (refreshData && typeof refreshData === "function") {
        refreshData();
      }
    } catch (error) {
      console.error("Error imposing fine:", error);

      setAlert({
        open: true,
        message: error.response?.data?.message || "Failed to impose fine",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* User Card */}
      <Card className="rounded-2xl shadow-lg border border-slate-200 bg-white p-4 xl:max-w-[30px] xl:min-w-[350px] max-w-80 min-w-80">
        <CardContent className="flex flex-col gap-2">
          {/* Status Tags */}
          <div className="flex justify-between items-center my-4">
            <div>
              <img
                src={tu}
                alt="The Uniques"
                className="w-5 inline h-5 object-contain object-center"
              />{" "}
              {user.batch}
            </div>
            <span
              className={`${getStatusColor(
                user.profileStatus
              )} text-white text-sm px-3 py-1 rounded-full`}
            >
              {user.profileStatus.charAt(0).toUpperCase() +
                user.profileStatus.slice(1)}
            </span>
          </div>

          {/* User Details */}
          <div className="flex items-center gap-3">
            <Avatar
              src={
                user?.profilePic?.fileId
                  ? getProxyImageUrl(user.profilePic.fileId)
                  : userIcon
              }
              alt={user.fullName}
              sx={{
                width: 60,
                height: 60,
                border: "4px solid #f5f5f5",
                boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
                cursor: "pointer",
                transition: "transform 0.2s",
                "&:hover": {
                  transform: "scale(1.05)",
                },
              }}
            />
            <div>
              <h2 className="text-lg font-semibold">{user.fullName}</h2>
              <p className="text-gray-500 text-sm">
                {user.bio ? user.bio.slice(0, 36) + "..." : "No bio available"}
              </p>
            </div>
          </div>
          <div className="mt-3 text-center">
            <Button
              variant="contained"
              startIcon={<FaEye />}
              className="text-white w-full hover:bg-black"
              onClick={() => setOpen(true)}
            >
              View Details
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Modal */}
      <Modal open={open} onClose={() => setOpen(false)}>
        <Box className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-xl border border-slate-200 p-6 w-11/12 max-w-4xl max-h-[90vh] overflow-y-auto">
          {/* Profile Header */}
          <div className="flex items-center flex-wrap gap-y-5 justify-between mb-4">
            <div className="flex items-center gap-4">
              <img
                src={
                  user?.profilePic?.fileId
                    ? getProxyImageUrl(user.profilePic.fileId)
                    : userIcon
                }
                alt={user.fullName}
                className="w-16 h-16 rounded-full object-cover"
              />
              <div>
                <h2 className="text-xl font-semibold">{user.fullName}</h2>
                <p className="text-gray-500 text-sm">{user.email}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Chip
                    label={user.batch}
                    size="small"
                    className="bg-blue-100 text-blue-800"
                  />
                  <Chip
                    label={user.course || "B.Tech CSE"}
                    size="small"
                    className="bg-purple-100 text-purple-800"
                  />
                  <Chip
                    label={user.admno}
                    size="small"
                    className="bg-gray-100 text-gray-800"
                  />
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Chip
                icon={<BadgeIcon />}
                label={user.profileStatus.toUpperCase()}
                className={`${getStatusColor(user.profileStatus)} text-white`}
              />
              {user.isSuspended && (
                <Chip
                  icon={<RemoveCircleIcon />}
                  label="SUSPENDED"
                  className="bg-red-600 text-white"
                />
              )}
              {user.isPlaced && (
                <Chip
                  icon={<WorkIcon />}
                  label="PLACED"
                  className="bg-green-600 text-white"
                />
              )}
              {parseInt(user.fineStatus) > 0 && (
                <Chip
                  icon={<AttachMoneyIcon />}
                  label={`Fine: ₹${user.fineStatus}`}
                  className="bg-red-100 text-red-800"
                />
              )}
            </div>
          </div>

          {/* Tabs */}
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            className="border-b border-gray-200 mb-4"
          >
            <Tab label="Profile" />
            <Tab label="Academic" />
            <Tab label="Professional" />
            <Tab label="Events" />
          </Tabs>

          {/* Profile Tab */}
          {tabValue === 0 && (
            <div className="space-y-3">
              <div>
                <span className="text-xs text-slate-500 px-1">
                  <InfoIcon style={{ fontSize: "14px" }} /> BIO
                </span>
                <div className="bg-slate-100 text-sm p-2 rounded-lg">
                  {user.bio || "No bio available"}
                </div>
              </div>

              <div className="grid lg:grid-cols-3 md:grid-cols-3 sm:grid-cols-3 grid-cols-2 gap-4">
                <div>
                  <span className="text-xs inline-block mt-2 text-slate-500 px-1">
                    <CallIcon style={{ fontSize: "14px" }} /> CONTACT
                  </span>
                  <div className="bg-slate-100 text-sm p-2 rounded-lg">
                    {user.contact || "Not provided"}
                  </div>
                </div>
                <div>
                  <span className="text-xs inline-block mt-2 text-slate-500 px-1">
                    <WhatsAppIcon style={{ fontSize: "14px" }} /> WHATSAPP
                  </span>
                  <div className="bg-slate-100 text-sm p-2 rounded-lg">
                    {user.whatsappContact || "Not provided"}
                  </div>
                </div>
                <div>
                  <span className="text-xs inline-block mt-2 text-slate-500 px-1">
                    <PushPinIcon style={{ fontSize: "14px" }} /> CITY
                  </span>
                  <div className="bg-slate-100 text-sm p-2 rounded-lg">
                    {user.city || "Not provided"}
                  </div>
                </div>
              </div>

              <div>
                <span className="text-xs text-slate-500 px-1">
                  <InfoIcon style={{ fontSize: "14px" }} /> ADDRESS
                </span>
                <div className="bg-slate-100 text-sm p-2 rounded-lg">
                  {user.address
                    ? `${user.address}, ${user.city || ""}, ${user.state || ""}`
                    : "Address not provided"}
                </div>
              </div>

              <div className="mt-4">
                <span className="text-xs text-slate-500 px-1">
                  SOCIAL PROFILES
                </span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {user.linkedinProfile && (
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<LinkedInIcon />}
                      href={user.linkedinProfile}
                      target="_blank"
                      className="text-[#0077b5] border-[#0077b5]"
                    >
                      LinkedIn
                    </Button>
                  )}
                  {user.githubProfile && (
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<GitHubIcon />}
                      href={user.githubProfile}
                      target="_blank"
                      className="text-gray-800 border-gray-800"
                    >
                      GitHub
                    </Button>
                  )}
                  {user.instagramProfile && (
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<InstagramIcon />}
                      href={user.instagramProfile}
                      target="_blank"
                      className="text-[#e1306c] border-[#e1306c]"
                    >
                      Instagram
                    </Button>
                  )}
                  {user.twitterProfile && (
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<TwitterIcon />}
                      href={user.twitterProfile}
                      target="_blank"
                      className="text-[#1da1f2] border-[#1da1f2]"
                    >
                      Twitter
                    </Button>
                  )}
                  {!user.linkedinProfile &&
                    !user.githubProfile &&
                    !user.instagramProfile &&
                    !user.twitterProfile && (
                      <span className="text-gray-500 text-sm">
                        No social profiles provided
                      </span>
                    )}
                </div>
              </div>
            </div>
          )}

          {/* Academic Tab */}
          {tabValue === 1 && (
            <div className="space-y-4">
              {/* CGPA */}
              <div className="bg-blue-50 p-3 rounded-lg flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <SchoolIcon className="text-blue-600" />
                  <span className="font-medium">CGPA</span>
                </div>
                <Chip
                  label={
                    user.semesterSGPA && user.semesterSGPA.length > 0
                      ? (
                          user.semesterSGPA.reduce(
                            (total, sem) => total + sem.sgpa,
                            0
                          ) / user.semesterSGPA.length
                        ).toFixed(2)
                      : "N/A"
                  }
                  className="bg-blue-600 text-white font-bold"
                />
              </div>

              {/* Semester-wise SGPA */}
              <div>
                <div className="text-sm font-medium mb-2">
                  Semester-wise SGPA
                </div>
                {user.semesterSGPA && user.semesterSGPA.length > 0 ? (
                  <div className="space-y-2">
                    {user.semesterSGPA
                      .sort((a, b) => a.semester - b.semester)
                      .map((sem) => (
                        <div
                          key={sem.semester}
                          className="bg-slate-100 p-2 rounded-lg"
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-medium">
                              Semester {sem.semester}
                            </span>
                            <Chip
                              label={sem.sgpa.toFixed(2)}
                              size="small"
                              className={`${
                                sem.sgpa >= 8.0
                                  ? "bg-green-600"
                                  : sem.sgpa >= 7.0
                                  ? "bg-teal-600"
                                  : sem.sgpa >= 6.0
                                  ? "bg-yellow-600"
                                  : "bg-red-600"
                              } text-white`}
                            />
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-gray-500 text-sm">
                    No SGPA records available
                  </div>
                )}
              </div>

              {/* Supplementary Exams */}
              <div>
                <div className="text-sm font-medium mb-2">
                  Supplementary Exams
                </div>
                {user.semesterSupplementary &&
                user.semesterSupplementary.length > 0 ? (
                  <div className="space-y-2">
                    {user.semesterSupplementary
                      .sort((a, b) => a.semester - b.semester)
                      .map((sem) => (
                        <div
                          key={sem.semester}
                          className="bg-slate-100 p-2 rounded-lg"
                        >
                          <div
                            className="flex justify-between items-center cursor-pointer"
                            onClick={() => toggleSemesterExpand(sem.semester)}
                          >
                            <div className="flex items-center gap-2">
                              <WarningIcon className="text-yellow-600" />
                              <span className="font-medium">
                                Semester {sem.semester}
                              </span>
                              <Chip
                                label={`${sem.subjects.length} subject${
                                  sem.subjects.length > 1 ? "s" : ""
                                }`}
                                size="small"
                                className="bg-yellow-100 text-yellow-800"
                              />
                            </div>
                            {expandedSemesters[sem.semester] ? (
                              <KeyboardArrowUpIcon />
                            ) : (
                              <KeyboardArrowDownIcon />
                            )}
                          </div>

                          {expandedSemesters[sem.semester] && (
                            <div className="mt-2 space-y-1">
                              {sem.subjects.map((subj, idx) => (
                                <div
                                  key={idx}
                                  className="flex justify-between items-center p-1"
                                >
                                  <span className="text-sm">
                                    {subj.subjectCode}: {subj.subjectName}
                                  </span>
                                  <Chip
                                    label={subj.status.toUpperCase()}
                                    size="small"
                                    className={`${
                                      subj.status === "passed"
                                        ? "bg-green-100 text-green-800"
                                        : subj.status === "failed"
                                        ? "bg-red-100 text-red-800"
                                        : "bg-gray-100 text-gray-800"
                                    }`}
                                  />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-gray-500 text-sm">
                    No supplementary exams
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Professional Tab */}
          {tabValue === 2 && (
            <div className="space-y-4">
              {/* Skills */}
              <div>
                <span className="text-xs text-slate-500 px-1">
                  <CodeIcon style={{ fontSize: "14px" }} /> SKILLS
                </span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {user.skills && user.skills.length > 0 ? (
                    user.skills.map((skill, index) => (
                      <Chip
                        key={index}
                        label={typeof skill === "string" ? skill : skill.name} // Access the correct property
                        size="small"
                        className="bg-blue-100 text-blue-800"
                      />
                    ))
                  ) : (
                    <span className="text-gray-500 text-sm">
                      No skills listed
                    </span>
                  )}
                </div>
              </div>

              {/* Projects */}
              <div>
                <span className="text-xs text-slate-500 px-1">
                  <CodeIcon style={{ fontSize: "14px" }} /> PROJECTS
                </span>
                {user.projects && user.projects.length > 0 ? (
                  <div className="space-y-2 mt-1">
                    {user.projects.map((project, index) => (
                      <div key={index} className="bg-slate-100 p-2 rounded-lg">
                        <div className="font-medium">
                          {project.title || project.name}
                        </div>
                        <div className="text-sm text-gray-600">
                          {project.description}
                        </div>
                        {project.link && (
                          <a
                            href={project.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 text-sm hover:underline"
                          >
                            View Project
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-500 text-sm">
                    No projects listed
                  </div>
                )}
              </div>

              {/* Internships */}
              <div>
                <span className="text-xs text-slate-500 px-1">
                  <WorkIcon style={{ fontSize: "14px" }} /> INTERNSHIPS
                </span>
                {user.internships && user.internships.length > 0 ? (
                  <div className="space-y-2 mt-1">
                    {user.internships.map((internship, index) => (
                      <div key={index} className="bg-slate-100 p-2 rounded-lg">
                        <div className="font-medium">{internship.company}</div>
                        <div className="text-sm text-gray-600">
                          {internship.role}
                        </div>
                        <div className="text-sm text-gray-600">
                          {internship.duration} | {internship.year}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-500 text-sm">
                    No internships listed
                  </div>
                )}
              </div>

              {/* Achievements */}
              <div>
                <span className="text-xs text-slate-500 px-1">
                  <EmojiEventsIcon style={{ fontSize: "14px" }} /> ACHIEVEMENTS
                </span>
                {user.achievements && user.achievements.length > 0 ? (
                  <div className="space-y-1 mt-1">
                    {user.achievements.map((achievement, index) => (
                      <div key={index} className="bg-slate-100 p-2 rounded-lg">
                        {typeof achievement === "string"
                          ? achievement
                          : achievement.title}{" "}
                        {/* Access title */}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-500 text-sm">
                    No achievements listed
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Events Tab */}
          {tabValue === 3 && (
            <div className="space-y-4">
              <div>
                <span className="text-xs text-slate-500 px-1">
                  EVENT PARTICIPATION
                </span>
                {user.event_participation &&
                user.event_participation.length > 0 ? (
                  <div className="text-gray-500 text-sm">
                    {user.event_participation.length} events participated
                  </div>
                ) : (
                  <div className="text-gray-500 text-sm">
                    No event participation records
                  </div>
                )}
              </div>

              <div>
                <span className="text-xs text-slate-500 px-1">
                  CONTRIBUTION TYPES
                </span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {user.eventContributionType &&
                  user.eventContributionType.length > 0 ? (
                    user.eventContributionType.map((type, index) => (
                      <Chip
                        key={index}
                        label={type}
                        size="small"
                        className="bg-purple-100 text-purple-800"
                      />
                    ))
                  ) : (
                    <span className="text-gray-500 text-sm">
                      No contribution types recorded
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <Divider className="my-6 !pt-5" />
          <div className="flex justify-between items-center !pt-5">
            <div className="flex flex-wrap gap-2">
              {/* Block/Unblock Button */}
              <Button
                variant="contained"
                color={user.profileStatus === "blocked" ? "success" : "error"}
                startIcon={
                  !blockLoading &&
                  (user.profileStatus === "blocked" ? (
                    <DoneIcon />
                  ) : (
                    <BlockIcon />
                  ))
                }
                className={
                  user.profileStatus === "blocked"
                    ? "bg-green-600"
                    : "bg-red-600"
                }
                onClick={handleToggleBlock}
                disabled={blockLoading || suspendLoading || loading}
              >
                {blockLoading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : user.profileStatus === "blocked" ? (
                  "Unblock User"
                ) : (
                  "Block User"
                )}
              </Button>

              {/* Suspend/Unsuspend Button */}
              <Button
                variant="contained"
                color={user.isSuspended ? "success" : "warning"}
                startIcon={
                  !suspendLoading &&
                  (user.isSuspended ? <DoneIcon /> : <RemoveCircleIcon />)
                }
                className={user.isSuspended ? "bg-green-600" : "bg-amber-600"}
                onClick={
                  user.isSuspended
                    ? handleToggleSuspend
                    : handleOpenSuspendDialog
                }
                disabled={blockLoading || suspendLoading || loading}
              >
                {suspendLoading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : user.isSuspended ? (
                  "Unsuspend User"
                ) : (
                  "Suspend User"
                )}
              </Button>

              {/* Impose Fine Button */}
              <Button
                variant="contained"
                color="warning"
                startIcon={<CurrencyRupeeIcon />}
                onClick={handleOpenFineDialog}
                disabled={
                  blockLoading || suspendLoading || loading || user.isSuspended
                }
                className="bg-amber-600"
              >
                Impose Fine
              </Button>
            </div>

            <Button
              variant="outlined"
              className="border-gray-500"
              onClick={() => setOpen(false)}
            >
              Close
            </Button>
          </div>
        </Box>
      </Modal>

      {/* Suspend Reason Dialog */}
      <Dialog
        open={suspendDialogOpen}
        onClose={() => setSuspendDialogOpen(false)}
      >
        <DialogTitle>Suspend User</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Please provide a reason for suspending {user.fullName}. This
            information will be used for administrative purposes.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Reason for Suspension"
            type="text"
            fullWidth
            multiline
            rows={3}
            value={suspendReason}
            onChange={(e) => setSuspendReason(e.target.value)}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setSuspendDialogOpen(false)}
            disabled={suspendLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleToggleSuspend}
            color="warning"
            disabled={suspendLoading || !suspendReason.trim()}
            startIcon={suspendLoading ? <CircularProgress size={20} /> : null}
          >
            {suspendLoading ? "Processing..." : "Suspend"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Fine Dialog */}
      <Dialog open={fineDialogOpen} onClose={() => setFineDialogOpen(false)}>
        <DialogTitle>Impose Fine on {user.fullName}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Enter the fine amount and reason. This fine will be added to the
            student's record.
            {parseInt(user.fineStatus) > 0 && (
              <span className="block mt-2 text-red-500">
                Note: This member already has an outstanding fine of ₹
                {user.fineStatus}.
              </span>
            )}
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Fine Amount (₹)"
            type="number"
            fullWidth
            value={fineAmount}
            onChange={(e) => setFineAmount(e.target.value)}
            inputProps={{ min: 1 }}
            required
          />
          <TextField
            margin="dense"
            label="Reason for Fine"
            type="text"
            fullWidth
            multiline
            rows={3}
            value={fineReason}
            onChange={(e) => setFineReason(e.target.value)}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFineDialogOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleImposeFine}
            color="error"
            disabled={loading || !fineAmount || !fineReason.trim()}
            startIcon={
              loading ? <CircularProgress size={20} /> : <CurrencyRupeeIcon />
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
          sx={{ width: "100%" }}
        >
          {alert.message}
        </Alert>
      </Snackbar>
    </>
  );
};
