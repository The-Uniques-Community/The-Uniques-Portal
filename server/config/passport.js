/**
 * @file passport.js
 * @description Configures Passport.js authentication strategies, specifically Google OAuth 2.0.
 * @architecture Bridges external Google authentication with internal user identities across Member, Coordinator, and Admin models.
 * @agent_note Requires GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET; links Google profile ID and creates a File record for avatar if needed.
 */

// config/passport.js
import passport from "passport";
import GoogleStrategy from "passport-google-oauth20";
import Member from "../models/member/memberModel.js";
import Coordinator from "../models/community/communityAdmin.js";
import Admin from "../models/admin/adminModel.js";
import dotenv from "dotenv";
dotenv.config();

console.log("Google client ID:", process.env.GOOGLE_CLIENT_ID);
console.log("Google client secret:", process.env.GOOGLE_CLIENT_SECRET);

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy.Strategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || "https://theuniquesportal-server.vercel.app/auth/google/callback",
        scope: ["profile", "email"],
        accessType: "offline", // Request offline access to get a refresh token
        prompt: "consent", // Always prompt for consent
      },
      /**
       * Google OAuth 2.0 verification callback.
       * @desc    Matches Google profile email with Member, Coordinator, or Admin, links Google ID, and updates profile picture.
       * @param   {string} accessToken - OAuth access token from Google.
       * @param   {string} refreshToken - OAuth refresh token from Google.
       * @param   {import('passport-google-oauth20').Profile} profile - Google user profile data.
       * @param   {Function} done - Passport done callback (err, user, info).
       * @returns {Promise<void>}
       */
      async (accessToken, refreshToken, profile, done) => {
        console.log("🔹 Google OAuth Callback Triggered");
        console.log("🔹 Received Profile:", profile);
        console.log("🔹 Access Token:", accessToken);
        console.log("🔹 Refresh Token:", refreshToken);

        try {
          const email = profile.emails[0].value;
          let member = await Member.findOne({ email });
          if (!member) {
            member = await Coordinator.findOne({ email });
          }
          if (!member) {
            member = await Admin.findOne({ email });
          }

          if (!member && mongoose.connection.readyState === 1 && mongoose.connection.db) {
            const emailRegex = new RegExp(`^${email.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i");
            member = (await mongoose.connection.db.collection("members").findOne({ email: emailRegex })) ||
                     (await mongoose.connection.db.collection("admins").findOne({ email: emailRegex })) ||
                     (await mongoose.connection.db.collection("communityadmins").findOne({ email: emailRegex }));
          }

          if (!member) {
            console.log("⚠️ Member not found in DB");
            return done(null, false, { message: "Member not found" });
          }

          // Link Google ID if not already stored
          if (!member.googleId) {
            member.googleId = profile.id;
            console.log("Linking Google ID:", profile.id);
          }

          if (!member.fullName || member.fullName.trim() === "") {
            member.fullName = profile.displayName;
          }

          if ((!member.profilePic || !member.profilePic.fileUrl) && profile.photos?.length > 0) {
            member.profilePic = {
              fileName: `${profile.displayName.replace(/\s+/g, "_")}_profile_pic`,
              fileUrl: profile.photos[0].value,
              url: profile.photos[0].value,
              fileId: profile.id,
            };
          }

          if (typeof member.save === "function") {
            await member.save();
          }
          console.log("✅ Member authenticated successfully");
          console.log("Member found, returning:", member);
          return done(null, member);
        } catch (err) {
          console.error("🔥 Error in Google OAuth:", err);
          return done(err, null);
        }
      }
    )
  );
} else {
  console.warn("⚠️ Google OAuth Strategy disabled: GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET is missing.");
}

/**
 * @module passportConfig
 */
export default passport;
