import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { dbConnect } from '@/lib/dbConnect';
import Marketplace from '@/models/Marketplace';
import User from '@/models/User';

export default async function handler(req, res) {
  const {
    query: { id },
    method,
  } = req;

  await dbConnect();
  
  switch (method) {
    case 'GET':
      try {
        const marketplace = await Marketplace.findById(id)
          .populate('user_id')
          .lean();

        if (!marketplace) {
          return res.status(404).json({ success: false, error: 'Listing not found' });
        }

        // Debug: Let's see what user fields are actually available
        console.log('=== AVAILABLE USER FIELDS ===');
        console.log('User object keys:', Object.keys(marketplace.user_id || {}));
        console.log('Full user object:', marketplace.user_id);

        res.status(200).json({ success: true, data: marketplace });
      } catch (error) {
        console.error('GET marketplace listing error:', error);
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    case 'PUT':
      try {
        // Verify authentication with NextAuth session
        const session = await getServerSession(req, res, authOptions);
        
        if (!session || !session.user) {
          return res.status(401).json({ success: false, error: 'Authentication required' });
        }

        // Get user ID from session
        const userId = session.user.id;

        console.log('=== MARKETPLACE LISTING UPDATE ===');
        console.log('User:', session.user.email);
        console.log('User ID:', userId);
        console.log('Listing ID:', id);

        const marketplace = await Marketplace.findById(id);
        if (!marketplace) {
          return res.status(404).json({ success: false, error: 'Listing not found' });
        }

        // Check ownership
        if (marketplace.user_id.toString() !== userId) {
          return res.status(403).json({ success: false, error: 'Forbidden - You can only edit your own listings' });
        }

        const updatedMarketplace = await Marketplace.findByIdAndUpdate(
          id,
          req.body,
          { new: true, runValidators: true }
        ).populate('user_id', 'first_name last_name email profile_image_url')
        .lean(); 
        


        console.log('Marketplace listing updated successfully');

        res.status(200).json({ success: true, data: updatedMarketplace });
      } catch (error) {
        console.error('PUT marketplace listing error:', error);
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

        console.log('=== MARKETPLACE LISTING DELETION ===');
        console.log('User:', session.user.email);
        console.log('User ID:', userId);
        console.log('Listing ID:', id);

        const marketplace = await Marketplace.findById(id);
        if (!marketplace) {
          return res.status(404).json({ success: false, error: 'Listing not found' });
        }

        // Check ownership
        if (marketplace.user_id.toString() !== userId) {
          return res.status(403).json({ success: false, error: 'Forbidden - You can only delete your own listings' });
        }

        await Marketplace.deleteOne({ _id: id });

        // Remove listing from user's active marketplace listings
        await User.findByIdAndUpdate(userId, {
          $pull: { active_marketplace_listings: id }
        });

        console.log('Marketplace listing deleted successfully');

        res.status(200).json({ success: true, data: {} });
      } catch (error) {
        console.error('DELETE marketplace listing error:', error);
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    default:
      res.status(405).json({ success: false, error: 'Method not allowed' });
      break;
  }
}