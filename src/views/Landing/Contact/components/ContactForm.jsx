import React, { useState } from "react";
import { TextField, Button, Checkbox, FormControlLabel, CircularProgress, Snackbar, Alert } from "@mui/material";
import tu from "@/assets/logos/theuniquesCommunity.png";
import InstagramIcon from '@mui/icons-material/Instagram';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import { Link } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "@/config";

const ContactForm = () => {
  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    message: '',
    services: []
  });
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [errors, setErrors] = useState({});
  const [isMapActive, setIsMapActive] = useState(false);
  
  // Available services
  const services = [
    "Website design",
    "Content creation",
    "UX design",
    "Strategy & consulting",
    "User research",
    "Other",
  ];
  
  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error for this field if any
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };
  
  // Handle checkbox changes
  const handleCheckboxChange = (service) => (e) => {
    const { checked } = e.target;
    
    if (checked) {
      setFormData({
        ...formData,
        services: [...formData.services, service]
      });
    } else {
      setFormData({
        ...formData,
        services: formData.services.filter(item => item !== service)
      });
    }
  };
  
  // Form validation
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    try {
      const response = await axios.post(`${BASE_URL}/api/contact`, formData);
      
      if (response.data.success) {
        // Show success message
        setAlert({
          open: true,
          message: 'Thank you! Your message has been sent successfully.',
          severity: 'success'
        });
        
        // Clear form
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          message: '',
          services: []
        });
      } else {
        throw new Error(response.data.message || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      setAlert({
        open: true,
        message: error.response?.data?.message || 'Failed to send your message. Please try again.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="grid place-items-center min-h-screen p-6">
      <div className="lg:p-8 md:p-8 p-3 max-w-9xl w-full grid grid-cols-1 md:grid-cols-2 gap-16">
        {/* Left Side - Form */}
        <div>
          <h2 className="text-3xl font-bold mb-2">Contact our team</h2>
          <p className="text-gray-600 mb-6">
            Got any questions about the product or scaling on our platform?
            We're here to help.
          </p>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 space-x-2 pe-2 my-3">
              <TextField 
                label="First name" 
                fullWidth 
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                error={!!errors.firstName}
                helperText={errors.firstName}
                required
              />
              <TextField 
                label="Last name" 
                fullWidth 
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                error={!!errors.lastName}
                helperText={errors.lastName}
                required
              />
            </div>
            <div className="grid grid-cols-1 space-y-4">
              <TextField 
                label="Email" 
                fullWidth 
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                error={!!errors.email}
                helperText={errors.email}
                required
              />
              <TextField 
                label="Phone number" 
                fullWidth 
                name="phone"
                value={formData.phone}
                onChange={handleChange}
              />
              <TextField 
                label="Message" 
                fullWidth 
                multiline 
                rows={4} 
                name="message"
                value={formData.message}
                onChange={handleChange}
                error={!!errors.message}
                helperText={errors.message}
                required
              />
            </div>

            <div className="mt-4 grid lg:grid-cols-2 md:grid-cols-2 grid-cols-1 gap-1">
              {services.map((service) => (
                <FormControlLabel
                  key={service}
                  control={
                    <Checkbox 
                      checked={formData.services.includes(service)}
                      onChange={handleCheckboxChange(service)}
                    />
                  }
                  label={service}
                />
              ))}
            </div>
            <div className="mt-5">
              <Button
                type="submit"
                variant="contained"
                fullWidth
                className="mt-4 bg-black text-white"
                disabled={loading}
                style={{ backgroundColor: loading ? '#bbb' : '#ca0019' }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Send message'}
              </Button>
            </div>
          </form>
        </div>

        {/* Right Side - Contact Info */}
        <div>
          <img className="h-12 object-contain mb-6" src={tu} alt="The Uniques Logo" />
          <h3 className="text-2xl font-semibold mb-2">Chat with us</h3>
          <p className="text-gray-600 mb-3">
            Speak to our friendly team via live chat.
          </p>
          <div className="flex-col">
            <Link to="https://www.instagram.com/theuniquesofficial?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" target="_blank" className="inline-block my-4 font-semibold">
              <div>
                <InstagramIcon /> <span className="underline">Our Instagram</span>
              </div>
            </Link>
            <Link to="https://www.linkedin.com/company/theuniquesofflicial" target="_blank" className="underline font-semibold">
              <div>
                <LinkedInIcon /> <span className="underline">Our LinkedIn</span>
              </div>
            </Link>
            <Link to="https://chat.whatsapp.com/HYOloogGXKcIkR83DnOjFj" target="_blank" className="underline inline-block my-4 font-semibold">
              <div>
                <WhatsAppIcon /> <span className="underline">Our WhatsApp</span>
              </div>
            </Link>
          </div>

          <h3 className="text-2xl font-semibold mt-8 mb-2">Visit us</h3>
          <p className="text-gray-600 mb-2">SVIET, Banur, Punjab-140601</p>
          <div 
            className="relative rounded-lg overflow-hidden group"
            onMouseLeave={() => setIsMapActive(false)}
          >
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3690.82409273242!2d76.70145491128464!3d30.55434119412627!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390fc3b350bbf2e7%3A0xece92a925f664640!2sThe%20uniques!5e0!3m2!1sen!2sin!4v1740583636506!5m2!1sen!2sin"
              style={{ border: 0 }}
              width={"100%"}
              height={"220px"}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="The Uniques Community Map Location"
              className={`w-full h-[220px] rounded-lg transition-all duration-300 dark:invert-[0.92] dark:hue-rotate-180 dark:contrast-[1.15] dark:brightness-[0.88] dark:saturate-[0.85] ${!isMapActive ? 'pointer-events-none' : ''}`}
            ></iframe>

            {!isMapActive && (
              <div 
                onClick={() => setIsMapActive(true)}
                className="absolute inset-0 bg-black/10 dark:bg-black/30 backdrop-blur-[1px] flex flex-col items-center justify-center cursor-pointer transition-opacity hover:bg-black/20"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setIsMapActive(true); }}
                aria-label="Click to interact with map"
              >
                <span className="bg-white/90 dark:bg-neutral-900/90 text-gray-800 dark:text-gray-200 text-xs font-medium px-3 py-1.5 rounded-full shadow-md backdrop-blur-sm pointer-events-none">
                  Click to interact with map
                </span>
                <a
                  href="https://maps.google.com/?q=The+uniques+SVIET+Banur"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="mt-2 text-xs text-white/90 hover:text-white underline drop-shadow"
                >
                  Open in Google Maps
                </a>
              </div>
            )}
            {isMapActive && (
              <button
                type="button"
                onClick={() => setIsMapActive(false)}
                className="absolute top-2 right-2 bg-white/90 dark:bg-neutral-800/90 text-gray-700 dark:text-gray-200 text-xs px-2.5 py-1 rounded shadow hover:bg-white dark:hover:bg-neutral-800 transition"
                title="Lock map scroll"
              >
                Done
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Alert Snackbar */}
      <Snackbar
        open={alert.open}
        autoHideDuration={6000}
        onClose={() => setAlert({...alert, open: false})}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setAlert({...alert, open: false})} 
          severity={alert.severity}
          sx={{ width: '100%' }}
        >
          {alert.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default ContactForm;
