import { useTheme } from "@mui/material/styles";
import { FaLinkedinIn, FaInstagram } from "react-icons/fa";
import { GoArrowUpRight } from "react-icons/go";
import { FaXTwitter } from "react-icons/fa6";
import { Link, useNavigate } from "react-router";
import * as React from "react";
import Box from "@mui/material/Box";
import Button from "../Buttons/Button";
import Modal from "@mui/material/Modal";
import { BorderAllRounded } from "@mui/icons-material";
const style = {
  position: "absolute",
  BorderAllRounded:0,
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
};

const MemberCard = ({
  linkedin,
  instagram,
  twitter,
  fullName,
  batch,
  position,
  profileImg,
  onClick,
}) => {
  const theme = useTheme();
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const navigate = useNavigate();

  const skills = [
    "JavaScript",
    "React",
    "Node.js",
    "Express",
    "React Native",
    "DSA",
    "Programming",
    "MongoDB",
    "Tailwind CSS",
    "TypeScript",
    "Problem Solving",
    "Leadership",
    "Communication",
    "Teamwork",
    "Time Management",
    "Critical Thinking",
  ];

  const initialSkills = skills.slice(0, 7);
  const handleShowMore = () => {
    navigate("/"); // Navigate to a dedicated skills page
  };

  return (
    <div className="bg-white group hover:cursor-pointer hover:shadow-lg duration-75 px-2 py-3 border-t-[1px] shadow-md max-w-64 relative">
      {/* Profile Image */}
      <div onClick={handleOpen} className="overflow-hidden rounded-lg">
        <img
          src={profileImg}
          className="hover:scale-105 duration-150 custom-clip rounded-t-lg rounded-l-lg"
          alt={`${fullName}'s Profile`}
        />
      </div>

      {/* Social Media Links */}
      <div className="flex flex-col gap-y-4 absolute right-2 top-0 bottom-36 items-center justify-start py-5 bg-black w-12">
        {/* Twitter */}
        {twitter && (
          <Link to={twitter} target="_blank">
            <div className="rounded-full w-8 h-8 bg-white">
              <div className="flex justify-center items-center w-full h-full">
                <FaXTwitter size={18} color="black" />
              </div>
            </div>
          </Link>
        )}

        {/* Instagram */}
        {instagram && (
          <Link to={instagram} target="_blank">
            <div className="rounded-full w-8 h-8 bg-white">
              <div className="flex justify-center items-center w-full h-full">
                <FaInstagram size={18} color="black" />
              </div>
            </div>
          </Link>
        )}

        {/* LinkedIn */}
        {linkedin && (
          <Link to={linkedin} target="_blank">
            <div className="rounded-full w-8 h-8 bg-white">
              <div className="flex justify-center items-center w-full h-full">
                <FaLinkedinIn size={18} color="black" />
              </div>
            </div>
          </Link>
        )}
      </div>

      {/* Name and Position */}
      <div className="font-bold text-xl">
        <p className="border-b-[1px] border-slate-500">{fullName}</p>
        <span className="font-light text-slate-700 text-sm -mt-3">
          //{position}
        </span>
      </div>

      {/* Batch */}
      <div className="w-max px-1 bottom-2 h-6 bg-[#ca0019] mb-2">
        <p className="text-white font-semibold">{batch}</p>
      </div>

      {/* Arrow Link */}
      <div className="absolute right-7 bottom-4">
        <div
          onClick={onClick}
          className="w-12 h-12 rounded-full flex bg-black justify-center items-center"
        >
          <GoArrowUpRight
            className="inline-block group-hover:rotate-45 duration-75"
            size={20}
            color="white"
          />
        </div>
      </div>

      {/* Modal */}
      <Modal
        open={open}
        onClose={handleClose} // Properly link handleClose
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style} className="lg:w-[60%] lg:h-max md:h-[85vh] sm:h-[90vh] h-[90vh] relative overflow-y-scroll md:w-[70%] w-[90%] ">
          {/* Close Button */}
          <div
            onClick={handleClose}
            className="absolute top-2 right-2 bg-black text-white px-2 py-1 cursor-pointer"
          >
            Close
          </div>
          
              
          <div className="grid gap-y-6 lg:grid-cols-4 md:col-span-4 col-span-1 gap-x-5">
            <div className="lg:col-span-2 md:col-span-1 col-span-1 relative">
              <img
                src={profileImg}
                className="hover:scale-105 w-full object-contain object-center lg:object-left md:object-left sm:object-center lg:h-96 duration-150 custom-clip rounded-t-lg rounded-l-lg"
                alt={`${fullName}'s Profile`}
              />
              <div className="w-max px-1 absolute lg:top-80 md:top-[70%] left-0 top-[70%] h-6 bg-[#ca0019] mb-2">
                <p className="text-white font-semibold">{batch}</p>
              </div>
              <div className="">
                <Button
                  path="/lol"
                  color={theme.palette.primary.light}
                  bgColor={theme.palette.primary.main}
                  border={4}
                  borderColor={theme.palette.primary.dark}
                  iconColor={"black"}
                >
                  <span>Know More</span>
                </Button>
              </div>
            
          
            </div>
            
            
            <div className="font-bold lg:col-span-2 md:col-span-1 col-span-1 self-center">
              <p className="border-b-[1px] font-bold text-3xl border-slate-500">
                {fullName}
              </p>
              <span className="font-light text-slate-700 -mt-3">
                //{position}
              </span>
              <div className="my-4">
                <div className="">
                  <p className="font-semibold">ABOUT</p>
                  <p className="font-normal text-sm text-slate-700">
                    Lorem ipsum dolor sit amet consectetur adipisicing elit.
                    Aperiam, beatae culpa! Ipsa officiis rem soluta
                    necessitatibus, et, officia tenetur accusantium laudantium
                    dicta corrupti rerum! Tempora ex praesentium consequatur
                    expedita doloremque.
                  </p>
                </div>
              </div>
              <div className="">
                <p className="font-semibold">SKILLS</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {initialSkills.map((skill, index) => (
                    <div
                      key={index}
                      className="px-3 py-1 hover:bg-slate-200 cursor-pointer duration-100 rounded-full border border-slate-500 font-normal  text-sm"
                    >
                      {skill}
                    </div>
                  ))}
                  {skills.length > 5 && (
                    <div
                      onClick={handleShowMore}
                      className="px-3 py-1 rounded-full border border-black text-sm cursor-pointer text-[#ca0019] hover:bg-[#ca0019] hover:text-white duration-100"
                    >
                      Show More
                    </div>
                  )}
                </div>
                <div className=" mt-4 ">
                  <p className="font-semibold mt-4">SOCIAL MEDIA</p>
                  <div className="flex items-center mt-2 justify-evenly gap-3 py-1 px-3 bg-black w-max">
                {/* Twitter */}
                {twitter && (
                  <Link to={twitter} target="_blank">
                    <div className="rounded-full w-8 h-8 bg-white">
                      <div className="flex justify-center items-center w-full h-full">
                        <FaXTwitter size={18} color="black" />
                      </div>
                    </div>
                  </Link>
                )}

                {/* Instagram */}
                {instagram && (
                  <Link to={instagram} target="_blank">
                    <div className="rounded-full w-8 h-8 bg-white">
                      <div className="flex justify-center items-center w-full h-full">
                        <FaInstagram size={18} color="black" />
                      </div>
                    </div>
                  </Link>
                )}

                {/* LinkedIn */}
                {linkedin && (
                  <Link to={linkedin} target="_blank">
                    <div className="rounded-full w-8 h-8 bg-white">
                      <div className="flex justify-center items-center w-full h-full">
                        <FaLinkedinIn size={18} color="black" />
                      </div>
                    </div>
                  </Link>
                )}
              </div>
                </div>
              </div>
            </div>
            
            
          </div>
          
        </Box>
      </Modal>
    </div>
  );
};

export default MemberCard;
