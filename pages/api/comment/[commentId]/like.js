// pages/api/comments/[commentId]/like.js
import connectDB from '@/lib/dbConnect';
import { Comment } from '@/models/Comment';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  await connectDB();
  
  const { commentId } = req.query;
  const { userEmail } = req.body;

  try {
    if (!userEmail) {
      return res.status(400).json({ success: false, error: 'User email required' });
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ success: false, error: 'Comment not found' });
    }

    const hasLiked = comment.likedBy.includes(userEmail);

    if (hasLiked) {
      comment.likes -= 1;
      comment.likedBy = comment.likedBy.filter(email => email !== userEmail);
    } else {
      comment.likes += 1;
      comment.likedBy.push(userEmail);
    }

    await comment.save();
    res.status(200).json({ success: true, comment, action: hasLiked ? 'unliked' : 'liked' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}