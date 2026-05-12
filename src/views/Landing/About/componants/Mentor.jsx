import { useState } from "react";
import { FaTwitter, FaInstagram, FaLinkedin } from "react-icons/fa";
import ankursir from "../../../../assets/img/About/ankursir.jpg";
import Button from "../../../../utils/Buttons/HoverButton";
import ProfileCard from "./Ankur1";

export default function MentorSection() {
  const [modalOpen, setModalOpen] = useState(false);
  console.log(modalOpen);

  const togglePopup = () => {
    setIsPopupOpen(!isPopupOpen);
  };

  return (
    <div>
      <div className="w-[67%] mx-auto flex flex-col align-middle justify-start">
        <div className="flex mb-5 items-center">
          <span className="border-l-2 border-[#ca0019] h-6 mr-3"></span>
          <h1 className="text-sm md:text-lg font-bold">OUR FOUNDER</h1>
        </div>
        <h1 className="text-2xl md:text-4xl font-semibold">
          Visionary Leadership,
          <span className="text-[#ca0019] text-2xl md:text-5xl md:py-2 block">
            Inspiring Generations
          </span>
        </h1>
      </div>

      <section className="flex flex-col md:flex-row items-center md:items-start gap-12 p-8 md:p-16 w-[85%] mx-auto">
        {/* Mentor Image */}
        <div className="w-full md:w-1/2 flex justify-center">
          <img
            src={ankursir}
            alt="Mentor"
            className="w-96 h-96 md:w-[450px] md:h-[450px] object-cover rounded-xl shadow-xl"
          />
        </div>

        {/* Mentor Info */}
        <div className="w-full md:w-1/2 text-center md:text-left">
          <p className="mt-6 text-sm md:text-sm text-gray-600">
            A distinguished instructional management specialist with an illustrious track record spanning over a decade. His expertise traverses the realms of Academics, Research & Innovation, Administration, Public Relations, Business Strategy, Brand Management, and Corporate Relations.
            <br />
            <br />
            He stands as the proud Founder of the pioneering IT incubation center within our campus, aptly named UNIQUE ZONE. This incubation center stands as a testament to his commitment to providing a nurturing environment for students, where innovative ideas evolve into practical solutions. Through his transformative leadership, he has fostered an ecosystem that empowers students to transcend boundaries and turn their aspirations into reality.
            <br />
            <br />
            As the Founder of this community, he epitomizes a strategic thinker and a dynamic force in the Corporate & Education Sector. His vision extends beyond conventional boundaries, driving a culture of excellence, creativity, and innovation.
          </p>

          {/* Social Links & Button */}
          <div className="flex items-center justify-between mt-6">
            <div>
              <p className="text-sm md:text-sm text-gray-500 font-medium">
                Director of Operations | Ankur Gill
              </p>
              <div className="mt-4 flex justify-center md:justify-start gap-6 text-gray-600">
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                  <FaTwitter className="text-xl hover:text-blue-500 transition-colors" />
                </a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                  <FaInstagram className="text-xl hover:text-pink-500 transition-colors" />
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
                  <FaLinkedin className="text-xl hover:text-blue-700 transition-colors" />
                </a>
              </div>
            </div>
            
            <div className=" ">
              <Button className="px-4 py-2 text-xs" onClick={() => setModalOpen(true)}>
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Popup Component */}
      <ProfileCard isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
