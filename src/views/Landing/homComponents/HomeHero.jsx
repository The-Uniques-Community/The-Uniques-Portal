// import { Button } from '@mui/material';
import { ArrowForward } from '@mui/icons-material';
import Button from "@/utils/Buttons/Button"
import Marquee from 'react-fast-marquee';
import tu from '@/assets/logos/tu.png';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';

const images = [
  'https://kmz0l2g36g.ufs.sh/f/szSqTLNNPY1rEz8jr2og9AYBbcu0eXTH81rnVdpozvG6K4WI',
  'https://kmz0l2g36g.ufs.sh/f/szSqTLNNPY1rHptqDVpF2pQE4PFU7NAMVr6YeWicz5h1KuJt',
  'https://kmz0l2g36g.ufs.sh/f/szSqTLNNPY1rSSl9pOoaFDA2LEeO4I3rP8jBzJb7cltWkQRY',
  'https://kmz0l2g36g.ufs.sh/f/szSqTLNNPY1rPoSO9PtUGhDgAYWEQrmjToyf265tVLilMXkq',
  'https://kmz0l2g36g.ufs.sh/f/szSqTLNNPY1rAWGbiBcYnIQDTmzWgy0bcOvPRLxFCXr97NJo',
  'https://kmz0l2g36g.ufs.sh/f/szSqTLNNPY1rAlEKhmxcYnIQDTmzWgy0bcOvPRLxFCXr97NJ',
  'https://kmz0l2g36g.ufs.sh/f/szSqTLNNPY1r5DgQ6rMC9pHMzvDGXT0OePm1Af7nSFktqrKE',
  'https://kmz0l2g36g.ufs.sh/f/szSqTLNNPY1rQYCb4jAIOoVhWP9E5DamsTHKt6ZeSc3LAJly'
];

export default function Landing() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const heroRef = useRef(null);

  useEffect(() => {
    const updateDimensions = () => {
      if (heroRef.current) {
        setDimensions({
          width: heroRef.current.offsetWidth,
          height: heroRef.current.offsetHeight
        });
      }
    };

    const handleMouseMove = (event) => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        setMousePosition({ x, y });
      }
    };

    const heroElement = heroRef.current;
    if (heroElement) {
      heroElement.addEventListener('mousemove', handleMouseMove);
      updateDimensions();

      // Update dimensions on window resize
      window.addEventListener('resize', updateDimensions);
    }

    return () => {
      if (heroElement) {
        heroElement.removeEventListener('mousemove', handleMouseMove);
      }
      window.removeEventListener('resize', updateDimensions);
    };
  }, []);

  const cellSize = 50;

  // Calculate number of columns and rows needed to cover the entire container
  const columns = Math.ceil(dimensions.width / cellSize) + 1;
  const rows = Math.ceil(dimensions.height / cellSize) + 1;

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center bg-transparent relative" ref={heroRef}>
      {/* Decorative Square Grid (Left Side) - Commented out
      <div className="absolute left-8 md:left-16 top-1/2 -translate-y-1/2 hidden lg:grid grid-cols-4 gap-0 opacity-15 pointer-events-none group">
        {Array.from({ length: 20 }).map((_, i) => (
          <div 
            key={i} 
            className="w-14 h-14 border border-red-800/40 transition-all duration-300 hover:bg-red-800/10 hover:border-red-800/60 pointer-events-auto" 
          />
        ))}
      </div>
      */}

      {/* Content (z-index to place above grid) */}
      <div className="relative z-10 w-full flex flex-col items-center">
        <div className='text-lg font-medium'>
          <img className="w-10 h-10 object-center mx-auto object-contain" src={tu} alt="" />
          <span className='text-[#ca0019]'>The</span> Uniques Community
        </div>
        <div className="text-center px-6 pt-12 pb-10">
          <Link to="/events">
            <p className="text-sm font-medium px-2 py-1 border border-slate-400 bg-white rounded-full w-max mx-auto text-red-500 mb-2">View Our Vibrant Events ✨</p>
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-[1.4]">
            A Community of Creators, <br />
            <span className="brush-bg text-white [--brush-color:#ca0019] inline-block mt-2">Dreamers & Doers.</span>
          </h1>
          <p className="text-gray-600 my-4 max-w-2xl mx-auto">
            Experience tech like never before with The UNIQUES Community — vibrant events, hands-on sessions, and pure innovation.
          </p>
          <Button path="https://chat.whatsapp.com/HYOloogGXKcIkR83DnOjFj" bgColor="#ca0019" color="white" iconColor="black">
            Join Us
          </Button>
        </div>

        {/* Partner Logos */}
        <div className="flex flex-wrap justify-center gap-6 text-gray-400 text-sm mb-8">
          {[
            'Corporate Culture', 'Fullstack Developers', 'Future Leaders', 'Graphic Designers', 'Philanthropists',
            'Tech Enthusiasts', 'Visionaries', 'Web Developers', 'UI/UX Designers'
          ].map((brand, i) => (
            <span key={i}>{brand}</span>
          ))}
        </div>
      </div>

      {/* Image Carousel */}
      <div className="w-full overflow-hidden bg-gradient-to-t from-slate-100 to-white py-6 relative z-10">
        <Marquee gradient={false} speed={40}>
          <div className="flex gap-4">
            {images.concat(images).map((src, i) => (
              <div
                key={i}
                className="min-w-[280px] max-w-[290px] mx-3 h-[200px] rounded-xl overflow-hidden shadow-md bg-white"
              >
                <img
                  src={src}
                  alt={`carousel-${i}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </Marquee>
      </div>
    </div>
  );
}
