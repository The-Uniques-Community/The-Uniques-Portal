import mongoose from "mongoose";

const SOURCE_URI = "mongodb+srv://theuniquescommunity:8tDZKcVhognadlOr@theuniques.tv8sz.mongodb.net/test?retryWrites=true&w=majority&appName=TheUniques";
const TARGET_URI = "mongodb+srv://jimfleax:jimfleax@local.f18dsim.mongodb.net/uniques_portal?appName=Local";

async function testConnections() {
  console.log("Testing connection to SOURCE cluster...");
  const sourceConn = await mongoose.createConnection(SOURCE_URI, {
    serverSelectionTimeoutMS: 8000,
    family: 4,
  }).asPromise();
  console.log("✅ SOURCE connected! DB Name:", sourceConn.name);
  const sourceCollections = await sourceConn.db.listCollections().toArray();
  console.log("Source collections found:", sourceCollections.map(c => c.name));

  console.log("\nTesting connection to TARGET cluster...");
  const targetConn = await mongoose.createConnection(TARGET_URI, {
    serverSelectionTimeoutMS: 8000,
    family: 4,
  }).asPromise();
  console.log("✅ TARGET connected! DB Name:", targetConn.name);
  const targetCollections = await targetConn.db.listCollections().toArray();
  console.log("Target collections found:", targetCollections.map(c => c.name));

  await sourceConn.close();
  await targetConn.close();
  console.log("\nConnections closed successfully.");
}

testConnections().catch((err) => {
  console.error("❌ Connection test failed:", err.message);
  process.exit(1);
});
