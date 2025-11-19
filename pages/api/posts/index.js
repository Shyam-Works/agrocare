// pages/api/posts/index.js
import {dbConnect} from "@/lib/dbConnect";
import Post from '@/models/Post';

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === 'GET') {
    try {
      const { page = 1, limit = 10, category, sortBy = 'recent' } = req.query;
      const skip = (page - 1) * limit;

      let query = {};
      if (category && category !== 'All') {
        query.category = category;
      }

      let sortOption = { createdAt: -1 };
      if (sortBy === 'popular') {
        sortOption = { likes: -1, createdAt: -1 };
      } else if (sortBy === 'discussed') {
        sortOption = { commentCount: -1, createdAt: -1 };
      }

      const posts = await Post.find(query)
        .sort(sortOption)
        .skip(skip)
        .limit(parseInt(limit));

      const total = await Post.countDocuments(query);

      res.status(200).json({
        success: true,
        posts,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  } 
  
  else if (req.method === 'POST') {
    try {
      const { author, authorEmail, title, content, category, tags, image } = req.body;

      if (!author || !authorEmail || !title || !content) {
        return res.status(400).json({ 
          success: false, 
          error: 'Author, email, title, and content are required' 
        });
      }

      const post = new Post({
        author,
        authorEmail,
        title,
        content,
        category: category || 'General',
        tags: tags || [],
        image: image || null
      });

      await post.save();
      res.status(201).json({ success: true, post });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  } 
  
  else {
    res.status(405).json({ success: false, error: 'Method not allowed' });
  }
}
