
import React, { useState, forwardRef } from "react";
import { BASE_URL } from "@/config";
import {
    Button,
    Card,
    CardContent,
    Dialog,
    IconButton,
    Tooltip,
    Modal,
    Box,
    Typography,
} from "@mui/material";
import { FaEye } from "react-icons/fa";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import GitHubIcon from "@mui/icons-material/GitHub";
import XIcon from "@mui/icons-material/X";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import CloseIcon from "@mui/icons-material/Close";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import AutoStoriesIcon from "@mui/icons-material/AutoStories";
import LabelIcon from "@mui/icons-material/Label";
import BusinessIcon from "@mui/icons-material/Business";
import LoginIcon from "@mui/icons-material/Login";
import VerifiedIcon from "@mui/icons-material/Verified";
import InstagramIcon from "@mui/icons-material/Instagram";
import tu from "@/assets/logos/tu.png";
import { Link } from "react-router";
import userIcon from "@/assets/img/user-icon.png";
import "tailwindcss/tailwind.css";

const TrainerProfileDialog = ({ open, handleClose, user }) => {
    const getProxyImageUrl = (fileId) => {
        if (!fileId) return "/placeholder.svg"; // Fallback image
        return `${BASE_URL}/api/image-proxy/${fileId}`;
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    return (
        <Dialog
            fullScreen
            open={open}
            onClose={handleClose}
            sx={{ "& .MuiDialog-paper": { bgcolor: "#f8fafc" } }} // Light slate background
        >
            <div className="h-screen overflow-y-auto p-4 md:p-8">
                {/* Close Button */}
                <div className="flex justify-end mb-6">
                    <Tooltip title="Close" arrow>
                        <div
                            onClick={handleClose}
                            className="p-3 w-12 h-12 rounded-full cursor-pointer flex items-center justify-center bg-white shadow-sm hover:bg-slate-100 transition-colors"
                        >
                            <CloseIcon />
                        </div>
                    </Tooltip>
                </div>

                {/* Main Grid Layout */}
                <div className="grid xl:grid-cols-4 lg:grid-cols-3 gap-6">

                    {/* LEFT COLUMN: Profile & Actions */}
                    <div className="xl:col-span-1 lg:col-span-1 flex flex-col gap-6">

                        {/* Identity Card */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
                            <div className="relative mb-4">
                                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-slate-50">
                                    <img
                                        src={
                                            user?.profilePic
                                                ? getProxyImageUrl(user.profilePic.fileId || user.profilePic)
                                                : userIcon
                                        }
                                        alt="Profile"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                {user?.profileStatus === "active" && (
                                    <div className="absolute bottom-2 right-2 bg-white rounded-full p-1 shadow-sm">
                                        <VerifiedIcon color="success" fontSize="small" />
                                    </div>
                                )}
                            </div>

                            <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase mb-1">
                                {user.origin === 'external' ? (user.designation || "External Trainer") : "Uniques Alumni"}
                            </span>
                            <h2 className="text-2xl font-bold text-slate-800 mb-2">{user.fullName}</h2>

                            <div className="mb-4">
                                <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${user.profileStatus === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                    }`}>
                                    {user.profileStatus}
                                </span>
                            </div>

                            {/* Social Links */}
                            <div className="flex justify-center gap-2 mt-2">
                                {/* Reusing Social Link Logic */}
                                {[
                                    { link: user.githubProfile, icon: <GitHubIcon fontSize="small" className="text-white" />, bg: "bg-slate-800" },
                                    { link: user.linkedinProfile, icon: <LinkedInIcon fontSize="small" className="text-white" />, bg: "bg-blue-600" },
                                    { link: user.twitterProfile, icon: <XIcon fontSize="small" className="text-white" />, bg: "bg-black" },
                                    { link: user.instagramProfile, icon: <InstagramIcon fontSize="small" className="text-white" />, bg: "bg-pink-600" },
                                    { link: user.whatsappContact ? `https://wa.me/${user.whatsappContact}` : null, icon: <WhatsAppIcon fontSize="small" className="text-white" />, bg: "bg-green-500" }
                                ].map((social, idx) => social.link && (
                                    <Link key={idx} to={social.link} target="_blank">
                                        <div className={`w-8 h-8 ${social.bg} rounded-full flex items-center justify-center hover:opacity-80 transition-opacity`}>
                                            {social.icon}
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Details & Overview */}
                    <div className="xl:col-span-3 lg:col-span-2 flex flex-col gap-6">

                        {/* Key Details Bar */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="flex items-center gap-3">
                                <img src={tu} className="h-8 w-8 object-contain opacity-80" alt="" />
                                <div>
                                    <p className="text-xs text-slate-400 font-medium uppercase">Teaching Batch</p>
                                    <p className="font-semibold text-slate-700">{user.teachingBatch || user.batch}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <AutoStoriesIcon className="text-slate-400" />
                                <div>
                                    <p className="text-xs text-slate-400 font-medium uppercase">Course</p>
                                    <p className="font-semibold text-slate-700">{user.course}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <BusinessIcon className="text-slate-400" />
                                <div>
                                    <p className="text-xs text-slate-400 font-medium uppercase">Role</p>
                                    <p className="font-semibold text-slate-700">{user.designation || "Technical Trainer"}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <LoginIcon className="text-slate-400" />
                                <div>
                                    <p className="text-xs text-slate-400 font-medium uppercase">Joined</p>
                                    <p className="font-semibold text-slate-700">{formatDate(user.createdAt || Date.now())}</p>
                                </div>
                            </div>
                        </div>

                        {/* Overview Sections (Designed as per Screenshot style) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                            {/* Contact Info */}
                            <div>
                                <div className="bg-black text-white px-3 py-1 text-sm font-bold inline-block rounded-t-lg rounded-br-lg mb-0 shadow-lg relative z-10">
                                    CONTACT INFORMATION
                                </div>
                                <div className="bg-white pt-6 pb-4 px-4 rounded-b-xl rounded-tr-xl border border-slate-200 mt-[-10px] shadow-sm relative z-0">
                                    <div className="flex items-center gap-3 mb-3">
                                        <EmailIcon fontSize="small" className="text-slate-400" />
                                        <span className="text-slate-600 text-sm">{user.email}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <PhoneIcon fontSize="small" className="text-slate-400" />
                                        <span className="text-slate-600 text-sm">{user.contact || "N/A"}</span>
                                    </div>

                                    {(user.address || user.city) && (
                                        <div className="flex items-start gap-3 mt-3 pt-3 border-t border-slate-100">
                                            <LocationOnIcon fontSize="small" className="text-slate-400" />
                                            <span className="text-slate-600 text-sm">
                                                {[user.address, user.city, user.state].filter(Boolean).join(", ")}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Bio */}
                            <div>
                                <div className="bg-black text-white px-3 py-1 text-sm font-bold inline-block rounded-t-lg rounded-br-lg mb-0 shadow-lg relative z-10">
                                    BIO
                                </div>
                                <div className="bg-white pt-6 pb-4 px-4 rounded-b-xl rounded-tr-xl border border-slate-200 mt-[-10px] shadow-sm relative z-0 min-h-[100px]">
                                    <div className="flex items-start gap-3">
                                        <BookmarkIcon fontSize="small" className="text-slate-400 mt-0.5" />
                                        <p className="text-slate-600 text-sm leading-relaxed">
                                            {user.bio || "No biography provided."}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Skills - Full Width */}
                            <div className="md:col-span-2">
                                <div className="bg-black text-white px-3 py-1 text-sm font-bold inline-block rounded-t-lg rounded-br-lg mb-0 shadow-lg relative z-10">
                                    SKILLS
                                </div>
                                <div className="bg-white pt-6 pb-4 px-4 rounded-b-xl rounded-tr-xl border border-slate-200 mt-[-10px] shadow-sm relative z-0">
                                    <div className="flex flex-wrap gap-2">
                                        {user?.skills && user.skills.length > 0 ? (
                                            user.skills.map((skill, idx) => (
                                                <span key={idx} className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-medium border border-slate-200">
                                                    {skill}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-slate-400 text-sm italic">No skills listed</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>

                </div>
            </div>
        </Dialog>
    );
};

export const TrainerCardDashboard = ({ user }) => {
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
                            {user.teachingBatch || user.batch}
                        </div>
                        <span className="bg-yellow-400 text-yellow-800 text-sm px-3 py-1 rounded-full">
                            {user.profileStatus}
                        </span>
                    </div>

                    {/* User Details */}
                    <div className="flex items-center gap-3">
                        <img
                            src={
                                user?.profilePic
                                    ? getProxyImageUrl(user.profilePic.fileId || user.profilePic)
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
                        {[
                            { link: user.githubProfile, icon: <GitHubIcon fontSize="medium" className="text-white" />, bg: "bg-black" },
                            { link: user.linkedinProfile, icon: <LinkedInIcon fontSize="medium" className="text-white" />, bg: "bg-black" },
                            { link: user.twitterProfile, icon: <XIcon fontSize="medium" className="text-white" />, bg: "bg-black" },
                            { link: user.whatsappContact ? `https://wa.me/${user.whatsappContact}` : null, icon: <WhatsAppIcon fontSize="medium" className="text-white" />, bg: "bg-black" }
                        ].map((social, idx) => social.link && (
                            <Link key={idx} to={social.link} target="_blank">
                                <div className={`w-10 h-10 p-1 ${social.bg} rounded-full`}>
                                    <div className='w-full h-full flex items-center justify-center'>
                                        {social.icon}
                                    </div>
                                </div>
                            </Link>
                        ))}
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

            {/* Fullscreen Dialog */}
            <TrainerProfileDialog
                handleClose={() => setOpen(false)}
                open={open}
                user={user}
            />
        </>
    );
};
