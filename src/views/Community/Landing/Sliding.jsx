import { useRef } from "react"
import ArrowRightAltIcon from "@mui/icons-material/ArrowRightAlt"
import tu_red from "@/assets/logos/tu-red.png"
import "@/utils/Card/weirdcard.css"
// Import SimpleBar
import SimpleBar from 'simplebar-react';
import 'simplebar-react/dist/simplebar.min.css';
import '@/utils/scrollbar.css'

const WeirdCard = ({ title, description }) => {
  return (
    <div className="card group hover:cursor-pointer z-10 duration-100 mb-6">
      <div className="top-section bg-slate-200 py-4 rounded-lg relative">
        <div className="absolute flex justify-center items-center top-0 left-0 w-10 h-10 bg-black/80 rounded-full">
          <img className="w-6 object-contain h-6" src={tu_red || "/placeholder.svg"} alt="logo" />
        </div>
        <div className="border2"></div>
        <h2 className="text-xl font-bold mt-8 px-2 ">{title}</h2>
        <div className="bg-[#ca0019] h-[1px] w-0 group-hover:w-1/2 transition-all duration-500"></div>
        <p className="text-sm font-light px-2 text-justify">{description}</p>
      </div>
      <div className="relative">
        <div className="px-2 bg-slate-200 flex justify-center items-center py-1 h-5 w-[70px] rounded-xl absolute bottom-0 right-0">
          <ArrowRightAltIcon className="text-black group-hover:text-2xl font-light duration-100" />
        </div>
      </div>
    </div>
  )
}

export default function SplitLayout() {
  const scrollRef = useRef(null)


  const cardData = [
    { title: "Expand Your Community", description: "Kickstart a student club at your university, collaborating with university officials and forming a dedicated core team." },
    { title: "Engaging Workshops", description: "Organize interactive workshops to help students explore various developer tools and platforms ." },
    { title: "Lead Project Development", description: "Collaborate with local organizations to identify project opportunities and spearhead impactful community projects." },
    { title: "Professional Growth", description: "Gain access to community management training, technical insights, and exclusive industry events." },
    { title: "Expand Your Network", description: "Connect with student leaders, industry professionals, and experienced mentors in a thriving global community." },
    { title: "Community Empowerment", description: "Receive dedicated support and resources to educate and expand your community both online and offline." },
  ]

  return (
    <div className="container mx-auto mb-32 flex flex-col md:flex-row w-full">
      {/* Left section - Fixed */}
      <div className="w-full md:w-1/2 py-8 bg-white sticky top-0 flex flex-col justify-start items-start">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold">
            Join <span className="text-[#ca0019]">The Uniques Community</span> Today!
          </h1>
          <p className="text-gray-700 mt-4">
            Become an ambassador and lead a thriving community while gaining invaluable experience and networking opportunities.
          </p>
        </div>

        <div className="">
          <div className="flex items-center justify-between mt-8">
            <div className="flex -space-x-2">
              <img src="https://bmnmsbiymz.ufs.sh/f/1V3V2P4kpAumcie7BiH8VXEy6oP2FKNmz4aCbwtxqpB9gkJD" className="w-12 h-12 rounded-full border-2 border-white" alt="User" />
              <img src="https://bmnmsbiymz.ufs.sh/f/1V3V2P4kpAumcie7BiH8VXEy6oP2FKNmz4aCbwtxqpB9gkJD" className="w-12 h-12 rounded-full border-2 border-white" alt="User" />
              <img src="https://bmnmsbiymz.ufs.sh/f/1V3V2P4kpAumcie7BiH8VXEy6oP2FKNmz4aCbwtxqpB9gkJD" className="w-12 h-12 rounded-full border-2 border-white" alt="User" />
              <img src="https://bmnmsbiymz.ufs.sh/f/1V3V2P4kpAumcie7BiH8VXEy6oP2FKNmz4aCbwtxqpB9gkJD" className="w-12 h-12 rounded-full border-2 border-white" alt="User" />

            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-6">
            <div>
              <h3 className="text-2xl font-bold">500+</h3>
              <p className="text-gray-600 text-sm">Ambassadors Worldwide</p>
            </div>
            <div>
              <h3 className="text-2xl font-bold">100+</h3>
              <p className="text-gray-600 text-sm">Workshops Conducted</p>
            </div>
            <div>
              <h3 className="text-2xl font-bold">4.9</h3>
              <p className="text-gray-600 text-sm">Community Rating</p>
            </div>
          </div>
        </div>
      </div>


      {/* Right section - Scrollable with SimpleBar - LEFT SIDE SCROLLBAR */}

      <SimpleBar
        ref={scrollRef}
        className="w-full md:w-[50%] p-6 md:p-8 h-[400px] custom-simplebar"
        autoHide={false}
        scrollbarMinSize={50}
        forceVisible="y"
        direction="rtl"  // This moves the scrollbar to the left side
        data-simplebar-force-visible="true"
      >
        {/* Content direction set to ltr */}
        <div className="space-y-6 flex flex-col items-center justify-center" style={{ direction: 'ltr' }}>
          {cardData.map((card, index) => (
            <WeirdCard key={index} title={card.title} description={card.description} />
          ))}
        </div>
      </SimpleBar>
    </div>
  )
}
