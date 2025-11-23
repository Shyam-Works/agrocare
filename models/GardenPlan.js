import mongoose from 'mongoose';

const GardenPlanSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // The uploaded backyard/area image
  original_image_url: {
    type: String,
    required: true
  },
  // User Inputs
  inputs: {
    estimated_size: { type: Number, required: true }, // in m2
    estimated_cost: { type: Number, required: true }, // in USD/currency
    user_idea: { type: String, required: true }       // e.g., "Flower garden"
  },
  // AI Generated Suggestions (The 4 plants)
  suggestions: [{
    common_name: String,
    scientific_name: String,
    care_level: { 
      type: String, 
      enum: ['High', 'Moderate', 'Low', 'Normal'] 
    },
    sun_requirement: String, // "Full Sun", "Partial", etc.
    days_to_harvest: String, // "20 days"
    image_url: String,       // Fetched from Plant.id
    description: String      // Brief intro
  }],
  // If user selects one to proceed
  selected_plant: {
    name: String,
    details_generated: { type: Boolean, default: false }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.models.GardenPlan || mongoose.model('GardenPlan', GardenPlanSchema);