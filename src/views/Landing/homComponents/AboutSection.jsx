import React, { useLayoutEffect, useRef } from "react";
import { Groups, VolunteerActivism, Diversity3, Handshake, TipsAndUpdates } from "@mui/icons-material";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const features = [
  {
    icon: <Groups fontSize="large" />,
    title: "Community Engagement",
    description: "Bringing people together through events and support.",
  },
  {
    icon: <VolunteerActivism fontSize="large" />,
    title: "Volunteer Programs",
    description: "Join hands to make a difference with impactful initiatives.",
  },
  {
    icon: <TipsAndUpdates fontSize="large" />,
    title: "Skill Development",
    description: "Bridge the gap between theory and real-world practice.",
  },
  {
    icon: <Diversity3 fontSize="large" />,
    title: "Inclusive Environment",
    description: "A welcoming space for everyone, regardless of background.",
  },
  {
    icon: <Handshake fontSize="large" />,
    title: "Collaboration",
    description: "Partner with others to drive meaningful community change.",
  }
];

const FeatureCard = ({ feature, index, align = "center", className = "", cardRef, isPrimary = false }) => {
  const isRight = align === "right";
  const isLeft = align === "left";
  
  const alignmentClass = isRight ? "items-end text-right" : isLeft ? "items-start text-left" : "items-center text-center";
  const badgeClass = isRight ? "-top-3 -right-3 rotate-12" : isLeft ? "-top-3 -left-3 -rotate-12" : "-top-3 -left-3 -rotate-12";
  const ghostNumClass = isRight ? "left-8" : "right-8";

  return (
    <div 
      ref={cardRef}
      style={{ willChange: "transform, opacity" }}
      className={`relative flex flex-col ${alignmentClass} p-10 rounded-[2.5rem] ${isPrimary ? 'bg-red-800 text-white border-red-700 shadow-[0_30px_60px_-12px_rgba(202,0,25,0.3),0_18px_36px_-18px_rgba(0,0,0,0.2)]' : 'bg-white text-gray-900 border-gray-100/50 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.08),0_10px_30px_-10px_rgba(0,0,0,0.03)]'} border group transition-all duration-500 hover:-translate-y-3 max-w-[340px] ${className}`}
    >
      {/* Optimized Hover Glow */}
      {!isPrimary && <div className="absolute inset-0 rounded-[2.5rem] bg-red-600/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />}
      
      {/* Large Background Number */}
      <div className={`absolute top-4 ${ghostNumClass} text-7xl font-black ${isPrimary ? 'text-white opacity-[0.05]' : 'text-neutral-100 opacity-[0.05] group-hover:opacity-[0.1]'} transition-opacity duration-500 pointer-events-none select-none uppercase`}>
        {String(index + 1).padStart(2, '0')}
      </div>

      {/* Numbering Badge */}
      <div className={`absolute ${badgeClass} w-12 h-12 rounded-2xl ${isPrimary ? 'bg-white text-red-800' : 'bg-red-800 text-white'} flex items-center justify-center font-black text-xl shadow-xl transition-transform duration-300 z-20 group-hover:rotate-0 group-hover:scale-110`}>
        {index + 1}
      </div>

      <div className={`p-6 rounded-[1.5rem] ${isPrimary ? 'bg-white/10' : 'bg-red-50'} mb-6 group-hover:${isPrimary ? 'bg-white' : 'bg-red-800'} transition-all duration-500 relative z-10`}>
        <div className={`${isPrimary ? 'text-white' : 'text-red-800'} group-hover:${isPrimary ? 'text-red-800' : 'text-white'} transition-colors duration-500 scale-110`}>
          {feature.icon}
        </div>
      </div>
      
      <h3 className={`text-xl font-bold mb-3 ${isPrimary ? 'text-white' : 'group-hover:text-red-800'} transition-colors duration-500 tracking-tight relative z-10`}>{feature.title}</h3>
      <p className={`text-sm ${isPrimary ? 'text-red-50' : 'text-gray-500'} leading-relaxed font-medium relative z-10`}>{feature.description}</p>

      {/* Bottom Accent */}
      <div className={`absolute bottom-6 ${isRight ? "right-10" : isLeft ? "left-10" : "left-1/2 -translate-x-1/2"} w-8 h-1 ${isPrimary ? 'bg-white/20' : 'bg-gray-200'} rounded-full group-hover:w-24 group-hover:${isPrimary ? 'bg-white' : 'bg-red-800'} transition-all duration-500`} />
    </div>
  );
};

const AboutSection = () => {
  const sectionRef = useRef(null);
  const leftTextRef = useRef(null);
  const rightTextRef = useRef(null);
  const headerLeftRef = useRef(null);
  const headerRightRef = useRef(null);
  const bridgeRef = useRef(null);
  const cardRefs = useRef([]);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(leftTextRef.current, {
        yPercent: -15,
        force3D: true,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 0.5,
        }
      });

      gsap.to(rightTextRef.current, {
        yPercent: 15,
        force3D: true,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 0.5,
        }
      });

      gsap.from([headerLeftRef.current, headerRightRef.current], {
        y: 30,
        opacity: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: "power2.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 85%",
        }
      });

      gsap.fromTo(bridgeRef.current, 
        { scaleX: 0 },
        { 
          scaleX: 1, 
          ease: "none",
          force3D: true,
          scrollTrigger: {
            trigger: bridgeRef.current,
            start: "top 95%",
            end: "bottom 30%",
            scrub: 0.8,
          }
        }
      );

      cardRefs.current.forEach((card, i) => {
        if (!card) return;
        gsap.from(card, {
          y: 40,
          opacity: 0,
          duration: 0.6,
          ease: "power2.out",
          force3D: true,
          scrollTrigger: {
            trigger: card,
            start: "top 90%",
            toggleActions: "play none none reverse"
          }
        });
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={sectionRef} className="bg-transparent text-gray-900 py-24 lg:py-48 px-6 relative overflow-hidden">
      {/* Decorative Background Elements */}
      
      {/* Background Text */}
      <div ref={leftTextRef} className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-[35%] text-[10rem] lg:text-[18rem] font-black text-neutral-100 select-none pointer-events-none uppercase tracking-tighter -rotate-90 origin-center whitespace-nowrap">
        The Uniques
      </div>

      <div ref={rightTextRef} className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-[35%] text-[10rem] lg:text-[18rem] font-black text-neutral-100 select-none pointer-events-none uppercase tracking-tighter rotate-90 origin-center whitespace-nowrap">
        Community
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header Section */}
        <div className="flex flex-col gap-10 lg:gap-6 mb-20">
          <div ref={headerLeftRef} className="text-left max-w-4xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-1 h-6 bg-red-600 rounded-full" />
              <h4 className="text-sm uppercase tracking-[0.3em] font-black text-red-600">About Our Community</h4>
            </div>
            <h2 className="text-4xl lg:text-7xl font-black leading-tight text-neutral-900 mb-6 whitespace-nowrap overflow-visible">
              The <span className="brush-bg text-white">Uniques</span> Community
            </h2>
            <h2 className="text-3xl lg:text-5xl font-black text-neutral-300">
              Learn, Build, and Grow Together.
            </h2>
          </div>

          <div ref={headerRightRef} className="flex flex-col items-end text-right self-end mt-12 lg:mt-0">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-24 h-px bg-red-800/10" />
              <div className="w-2 h-2 rounded-full bg-red-800/20" />
            </div>
            <p className="text-xl text-gray-400 leading-relaxed font-medium max-w-3xl italic">
              "The Uniques Community is a global hub where everyone is welcome. We empower students to bridge the gap between 
              theory and practice through peer-to-peer learning and real-world solutions."
            </p>
          </div>
        </div>

        {/* H-Shape Features Layout */}
        <div className="relative">
          <div className="text-center mb-32">
             <div className="inline-flex flex-col items-center">
               <h3 className="text-2xl font-black text-neutral-200 uppercase tracking-[0.4em] relative">
                 Our Main Focus
               </h3>
               <div className="mt-4 flex gap-2">
                 <div className="w-12 h-1 bg-red-800/10 rounded-full" />
                 <div className="w-3 h-1 bg-red-800/30 rounded-full" />
                 <div className="w-12 h-1 bg-red-800/10 rounded-full" />
               </div>
             </div>
          </div>

          <div className="hidden lg:flex justify-between items-center relative gap-4">
            <div className="flex flex-col gap-32">
              <FeatureCard cardRef={el => cardRefs.current[0] = el} feature={features[0]} index={0} align="right" />
              <FeatureCard cardRef={el => cardRefs.current[1] = el} feature={features[1]} index={1} align="right" />
            </div>

            <div className="flex items-center flex-1 justify-center relative">
               <div ref={bridgeRef} className="absolute left-0 right-0 h-[2px] bg-red-800/10 top-1/2 -translate-y-1/2 -z-10 w-full origin-left" />
               <FeatureCard cardRef={el => cardRefs.current[2] = el} feature={features[2]} index={2} align="center" isPrimary={true} className="z-10" />
            </div>

            <div className="flex flex-col gap-32">
              <FeatureCard cardRef={el => cardRefs.current[3] = el} feature={features[3]} index={3} align="left" />
              <FeatureCard cardRef={el => cardRefs.current[4] = el} feature={features[4]} index={4} align="left" />
            </div>
          </div>

          <div className="lg:hidden grid grid-cols-1 md:grid-cols-2 gap-20 place-items-center">
            {features.map((feature, index) => (
              <FeatureCard key={index} feature={feature} index={index} align="center" isPrimary={index === 2} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutSection;
