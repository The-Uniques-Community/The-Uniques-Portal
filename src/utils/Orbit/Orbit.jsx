import { Box } from "@mui/material";
import { useEffect, useState } from "react";

const Orbit = () => {
  const orbitImages = {
    orbit1: [
      "https://kmz0l2g36g.ufs.sh/f/szSqTLNNPY1r5DgQ6rMC9pHMzvDGXT0OePm1Af7nSFktqrKE",
      "https://kmz0l2g36g.ufs.sh/f/szSqTLNNPY1rMgFO8eLWdDamT6yfgG0XqbJreRNHV1IWUo4v",
    ],
    orbit2: [
      "https://kmz0l2g36g.ufs.sh/f/szSqTLNNPY1rPoSO9PtUGhDgAYWEQrmjToyf265tVLilMXkq",
      "https://kmz0l2g36g.ufs.sh/f/szSqTLNNPY1rHXhtqGF2pQE4PFU7NAMVr6YeWicz5h1KuJtO",
      "https://kmz0l2g36g.ufs.sh/f/szSqTLNNPY1rAlgoP8AcYnIQDTmzWgy0bcOvPRLxFCXr97NJ",
    ],
    orbit3: [
      "https://kmz0l2g36g.ufs.sh/f/szSqTLNNPY1rAlEKhmxcYnIQDTmzWgy0bcOvPRLxFCXr97NJ",
      "https://kmz0l2g36g.ufs.sh/f/szSqTLNNPY1rZRXdWk5u5EX8WvoJFfcTUzjktrmd2HinqepN",
    ],
  };

  // Use state to track container size for responsive scaling
  const [containerSize, setContainerSize] = useState(640);
  
  // Update container size based on viewport width - REDUCED SIZES FOR SMALL SCREENS
  useEffect(() => {
    const updateSize = () => {
      const width = window.innerWidth;
      // Scale container based on viewport width
      if (width <= 320) {
        setContainerSize(260); // Reduced to prevent overflow
      } else if (width <= 480) {
        setContainerSize(320); // Reduced for better fit on small screens
      } else if (width <= 640) {
        setContainerSize(380); // Slightly reduced
      } else if (width <= 768) {
        setContainerSize(500);
      } else {
        setContainerSize(640);
      }
    };
    
    // Set initial size
    updateSize();
    
    // Add resize listener
    window.addEventListener('resize', updateSize);
    
    // Clean up
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Calculate orbit sizes with increased spacing but proportional to new container
  const orbit1Size = containerSize * 0.48;
  const orbit2Size = containerSize * 0.68;
  const orbit3Size = containerSize * 0.88;
  
  // Calculate image sizes based on container - INCREASED SIZES
  const centerImgSize = containerSize * 0.30;
  const orbitImgSize = containerSize * 0.12;

  return (
    <Box 
      className="relative flex items-center justify-center w-full mx-auto overflow-hidden" 
      style={{ 
        height: `${containerSize}px`,
        maxWidth: `${containerSize}px`, // Ensure the width matches height
      }}
    >
      {/* Central Image */}
      <Box 
        className="rounded-full overflow-hidden border-4 border-[#CA0019] shadow-xl z-50"
        style={{ width: `${centerImgSize}px`, height: `${centerImgSize}px` }}
      >
        <img
          src="https://kmz0l2g36g.ufs.sh/f/szSqTLNNPY1rlR7SxkaDUGg9bVAsZXHF3tBm5WnhfKIypS2e"
          alt="Center"
          className="w-full h-full object-cover"
        />
      </Box>

      {/* Orbit 1 - Innermost */}
      <Box 
        className="absolute rounded-full border-2 border-dashed border-gray-300 animate-orbit-slow"
        style={{ 
          width: `${orbit1Size}px`, 
          height: `${orbit1Size}px` 
        }}
      >
        {orbitImages.orbit1.map((src, i) => (
          <Box
            key={i}
            className="absolute rounded-full overflow-hidden shadow-md border-2 border-white hover:scale-110 transition-transform"
            style={{
              width: `${orbitImgSize}px`,
              height: `${orbitImgSize}px`,
              top: `${50 + 45 * Math.sin((i / orbitImages.orbit1.length) * 2 * Math.PI)}%`,
              left: `${50 + 45 * Math.cos((i / orbitImages.orbit1.length) * 2 * Math.PI)}%`,
              transform: "translate(-50%, -50%)",
            }}
          >
            <img src={src} alt={`Orbit1-${i}`} className="w-full h-full object-cover" />
          </Box>
        ))}
      </Box>

      {/* Orbit 2 - Middle */}
      <Box 
        className="absolute rounded-full border-2 border-dashed border-gray-300 animate-orbit-medium"
        style={{ 
          width: `${orbit2Size}px`, 
          height: `${orbit2Size}px` 
        }}
      >
        {orbitImages.orbit2.map((src, i) => (
          <Box
            key={i}
            className="absolute rounded-full overflow-hidden shadow-md border-2 border-white hover:scale-110 transition-transform"
            style={{
              width: `${orbitImgSize}px`,
              height: `${orbitImgSize}px`,
              top: `${50 + 47 * Math.sin((i / orbitImages.orbit2.length) * 2 * Math.PI)}%`,
              left: `${50 + 47 * Math.cos((i / orbitImages.orbit2.length) * 2 * Math.PI)}%`,
              transform: "translate(-50%, -50%)",
            }}
          >
            <img src={src} alt={`Orbit2-${i}`} className="w-full h-full object-cover" />
          </Box>
        ))}
      </Box>

      {/* Orbit 3 - Outermost */}
      <Box 
        className="absolute rounded-full border-2 border-dashed border-gray-300 animate-orbit-fast"
        style={{ 
          width: `${orbit3Size}px`, 
          height: `${orbit3Size}px` 
        }}
      >
        {orbitImages.orbit3.map((src, i) => (
          <Box
            key={i}
            className="absolute rounded-full overflow-hidden shadow-md border-2 border-white hover:scale-110 transition-transform"
            style={{
              width: `${orbitImgSize}px`,
              height: `${orbitImgSize}px`,
              top: `${50 + 49 * Math.sin((i / orbitImages.orbit3.length) * 2 * Math.PI)}%`,
              left: `${50 + 49 * Math.cos((i / orbitImages.orbit3.length) * 2 * Math.PI)}%`,
              transform: "translate(-50%, -50%)",
            }}
          >
            <img src={src} alt={`Orbit3-${i}`} className="w-full h-full object-cover" />
          </Box>
        ))}
      </Box>

      {/* CSS animations */}
      <style jsx="true">{`
        @keyframes orbit-slow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes orbit-medium {
          0% { transform: rotate(360deg); }
          100% { transform: rotate(0deg); }
        }
        @keyframes orbit-fast {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .animate-orbit-slow {
          animation: orbit-slow 30s linear infinite;
        }
        .animate-orbit-medium {
          animation: orbit-medium 25s linear infinite;
        }
        .animate-orbit-fast {
          animation: orbit-fast 20s linear infinite;
        }
      `}</style>
    </Box>
  );
};

export default Orbit;
