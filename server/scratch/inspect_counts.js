import mongoose from "mongoose";

const SOURCE_URI = "mongodb+srv://theuniquescommunity:8tDZKcVhognadlOr@theuniques.tv8sz.mongodb.net/test?retryWrites=true&w=majority&appName=TheUniques";
const TARGET_URI = "mongodb+srv://jimfleax:jimfleax@local.f18dsim.mongodb.net/uniques_portal?appName=Local";

async function inspectCollections() {
  const sourceConn = await mongoose.createConnection(SOURCE_URI, { family: 4 }).asPromise();
  const targetConn = await mongoose.createConnection(TARGET_URI, { family: 4 }).asPromise();

  const sourceCols = (await sourceConn.db.listCollections().toArray())
    .map(c => c.name)
    .filter(n => !n.startsWith("system."))
    .sort();

  console.log("Found", sourceCols.length, "collections in source (test):");
  console.log("---------------------------------------------------------------");
  console.log("Collection".padEnd(25) + "Source Count".padEnd(15) + "Target Count");
  console.log("---------------------------------------------------------------");

  for (const col of sourceCols) {
    const sCount = await sourceConn.db.collection(col).countDocuments();
    let tCount = 0;
    try {
      tCount = await targetConn.db.collection(col).countDocuments();
    } catch {
      tCount = -1; // Not found
    }
    console.log(col.padEnd(25) + String(sCount).padEnd(15) + String(tCount));
  }

  await sourceConn.close();
  await targetConn.close();
}

inspectCollections().catch(console.error);
