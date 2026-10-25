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

const BASE = "http://localhost:5001";

async function runCrudTest() {
  console.log("=== Testing Project CRUD Lifecycle ===");

  // 1. CREATE PROJECT
  console.log("\n1. Creating test project...");
  const createRes = await fetch(`${BASE}/api/projects`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({
      title: "Test CRUD Showcase Project",
      batch: "Uniques 4.0",
      description: "A comprehensive test project demonstrating full CRUD functionality across portal and community.",
      category: "Web Application",
      technologies: ["REACT", "NODE.JS", "MONGODB"],
      image: "/projects/unicare.webp",
      link: "https://example.com/demo",
      status: "Active",
      featured: true,
    }),
  });

  const createData = await createRes.json();
  console.log("Create status:", createRes.status, createData.success);
  if (!createData.success || !createData.data?._id) {
    throw new Error("Failed to create project: " + JSON.stringify(createData));
  }
  const projectId = createData.data._id;
  console.log("Created Project ID:", projectId);

  // 2. READ PROJECT BY ID
  console.log("\n2. Fetching project by ID...");
  const getRes = await fetch(`${BASE}/api/projects/${projectId}`);
  const getData = await getRes.json();
  console.log("Get status:", getRes.status, "Title:", getData.data?.title);
  if (getData.data?.title !== "Test CRUD Showcase Project") {
    throw new Error("Project title mismatch in GET by ID");
  }

  // 3. UPDATE PROJECT
  console.log("\n3. Updating project...");
  const updateRes = await fetch(`${BASE}/api/projects/${projectId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({
      title: "Updated Test CRUD Showcase Project",
      status: "Completed",
    }),
  });
  const updateData = await updateRes.json();
  console.log("Update status:", updateRes.status, "New Title:", updateData.data?.title, "Status:", updateData.data?.status);
  if (updateData.data?.title !== "Updated Test CRUD Showcase Project" || updateData.data?.status !== "Completed") {
    throw new Error("Project update failed");
  }

  // 4. VERIFY IN GET ALL PROJECTS
  console.log("\n4. Verifying in listing...");
  const listRes = await fetch(`${BASE}/api/projects?search=Updated%20Test%20CRUD`);
  const listData = await listRes.json();
  console.log("Search results count:", listData.data?.length);
  const found = listData.data?.some((p) => p._id === projectId);
  console.log("Found in search:", found);
  if (!found) throw new Error("Created project not found in search");

  // 5. DELETE PROJECT
  console.log("\n5. Deleting project...");
  const deleteRes = await fetch(`${BASE}/api/projects/${projectId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${adminToken}`,
    },
  });
  const deleteData = await deleteRes.json();
  console.log("Delete status:", deleteRes.status, "Success:", deleteData.success);

  // 6. VERIFY 404 AFTER DELETION
  console.log("\n6. Verifying 404 after deletion...");
  const getDeletedRes = await fetch(`${BASE}/api/projects/${projectId}`);
  console.log("Get deleted status:", getDeletedRes.status);
  if (getDeletedRes.status !== 404) {
    throw new Error("Expected 404 after deletion, got: " + getDeletedRes.status);
  }

  console.log("\n✅ ALL BASIC CRUD TESTS PASSED FULLY!");
}

runCrudTest().catch((err) => {
  console.error("❌ Test failed:", err);
  process.exit(1);
});
