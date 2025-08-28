// models/Marketplace.js
import mongoose from 'mongoose';

const marketplaceSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    maxlength: 1000
  },
  images: [{
    type: String, // URLs to uploaded images
    required: true
  }],
  price: {
    type: Number,
    required: true,
    min: 0
  },
  type: {
    type: String,
    enum: ['sell', 'rent'],
    required: true
  },
  category: {
    type: String,
    enum: ['Plants', 'Tools', 'Seeds', 'Pest', 'Fertilizers', 'Rental'],
    required: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  contact_info: {
    phone: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    }
  },
  status: {
    type: String,
    enum: ['active', 'sold', 'rented', 'inactive'],
    default: 'active'
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

// Update the updated_at field before saving
marketplaceSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

// Index for better search performance
marketplaceSchema.index({ title: 'text', description: 'text' });
marketplaceSchema.index({ category: 1, type: 1, location: 1 });
marketplaceSchema.index({ created_at: -1 });

export default mongoose.models.Marketplace || mongoose.model('Marketplace', marketplaceSchema);