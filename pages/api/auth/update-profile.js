// pages/api/auth/update-profile.js
import { dbConnect } from "@/lib/dbConnect";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./[...nextauth]";
import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  first_name: String,
  last_name: String,
  email: String,
  password_hash: String,
  location: String,
  description: String,
  profile_image_url: String,
  role: String,
  stats: Object,
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

export default async function handler(req, res) {
  if (req.method !== "PUT") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    console.log("\n=== UPDATE PROFILE API START ===");
    
    const session = await getServerSession(req, res, authOptions);
    
    console.log("Session exists:", !!session);
    console.log("Session user ID:", session?.user?.id);
    
    if (!session || !session.user) {
      console.log("❌ No valid session found");
      return res.status(401).json({ error: "Not authenticated" });
    }

    const userId = req.body.userId || session.user.id;
    console.log("Using user ID:", userId);

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    await dbConnect();
    console.log("✅ Database connected");

    const currentUser = await User.findById(userId);
    console.log("Current user found:", !!currentUser);
    
    if (currentUser) {
      console.log("Current user data:", {
        first_name: currentUser.first_name,
        last_name: currentUser.last_name,
        location: currentUser.location,
      });
    }
    
    if (!currentUser) {
      return res.status(404).json({ error: "User not found" });
    }

    const { 
      first_name, 
      last_name, 
      location, 
      description, 
      profile_image_url 
    } = req.body;

    console.log("Update data received:", { 
      first_name, 
      last_name, 
      location, 
      description: description ? `${description.substring(0, 30)}...` : 'none',
      profile_image_url: profile_image_url ? "URL provided" : "No URL" 
    });

    // Validations...
    if (!first_name || !last_name || !location) {
      return res.status(400).json({ 
        error: "First name, last name, and location are required" 
      });
    }

    if (first_name.length > 50 || last_name.length > 50) {
      return res.status(400).json({ 
        error: "First name and last name must be less than 50 characters" 
      });
    }

    if (location.length > 100) {
      return res.status(400).json({ 
        error: "Location must be less than 100 characters" 
      });
    }

    if (description && description.length > 500) {
      return res.status(400).json({ 
        error: "Description must be less than 500 characters" 
      });
    }

    if (profile_image_url && !profile_image_url.startsWith('http')) {
      return res.status(400).json({ 
        error: "Profile image URL must be a valid HTTP/HTTPS URL" 
      });
    }

    const updateData = {
      first_name: first_name.trim(),
      last_name: last_name.trim(),
      location: location.trim(),
      description: description ? description.trim() : "",
      updated_at: new Date()
    };

    if (profile_image_url) {
      updateData.profile_image_url = profile_image_url;
    }

    console.log("Updating with data:", updateData);

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, select: '-password_hash' }
    );

    if (!updatedUser) {
      console.log("❌ Failed to update user");
      return res.status(404).json({ error: "User not found" });
    }

    console.log("✅ User updated successfully in database");
    console.log("Updated user data:", {
      first_name: updatedUser.first_name,
      last_name: updatedUser.last_name,
      location: updatedUser.location,
    });
    console.log("=== UPDATE PROFILE API END ===\n");

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser
    });

  } catch (error) {
    console.error("❌ Update profile error:", error);
    res.status(500).json({ 
      error: "Internal server error", 
      message: "Failed to update profile",
      details: error.message 
    });
  }
}