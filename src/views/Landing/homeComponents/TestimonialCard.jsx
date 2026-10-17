"use client"
import React from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion"
import { useRef, useState, useEffect } from "react"
import { BASE_URL } from "@/config";
import { 
  School, 
  Work, 
  Computer,
  Star
} from "@mui/icons-material"
import { Avatar } from "@mui/material";

const colors = {
  primary: "#ca0019",     // Red
  dark: "#000000",        // Black
  light: "#ffffff",       // White
  gray: "#f5f5f5",        // Light gray
  primaryLight: "#ffebee" // Light red for backgrounds
};

// Testimonial data
const testimonialData = {
  students: [
    {
      name: "Ronit JaiPrakash",
      role: "Application Developer, Caelius Consultancy",
      image: "https://media.licdn.com/dms/image/v2/D5603AQFewlI7VW09Fg/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1708280686326?e=1758153600&v=beta&t=hikYCXE00z2JXiIWsLY2ip2_CWJxCXDn5ilAzxPINbw",
      testimonial: "The Uniques Community provided me with the skills and connections to launch my career as a Full Stack Developer. The mentorship I received was invaluable in helping me secure my role at Caelius Consultancy.",
      rating: 5,
      highlight: "MERN Stack Expert"
    },
    {
      name: "Naveen Jaiswal",
      role: "Software Developer, Thor Solutions",
      image: `${BASE_URL}/api/image-proxy/1b9-mcMtoowSSiKr8wHHxLTnvjNzuhIsR`,
      testimonial: "Through the practical projects and industry-focused training at The Uniques, I developed the technical expertise needed to excel in my role developing product customization platforms.",
      rating: 5,
      highlight: "Product Development"
    },
    {
      name: "Parveen Jaiswal",
      role: "Web Developer, SpacePepper Studios",
      image: "https://media.licdn.com/dms/image/v2/D5603AQFnP2LqKHK4Tg/profile-displayphoto-shrink_400_400/B56ZXRMoqbGsAk-/0/1742971506111?e=1758153600&v=beta&t=YeEw2VjRzdPeV6BLihJ2kYzZePYtb7lMVS2ElI0YsVo",
      testimonial: "As an MCD Level-1 certified developer, I can attribute much of my success to the guidance and opportunities provided by The Uniques Community. They helped transform my passion into expertise.",
      rating: 5,
      highlight: "MCD Certified"
    },
    {
      name: "Mantasha Tabassum",
      role: "Application Developer, Caelius Consulting",
      image: `${BASE_URL}/api/image-proxy/1njlZ75EFgYTvki-8NIlgIsWvgwYccAXM`,
      testimonial: "The Uniques Community gave me the confidence and AWS expertise I needed to implement cloud solutions and optimize infrastructure. Their hands-on approach truly made the difference.",
      rating: 5,
      highlight: "AWS Specialist"
    }
  ],
  faculty: [
    {
      name: "Dr. Rajesh Sharma",
      role: "Professor of Computer Science, IIT Delhi",
      image: "https://randomuser.me/api/portraits/men/42.jpg",
      testimonial: "The curriculum designed by The Uniques Community bridges the gap between academic learning and industry requirements perfectly. My students who engage with their programs consistently perform better in real-world applications.",
      rating: 5,
      highlight: "Industry Alignment"
    },
    {
      name: "Prof. Anita Desai",
      role: "Head of IT Department, Delhi University",
      image: "https://randomuser.me/api/portraits/women/45.jpg",
      testimonial: "I've witnessed a remarkable transformation in students who participate in The Uniques programs. Their confidence, technical skills, and problem-solving abilities show significant improvement.",
      rating: 5,
      highlight: "Skill Enhancement"
    },
    {
      name: "Dr. Vikram Mehta",
      role: "Dean of Engineering, Chandigarh University",
      image: "https://randomuser.me/api/portraits/men/32.jpg",
      testimonial: "The Uniques Community's approach to practical learning complements our academic curriculum perfectly. Their industry connections provide our students with invaluable networking opportunities.",
      rating: 5,
      highlight: "Practical Approach"
    },
    {
      name: "Prof. Sunita Patel",
      role: "Director of Placements, Panjab University",
      image: "https://randomuser.me/api/portraits/women/68.jpg",
      testimonial: "Companies actively seek out students who have trained with The Uniques Community. Their program significantly enhances our placement statistics and student career outcomes.",
      rating: 5,
      highlight: "Enhanced Placements"
    }
  ],
  professionals: [
    {
      name: "Amit Kumar",
      role: "CTO, TechForward Solutions",
      image: "https://randomuser.me/api/portraits/men/22.jpg",
      testimonial: "The graduates from The Uniques Community join our team with a solid foundation in both technical skills and professional attitude. Their training clearly emphasizes real-world problem solving.",
      rating: 5,
      highlight: "Industry Ready"
    },
    {
      name: "Priya Sharma",
      role: "Engineering Manager, Microsoft India",
      image: "https://randomuser.me/api/portraits/women/29.jpg",
      testimonial: "We've hired multiple developers trained by The Uniques, and they consistently demonstrate strong coding practices and teamwork. Their preparation for the industry is exceptional.",
      rating: 5,
      highlight: "Team Players"
    },
    {
      name: "Rahul Verma",
      role: "Lead Developer, Amazon Web Services",
      image: "https://randomuser.me/api/portraits/men/36.jpg",
      testimonial: "The Uniques Community produces developers who understand not just coding, but the entire software development lifecycle. This makes them valuable assets to any tech team.",
      rating: 4,
      highlight: "Full Lifecycle Skills"
    },
    {
      name: "Neha Gupta",
      role: "Hiring Manager, Google",
      image: "https://randomuser.me/api/portraits/women/65.jpg",
      testimonial: "I'm always impressed by candidates from The Uniques Community. They demonstrate both technical excellence and the soft skills essential for success in collaborative environments.",
      rating: 5,
      highlight: "Balanced Skillset"
    }
  ]
};

// Add transition settings
const transitionSettings = {
  duration: 0.7,
  ease: [0.43, 0.13, 0.23, 0.96]
};

const slideVariants = {
  enter: (direction) => ({
    x: direction > 0 ? 1000 : -1000,
    opacity: 0
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1
  },
  exit: (direction) => ({
    zIndex: 0,
    x: direction < 0 ? 1000 : -1000,
    opacity: 0
  })
};

const TestimonialCard = ({ image, name, role, testimonial, rating = 5, highlight, delay }) => {
  const cardRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ["start end", "end start"]
  });

  const opacity = useTransform(
    scrollYProgress,
    [0, 0.2, 0.8, 1],
    [0, 1, 1, 0]
  );
  
  const scale = useTransform(
    scrollYProgress,
    [0, 0.2, 0.8, 1],
    [0.8, 1, 1, 0.8]
  );

  const y = useTransform(
    scrollYProgress,
    [0, 0.2, 0.8, 1],
    [50, 0, 0, 50]
  );

  return (
    <motion.div
      ref={cardRef}
      style={{ 
        opacity,
        scale,
        y
      }}
      // whileHover={{ 
      //   scale: 1.05,
      //   boxShadow: `0 20px 25px -5px rgba(202, 0, 25, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)`
      // }}
      transition={{ duration: 0.5, delay }}
      className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 transition-all duration-300 relative"
    >
      {/* Quote icon decoration */}
      <div className="absolute -top-4 -left-4 w-8 h-8 rounded-full flex items-center justify-center"
           style={{ backgroundColor: `${colors.primaryLight}` }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M10,7L8,11H11V17H5V11L7,7H10M18,7L16,11H19V17H13V11L15,7H18Z" fill={colors.primary}/>
        </svg>
      </div>
      
      {/* Highlight badge */}
      {highlight && (
        <div className="absolute -top-3 right-8 py-1 px-3 rounded-full text-xs font-medium"
             style={{ backgroundColor: colors.primary, color: 'white' }}>
          {highlight}
        </div>
      )}
      
      {/* Star rating */}
      <div className="flex mb-4">
        {[...Array(rating || 5)].map((_, i) => (
          <Star key={i} style={{ color: '#FFD700', fontSize: '16px' }} />
        ))}
      </div>
      
      <p className="text-gray-700 mb-6 leading-relaxed">"{testimonial}"</p>
      
      <div className="flex items-center pt-4 border-t border-gray-100">
        <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
          <img
            src={image || "/placeholder.svg"}
            alt={name}
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <h3 className="font-semibold" style={{ color: colors.dark }}>{name}</h3>
          <p className="text-sm" style={{ color: 'gray' }}>{role}</p>
        </div>
      </div>
    </motion.div>
  );
};

const Testimonials = () => {
  const [[page, direction], setPage] = useState([0, 0]);
  const [isAnimating, setIsAnimating] = useState(false);
  const sections = ['students', 'faculty', 'professionals'];
  const activeSection = sections[page % sections.length];
  
  const sectionIcons = {
    'students': <School />,
    'faculty': <Work />,
    'professionals': <Computer />
  };
  
  const sectionDescriptions = {
    students: "Hear from our alumni who have successfully launched their careers through The Uniques Community",
    faculty: "Academic professionals share their insights on the impact of our program on students and institutions",
    professionals: "Industry leaders discuss the quality and preparedness of talent from The Uniques Community"
  };

  // Continuous auto-scroll effect
  useEffect(() => {
    const timer = setInterval(() => {
      setIsAnimating(true);
      setPage(([prevPage, prevDirection]) => [prevPage + 1, 1]);
      setTimeout(() => setIsAnimating(false), 700);
    }, 10000); // 10 seconds between auto-scrolls

    return () => clearInterval(timer);
  }, []);

  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });

  // Background animation
  const backgroundY = useTransform(
    scrollYProgress,
    [0, 1],
    ["0%", "10%"]
  );

  return (
    <section 
      ref={sectionRef} 
      className="py-20 px-4 sm:px-6 lg:px-8 overflow-hidden relative bg-gradient-to-b from-white to-gray-100"
    >
      {/* Background decorative elements */}
      <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-5"
           style={{ backgroundColor: colors.primary }}></div>
      <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-5"
           style={{ backgroundColor: colors.dark }}></div>
      
      <div className="max-w-7xl mx-auto relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <span className="inline-block py-1 px-3 rounded-full text-sm font-medium mb-3" 
                style={{ backgroundColor: colors.primaryLight, color: colors.primary }}>
            TESTIMONIALS
          </span>
          
          <AnimatePresence mode="wait">
            <motion.div key={activeSection + "title"}>
              <motion.h2
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                transition={transitionSettings}
                className="text-3xl font-bold sm:text-4xl mb-4"
              >
                Testimonials from{" "}
                <span style={{ color: colors.primary }}>
                  {activeSection === 'students' ? 'Our Students' : 
                   activeSection === 'faculty' ? 'Faculty Members' : 'IT Professionals'}
                </span>
              </motion.h2>
              
              <motion.p 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1, transition: { delay: 0.1 } }}
                exit={{ y: -20, opacity: 0 }}
                transition={transitionSettings}
                className="max-w-2xl mx-auto text-gray-600"
              >
                {sectionDescriptions[activeSection]}
              </motion.p>
            </motion.div>
          </AnimatePresence>
        </motion.div>

        <AnimatePresence custom={direction} mode="wait">
          <motion.div
            key={page}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={transitionSettings}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {testimonialData[activeSection].map((item, index) => (
              <TestimonialCard
                key={`${activeSection}-${index}`}
                image={item.image}
                name={item.name}
                role={item.role}
                testimonial={item.testimonial}
                rating={item.rating}
                highlight={item.highlight}
                delay={index * 0.1}
              />
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Category selectors */}
        <div className="flex flex-col items-center mt-16">
          <div className="flex justify-center space-x-4">
            {sections.map((section, index) => {
              const isActive = page % sections.length === index;
              return (
                <motion.button
                  key={section}
                  className="px-4 py-2 rounded-full flex items-center justify-center transition-all text-sm font-medium"
                  style={{
                    backgroundColor: isActive ? colors.primary : colors.dark,
                    color: colors.light,
                    opacity: isActive ? 1 : 0.7,
                  }}
                  whileHover={{ scale: 1.05, opacity: 1 }}
                  onClick={() => {
                    if (!isAnimating) {
                      setIsAnimating(true);
                      setPage([index, index > page % sections.length ? 1 : -1]);
                      setTimeout(() => setIsAnimating(false), 700);
                    }
                  }}
                >
                  <span className="mr-2">
                    {React.cloneElement(sectionIcons[section], { fontSize: 'small' })}
                  </span>
                  {section.charAt(0).toUpperCase() + section.slice(1)}
                  
                  {isActive && (
                    <motion.div
                      className="ml-2 w-1 h-1 bg-white rounded-full"
                      animate={{
                        scale: [1, 1.5, 1],
                        opacity: [1, 0.8, 1]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        repeatType: "reverse"
                      }}
                    />
                  )}
                </motion.button>
              );
            })}
          </div>
          
          {/* Indicator dots */}
          <div className="flex justify-center space-x-2 mt-6">
            {sections.map((section, index) => {
              const isActive = page % sections.length === index;
              return (
                <motion.div
                  key={`dot-${section}`}
                  className="w-2 h-2 rounded-full cursor-pointer"
                  style={{ 
                    backgroundColor: isActive ? colors.primary : colors.dark,
                    opacity: isActive ? 1 : 0.3
                  }}
                  whileHover={{ scale: 1.5 }}
                  onClick={() => {
                    if (!isAnimating) {
                      setIsAnimating(true);
                      setPage([index, index > page % sections.length ? 1 : -1]);
                      setTimeout(() => setIsAnimating(false), 700);
                    }
                  }}
                />
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
