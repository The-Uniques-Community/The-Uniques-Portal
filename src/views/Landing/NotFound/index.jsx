import { Button } from "@mui/material";
import bg from "@/assets/img/404bg.jpg";
import { useEffect, useState } from "react";

const NotFound = () => {
  const [windowHeight, setWindowHeight] = useState("100vh");

  // Handle mobile browsers with dynamic viewport heights
  useEffect(() => {
    const updateHeight = () => {
      setWindowHeight(`${window.innerHeight}px`);
    };
    
    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, []);

  return (
    <div 
      className="relative flex flex-col items-center justify-center w-full text-center px-4 bg-gray-50"
      style={{ minHeight: windowHeight }}
    >
      {/* Background image container with proper overlay */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gray-900 opacity-40 z-10"></div>
        <img 
          src={bg} 
          alt="Background" 
          className="w-full h-full object-cover"
        />
      </div>

      {/* Content container with proper z-index */}
      <div className="relative z-20 max-w-lg mx-auto py-12">
        <p className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-bold text-red-600 drop-shadow-lg">
          404
        </p>
        
        <p className="mt-6 text-lg sm:text-xl md:text-2xl font-semibold text-white drop-shadow-md">
          Sorry, the page can't be found
        </p>
        
        <p className="mt-4 text-sm sm:text-base md:text-lg text-gray-100 drop-shadow-sm">
          The page you were looking for appears to have been moved, deleted, or
          does not exist.
        </p>
        
        <Button 
          variant="contained" 
          color="primary" 
          size="large"
          sx={{ 
            mt: { xs: 4, sm: 6 },
            px: { xs: 3, sm: 4 },
            py: { xs: 1, sm: 1.5 },
            fontSize: { xs: '0.9rem', sm: '1rem' },
            boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
          }} 
          href="/"
        >
          Back to homepage
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
