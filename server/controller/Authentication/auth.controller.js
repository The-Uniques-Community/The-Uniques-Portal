// controllers/auth.controller.js
import jwt from "jsonwebtoken";
import Member from "../../models/member/memberModel.js";
import Admin from "../../models/admin/adminModel.js";
import bcrypt from "bcrypt";
import CommunityAdmin from "../../models/community/communityAdmin.js";

const generateToken = (member) => {
  const payload = {
    id: member._id,
    role: member.role,
    batch: member.batch || null,
  };
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1d" });
};

// controllers/auth.controller.js
export const googleCallback = (req, res, next) => {
  if (!req.user) {
    return res.status(400).send("Authentication failed. Please try again.");
  }

  // Generate token for the authenticated user
  const token = generateToken(req.user);
  // Extract the user role from req.user
  const userRole = req.user.role;

  // Set an HTTP‑only cookie for the token on the backend domain.
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // set to true in production
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",// adjust as needed
    // domain: '.example.com',  // if you want to share across subdomains
  });

  // Return HTML that sends the role (if needed for client-side routing) and closes the popup.
  const htmlResponse = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Login Successful</title>
      </head>
      <body>
        <script>
          (function() {
            // Send only the role since the token is stored in the cookie
            window.opener.postMessage({ role: '${userRole}' }, '*');
            window.close();
          })();
        </script>
        <p>Login successful! You can close this window.</p>
      </body>
    </html>
  `;
  return res.send(htmlResponse);
};

export const emailLogin = async (req, res) => {
  const { email, password } = req.body;
  try {
    // First try to find in Member model
    let member = await Member.findOne({ email });
    let role = "member";
    let modelType = "member";

    // If not found in Member model, try to find in Admin model
    if (!member) {
      try {
        member = await Admin.findOne({ email });
        if (member) {
          role = "admin";
          modelType = "admin";
        }
      } catch (error) {
        console.error("Error loading Admin model:", error);
      }
    }

    if (!member) {
      try {
        member = await CommunityAdmin.findOne({ email });
        if (member) {
          role = "communityadmin";
          modelType = "communityAdmin";
        }
      } catch (error) {
        console.error("Error loading CommunityAdmin model:", error);
      }
    }

     // If not found in any model, check if the email belongs to a coordinator
     if (!member) {
      // Example: Check if the email matches a predefined coordinator email pattern
      const coordinatorEmails = ["coordinator1@example.com", "coordinator2@example.com"];
      if (coordinatorEmails.includes(email)) {
        role = "coordinator";
        member = { email, role }; // Mock member object for coordinators
      }
    }

    // If still not found in any model
    if (!member) {
      return res
        .status(401)
        .json({ message: "Not a member, please contact tech team." });
    }

    // Check password based on model type
    let isMatch = false;
    try {
      if (member.comparePassword) {
        // Use the method if it exists
        isMatch = await member.comparePassword(password);
      } else {
        // Implement fallback verification using bcrypt directly
        console.log(
          "comparePassword method not found, using fallback verification"
        );
        if (member.password) {
          isMatch = await bcrypt.compare(password, member.password);
        }
        else if (role === "coordinator") {
          // For coordinators, you can use a predefined password or skip password validation
          isMatch = password === process.env.COORDINATOR_PASSWORD; // Example: Use an environment variable
        } else {
          return res
            .status(401)
            .json({ message: "Invalid password format for this user type" });
        }
      }
    } catch (error) {
      console.error("Password comparison error:", error);
      return res.status(500).json({ message: "Error verifying password" });
    }

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const token = generateToken(member);
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });

    return res.json({
      message: "Logged in successfully.",
      role: member.role,
      member,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getCurrentUser = (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  res.status(200).json(req.user);
};

// controllers/auth.controller.js
export const logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // Set true in production
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // Adjust as needed
  });
  return res.status(200).json({ message: "Logged out successfully" });
};
