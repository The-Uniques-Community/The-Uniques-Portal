import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import FormData from "form-data";

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

async function testUpload() {
  console.log("=== Testing Live Project Thumbnail Upload ===");

  // Create a minimal 1x1 PNG dummy buffer
  const dummyPng = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
    "base64"
  );
  const tempPath = path.resolve(__dirname, "dummy_project_thumb.png");
  fs.writeFileSync(tempPath, dummyPng);

  const form = new FormData();
  form.append("file", fs.createReadStream(tempPath));
  form.append("batch", "Uniques 4.0");
  form.append("title", "Test Project Alpha");

  console.log("Uploading dummy image to /upload/project_file_upload...");
  const res = await fetch(`${BASE}/upload/project_file_upload`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${adminToken}`,
      ...form.getHeaders(),
    },
    body: form,
  });

  const data = await res.json();
  console.log("Response status:", res.status);
  console.log("Response data:", data);

  if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);

  if (!data.success || !data.file?.fileId) {
    throw new Error("Upload failed: " + JSON.stringify(data));
  }

  console.log("\nTesting reading uploaded image via /api/image-proxy/:fileId...");
  const proxyRes = await fetch(`${BASE}/api/image-proxy/${data.file.fileId}`);
  console.log("Proxy response status:", proxyRes.status);
  console.log("Content-Type:", proxyRes.headers.get("content-type"));

  if (proxyRes.status !== 200) {
    throw new Error("Failed to retrieve image through proxy: " + proxyRes.status);
  }

  console.log("✅ Live Google Drive Project Thumbnail Upload & Proxy Read SUCCESSFUL!");
  return data.file;
}

testUpload().catch((err) => {
  console.error("❌ Test failed:", err);
  process.exit(1);
});
