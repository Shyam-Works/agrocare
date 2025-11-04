import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth].js";
import { dbConnect } from '@/lib/dbConnect';
import Marketplace from '@/models/Marketplace';
import User from '@/models/User';

export default async function handler(req, res) {
  await dbConnect();

  switch (req.method) {
    case 'GET':
      try {
        const { category, type, search, location } = req.query;
        
        // Build filter object
        let filter = { status: 'active' };
        
        if (category && category !== 'all') {
          filter.category = category;
        }
        
        if (type && type !== 'all') {
          filter.type = type;
        }
        
        if (location) {
          filter.location = { $regex: location, $options: 'i' };
        }
        
        if (search) {
          filter.$or = [
            { title: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } }
          ];
        }

        const listings = await Marketplace.find(filter)
          .populate('user_id', 'first_name last_name email')
          .sort({ created_at: -1 })
          .lean();

        res.status(200).json({ success: true, data: listings });
      } catch (error) {
        console.error('GET marketplace error:', error);
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    case 'POST':
      try {
        // Verify authentication with NextAuth session
        const session = await getServerSession(req, res, authOptions);
        
        if (!session || !session.user) {
          return res.status(401).json({ success: false, error: 'Authentication required' });
        }

        // Get user ID from session
        const userId = session.user.id;

        // Verify user exists
        const user = await User.findById(userId);
        if (!user) {
          return res.status(404).json({ success: false, error: 'User not found' });
        }

        console.log('=== MARKETPLACE LISTING CREATION ===');
        console.log('User:', session.user.email);
        console.log('User ID:', userId);

        // Create marketplace listing
        const listingData = {
          ...req.body,
          user_id: userId
        };

        const marketplace = new Marketplace(listingData);
        await marketplace.save();

        console.log('Marketplace listing created:', marketplace._id);

        // Add listing to user's active marketplace listings
        await User.findByIdAndUpdate(userId, {
          $push: { active_marketplace_listings: marketplace._id }
        });

        // Populate user data for response
        const populatedListing = await Marketplace.findById(marketplace._id)
          .populate('user_id', 'first_name last_name email')
          .lean();

        res.status(201).json({ success: true, data: populatedListing });
      } catch (error) {
        console.error('POST marketplace error:', error);
        res.status(400).json({ success: false, error: error.message });
      }
      break;
    
    case 'DELETE':
      try {
        // Verify authentication with NextAuth session
        const session = await getServerSession(req, res, authOptions);
        
        if (!session || !session.user) {
          return res.status(401).json({ success: false, error: 'Authentication required' });
        }

        // Get user ID from session
        const userId = session.user.id;

        const { id } = req.query; // Get the listing ID from the URL query

        if (!id) {
          return res.status(400).json({ success: false, error: 'Listing ID is required' });
        }

        console.log('=== MARKETPLACE LISTING DELETION ===');
        console.log('User:', session.user.email);
        console.log('Listing ID:', id);

        // Find the listing to ensure the authenticated user owns it
        const listing = await Marketplace.findOne({ _id: id, user_id: userId });

        if (!listing) {
          return res.status(404).json({ success: false, error: 'Listing not found or you do not have permission to delete it' });
        }

        // Perform the deletion
        await Marketplace.findByIdAndDelete(id);

        // Remove the listing ID from the user's active listings
        await User.findByIdAndUpdate(userId, {
          $pull: { active_marketplace_listings: id }
        });

        console.log('Marketplace listing deleted successfully');

        res.status(200).json({ success: true, message: 'Listing deleted successfully' });
      } catch (error) {
        console.error('DELETE marketplace error:', error);
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    default:
      res.status(405).json({ success: false, error: 'Method not allowed' });
      break;
  }
}