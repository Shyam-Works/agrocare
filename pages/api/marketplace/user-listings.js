import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { dbConnect } from "../../../lib/dbConnect";
import User from "../../../models/User";
import Marketplace from "../../../models/Marketplace";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  try {
    await dbConnect();

    // Verify authentication with NextAuth session
    const session = await getServerSession(req, res, authOptions);
    
    if (!session || !session.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    // Get user ID from session
    const userId = session.user.id;

    console.log('=== USER MARKETPLACE LISTINGS REQUEST ===');
    console.log('User:', session.user.email);
    console.log('User ID:', userId);

    // Find user's marketplace listings
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Get all listings for this user, sorted by most recent first
    const listings = await Marketplace.find({ user_id: userId })
      .sort({ created_at: -1 })
      .lean(); // Use lean() for better performance when we don't need mongoose document methods

    console.log('Found', listings.length, 'listings for user');

    return res.status(200).json({
      success: true,
      listings: listings,
      count: listings.length
    });

  } catch (error) {
    console.error("User listings API error:", error);
    return res.status(500).json({ 
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}