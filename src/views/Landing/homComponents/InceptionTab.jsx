import { Brush, Movie, Campaign, Work } from "@mui/icons-material";
import inception from "@/assets/img/inception.png";
import model from "@/assets/img/trainingMethod.png";

const InceptionTab = () => {
  const features = [
    {
      icon: <Brush fontSize="large" style={{ color: "white" }} />,
      title: "Graphic Design Basics",
      description:
        "Introduction to Adobe Photoshop, Illustrator, and Canva for social media marketing, engagement posts, and printables.",
    },
    {
      icon: <Movie fontSize="large" style={{ color: "white" }} />,
      title: "Video Editing Fundamentals",
      description:
        "Learning After Effects, CapCut, and Canva for creating professional and engaging video content.",
    },
    {
      icon: <Campaign fontSize="large" style={{ color: "white" }} />,
      title: "Marketing & Engagement",
      description:
        "Understanding how to design content that boosts brand awareness and audience engagement on digital platforms.",
    },
    {
      icon: <Work fontSize="large" style={{ color: "white" }} />,
      title: "Real-World Application",
      description:
        "Students are encouraged to find clients on digital platforms, applying their skills in practical, real-world scenarios.",
    },
  ];

  return (
    <div className="container mx-auto px-2 lg:px-4 py-10">
      <div className="grid lg:grid-cols-3 place-items-center md:grid-cols-1 grid-cols-1 gap-x-10">
        {/* Left Section - Image */}
        <div className="lg:col-span-1">
          <img
            src={inception}
            className="object-center object-contain w-full min-w-80 max-w-xs mx-auto"
            alt="Inception Training"
          />
        </div>

        {/* Right Section - Content */}
        <div className="lg:p-4 md:p-4 p-2 self-center lg:col-span-2">
          <div>
            <h4 className="text-3xl lg:text-4xl font-bold mb-10 text-center lg:text-left">
              Foundation of Design & Editing
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

export default InceptionTab;
