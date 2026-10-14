import Project from "../../models/projects/projectModel.js";

const INITIAL_SEED_PROJECTS = [
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

// Get all projects (auto-seed if empty)
export const getAllProjects = async (req, res) => {
  try {
    let projects = await Project.find().sort({ createdAt: -1 });
    
    if (!projects || projects.length === 0) {
      // Seed default initial projects
      await Project.insertMany(INITIAL_SEED_PROJECTS);
      projects = await Project.find().sort({ createdAt: -1 });
    }

    res.status(200).json({
      success: true,
      count: projects.length,
      data: projects,
    });
  } catch (error) {
    console.error("Error fetching projects:", error);
    res.status(500).json({ success: false, message: "Server error fetching projects", error: error.message });
  }
};

// Get single project
export const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    res.status(200).json({ success: true, data: project });
  } catch (error) {
    console.error("Error fetching project:", error);
    res.status(500).json({ success: false, message: "Server error fetching project", error: error.message });
  }
};

// Create new project
export const createProject = async (req, res) => {
  try {
    const { title, batch, description, image, technologies, category, link, githubLink, buttonColor, status, featured, contributors } = req.body;

    if (!title || !batch || !description) {
      return res.status(400).json({
        success: false,
        message: "Title, batch, and description are required",
      });
    }

    const newProject = new Project({
      title: title.trim(),
      batch: batch.trim(),
      description: description.trim(),
      image: image || "/projects/unicare.webp",
      technologies: Array.isArray(technologies) ? technologies : [technologies].filter(Boolean),
      category: category || "General",
      link: link || "#",
      githubLink: githubLink || "",
      buttonColor: buttonColor || "#ea384c",
      status: status || "Active",
      featured: typeof featured === "boolean" ? featured : false,
      contributors: Array.isArray(contributors) ? contributors : [],
    });

    const savedProject = await newProject.save();

    res.status(201).json({
      success: true,
      message: "Project created successfully",
      data: savedProject,
    });
  } catch (error) {
    console.error("Error creating project:", error);
    res.status(500).json({ success: false, message: "Server error creating project", error: error.message });
  }
};

// Update project
export const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updated = await Project.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    res.status(200).json({
      success: true,
      message: "Project updated successfully",
      data: updated,
    });
  } catch (error) {
    console.error("Error updating project:", error);
    res.status(500).json({ success: false, message: "Server error updating project", error: error.message });
  }
};

// Delete project
export const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Project.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    res.status(200).json({
      success: true,
      message: "Project deleted successfully",
      data: deleted,
    });
  } catch (error) {
    console.error("Error deleting project:", error);
    res.status(500).json({ success: false, message: "Server error deleting project", error: error.message });
  }
};
