// pages/api/posts/[id].js
import {connectDB} from '@/lib/dbConnect';
import Post from '@/models/Post';

export default async function handler(req, res) {
  await connectDB();
  
  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const post = await Post.findById(id);
      if (!post) {
        return res.status(404).json({ success: false, error: 'Post not found' });
      }
      res.status(200).json({ success: true, post });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  } 
  
  else if (req.method === 'DELETE') {
    try {
      const post = await Post.findByIdAndDelete(id);
      if (!post) {
        return res.status(404).json({ success: false, error: 'Post not found' });
      }
      
      // Also delete associated comments
      const { Comment } = require('../../../lib/models/Post');
      await Comment.deleteMany({ postId: id });
      
      res.status(200).json({ success: true, message: 'Post deleted' });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  } 
  
  else {
    res.status(405).json({ success: false, error: 'Method not allowed' });
  }
}