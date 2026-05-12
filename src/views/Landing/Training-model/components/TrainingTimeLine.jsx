import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { useScroll, useTransform, motion } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const logos = [
  "https://tailoredpaw.com/cdn/shop/files/Tailored_1_60x@2x.svg?v=1692629825",
  "https://greycat.digital/assets/images/logo/logo-black.png",
  "https://goalphakids.com/wp-content/themes/go_alpha/assets/images/site-logo.png",
  "https://sgp1.digitaloceanspaces.com/gulftimemedia/gulftimemedia.com/static/assets/images/logo/header.webp?AWSAccessKeyId=DO00PZLRB67E3A847CRP&Signature=oEgVlGerpXLfs4tQ264dxYNS3Kc%3D&Expires=1745389192",
  "https://05h0tt171l.ufs.sh/f/9WspmJu6ypQvEqokRGgtO8RGNpF6JBKc4CzbyiAsfLIqYvMQ",
  "https://abroadeducares.com/_next/static/media/blackLogo.667801bb.png",
  "https://ais.ac.in/Assets/Images/ais_logo1-1%201%20copy.png",
  "https://www.sviet.ac.in/_next/image?url=%2F_next%2Fstatic%2Fmedia%2FLogo.8bdb37ea.webp&w=1200&q=75",
  "https://05h0tt171l.ufs.sh/f/9WspmJu6ypQvzpLCCVlWnGpTC98Himu2RrqelvP14tsOXLEj",
];

// Function to get 4 random logos
const getRandomLogos = () => {
  const shuffled = [...logos].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 4);
};

export const Timeline = ({ data }) => {
  const ref = useRef(null);
  const containerRef = useRef(null);
  const [height, setHeight] = useState(0);
  const [randomLogosPerYear, setRandomLogosPerYear] = useState([]);

  useEffect(() => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setHeight(rect.height);
    }
    
    // Generate random logos for each year only once
    const logosForYears = data.map(() => getRandomLogos());
    setRandomLogosPerYear(logosForYears);
  }, [ref, data.length]);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 10%", "end 90%"],
  });

  const heightTransform = useTransform(scrollYProgress, [0, 1], [0, height]);
  const opacityTransform = useTransform(scrollYProgress, [0, 0.1], [0, 1]);

  return (
    <div className="w-full bg-white font-sans md:px-10" ref={containerRef}>
      <div ref={ref} className="relative max-w-7xl mx-auto pb-20">
        {data.map((item, index) => (
          <div
            key={index}
            className="flex justify-start pt-10 md:pt-40 md:gap-10"
          >
            <div className="sticky flex flex-col md:flex-row z-40 items-center top-40 self-start max-w-xs lg:max-w-sm md:w-full">
              <div className="h-10 absolute left-3 md:left-3 w-10 rounded-full bg-white flex items-center justify-center">
                <div className="h-4 w-4 rounded-full bg-neutral-200 border border-neutral-300 p-2" />
              </div>
              <h3 className="hidden md:block text-xl md:pl-20 md:text-5xl font-bold text-black">
                {item.title}
              </h3>
            </div>

            <div className="relative pl-20 pr-4 md:pl-4 w-full">
              <h3 className="text-4xl mb-4 text-left font-bold text-black">
                {item.subtitle}
              </h3>
              {item.content}
              
              {/* Circular Logos - Now responsive and only showing 4 per year */}
              <div className="mt-6 flex gap-3 sm:gap-4 flex-wrap">
                {randomLogosPerYear[index]?.map((src, i) => (
                  <div key={i} className="flex items-center justify-center">
                    <img
                      src={src}
                      alt={`Logo ${i + 1}`}
                      className="h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 object-contain bg-white p-1 rounded-full border border-gray-200 shadow-sm hover:shadow-md transition-all"
                    />
                  </div>
                ))}
              </div>

              {/* Know More Link */}
              <div className="mt-4">
                <a
                  href="https://05h0tt171l.ufs.sh/f/9WspmJu6ypQvizdwIW978Rv4WqmO9xQA3anCSlou2g6pEINc"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#ca0019] text-sm underline font-medium hover:text-black transition-colors"
                >
                  Know More →
                </a>
              </div>
            </div>
          </div>
        ))}

        {/* Vertical Timeline Scroll Line */}
        <div
          style={{ height: height + "px" }}
          className="absolute md:left-8 left-8 top-0 overflow-hidden w-[2px] bg-[linear-gradient(to_bottom,var(--tw-gradient-stops))] from-transparent from-[0%] via-neutral-200 to-transparent to-[99%]  [mask-image:linear-gradient(to_bottom,transparent_0%,black_10%,black_90%,transparent_100%)] "
        >
          <motion.div
            style={{ height: heightTransform, opacity: opacityTransform }}
            className="absolute inset-x-0 top-0 w-[2px] bg-gradient-to-t from-red-500 via-red-300 to-transparent from-[0%] via-[10%] rounded-full"
          />
        </div>
      </div>
    </div>
  );
};

const trainingTimeline = [
  {
    title: "First Year",
    subtitle: "Technical & Soft Skills Development",
    content: (
      <>
        <strong>Key Skills Developed:</strong>
        <ul className="list-disc ml-5 mb-2">
          <li>Advanced image editing (Photoshop, Illustrator)</li>
          <li>Responsive front-end development</li>
          <li>UI/UX design principles</li>
          <li>Digital marketing strategies</li>
        </ul>
        <strong>Client Projects:</strong>
        <ul className="list-disc ml-5 mb-2">
          <li>4 local businesses - Website design & development</li>
          <li>2 startups - Brand identity creation</li>
          <li>3 e-commerce stores - UI/UX redesign</li>
        </ul>
        
        {/* Redesigned Revenue section */}
        <div className="mt-4 p-4 rounded-lg bg-gradient-to-r from-red-50 to-white border-l-4 border-red-500 shadow-sm">
          <h4 className="font-bold text-xl text-red-800 mb-2">Revenue Generated</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex items-center space-x-2">
              <span className="h-3 w-3 bg-red-500 rounded-full"></span>
              <span>Design Projects: <span className="font-semibold">₹85,000</span></span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="h-3 w-3 bg-red-400 rounded-full"></span>
              <span>Front-end Dev: <span className="font-semibold">₹35,000</span></span>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-red-200">
            <div className="flex justify-between items-center">
              <span className="font-bold text-red-800">Total Revenue:</span>
              <span className="font-bold text-xl text-red-800">₹1,20,000</span>
            </div>
          </div>
        </div>
      </>
    ),
  },
  {
    title: "Second Year",
    subtitle: "Programming & Data Management Solutions",
    content: (
      <>
        <strong>Key Skills Developed:</strong>
        <ul className="list-disc ml-5 mb-2">
          <li>Backend development (Node.js, Express)</li>
          <li>Database management (SQL/NoSQL)</li>
          <li>API design and implementation</li>
          <li>Data structures & algorithms</li>
        </ul>
        <strong>Client Projects:</strong>
        <ul className="list-disc ml-5 mb-2">
          <li>2 medium enterprises - Custom CRM solutions</li>
          <li>3 startups - Full-stack web applications</li>
          <li>1 educational institution - Student management system</li>
        </ul>
        
        {/* Redesigned Revenue section */}
        <div className="mt-4 p-4 rounded-lg bg-gradient-to-r from-red-50 to-white border-l-4 border-red-500 shadow-sm">
          <h4 className="font-bold text-xl text-red-800 mb-2">Revenue Generated</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex items-center space-x-2">
              <span className="h-3 w-3 bg-red-500 rounded-full"></span>
              <span>Backend Development: <span className="font-semibold">₹70,000</span></span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="h-3 w-3 bg-red-400 rounded-full"></span>
              <span>Database Solutions: <span className="font-semibold">₹45,000</span></span>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-red-200">
            <div className="flex justify-between items-center">
              <span className="font-bold text-red-800">Total Revenue:</span>
              <span className="font-bold text-xl text-red-800">₹1,15,000</span>
            </div>
          </div>
        </div>
      </>
    ),
  },
  {
    title: "Third Year",
    subtitle: "Advanced Technology Solutions",
    content: (
      <>
        <strong>Key Skills Applied:</strong>
        <ul className="list-disc ml-5 mb-2">
          <li>Scalable application architecture</li>
          <li>Cloud deployment (AWS, Azure)</li>
          <li>DevOps integration</li>
          <li>Mobile-responsive frameworks</li>
        </ul>
        <strong>Client Projects:</strong>
        <ul className="list-disc ml-5 mb-2">
          <li>1 fintech company - Payment gateway integration</li>
          <li>2 e-commerce businesses - Inventory management systems</li>
          <li>1 healthcare provider - Patient management portal</li>
        </ul>
        
        {/* Redesigned Revenue section */}
        <div className="mt-4 p-4 rounded-lg bg-gradient-to-r from-red-50 to-white border-l-4 border-red-500 shadow-sm">
          <h4 className="font-bold text-xl text-red-800 mb-2">Revenue Generated</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex items-center space-x-2">
              <span className="h-3 w-3 bg-red-500 rounded-full"></span>
              <span>System Integration: <span className="font-semibold">₹60,000</span></span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="h-3 w-3 bg-red-400 rounded-full"></span>
              <span>Custom Apps: <span className="font-semibold">₹40,000</span></span>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-red-200">
            <div className="flex justify-between items-center">
              <span className="font-bold text-red-800">Total Revenue:</span>
              <span className="font-bold text-xl text-red-800">₹1,00,000</span>
            </div>
          </div>
        </div>
      </>
    ),
  },
  {
    title: "Fourth Year",
    subtitle: "Enterprise Solutions & Emerging Tech",
    content: (
      <>
        <strong>Key Skills Applied:</strong>
        <ul className="list-disc ml-5 mb-2">
          <li>Blockchain development</li>
          <li>Smart contract implementation</li>
          <li>Enterprise system integration</li>
          <li>Advanced security protocols</li>
        </ul>
        <strong>Client Projects:</strong>
        <ul className="list-disc ml-5 mb-2">
          <li>1 supply chain company - Blockchain tracking solution</li>
          <li>2 financial institutions - Secure transaction systems</li>
          <li>1 government agency - Data security consultation</li>
        </ul>
        
        {/* Redesigned Revenue section */}
        <div className="mt-4 p-4 rounded-lg bg-gradient-to-r from-red-50 to-white border-l-4 border-red-500 shadow-sm">
          <h4 className="font-bold text-xl text-red-800 mb-2">Revenue Generated</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex items-center space-x-2">
              <span className="h-3 w-3 bg-red-500 rounded-full"></span>
              <span>Blockchain: <span className="font-semibold">₹45,000</span></span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="h-3 w-3 bg-red-400 rounded-full"></span>
              <span>Security Consulting: <span className="font-semibold">₹20,000</span></span>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-red-200">
            <div className="flex justify-between items-center">
              <span className="font-bold text-red-800">Total Revenue:</span>
              <span className="font-bold text-xl text-red-800">₹65,000</span>
            </div>
          </div>
          
          {/* Total Revenue Summary */}
          <div className="mt-4 p-3 bg-gradient-to-r from-red-100 to-red-50 rounded-lg border border-red-200">
            <div className="flex flex-col sm:flex-row justify-between items-center">
              <span className="font-bold text-lg sm:text-xl text-red-900">Total Revenue To Date:</span>
              <span className="font-bold text-2xl text-red-900">₹4,00,000+</span>
            </div>
            <p className="text-sm text-red-700 mt-1 text-center sm:text-right">
              From 21 client projects across various industries
            </p>
          </div>
        </div>
      </>
    ),
  },
  {
    title: "Specialized Services",
    subtitle: "High-Value Industry Solutions",
    content: (
      <>
        <strong>Specialized Expertise:</strong>
        <ul className="list-disc ml-5 mb-2">
          <li>Machine Learning & AI implementation</li>
          <li>Enterprise Java & Spring solutions</li>
          <li>Blockchain legal consulting</li>
          <li>Advanced data analytics with Power BI</li>
        </ul>
        <strong>Current Client Portfolio:</strong>
        <ul className="list-disc ml-5 mb-2">
          <li>2 enterprise clients - ML implementation</li>
          <li>3 legal firms - Blockchain consultation</li>
          <li>2 corporations - Business intelligence dashboards</li>
        </ul>
        
        {/* Ongoing Projects Value Section */}
        <div className="mt-4 p-4 rounded-lg bg-gradient-to-r from-red-50 to-white border-l-4 border-red-500 shadow-sm">
          <h4 className="font-bold text-xl text-red-800 mb-2">Ongoing Projects Value</h4>
          <div className="space-y-2">
            <div className="flex items-start space-x-2">
              <span className="mt-1.5 h-3 w-3 bg-red-500 rounded-full flex-shrink-0"></span>
              <span>Multiple long-term contracts with recurring revenue</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="mt-1.5 h-3 w-3 bg-red-400 rounded-full flex-shrink-0"></span>
              <span>Maintenance and support agreements with enterprise clients</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="mt-1.5 h-3 w-3 bg-red-300 rounded-full flex-shrink-0"></span>
              <span>Premium workshop and training services for tech teams</span>
            </div>
          </div>
        </div>
      </>
    ),
  },
];

export default function TrainingTimeLine() {
  return (
    <Timeline
      title="My Developer Journey"
      description="A timeline of key milestones in my development career."
      data={trainingTimeline}
    />
  );
} 
