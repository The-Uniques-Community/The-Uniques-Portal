/**
 * @file statsController.js
 * @description Controller managing top-level community metrics (earnings, clients, projects, events) displayed on the landing page hero counter.
 * @architecture Mounted at `/api/stats` via `statsRoute.js`. Interacts with `Stats` model.
 * @agent_note Automatically creates default metrics document if no statistical record exists in the database.
 */
import Stats from "../../models/community/statsModel.js";

const DEFAULT_STATS = {
  Earnings: 860000,
  Clients: 100,
  Projects: 150,
  Events: 40,
};

/**
 * @desc Retrieve the latest community statistics counter document, creating defaults if not yet initialized
 * @route GET /api/stats
 * @route GET /api/stats/all
 * @route GET /api/stats/counts
 * @access Public
 * @returns {Object} 200 - Statistics document containing Earnings, Clients, Projects, and Events
 * @returns {Object} 500 - Server error
 */
export const getStats = async (req, res) => {
  try {
    let stats = await Stats.findOne().sort({ updatedAt: -1 });
    if (!stats) {
      stats = await Stats.create(DEFAULT_STATS);
    }
    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ success: false, message: "Error fetching stats", error: error.message });
  }
};

/**
 * @desc Update numerical community achievement metrics
 * @route POST /api/stats
 * @route POST /api/stats/update
 * @route PUT /api/stats
 * @route PUT /api/stats/update
 * @access Public/Admin
 * @body {number} [Earnings] - Total revenue/earnings figure
 * @body {number} [Clients] - Count of clients served
 * @body {number} [Projects] - Count of completed projects
 * @body {number} [Events] - Count of hosted events
 * @returns {Object} 200 - Confirmation message and updated stats document
 * @returns {Object} 500 - Server error
 */
export const updateStats = async (req, res) => {
  try {
    const { Earnings, Clients, Projects, Events } = req.body;
    let stats = await Stats.findOne().sort({ updatedAt: -1 });
    
    if (stats) {
      if (Earnings !== undefined && Earnings !== null) stats.Earnings = Number(Earnings);
      if (Clients !== undefined && Clients !== null) stats.Clients = Number(Clients);
      if (Projects !== undefined && Projects !== null) stats.Projects = Number(Projects);
      if (Events !== undefined && Events !== null) stats.Events = Number(Events);
      await stats.save();
    } else {
      stats = await Stats.create({
        Earnings: Earnings !== undefined ? Number(Earnings) : DEFAULT_STATS.Earnings,
        Clients: Clients !== undefined ? Number(Clients) : DEFAULT_STATS.Clients,
        Projects: Projects !== undefined ? Number(Projects) : DEFAULT_STATS.Projects,
        Events: Events !== undefined ? Number(Events) : DEFAULT_STATS.Events,
      });
    }

    res.status(200).json({ success: true, message: "Stats updated successfully", data: stats });
  } catch (error) {
    console.error("Error updating stats:", error);
    res.status(500).json({ success: false, message: "Error updating stats", error: error.message });
  }
};
