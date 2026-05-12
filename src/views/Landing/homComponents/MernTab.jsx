import { Code, Storage, People, GitHub } from "@mui/icons-material";
import mernImage from "@/assets/img/mern-training.png";
// import industryModel from "@/assets/img/industryModel.png";

const MernTab = () => {
  const features = [
    {
      icon: <Code fontSize="large" style={{ color: "white" }} />,
      title: "Full-Stack Development",
      description:
        "Mastering React, Node.js, Express, and MongoDB with real-world projects and scalable architecture.",
    },
    {
      icon: <Storage fontSize="large" style={{ color: "white" }} />,
      title: "Database & API Design",
      description:
        "Building secure REST APIs, handling authentication, and optimizing MongoDB performance for high-traffic applications.",
    },
    {
      icon: <People fontSize="large" style={{ color: "white" }} />,
      title: "Client-Oriented Approach",
      description:
        "Working with real clients, building custom dashboards, and solving business challenges with MERN stack solutions.",
    },
    {
      icon: <GitHub fontSize="large" style={{ color: "white" }} />,
      title: "Industry-Level Methodologies",
      description:
        "Following GitHub best practices, CI/CD pipelines, Agile workflows, and version control for efficient team collaboration.",
    },
  ];

  return (
    <div className="container mx-auto px-2 lg:px-4 py-10">
      <div className="grid lg:grid-cols-3 place-items-center md:grid-cols-1 grid-cols-1 gap-x-10">
        {/* Left Section - Image */}
        <div className="lg:col-span-1">
          <img
            src={mernImage}
            className="object-center object-contain w-full min-w-80 max-w-xs mx-auto"
            alt="MERN Stack Training"
          />
        </div>

        {/* Right Section - Content */}
        <div className="lg:p-4 md:p-4 p-2 self-center lg:col-span-2">
          <div>
            <h4 className="text-3xl lg:text-4xl font-bold mb-10 text-center lg:text-left">
              Industry-Ready MERN Stack Training
            </h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mt-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex items-start flex-wrap gap-4 bg-gray-100 p-3 rounded-lg shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="p-4 rounded-full bg-black flex items-center justify-center">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{feature.title}</h3>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
          {/* <div className="mt-10">
            <img
              src={industryModel}
              className="w-full object-contain max-w-3xl mx-auto"
              alt="Industry Methodologies"
            />
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default MernTab;
