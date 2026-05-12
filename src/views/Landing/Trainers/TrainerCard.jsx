import React, { useState } from "react";
import { BASE_URL } from "@/config";
import { useTheme } from "@mui/material/styles";
import { FaLinkedinIn, FaInstagram, FaGithub } from "react-icons/fa";
import { GoArrowUpRight } from "react-icons/go";
import { FaXTwitter } from "react-icons/fa6";
import { Link, useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import { TbTrophy, TbBriefcase } from "react-icons/tb";

const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    bgcolor: "background.paper",
    boxShadow: 24,
    p: 4,
    outline: "none",
};

export const TrainerCard = ({ user }) => {
    const [open, setOpen] = useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    // Image Handling
    const getProxyImageUrl = (fileId) => {
        if (!fileId) return null;
        return `${BASE_URL}/api/image-proxy/${fileId}`;
    };

    const initialImg = user.profilePic
        ? getProxyImageUrl(user.profilePic.fileId || user.profilePic)
        : `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=random`;

    const [imgSrc, setImgSrc] = useState(initialImg);

    const handleImgError = () => {
        setImgSrc(`https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=random`);
    };

    return (
        <div className="relative w-80 bg-white rounded-xl overflow-hidden shadow-md border border-slate-200 group transition-all hover:shadow-2xl hover:scale-[1.01] duration-300">

            {/* Sidebar (Right) - Fixed Width, Full Height, Dark Background */}
            <div className="absolute top-0 right-0 w-16 h-full bg-[#1e1e1e] flex flex-col items-center pt-6 gap-5 z-20">
                {user.githubProfile && (
                    <Link to={user.githubProfile} target="_blank" className="bg-white p-2 rounded-full hover:bg-slate-200 transition-colors">
                        <FaGithub size={16} className="text-black" />
                    </Link>
                )}
                {user.linkedinProfile && (
                    <Link to={user.linkedinProfile} target="_blank" className="bg-white p-2 rounded-full hover:bg-slate-200 transition-colors">
                        <FaLinkedinIn size={16} className="text-[#0077b5]" />
                    </Link>
                )}
                {user.twitterProfile && (
                    <Link to={user.twitterProfile} target="_blank" className="bg-white p-2 rounded-full hover:bg-slate-200 transition-colors">
                        <FaXTwitter size={16} className="text-black" />
                    </Link>
                )}
                {/* Arrow Button at Bottom */}
                <button
                    onClick={handleOpen}
                    className="mt-auto mb-6 w-10 h-10 rounded-full bg-black border border-zinc-700 flex items-center justify-center text-white hover:bg-[#ca0019] hover:border-[#ca0019] transition-all duration-300 group-hover:rotate-45"
                >
                    <GoArrowUpRight size={20} />
                </button>
            </div>

            {/* Content Area (Left) - Right margin reserved for Sidebar */}
            <div className="mr-16 flex flex-col h-full bg-white relative">

                {/* Image Container */}
                <div
                    onClick={handleOpen}
                    className="relative h-64 w-full cursor-pointer bg-slate-50"
                    style={{
                        clipPath: "polygon(30% 0%, 85% 0, 100% 12%, 100% 100%, 60% 100%, 40% 85%, 0 85%, 0 0)",
                    }}
                >
                    <img
                        src={imgSrc}
                        onError={handleImgError}
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                        alt={user.fullName}
                    />
                    {/* Batch Badge (Overlapping Image) */}
                    <div className="absolute bottom-[20%] left-0 bg-[#ca0019] text-white text-xs font-bold px-3 py-1.5 shadow-md z-10">
                        {user.teachingBatch || "The Uniques 2.0"}
                    </div>
                </div>

                {/* Text Info */}
                <div className="p-5 flex flex-col gap-2 relative top-[-15px]"> {/* Negative top margin to pull text up into the white space created by clip-path if needed, or just normal flow */}
                    <h3 className="font-extrabold text-xl text-slate-900 leading-tight truncate pr-2">{user.fullName}</h3>
                    <p className="text-sm text-slate-500 font-medium truncate">{user.designation || "Technical Trainer"}</p>

                    {/* Stats / Skills Pills */}
                    <div className="flex flex-wrap items-center gap-2 mt-3">
                        <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                            <span className="font-bold text-slate-700 text-xs">{user.skills?.length || 0}</span>
                            <span className="text-xs text-slate-500 font-medium">Skills</span>
                        </div>

                        {/* Example Achievement Pill - Optional based on data */}
                        {/* <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                             <TbTrophy className="text-[#ca0019] text-xs"/>
                             <span className="text-xs text-slate-500 font-medium">Expert</span>
                        </div> */}
                    </div>
                </div>
            </div>

            {/* View Profile Modal - Kept same as verified working version */}
            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={style} className="lg:w-[65%] w-[90%] max-h-[90vh] overflow-y-auto rounded-lg outline-none">
                    <button
                        onClick={handleClose}
                        className="absolute top-4 right-4 text-slate-400 hover:text-black transition-colors z-50"
                    >
                        Close
                    </button>

                    <div className="grid lg:grid-cols-5 md:grid-cols-1 gap-8">
                        <div className="lg:col-span-2 relative">
                            <div className="rounded-lg overflow-hidden shadow-lg border border-slate-100">
                                <img
                                    src={imgSrc}
                                    className="w-full h-auto object-cover aspect-[3/4]"
                                    alt={user.fullName}
                                />
                            </div>
                            <div className="mt-6 flex flex-wrap gap-2 justify-center">
                                {user.teachingBatch && (
                                    <span className="bg-[#ca0019]/10 text-[#ca0019] px-3 py-1 rounded-full text-xs font-bold border border-[#ca0019]/20"> {user.teachingBatch}</span>
                                )}
                                <span className="bg-black/5 text-black px-3 py-1 rounded-full text-xs font-bold border border-black/10"> {user.designation}</span>
                            </div>
                        </div>

                        <div className="lg:col-span-3 flex flex-col gap-6">
                            <div>
                                <h2 className="text-3xl font-bold text-slate-900 mb-1">{user.fullName}</h2>
                                <p className="text-[#ca0019] font-medium text-lg">{user.designation || "Expert Trainer"}</p>
                            </div>
                            <div>
                                <h4 className="font-bold text-sm text-slate-900 uppercase tracking-wider mb-2 border-b border-slate-100 pb-2">About</h4>
                                <p className="text-slate-600 text-sm leading-relaxed">
                                    {user.bio || "No biography provided."}
                                </p>
                            </div>
                            <div>
                                <h4 className="font-bold text-sm text-slate-900 uppercase tracking-wider mb-3 border-b border-slate-100 pb-2">Skills</h4>
                                <div className="flex flex-wrap gap-2">
                                    {user.skills && user.skills.length > 0 ? (
                                        user.skills.map((skill, index) => (
                                            <span key={index} className="px-3 py-1.5 bg-slate-50 text-slate-700 rounded-md text-xs font-medium border border-slate-200 hover:border-[#ca0019] hover:text-[#ca0019] transition-colors cursor-default">
                                                {skill}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-slate-400 text-sm italic">No skills listed</span>
                                    )}
                                </div>
                            </div>
                            <div>
                                <h4 className="font-bold text-sm text-slate-900 uppercase tracking-wider mb-3 border-b border-slate-100 pb-2">Connect</h4>
                                <div className="flex items-center gap-3">
                                    {user.githubProfile && (
                                        <Link to={user.githubProfile} target="_blank">
                                            <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-white hover:bg-black transition-colors">
                                                <FaGithub size={18} />
                                            </div>
                                        </Link>
                                    )}
                                    {user.linkedinProfile && (
                                        <Link to={user.linkedinProfile} target="_blank">
                                            <div className="w-10 h-10 rounded-full bg-[#0077b5] flex items-center justify-center text-white hover:opacity-90 transition-opacity">
                                                <FaLinkedinIn size={18} />
                                            </div>
                                        </Link>
                                    )}
                                    {user.twitterProfile && (
                                        <Link to={user.twitterProfile} target="_blank">
                                            <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center text-white hover:opacity-80 transition-opacity">
                                                <FaXTwitter size={18} />
                                            </div>
                                        </Link>
                                    )}
                                    {user.instagramProfile && (
                                        <Link to={user.instagramProfile} target="_blank">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 flex items-center justify-center text-white hover:opacity-90 transition-opacity">
                                                <FaInstagram size={18} />
                                            </div>
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </Box>
            </Modal>
        </div>
    );
};
