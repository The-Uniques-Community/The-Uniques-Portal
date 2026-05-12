import React, { useState, useEffect } from "react";
import { Box, Typography, Container, Stack, Chip } from "@mui/material";
import axios from "axios";
import { BASE_URL } from "@/config";
import { TrainerCard } from "./TrainerCard";
import SearchIcon from "@mui/icons-material/Search";
import CustomLoader from "@/utils/Loader/CustomLoader";
import { School } from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";

const batchTabs = [
    { label: "All Batches", version: null },
    { label: "The Uniques 1.0", version: "1.0" },
    { label: "The Uniques 2.0", version: "2.0" },
    { label: "The Uniques 3.0", version: "3.0" },
    { label: "The Uniques 4.0", version: "4.0" },
    { label: "The Uniques 5.0", version: "5.0" },
];

const Trainers = () => {
    const [trainers, setTrainers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState(0);
    const [searchFocused, setSearchFocused] = useState(false);

    useEffect(() => {
        const fetchTrainers = async () => {
            try {
                const response = await axios.get(`${BASE_URL}/api/admin/trainers/all-trainers`);
                setTrainers(response.data);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching trainers:", err);
                setError("Failed to load trainers. Please try again later.");
                setLoading(false);
            }
        };

        fetchTrainers();
    }, []);

    // Filter trainers based on active tab and search
    const getFilteredTrainers = () => {
        let filtered = trainers;

        if (activeTab > 0 && batchTabs[activeTab]?.version) {
            const version = batchTabs[activeTab].version;
            filtered = filtered.filter(trainer => {
                const tb = (trainer.teachingBatch || trainer.batch || "").toLowerCase();
                return tb.includes(version);
            });
        }

        if (search.trim()) {
            const q = search.trim().toLowerCase();
            filtered = filtered.filter(trainer => {
                const name = (trainer.fullName || "").toLowerCase();
                const email = (trainer.email || "").toLowerCase();
                const course = (trainer.course || "").toLowerCase();
                const designation = (trainer.designation || "").toLowerCase();
                const skillMatch = Array.isArray(trainer.skills) && trainer.skills.some(skill => (skill || "").toLowerCase().includes(q));
                return name.includes(q) || email.includes(q) || course.includes(q) || designation.includes(q) || skillMatch;
            });
        }

        return filtered;
    };

    const filteredTrainers = getFilteredTrainers();

    return (
        <>
            {/* ========== CELEBRATION-STYLE HEADER ========== */}
            <Box
                className="rounded-b-[50px]"
                sx={{
                    overflow: "hidden",
                    background: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 60"><text x="0" y="25" fill="%23E6E8EE" font-size="60px">.</text></svg>') 0px 0px / 30px 30px #f1f4f9`,
                    padding: "2rem 0",
                }}
            >
                <Container maxWidth="lg">
                    <Stack spacing={4} alignItems="center" sx={{
                        paddingTop: "40px",
                        paddingBottom: "40px",
                    }}>
                        {/* Chip Section */}
                        {!loading && !error && (
                            <Chip
                                variant="outlined"
                                label={
                                    <Stack direction={{ xs: "column", sm: "row" }} alignItems="center" justifyContent="center" spacing={1}>
                                        <Typography variant="caption" sx={{ fontSize: { xs: "0.6rem", sm: "0.75rem" } }}>
                                            Over {trainers.length}+
                                        </Typography>
                                        <Chip
                                            sx={{
                                                backgroundColor: "#ca0019",
                                                height: "20px",
                                                padding: "0 8px",
                                                "& .MuiChip-icon": { color: "white", fill: "white", width: 16, height: 16 },
                                            }}
                                            icon={<School sx={{ width: 16, height: 16, stroke: "white", color: "white", fill: "white" }} />}
                                            label={
                                                <Typography variant="caption" className="text-white" sx={{ fontSize: { xs: "0.6rem", sm: "0.75rem" } }}>
                                                    Expert Trainers
                                                </Typography>
                                            }
                                            variant="filled"
                                        />
                                    </Stack>
                                }
                                sx={{ width: "100%", maxWidth: "250px", margin: "0 auto", padding: { xs: "0.25rem", sm: "0.5rem" }, fontSize: "0.75rem", borderWidth: "1px" }}
                            />
                        )}

                        {/* Heading Section */}
                        <Typography align="center" sx={{ fontSize: { xs: "32px", md: "45px" }, lineHeight: "1.5", maxWidth: "800px", fontWeight: 600 }}>
                            Mentors Who Shape{" "}
                            <span style={{ color: "#ca0019" }}>Future</span> Tech Leaders ✦
                        </Typography>

                        {/* Wave Section */}
                        <Box>
                            <Stack className="wave" role="presentation">
                                <svg viewBox="0 0 122 10" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "80%", height: "auto" }}>
                                    <path opacity="0.4" d="M1.46484 6.83613L4.45387 3.7103C7.74598 0.267505 13.38 0.760513 16.0241 4.72277L16.5428 5.50001C19.2423 9.54539 25.1877 9.54539 27.8873 5.5V5.5C30.5869 1.45461 36.5322 1.45461 39.2318 5.5V5.5C41.9314 9.54539 47.8768 9.54539 50.5764 5.5V5.5C53.2759 1.45461 59.2213 1.45461 61.9209 5.5V5.5C64.6205 9.54539 70.5658 9.54539 73.2654 5.5V5.5C75.965 1.45461 81.9104 1.45461 84.61 5.5V5.5C87.3096 9.54539 93.2549 9.54539 95.9545 5.5V5.5C98.6541 1.45461 104.599 1.45461 107.299 5.5V5.5C109.999 9.54539 115.944 9.54539 118.644 5.5L120.534 2.66667" stroke="#ca0019" strokeLinecap="round" />
                                </svg>
                            </Stack>
                        </Box>
                    </Stack>
                </Container>
            </Box>

            {/* ========== MAIN CONTENT ========== */}
            <Box sx={{ pb: 10, pt: 5 }}>
                <Container maxWidth="xl">
                    {/* ========== BATCH TABS ========== */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.25 }}
                    >
                        <Box sx={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 1.5, mb: 4 }}>
                            {batchTabs.map((tab, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setActiveTab(idx)}
                                    className={`relative px-5 py-2.5 rounded-full font-semibold text-sm transition-all duration-300 outline-none ${
                                        activeTab === idx
                                            ? "bg-[#ca0019] text-white shadow-lg shadow-red-200/50"
                                            : "bg-white text-slate-600 border border-slate-200 hover:border-[#ca0019]/40 hover:text-[#ca0019] hover:shadow-md"
                                    }`}
                                    style={{
                                        ...(activeTab === idx && {
                                            background: "linear-gradient(135deg, #ca0019 0%, #e8153a 100%)",
                                        }),
                                    }}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </Box>
                    </motion.div>

                    {/* ========== SEARCH BAR ========== */}
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.35 }}
                    >
                        <Box
                            sx={{
                                maxWidth: 480,
                                mx: "auto",
                                mb: 6,
                            }}
                        >
                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1.5,
                                    px: 2.5,
                                    py: 1.5,
                                    borderRadius: "16px",
                                    background: searchFocused
                                        ? "rgba(255,255,255,0.95)"
                                        : "rgba(255,255,255,0.7)",
                                    backdropFilter: "blur(12px)",
                                    border: searchFocused
                                        ? "1.5px solid rgba(202,0,25,0.25)"
                                        : "1.5px solid rgba(226,232,240,0.8)",
                                    boxShadow: searchFocused
                                        ? "0 8px 32px rgba(202,0,25,0.08), 0 2px 8px rgba(0,0,0,0.04)"
                                        : "0 2px 8px rgba(0,0,0,0.03)",
                                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                }}
                            >
                                <SearchIcon
                                    sx={{
                                        color: searchFocused ? "#ca0019" : "#94a3b8",
                                        fontSize: 22,
                                        transition: "color 0.3s",
                                    }}
                                />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onFocus={() => setSearchFocused(true)}
                                    onBlur={() => setSearchFocused(false)}
                                    placeholder="Search trainers by name, skill, or designation..."
                                    style={{
                                        flex: 1,
                                        border: "none",
                                        outline: "none",
                                        background: "transparent",
                                        fontSize: "0.95rem",
                                        color: "#1e293b",
                                        fontFamily: "inherit",
                                    }}
                                />
                                {search && (
                                    <button
                                        onClick={() => setSearch("")}
                                        className="text-slate-400 hover:text-slate-600 transition-colors text-lg leading-none px-1"
                                    >
                                        ×
                                    </button>
                                )}
                            </Box>
                        </Box>
                    </motion.div>

                    {/* ========== CONTENT SECTION ========== */}
                    {loading ? (
                        <CustomLoader />
                    ) : error ? (
                        <Box sx={{ textAlign: "center", py: 10 }}>
                            <Typography color="error" variant="h6">{error}</Typography>
                        </Box>
                    ) : (
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab + search}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.35 }}
                            >
                                {filteredTrainers.length > 0 ? (
                                    <div className="grid xl:grid-cols-4 lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-8">
                                        {filteredTrainers.map((trainer, i) => (
                                            <motion.div
                                                key={trainer._id}
                                                initial={{ opacity: 0, y: 30 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{
                                                    duration: 0.4,
                                                    delay: Math.min(i * 0.06, 0.6),
                                                    ease: "easeOut",
                                                }}
                                                className="flex justify-center"
                                            >
                                                <TrainerCard user={trainer} />
                                            </motion.div>
                                        ))}
                                    </div>
                                ) : (
                                    <Box
                                        sx={{
                                            textAlign: "center",
                                            py: 12,
                                        }}
                                    >
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ duration: 0.4 }}
                                        >
                                            <Box
                                                sx={{
                                                    width: 80,
                                                    height: 80,
                                                    borderRadius: "50%",
                                                    background: "linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    mx: "auto",
                                                    mb: 3,
                                                }}
                                            >
                                                <School sx={{ fontSize: 36, color: "#94a3b8" }} />
                                            </Box>
                                            <Typography
                                                variant="h6"
                                                sx={{ color: "#475569", fontWeight: 600, mb: 1 }}
                                            >
                                                No trainers found
                                            </Typography>
                                            <Typography
                                                variant="body2"
                                                sx={{ color: "#94a3b8" }}
                                            >
                                                {search
                                                    ? `No results matching "${search}"`
                                                    : "No trainers available for this batch yet."}
                                            </Typography>
                                        </motion.div>
                                    </Box>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    )}
                </Container>
            </Box>
        </>
    );
};

export default Trainers;
