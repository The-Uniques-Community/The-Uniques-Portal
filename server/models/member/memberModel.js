/**
 * @file memberModel.js
 * @description Backward compatibility re-export of unified User model.
 * @architecture Re-exports canonical User model to ensure seamless backward compatibility across legacy controllers and services.
 */

import mongoose from "mongoose";
import User from "../user/userModel.js";

// Register backward-compatible Mongoose alias model
if (!mongoose.models.Member) {
  mongoose.models.Member = User;
}

export default User;