import React, { useState } from "react";
import {
  ArrowUpRight,
  Award,
  Briefcase,
  Globe,
} from "lucide-react";
import { FaLinkedinIn, FaInstagram } from "react-icons/fa";
import { FaXTwitter, FaGithub } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "@/config";

const MemberCard = ({ member }) => {
  const navigate = useNavigate();

  // Extract member properties
  const {
    _id,
    fullName,
    batch,
    course = "Member",
    skills = [],
    achievements = [],
    projects = [],
    profilePic
  } = member;

  // Format position (displayed role/status)
  const position = member.isPlaced
    ? `Placed - ${course || ""}`
    : course || "Member";

  // Format profile image - handle both object reference and direct URL
  const profileImg =
    member.profilePic?.url ||
    (typeof member.profilePic === "string"
      ? member.profilePic
      : `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}`);

  // Format social links
  const socialLinks = {
    github: member.githubProfile || null,
    linkedin: member.linkedinProfile || null,
    twitter: member.twitterProfile || null,
    instagram: member.instagramProfile || null,
    website: member.personalWebsite || null,
  };

  // Format achievements for display
  const formattedAchievements = Array.isArray(achievements)
    ? achievements.map((achievement, index) => ({
        id: achievement.id || index,
        title: achievement.title || achievement.name || achievement,
        description: achievement.description || "",
        date: achievement.date || "",
        color: achievement.color || "bg-gray-700",
        icon: achievement.icon || null,
      }))
    : [];

  // Format projects for display
  const formattedProjects = Array.isArray(projects)
    ? projects.map((project, index) => ({
        id: project.id || index,
        title: project.title || project.name || "Project",
        description: project.description || "",
        link: project.link || project.url || null,
        imageUrl: project.imageUrl || project.image || null,
        technologies: Array.isArray(project.technologies)
          ? project.technologies
          : project.tech
            ? [project.tech]
            : [],
      }))
    : [];

  // Format skills as objects if they're strings
  const formattedSkills = Array.isArray(skills)
    ? skills.map((skill, index) => {
        if (typeof skill === "object") return skill;
        return { name: skill, id: index };
      })
    : [];

  const getProxyImageUrl = (fileId) => {
    if (!fileId) return '/placeholder.svg'; // Fallback image
    return `${BASE_URL}/api/image-proxy/${fileId}`;
  };

  // Handle navigation to profile page
  const handleViewProfile = () => {
    navigate(`/profile/${_id}`);
  };

  return (
    <div className="bg-white group hover:cursor-pointer hover:shadow-lg transition-shadow duration-200 px-2 py-2 border border-gray-200 shadow-md rounded-lg relative max-w-72">
      {/* Main Card Content */}
      <div className="flex flex-col h-full">
        {/* Profile Image */}
        <div className="relative">
          <div onClick={handleViewProfile} className="overflow-hidden rounded-lg">
            <img
              src={profilePic ? getProxyImageUrl(profilePic?.fileId) : profileImg}
              className="hover:scale-105 duration-300 custom-clip rounded-t-lg rounded-l-lg lg:w-[42vh] w-[70vh] h-56 object-cover"
              alt={`${fullName}'s Profile`}
            />
          </div>

          {/* Batch Badge */}
          <div className="absolute bottom-0 left-0 bg-[#ca0019] px-2 py-1">
            <p className="text-white text-sm font-medium">{batch}</p>
          </div>
        </div>

        {/* Card Content */}
        <div className="py-4 flex flex-col flex-grow">
          <h3 className="text-xl font-bold border-b border-gray-300 pb-1">
            {fullName}
          </h3>
          <p className="text-gray-600 text-sm mt-1">{position}</p>

          {/* Skills Count */}
          <div className="">
            <div className="mt-3 w-3/4 flex flex-wrap items-center gap-2">
              <span className="text-xs bg-gray-100 px-3 py-1 rounded-full flex items-center">
                <span className="font-medium mr-1">
                  {formattedSkills.length}
                </span>{" "}
                Skills
              </span>

              {/* Achievements Count */}
              {formattedAchievements.length > 0 && (
                <span className="text-xs bg-gray-100 px-3 py-1 rounded-full flex items-center">
                  <Award className="w-3 h-3 mr-1 text-[#ca0019]" />
                  <span className="font-medium mr-1">
                    {formattedAchievements.length}
                  </span>{" "}
                  Achievements
                </span>
              )}

              {/* Projects Count - Optional */}
              {formattedProjects.length > 0 && (
                <span className="text-xs bg-gray-100 px-3 py-1 rounded-full flex items-center">
                  <Briefcase className="w-3 h-3 mr-1 text-[#ca0019]" />
                  <span className="font-medium mr-1">
                    {formattedProjects.length}
                  </span>{" "}
                  Projects
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Social Media Links */}
        <div className="absolute right-0 top-0 bottom-0 flex flex-col pt-4 gap-2 bg-black bg-opacity-80 lg:p-[8px] p-[7px]">
          {socialLinks.github && (
            <a
              href={socialLinks.github}
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 bg-white rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <FaGithub size={16} />
            </a>
          )}
          {socialLinks.linkedin && (
            <a
              href={socialLinks.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 bg-white rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <FaLinkedinIn size={16} />
            </a>
          )}
          {socialLinks.twitter && (
            <a
              href={socialLinks.twitter}
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 bg-white rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <FaXTwitter size={16} />
            </a>
          )}
          {socialLinks.instagram && (
            <a
              href={socialLinks.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 bg-white rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <FaInstagram size={16} />
            </a>
          )}
          {socialLinks.website && (
            <a
              href={socialLinks.website}
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 bg-white rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <Globe size={16} />
            </a>
          )}
        </div>

        {/* View Details Button */}
        <button
          onClick={handleViewProfile}
          className="absolute bottom-4 right-4 w-10 h-10 bg-black rounded-full flex items-center justify-center text-white group-hover:bg-[#ca0019] transition-colors"
        >
          <ArrowUpRight
            size={18}
            className="group-hover:rotate-45 transition-transform duration-300"
          />
        </button>
      </div>
    </div>
  );
};

export default MemberCard;
