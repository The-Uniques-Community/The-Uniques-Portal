import { Android, Cloud, Group, Store } from "@mui/icons-material";
import androidTraining from "@/assets/img/android-training.png";
// import industryModel from "@/assets/img/industryModel.png";

const AndroidTab = () => {
  const features = [
    {
      icon: <Android fontSize="large" style={{ color: "white" }} />,
      title: "React Native & Android Studio",
      description:
        "Develop cross-platform mobile apps using React Native and Android Studio with an optimized UI/UX approach.",
    },
    {
      icon: <Cloud fontSize="large" style={{ color: "white" }} />,
      title: "Firebase Integration",
      description:
        "Implement real-time databases, authentication, push notifications, and analytics using Firebase.",
    },
    {
      icon: <Store fontSize="large" style={{ color: "white" }} />,
      title: "Google Play Console & Deployment",
      description:
        "Understand app publishing, Play Store guidelines, monetization strategies, and ASO (App Store Optimization).",
    },
    {
      icon: <Group fontSize="large" style={{ color: "white" }} />,
      title: "Team & Individual Projects",
      description:
        "Gain hands-on experience by building real-world apps, both as an individual developer and in a team environment.",
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
            alt="Android Training"
          />
        </div>

        {/* Right Section - Content */}
        <div className="lg:p-4 md:p-4 p-2 self-center lg:col-span-2">
          <div>
            <h4 className="text-3xl lg:text-4xl font-bold mb-10 text-center lg:text-left">
              Industry-Ready Android Development Training
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

export default AndroidTab;
