import axios from "axios";
import { INITIAL_PROJECTS, mergeWithInitialProjects } from "../../../theuniquescommunity/src/utils/project/projectsData.js";

async function testProjects(url) {
  console.log(`\nTesting from: ${url}`);
  try {
    const res = await axios.get(`${url}/api/projects`);
    console.log(`HTTP ${res.status}, count: ${res.data?.count}, total: ${res.data?.pagination?.total}`);
    const items = res.data?.data;
    console.log("Raw items count:", items.length);
    console.log("Raw titles:", items.map(p => p.title));

    const merged = mergeWithInitialProjects(items);
    console.log("Merged count:", merged.length);
    console.log("Merged titles:", merged.map(p => p.title));

    // Check Uniques eGyan
    const found = merged.find(p => p.title.toLowerCase().includes("egyan") || p.title.toLowerCase().includes("e-gyan"));
    console.log("Found eGyan in merged:", found ? { id: found.id, _id: found._id, title: found.title, batch: found.batch, category: found.category } : "NOT FOUND");

    // Filter test:
    const batches = ["all", "Uniques 1.0", "Uniques 2.0", "Uniques 3.0", "Uniques 4.0", "Uniques 5.0"];
    for (const b of batches) {
      const filtered = merged.filter(p => {
        const matchesBatch =
          b === "all" ||
          p.batch === b ||
          p.batch?.replace("The ", "") === b.replace("The ", "");
        return matchesBatch;
      });
      console.log(`Filter [${b}]: count = ${filtered.length}, contains eGyan? ${filtered.some(p => p.title.toLowerCase().includes("egyan"))}`);
    }
  } catch (err) {
    console.error("Error:", err.message);
  }
}

async function run() {
  await testProjects("http://localhost:5001");
  await testProjects("https://the-uniques-portal.vercel.app");
}

run();
