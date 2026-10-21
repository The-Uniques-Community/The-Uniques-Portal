import React, { useState, lazy, Suspense } from "react";
import { BASE_URL } from "@/config";
import { Button, Card, CardContent, Avatar, IconButton, useTheme } from "@mui/material";
import { FaEye } from "react-icons/fa";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import GitHubIcon from "@mui/icons-material/GitHub";
import XIcon from "@mui/icons-material/X";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import tu from "@/assets/logos/tu.png";
import { Link } from "react-router-dom";

import { Box, Typography } from "@mui/material";
import LinkedIn from '@mui/icons-material/LinkedIn';
import Instagram from '@mui/icons-material/Instagram';
import Twitter from '@mui/icons-material/Twitter';
import GitHub from '@mui/icons-material/GitHub';
import Email from '@mui/icons-material/Email';
import Edit from '@mui/icons-material/Edit';
import Delete from '@mui/icons-material/Delete';
import "tailwindcss/tailwind.css";
import userIcon from "@/assets/img/user-icon.png";
import { getMemberStatus, getMemberStatusBadgeProps } from "@/utils/memberStatus";
import { preloadComponent } from "@/utils/preload";

const ProfileModal = lazy(() => import("@/components/modals/ProfileModal"));

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

export const MemberCardDashboard = ({
  user,
  member,
  onEdit,
  onDelete,
  refreshData,
  onMemberUpdate,
}) => {
  const currentUser = user || member;
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const [open, setOpen] = useState(false);

  const handleClose = () => setOpen(false);
  const getProxyImageUrl = (fileId) => {
    if (!fileId) return "/placeholder.svg"; // Fallback image
    return `${BASE_URL}/api/image-proxy/${fileId}`;
  };

  if (!currentUser) return null;

  return (
    <>
      {/* User Card */}
      <Card 
        style={{
          backgroundColor: theme.palette.background.paper,
          borderColor: theme.palette.divider,
        }}
        className="rounded-2xl shadow-lg border p-4 w-full max-w-full sm:max-w-96 h-full flex flex-col"
      >
        <CardContent className="flex flex-col gap-2 h-full">
          {/* Status Tags */}
          <div style={{ color: theme.palette.text.secondary }} className="flex justify-between items-center my-4">
            <div className="font-medium">
              <img
                src={tu}
                alt="The Uniques"
                className="w-5 inline h-5 object-contain object-center"
              />{" "}
              {currentUser.batch || "The Uniques"}
            </div>
            <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${getMemberStatusBadgeProps(getMemberStatus(currentUser)).className}`}>
              {getMemberStatusBadgeProps(getMemberStatus(currentUser)).label}
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
                    onEdit(currentUser);
                  }}
                  className="text-blue-600 hover:bg-blue-50"
                  style={{ color: isDark ? "#90caf9" : "#1976d2" }}
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
                    onDelete(currentUser._id);
                  }}
                  className="text-red-600 hover:bg-red-50"
                  style={{ color: isDark ? "#f48fb1" : "#d32f2f" }}
                  title="Delete Member"
                >
                  <Delete fontSize="small" />
                </IconButton>
              )}
            </div>
          )}

          {/* Content Wrapper - grows to fill available space */}
          <div className="flex-1">
            {/* User Details */}
            <div className="flex items-center gap-3">
              <Avatar
                src={
                  currentUser?.profilePic?.fileId
                    ? getProxyImageUrl(currentUser.profilePic.fileId)
                    : userIcon
                }
                alt={currentUser.fullName || "Member"}
                sx={{ 
                  width: 64, 
                  height: 64, 
                  border: `4px solid ${isDark ? 'rgba(255,255,255,0.05)' : '#f5f5f5'}`,
                  boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'scale(1.05)'
                  }
                }}
              />
              <div>
                <h2 style={{ color: theme.palette.text.primary }} className="text-lg font-semibold">{currentUser.fullName || "Unnamed Member"}</h2>
                <p style={{ color: theme.palette.text.secondary }} className="text-sm">
                  {currentUser.bio ? currentUser.bio.slice(0, 36) + "..." : "No bio available"}
                </p>
              </div>
            </div>

            {/* Social Media Links */}
            <div className="flex justify-start gap-x-4 mt-3">
              {currentUser.githubProfile && (
                <Link to={currentUser.githubProfile}>
                  <div 
                    style={{ backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "#000000" }} 
                    className="w-10 h-10 p-1 rounded-full"
                  >
                    <div className="w-full h-full flex items-center justify-center">
                      <GitHubIcon fontSize="medium" style={{ color: isDark ? theme.palette.text.primary : "#ffffff" }} />
                    </div>
                  </div>
                </Link>
              )}
              {currentUser.linkedinProfile && (
                <Link to={currentUser.linkedinProfile}>
                  <div 
                    style={{ backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "#000000" }} 
                    className="w-10 h-10 p-1 rounded-full"
                  >
                    <div className="w-full h-full flex items-center justify-center">
                      <LinkedInIcon fontSize="medium" style={{ color: isDark ? theme.palette.text.primary : "#ffffff" }} />
                    </div>
                  </div>
                </Link>
              )}
              {currentUser.twitterProfile && (
                <Link to={currentUser.twitterProfile}>
                  <div 
                    style={{ backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "#000000" }} 
                    className="w-10 h-10 p-1 rounded-full"
                  >
                    <div className="w-full h-full flex items-center justify-center">
                      <XIcon fontSize="medium" style={{ color: isDark ? theme.palette.text.primary : "#ffffff" }} />
                    </div>
                  </div>
                </Link>
              )}
              {currentUser.whatsappContact && (
                <Link to={`https://wa.me/${currentUser.whatsappContact}`}>
                  <div 
                    style={{ backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "#000000" }} 
                    className="w-10 h-10 p-1 rounded-full"
                  >
                    <div className="w-full h-full flex items-center justify-center">
                      <WhatsAppIcon fontSize="medium" style={{ color: isDark ? theme.palette.text.primary : "#ffffff" }} />
                    </div>
                  </div>
                </Link>
              )}
            </div>
          </div>

          {/* View Details Button */}
          <div className="mt-3 text-center">
            <Button
              variant="contained"
              startIcon={<FaEye />}
              onClick={() => setOpen(true)}
              onMouseEnter={() => preloadComponent(() => import("@/components/modals/ProfileModal"))}
              onFocus={() => preloadComponent(() => import("@/components/modals/ProfileModal"))}
              sx={{
                width: "100%",
                bgcolor: "#ca0019",
                color: "#fff",
                fontWeight: 800,
                textTransform: "none",
                borderRadius: "8px",
                boxShadow: "0 10px 24px rgba(202, 0, 25, 0.22)",
                "&:hover": {
                  bgcolor: "#a30014",
                  color: "#fff",
                },
                "& .MuiButton-startIcon": {
                  color: "inherit",
                },
              }}
            >
              View Details
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Fullscreen Modal */}
      {currentUser && open && (
        <Suspense fallback={null}>
          <ProfileModal
            handleClose={() => setOpen(false)}
            open={open}
            user={currentUser}
            refreshData={refreshData || onMemberUpdate}
          />
        </Suspense>
      )}
    </>
  );
};
