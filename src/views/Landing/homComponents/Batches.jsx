import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, Award, Users } from "lucide-react";
import axios from "axios";
import { BASE_URL } from "@/config";
import MemberCard from "../Batches/components/MemberCard";
import AchievementCard from "../Batches/components/AchievementCard";
import { achievementsData } from "../Batches/data/achievementsData";
import { Link } from "react-router-dom";

const Batches = () => {
  // State management
  const [members, setMembers] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [batchCounts, setBatchCounts] = useState({});
  const [countsLoading, setCountsLoading] = useState(true);

  // Define batches data with count information from API
  const batchesData = useMemo(() => [
    {
      id: "All",
      name: "All Batches",
      icon: "👥",
      description: "All members from The Uniques Community.",
      memberCount: batchCounts["All"] || 0
    },
    {
      id: "The Uniques 1.0",
      name: "The Uniques 1.0",
      icon: "🥇",
      description: "The founding batch of The Uniques Community, established in 2021 with a vision to create a supportive learning environment for tech enthusiasts.",
      memberCount: batchCounts["The Uniques 1.0"] || 0
    },
    {
      id: "The Uniques 2.0",
      name: "The Uniques 2.0",
      icon: "🥈",
      description: "The second generation of The Uniques Community that continued the legacy with new innovations and community initiatives.",
      memberCount: batchCounts["The Uniques 2.0"] || 0
    },
    {
      id: "The Uniques 3.0",
      name: "The Uniques 3.0",
      icon: "🥉",
      description: "The newest members of The Uniques Community, bringing fresh perspectives and energy to our growing tech community.",
      memberCount: batchCounts["The Uniques 3.0"] || 0
    },
        {
          id: "The Uniques 4.0",
          name: "The Uniques 4.0",
          icon: "🏅",
          description: "The latest batch of The Uniques Community, driving innovation and collaboration in the tech space.",
          memberCount: batchCounts["The Uniques 4.0"] || 0,
          
        }
  ], [batchCounts]);

  // Fetch batch counts
  useEffect(() => {
    const fetchBatchCounts = async () => {
      try {
        setCountsLoading(true);
        const response = await axios.get(`${BASE_URL}/api/public/members/counts`);

        if (response.data.success) {
          // Transform the response data to ensure proper count format
          const batchData = response.data.data;
          const counts = {
            "The Uniques 1.0": parseInt(batchData["The Uniques 1.0"] || 0),
            "The Uniques 2.0": parseInt(batchData["The Uniques 2.0"] || 0),
            "The Uniques 3.0": parseInt(batchData["The Uniques 3.0"] || 0),
            "The Uniques 4.0": parseInt(batchData["The Uniques 4.0"] || 0)
          };
          setBatchCounts(counts);

          // Debug log to verify counts
          console.log('Batch counts:', counts);
        }
      } catch (err) {
        console.error("Error fetching batch counts:", err);
        setBatchCounts({
          "The Uniques 1.0": 0,
          "The Uniques 2.0": 0,
          "The Uniques 3.0": 0,
          "The Uniques 4.0": 0,
        });
      } finally {
        setCountsLoading(false);
      }
    };

    fetchBatchCounts();
  }, []);

  // Fetch members data for selected batch
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setLoading(true);

        const response = await axios.get(`${BASE_URL}/api/public/members`, {
          params: {
            batch: selectedBatch !== "All" ? selectedBatch : undefined
          }
        });

        if (response.data.success) {
          // Process members to ensure no null/undefined values
          const processedMembers = response.data.data.map(member => ({
            ...member,
            fullName: member.fullName || member.email,
            batch: member.batch || "Unspecified Batch",
            skills: Array.isArray(member.skills) ? member.skills : [],
            projects: Array.isArray(member.projects) ? member.projects : [],
            achievements: Array.isArray(member.achievements) ? member.achievements : [],
            certifications: Array.isArray(member.certifications) ? member.certifications : []
          }));

          // Changed from 3 to 4 members
          setMembers(processedMembers.slice(0, 4));
          setError(null);
        } else {
          setError(response.data.message || "Failed to fetch members");
          setMembers([]);
        }
      } catch (err) {
        console.error("Error fetching members:", err);
        setError("Failed to load members");
        setMembers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, [selectedBatch]);

  // Get the current batch data
  const currentBatch = useMemo(() => batchesData.find((batch) => batch.id === selectedBatch), [selectedBatch, batchesData]);

  // Get achievements for the current batch (still using static data for achievements)
  const batchAchievements = useMemo(
    () => achievementsData.filter((achievement) =>
      achievement.batchId === selectedBatch ||
      (selectedBatch === "All" && achievement.batchId === "All")
    ),
    [selectedBatch]
  );

  // Filter members based on search term
  const filteredMembers = useMemo(() => {
    if (!searchTerm.trim() || !Array.isArray(members)) {
      return members;
    }

    const term = searchTerm.toLowerCase();
    return members.filter(member => {
      const nameMatch = member.fullName && member.fullName.toLowerCase().includes(term);
      const bioMatch = member.bio && member.bio.toLowerCase().includes(term);
      const courseMatch = member.course && member.course.toLowerCase().includes(term);

      // Check for skills
      const skillsMatch = Array.isArray(member.skills) && member.skills.some(skill => {
        if (typeof skill === 'string') {
          return skill.toLowerCase().includes(term);
        }
        return (skill && skill.name && skill.name.toLowerCase().includes(term));
      });

      return nameMatch || bioMatch || courseMatch || skillsMatch;
    });
  }, [members, searchTerm]);

  return (
    <div className="min-h-screen bg-transparent w-full">
      {/* Header */}
      <motion.div
        className="bg-white py-12 px-4 sm:px-6 lg:px-8 shadow-sm"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="w-[85%] mx-auto flex flex-col align-middle justify-start">
          <div className="flex mb-5 items-center">
            <span className="border-l-2 border-[#ca0019] h-6 mr-3"></span>
            <h1 className="text-sm md:text-lg font-bold capitalize">
              Our Batches
            </h1>
          </div>
          <h1 className="md:w-[100vh] w-full text-xl md:text-3xl font-semibold">
            Explore the talented members of
            <span className="text-[#ca0019] text-2xl md:text-5xl md:py-2 block mb-5">
              The Uniques Community
            </span>
          </h1>
        </div>
      </motion.div>

      {/* Batch Selection */}
      <div className="w-[85%] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-wrap gap-4 mb-8 justify-center items-center">
          {batchesData.map((batch) => (
            <motion.button
              key={batch.id}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-medium ${selectedBatch === batch.id
                ? "bg-[#ca0019] text-white shadow-lg"
                : "bg-white text-gray-700 hover:bg-gray-100 shadow"
                }`}
              onClick={() => setSelectedBatch(batch.id)}

              whileTap={{ scale: 0.95 }}
            >
              {batch.icon}
              <span>{batch.name}</span>
              <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${countsLoading
                ? "bg-gray-200 text-gray-500 animate-pulse"
                : selectedBatch === batch.id
                  ? "bg-white bg-opacity-20 text-white"
                  : "bg-black bg-opacity-10"
                }`}>
                <Users size={12} />
                {/* {countsLoading ? "..." : batch.memberCount} */}
              </span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md mx-auto mb-12">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-full shadow-sm focus:outline-none focus:ring-[#ca0019] focus:border-[#ca0019]"
          placeholder="Search by name, position, or skill..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Batch Information and Members */}
      {currentBatch && (
        <motion.div
          className="w-[85%] mx-auto mb-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          key={currentBatch.id}
        >
          {/* Batch Info Card */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  {currentBatch.icon}
                  {currentBatch.name}
                  <span className="bg-[#ca0019] text-white px-2 py-0.5 rounded-full text-sm flex items-center gap-1">
                    <Users size={14} />
                    {/* {countsLoading ? "Loading..." : `${currentBatch.memberCount} Members`} */}
                  </span>
                </h2>
                <p className="mt-2 text-gray-600">{currentBatch.description}</p>
              </div>
            </div>

            {/* Batch Achievements Section */}
            <motion.div
              className="mt-6"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={{ duration: 0.3 }}
            >
              {/* <div>
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-[#ca0019]" />
                  Batch Achievements
                </h3>
                <div className="grid lg:grid-cols-4 grid-cols-1 sm:grid-cols-1 md:grid-cols-3 gap-4">
                  {batchAchievements.map((achievement) => (
                    <AchievementCard
                      key={achievement.id}
                      title={achievement.title}
                      description={achievement.description}
                      icon={achievement.icon}
                      color={achievement.color}
                    />
                  ))}
                </div>
              </div> */}
            </motion.div>
          </div>

          {/* Members Grid - Updated to show 4 Members */}
          <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 place-items-center sm:gap-x-0 gap-4 gap-y-6 h-auto">
            {loading ? (
              <div className="col-span-full flex flex-col items-center justify-center py-12">
                <div className="w-12 h-12 border-4 border-gray-300 border-t-[#ca0019] rounded-full animate-spin"></div>
                <p className="mt-4 text-gray-600">Loading members...</p>
              </div>
            ) : error ? (
              <div className="col-span-full text-center py-12">
                <p className="text-red-500">{error}</p>
              </div>
            ) : filteredMembers.length > 0 ? (
              <>
                {filteredMembers.map((member) => (
                  <MemberCard key={member._id} member={member} />
                ))}

                {/* View All Members Link */}
                <div className="col-span-full mt-8 text-center">
                  <Link
                    to="/batches"
                    className="inline-block px-6 py-3 bg-[#ca0019] text-white rounded-md hover:bg-[#a80015] transition-colors"
                  >
                    View All Members
                  </Link>
                </div>
              </>
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500 text-lg">No members found matching your search.</p>
                <button
                  onClick={() => setSearchTerm("")}
                  className="mt-4 px-4 py-2 bg-[#ca0019] text-white rounded-md hover:bg-[#a80015] transition-colors"
                >
                  Clear Search
                </button>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Batches;
