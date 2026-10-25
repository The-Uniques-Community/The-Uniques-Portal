/**
 * @file index.js
 * @description Main application server bootstrap that configures middleware, database connectivity, and mounts API routing tables.
 * @architecture Central HTTP server entry point for both standalone Node.js environments and Vercel serverless functions, wiring Express middleware and routing modules.
 * @agent_note When adding new routes, mount them with their corresponding route prefix below and ensure any custom headers or credentials required are handled in CORS configuration.
 */
import "dotenv/config";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import dbconnect from "./config/dbConfig.js";
import cookieParser from "cookie-parser";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.resolve(__dirname, "../dist");
import memberRoute from "./routes/member/memberRoute.js";
import adminRoute from "./routes/admin/adminRoute.js";
import blogRouter from "./routes/member/blogRoute.js";
import leaveRoute from "./routes/member/leaveRoute.js";
import passport from './config/passport.js';
import authRoutes from './routes/Authentication/auth.routes.js';
import passwordResetRoutes from './routes/member/otpRoute.js'
import guestRoute from "./routes/member/guestRoute.js";
import eventRouter from "./routes/admin/eventRoutes.js";
import communityRoutes from './routes/community/community.routes.js'
import googleDriveRoutes from './routes/googleDriveUpload.routes.js'
import memberAdminRouter from "./routes/admin/memberRoute.js";
import fineRouter from "./routes/admin/fineRoute.js";
import publicMemberRouter from "./routes/landing/publicMemberRouter.js";
import memberFineRoute from "./routes/member/fineRoute.js";
import publicEnquiryRouter from "./routes/landing/publicRoute.js";
import enquiryRoute from "./routes/admin/enquiryRoute.js";
import { getAuth, getDrive } from "./controller/googleDriveService.js";
import { google } from 'googleapis';
import campusAmbassadorRouter from "./routes/community/campusAmbassadorRoute.js";
import migrationRouter from "./routes/admin/migrationRoutes.js";
import trainerRoute from "./routes/admin/trainerRoute.js";
import uniques360Route from "./routes/uniques360/uniques360Route.js";
import projectRouter from "./routes/community/projectRoute.js";
import statsRouter from "./routes/community/statsRoute.js";
import batchRouter from "./routes/community/batchRoute.js";
import communityBenefitsRouter from "./routes/community/communityBenefitsRoute.js";
import customMemberRouter from "./routes/community/customMemberRoute.js";
import successStoriesRouter from "./routes/community/successStories.routes.js";
dotenv.config();

const app = express();
app.use(express.json());
app.use(cookieParser());
// Dynamic CORS origin configuration with environment overrides and hardcoded defaults
const parseEnvOrigins = () => {
  const rawOrigins = process.env.ALLOWED_ORIGINS || process.env.CORS_ORIGINS || "";
  return rawOrigins
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
};

const defaultOrigins = [
  process.env.FRONTEND_URL,
  process.env.CLIENT_URL,
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:3000",
  "https://theuniquesportal.vercel.app",
  "https://the-uniques-portal.vercel.app",
  "https://theuniquescommunity.vercel.app",
  "https://the-uniques-community.vercel.app",
  "https://www.theuniques.in",
  "https://theuniques.in",
].filter(Boolean);

const allowedOrigins = Array.from(new Set([...defaultOrigins, ...parseEnvOrigins()]));

/**
 * Checks if a given origin is allowed under the application's CORS policy.
 * @param {string|undefined} origin
 * @returns {boolean}
 */
export const isAllowedOrigin = (origin) => {
  if (!origin) return true;
  if (process.env.NODE_ENV !== "production") return true;
  if (allowedOrigins.includes(origin)) return true;

  // Pattern matches local development servers on any port (localhost / 127.0.0.1)
  const localhostRegex = /^https?:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?$/i;
  if (localhostRegex.test(origin)) return true;

  // Pattern matches the-uniques-portal, theuniquesportal, theuniquesportal-server and preview deployments on Vercel
  const vercelPortalRegex = /^https:\/\/(the-?uniques-?portal|theuniquesportal-server)(-[a-z0-9-]+)?\.vercel\.app$/i;
  if (vercelPortalRegex.test(origin)) return true;

  // Pattern matches the-uniques-community, theuniquescommunity and preview deployments on Vercel
  const vercelCommunityRegex = /^https:\/\/(the-?uniques-?community)(-[a-z0-9-]+)?\.vercel\.app$/i;
  if (vercelCommunityRegex.test(origin)) return true;

  // Pattern matches theuniques.in and subdomains (e.g., https://www.theuniques.in, https://community.theuniques.in)
  const uniquesDomainRegex = /^https:\/\/(?:[a-z0-9-]+\.)*theuniques\.in$/i;
  if (uniquesDomainRegex.test(origin)) return true;

  return false;
};

// Explicit CORS origin whitelist configuration
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (!origin) {
    return next();
  }

  const isAllowed = isAllowedOrigin(origin);
  if (isAllowed) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, token, X-Requested-With, Accept, Origin"
    );
    res.setHeader("Access-Control-Expose-Headers", "Content-Type, Authorization, token");
  }

  if (req.method === "OPTIONS") {
    return isAllowed ? res.status(204).end() : res.status(403).end();
  }
  next();
});

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server) or verified origins
      if (!origin || isAllowedOrigin(origin)) {
        return callback(null, true);
      }
      // Return false instead of throwing Error to prevent Express crashing with 500 status
      return callback(null, false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "token", "X-Requested-With", "Accept", "Origin"],
  })
);
app.use(passport.initialize());

// Decoupled public endpoints (Zero DB dependency)
app.get("/", (req, res) => res.send("hello its working"));

app.get("/health", (req, res) => {
  res.status(200).json({ status: "alive", timestamp: new Date().toISOString() });
});

app.get("/api/health", async (req, res) => {
  // Warm or establish connection if not already in readyState 1
  if (mongoose.connection.readyState !== 1) {
    await dbconnect().catch(() => {});
  }
  const isConnected = mongoose.connection.readyState === 1;
  let documentCounts = null;
  let databaseName = null;

  if (isConnected && mongoose.connection.db) {
    databaseName = mongoose.connection.db.databaseName;
    try {
      const [users, members, admins] = await Promise.all([
        mongoose.connection.db.collection("users").countDocuments().catch(() => -1),
        mongoose.connection.db.collection("members").countDocuments().catch(() => -1),
        mongoose.connection.db.collection("admins").countDocuments().catch(() => -1),
      ]);
      documentCounts = { users, members, admins };
    } catch (_err) {
      // Ignored: keep health check responsive
    }
  }

  res.status(isConnected ? 200 : 503).json({
    status: isConnected ? "healthy" : "degraded",
    database: {
      connected: isConnected,
      readyState: mongoose.connection.readyState,
      name: databaseName,
      documentCounts,
    },
    uptime: process.uptime(),
  });
});

/**
 * @desc Proxies and streams images directly from Google Drive with 24-hour cache headers.
 * @route GET /api/image-proxy/:fileId
 * @access Public
 * @param {string} req.params.fileId - Google Drive file ID
 * @returns {ReadableStream} Image binary stream
 */
app.get("/api/image-proxy/:fileId", async (req, res) => {
  try {
    const fileId = req.params.fileId;
    if (!fileId) {
      return res.status(400).send("File ID is required");
    }
    const drive = getDrive();
    if (!drive) {
      return res.status(503).send("Google Drive service not available");
    }
    const response = await drive.files.get(
      { fileId, alt: "media" },
      { responseType: "stream" }
    );
    res.setHeader("Content-Type", response.headers["content-type"] || "image/jpeg");
    res.setHeader("Cache-Control", "public, max-age=86400");
    response.data.pipe(res);
  } catch (error) {
    console.error("Error proxying Google Drive image:", error.message);
    if (error.code === 404 || error.status === 404) {
      return res.status(404).send("Image not found");
    }
    res.status(500).send("Error retrieving image");
  }
});

// Ensure active DB connection for all downstream API routes
app.use(async (req, res, next) => {
  try {
    await dbconnect();
    next();
  } catch (error) {
    console.error(`[DB_ERROR] ${req.method} ${req.originalUrl}:`, error.message);
    return res.status(503).json({
      success: false,
      error: "Service Unavailable",
      message: "Database service is temporarily unavailable. Please try again later.",
      code: "DATABASE_UNAVAILABLE",
      ...(process.env.NODE_ENV === "development" && { devDetails: error.message }),
    });
  }
});

app.use("/api/member", memberRoute);
app.use("/api/leave", leaveRoute);
app.use("/api/fine", memberFineRoute);
app.use("/api/admin", adminRoute);
app.use("/api/admin/member", memberAdminRouter);
app.use("/api/community", communityRoutes);
app.use("/api/blogs", blogRouter);
app.use("/auth", authRoutes);
app.use("/auth/password-reset", passwordResetRoutes);
app.use("/api/guest", guestRoute);
app.use("/api/events", eventRouter);
app.use("/upload", googleDriveRoutes);
app.use("/api/upload", googleDriveRoutes);
app.use("/api/admin/fine", fineRouter);
app.use("/api/public/members", publicMemberRouter);
app.use("/api/contact", publicEnquiryRouter);
app.use("/api/admin/enquiry", enquiryRoute);
app.use("/api", campusAmbassadorRouter);
app.use("/api/admin/migration", migrationRouter);
app.use("/api/admin/trainers", trainerRoute);
app.use("/api/uniques360", uniques360Route);
app.use("/api/projects", projectRouter);
app.use("/api/community/projects", projectRouter);
app.use("/api/stats", statsRouter);
app.use("/api/batches", batchRouter);
app.use("/api/community-benefits", communityBenefitsRouter);
app.use("/api/custom-members", customMemberRouter);
app.use("/api/success-stories", successStoriesRouter);
app.use("/api/community/success-stories", successStoriesRouter);

// Static asset serving and SPA fallback for standalone/production deployments
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));

  app.get("*", (req, res, next) => {
    // Pass through backend API / health routes so they return proper 404 JSON instead of index.html
    const isBackendApi =
      req.path.startsWith("/api") ||
      req.path.startsWith("/upload") ||
      req.path === "/health" ||
      /^\/auth\/(google|emaillogin|get_user|verify_user|verify_role|logout|password-reset\/(send-otp|verify-otp|reset-password|resend-otp))/.test(req.path);

    if (isBackendApi) {
      return next();
    }
    const indexPath = path.join(distPath, "index.html");
    if (fs.existsSync(indexPath)) {
      return res.sendFile(indexPath);
    }
    next();
  });
}

// Centralized Express error handler to guarantee structured JSON errors instead of HTML 500 stack traces
app.use((err, req, res, _next) => {
  console.error(`[Unhandled Error] ${req.method} ${req.originalUrl}:`, err.message || err);
  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    success: false,
    message: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
});

// Sequential bootstrap for standalone Node.js environments
const startServer = async () => {
  const PORT = process.env.PORT || 5001;
  try {
    console.log("[Bootstrap] Connecting to database...");
    await dbconnect();
    console.log("[Bootstrap] Database connection established.");

    const server = app.listen(PORT, () => {
      console.log(`[Bootstrap] Server is running on port ${PORT}`);
    });

    server.on("error", (err) => {
      if (err.code === "EADDRINUSE") {
        console.error(`[Bootstrap] Port ${PORT} is already in use.`);
      } else {
        console.error("[Bootstrap] Server listen error:", err);
      }
      process.exit(1);
    });
  } catch (err) {
    console.error("[Bootstrap] FATAL: Database connection failed during startup.");
    console.error(err.message);
    process.exit(1);
  }
};

if (!process.env.VERCEL && process.env.NODE_ENV !== "test") {
  startServer();
}

export default app;