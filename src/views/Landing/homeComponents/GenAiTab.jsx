import { Memory, AutoAwesome, Psychology, Insights } from "@mui/icons-material";
import androidTraining from "@/assets/img/android-training.png";

const GenAiTab = () => {
  const features = [
    {
      icon: <Memory fontSize="large" style={{ color: "white" }} />,
      title: "Artificial Intelligence",
      description:
        "Learn the fundamentals of AI, including neural networks, decision trees, and reinforcement learning to build intelligent systems.",
    },
    {
      icon: <AutoAwesome fontSize="large" style={{ color: "white" }} />,
      title: "Generative AI",
      description:
        "Master the art of creating AI models that generate text, images, and other content using tools like GPT and Stable Diffusion.",
    },
    {
      icon: <Psychology fontSize="large" style={{ color: "white" }} />,
      title: "Machine Learning",
      description:
        "Dive into supervised and unsupervised learning, regression, classification, and clustering with hands-on projects.",
    },
    {
      icon: <Insights fontSize="large" style={{ color: "white" }} />,
      title: "Data Analytics & Insights",
      description:
        "Analyze and interpret data to derive actionable insights using advanced tools like Python, TensorFlow, and Pandas.",
    },
  ];

  return (
    <div className="container mx-auto px-2 lg:px-4 py-10">
      <div className="grid lg:grid-cols-3 place-items-center md:grid-cols-1 grid-cols-1 gap-x-10">
        {/* Left Section - Image */}
        <div className="lg:col-span-1">
          <img
            src={androidTraining}
            className="object-center object-contain w-full min-w-80 max-w-xs mx-auto"
            alt="AI Training"
          />
        </div>

        {/* Right Section - Content */}
        <div className="lg:p-4 md:p-4 p-2 self-center lg:col-span-2">
          <div>
            <h4 className="text-3xl lg:text-4xl font-bold mb-10 text-center lg:text-left">
              Industry-Ready AI, ML, and Generative AI Training
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
        </div>
      </div>
    </div>
  );
};

export default GenAiTab;
