// pages/api/posts/[id]/comments.js
import { dbConnect } from "@/lib/dbConnect";
import Post from "@/models/Post";
import {Comment} from "@/models/Comment"

export default async function handler(req, res) {
  console.log('=== COMMENTS API CALLED ===');
  console.log('Method:', req.method);
  console.log('Post ID:', req.query.id);
  
  try {
    await dbConnect();
    console.log('✅ Database connected');
  } catch (dbError) {
    console.error('❌ Database connection error:', dbError);
    return res.status(500).json({ 
      success: false, 
      error: 'Database connection failed',
      details: dbError.message 
    });
  }
  
  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      console.log('Fetching comments for post:', id);
      
      const comments = await Comment.find({ 
        postId: id, 
        parentComment: null 
      }).sort({ createdAt: -1 });

      console.log('✅ Comments fetched:', comments.length);
      res.status(200).json({ success: true, comments });
    } catch (error) {
      console.error('❌ Error fetching comments:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  } 
  
  else if (req.method === 'POST') {
    try {
      console.log('Request body:', req.body);
      
      const { author, authorEmail, content, parentComment } = req.body;

      // Validation
      if (!author || !authorEmail || !content) {
        console.log('❌ Validation failed');
        return res.status(400).json({ 
          success: false, 
          error: 'Author, email, and content are required',
          received: { author, authorEmail, content: content ? 'present' : 'missing' }
        });
      }

      console.log('Looking for post with ID:', id);
      const post = await Post.findById(id);
      
      if (!post) {
        console.log('❌ Post not found');
        return res.status(404).json({ success: false, error: 'Post not found' });
      }
      
      console.log('✅ Post found:', post.title);

      // Check if Comment model is properly imported
      if (!Comment) {
        console.error('❌ Comment model is undefined');
        return res.status(500).json({ 
          success: false, 
          error: 'Comment model not properly imported' 
        });
      }

      console.log('Creating new comment...');
      const comment = new Comment({
        postId: id,
        author,
        authorEmail,
        content,
        parentComment: parentComment || null,
        likes: 0,
        likedBy: []
      });

      console.log('Saving comment...');
      await comment.save();
      console.log('✅ Comment saved:', comment._id);

      // Update post comment count
      post.commentCount = (post.commentCount || 0) + 1;
      await post.save();
      console.log('✅ Post comment count updated:', post.commentCount);

      res.status(201).json({ success: true, comment });
    } catch (error) {
      console.error('❌ Error creating comment:');
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      
      res.status(500).json({ 
        success: false, 
        error: error.message,
        errorName: error.name,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  } 
  
  else {
    res.status(405).json({ success: false, error: 'Method not allowed' });
  }
}