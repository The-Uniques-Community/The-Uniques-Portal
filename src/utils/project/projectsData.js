import axios from "axios";
import { BASE_URL } from "@/config";

export const INITIAL_PROJECTS = [
  {
    id: 1,
    title: "UNI CARE",
    batch: "Uniques 4.0",
    description:
      "A student-support system that identifies potential problem areas and flags them for timely attention and appropriate support.",
    overview:
      "An intelligent student wellness and support platform engineered to assist academic communities in detecting early signs of distress, academic fatigue, and mentorship gaps.",
    detailedDescription:
      "UNI CARE is a comprehensive student-centric initiative developed by The Uniques Community to foster psychological safety, academic guidance, and peer-to-peer mentorship. By coupling an accessible help-desk interface with intelligent alert tracking, UNI CARE bridges the communication barrier between students and faculty mentors, ensuring that every student receives proactive attention before minor difficulties turn into critical hurdles.",
    problemStatement:
      "Students in higher education frequently navigate rigorous academic demands, career pressures, and adjustment hurdles in isolation. Without a dedicated, non-stigmatizing channel to voice concerns or request one-on-one guidance, early distress often goes unnoticed until examinations or academic performance suffer.",
    solution:
      "A proactive, privacy-respecting digital support platform that integrates anonymous assistance requests, mentorship ticket assignment, wellness check-in indicators, and rapid coordinator intervention to deliver immediate academic and personal support.",
    features: [
      "Confidential Student Wellness & Guidance Ticketing",
      "Automated Support Routing to Relevant Faculty & Student Mentors",
      "Real-time Issue Status Tracking and Feedback Closure",
      "Integrated Resource Library for Academic Guidance and Stress Management",
      "Strict Data Privacy & Optional Anonymous Inquiry Submission",
    ],
    team: [
      { name: "The Uniques 4.0", role: "Organizing & Tech Wing", initials: "TU" },
      { name: "Mentorship Cell", role: "Student Counselors", initials: "MC" },
    ],
    status: "Completed",
    image: "/projects/unicare.webp",
    technologies: ["REACT", "NODE.JS", "MONGODB", "AI"],
    category: "Support & Mentorship",
    link: "https://uniques-care.vercel.app/",
    liveUrl: "https://uniques-care.vercel.app/",
    githubUrl: "https://github.com/theuniquesofflicial",
    buttonColor: "#ea384c",
    createdAt: "2026-01-15",
  },
  {
    id: 2,
    title: "Libraria",
    batch: "Uniques 1.0",
    description:
      "A digital library platform that helps students discover, access, organize, and manage academic books and learning resources.",
    overview:
      "A modern digital library catalog providing frictionless access to university reference books, research notes, and syllabus materials with zero latency.",
    detailedDescription:
      "Libraria reimagines the traditional academic library by providing an elegant, cloud-hosted digital repository of engineering textbooks, reference materials, research papers, and curated study modules. Designed for high accessibility, Libraria empowers thousands of students across semesters to locate the exact reference material they need with just a few keystrokes.",
    problemStatement:
      "Physical library operating hours, limited textbook inventory, and disorganized third-party PDF repositories create recurring bottlenecks for students preparing for coursework, lab sessions, and semester examinations.",
    solution:
      "A blazing-fast, centralized digital library catalog with intelligent semantic search, subject-wise tagging, digital reader integration, and community-contributed recommendations.",
    features: [
      "Instant Full-Text & Subject Catalog Search",
      "Semester-wise Department & Subject Filtering",
      "Cloud-Optimized Digital Resource Viewing & Bookmarking",
      "Student Recommendations and Popular Read Rankings",
      "Lightweight & Mobile-Optimized Reader Experience",
    ],
    team: [
      { name: "The Uniques 1.0", role: "Founding Engineering Team", initials: "TU" },
    ],
    status: "Completed",
    image: "/projects/libraria.webp",
    technologies: ["REACT", "NODE.JS", "MONGODB", "TAILWIND"],
    category: "Digital Library",
    link: "https://libraria-tu.vercel.app/",
    liveUrl: "https://libraria-tu.vercel.app/",
    githubUrl: "https://github.com/theuniquesofflicial",
    buttonColor: "#ea384c",
    createdAt: "2026-01-10",
  },
  {
    id: 3,
    title: "TU Portal",
    batch: "Uniques 1.0",
    description:
      "A centralized student data portal containing profiles, academic information, records, and essential data of all Uniques students.",
    overview:
      "The single source of truth for The Uniques Community student records, tracking member milestones, verification status, project portfolios, and administrative records.",
    detailedDescription:
      "TU Portal is the core administrative and academic spine of The Uniques Community. Serving hundreds of registered members across consecutive batches, the portal centralizes student profiles, skills verification, project contributions, event attendance, and community credentials into a single authenticated ecosystem.",
    problemStatement:
      "Managing student profiles, verifying event participations, and coordinating member milestones across fragmented spreadsheets leads to administrative friction, duplicate entries, and lack of accountability.",
    solution:
      "An enterprise-grade, role-based community management platform providing authenticated student dashboards, administrative verification tools, and real-time community directory sync.",
    features: [
      "Role-Based Access Control (Admin, Coordinator, Member)",
      "Centralized Student Profile & Skill Credential Verification",
      "Automated Attendance & Community Milestone Tracking",
      "Batch-wise Analytics, Performance Reports & Data Export",
      "Seamless Integration with Community Notification Channels",
    ],
    team: [
      { name: "The Uniques 1.0", role: "Lead Architecture Team", initials: "TU" },
      { name: "Admin Council", role: "Community Operations", initials: "AC" },
    ],
    status: "Live / Production",
    image: "/projects/tuportal.webp",
    technologies: ["REACT", "NODE.JS", "MONGODB", "TAILWIND"],
    category: "Student Records & LMS",
    link: "https://theuniquesportal.vercel.app/",
    liveUrl: "https://theuniquesportal.vercel.app/",
    githubUrl: "https://github.com/theuniquesofflicial",
    buttonColor: "#ea384c",
    createdAt: "2026-01-05",
  },
  {
    id: 4,
    title: "Code crusade 0.5",
    batch: "Uniques 5.0",
    description:
      "A 7-day intensive workshop designed to develop industry-grade coding skills and evaluate students' knowledge through practical tests.",
    overview:
      "An intensive developer bootcamp and real-time coding challenge portal designed to elevate fundamental algorithmic thinking into production-level problem-solving.",
    detailedDescription:
      "Code Crusade 0.5 was conceptualized as a high-intensity programming sprint that immersed student developers in real-world problem sets, algorithmic patterns, and clean code principles. Built with an integrated challenge submission and automated evaluation suite, the platform tracked participant solutions in real-time throughout the seven-day workshop.",
    problemStatement:
      "Engineering students often lack hands-on, test-driven programming practice, struggling to bridge the gap between academic theory and competitive coding standards.",
    solution:
      "A structured daily module platform combining guided workshop curricula, automated test harnesses, and leaderboard-driven assessments.",
    features: [
      "7-Day Progressive Challenge Curriculum (Beginner to Advanced)",
      "Automated Test Case Runner with Instant Execution Feedback",
      "Live Gamified Leaderboard with Real-Time Ranking Updates",
      "Detailed Solution Walkthroughs & Peer Code Reviews",
      "Automated Digital Certificate of Completion Generation",
    ],
    team: [
      { name: "The Uniques 5.0", role: "Curriculum & Tech Team", initials: "TU" },
      { name: "Competitive Coding Leads", role: "Problem Setters", initials: "CC" },
    ],
    status: "Completed",
    image: "/projects/codecrusade.webp",
    technologies: ["WORKSHOP", "CODING", "ASSESSMENT", "PYTHON"],
    category: "Workshop & Testing",
    link: "https://codecrusade2026.vercel.app/",
    liveUrl: "https://codecrusade2026.vercel.app/",
    githubUrl: "https://github.com/theuniquesofflicial",
    buttonColor: "#ea384c",
    createdAt: "2026-02-01",
  },
  {
    id: 5,
    title: "Ideajam 2026",
    batch: "Uniques 4.0",
    description:
      "An internal hackathon portal enabling student teams to pitch innovative ideas and selecting top teams to participate in the Smart India Hackathon (SIH).",
    overview:
      "The premier internal innovation battleground for The Uniques Community, serving as the official incubation and screening pipeline for national competitions like SIH.",
    detailedDescription:
      "Ideajam 2026 served as the premier internal innovation battleground for The Uniques Community. Built to simulate national hackathon pressure, the web portal enabled dozens of multi-disciplinary teams to submit pitch decks, problem solutions, and prototypes for scrutiny by senior industry mentors and jury panels selecting finalists for the Smart India Hackathon (SIH).",
    problemStatement:
      "Filtering high-potential student projects and assembling balanced teams for national competitions requires rigorous, transparent screening, structured feedback rounds, and documented rubric scoring.",
    solution:
      "An end-to-end hackathon management system covering idea submissions, jury scoring rubrics, mentor feedback rounds, and finalist shortlisting.",
    features: [
      "Team Formation & Multi-Member Invitation System",
      "SIH Problem Statement Categorization & Deck Uploads",
      "Standardized Jury Scoring Rubric with Real-time Normalization",
      "Interactive Mentorship Slot Booking & Review Feedback Logs",
      "Stage-wise Milestone Announcements & Finalist Showcases",
    ],
    team: [
      { name: "The Uniques 4.0", role: "Hackathon Council", initials: "TU" },
    ],
    status: "Completed",
    image: "/projects/ideajam2026.webp",
    technologies: ["REACT", "NODE.JS", "TAILWIND", "SIH"],
    category: "Hackathon & SIH",
    link: "https://ideajam2026.vercel.app/",
    liveUrl: "https://ideajam2026.vercel.app/",
    githubUrl: "https://github.com/theuniquesofflicial",
    buttonColor: "#ea384c",
    createdAt: "2026-02-15",
  },
  {
    id: 6,
    title: "Eureka - National Ideathon",
    batch: "Uniques 4.0",
    description:
      "A national-level ideathon platform organized across diverse universities for student innovators to pitch disruptive solutions and compete.",
    overview:
      "A cross-university innovation arena bringing together creative thinkers, technologists, and aspiring student founders to pitch sustainable tech solutions for real-world impact.",
    detailedDescription:
      "Eureka is a flagship national-level ideathon organized by The Uniques Community, uniting young technologists, designers, and entrepreneurs from top universities across the country. The platform provided a streamlined gateway for hundreds of participants to submit disruptive concepts addressing sustainability, healthcare, AI ethics, and financial inclusion.",
    problemStatement:
      "Student innovators rarely receive inter-college visibility, seed mentorship, or structured platforms to showcase early-stage prototypes to industry practitioners and angel mentors.",
    solution:
      "A national web platform handling cross-college registrations, abstract evaluations, mentor allocations, and showcase exhibitions.",
    features: [
      "Nationwide Multi-University Team Registration Portal",
      "4 Dedicated Innovation Tracks (FinTech, GreenTech, HealthTech, AI)",
      "Double-Blind Abstract Screening by Veteran Reviewers",
      "Live Pitch Event Schedule & Virtual Room Routing",
      "Digital Certificate Verification for All Participants",
    ],
    team: [
      { name: "The Uniques 4.0", role: "Organizing Committee", initials: "TU" },
    ],
    status: "Completed",
    image: "/projects/eureka.webp",
    technologies: ["REACT", "NODE.JS", "MONGODB", "INNOVATION"],
    category: "National Ideathon",
    link: "https://eureka-cyan-six.vercel.app/",
    liveUrl: "https://eureka-cyan-six.vercel.app/",
    githubUrl: "https://github.com/theuniquesofflicial",
    buttonColor: "#ea384c",
    createdAt: "2026-02-20",
  },
  {
    id: 7,
    title: "Elevate 3.0",
    batch: "Uniques 4.0",
    description:
      "An official induction and orientation web portal organized for first-year students to inspire, connect, and onboard them into the community.",
    overview:
      "The flagship onboarding experience of The Uniques Community, welcoming incoming freshmen into an ecosystem of peer learning, technology domains, and leadership opportunities.",
    detailedDescription:
      "Elevate 3.0 represents the flagship onboarding experience of The Uniques Community, welcoming incoming freshmen into an ecosystem of peer learning, technology domains, and leadership opportunities. Featuring high-energy animations, domain breakdowns, mentor introductions, and an integrated induction form, the platform engaged hundreds of first-year students.",
    problemStatement:
      "Freshers entering university often feel overwhelmed and unaware of active technical communities, club cultures, and skill development paths.",
    solution:
      "An interactive portal with timeline roadmaps, domain overviews, orientation schedules, and direct community registration.",
    features: [
      "Fluid Framer Motion Interactive Presentations & Domain Spotlights",
      "Live Orientation Itinerary & Speaker Announcements",
      "One-Click Freshman Induction Registration & Skill Survey",
      "Alumni & Senior Success Story Interactive Carousel",
      "Direct Community Onboarding Channels",
    ],
    team: [
      { name: "The Uniques 4.0", role: "Induction Committee", initials: "TU" },
    ],
    status: "Completed",
    image: "/projects/elevate.webp",
    technologies: ["REACT", "TAILWIND", "FRAMER", "INDUCTION"],
    category: "Induction & Orientation",
    link: "https://elevate-sviet.vercel.app/",
    liveUrl: "https://elevate-sviet.vercel.app/",
    githubUrl: "https://github.com/theuniquesofflicial",
    buttonColor: "#ea384c",
    createdAt: "2026-03-01",
  },
  {
    id: 8,
    title: "Uniques E-Gyan",
    batch: "Uniques 4.0",
    description:
      "A centralized academic platform providing students with PYQs, notes, study materials, and exam-focused resources.",
    overview:
      "A comprehensive academic knowledge portal curated by top-performing seniors to help students excel in university examinations and competitive tests.",
    detailedDescription:
      "Uniques E-Gyan is a comprehensive academic knowledge portal developed to democratize high-quality study materials across all engineering disciplines. Curated by top scorers and academic coordinators, the platform organizes handwritten notes, syllabus blueprints, and previous year examination solutions into an easily searchable archive.",
    problemStatement:
      "Exam study materials, previous year question papers (PYQs), and handwritten notes are typically scattered across drives, making last-minute exam preparation chaotic.",
    solution:
      "A structured, searchable knowledge base categorized by semester, branch, subject code, and exam type.",
    features: [
      "Complete Repository of University Previous Year Questions (PYQs)",
      "Handwritten Verified Lecture Notes by Top Academic Performers",
      "Semester & Branch Hierarchical Navigation Filter",
      "Fast Cloud PDF Downloads with Offline Accessibility",
      "Community Note Contribution & Review Verification System",
    ],
    team: [
      { name: "The Uniques 4.0", role: "Academic Cell Leads", initials: "TU" },
    ],
    status: "Active",
    image:
      "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=1200&q=80",
    technologies: ["REACT", "NODE.JS", "MONGODB", "TAILWIND"],
    category: "Academic & Learning",
    link: "https://github.com/theuniquesofflicial",
    liveUrl: null,
    githubUrl: "https://github.com/theuniquesofflicial",
    buttonColor: "#ea384c",
    createdAt: "2026-03-10",
  },
  {
    id: 9,
    title: "Uniques Assess",
    batch: "Uniques 4.0",
    description:
      "An online assessment platform for conducting college examinations, managing tests, evaluating students, and tracking performance.",
    overview:
      "A robust computerized examination and aptitude evaluation platform built to conduct secure campus assessments, mock placement tests, and weekly quizzes.",
    detailedDescription:
      "Uniques Assess is an automated testing platform engineered to administer mock placement tests, coding assessments, and semester practice exams. Featuring real-time proctoring safeguards, auto-grading pipelines, and deep sectional analytics, it allows students to benchmark their readiness against industry standards.",
    problemStatement:
      "Manual test evaluation and physical exam papers take excessive turnaround time and lack detailed performance analytics for students to gauge their weak areas.",
    solution:
      "An automated online testing platform equipped with timed quizzes, randomized questions, auto-grading, and deep sectional analytics.",
    features: [
      "Timed Online Test Runner with Tab-Switch Monitoring",
      "Instant Automated Evaluation for Objective & Subjective Questions",
      "Detailed Sectional Performance Breakdown and Percentile Benchmarks",
      "Instructor Dashboard for Question Bank Management",
      "Automated Student Scorecard & Rank Generation",
    ],
    team: [
      { name: "The Uniques 4.0", role: "Evaluation & Tech Wing", initials: "TU" },
    ],
    status: "Active",
    image:
      "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1200&q=80",
    technologies: ["REACT", "NODE.JS", "MONGODB", "TAILWIND"],
    category: "Assessment & Exams",
    link: "https://github.com/theuniquesofflicial",
    liveUrl: null,
    githubUrl: "https://github.com/theuniquesofflicial",
    buttonColor: "#ea384c",
    createdAt: "2026-03-15",
  },
  {
    id: 10,
    title: "Uniques 360",
    batch: "Uniques 1.0",
    description:
      "An all-in-one student platform providing a complete view of academics, activities, performance, and community engagement.",
    overview:
      "An all-in-one student platform providing a complete view of academics, activities, performance, and community engagement.",
    detailedDescription:
      "Uniques 360 delivers an overarching bird's-eye view of a student's holistic growth throughout their college journey. Synthesizing academic metrics, technical project milestones, event participation, and leadership contributions, Uniques 360 generates a verified digital portfolio that students can present to recruiters and mentors.",
    problemStatement:
      "Student contributions across events, tech projects, and academics are siloed, preventing students from presenting a unified portfolio of their campus journey.",
    solution:
      "A centralized analytics dashboard synthesizing student achievements, event attendance, and project deliverables into one verifiable digital profile.",
    features: [
      "360° Comprehensive Student Activity & Performance Dashboard",
      "Real-time Performance & Attendance Analytics",
      "Verified Achievement & Badge Timeline",
      "One-click Shareable Portfolio Resume",
      "Year-over-Year Progression and Activity Heatmaps",
    ],
    team: [
      { name: "The Uniques 1.0", role: "Founding Engineering Wing", initials: "TU" },
    ],
    status: "Active",
    image:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80",
    technologies: ["REACT", "NODE.JS", "MONGODB", "TAILWIND"],
    category: "Analytics & Activities",
    link: "https://github.com/theuniquesofflicial",
    liveUrl: null,
    githubUrl: "https://github.com/theuniquesofflicial",
    buttonColor: "#ea384c",
    createdAt: "2026-03-20",
  },
];

export const PROJECT_BATCHES = [
  "Uniques 1.0",
  "Uniques 2.0",
  "Uniques 3.0",
  "Uniques 4.0",
  "Uniques 5.0",
];

export const PROJECT_CATEGORIES = [
  "Support & Mentorship",
  "Digital Library",
  "Student Records & LMS",
  "Workshop & Testing",
  "Hackathon & SIH",
  "National Ideathon",
  "Induction & Orientation",
  "Academic & Learning",
  "Assessment & Exams",
  "Analytics & Activities",
  "Web Application",
  "Mobile Application",
  "AI & ML",
  "Others",
];

const STORAGE_KEY = "tu_community_projects";

// Normalizes project objects so both id and _id work seamlessly
const normalizeProject = (p) => ({
  ...p,
  id: p._id || p.id,
  _id: p._id || p.id,
});

export const getStoredProjects = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_PROJECTS));
      return INITIAL_PROJECTS.map(normalizeProject);
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Merge with INITIAL_PROJECTS so enriched fields are always present
      return parsed.map((item) => {
        const initialMatch = INITIAL_PROJECTS.find(
          (init) => String(init.id) === String(item.id) || init.title === item.title
        );
        return normalizeProject({
          ...(initialMatch || {}),
          ...item,
        });
      });
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_PROJECTS));
    return INITIAL_PROJECTS.map(normalizeProject);
  } catch (err) {
    console.error("Error reading stored projects:", err);
    return INITIAL_PROJECTS.map(normalizeProject);
  }
};

// Fetch latest projects from MongoDB backend API and sync with localStorage cache
export const fetchProjects = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/api/projects`);
    if (response.data && response.data.success && Array.isArray(response.data.data)) {
      const normalized = response.data.data.map((item) => {
        const initialMatch = INITIAL_PROJECTS.find(
          (init) => String(init.id) === String(item.id) || init.title === item.title
        );
        return normalizeProject({
          ...(initialMatch || {}),
          ...item,
        });
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
      window.dispatchEvent(new CustomEvent("projects-updated", { detail: normalized }));
      return normalized;
    }
  } catch (err) {
    console.warn("Backend /api/projects request failed, using cached projects:", err?.message || err);
  }
  return getStoredProjects();
};

// Add new project - calls MongoDB Backend API + falls back to cache
export const addProject = async (projectData) => {
  try {
    const response = await axios.post(`${BASE_URL}/api/projects`, projectData);
    if (response.data && response.data.success && response.data.data) {
      const saved = normalizeProject(response.data.data);
      const current = getStoredProjects();
      const updated = [saved, ...current.filter((p) => String(p._id) !== String(saved._id))];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent("projects-updated", { detail: updated }));
      return saved;
    }
  } catch (err) {
    console.error("Backend add project error, falling back locally:", err);
  }

  // Fallback if backend was unreachable
  const existing = getStoredProjects();
  const newProject = normalizeProject({
    ...projectData,
    id: `proj-${Date.now()}`,
    createdAt: new Date().toISOString(),
  });
  const updated = [newProject, ...existing];
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent("projects-updated", { detail: updated }));
  } catch (err) {
    console.error("Error saving project locally:", err);
  }
  return newProject;
};

// Update existing project in MongoDB Backend API
export const updateProject = async (id, projectData) => {
  try {
    const response = await axios.put(`${BASE_URL}/api/projects/${id}`, projectData);
    if (response.data && response.data.success && response.data.data) {
      const updatedItem = normalizeProject(response.data.data);
      const current = getStoredProjects();
      const updated = current.map((p) =>
        String(p._id) === String(id) || String(p.id) === String(id) ? updatedItem : p
      );
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent("projects-updated", { detail: updated }));
      return updatedItem;
    }
  } catch (err) {
    console.error("Backend update project error:", err);
  }

  const existing = getStoredProjects();
  const updated = existing.map((p) =>
    String(p.id) === String(id) || String(p._id) === String(id)
      ? { ...p, ...projectData }
      : p
  );
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent("projects-updated", { detail: updated }));
  return updated.find((p) => String(p.id) === String(id));
};

// Delete project in MongoDB Backend API
export const deleteProject = async (id) => {
  try {
    await axios.delete(`${BASE_URL}/api/projects/${id}`);
  } catch (err) {
    console.error("Backend delete project error:", err);
  }

  const existing = getStoredProjects();
  const updated = existing.filter((p) => String(p.id) !== String(id) && String(p._id) !== String(id));
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent("projects-updated", { detail: updated }));
  } catch (err) {
    console.error("Error deleting project from storage:", err);
  }
  return updated;
};

// Find single project by numeric id, mongo _id, "project-1", or slug
export const getProjectById = (id) => {
  if (!id) return null;
  const existing = getStoredProjects();
  const searchId = String(id).toLowerCase().trim();
  const cleanId = searchId.replace(/^project-/, "");

  const findInList = (list) =>
    list.find((p) => {
      if (String(p.id).toLowerCase() === searchId || String(p._id).toLowerCase() === searchId) return true;
      if (String(p.id).toLowerCase() === cleanId || String(p._id).toLowerCase() === cleanId) return true;
      const slug = (p.title || "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      if (slug === searchId) return true;
      return false;
    });

  const match = findInList(existing);
  if (match) return match;

  return findInList(INITIAL_PROJECTS.map(normalizeProject));
};
