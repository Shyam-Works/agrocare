// /models/Post.js
import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
  author: {
    type: String,
    required: true,
    trim: true
  },
  authorEmail: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  content: {
    type: String,
    required: true,
    maxlength: 2000
  },
  category: {
    type: String,
    enum: ['Disease', 'Pest Control', 'Soil Health', 'Irrigation', 'General', 'Technology', 'Tips'],
    default: 'General'
  },
  likes: {
    type: Number,
    default: 0
  },
  likedBy: [{
    type: String
  }],
  commentCount: {
    type: Number,
    default: 0
  },
  image: {
    type: String,
    default: null
  },
  tags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

// Index for better query performance
postSchema.index({ createdAt: -1 });
postSchema.index({ category: 1 });
postSchema.index({ likes: -1 });

export default mongoose.models.Post || mongoose.model('Post', postSchema);
