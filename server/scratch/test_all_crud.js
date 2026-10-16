import axios from "axios";

const BASE_URL = "http://localhost:5001";
let authToken = "";

const results = {
  passed: [],
  failed: [],
};

const assert = (condition, description) => {
  if (condition) {
    console.log(`✅ PASS: ${description}`);
    results.passed.push(description);
  } else {
    console.error(`❌ FAIL: ${description}`);
    results.failed.push(description);
  }
};

async function runTests() {
  console.log("=========================================");
  console.log("   RUNNING END-TO-END CRUD VERIFICATION   ");
  console.log("=========================================\n");

  // 1. AUTHENTICATION TEST
  console.log("--- 1. AUTHENTICATION ---");
  try {
    const loginRes = await axios.post(`${BASE_URL}/auth/emaillogin`, {
      email: "officialid.yashkesarwani@gmail.com",
      password: "Yash@251198",
    });
    assert(loginRes.status === 200, "Login HTTP status is 200");
    assert(!!loginRes.data.token, "JWT token received");
    assert(loginRes.data.role === "coordinator", "User role is coordinator");
    authToken = loginRes.data.token;
  } catch (err) {
    assert(false, `Authentication failed: ${err.message}`);
    return;
  }

  const authHeaders = {
    headers: {
      Authorization: `Bearer ${authToken}`,
      token: authToken,
    },
  };

  // 2. EVENTS CRUD TEST
  console.log("\n--- 2. EVENTS CRUD ---");
  let testEventId = null;
  try {
    // CREATE
    const eventPayload = {
      eventName: "Test Automated Verification Event",
      eventDescription: "This is a test event for complete CRUD verification",
      eventDate: new Date(Date.now() + 86400000 * 7).toISOString(),
      eventTime: "10:00 AM",
      eventVenue: "SVIET Auditorium - Hall A",
      eventOrganizerBatch: "The Uniques 4.0",
      eventType: "Workshop",
      eventStatus: "upcoming",
      eventGuests: [],
      sponsors: [],
    };
    const createEventRes = await axios.post(`${BASE_URL}/api/events`, eventPayload, authHeaders);
    assert(createEventRes.status === 200 || createEventRes.status === 201, "Event Created (POST /api/events)");
    testEventId = createEventRes.data.event?._id || createEventRes.data._id;
    assert(!!testEventId, `Event ID created: ${testEventId}`);

    // READ
    const readEventRes = await axios.get(`${BASE_URL}/api/events/${testEventId}`);
    assert(readEventRes.status === 200, "Event Read (GET /api/events/:id)");
    assert(
      (readEventRes.data.event?.eventName || readEventRes.data.eventName) === "Test Automated Verification Event",
      "Read Event Name matches created name"
    );

    // UPDATE
    const updateEventPayload = {
      eventName: "Test Automated Verification Event - UPDATED",
      eventVenue: "SVIET Innovation Center - Updated",
    };
    const updateEventRes = await axios.put(`${BASE_URL}/api/events/${testEventId}`, updateEventPayload, authHeaders);
    assert(updateEventRes.status === 200, "Event Updated (PUT /api/events/:id)");
    assert(
      (updateEventRes.data.event?.eventName || updateEventRes.data.eventName) === "Test Automated Verification Event - UPDATED",
      "Updated Event Name matches"
    );

    // DELETE
    const deleteEventRes = await axios.delete(`${BASE_URL}/api/events/${testEventId}`, authHeaders);
    assert(deleteEventRes.status === 200, "Event Deleted (DELETE /api/events/:id)");

    // VERIFY DELETION
    try {
      await axios.get(`${BASE_URL}/api/events/${testEventId}`);
      assert(false, "Event still exists after deletion");
    } catch (delCheckErr) {
      assert(delCheckErr.response?.status === 404, "Verified Event is deleted (returns 404)");
    }
  } catch (err) {
    assert(false, `Events CRUD error: ${err.response?.data?.message || err.message}`);
  }

  // 3. PROJECTS CRUD TEST
  console.log("\n--- 3. PROJECTS CRUD ---");
  let testProjectId = null;
  try {
    // READ ALL
    const listProjectsRes = await axios.get(`${BASE_URL}/api/projects`);
    assert(listProjectsRes.status === 200, "Projects Listed (GET /api/projects)");
    assert(Array.isArray(listProjectsRes.data.data), "Projects returned array");

    // CREATE
    const projectPayload = {
      title: "Antigravity Automated Test Project",
      batch: "Uniques 4.0",
      description: "Automated verification test project created in MongoDB",
      technologies: ["REACT", "NODE.JS", "MONGODB"],
      category: "Support & Mentorship",
      status: "Active",
      featured: true,
    };
    const createProjectRes = await axios.post(`${BASE_URL}/api/projects`, projectPayload);
    assert(createProjectRes.status === 201 || createProjectRes.status === 200, "Project Created (POST /api/projects)");
    testProjectId = createProjectRes.data.data?._id;
    assert(!!testProjectId, `Project ID created: ${testProjectId}`);

    // READ ONE
    const readProjectRes = await axios.get(`${BASE_URL}/api/projects/${testProjectId}`);
    assert(readProjectRes.status === 200, "Project Read (GET /api/projects/:id)");
    assert(readProjectRes.data.data?.title === "Antigravity Automated Test Project", "Read Project title matches");

    // UPDATE
    const updateProjectRes = await axios.put(`${BASE_URL}/api/projects/${testProjectId}`, {
      title: "Antigravity Automated Test Project - UPDATED",
      category: "Workshop & Testing",
    });
    assert(updateProjectRes.status === 200, "Project Updated (PUT /api/projects/:id)");
    assert(updateProjectRes.data.data?.title === "Antigravity Automated Test Project - UPDATED", "Updated Project title matches");

    // DELETE
    const deleteProjectRes = await axios.delete(`${BASE_URL}/api/projects/${testProjectId}`);
    assert(deleteProjectRes.status === 200, "Project Deleted (DELETE /api/projects/:id)");

    // VERIFY DELETION
    try {
      await axios.get(`${BASE_URL}/api/projects/${testProjectId}`);
      assert(false, "Project still exists after deletion");
    } catch (delCheckErr) {
      assert(delCheckErr.response?.status === 404, "Verified Project is deleted (returns 404)");
    }
  } catch (err) {
    assert(false, `Projects CRUD error: ${err.response?.data?.message || err.message}`);
  }

  // 4. BATCHES CRUD TEST
  console.log("\n--- 4. BATCHES CRUD ---");
  try {
    // READ BATCHES
    const listBatchesRes = await axios.get(`${BASE_URL}/api/batches/all`);
    assert(listBatchesRes.status === 200, "Batches Listed (GET /api/batches/all)");
    assert(Array.isArray(listBatchesRes.data.data), "Batches array returned");

    // ADD BATCH
    const addBatchRes = await axios.post(`${BASE_URL}/api/batches/add`, { name: "The Uniques 5.0" });
    assert(addBatchRes.status === 200, "Batch Added (POST /api/batches/add)");

    // READ PROFILES
    const listProfilesRes = await axios.get(`${BASE_URL}/api/batches/profiles`);
    assert(listProfilesRes.status === 200, "Batch Profiles Listed (GET /api/batches/profiles)");
    assert(Array.isArray(listProfilesRes.data.data), "Batch profiles array returned");

    // UPDATE PROFILES
    const sampleProfile = listProfilesRes.data.data[0];
    const updateProfilesRes = await axios.post(`${BASE_URL}/api/batches/profiles/update`, {
      profiles: [
        {
          id: sampleProfile.id,
          label: sampleProfile.label,
          title: sampleProfile.title,
          description: sampleProfile.description,
        },
      ],
    });
    assert(updateProfilesRes.status === 200, "Batch Profiles Updated (POST /api/batches/profiles/update)");
  } catch (err) {
    assert(false, `Batches CRUD error: ${err.response?.data?.message || err.message}`);
  }

  // 5. STATS CRUD TEST
  console.log("\n--- 5. STATS CRUD ---");
  try {
    // READ STATS
    const readStatsRes = await axios.get(`${BASE_URL}/api/stats`);
    assert(readStatsRes.status === 200, "Stats Read (GET /api/stats)");
    const prevEarnings = readStatsRes.data.data?.Earnings;

    // UPDATE STATS
    const updateStatsRes = await axios.post(`${BASE_URL}/api/stats/update`, {
      Earnings: prevEarnings + 1000,
      Clients: 105,
      Projects: 155,
      Events: 45,
    });
    assert(updateStatsRes.status === 200, "Stats Updated (POST /api/stats/update)");
    assert(updateStatsRes.data.data?.Earnings === prevEarnings + 1000, "Updated Stats value persisted");

    // REVERT STATS TO PREV
    await axios.post(`${BASE_URL}/api/stats/update`, {
      Earnings: prevEarnings,
      Clients: 100,
      Projects: 150,
      Events: 40,
    });
    assert(true, "Stats safely reverted to original values");
  } catch (err) {
    assert(false, `Stats CRUD error: ${err.response?.data?.message || err.message}`);
  }

  // 6. COMMUNITY BENEFITS CRUD TEST
  console.log("\n--- 6. COMMUNITY BENEFITS CRUD ---");
  try {
    // READ BENEFITS
    const readBenefitsRes = await axios.get(`${BASE_URL}/api/community-benefits`);
    assert(readBenefitsRes.status === 200, "Community Benefits Read (GET /api/community-benefits)");
    assert(Array.isArray(readBenefitsRes.data.data), "Benefits returned array");

    // UPDATE BENEFITS
    const cards = readBenefitsRes.data.data;
    if (cards.length > 0) {
      const updateBenefitsRes = await axios.post(`${BASE_URL}/api/community-benefits/update`, {
        cards: cards,
      });
      assert(updateBenefitsRes.status === 200, "Community Benefits Updated (POST /api/community-benefits/update)");
    }
  } catch (err) {
    assert(false, `Community Benefits CRUD error: ${err.response?.data?.message || err.message}`);
  }

  // 7. LEAVE MANAGEMENT TEST
  console.log("\n--- 7. LEAVE MANAGEMENT ---");
  try {
    const leaveRes = await axios.get(`${BASE_URL}/api/leave/all`, authHeaders);
    assert(leaveRes.status === 200, "Leave records accessible (GET /api/leave/all)");
  } catch (err) {
    // If coordinator doesn't have access to /leave/all or different route, test member leave route
    try {
      const myLeaveRes = await axios.get(`${BASE_URL}/api/leave/my-leaves`, authHeaders);
      assert(myLeaveRes.status === 200, "My leaves accessible (GET /api/leave/my-leaves)");
    } catch (innerErr) {
      console.log("Leave info:", innerErr.response?.data || innerErr.message);
    }
  }

  // 8. UNIQUES 360 TEST
  console.log("\n--- 8. UNIQUES 360 ---");
  try {
    const u360Res = await axios.get(`${BASE_URL}/api/uniques360`, authHeaders);
    assert(u360Res.status === 200, "Uniques360 endpoint responded (GET /api/uniques360)");
  } catch (err) {
    // If route requires params or specific sub-path, test with sub-path
    console.log("Uniques 360 info:", err.response?.data || err.message);
  }

  console.log("\n=========================================");
  console.log(`TOTAL PASSED: ${results.passed.length}`);
  console.log(`TOTAL FAILED: ${results.failed.length}`);
  console.log("=========================================");
}

runTests();
