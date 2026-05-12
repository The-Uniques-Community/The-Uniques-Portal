import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Share2, 
  Award, 
  FileText, 
  Briefcase, 
  Globe,
  Copy,
  Check,
  ArrowUpRight
} from "lucide-react";
import { FaLinkedinIn, FaInstagram, FaWhatsapp } from "react-icons/fa";
import { FaXTwitter, FaGithub } from "react-icons/fa6";
import AssignmentIcon from "@mui/icons-material/Assignment";
import axios from "axios";
import { BASE_URL } from "@/config";
import { toast } from "react-toastify";

// Helper function for formatting dates
const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const MemberProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("about");
  const [shareMenuOpen, setShareMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Fetch member data using public API with ID filtering
  useEffect(() => {
    const fetchMember = async () => {
      try {
        setLoading(true);
        console.log(`Fetching member with ID: ${id}`);
        
        // First try to get all members and filter by ID (since we don't have a direct endpoint)
        const response = await axios.get(`${BASE_URL}/api/public/members`);
        
        if (response.data.success && response.data.data) {
          // Find the member with the matching ID
          const foundMember = response.data.data.find(member => member._id === id);
          
          if (foundMember) {
            console.log("Found member:", foundMember);
            setMember(foundMember);
          } else {
            console.error("Member not found with ID:", id);
            toast.error("Member not found");
            navigate("/batches");
          }
        } else {
          throw new Error("Failed to fetch members data");
        }
      } catch (error) {
        console.error("Error fetching member:", error);
        toast.error("Failed to load member profile");
        navigate("/batches");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchMember();
    }
  }, [id, navigate]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ca0019]"></div>
          <p className="mt-4 text-gray-600">Loading member profile...</p>
        </div>
      </div>
    );
  }

  // Member not found
  if (!member) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Member Not Found</h2>
          <p className="text-gray-600 mb-6">The member profile you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate("/batches")}
            className="bg-[#ca0019] text-white px-6 py-2 rounded-lg hover:bg-[#a00015] transition-colors"
          >
            Back to Batches
          </button>
        </div>
      </div>
    );
  }

  // Extract member properties with fallbacks
  const {
    fullName = "Member",
    email = "",
    batch = "Unspecified Batch",
    bio = "No bio available",
    course = "Member",
    skills = [],
    achievements = [],
    certifications = [],
    projects = [],
    eventContributionType = [],
    profilePic = null
  } = member;

  // Format position
  const position = member.isPlaced
    ? `Placed - ${course || ""}`
    : course || "Member";

  // Format profile image
  const getProxyImageUrl = (fileId) => {
    if (!fileId) return '/placeholder.svg';
    return `${BASE_URL}/api/image-proxy/${fileId}`;
  };

  const profileImg =
    member.profilePic?.url ||
    (typeof member.profilePic === "string"
      ? member.profilePic
      : `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=ca0019&color=ffffff&size=300`);

  // Format social links
  const socialLinks = {
    github: member.githubProfile || null,
    linkedin: member.linkedinProfile || null,
    twitter: member.twitterProfile || null,
    instagram: member.instagramProfile || null,
    website: member.personalWebsite || null,
  };

  // Format data for display
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

  const formattedCertificates = Array.isArray(certifications)
    ? certifications.map((cert, index) => ({
        id: cert._id || index,
        title: cert.fileName || cert.title || cert.name || "Certification",
        issuer: cert.issuer || cert.organization || "",
        date: cert.createdAt || cert.date || cert.issuedDate || "",
        fileId: cert.fileId || null,
      }))
    : [];

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

  const contributions = Array.isArray(eventContributionType)
    ? eventContributionType
    : [];

  const formattedSkills = Array.isArray(skills)
    ? skills.map((skill, index) => {
        if (typeof skill === "object") return skill;
        return { name: skill, id: index };
      })
    : [];

  // Share functionality
  const currentUrl = window.location.href;
  const shareText = `Check out ${fullName}'s profile from The Uniques Community!`;

  const handleShare = (platform) => {
    switch (platform) {
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`, '_blank');
        break;
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(`${shareText} ${currentUrl}`)}`, '_blank');
        break;
      case 'copy':
        navigator.clipboard.writeText(currentUrl);
        setCopied(true);
        toast.success("Profile link copied to clipboard!");
        setTimeout(() => setCopied(false), 2000);
        break;
      default:
        break;
    }
    setShareMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with Back Button and Share */}
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={() => {
              // Check if there's a previous page in history
              if (window.history.length > 1) {
                navigate(-1);
              } else {
                // If navigation stack is empty, redirect to home/batches page
                navigate("/");
              }
            }}
            className="flex items-center gap-2 text-gray-600 hover:text-[#ca0019] transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back</span>
          </button>

          {/* Share Button */}
          <div className="relative">
            <button
              onClick={() => setShareMenuOpen(!shareMenuOpen)}
              className="flex items-center gap-2 bg-[#ca0019] text-white px-4 py-2 rounded-lg hover:bg-[#a00015] transition-colors"
            >
              <Share2 size={18} />
              <span>Share Profile</span>
            </button>

            {/* Share Menu */}
            {shareMenuOpen && (
              <div className="absolute right-0 top-12 bg-white border border-gray-200 rounded-lg shadow-lg p-2 w-48 z-10">
                <button
                  onClick={() => handleShare('linkedin')}
                  className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded text-left transition-colors"
                >
                  <FaLinkedinIn size={16} className="text-blue-600" />
                  <span>Share on LinkedIn</span>
                </button>
                <button
                  onClick={() => handleShare('whatsapp')}
                  className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded text-left transition-colors"
                >
                  <FaWhatsapp size={16} className="text-green-500" />
                  <span>Share on WhatsApp</span>
                </button>
                <button
                  onClick={() => handleShare('copy')}
                  className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded text-left transition-colors"
                >
                  {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                  <span>{copied ? 'Copied!' : 'Copy Link'}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Profile Content */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-8">
            {/* Left Column - Profile Image and Basic Info */}
            <div className="md:col-span-1">
              <div className="relative mb-5">
                <img
                  src={profilePic ? getProxyImageUrl(profilePic?.fileId) : profileImg}
                  alt={`${fullName}'s profile`}
                  className="w-full h-64 rounded-lg object-cover shadow-md"
                />
                <div className="absolute bottom-0 left-0 bg-[#ca0019] px-2 py-1">
                  <p className="text-white text-sm font-medium">{batch}</p>
                </div>
              </div>

              <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 border-b border-gray-200 pb-1">
                  {fullName}
                </h1>
                <p className="text-gray-600 mt-1 italic">{position}</p>
                {email && (
                  <p className="text-gray-500 text-sm mt-1">{email}</p>
                )}
              </div>

              {/* Social Links */}
              <div className="mb-6 mt-6">
                <h4 className="font-semibold mb-3 text-gray-800">Connect</h4>
                <div className="flex flex-wrap gap-2">
                  {socialLinks.github && (
                    <a
                      href={socialLinks.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-full text-sm group hover:bg-gray-200 transition-colors"
                    >
                      <FaGithub className="group-hover:text-[#ca0019]" size={14} />
                      <span className="group-hover:text-[#ca0019]">GitHub</span>
                    </a>
                  )}
                  {socialLinks.linkedin && (
                    <a
                      href={socialLinks.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-full group text-sm hover:bg-gray-200 transition-colors"
                    >
                      <FaLinkedinIn className="group-hover:text-[#ca0019]" size={14} />
                      <span className="group-hover:text-[#ca0019]">LinkedIn</span>
                    </a>
                  )}
                  {socialLinks.twitter && (
                    <a
                      href={socialLinks.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-full text-sm group hover:bg-gray-200 transition-colors"
                    >
                      <FaXTwitter className="group-hover:text-[#ca0019]" size={14} />
                      <span className="group-hover:text-[#ca0019]">Twitter</span>
                    </a>
                  )}
                  {socialLinks.instagram && (
                    <a
                      href={socialLinks.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-full text-sm group hover:bg-gray-200 transition-colors"
                    >
                      <FaInstagram className="group-hover:text-[#ca0019]" size={14} />
                      <span className="group-hover:text-[#ca0019]">Instagram</span>
                    </a>
                  )}
                  {socialLinks.website && (
                    <a
                      href={socialLinks.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-full text-sm hover:bg-gray-200 transition-colors"
                    >
                      <Globe size={14} />
                      <span>Website</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Skills */}
              <div>
                <h4 className="font-semibold mb-3 text-gray-800">Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {formattedSkills.length > 0 ? (
                    formattedSkills.map((skill, index) => (
                      <span
                        key={index}
                        className="text-sm bg-gray-200 px-3 py-1.5 rounded-full"
                      >
                        {skill.name}
                        {skill.level && (
                          <span className="ml-1 text-xs text-gray-500">
                            • {skill.level}
                          </span>
                        )}
                      </span>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm">No skills listed</p>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Tabs Content */}
            <div className="md:col-span-2">
              {/* Tabs */}
              <div className="flex border-b border-gray-200 mb-6">
                <button
                  className={`px-4 py-2 font-medium text-sm ${
                    activeTab === "about"
                      ? "border-b-2 border-[#ca0019] text-[#ca0019]"
                      : "text-gray-600 hover:text-gray-900"
                  } transition-colors`}
                  onClick={() => setActiveTab("about")}
                >
                  About
                </button>
                <button
                  className={`px-4 py-2 font-medium text-sm ${
                    activeTab === "certificates"
                      ? "border-b-2 border-[#ca0019] text-[#ca0019]"
                      : "text-gray-600 hover:text-gray-900"
                  } transition-colors`}
                  onClick={() => setActiveTab("certificates")}
                >
                  Certificates ({formattedCertificates.length})
                </button>
                <button
                  className={`px-4 py-2 font-medium text-sm ${
                    activeTab === "projects"
                      ? "border-b-2 border-[#ca0019] text-[#ca0019]"
                      : "text-gray-600 hover:text-gray-900"
                  } transition-colors`}
                  onClick={() => setActiveTab("projects")}
                >
                  Projects ({formattedProjects.length})
                </button>
              </div>

              {/* Tab Content */}
              {activeTab === "about" && (
                <div>
                  {/* Bio */}
                  <div className="mb-8">
                    <h4 className="font-semibold mb-3 text-gray-800">About</h4>
                    <p className="text-gray-700 leading-relaxed">
                      {bio !== "No bio available" ? bio : `${fullName} is a member of The Uniques Community from ${batch}.`}
                    </p>
                  </div>

                  {/* Achievements */}
                  {formattedAchievements.length > 0 && (
                    <div className="mb-8">
                      <h4 className="font-semibold mb-4 flex items-center gap-1.5 text-gray-800">
                        <Award className="w-4 h-4" /> Achievements
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {formattedAchievements.map((achievement) => (
                          <div
                            key={achievement.id}
                            className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-start gap-3">
                              <div
                                className={`${achievement.color} text-white p-2 rounded-full flex items-center justify-center`}
                              >
                                {achievement.icon || <Award className="w-4 h-4" />}
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
                                    {achievement.date}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Contributions */}
                  {contributions && contributions.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-3 text-gray-800">
                        Community Contributions
                      </h4>
                      <ul className="list-disc list-inside text-gray-700 space-y-2 pl-1">
                        {contributions.map((contribution, index) => (
                          <li key={index} className="leading-relaxed">
                            {contribution}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "certificates" && (
                <div>
                  <h4 className="font-semibold mb-4 flex items-center gap-1.5 text-gray-800">
                    <FileText className="w-4 h-4" /> Certificates & Credentials
                  </h4>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    {formattedCertificates.length > 0 ? (
                      formattedCertificates.map((certificate, idx) => (
                        <div
                          key={certificate.id || idx}
                          className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                        >
                          <div className="aspect-[16/9] overflow-hidden bg-gray-50">
                            {certificate.fileId ? (
                              <iframe
                                src={`https://drive.google.com/file/d/${certificate.fileId}/preview`}
                                className="w-full h-full"
                                frameBorder="0"
                                allowFullScreen
                                loading="lazy"
                                title={certificate.title}
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
                              {certificate.title}
                            </h5>
                            {certificate.issuer && (
                              <p className="text-sm text-gray-600 mt-1">
                                {certificate.issuer}
                              </p>
                            )}
                            <div className="flex justify-between items-center mt-2">
                              <p className="text-xs text-gray-500">
                                {certificate.date
                                  ? formatDate(certificate.date)
                                  : "Date not available"}
                              </p>
                              {certificate.fileId && (
                                <a
                                  href={`https://drive.google.com/file/d/${certificate.fileId}/view`}
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
                      ))
                    ) : (
                      <p className="text-gray-500 col-span-2 text-center py-8">
                        No certificates added yet.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "projects" && (
                <div>
                  <h4 className="font-semibold mb-4 flex items-center gap-1.5 text-gray-800">
                    <Briefcase className="w-4 h-4" /> Projects
                  </h4>
                  <div className="space-y-6">
                    {formattedProjects.length > 0 ? (
                      formattedProjects.map((project) => (
                        <div
                          key={project.id}
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
                      <p className="text-gray-500 text-center py-8">No projects added yet.</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Click outside to close share menu */}
      {shareMenuOpen && (
        <div
          className="fixed inset-0 z-5"
          onClick={() => setShareMenuOpen(false)}
        />
      )}
    </div>
  );
};

export default MemberProfile;
