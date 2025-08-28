import jwt from 'jsonwebtoken';
import {dbConnect} from '@/lib/dbConnect';
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
        // Verify authentication
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) {
          return res.status(401).json({ success: false, error: 'Authentication required' });
        }

        let userId;
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          userId = decoded.userId;
        } catch (jwtError) {
          return res.status(401).json({ success: false, error: 'Invalid token' });
        }

        // Verify user exists
        const user = await User.findById(userId);
        if (!user) {
          return res.status(404).json({ success: false, error: 'User not found' });
        }

        // Create marketplace listing
        const listingData = {
          ...req.body,
          user_id: userId
        };

        const marketplace = new Marketplace(listingData);
        await marketplace.save();

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

    default:
      res.status(405).json({ success: false, error: 'Method not allowed' });
      break;
  }
}