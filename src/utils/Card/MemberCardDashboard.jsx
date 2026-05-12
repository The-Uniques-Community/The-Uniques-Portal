import React, { useState } from "react";
import { BASE_URL } from "@/config";
import { Button, Card, CardContent, Avatar, IconButton } from "@mui/material";
import { FaEye } from "react-icons/fa";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import GitHubIcon from "@mui/icons-material/GitHub";
import XIcon from "@mui/icons-material/X";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import tu from "@/assets/logos/tu.png";
import { Link } from "react-router";

import { Modal, Box, Tabs, Tab, Typography } from "@mui/material";
import {
  LinkedIn,
  Instagram,
  Twitter,
  GitHub,
  Email,
  Edit,
  Delete,
} from "@mui/icons-material";
import "tailwindcss/tailwind.css";
import ProfileModal from "../Modal/ProfileModal";
import userIcon from "@/assets/img/user-icon.png";
const UserProfileModal = ({ open, handleClose, userData }) => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const modalStyle = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "80%",
    maxWidth: "800px",
    bgcolor: "background.paper",
    boxShadow: 24,
    p: 4,
    borderRadius: "8px",
    maxHeight: "90vh",
    overflowY: "auto",
  };
  const getProxyImageUrl = (fileId) => {
    if (!fileId) return "/placeholder.svg"; // Fallback image
    return `${BASE_URL}/api/image-proxy/${fileId}`;
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={modalStyle}>
        {/* Fixed Profile Section */}
        <div className="flex flex-col md:flex-row gap-6 mb-6">
          <div className="flex-shrink-0">
            <img
              src={
                user?.profilePic?.fileId
                  ? getProxyImageUrl(user.profilePic.fileId)
                  : userIcon
              }
              sx={{ width: 120, height: 120 }}
              className="border-2 border-gray-200"
            />
          </div>
          <div className="flex-1">
            <Typography variant="h5" className="font-bold">
              {userData?.fullName}
            </Typography>
            <Typography variant="subtitle1" className="text-gray-600">
              {userData?.email}
            </Typography>
            <Typography variant="body2" className="text-gray-500">
              {userData?.course} - {userData?.batch}
            </Typography>
            <Typography variant="body2" className="text-gray-500">
              Status:{" "}
              <span
                className={`capitalize ${userData?.profileStatus === "active"
                  ? "text-green-600"
                  : "text-red-600"
                  }`}
              >
                {userData?.profileStatus}
              </span>
            </Typography>

            {/* Social Media Links */}
            <div className="flex gap-2 mt-2">
              {userData?.linkedinProfile && (
                <IconButton href={userData.linkedinProfile} target="_blank">
                  <LinkedIn color="primary" />
                </IconButton>
              )}
              {userData?.instagramProfile && (
                <IconButton href={userData.instagramProfile} target="_blank">
                  <Instagram color="secondary" />
                </IconButton>
              )}
              {userData?.twitterProfile && (
                <IconButton href={userData.twitterProfile} target="_blank">
                  <Twitter color="info" />
                </IconButton>
              )}
              {userData?.githubProfile && (
                <IconButton href={userData.githubProfile} target="_blank">
                  <GitHub />
                </IconButton>
              )}
              <IconButton href={`mailto:${userData?.email}`}>
                <Email color="action" />
              </IconButton>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          className="mb-4"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Overview" />
          <Tab label="Projects" />
          <Tab label="Certifications" />
          <Tab label="Events" />
          <Tab label="Achievements" />
        </Tabs>

        {/* Tab Content */}
        {activeTab === 0 && (
          <div className="space-y-4">
            <Typography variant="h6">Overview</Typography>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Typography>
                  <strong>Bio:</strong> {userData?.bio || "Not provided"}
                </Typography>
                <Typography>
                  <strong>Total Fine:</strong> {userData?.fineStatus}
                </Typography>
                <Typography>
                  <strong>Total Certificates:</strong>{" "}
                  {userData?.certifications?.length || 0}
                </Typography>
              </div>
              <div>
                <Typography>
                  <strong>Course:</strong> {userData?.course}
                </Typography>
                <Typography>
                  <strong>Skills:</strong>{" "}
                  {userData?.skills?.join(", ") || "None"}
                </Typography>
              </div>
            </div>
          </div>
        )}

        {activeTab === 1 && (
          <div className="space-y-4">
            <Typography variant="h6">Projects</Typography>
            {userData?.projects?.map((project, index) => (
              <div key={index} className="border p-4 rounded-md">
                <Typography>
                  <strong>Name:</strong> {project.name}
                </Typography>
                <Typography>
                  <strong>Tech Stack:</strong> {project.techStack}
                </Typography>
                <Typography>
                  <strong>Description:</strong> {project.description}
                </Typography>
                {project.link && (
                  <Typography>
                    <strong>Link:</strong>{" "}
                    <a
                      href={project.link}
                      target="_blank"
                      className="text-blue-600"
                    >
                      {project.link}
                    </a>
                  </Typography>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === 2 && (
          <div className="space-y-4">
            <Typography variant="h6">Certifications</Typography>
            {userData?.certifications?.map((cert, index) => (
              <div key={index} className="border p-4 rounded-md">
                <Typography>
                  <strong>Name:</strong> {cert.name}
                </Typography>
                <Typography>
                  <strong>Topic:</strong> {cert.topic}
                </Typography>
                {cert.link && (
                  <Typography>
                    <strong>Link:</strong>{" "}
                    <a
                      href={cert.link}
                      target="_blank"
                      className="text-blue-600"
                    >
                      {cert.link}
                    </a>
                  </Typography>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === 3 && (
          <div className="space-y-4">
            <Typography variant="h6">Events</Typography>
            {userData?.event_participation?.map((event, index) => (
              <div key={index} className="border p-4 rounded-md">
                <Typography>
                  <strong>Event:</strong> {event.name}
                </Typography>
                <Typography>
                  <strong>Contribution:</strong>{" "}
                  {userData.eventContributionType[index]}
                </Typography>
              </div>
            ))}
          </div>
        )}

        {activeTab === 4 && (
          <div className="space-y-4">
            <Typography variant="h6">Achievements</Typography>
            {userData?.achievements?.map((achievement, index) => (
              <div key={index} className="border p-4 rounded-md">
                <Typography>
                  <strong>Title:</strong> {achievement.title}
                </Typography>
                <Typography>
                  <strong>Description:</strong> {achievement.description}
                </Typography>
                <Typography>
                  <strong>Venue:</strong> {achievement.venue}
                </Typography>
                <Typography>
                  <strong>Date:</strong> {achievement.date}
                </Typography>
              </div>
            ))}
          </div>
        )}
      </Box>
    </Modal>
  );
};

const sampleUserData = {
  fullName: "John Doe",
  email: "john.doe@example.com",
  course: "B.Tech CSE",
  batch: "The Uniques 2.0",
  profileStatus: "active",
  profilePic: "https://example.com/profile.jpg",
  linkedinProfile: "https://linkedin.com/in/johndoe",
  githubProfile: "https://github.com/johndoe",
  bio: "Software developer with passion for AI",
  fineStatus: "0",
  certifications: [
    { name: "React Basics", topic: "React", link: "https://example.com" },
  ],
  skills: ["JavaScript", "React", "Node.js"],
  projects: [
    {
      name: "Project 1",
      techStack: "React, Node",
      description: "Sample project",
      link: "https://example.com",
    },
  ],
  event_participation: [{ name: "Hackathon 2023" }],
  eventContributionType: ["Organizer"],
  achievements: [
    {
      title: "Best Coder",
      description: "Coding competition",
      venue: "University",
      date: "2023-05-15",
    },
  ],
};

export const MemberCardDashboard = ({ user, onEdit, onDelete, refreshData }) => {
  const [open, setOpen] = useState(false);

  const handleClose = () => setOpen(false);
  const getProxyImageUrl = (fileId) => {
    if (!fileId) return "/placeholder.svg"; // Fallback image
    return `${BASE_URL}/api/image-proxy/${fileId}`;
  };
  return (
    <>
      {/* User Card */}
      <Card className="rounded-md shadow-sm border border-slate-200 bg-white p-4 max-w-96">
        <CardContent className="flex flex-col gap-2">
          {/* Status Tags */}
          <div className="flex justify-between items-center my-4">
            <div className="font-medium">
              <img
                src={tu}
                alt="The Uniques"
                className="w-5 inline h-5 object-contain object-center"
              />{" "}
              {user.batch}
            </div>
            <span className="bg-yellow-400 text-yellow-800 text-sm px-3 py-1 rounded-full">
              {user.profileStatus}
            </span>
          </div>

          {/* Action Buttons (Edit/Delete) - Only show if handlers are provided */}
          {(onEdit || onDelete) && (
            <div className="flex justify-end gap-1 mb-2">
              {onEdit && (
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(user);
                  }}
                  className="text-blue-600 hover:bg-blue-50"
                  title="Edit Member"
                >
                  <Edit fontSize="small" />
                </IconButton>
              )}
              {onDelete && (
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(user._id);
                  }}
                  className="text-red-600 hover:bg-red-50"
                  title="Delete Member"
                >
                  <Delete fontSize="small" />
                </IconButton>
              )}
            </div>
          )}

          {/* User Details */}
          <div className="flex items-center gap-3">
            <img
              src={
                user?.profilePic?.fileId
                  ? getProxyImageUrl(user.profilePic.fileId)
                  : userIcon
              }
              alt={user.fullName}
              className="w-16 h-16 rounded-full object-cover object-center"
            />
            <div>
              <h2 className="text-lg font-semibold">{user.fullName}</h2>
              <p className="text-gray-500 text-sm">
                {user.bio ? user.bio.slice(0, 36) + "..." : "No bio available"}
              </p>
            </div>
          </div>

          {/* Social Media Links */}
          <div className="flex justify-start gap-x-4 mt-3">
            {user.githubProfile && (
              <Link to={user.githubProfile}>
                <div className="w-10 h-10 p-1 bg-black rounded-full">
                  <div className="w-full h-full flex items-center justify-center">
                    <GitHubIcon fontSize="medium" className="text-white" />
                  </div>
                </div>
              </Link>
            )}
            {user.linkedinProfile && (
              <Link to={user.linkedinProfile}>
                <div className="w-10 h-10 p-1 bg-black rounded-full">
                  <div className="w-full h-full flex items-center justify-center">
                    <LinkedInIcon fontSize="medium" className="text-white" />
                  </div>
                </div>
              </Link>
            )}
            {user.twitterProfile && (
              <Link to={user.twitterProfile}>
                <div className="w-10 h-10 p-1 bg-black rounded-full">
                  <div className="w-full h-full flex items-center justify-center">
                    <XIcon fontSize="medium" className="text-white" />
                  </div>
                </div>
              </Link>
            )}
            {user.whatsappContact && (
              <Link to={`https://wa.me/${user.whatsappContact}`}>
                <div className="w-10 h-10 p-1 bg-black rounded-full">
                  <div className="w-full h-full flex items-center justify-center">
                    <WhatsAppIcon fontSize="medium" className="text-white" />
                  </div>
                </div>
              </Link>
            )}
          </div>

          {/* View Details Button */}
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

      {/* Fullscreen Modal */}
      <ProfileModal
        handleClose={() => setOpen(false)}
        open={open}
        user={user}
      />
    </>
  );
};
