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

const BASE = "http://localhost:5001";
const authHeaders = {
  headers: {
    Authorization: `Bearer ${adminToken}`,
    token: adminToken,
  },
};

async function testLiveBatchDelete() {
  console.log("=== Testing Live Batch Delete Functionality ===");

  const testBatchName = `The Uniques 99.0`;

  // 1. Add batch
  console.log(`1. Adding test batch "${testBatchName}"...`);
  const addRes = await axios.post(`${BASE}/api/batches/add`, { name: testBatchName }, authHeaders);
  console.log("Add response:", addRes.status, addRes.data);

  // 2. Add associated profile
  console.log(`2. Saving associated profile for "${testBatchName}"...`);
  const profileRes = await axios.post(
    `${BASE}/api/batches/profiles/update`,
    {
      profiles: [
        {
          id: "uniques-99.0",
          label: "Uniques 99.0",
          title: testBatchName,
          description: "Temporary test batch description",
          image: "",
          customImage: false,
        },
      ],
    },
    authHeaders
  );
  console.log("Profile update response status:", profileRes.status);

  // 3. Verify it exists
  const getBatchesRes = await axios.get(`${BASE}/api/batches/all`);
  const exists = getBatchesRes.data?.data?.includes(testBatchName);
  console.log(`Batch "${testBatchName}" exists in list?`, exists);
  if (!exists) throw new Error("Batch was not added!");

  // 4. Delete the batch completely using the delete endpoint
  console.log(`\n3. Deleting batch "${testBatchName}" via DELETE /api/batches/name/:name ...`);
  const deleteRes = await axios.delete(
    `${BASE}/api/batches/name/${encodeURIComponent(testBatchName)}`,
    authHeaders
  );
  console.log("Delete response:", deleteRes.status, deleteRes.data);

  // 5. Verify it is gone from both BatchName and BatchProfile
  const verifyBatches = await axios.get(`${BASE}/api/batches/all`);
  const stillExists = verifyBatches.data?.data?.includes(testBatchName);
  console.log(`Batch still in list?`, stillExists);

  const verifyProfiles = await axios.get(`${BASE}/api/batches/profiles`);
  const profileStillExists = verifyProfiles.data?.data?.some(
    (p) => p.title === testBatchName || p.id === "uniques-99.0"
  );
  console.log(`Profile still in list?`, profileStillExists);

  if (stillExists || profileStillExists) {
    throw new Error("Batch was NOT deleted completely!");
  }

  console.log("\n✅ SUCCESS: Batch and its profile were deleted completely from the database!");
}

testLiveBatchDelete().catch((err) => {
  console.error("Test failed:", err.response?.data || err.message);
  process.exit(1);
});
