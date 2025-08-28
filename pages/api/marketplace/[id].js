import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/dbConnect';
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
          .populate('user_id', 'first_name last_name email')
          .lean();

        if (!marketplace) {
          return res.status(404).json({ success: false, error: 'Listing not found' });
        }

        res.status(200).json({ success: true, data: marketplace });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    case 'PUT':
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
        ).populate('user_id', 'first_name last_name email');

        res.status(200).json({ success: true, data: updatedMarketplace });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    case 'DELETE':
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

        res.status(200).json({ success: true, data: {} });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    default:
      res.status(405).json({ success: false, error: 'Method not allowed' });
      break;
  }
}