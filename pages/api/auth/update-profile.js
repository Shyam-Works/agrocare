// pages/api/auth/update-profile.js
import jwt from "jsonwebtoken";
import User from "../../../models/User";
import { dbConnect } from "../../../lib/dbConnect";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default async function handler(req, res) {
  if (req.method !== "PUT") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    await dbConnect();

    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No valid token provided" });
    }

    const token = authHeader.substring(7);

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(401).json({ message: "Invalid token" });
    }

    // Parse JSON data from request body
    const { first_name, last_name, location, profile_image_base64 } = req.body;

    console.log("Received data:", { first_name, last_name, location, hasImage: !!profile_image_base64 });

    // Validate required fields
    if (!first_name || !last_name || !location) {
      return res.status(400).json({ 
        message: "First name, last name, and location are required" 
      });
    }

    // Find user
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Prepare update data
    const updateData = {
      first_name: first_name.trim(),
      last_name: last_name.trim(),
      location: location.trim(),
    };

    // Handle profile image update if base64 data provided
    if (profile_image_base64) {
      try {
        // Upload base64 image directly to Cloudinary
        const cloudinaryResponse = await cloudinary.uploader.upload(
          profile_image_base64,
          {
            resource_type: "image",
            folder: "agrocare/profiles",
            transformation: [
              { width: 400, height: 400, crop: "fill" },
              { quality: "auto", fetch_format: "auto" }
            ]
          }
        );
        
        if (cloudinaryResponse && cloudinaryResponse.secure_url) {
          updateData.profile_image_url = cloudinaryResponse.secure_url;
        } else {
          throw new Error("Failed to upload image to Cloudinary");
        }
      } catch (imageError) {
        console.error("Image upload error:", imageError);
        return res.status(400).json({ 
          message: "Failed to upload image. Please try again." 
        });
      }
    }

    console.log("Update data:", updateData);

    // Update user in database
    const updatedUser = await User.findByIdAndUpdate(
      decoded.userId,
      updateData,
      { 
        new: true, 
        runValidators: true,
        select: '-password_hash' 
      }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "Failed to update user" });
    }

    console.log("User updated successfully:", updatedUser.first_name, updatedUser.last_name);

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser
    });

  } catch (error) {
    console.error("Update profile API error:", error);

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: "Validation error",
        error: error.message
      });
    }

    return res.status(500).json({
      message: "Internal server error",
      error: error.message
    });
  }
}