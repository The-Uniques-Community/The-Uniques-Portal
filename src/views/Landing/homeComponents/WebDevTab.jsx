import img from '@/assets/img/web-dev-training.png';
import { Code, Web, Palette, Layers } from "@mui/icons-material";
import model from "@/assets/img/trainingMethod.png";

const WebDevTab = () => {
  const features = [
    {
      icon: <Code fontSize="large" style={{ color: "white" }} />,
      title: "HTML, CSS, & JavaScript",
      description:
        "Students start by learning HTML, CSS, and JavaScript to build responsive, interactive websites from scratch.",
    },
    {
      icon: <Web fontSize="large" style={{ color: "white" }} />,
      title: "Responsive Design",
      description:
        "Focused on creating websites that adapt seamlessly to all screen sizes using competitive development techniques.",
    },
    {
      icon: <Palette fontSize="large" style={{ color: "white" }} />,
      title: "Frameworks & Tools",
      description:
        "Introduction to frameworks like Bootstrap, Tailwind, and the use of CDNs for faster website development.",
    },
    {
      icon: <Layers fontSize="large" style={{ color: "white" }} />,
      title: "Client-Ready Projects",
      description:
        "The goal is to prepare students for real-world projects, making them market-ready to offer their services.",
    },
  ];

  return (
    <div className="container mx-auto px-2 lg:px-4 py-10">
      <div className="grid lg:grid-cols-3 place-items-center md:grid-cols-1 grid-cols-1 gap-x-10">
        {/* Left Section - Image */}
        <div className="lg:col-span-1">
          <img
            src={img}
            className="object-center object-contain w-full min-w-80 max-w-xs mx-auto"
            alt="Web Development Training"
          />
        </div>

        {/* Right Section - Content */}
        <div className="lg:p-4 md:p-4 p-2 self-center lg:col-span-2">
          <div>
            <h4 className="text-3xl lg:text-4xl font-bold mb-10 text-center lg:text-left">
              Web Development Training Model
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
          <div className="mt-10">
            <img
              src={model}
              className="w-full object-contain max-w-3xl mx-auto"
              alt="Training Model"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default WebDevTab;
