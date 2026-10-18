import React from "react";

const FeatureCard = ({ image, title, description }) => {
  return (
    <div className="group relative bg-white transition hover:z-[1] hover:shadow-lg hover:shadow-gray-300">
      <div className="relative space-y-8 py-12 p-8">
        <img src={image} className="w-12" alt={title} />
        <div className="space-y-2">
          <h5 className="text-xl font-semibold text-gray-800 transition group-hover:text-red-600">
            {title}
          </h5>
          <p className="text-gray-600">{description}</p>
        </div>
        <a href="#" className="flex items-center justify-between text-grey-600 group-hover:text-red-800">
          <span className="text-sm">Read more</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-5 h-5 -translate-x-4 opacity-0 transition duration-300 group-hover:translate-x-0 group-hover:opacity-100"
          >
            <path
              fillRule="evenodd"
              d="M12.97 3.97a.75.75 0 011.06 0l7.5 7.5a.75.75 0 010 1.06l-7.5 7.5a.75.75 0 11-1.06-1.06l6.22-6.22H3a.75.75 0 010-1.5h16.19l-6.22-6.22a.75.75 0 010-1.06z"
              clipRule="evenodd"
            />
          </svg>
        </a>
      </div>
    </div>
  ); 
};

const FeaturesSection = () => {
  const features = [
    {
      image: "https://cdn-icons-png.flaticon.com/512/4341/4341139.png",
      title: "First feature",
      description: "Neque Dolor, fugiat non cum doloribus aperiam voluptates nostrum.",
    },
    {
      image: "https://cdn-icons-png.flaticon.com/512/4341/4341134.png",
      title: "Second feature",
      description: "Neque Dolor, fugiat non cum doloribus aperiam voluptates nostrum.",
    },
    {
      image: "https://cdn-icons-png.flaticon.com/512/4341/4341160.png",
      title: "Third feature",
      description: "Neque Dolor, fugiat non cum doloribus aperiam voluptates nostrum.",
    },
    {
        image: "https://cdn-icons-png.flaticon.com/512/4341/4341160.png",
        title: "Third feature",
        description: "Neque Dolor, fugiat non cum doloribus aperiam voluptates nostrum.",
      },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 xl:px-6" id="features">
      <div className="md:w-2/3 lg:w-1/2">
        <h2 className="my-8 text-2xl font-bold text-gray-900 md:text-4xl">
          A technology-first approach to payments and finance
        </h2>
        <p className="text-gray-700">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Natus ad ipsum pariatur autem, fugit laborum in atque amet obcaecati? Nisi minima aspernatur, quidem nulla cupiditate nam consequatur eligendi magni adipisci.
        </p>
      </div>
      <div className="mt-16 grid divide-x divide-y divide-gray-200 overflow-hidden rounded-3xl border border-gray-200 text-gray-800 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4">
        {features.map((feature, index) => (
          <FeatureCard key={index} {...feature} />
        ))}
      </div>
    </div>
  );
};

export default FeaturesSection;
