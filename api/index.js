/**
 * @file index.js
 * @description Serverless entry point for Vercel deployment exporting the Express application.
 * @architecture Serves as the root API bridge for Vercel serverless functions by forwarding all incoming HTTP requests to the Express app defined in server/index.js.
 * @agent_note Any serverless-specific configuration or routing rewrites on Vercel interact directly with this exported handler.
 */
import app from "../server/index.js";

export default app;

