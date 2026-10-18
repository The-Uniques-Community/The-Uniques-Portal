import React, { useState } from "react";
import { useTheme } from "@mui/material/styles";

import CallToAction from "./homeComponents/CallToAction";

import AboutSection from "./homeComponents/AboutSection";
import TrainingTabs from "./homeComponents/TrainingTabs";

// import ShapedCard from "@/components/cards/ShapedCard";

import Gallery from "./homeComponents/Gallery";
import Counts from "./homeComponents/Counts";

import Startups from "./homeComponents/Startups";
import WhyUs from "./homeComponents/WhyUs";
// import TestimonialSectionCarousel from "./homeComponents/TestimonialCard";
import Batches from "./homeComponents/Batches";

import HomeHero from "./homeComponents/HomeHero";
import BlogSection from "./homeComponents/BlogSection";
import Event from "./homeComponents/Event";
import Highlight from "./homeComponents/Highlight";
// import Testimonial from "./homeComponents/TestimonialCard";
import Testimonials from "./homeComponents/TestimonialCard";

const LandingPage = () => {
  const theme = useTheme();
  const [selectedBlog, setSelectedBlog] = useState(null);
  return (
    <div>
      {/* <Navbar /> */}
      <HomeHero />
      <div className="py-20"> </div>
      <section>
        {/* <LandingStats /> */}
        <Counts />
      </section>

      <div className="spacer py-10"></div>
      <section>
        <AboutSection />
      </section>
      <div className="spacer py-10"></div>
      <section>
        <Batches />
      </section>
      <div className="spacer py-10"></div>
      <section>
        <TrainingTabs />
      </section>

      {/* <div className="spacer py-10"></div> */}
      {/* <div>
        <div className="lg:ps-16 px-6">
          <h4 className="text-sm uppercase text-center text-gray-600 mb-2">
            About Our training
          </h4>
          <h2 className="text-3xl text-center lg:text-4xl font-bold mb-8">
            A new way to manage your
            <br />
            online money.
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 place-items-center gap-6 lg:px-16 px-6 py-4 lg:py-8">
          {reviews.map((review, index) => (
            <ReviewCard key={index} {...review} />
          ))}
        </div>
      </div> */}

      <div className="spacer py-10"></div>
      <section>
        <Startups />
      </section>

      <div className="spacer py-10"></div>
      <section>
        <WhyUs />
      </section>
      <div className="spacer py-8"></div>
      <section>
        {/* <CorporateCultureSection /> */}
        {/* <div className="grid lg:grid-cols-2 grid-cols-1 gap-6 lg:gap-8 lg:px-16 px-6">
          <div></div>
          <div>
            <div class="grid place-items-center grid-cols-3 gap-4 md:grid-cols-3">
              <div class="grid gap-4">
                <div>
                  <img
                    class="h-auto max-w-full rounded-lg object-cover object-center"
                    src="https://images.unsplash.com/photo-1552960562-daf630e9278b?ixlib=rb-4.0.3&amp;ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&amp;auto=format&amp;fit=crop&amp;w=687&amp;q=80"
                    alt="gallery-photo"
                  />
                </div>
                <div>
                  <img
                    class="h-auto max-w-full rounded-lg object-cover object-center"
                    src="https://images.unsplash.com/photo-1540553016722-983e48a2cd10?ixlib=rb-1.2.1&amp;ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&amp;auto=format&amp;fit=crop&amp;w=800&amp;q=80"
                    alt="gallery-photo"
                  />
                </div>
                <div>
                  <img
                    class="h-auto max-w-full rounded-lg object-cover object-center "
                    src="https://docs.material-tailwind.com/img/team-3.jpg"
                    alt="gallery-photo"
                  />
                </div>
              </div>
              <div class="grid gap-4">
                <div>
                  <img
                    class="h-auto max-w-full rounded-lg object-cover object-center"
                    src="https://images.unsplash.com/photo-1493246507139-91e8fad9978e?ixlib=rb-4.0.3&amp;ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&amp;auto=format&amp;fit=crop&amp;w=2940&amp;q=80"
                    alt="gallery-photo"
                  />
                </div>
                <div>
                  <img
                    class="h-auto max-w-full rounded-lg object-cover object-center "
                    src="https://docs.material-tailwind.com/img/team-3.jpg"
                    alt="gallery-photo"
                  />
                </div>
                <div>
                  <img
                    class="h-auto max-w-full rounded-lg object-cover object-center"
                    src="https://images.unsplash.com/photo-1552960562-daf630e9278b?ixlib=rb-4.0.3&amp;ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&amp;auto=format&amp;fit=crop&amp;w=687&amp;q=80"
                    alt="gallery-photo"
                  />
                </div>
              </div>
              <div class="grid gap-4">
                <div>
                  <img
                    class="h-auto max-w-full rounded-lg object-cover object-center"
                    src="https://images.unsplash.com/photo-1552960562-daf630e9278b?ixlib=rb-4.0.3&amp;ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&amp;auto=format&amp;fit=crop&amp;w=687&amp;q=80"
                    alt="gallery-photo"
                  />
                </div>
                <div>
                  <img
                    class="h-auto max-w-full rounded-lg object-cover object-center"
                    src="https://images.unsplash.com/photo-1629367494173-c78a56567877?ixlib=rb-4.0.3&amp;ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&amp;auto=format&amp;fit=crop&amp;w=927&amp;q=80"
                    alt="gallery-photo"
                  />
                </div>
              </div>
            </div>
          </div>
        </div> */}
        <Gallery />
        {/* <HoverCard /> */}
      </section>

      <div className="spacer py-10"></div>
      <section>{/* <Logo/> */}</section>
      <div className="spacer py-10"></div>
      <section>
        <Event/>
      </section>
      <div className="spacer py-10"></div>
      <section>
        <Highlight />
      </section>
      <section>
        {/* <BlogSection /> */}
      </section>
      <div className="spacer py-10"></div>
      <section>
        <Testimonials/>
      </section>
      <div className="spacer py-10"></div>
      <div className="my-6">
        <CallToAction />
      </div>
    </div>
  );
};

export default LandingPage;
