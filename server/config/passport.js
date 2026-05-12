// config/passport.js
import passport from "passport";
import GoogleStrategy from "passport-google-oauth20";
import Member from "../models/member/memberModel.js";
import Coordinator from "../models/community/communityAdmin.js";
import Admin from "../models/admin/adminModel.js";
import File from "../models/member/fileModel.js";
import dotenv from "dotenv";
dotenv.config();

console.log("Google client ID:", process.env.GOOGLE_CLIENT_ID);
console.log("Google client secret:", process.env.GOOGLE_CLIENT_SECRET);

passport.use(
  new GoogleStrategy.Strategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "https://theuniquesbackend.vercel.app/auth/google/callback",
      scope: ["profile", "email"],
      accessType: "offline", // Request offline access to get a refresh token
      prompt: "consent", // Always prompt for consent
    },
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

        if (!member.profilePic && profile.photos?.length > 0) {
          const newFile = await File.create({
            fileName: `${profile.displayName.replace(/\s+/g, "_")}_profile_pic`,
            fileUrl: profile.photos[0].value,
            fileId: profile.id,
            fileOwner: member._id,
          });
          member.profilePic = newFile._id;
        }

        await member.save();
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

export default passport;
