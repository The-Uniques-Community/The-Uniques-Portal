import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAdjust,
  faPlusSquare,
  faLaptop,
} from "@fortawesome/free-solid-svg-icons";

const WhyUs = () => {
  return (
    <section className="ezy__portfolio10 w-full light py-14 md:py-24 bg-white text-black">
      <div className="container mx-auto">
        {/* Section Header */}
        <div className="mx-auto flex flex-col align-middle justify-start">
  <div className="flex mb-5 items-center">
    <span className="border-l-2 border-[#ca0019] h-6 mr-3"></span>
    <h1 className="text-sm md:text-lg font-bold capitalize">
      A Community Like No Other
    </h1>
  </div>
  <h2 className=" text-2xl md:text-4xl font-semibold leading-relaxed">
    Driving <span className="brush-bg text-white">Innovation</span> Through  
    <span className="text-[#ca0019] text-2xl md:text-5xl md:py-2 block mb-5">
      Collaboration & Visionary Thinking
    </span>
  </h2>
</div>

        {/* Features Grid */}
        <div className="grid grid-cols-3 gap-6 mt-6 max-w-7xl mx-auto">
          {/* Feature 1: Global Networking */}
          <div className="col-span-3 lg:col-span-2">
            <div className="bg-white shadow-xl rounded-xl overflow-hidden h-full">
              <div className="flex flex-col md:flex-row h-full items-center">
                <div className="h-full w-full md:w-1/2">
                  <div
                    className="bg-center bg-contain bg-no-repeat h-full min-h-[200px] md:min-h-[250px]"
                    style={{
                      backgroundImage: `url("https://bmnmsbiymz.ufs.sh/f/1V3V2P4kpAumVEqfvD3gFkCwLrRjtm2nJhzUIixOYXBA8NDb")`,
                    }}
                  ></div>
                </div>
                <div className="flex flex-col justify-center w-full md:w-1/2 p-4 sm:p-6 text-black h-full">
               
                  <h1 className="text-sm md:text-lg font-bold capitalize">
                    Global Networking
                  </h1>
                  <h5 className="font-medium text-xl capitalize mb-2">
                    Build Connections That Matter
                  </h5>
                  <p>
                    Connect with founders, investors, and industry leaders worldwide to collaborate, grow,  
                    and scale your startup with the right mentorship.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Feature 2: Hands-On Learning */}
          <div className="col-span-3 lg:col-span-1">
            <div className="bg-red-800 text-white shadow-xl rounded-xl overflow-hidden h-full p-4 sm:p-6 flex flex-col justify-center">
              <div className="mb-4 text-4xl">
                <FontAwesomeIcon icon={faPlusSquare} />
              </div>
              <h5 className="font-medium capitalize mb-4 text-xl">
                Hands-On Learning
              </h5>
              <p>
                Get exclusive access to expert-led workshops, panel discussions,  
                and case studies to refine your business strategy.
              </p>
            </div>
          </div>

          {/* Feature 3: Career Growth */}
          <div className="col-span-3 lg:col-span-1">
            <div className="bg-red-800 text-white shadow-xl rounded-xl overflow-hidden h-full p-4 sm:p-6 flex flex-col justify-center">
              <div className="mb-4 text-4xl">
                <FontAwesomeIcon icon={faLaptop} />
              </div>
              <h3 className="font-medium capitalize mb-4 text-xl">
                Startup Acceleration
              </h3>
              <p>
                Get access to funding opportunities, pitch competitions,  
                and acceleration programs designed to take your startup to the next level.
              </p>
            </div>
          </div>

          {/* Feature 4: Present Your Idea */}
          <div className="col-span-3 lg:col-span-2">
            <div className="bg-white shadow-xl rounded-xl overflow-hidden h-full">
              <div className="flex flex-col md:flex-row h-full items-center">
                <div className="h-full w-full md:w-1/2">
                  <div
                    className="bg-center bg-contain bg-no-repeat h-full min-h-[200px] md:min-h-[250px]"
                    style={{
                      backgroundImage: `url("https://bmnmsbiymz.ufs.sh/f/1V3V2P4kpAumjxQ06gEKYdovOsGfC3D9tNMk6nXaAzRVqy05")`,
                    }}
                  ></div>
                </div>
                <div className="flex flex-col justify-center w-full md:w-1/2 p-4 sm:p-6 text-black h-full">
                  <div className="mb-4 text-4xl">
                    <FontAwesomeIcon icon={faAdjust} />
                  </div>
                  <h3 className="font-medium capitalize mb-4 text-xl">
                    Showcase Your Innovation
                  </h3>
                  <p>
                    Pitch your ideas in exclusive startup showcases and competitions,  
                    attracting investors, mentors, and potential co-founders.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyUs;
