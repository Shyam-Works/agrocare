// models/PlantCategory.js 🌿 (FIXED TO MATCH YOUR DATABASE)

import mongoose from 'mongoose';

const PlantCategorySchema = new mongoose.Schema({
  // FIXED: Changed to String to match your actual database data
  user_id: {
    type: String,  // Changed from ObjectId to String
    required: true,
    index: true,
  },
  
  // The name the user provides (e.g., "Corn Field A")
  category_name: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true,
    maxlength: [50, 'Category name cannot be more than 50 characters'],
  },
  
  // Optional: A general plant type for the category
  plant_type: {
    type: String,
    trim: true,
    default: 'Unknown Plant',
  },

  // Calculated: Total number of diagnosis results saved to this category
  diagnosis_count: {
    type: Number,
    default: 0,
  },

  // Calculated: Timestamp of the last diagnosis saved here
  last_saved: {
    type: Date,
    default: Date.now,
  },
}, { 
  timestamps: true // Adds createdAt and updatedAt fields
});

// Ensure only one category of the same name exists per user
PlantCategorySchema.index({ user_id: 1, category_name: 1 }, { unique: true });

// Export the model
export default mongoose.models.PlantCategory || mongoose.model('PlantCategory', PlantCategorySchema, 'plant_categories');