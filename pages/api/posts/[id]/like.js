// pages/api/posts/[id]/like.js
import {dbConnect} from '@/lib/dbConnect';
import Post from '../../../../models/Post';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  await dbConnect();
  
  const { id } = req.query;
  const { userEmail } = req.body;

  try {
    if (!userEmail) {
      return res.status(400).json({ success: false, error: 'User email required' });
    }

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ success: false, error: 'Post not found' });
    }

    const hasLiked = post.likedBy.includes(userEmail);

    if (hasLiked) {
      post.likes -= 1;
      post.likedBy = post.likedBy.filter(email => email !== userEmail);
    } else {
      post.likes += 1;
      post.likedBy.push(userEmail);
    }

    await post.save();
    res.status(200).json({ success: true, post, action: hasLiked ? 'unliked' : 'liked' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}