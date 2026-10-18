import React from "react";
import ModernHeader from "@/components/headers/ModernHeader";
import Second from "./components/Batches";
import Third from "./components/Third";
import Fourth from "./components/Fourth";
import Fifth from "./components/Fifth";
import Mentor from "./components/Mentor";
import TrainingTabs from "./components/TraningModel";
import VisionMission from "./components/Vision";
import Testimonial from "./components/Testimonial";
import Faq from "./components/Faq";
import CallToAction from "../homeComponents/CallToAction";



const index = () => {
  return (
    <div>
      <ModernHeader 
        title="More Than a Community → The Uniques ✦"
        subtitle="Welcome to the About page of The Uniques Community."
      />
      <Second />
      {/* <Third/> */}
      {/* <Fourth /> */}
      <Fifth />
      <TrainingTabs />
      <VisionMission />
      <Mentor />
     
      <Testimonial />
      <Faq />
      <CallToAction />

      
    </div>
  );
};

export default index;
