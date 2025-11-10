// models/DiseaseDiagnosis.js (FIXED VERSION)
const mongoose = require('mongoose');

const similarImageSchema = new mongoose.Schema({
  id: String,
  url: String,
  license_name: String,
  license_url: String,
  citation: String,
  similarity: Number,
  url_small: String
});

const diseaseSuggestionSchema = new mongoose.Schema({
  id: String,
  name: String,
  probability: Number,
  similar_images: [similarImageSchema],
  details: {
    language: String,
    entity_id: String
  }
});

const diseaseDiagnosisSchema = new mongoose.Schema({
  // User reference
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // Image and plant identification
  image_url: {
    type: String,
    required: true
  },
  plant_name: String,
  plant_type: String,
  
  // Plant detection
  is_plant_detected: {
    type: Boolean,
    required: true
  },
  plant_detection_probability: {
    type: Number,
    required: true
  },
  plant_detection_threshold: {
    type: Number,
    default: 0.5
  },
  
  // Health assessment
  is_healthy: {
    type: Boolean,
    required: true
  },
  health_probability: {
    type: Number,
    required: true
  },
  health_threshold: {
    type: Number,
    default: 0.525
  },
  
  // Primary disease (top result)
  primary_disease: {
    disease_detected: {
      type: Boolean,
      default: false
    },
    disease_id: String,
    disease_name: String,
    probability: Number,
    affected_percentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    }
  },
  
  // CRITICAL: This is the actual severity score from your database
  severity_score: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  
  // All disease suggestions from API
  disease_suggestions: [diseaseSuggestionSchema],
  
  // Diagnostic question (from your actual data)
  diagnostic_question: String,
  question_answered: {
    type: Boolean,
    default: false
  },
  user_answer: String,
  
  // Dashboard tracking
  added_to_dashboard: {
    type: Boolean,
    default: false
  },
  
  // Category tracking
  saved_to_category: {
    type: Boolean,
    default: false
  },
  category_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PlantCategory',
    default: null
  },
  category_name: {
    type: String,
    default: null
  },
  
  // Location data
  location: {
    latitude: Number,
    longitude: Number
  },
  
  // API response (store full response)
  api_response: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  
  // Timestamps
  diagnosed_at: {
    type: Date,
    default: Date.now
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true // This adds createdAt and updatedAt
});

// Indexes for efficient queries
diseaseDiagnosisSchema.index({ user_id: 1, diagnosed_at: -1 });
diseaseDiagnosisSchema.index({ category_id: 1, diagnosed_at: -1 });
diseaseDiagnosisSchema.index({ 'primary_disease.disease_name': 1 });
diseaseDiagnosisSchema.index({ is_healthy: 1 });

// Virtual for disease percentage
diseaseDiagnosisSchema.virtual('disease_percentage').get(function() {
  return this.primary_disease?.probability 
    ? Math.round(this.primary_disease.probability * 100) 
    : 0;
});

// Pre-save middleware to update timestamps
diseaseDiagnosisSchema.pre('save', function(next) {
  this.updated_at = new Date();
  next();
});

module.exports = mongoose.models.DiseaseDiagnosis || 
  mongoose.model('DiseaseDiagnosis', diseaseDiagnosisSchema, 'diseasediagnoses'); // FIXED: correct collection name