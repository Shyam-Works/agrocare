// models/Identification.js - FIXED VERSION WITH INSECT SUPPORT
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
      // ✅ ADDED: "insect" to the enum values
      enum: ["plant", "insect", "crop", "flower", "tree", "herb", "unknown"]
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
    // Alternative suggestions with similar images support
    alternative_suggestions: [{
      name: String,
      species: String,
      probability: Number,
      similar_images: [{
        url: String,        // Full-size image URL
        url_small: String,  // Small/thumbnail URL
        similarity: Number,
        license_name: String,  // For insect images
        license_url: String,   // For insect images
        citation: String       // For insect images
      }],
      details: mongoose.Schema.Types.Mixed  // For insect details
    }],
    similar_images: [{
      url: String,        // Full-size image URL
      url_small: String,  // Small/thumbnail URL  
      similarity: Number,
      license_name: String,  // For insect images
      license_url: String,   // For insect images
      citation: String       // For insect images
    }],
    // Plant details (also used for insect details)
    plant_details: {
      // Plant-specific fields
      common_names: [String],
      description: mongoose.Schema.Types.Mixed,  // Changed to Mixed for insect support
      taxonomy: mongoose.Schema.Types.Mixed,
      edible_parts: [String],
      watering: mongoose.Schema.Types.Mixed,
      
      // Insect-specific fields (when plant_type is "insect")
      url: String,  // Wikipedia URL for insects
      image: mongoose.Schema.Types.Mixed,  // Reference image for insects
      entity_id: String,  // Insect.id entity ID
      language: String
    }
  },
  { timestamps: true }
);

// Indexes for better query performance
IdentificationSchema.index({ user_id: 1, createdAt: -1 });
IdentificationSchema.index({ plant_type: 1 });
IdentificationSchema.index({ identified: 1 });

export default mongoose.models.Identification || mongoose.model("Identification", IdentificationSchema);