// pages/api/auth/profile.js
import jwt from "jsonwebtoken";
import User from "../../../models/User";
import Marketplace from "../../../models/Marketplace";
import Identification from "../../../models/Identification";
import {dbConnect} from "../../../lib/dbConnect";

export default async function handler(req, res) {
  if (req.method !== "GET") {
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

    // Find user
    const user = await User.findById(decoded.userId)
      .select('-password_hash');

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get marketplace listings count
    const marketplaceCount = await Marketplace.countDocuments({ user_id: decoded.userId });

    // Get identification stats
    const totalIdentifications = await Identification.countDocuments({ user_id: decoded.userId });
    const lastIdentification = await Identification.findOne({ user_id: decoded.userId })
      .sort({ createdAt: -1 })
      .select('createdAt');

    // Update user stats if they don't exist or are outdated
    const updatedUser = {
      ...user.toObject(),
      stats: {
        total_scans: user.stats?.total_scans || totalIdentifications,
        marketplace_listings: marketplaceCount,
        last_scan: user.stats?.last_scan || lastIdentification?.createdAt || null,
        avg_plant_health: user.stats?.avg_plant_health || 0
      }
    };

    return res.status(200).json({
      success: true,
      user: updatedUser
    });

  } catch (error) {
    console.error("Profile API error:", error);
    return res.status(500).json({ 
      message: "Internal server error",
      error: error.message 
    });
  }
}