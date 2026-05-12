import React from "react";
import router from "@/routes";
import { RouterProvider } from "react-router-dom";
import GridBackground from "./utils/GridBackground.jsx/GridBackground";


const App = () => {
  return (
    <div className="relative overflow-hidden">
      {/* Global grid hover effect */}
      <GridBackground/>
      
      {/* Main app content */}
      <div className="relative z-10">
        <RouterProvider router={router} />
      </div>
    </div>
  );
};

export default App;
