import React, { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { ChevronLeft, ChevronRight, Github, Linkedin, ExternalLink, Code, Star } from 'lucide-react';
import { BASE_URL } from '@/config';

const TrainerCard = ({ trainer }) => {
  return (
    <div className="h-full">
      <div className={`group relative h-full bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 ${trainer.isIndustryPro ? "ring-1 ring-[#ca0019]/20" : ""}`}>
        {/* Tech-inspired decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 -mt-16 -mr-16 bg-[#ca0019]/5 rounded-full"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 -mb-12 -ml-12 bg-[#ca0019]/5 rounded-full"></div>
        
        {/* Industry pro badge */}
        {trainer.isIndustryPro && (
          <div className="absolute top-3 right-3 bg-gradient-to-r from-[#ca0019] to-[#ff3b54] text-white text-xs font-medium px-2 py-1 rounded-full z-20 flex items-center">
            <Star size={10} className="mr-1" /> Industry Pro
          </div>
        )}
        
        {/* Code lines background effect */}
        <div className="absolute inset-0 opacity-5">
          <div className="h-full w-full" style={{
            backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 20px, #ca0019 20px, #ca0019 21px)`,
            backgroundSize: '100% 21px'
          }}></div>
        </div>

        {/* Card content */}
        <div className="relative z-10 p-6 flex flex-col h-full">
          {/* Top section with image and tech tags */}
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            {/* Trainer image with tech frame */}
            <div className="relative w-28 h-28 flex-shrink-0 mx-auto md:mx-0">
              <div className="absolute inset-0 border-2 border-dashed border-[#ca0019]/30 rounded-lg transform rotate-3"></div>
              <div className="absolute inset-0 border-2 border-[#ca0019] rounded-lg transform -rotate-2"></div>
              <img 
                src={trainer.image} 
                alt={trainer.name}
                className="w-full h-full object-cover rounded-lg transform hover:rotate-0 transition-transform duration-300"
              />
              <div className="absolute -right-2 -bottom-2 w-6 h-6 bg-[#ca0019] rounded flex items-center justify-center text-white text-xs font-mono">
                {trainer.program.charAt(0)}
              </div>
            </div>
            
            <div className="flex-grow">
              <div className="flex items-center">
                <h3 className="text-xl font-bold text-gray-900">{trainer.name}</h3>
                {/* Program tag */}
                <span className="ml-2 inline-block px-1.5 py-0.5 bg-gray-900 text-green-400 text-xs font-mono rounded">
                  {trainer.program}
                </span>
              </div>
              
              <p className="text-[#ca0019] font-mono text-sm mb-2">{trainer.position}</p>
              
              {/* Tech stack display */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {trainer.expertise.map((tech, i) => (
                  <span 
                    key={i}
                    className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-md font-mono"
                  >
                    <Code size={10} className="mr-1 text-[#ca0019]" />
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>
          
          {/* Bio with code comment style */}
          <div className="mb-4 flex-grow">
            <div className="relative pl-3 border-l-2 border-gray-300 text-sm text-gray-600">
              <span className="font-mono text-[#ca0019] absolute left-3 -top-1 opacity-60">/**</span>
              <p className="py-5">{trainer.bio}</p>
              <span className="font-mono text-[#ca0019] absolute left-3 bottom-0 opacity-60">*/</span>
            </div>
          </div>
          
          {/* Social links with tech-inspired styling */}
          <div className="flex items-center justify-between mt-auto pt-3 border-t border-dashed border-gray-200">
            <div className="flex space-x-2">
              {trainer.social?.linkedin && (
                <a 
                  href={trainer.social.linkedin}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 hover:bg-[#ca0019] hover:border-[#ca0019] hover:text-white transition-colors duration-200"
                >
                  <Linkedin size={14} />
                </a>
              )}
              {trainer.social?.github && (
                <a 
                  href={trainer.social.github}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 hover:bg-[#ca0019] hover:border-[#ca0019] hover:text-white transition-colors duration-200"
                >
                  <Github size={14} />
                </a>
              )}
            </div>
            {/* <button className="group flex items-center text-xs font-semibold text-[#ca0019]">
              <span>View Profile</span>
              <div className="ml-1 font-mono transform group-hover:translate-x-1 transition-transform duration-200">&gt;</div>
            </button> */}
          </div>
        </div>
      </div>
    </div>
  );
};

const Trainers = () => {
  const [viewportRef, embla] = useEmblaCarousel({ 
    loop: false, 
    align: 'start',
    skipSnaps: false,
  }, [Autoplay({ delay: 6000, stopOnInteraction: true })]);
  
  // For student mentors carousel
  const [studentMentorsRef, studentMentorsEmbla] = useEmblaCarousel({ 
    loop: false, 
    align: 'start',
    skipSnaps: false,
  }, [Autoplay({ delay: 6000, stopOnInteraction: true })]);
  
  const [prevBtnEnabled, setPrevBtnEnabled] = useState(false);
  const [nextBtnEnabled, setNextBtnEnabled] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState([]);
  const [showAllMentors, setShowAllMentors] = useState(false);

  // Student mentors carousel controls
  const [studentPrevEnabled, setStudentPrevEnabled] = useState(false);
  const [studentNextEnabled, setStudentNextEnabled] = useState(false);
  const [studentSelectedIndex, setStudentSelectedIndex] = useState(0);
  const [studentScrollSnaps, setStudentScrollSnaps] = useState([]);

  const scrollPrev = useCallback(() => embla && embla.scrollPrev(), [embla]);
  const scrollNext = useCallback(() => embla && embla.scrollNext(), [embla]);
  
  const scrollStudentPrev = useCallback(() => studentMentorsEmbla && studentMentorsEmbla.scrollPrev(), [studentMentorsEmbla]);
  const scrollStudentNext = useCallback(() => studentMentorsEmbla && studentMentorsEmbla.scrollNext(), [studentMentorsEmbla]);
  
  const onSelect = useCallback(() => {
    if (!embla) return;
    setSelectedIndex(embla.selectedScrollSnap());
    setPrevBtnEnabled(embla.canScrollPrev());
    setNextBtnEnabled(embla.canScrollNext());
  }, [embla, setSelectedIndex]);

  const onStudentSelect = useCallback(() => {
    if (!studentMentorsEmbla) return;
    setStudentSelectedIndex(studentMentorsEmbla.selectedScrollSnap());
    setStudentPrevEnabled(studentMentorsEmbla.canScrollPrev());
    setStudentNextEnabled(studentMentorsEmbla.canScrollNext());
  }, [studentMentorsEmbla, setStudentSelectedIndex]);

  useEffect(() => {
    if (!embla) return;
    onSelect();
    setScrollSnaps(embla.scrollSnapList());
    embla.on("select", onSelect);
    return () => embla.off("select", onSelect);
  }, [embla, setScrollSnaps, onSelect]);

  useEffect(() => {
    if (!studentMentorsEmbla) return;
    onStudentSelect();
    setStudentScrollSnaps(studentMentorsEmbla.scrollSnapList());
    studentMentorsEmbla.on("select", onStudentSelect);
    return () => studentMentorsEmbla.off("select", onStudentSelect);
  }, [studentMentorsEmbla, setStudentScrollSnaps, onStudentSelect]);

  // Updated trainers data with industry pros marked
  const trainers = [
    {
      id: 1,
      name: "Viswanadh Rayavarapu",
      position: "Founder, Autobot Energy | Ex-meta, Google",
      program: "Taught Uniques 1.0",
      image: "https://media.licdn.com/dms/image/v2/C5603AQFdDBAD3h7VWQ/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1598468860624?e=1756339200&v=beta&t=_f2-EvKBeiQbz-6y2-NkAJa2UyCf5cqSsAjay0E4gP0",
      bio: "Viswanadh brings extensive expertise in Full stack development with experience at industry giants like Meta and Google.",
      expertise: ["Full Stack", "Web Development", "MERN"],
      social: {
        linkedin: "https://www.linkedin.com/in/viswanadh-rayavarapu/"
      },
      isIndustryPro: true
    },
    {
      id: 2,
      name: "Kapil Partap",
      position: "Business Head, MindCodeLab",
      program: "Taught Uniques 1.0 & 2.0",
      image: "https://media.licdn.com/dms/image/v2/D5603AQFNTzTH8mq59w/profile-displayphoto-shrink_800_800/B56ZRLIxkMG8Ag-/0/1736427379944?e=1756339200&v=beta&t=BjOb7ejzjeE1HjemF5YGaOIu3XGQeb_V_nq1aYFaUq0",
      bio: "Kapil specializes in ML, PowerBI and Full Stack Deve	lopment, bringing business insights to technical training.",
      expertise: ["ML", "PowerBI", "Full Stack"],
      social: {
        linkedin: "https://www.linkedin.com/in/kapilpartap/"
      },
      isIndustryPro: true
    },
    {
      id: 3,
      name: "Nishant Singh",
      position: "Campus Tech Lead, Video Production",
      program: "Taught Uniques 3.0",
      image: `${BASE_URL}/api/image-proxy/1SH3BoI8y1FcIPnOq4--cwjLxAx_MxcWB`,
      bio: "Talented student mentor specializing in Adobe video editing suite, helping peers create professional-grade video content.",
      expertise: ["Adobe Premiere", "After Effects", "Video Editing"],
      social: {
        linkedin: "https://www.linkedin.com/in/nishant-singh-14769a208/"
      },
      isIndustryPro: false
    },
    {
      id: 4,
      name: "Vasu Malhotra",
      position: "Creative Tech Mentor, Digital Imaging",
      program: "Taught Uniques 3.0",
      image: `${BASE_URL}/api/image-proxy/1gaipJxoPrOHb8D0B_p_rSsOhSg2EoHpJ`,
      bio: "Rising talent in digital imaging and photo manipulation, teaching fellow students the art of Photoshop.",
      expertise: ["Photoshop", "Digital Imaging", "Graphic Design"],
      social: {
        linkedin: "https://www.linkedin.com/in/vasu-malhotra-ba6908252/"
      },
      isIndustryPro: false
    },
    {
      id: 5,
      name: "Vaishnavi Bajpai",
      position: "Design Innovator & Student Mentor",
      program: "Taught Uniques 3.0",
      image: `${BASE_URL}/api/image-proxy/1vdN4PkGf9C5NZwLZSff2ZUc3m5VvUYdw`,
      bio: "Passionate design enthusiast sharing Canva expertise to help students create compelling visual content for their projects.",
      expertise: ["Canva", "Graphic Design", "Social Media Graphics"],
      social: {
        linkedin: "https://www.linkedin.com/in/vaishnavibajpai90/"
      },
      isIndustryPro: false
    },
    {
      id: 6,
      name: "Mukul Tiwari",
      position: "UI/UX Student Ambassador",
      program: "Taught Uniques 3.0",
      image: "https://media.licdn.com/dms/image/v2/D4E03AQFWOrm_F9Szrw/profile-displayphoto-shrink_800_800/B4EZZrad.nH0Ac-/0/1745558823405?e=1756339200&v=beta&t=B2-0DZI2kvC78ckfCaAu7_YND9U0DqVxx2PX-lj0Bvs",
      bio: "Emerging UI/UX talent focused on teaching Figma design principles and empowering fellow students with digital design skills.",
      expertise: ["Figma", "UI Design", "UX Research"],
      social: {
        linkedin: "https://www.linkedin.com/in/mukul-tiwari-4b07b829a/"
      },
      isIndustryPro: false
    },
    {
      id: 7,
      name: "Amandeep",
      position: "Algorithm Specialist & Peer Mentor",
      program: "Taught Uniques 3.0",
      image: `${BASE_URL}/api/image-proxy/19gzh7aEwbwEyyI3ZP0xbgjdzRF_kcnVd`,
      bio: "Enthusiastic student mentor introducing peers to C++ programming fundamentals and problem-solving techniques.",
      expertise: ["C++", "Data Structures", "Algorithms"],
      social: {
        linkedin: "https://www.linkedin.com/in/aman-deep-720390247/"
      },
      isIndustryPro: false
    },
    {
      id: 8,
      name: "Harshit",
      position: "Campus Coding Coach",
      program: "Taught Uniques 3.0",
      image: `${BASE_URL}/api/image-proxy/1kJKQdp3dPwF6f28yjS-EIf0m6SoChWvj`,
      bio: "Skilled student trainer breaking down complex C++ concepts into understandable lessons for fellow undergraduates.",
      expertise: ["C++", "OOP", "Problem Solving"],
      social: {
        linkedin: "https://www.linkedin.com/in/harshit-raj-b67361252/"
      },
      isIndustryPro: false
    },
    {
      id: 9,
      name: "Riya",
      position: "Programming Peer Leader",
      program: "Taught Uniques 3.0",
      image: `${BASE_URL}/api/image-proxy/1AhUVLUwrplop3WRvTsagm6aR6WPZaYOK`,
      bio: "Talented student mentor sharing practical C++ programming knowledge and fostering a collaborative learning environment.",
      expertise: ["C++", "STL", "Programming Logic"],
      social: {
        linkedin: "https://www.linkedin.com/in/riya-singh-5b71b7248/"
      },
      isIndustryPro: false
    },
    {
      id: 10,
      name: "Shreya",
      position: "Code Craft Ambassador",
      program: "Taught Uniques 3.0",
      image: `${BASE_URL}/api/image-proxy/1aF3Obu9-3OHz1cOmsFq2iB_8NA4RVMLQ`,
      bio: "Motivated student leader guiding peers through C++ programming concepts while developing her own competitive coding skills.",
      expertise: ["C++", "Competitive Programming", "Code Optimization"],
      social: {
        linkedin: "https://www.linkedin.com/in/shreya-mishra-471464216/"
      },
      isIndustryPro: false
    },
    {
      id: 11,
      name: "Laxmi",
      position: "Emerging Software Engineer & Mentor",
      program: "Taught Uniques 3.0",
      image: `${BASE_URL}/api/image-proxy/1LNk-bN89GS2JNlxTrp0dPGOeXgI2rL0O`,
      bio: "Promising student mentor passionate about practical C++ application development and helping others build their coding foundation.",
      expertise: ["C++", "App Development", "System Programming"],
      social: {
        linkedin: "https://www.linkedin.com/in/laxmi-rajput-b51452253/"
      },
      isIndustryPro: false
    },
    {
      id: 12,
      name: "Aryan Kamboj",
      position: "Frontend Innovation Champion",
      program: "Taught Uniques 3.0",
      image: `${BASE_URL}/api/image-proxy/1qoV-I6YPWaKM-58pOrWhLRHX8KIsRKv0`,
      bio: "Rising talent in React ecosystem development with a passion for teaching fellow students modern frontend techniques and architecture patterns.",
      expertise: ["React", "Next.js", "UI Architecture"],
      social: {
        linkedin: "https://www.linkedin.com/in/aryan-kammboz-110521252/"
      },
      isIndustryPro: false
    },
    {
      id: 13,
      name: "Niraj Gupta",
      position: "Web Development Star Mentor",
      program: "Taught Uniques 3.0",
      image: `${BASE_URL}/api/image-proxy/1NytyadYPCgmHJRz_5KNWG25FChu63ptB`,
      bio: "Ambitious student leader sharing full stack expertise with peers, focusing on creating complete web solutions from frontend to backend.",
      expertise: ["React", "Node.js", "Full Stack"],
      social: {
        linkedin: "https://www.linkedin.com/in/niraj-gupta-04b3ba255/"
      },
      isIndustryPro: false
    },
    {
      id: 14,
      name: "Kumar Sujal",
      position: "Emerging Web Technologies Coach",
      program: "Taught Uniques 3.0",
      image: `${BASE_URL}/api/image-proxy/1t4yp_I4NSXxR2af685GQAOw8mEed0QJ3`,
      bio: "Talented student mentor passionate about React and modern JavaScript frameworks, helping fellow students build interactive web experiences.",
      expertise: ["React", "JavaScript", "Web Development"],
      social: {
        linkedin: "https://www.linkedin.com/in/kumar-sujal/"
      },
      isIndustryPro: false
    }
  ];

  const industryPros = trainers.filter(trainer => trainer.isIndustryPro);
  const studentMentors = trainers.filter(trainer => !trainer.isIndustryPro);

  return (
    <section className="py-16 bg-[#f7f9fc]" id="trainers">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          {/* Tech-inspired section header */}
          <div className="inline-flex items-center px-4 py-1 bg-[#ca0019]/10 rounded-full mb-4">
            <span className="w-2 h-2 bg-[#ca0019] rounded-full mr-2"></span>
            <span className="text-sm font-mono text-[#ca0019] uppercase tracking-wider">Meet Our Mentors</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Learn from <span className="text-[#ca0019]">Industry Pros</span> & <span className="text-[#ca0019]">Rising Tech Talent</span>
          </h2>
          
          <p className="max-w-2xl mx-auto text-gray-600">
            Our unique blend of experienced professionals and passionate student mentors creates a dynamic learning environment that combines real-world expertise with fresh perspectives.
          </p>
        </div>

        {/* Industry pros section - always displayed as grid */}
        <div className="mb-12">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <span className="w-12 h-px bg-[#ca0019] mr-4"></span>
            Industry Professionals
            <span className="w-12 h-px bg-[#ca0019] ml-4"></span>
          </h3>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2">
            {industryPros.map((trainer) => (
              <div key={trainer.id} className="h-full">
                <TrainerCard trainer={trainer} />
              </div>
            ))}
          </div>
        </div>
        
        {/* Student mentors section */}
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <span className="w-12 h-px bg-[#ca0019] mr-4"></span>
            Student Tech Mentors
            <span className="w-12 h-px bg-[#ca0019] ml-4"></span>
          </h3>
          
          {!showAllMentors ? (
            <div className="relative">
              {/* Carousel container for student mentors */}
              <div className="overflow-hidden" ref={studentMentorsRef}>
                <div className="flex -ml-4">
                  {studentMentors.slice(0, 6).map((trainer) => (
                    <div className="flex-shrink-0 pl-4 w-full sm:w-1/2 lg:w-1/3 h-auto" key={trainer.id}>
                      <TrainerCard trainer={trainer} />
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Navigation buttons with tech styling */}
              <button
                className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-10 h-10 rounded-md bg-white shadow-lg flex items-center justify-center z-10 transition-all duration-300 border border-gray-100 focus:outline-none
                  ${!studentPrevEnabled ? 'opacity-40 cursor-not-allowed' : 'opacity-100 hover:border-[#ca0019] hover:text-[#ca0019]'}`}
                onClick={scrollStudentPrev}
                disabled={!studentPrevEnabled}
                aria-label="Previous"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <button
                className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-10 h-10 rounded-md bg-white shadow-lg flex items-center justify-center z-10 transition-all duration-300 border border-gray-100 focus:outline-none
                  ${!studentNextEnabled ? 'opacity-40 cursor-not-allowed' : 'opacity-100 hover:border-[#ca0019] hover:text-[#ca0019]'}`}
                onClick={scrollStudentNext}
                disabled={!studentNextEnabled}
                aria-label="Next"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            
              {/* Tech-styled pagination dots */}
              <div className="flex justify-center mt-8">
                {studentScrollSnaps.map((_, index) => (
                  <button
                    key={index}
                    className={`mx-1 w-8 h-2 rounded-sm transition-all duration-300 focus:outline-none
                      ${index === studentSelectedIndex ? 'bg-[#ca0019]' : 'bg-gray-300 hover:bg-gray-400'}`}
                    onClick={() => studentMentorsEmbla?.scrollTo(index)}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {studentMentors.map((trainer) => (
                <div key={trainer.id} className="h-full">
                  <TrainerCard trainer={trainer} />
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Tech-styled CTA button */}
        <div className="mt-10 text-center">
          <button 
            onClick={() => setShowAllMentors(!showAllMentors)}
            className="inline-flex items-center px-6 py-3 bg-white border-2 border-[#ca0019] text-[#ca0019] font-medium rounded-lg hover:bg-[#ca0019] hover:text-white transition-all duration-300 group"
          >
            <span className="font-mono mr-2">&lt;</span>
            {showAllMentors ? 'Show Featured Student Mentors' : 'View All Student Mentors'}
            <span className="font-mono ml-2 group-hover:ml-3 transition-all duration-300">/&gt;</span>
          </button>
        </div>
      </div>
    </section>
  );
};

export default Trainers;
