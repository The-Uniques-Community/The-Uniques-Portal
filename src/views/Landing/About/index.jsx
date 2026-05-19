import React from "react";
import ModernHeader from "@/utils/Header/ModernHeader";
import Second from "./componants/Batches";
import Third from "./componants/Third";
import Fourth from "./componants/Fourth";
import Fifth from "./componants/Fifth";
import Mentor from "./componants/Mentor";
import TrainingTabs from "./componants/TraningModel";
import VisionMission from "./componants/Vision";
import Testimonial from "./componants/Testimonial";
import Faq from "./componants/Faq";
import CallToAction from "../homComponents/CallToAction";



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
