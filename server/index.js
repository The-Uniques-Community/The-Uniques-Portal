import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import dbconnect from "./config/dbConfig.js";
import cookieParser from "cookie-parser";
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
import { getAuth } from "./controller/googleDriveService.js";
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
dotenv.config();

const app = express();
app.use(express.json());
app.use(cookieParser());
// Robust CORS middleware handling all origins and preflight requests
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  } else {
    res.setHeader("Access-Control-Allow-Origin", "*");
  }
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, token, X-Requested-With, Accept, Origin"
  );
  res.setHeader("Access-Control-Expose-Headers", "Content-Type, Authorization, token");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }
  next();
});

app.use(
  cors({
    origin: (origin, callback) => {
      callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "token", "X-Requested-With", "Accept", "Origin"],
  })
);
app.use(passport.initialize());

// Ensure database connection in serverless environment
app.use(async (req, res, next) => {
  if (req.path === "/") {
    return next();
  }
  try {
    await dbconnect();
    next();
  } catch (error) {
    console.error("Database connection error on request:", error.message);
    return res.status(500).json({
      error: "Database Connection Failed",
      message: error.message,
      hint: !process.env.MONGODB_URI
        ? "MONGODB_URI environment variable is missing in Vercel project settings."
        : "Failed to connect to MongoDB. Please ensure your MongoDB Atlas IP Access List allows 0.0.0.0/0 (all IPs) for Vercel.",
    });
  }
});

app.get("/", (req, res) => {
  res.send("hello its working");
});

app.use("/api/member", memberRoute);
app.use("/api/leave", leaveRoute);
app.use("/api/fine", memberFineRoute)
app.use("/api/admin", adminRoute);
app.use("/api/admin/member",memberAdminRouter)
app.use("/api/community", communityRoutes);
app.use("/api/blogs", blogRouter);
app.use("/auth", authRoutes);
app.use("/auth/password-reset", passwordResetRoutes); // Add this line
app.use("/api/guest", guestRoute);
app.use("/api/events", eventRouter)
app.use('/upload', googleDriveRoutes);
app.use("/api/admin/fine", fineRouter);
app.use("/api/public/members", publicMemberRouter);
app.use('/api/contact', publicEnquiryRouter);
app.use('/api/admin/enquiry', enquiryRoute);
app.use('/api', campusAmbassadorRouter);
app.use('/api/admin/migration', migrationRouter);
app.use("/api/admin/trainers", trainerRoute);
app.use("/api/uniques360", uniques360Route);
app.use("/api/projects", projectRouter);
app.use("/api/community/projects", projectRouter);
app.use("/api/stats", statsRouter);
app.use("/api/batches", batchRouter);
app.use("/api/community-benefits", communityBenefitsRouter);
app.use("/api/custom-members", customMemberRouter);

app.use('/api/image-proxy/:fileId', async (req, res) => {
  try {
    const fileId = req.params.fileId;
    if (!fileId) {
      return res.status(400).send('File ID is required');
    }
    
    // Get the auth client from your existing Google Drive service
    const auth = await getAuth();
    const drive = google.drive({ version: 'v3', auth });
    
    // Get the file metadata first to verify it exists
    await drive.files.get({ fileId });
    
    // Get the actual file content as a stream
    const response = await drive.files.get({
      fileId,
      alt: 'media'
    }, { responseType: 'stream' });
    
    // Set content type and cache headers
    res.setHeader('Content-Type', response.headers['content-type']);
    res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 24 hours
    
    // Pipe the image data directly to the response
    response.data.pipe(res);
  } catch (error) {
    console.error('Error proxying Google Drive image:', error);
    res.status(500).send('Error retrieving image');
  }
});


if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 5001;
  const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });

  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.error(`Port ${PORT} is already in use by another process.`);
    } else {
      console.error("Server listen error:", err);
    }
  });
}

dbconnect().catch((err) => console.error("Initial DB connect error:", err.message));

export default app;