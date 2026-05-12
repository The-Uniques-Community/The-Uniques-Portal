import { useTheme } from "@mui/material";
import { FaLinkedinIn, FaTwitter, FaInstagram, FaGithub, FaWhatsapp } from "react-icons/fa";
import logo from '../../assets/logos/theuniquesCommunity.png'
import { Link } from "react-router";
import { WhatsApp } from "@mui/icons-material";

const Footer = () => {
    const theme = useTheme();
  return (
    <footer className="bg-slate-200 lg:p-6 md:p-6 sm:p-6 p-4 py-12">
      <div style={{borderBottomWidth:'1px',borderColor:theme.palette.primary.dark}} className="max-w-7xl py-4 mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
        <div>
          <img src={logo} className="mb-4 w-full h-10 object-contain object-left" alt="The Uniques Community Logo" />
          <p className="text-sm mb-4">
            The Uniques Community is a student-led initiative focused on fostering technical skills, collaboration, and professional growth through hands-on projects and industry mentorship.
          </p>
        </div>

        {/* Navigation */}
        <div className="px-3">
          <h4 className="text-lg font-semibold mb-2">NAVIGATE</h4>
          <ul className="text-sm space-y-2">
            <li className="hover:text-slate-800 hover:underline duration"><Link to="/">Home</Link></li>
            <li className="hover:text-slate-800 hover:underline duration"><Link to="/about">About Us</Link></li>
            <li className="hover:text-slate-800 hover:underline duration"><Link to="/events">Events</Link></li>
            <li className="hover:text-slate-800 hover:underline duration"><Link to="/blogs">Blogs</Link></li>
          </ul>
        </div>

        {/* Community */}
        <div className="px-3">
          <h4 className="text-lg font-semibold mb-2">COMMUNITY</h4>
          <ul className="text-sm space-y-2">
            <li className="hover:text-slate-800 hover:underline duration"><Link to="/community-main">Community Page</Link></li>
            <li className="hover:text-slate-800 hover:underline duration"><Link to="/batches">Batches</Link></li>
            <li className="hover:text-slate-800 hover:underline duration"><Link to="/howitstarted">How It Started</Link></li>
            <li className="hover:text-slate-800 hover:underline duration"><Link to="/auth/login">Member Login</Link></li>
          </ul>
        </div>

        {/* Resources */}
        <div className="px-3">
          <h4 className="text-lg font-semibold mb-2">RESOURCES</h4>
          <ul className="text-sm space-y-2">
            <li className="hover:text-slate-800 hover:underline duration"><Link to="/training">Training Model</Link></li>
            <li className="hover:text-slate-800 hover:underline duration"><Link to="/contact">Contact Us</Link></li>
            <li className="hover:text-slate-800 hover:underline duration"><Link to="/privacy-policy">Privacy Policy</Link></li>
            <li className="hover:text-slate-800 hover:underline duration"><Link to="/terms-of-service">Terms of Service</Link></li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-6 grid grid-cols-1 gap-4">
        {/* Copyright */}
        <div className="text-sm text-center md:text-left">
          © {new Date().getFullYear()} The Uniques Community. All rights reserved.
        </div>

        {/* Social Icons */}
        <div className="flex justify-center md:justify-end items-center space-x-4">
            <div className="w-8 h-8 rounded-full bg-slate-200">
                <Link to="https://www.linkedin.com/company/theuniquesofflicial" target="_blank" rel="noopener noreferrer">
                <div style={{backgroundColor:theme.palette.primary.dark}} className="w-8 h-8 rounded-full flex justify-center items-center">
                    <FaLinkedinIn color="white" className="cursor-pointer" size={20} />
                </div>
                </Link>
            </div>
            <div className="w-8 h-8 rounded-full bg-slate-200">
                <Link to="https://www.instagram.com/theuniquesofficial?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" target="_blank" rel="noopener noreferrer">
                <div style={{backgroundColor:theme.palette.primary.dark}} className="w-8 h-8 rounded-full flex justify-center items-center">
                    <FaInstagram color="white" className="mx-auto cursor-pointer" size={20} />
                </div>
                </Link>
            </div>
            <div className="w-8 h-8 rounded-full bg-slate-200">
                <Link to="https://chat.whatsapp.com/HYOloogGXKcIkR83DnOjFj" target="_blank" rel="noopener noreferrer">
                <div style={{backgroundColor:theme.palette.primary.dark}} className="w-8 h-8 rounded-full flex justify-center items-center">
                    <FaWhatsapp className="cursor-pointer" size={20} color="white" />
                </div>
                </Link>
            </div>
            <div className="w-8 h-8 rounded-full bg-slate-200">
                <Link to="https://github.com/theuniquescommunity" target="_blank" rel="noopener noreferrer">
                <div style={{backgroundColor:theme.palette.primary.dark}} className="w-8 h-8 rounded-full flex justify-center items-center">
                    <FaGithub className="cursor-pointer" size={20} color="white" />
                </div>
                </Link>
            </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
