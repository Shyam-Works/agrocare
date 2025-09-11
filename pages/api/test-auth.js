// pages/api/test-auth.js
import bcrypt from "bcryptjs";
import User from "../../models/User";
import { dbConnect } from "../../lib/dbConnect";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    console.log("=== TEST AUTH API ===");
    console.log("Request body:", req.body);

    await dbConnect();
    console.log("Database connected successfully");

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    console.log("Looking for user with email:", normalizedEmail);

    const user = await User.findOne({ email: normalizedEmail });
    console.log("User found:", user ? "Yes" : "No");
    
    if (!user) {
      return res.json({ 
        success: false,
        message: "No user found with this email",
        userExists: false,
        hasPassword: false,
        passwordValid: false
      });
    }

    console.log("User details:");
    console.log("- ID:", user._id);
    console.log("- Email:", user.email);
    console.log("- First Name:", user.first_name);
    console.log("- Last Name:", user.last_name);
    console.log("- Has Password Hash:", !!user.password_hash);
    console.log("- Google ID:", user.google_id || "None");

    if (!user.password_hash) {
      return res.json({ 
        success: false,
        message: "User has no password - Google account only",
        userExists: true,
        hasPassword: false,
        passwordValid: false
      });
    }
    
    console.log("Comparing password...");
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    console.log("Password valid:", isPasswordValid);
    
    return res.json({ 
      success: isPasswordValid,
      message: isPasswordValid ? "Authentication successful" : "Invalid password",
      userExists: true, 
      hasPassword: true, 
      passwordValid: isPasswordValid,
      userInfo: {
        id: user._id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name
      }
    });
  } catch (error) {
    console.error("Test auth error:", error);
    return res.status(500).json({ 
      error: "Internal server error", 
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}