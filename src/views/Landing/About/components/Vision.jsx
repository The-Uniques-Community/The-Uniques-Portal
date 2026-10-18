import React from 'react';
import visionImage from '/src/assets/img/About/VISION.png'; // Adjust if needed

const MissionVission = () => {
  const MissionData = [
    { number: '1', title: 'Mastering Technology', description: 'Our mission is to cultivate a deep understanding of cutting-edge technologies, empowering students to innovate beyond traditional academics.' },
    { number: '2', title: 'Building Future Innovators', description: 'We aim to nurture a community of problem-solvers and tech enthusiasts who challenge norms and drive technological advancements.' },
    { number: '3', title: 'Entrepreneurial Mindset', description: 'Encouraging students to think beyond jobs and explore the world of startups, turning ideas into real-world solutions.' },
    { number: '4', title: 'Collaboration & Growth', description: 'Fostering an ecosystem where like-minded individuals connect, collaborate, and grow in their technical journey together.' }
  ];

  const VisionData = [
    { number: '1', title: 'Tech-Driven Excellence', description: 'Our vision is to create a community where technical expertise is valued above rote academics, driving innovation and impact.' },
    { number: '2', title: 'Startup Culture', description: 'We envision a future where our members launch groundbreaking startups, disrupting industries with technological advancements.' },
    { number: '3', title: 'Global Tech Impact', description: 'Our vision extends beyond boundaries, aiming to make a mark in the global tech ecosystem through collaboration and innovation.' },
    { number: '4', title: 'Continuous Learning', description: 'We believe in an ever-evolving learning journey, where adapting to new technologies and frameworks is the norm.' }
  ];

  return (
    <>
      {/* PHILOSOPHY SECTION */}
      <div className="container md:w-4/5 px-5 mx-auto py-12 flex flex-col md:flex-row">
        <div className="md:w-1/2 flex flex-col justify-center">
          <div className="flex mb-2 md:mb-5 items-center">
            <span className="border-l-2 border-[#e03232] h-6 mr-3"></span>
            <h1 className="text-lg font-bold">OUR PHILOSOPHY</h1>
          </div>
          <h1 className="text-lg md:text-3xl font-semibold mb-8">
            Our principles and <span className="text-[#ca2c2c] text-4xl md:text-7xl md:py-3 block">beliefs</span>
          </h1>
          <p className="text-justify">
            Batch Uniques is a special community where technical growth takes priority over traditional academics. We are committed to fostering innovation, pushing boundaries, and creating a future filled with tech-driven startups and groundbreaking solutions.
          </p>
        </div>
        <div className="w-full md:w-1/2 h-96 hidden md:block">
          <img className="w-[80%] h-[80%] object-contain opacity-5" src={visionImage} alt="Vision" />
        </div>
      </div>

      {/* MISSION & VISION SECTIONS */}
      {[{ title: 'MISSION', data: MissionData }, { title: 'VISION', data: VisionData }].map((section, idx) => (
        <div key={idx} className="container md:w-4/5 px-5 md:px-0 mx-auto pb-24">
          <div className={`md:flex ${section.title === 'VISION' ? 'flex-col-reverse md:flex-row' : 'items-center'}`}>
            {section.title === 'MISSION' && (
              <div className="md:w-1/3 flex justify-center pb-7 md:pb-0">
                <h1 className="md:text-5xl text-2xl font-semibold">{section.title}</h1>
              </div>
            )}
            <div className="md:w-2/3">
              <div className="container px-5 mx-auto flex flex-wrap">
                {section.data.map((item) => (
                  <div key={item.number} className="flex relative py-3 sm:items-center md:w-2/3 mx-auto">
                    <div className="h-full w-6 absolute inset-0 flex items-center justify-center">
                      <div className="h-full w-1 bg-gray-300 pointer-events-none"></div>
                    </div>
                    <div className="flex-shrink-0 w-6 h-6 rounded-full mt-10 sm:mt-0 inline-flex items-center justify-center bg-[#ca0019] text-white relative z-10 font-medium text-sm">
                      {item.number}
                    </div>
                    <div className="flex-grow md:pl-8 pl-6 flex sm:items-center items-start flex-col sm:flex-row">
                      <div className="flex-shrink-0 w-10 h-10 text-[#ca0019] bg-gray-300 rounded-full inline-flex items-center justify-center">
                        <svg fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="w-5 h-5" viewBox="0 0 24 24">
                          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                        </svg>
                      </div>
                      <div className="flex-grow sm:pl-6 mt-2 sm:mt-0">
                        <h2 className="font-medium text-gray-900 mb-1 text-md">{item.title}</h2>
                        <p className="leading-relaxed text-sm">{item.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {section.title === 'VISION' && (
              <div className="md:w-1/3 flex justify-center items-center">
                <h1 className="md:text-5xl text-2xl font-semibold text-center">{section.title}</h1>
              </div>
            )}
          </div>
        </div>
      ))}
    </>
  );
};

export default MissionVission;
