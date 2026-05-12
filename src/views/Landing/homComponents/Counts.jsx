import React, { useEffect, useRef, useState } from 'react';
import { Users, Lightbulb, BarChart, Calendar } from 'lucide-react';

const Counts = () => {
  const sectionRef = useRef(null);
  const [statsVisible, setStatsVisible] = useState(false);
  const [counters, setCounters] = useState({ Earnings: 0, Clients: 0, Projects: 0, Events: 0 });
  const [animationComplete, setAnimationComplete] = useState(false);

  // Use Intersection Observer to detect when stats are visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStatsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  // Counter animation
  useEffect(() => {
    if (statsVisible && !animationComplete) {
      const duration = 2500;
      const frameDuration = 1000 / 60;
      const totalFrames = Math.round(duration / frameDuration);

      const finalValues = {
        Earnings: 860000,
        Clients: 100,
        Projects: 150,
        Events: 40
      };

      let frame = 0;
      const counter = setInterval(() => {
        frame++;
        const progress = frame / totalFrames;
        const easeOutQuint = 1 - Math.pow(1 - progress, 5); // Smoother easing

        setCounters({
          Earnings: Math.floor(easeOutQuint * finalValues.Earnings),
          Clients: Math.floor(easeOutQuint * finalValues.Clients),
          Projects: Math.floor(easeOutQuint * finalValues.Projects),
          Events: Math.floor(easeOutQuint * finalValues.Events)
        });

        if (frame === totalFrames) {
          clearInterval(counter);
          setAnimationComplete(true);
        }
      }, frameDuration);

      return () => clearInterval(counter);
    }
  }, [statsVisible, animationComplete]);

  const stats = [
    {
      value: counters.Earnings,
      label: "Revenue Generated",
      icon: <BarChart className="h-5 w-5" />,
      prefix: "₹",
    },
    {
      value: counters.Clients,
      label: "Tech Partners",
      icon: <Users className="h-5 w-5" />,
      prefix: "",
    },
    {
      value: counters.Projects,
      label: "Projects Delivered",
      icon: <Lightbulb className="h-5 w-5" />,
      prefix: "",
    },
    {
      value: counters.Events,
      label: "Community Events",
      icon: <Calendar className="h-5 w-5" />,
      prefix: "",
    }
  ];

  return (
    <section ref={sectionRef} className="py-20 bg-transparent relative overflow-hidden">
      {/* Enhanced background elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#ca0019]/5 rounded-full -z-10"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#ca0019]/5 rounded-full -z-10"></div>
      
      {/* Additional decorative elements */}
      <div className="absolute top-20 left-10 w-24 h-24 border border-[#ca0019]/10 rounded-xl rotate-12 -z-10"></div>
      <div className="absolute bottom-20 right-10 w-32 h-32 border border-[#ca0019]/10 rounded-xl -rotate-12 -z-10"></div>
      <div className="absolute top-40 right-1/4 w-8 h-8 border border-[#ca0019]/20 rounded-full -z-10"></div>
      
      {/* Dot pattern */}
      <div className="absolute inset-0 opacity-5 -z-10" 
        style={{ 
          backgroundImage: 'radial-gradient(#ca0019 1px, transparent 1px)', 
          backgroundSize: '40px 40px' 
        }}>
      </div>
      
      {/* Small decorative dots */}
      <div className="absolute top-1/2 left-1/4 w-2 h-2 bg-[#ca0019]/30 rounded-full -z-10"></div>
      <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-[#ca0019]/20 rounded-full -z-10"></div>
      <div className="absolute bottom-1/4 left-1/3 w-4 h-4 bg-[#ca0019]/10 rounded-full -z-10"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Enhanced heading with decorative elements */}
        <div className="text-center mb-16 relative">
          <div className="inline-block relative">
            <h2 className="text-sm font-semibold text-[#ca0019] uppercase tracking-wide mb-2 relative z-10">
              Our Achievements
            </h2>
            <div className="absolute h-2 w-full bottom-0 left-0 bg-[#ca0019]/10 -z-0"></div>
          </div><br/><br/>
          <p className="text-3xl sm:text-4xl font-bold text-gray-900 relative inline-block">
            <span className="pb-1">Making an </span>
            <span className="">Impact</span>
            <span className="absolute -right-6 -top-6 text-6xl text-[#ca0019]/5 font-serif">&#8221;</span>
          </p>
        </div>

        {/* Enhanced stats grid */}
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <div 
              key={index} 
              className={`transition-all duration-500 ${
                statsVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
              }`} 
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              {/* Improved card with more initial visual interest */}
              <div className="bg-white/60 backdrop-blur-lg p-6 rounded-lg shadow-[0_4px_20px_-4px_rgba(202,0,25,0.1)] hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border border-white/40 group relative overflow-hidden">
                {/* Card corner accent (visible without hover) */}
                <div className="absolute top-0 right-0 w-16 h-16">
                  <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-[#ca0019]/5 to-transparent"></div>
                  <div className="absolute top-0 right-0 w-4 h-4 bg-[#ca0019]/10 rounded-bl-xl"></div>
                </div>
                
                {/* Fancier icon with animation */}
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#ca0019]/20 to-[#ca0019]/10 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                    <span className="text-[#ca0019] group-hover:rotate-12 transition-transform duration-300">{stat.icon}</span>
                  </div>
                  <div className="h-px flex-grow bg-gradient-to-r from-[#ca0019]/30 via-gray-200 to-transparent"></div>
                </div>
                
                {/* Enhanced typography with subtle animations */}
                <div className="mb-3 group-hover:translate-x-1 transition-transform duration-300">
                  <span className="text-4xl font-bold text-gray-900 relative">
                    {stat.prefix}{stat.value.toLocaleString()}
                    <span className="text-lg font-medium text-[#ca0019] ml-1 absolute -right-4 animate-pulse">+</span>
                  </span>
                </div>
                
                <p className="text-sm text-gray-600 font-medium">{stat.label}</p>
                
                {/* Subtle decorative corner element */}
                <div className="absolute -bottom-10 -right-10 w-20 h-20 bg-[#ca0019]/5 rounded-full transition-opacity duration-300 opacity-10 group-hover:opacity-100"></div>
                
                {/* Bottom line - partially visible by default */}
                <div className="absolute bottom-0 left-0 h-0.5 w-1/5 bg-[#ca0019]/30 group-hover:w-full group-hover:bg-[#ca0019] transition-all duration-500 ease-out"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Enhanced footer element */}
      <div className="mt-20 relative">
        <div className="absolute left-1/2 -translate-x-1/2 top-0 w-24 h-px bg-gradient-to-r from-transparent via-[#ca0019]/30 to-transparent"></div>
        <div className="absolute left-1/2 -translate-x-1/2 top-0 w-3 h-3 bg-white border-2 border-[#ca0019]/30 rounded-full -mt-1.5"></div>
      </div>
    </section>
  );
};

export default Counts;
