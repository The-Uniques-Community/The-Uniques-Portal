import axios from "axios";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const JWT_SECRET = process.env.JWT_SECRET;
const adminToken = jwt.sign(
  { id: "650000000000000000000001", role: "admin", email: "admin@theuniques.in" },
  JWT_SECRET,
  { expiresIn: "1h" }
);

async function main() {
  const BASE = "http://localhost:5001";
  const authHeaders = {
    headers: {
      Authorization: `Bearer ${adminToken}`,
      token: adminToken,
    },
  };

  // 1. Check existing projects
  const res = await axios.get(`${BASE}/api/projects?search=Uniques+Cloud+Hub`);
  const existing = res.data?.data?.find((p) => p.title === "Uniques Cloud Hub");

  if (existing) {
    console.log("Project 'Uniques Cloud Hub' already exists with ID:", existing._id);
    const updateRes = await axios.put(
      `${BASE}/api/projects/${existing._id}`,
      {
        image: "/api/image-proxy/1UeXEfwitlrN5aCve8GyJNSLLIxBRJdA_",
        featured: true,
        category: "Web Application",
        technologies: ["REACT", "NODE.JS", "GOOGLE CLOUD", "DOCKER"],
        description:
          "A unified multi-cloud resource dashboard and community collaboration hub built by Uniques developers.",
        batch: "Uniques 5.0",
        link: "https://theuniquescommunity.vercel.app",
        status: "Active",
      },
      authHeaders
    );
    console.log("Updated existing project successfully:", updateRes.data?.data?._id);
    console.log("Image set to:", updateRes.data?.data?.image);
    return;
  }

  // 2. Create project
  const createRes = await axios.post(
    `${BASE}/api/projects`,
    {
      title: "Uniques Cloud Hub",
      batch: "Uniques 5.0",
      category: "Web Application",
      description:
        "A unified multi-cloud resource dashboard and community collaboration hub built by Uniques developers.",
      technologies: ["REACT", "NODE.JS", "GOOGLE CLOUD", "DOCKER"],
      image: "/api/image-proxy/1UeXEfwitlrN5aCve8GyJNSLLIxBRJdA_",
      link: "https://theuniquescommunity.vercel.app",
      status: "Active",
      featured: true,
      contributors: ["The Uniques Team", "Cloud Wing"],
    },
    authHeaders
  );

  console.log("Created showcase project successfully!");
  console.log("ID:", createRes.data?.data?._id);
  console.log("Title:", createRes.data?.data?.title);
  console.log("Image:", createRes.data?.data?.image);
}

main().catch((err) => {
  console.error("Error creating project:", err.response?.data || err.message);
  process.exit(1);
});
