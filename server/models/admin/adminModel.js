/**
 * @file adminModel.js
 * @description Backward compatibility re-export of unified User model.
 * @architecture Re-exports canonical User model to ensure seamless backward compatibility across legacy controllers and services.
 */

import User from "../user/userModel.js";

export default User;