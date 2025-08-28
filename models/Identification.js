// models/Identification.js - FIXED VERSION
import mongoose from "mongoose";

const IdentificationSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    image_url: {
      type: String,
      required: true
    },
    plant_type: {
      type: String,
      default: "plant",
      enum: ["plant", "crop", "flower", "tree", "herb", "unknown"]
    },
    identified: {
      type: Boolean,
      default: false
    },
    identified_name: {
      type: String,
      default: null
    },
    species: {
      type: String,
      default: null
    },
    category: {
      type: String,
      default: null
    },
    confidence: {
      type: Number,
      default: 0
    },
    is_plant_probability: {
      type: Number,
      default: 0
    },
    // 🔧 FIXED: Added similar_images field to alternative_suggestions
    alternative_suggestions: [{
      name: String,
      species: String,
      probability: Number,
      similar_images: [{
        url: String,        // Full-size image URL
        url_small: String,  // Small/thumbnail URL
        similarity: Number
      }]
    }],
    similar_images: [{
      url: String,        // Full-size image URL
      url_small: String,  // Small/thumbnail URL  
      similarity: Number
    }],
    plant_details: {
      common_names: [String],
      description: String,
      taxonomy: mongoose.Schema.Types.Mixed,
      edible_parts: [String],
      watering: mongoose.Schema.Types.Mixed
    }
  },
  { timestamps: true }
);

export default mongoose.models.Identification || mongoose.model("Identification", IdentificationSchema);