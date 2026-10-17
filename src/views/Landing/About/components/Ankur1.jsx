import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Book, Briefcase, User2, Linkedin, Twitter, Mail, Instagram } from 'lucide-react';

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white mt-28 pb-5 rounded-2xl overflow-hidden relative w-[90%] max-w-6xl h-[90vh]"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors z-50"
        >
          <X className="w-6 h-6" />
        </button>
        {children}
      </motion.div>
    </div>,
    document.body
  );
};

const TabButton = ({ active, icon: Icon, label, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-all ${
      active
        ? 'bg-gradient-to-r from-red-600 to-red-800 text-white shadow-lg'
        : 'text-gray-600 hover:bg-gray-100'
    }`}
  >
    <Icon className="w-5 h-5" />
    <span>{label}</span>
  </button>
);

const ProfileCard = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [activeStartup, setActiveStartup] = useState(2);

  const books = [
    {
      title: "The Art of Giving",
      cover: "https://bmnmsbiymz.ufs.sh/f/1V3V2P4kpAumlhBlWJ7u4P3qMiabZeUz87wrEkVfCgNntQHS",
      description: "A comprehensive guide to navigating the digital age",
      link: "#"
    },
    {
      title: "Empowering Youth",
      cover: "https://bmnmsbiymz.ufs.sh/f/1V3V2P4kpAumx3mamjn96rMwa3N4fR0hndkIVipFyKUB8bHc",
      description: "Essential strategies for building thriving communities",
      link: "#"
    },
    {
      title: "From Sacrifice to Success",
      cover: "https://bmnmsbiymz.ufs.sh/f/1V3V2P4kpAumrJWVY51tqLi810a5BU7mZyDEfnuXpQgMYRIT",
      description: "Transforming education in the digital era",
      link: "#"
    }
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="flex flex-col h-full ">
        {/* Profile Header - Fixed at top */}
        <div className="p-8 bg-gradient-to-r from-red-700 via-red-600 to-red-800 relative">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNiIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMikiIHN0cm9rZS13aWR0aD0iMiIvPjwvZz48L3N2Zz4=')] opacity-10"></div>
          <div className="flex flex-col md:flex-row items-center gap-8 relative">
            <div className="relative w-48">
              <motion.svg
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                width="100%"
                height="auto"
                viewBox="0 0 342 265"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="drop-shadow-2xl"
              >
                <defs>
                  <clipPath id="aboutClip">
                    <path d="M0 56V30C0 23.3726 5.37258 18 12 18H42C48.6274 18 54 23.3726 54 30V37C54 43.6274 59.3726 49 66 49H68C74.6274 49 80 43.6274 80 37V30C80 23.3726 85.3726 18 92 18H275C279.971 18 284 13.9706 284 9C284 4.02944 288.029 0 293 0H330C336.627 0 342 5.37258 342 12V79C342 85.6274 336.627 91 330 91H296C289.373 91 284 96.3726 284 103V167.5C284 169.985 286.015 172 288.5 172C290.985 172 293 169.985 293 167.5V151C293 144.373 298.373 139 305 139H330C336.627 139 342 144.373 342 151V181C342 187.627 336.627 193 330 193H304C297.925 193 293 197.925 293 204C293 210.075 297.925 215 304 215H330C336.627 215 342 220.373 342 227V253C342 259.627 336.627 265 330 265H305C298.373 265 293 259.627 293 253V232.5C293 230.015 290.985 228 288.5 228C286.015 228 284 230.015 284 232.5V253C284 259.627 278.627 265 272 265H92C85.3726 265 80 259.627 80 253V232C80 225.373 74.6274 220 68 220H35C28.3726 220 23 214.627 23 208V173.5C23 167.149 17.8513 162 11.5 162C5.14873 162 0 156.851 0 150.5V103C0 96.3726 5.37258 91 12 91H36.5C42.8513 91 48 85.8513 48 79.5C48 73.1487 42.8513 68 36.5 68H12C5.37258 68 0 62.6274 0 56Z" />
                  </clipPath>
                  <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>
                <image
                  href="https://bmnmsbiymz.ufs.sh/f/1V3V2P4kpAumGEtCTEIoeyaO1d7xYQMuBsK0zrR9WmSiLvEN"
                  width="342"
                  height="315"
                  preserveAspectRatio="xMidYMid slice"
                  clipPath="url(#aboutClip)"
                  filter="url(#glow)"
                />
                <path
                  d="M0 56V30C0 23.3726 5.37258 18 12 18H42C48.6274 18 54 23.3726 54 30V37C54 43.6274 59.3726 49 66 49H68C74.6274 49 80 43.6274 80 37V30C80 23.3726 85.3726 18 92 18H275C279.971 18 284 13.9706 284 9C284 4.02944 288.029 0 293 0H330C336.627 0 342 5.37258 342 12V79C342 85.6274 336.627 91 330 91H296C289.373 91 284 96.3726 284 103V167.5C284 169.985 286.015 172 288.5 172C290.985 172 293 169.985 293 167.5V151C293 144.373 298.373 139 305 139H330C336.627 139 342 144.373 342 151V181C342 187.627 336.627 193 330 193H304C297.925 193 293 197.925 293 204C293 210.075 297.925 215 304 215H330C336.627 215 342 220.373 342 227V253C342 259.627 336.627 265 330 265H305C298.373 265 293 259.627 293 253V232.5C293 230.015 290.985 228 288.5 228C286.015 228 284 230.015 284 232.5V253C284 259.627 278.627 265 272 265H92C85.3726 265 80 259.627 80 253V232C80 225.373 74.6274 220 68 220H35C28.3726 220 23 214.627 23 208V173.5C23 167.149 17.8513 162 11.5 162C5.14873 162 0 156.851 0 150.5V103C0 96.3726 5.37258 91 12 91H36.5C42.8513 91 48 85.8513 48 79.5C48 73.1487 42.8513 68 36.5 68H12C5.37258 68 0 62.6274 0 56Z"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="2"
                  fill="none"
                />
              </motion.svg>
            </div>
            
            <div className="text-white text-center md:text-left relative z-10">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <h2 className="text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white to-red-100">Er. Ankur Gill</h2>
                <p className="text-xl opacity-90 mb-4 font-light">Founder - The Uniques Community</p>
                
                <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                  {[
                    { Icon: Linkedin, label: 'LinkedIn' },
                    { Icon: Twitter, label: 'Twitter' },
                    { Icon: Instagram, label: 'Instagram' },
                    { Icon: Mail, label: 'Email' }
                  ].map(({ Icon, label }) => (
                    <motion.button
                      key={label}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors backdrop-blur-sm border border-white/20"
                    >
                      <Icon className="w-5 h-5" />
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Tabs - Sticky below header */}
        <div className="border-b bg-white sticky top-0 z-20 shadow-md">
          <div className="flex gap-2 p-4">
            <TabButton
              active={activeTab === 'overview'}
              icon={User2}
              label="Overview"
              onClick={() => setActiveTab('overview')}
            />
            <TabButton
              active={activeTab === 'startups'}
              icon={Briefcase}
              label="Startups"
              onClick={() => setActiveTab('startups')}
            />
            <TabButton
              active={activeTab === 'books'}
              icon={Book}
              label="Books"
              onClick={() => setActiveTab('books')}
            />
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto bg-gray-100">
          <div className="container mx-auto p-6 space-y-8">
            <AnimatePresence mode="wait">
              {activeTab === 'overview' && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                      className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow border-t-4 border-red-600"
                    >
                      <h3 className="text-xl font-semibold mb-4 text-red-600">About</h3>
                      <p className="text-gray-600">
                        A visionary entrepreneur and community builder with over a decade of experience
                        in digital transformation and education technology. Founded The Uniques Community
                        to empower the next generation of digital leaders.
                      </p>
                    </motion.div>
                    
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                      className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow border-t-4 border-red-600"
                    >
                      <h3 className="text-xl font-semibold mb-4 text-red-600">Achievements</h3>
                      <ul className="space-y-3 text-gray-600">
                        {[
                          '100+ Student Mentorship Programs',
                          '3 Successful Startups',
                          'Published Author',
                          'TEDx Speaker'
                        ].map((achievement, index) => (
                          <motion.li
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 + index * 0.1 }}
                            className="flex items-center space-x-2"
                          >
                            <div className="w-2 h-2 rounded-full bg-red-600"></div>
                            <span>{achievement}</span>
                          </motion.li>
                        ))}
                      </ul>
                    </motion.div>
                  </div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow border-t-4 border-red-600"
                  >
                    <h3 className="text-xl font-semibold mb-4 text-red-600">Vision</h3>
                    <p className="text-gray-600">
                      Dedicated to transforming the educational landscape through innovative digital
                      solutions and community-driven learning experiences. Committed to empowering
                      individuals to reach their full potential in the digital age.
                    </p>
                  </motion.div>
                </motion.div>
              )}

              {activeTab === 'startups' && (
                <motion.div
                  key="startups"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-8"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      {[
                        {
                          id: 1,
                          name: "godigitify Nexus",
                          description: "A company providing innovative digital solutions to transform businesses.",
                          image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500"
                        },
                        {
                          id: 2,
                          name: "Techlearns Academy",
                          description: "A startup dedicated to enhancing student careers through innovative learning solutions.",
                          image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=500"
                        },
                        {
                          id: 3,
                          name: "Click Master",
                          description: "A startup empowering local photographers to showcase their creativity and grow their business.",
                          image: "https://images.unsplash.com/photo-1452830978618-d6feae7d0ffa?w=500"
                        }
                      ].map((startup) => (
                        <motion.div
                          key={startup.id}
                          whileHover={{ scale: 1.02 }}
                          className={`p-6 rounded-xl transition-all cursor-pointer ${
                            activeStartup === startup.id
                              ? 'bg-gradient-to-r from-red-600 to-red-800 text-white shadow-lg'
                              : 'bg-white hover:bg-gray-50 shadow-md'
                          }`}
                          onClick={() => setActiveStartup(startup.id)}
                        >
                          <h3 className="text-xl font-semibold mb-2">{startup.name}</h3>
                          <p className={activeStartup === startup.id ? 'text-red-100' : 'text-gray-600'}>
                            {startup.description}
                          </p>
                        </motion.div>
                      ))}
                    </div>
                    
                    <div className="relative lg:sticky lg:top-8">
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="rounded-xl overflow-hidden shadow-2xl"
                      >
                        <img
                          src={[
                            "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500",
                            "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=500",
                            "https://images.unsplash.com/photo-1452830978618-d6feae7d0ffa?w=500"
                          ][activeStartup - 1]}
                          alt="Startup"
                          className="w-full h-[400px] object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'books' && (
                <motion.div
                  key="books"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                >
                  {books.map((book, index) => (
                    <motion.div
                      key={book.title}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white rounded-xl overflow-hidden group hover:shadow-2xl transition-all"
                    >
                      <div className="relative h-64">
                        <img
                          src={book.cover}
                          alt={book.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                          <h3 className="text-xl font-semibold mb-2">{book.title}</h3>
                        </div>
                      </div>
                      
                      <div className="p-6">
                        <p className="text-gray-600 mb-4">{book.description}</p>
                        <motion.a
                          href={book.link}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-red-600 to-red-800 text-white rounded-lg hover:shadow-lg transition-all"
                        >
                          Read More
                          <svg className="w-4 h-4 ml-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M5 12h14M12 5l7 7-7 7" />
                          </svg>
                        </motion.a>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ProfileCard;
