
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";


import React, { useState, useEffect, useRef } from "react";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLinkedin, faFacebook, faTwitter } from '@fortawesome/free-brands-svg-icons';


import Slider from "react-slick";
const desk = [
  {
    "name": "Mr. Ashwani Garg",
    "position": "Chairman",
    "description": "I welcome every aspiring achiever to the Swami Vivekanand Group of Institutions. Today SVGOI has become a dream place to provide valuable educational experience to students, from different cultures and backgrounds. I am delighted to see the contributions, the students, faculty, and management of SVGOI have been making towards the overall success of students across the world. We have an interactive curriculum made to provide definite learning solutions in the field of Scientific studies, Medical studies, Arts, Business & Engineering. In this world known as a global village, all boundaries and the national borders are gradually becoming more transparent. Our international collaborations have helped students to form unlimited opportunities of global exposure for our students, to excel in their careers. So join your hands with SVGOI and be future-ready.",
    "image": "https://bmnmsbiymz.ufs.sh/f/1V3V2P4kpAumv2ojXKUjtV3JMvxUIZnXbTfpBu58zRdYhQaF",
    facebook: "https://www.facebook.com/ChairmanSVGOI",
  },
  {
    "name": "Mr. Ashok Garg",
    "position": "President",
    "description": "SVGOI has experienced remarkable growth in recent years, earning widespread acclaim for its rapid advancement. Our journey from inception to our current standing is a testament to our unwavering dedication, exceptional faculty, and enriching learning environment. With a focus on quality education, we offer diverse programs affiliated with both national and international universities. We celebrate the achievements of our faculty, staff, and partners, employing modern teaching methods that empower students to realize their full potential. Emphasizing hands-on experience over mere theoretical knowledge, SVGOI is dedicated to providing practical solutions and fostering intellectual brilliance through research and development. Let's collaborate in building a skilled society together.",
    "image": "https://bmnmsbiymz.ufs.sh/f/1V3V2P4kpAumltl0Dlu4P3qMiabZeUz87wrEkVfCgNntQHSJ",
    facebook: "https://www.facebook.com/ashok.garg.566",
  },
  {
    "name": "Mr. Vishal Garg",
    "position": "Director Secretarial and Administration",
    "description": "At SVGOI, we prioritize global standards in academia, fostering active engagement among teachers, students, and industry. Our focus is on holistic education, preparing students for the challenges of a globalized world. With dedicated faculty and staff, we aim to excel in shaping individuals' futures and elevate SVGOI's standing in the academic realm. Our commitment to excellence is reflected in the diverse student body, including foreign exchange students, enriching our campus culture. Join us in experiencing exceptional intellectual and academic opportunities, shaping the future of learning together.",
    "image": "https://bmnmsbiymz.ufs.sh/f/1V3V2P4kpAum8xTTG5XlJfrKGuWUjb4n6NYRd3wE9DxCgy0v",
    facebook: "https://www.facebook.com/vishal.garg.7921975",
    linkedin: "https://www.linkedin.com/in/vishal-garg-2134aa142/"
  },
  // {
  //   "name": "Mr. Ankur Gupta",
  //   "position": "Director Corporate Affairs",
  //   "description": "Students from around the country are getting attracted to SVGOI because of our commitment to teaching excellence, focus on research, tailored courses that make our education relevant to changing career dynamics and formidable industry partnerships. The Curriculum is delivered in spacious, amphitheatre-style classrooms—fitted with modern Information and Communication Technology (ICT) equipment to participate in co-curricular and extra-curricular activities through various clubs and societies in the campus. SVGOI provides several opportunities for local students, to visit foreign universities and institutions on such exchange programs, thereby helping them receive invaluable international exposure.",
  //   "image": img4.src,
  //   linkedin: "https://www.linkedin.com/in/ankur-gupta-14278730/",
  // },
  // {
  //   "name": "Mr. Sahil Garg",
  //   "position": "Project Director",
  //   "description": "SVGOI epitomizes quality, dedication, values, and commitment, evident through our accomplished alumni. To cement our position as a premier institute in Technical Higher Education in India, we offer diverse, industry-relevant programs. With a student-centric approach, SVGOI is esteemed as one of the top private colleges in North India. From computer science to mechanical engineering, business management to nursing, SVGOI provides a wide array of educational services. Our strength lies in nurturing globally competitive graduates prepared for success in various professional domains. Join us in shaping a brighter future together.",
  //   "image": img5.src,
  //   linkedin: "https://www.linkedin.com/in/sahil-garg-034226130/",
  //   facebook: "https://www.facebook.com/sahil.garg.58910"

  // },
  // {
  //   "name": "Mr. Shubham Garg",
  //   "position": "Director Placements",
  //   "description": "Our aim is to provide Placements & Corporate Interface for the students and to make the students aware about the job opportunities and help them get placed. In the last fifteen years, Training & Placement Office (General) has been successfully able to place students of different courses & has invited reputed MNCs from, Social Sector, Information Technology, Manufacturing, ITES, Media, Services, Banking & Finance, etc. The Training & Placement Office (General) looks after the Campus Placements of the Engineering & Non-Engineering Courses of the College & Coordinates with the respective departmental TPO's regarding the Placement & related activities.",
  //   "image": img6.src,
  //   linkedin: "https://www.linkedin.com/in/shubham-garg-670537170/",
  //   facebook: "https://www.facebook.com/profile.php?id=100052235821482",
  // },
  // {
  //   "name": "Mr. Ankur Gill",
  //   "position": "Director Operations",
  //   "description": "As the Director of Operations at Swami Vivekanand Institute of Engineering and Technology, I am deeply committed to fostering an environment of excellence, innovation, and growth within our institution. With a focus on providing top-notch education and opportunities for our students, I am honored to collaborate with such dedicated professionals like yourselves who share a passion for academic advancement and student success.Our mission at Swami Vivekanand Institute of Engineering and Technology is to empower our students with knowledge, skills, and values that will enable them to thrive in an ever-evolving world. Through our collective efforts, we strive to create an ecosystem where creativity flourishes, ideas are nurtured, and aspirations are realized. I am confident that with your unwavering support and dedication, Swami Vivekanand Institute of Engineering and Technology will continue to reach new heights of success and distinction.",
  //   "image": img7.src,
  //   facebook: "https://www.facebook.com/ankurgillofficial",
  //   linkedin: "https://www.linkedin.com/in/ankurgillofficial/"
  // }
];


export default function Testimonial() {
  const [nav1, setNav1] = useState(null);
  const [nav2, setNav2] = useState(null);
  let sliderRef1 = useRef(null);
  let sliderRef2 = useRef(null);

  useEffect(() => {
    setNav1(sliderRef1);
    setNav2(sliderRef2);
  }, []);

  return (
    <div className=" py-12 bg-white">
      <div className="w-[80%] mx-auto flex flex-col align-middle  justify-start ">
        <div className="flex mb-5 items-center">
          <span className="border-l-2 border-[#ca0019] h-6 mr-3"></span>
          <h1 className="text-sm md:text-lg font-bold">OUR FLAG BEARERS</h1>
        </div>
        <h1 className="text-2xl md:text-4xl font-semibold ">From the
          <span className='text-[#ca0019] text-2xl md:text-5xl md:py-2 block'> Desk of Management</span></h1>
      </div>

      <div className="slider-container w-10/12 mx-auto flex flex-wrap items-center">
        <div className="w-full lg:w-3/4 lg:pr-8">
          <Slider asNavFor={nav2} ref={slider => (sliderRef1 = slider)} >
            {desk.map((member, index) => (


              <div key={index} className="  py-24 w-full">
                <div className="h-full m-auto flex sm:flex-row flex-col items-center sm:justify-start justify-center text-center sm:text-left gap-8">
                  <img className="flex-shrink-0 rounded-lg w-96 h-96 object-cover object-top sm:mb-0 mb-4" src={member.image} alt={member.name} />
                  <div className="flex-grow sm:pl-8">
                    <h2 className="title-font font-medium text-lg text-gray-900">{member.name}</h2>
                    <h3 className="text-gray-500 mb-3">{member.position}</h3>
                    <p className="mb-4 text-justify">{member.description}</p>
                    <span className="inline-flex">
                      {
                        member.linkedin && <a href={member.linkedin} className="text-gray-500">
                          <FontAwesomeIcon icon={faLinkedin} />
                        </a>
                      }
                      {member.facebook &&
                        <a href={member.facebook} className="ml-2 text-gray-500">
                          <FontAwesomeIcon icon={faFacebook} />
                        </a>
                      }

                    </span>
                  </div>
                </div>
              </div>
            ))}
          </Slider>
        </div>
        <div className="hidden lg:block lg:w-1/4">
          <Slider
            className=""
            asNavFor={nav1}
            ref={slider => (sliderRef2 = slider)}
            slidesToShow={3}
            swipeToSlide={true}
            focusOnSelect={true}
            vertical={true}
            arrows={false}
            
          >
            {desk.map((member, index) => (
              <div key={index} className="px-4 py-2 w-full h-full">
                <div className="h-full m-auto flex sm:flex-row flex-col items-center sm:justify-start justify-center text-center sm:text-left">
                  <img className="flex-shrink-0 rounded-xl w-24 h-24 object-cover object-center sm:mb-0 mb-4" style={{ borderRadius: "200px" }} src={member.image} alt={member.name} />
                  <div className="flex-grow sm:pl-8">
                    <h2 className="title-font font-medium text-md text-gray-900">{member.name}</h2>
                    <h3 className="text-gray-500 mb-3 text-sm">{member.position}</h3>
                  </div>
                </div>
              </div>
            ))}
          </Slider>
        </div>
      </div>
    </div>
  );
}
