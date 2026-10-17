import mongoose from "mongoose";
import dotenv from "dotenv";
import dbconnect from "./config/dbConfig.js";
import Project from "./models/projects/projectModel.js";

dotenv.config();

const ALL_PROJECTS = [
  {
    title: "UNI CARE",
    batch: "Uniques 4.0",
    description:
      "A student-support system that identifies potential problem areas and flags them for timely attention and appropriate support.",
    image: "/projects/unicare.webp",
    technologies: ["REACT", "NODE.JS", "MONGODB", "AI"],
    category: "Support & Mentorship",
    link: "https://uniques-care.vercel.app/",
    githubLink: "",
    buttonColor: "#ea384c",
    status: "Active",
    featured: true,
  },
  {
    title: "Libraria",
    batch: "Uniques 1.0",
    description:
      "A digital library platform that helps students discover, access, organize, and manage academic books and learning resources.",
    image: "/projects/libraria.webp",
    technologies: ["REACT", "NODE.JS", "MONGODB", "TAILWIND"],
    category: "Digital Library",
    link: "https://libraria-tu.vercel.app/",
    githubLink: "",
    buttonColor: "#ea384c",
    status: "Active",
    featured: true,
  },
  {
    title: "TU Portal",
    batch: "Uniques 1.0",
    description:
      "A centralized student data portal containing profiles, academic information, records, and essential data of all Uniques students.",
    image: "/projects/tuportal.webp",
    technologies: ["REACT", "NODE.JS", "MONGODB", "TAILWIND"],
    category: "Student Records & LMS",
    link: "https://theuniquesportal.vercel.app/",
    githubLink: "",
    buttonColor: "#ea384c",
    status: "Active",
    featured: true,
  },
  {
    title: "Code crusade 0.5",
    batch: "Uniques 5.0",
    description:
      "A 7-day intensive workshop designed to develop industry-grade coding skills and evaluate students' knowledge through practical tests.",
    image: "/projects/codecrusade.webp",
    technologies: ["WORKSHOP", "CODING", "ASSESSMENT", "PYTHON"],
    category: "Workshop & Testing",
    link: "https://codecrusade2026.vercel.app/",
    githubLink: "",
    buttonColor: "#ea384c",
    status: "Active",
    featured: false,
  },
  {
    title: "Ideajam 2026",
    batch: "Uniques 4.0",
    description:
      "An internal hackathon portal enabling student teams to pitch innovative ideas and selecting top teams to participate in the Smart India Hackathon (SIH).",
    image: "/projects/ideajam2026.webp",
    technologies: ["REACT", "NODE.JS", "TAILWIND", "SIH"],
    category: "Hackathon & SIH",
    link: "https://ideajam2026.vercel.app/",
    githubLink: "",
    buttonColor: "#ea384c",
    status: "Active",
    featured: false,
  },
  {
    title: "Eureka - National Ideathon",
    batch: "Uniques 4.0",
    description:
      "A national-level ideathon platform organized across diverse universities for student innovators to pitch disruptive solutions and compete.",
    image: "/projects/eureka.webp",
    technologies: ["REACT", "NODE.JS", "MONGODB", "INNOVATION"],
    category: "National Ideathon",
    link: "https://eureka-cyan-six.vercel.app/",
    githubLink: "",
    buttonColor: "#ea384c",
    status: "Active",
    featured: false,
  },
  {
    title: "Elevate 3.0",
    batch: "Uniques 4.0",
    description:
      "An official induction and orientation web portal organized for first-year students to inspire, connect, and onboard them into the community.",
    image: "/projects/elevate.webp",
    technologies: ["REACT", "TAILWIND", "FRAMER", "INDUCTION"],
    category: "Induction & Orientation",
    link: "https://elevate-sviet.vercel.app/",
    githubLink: "",
    buttonColor: "#ea384c",
    status: "Active",
    featured: false,
  },
  {
    title: "Uniques E-Gyan",
    batch: "Uniques 4.0",
    description:
      "A centralized academic platform providing students with PYQs, notes, study materials, and exam-focused resources.",
    image:
      "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=1200&q=80",
    technologies: ["REACT", "NODE.JS", "MONGODB", "TAILWIND"],
    category: "Academic & Learning",
    link: "https://github.com/theuniquesofflicial",
    githubLink: "https://github.com/theuniquesofflicial",
    buttonColor: "#ea384c",
    status: "Active",
    featured: false,
  },
  {
    title: "Uniques Assess",
    batch: "Uniques 4.0",
    description:
      "An online assessment platform for conducting college examinations, managing tests, evaluating students, and tracking performance.",
    image:
      "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1200&q=80",
    technologies: ["REACT", "NODE.JS", "MONGODB", "TAILWIND"],
    category: "Assessment & Exams",
    link: "https://github.com/theuniquesofflicial",
    githubLink: "https://github.com/theuniquesofflicial",
    buttonColor: "#ea384c",
    status: "Active",
    featured: false,
  },
  {
    title: "Uniques 360",
    batch: "Uniques 1.0",
    description:
      "An all-in-one student platform providing a complete view of academics, activities, performance, and community engagement.",
    image:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80",
    technologies: ["REACT", "NODE.JS", "MONGODB", "TAILWIND"],
    category: "Analytics & Activities",
    link: "https://github.com/theuniquesofflicial",
    githubLink: "https://github.com/theuniquesofflicial",
    buttonColor: "#ea384c",
    status: "Active",
    featured: false,
  },
];

export const seedProjects = async () => {
  try {
    await dbconnect();
    console.log("Connected to MongoDB, seeding projects...");

    for (const proj of ALL_PROJECTS) {
      await Project.findOneAndUpdate(
        { title: proj.title },
        { $set: proj },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      console.log(`✓ Project synced: ${proj.title}`);
    }

    const total = await Project.countDocuments();
    console.log(`\n🎉 Success! Total ${total} projects stored in database.`);
  } catch (error) {
    console.error("Error seeding projects:", error);
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
      console.log("MongoDB disconnected.");
    }
  }
};

// If run directly
if (process.argv[1]?.includes("seedProjects.js")) {
  seedProjects();
}
