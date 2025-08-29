// models/DiseaseDiagnosis.js
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

const diseaseDetailSchema = new mongoose.Schema({
  language: String,
  entity_id: String
});

const diseaseSuggestionSchema = new mongoose.Schema({
  id: String,
  name: String,
  probability: Number,
  similar_images: [similarImageSchema],
  details: diseaseDetailSchema
});

const diagnosticQuestionOptionSchema = new mongoose.Schema({
  suggestion_index: Number,
  entity_id: String,
  name: String,
  translation: String
});

const diagnosticQuestionSchema = new mongoose.Schema({
  text: String,
  translation: String,
  options: {
    yes: diagnosticQuestionOptionSchema,
    no: diagnosticQuestionOptionSchema
  }
});

const diseaseDiagnosisSchema = new mongoose.Schema({
  // Basic info
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Image and plant info
  image_url: {
    type: String,
    required: true
  },
  plant_name: {
    type: String,
    default: null
  },
  plant_type: {
    type: String,
    default: null
  },
  
  // Plant detection results
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
  
  // Health status
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
    category: {
      type: String,
      enum: ['Fungal', 'Bacterial', 'Viral', 'Nutritional', 'Environmental', 'Pest', 'Physical', 'Other'],
      default: 'Other'
    },
    probability: Number,
    risk_level: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Low'
    }
  },
  
  // All disease suggestions from API
  disease_suggestions: [diseaseSuggestionSchema],
  
  // Diagnostic question for refinement
  diagnostic_question: diagnosticQuestionSchema,
  
  // User interaction
  question_answered: {
    type: Boolean,
    default: false
  },
  user_answer: {
    type: String,
    enum: ['yes', 'no'],
    default: null
  },
  
  // Dashboard and tracking
  added_to_dashboard: {
    type: Boolean,
    default: false
  },
  severity_score: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  
  // API metadata
  api_response: {
    access_token: String,
    model_version: String,
    custom_id: String,
    status: String,
    sla_compliant_client: Boolean,
    sla_compliant_system: Boolean,
    created: Number,
    completed: Number
  },
  
  // Location data
  location: {
    latitude: Number,
    longitude: Number
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
  timestamps: true
});

// Index for efficient queries
diseaseDiagnosisSchema.index({ user_id: 1, created_at: -1 });
diseaseDiagnosisSchema.index({ 'primary_disease.disease_name': 1 });
diseaseDiagnosisSchema.index({ is_healthy: 1 });

// Virtual for formatted disease percentage
diseaseDiagnosisSchema.virtual('disease_percentage').get(function() {
  return this.primary_disease.probability ? Math.round(this.primary_disease.probability * 100) : 0;
});

// Method to determine disease category based on name
diseaseDiagnosisSchema.methods.categorizeDiseaseByName = function(diseaseName) {
  if (!diseaseName) return 'Other';
  
  const name = diseaseName.toLowerCase();
  
  if (name.includes('fungal') || name.includes('blight') || name.includes('mildew') || 
      name.includes('rust') || name.includes('rot') || name.includes('mold')) {
    return 'Fungal';
  } else if (name.includes('bacterial') || name.includes('canker') || name.includes('wilt')) {
    return 'Bacterial';
  } else if (name.includes('virus') || name.includes('mosaic') || name.includes('yellow')) {
    return 'Viral';
  } else if (name.includes('nutrient') || name.includes('deficiency') || 
             name.includes('nitrogen') || name.includes('phosphorus') || 
             name.includes('potassium') || name.includes('iron') || 
             name.includes('magnesium') || name.includes('calcium')) {
    return 'Nutritional';
  } else if (name.includes('water') || name.includes('light') || name.includes('temperature') ||
             name.includes('humidity') || name.includes('senescence') || name.includes('excess') ||
             name.includes('lack') || name.includes('drought') || name.includes('overwater')) {
    return 'Environmental';
  } else if (name.includes('pest') || name.includes('insect') || name.includes('aphid') ||
             name.includes('mite') || name.includes('thrip') || name.includes('scale')) {
    return 'Pest';
  } else if (name.includes('physical') || name.includes('mechanical') || name.includes('wound')) {
    return 'Physical';
  } else {
    return 'Other';
  }
};

// Method to determine risk level based on probability
diseaseDiagnosisSchema.methods.calculateRiskLevel = function(probability) {
  if (!probability) return 'Low';
  if (probability >= 0.7) return 'High';
  if (probability >= 0.4) return 'Medium';
  return 'Low';
};

// Method to calculate severity score
diseaseDiagnosisSchema.methods.calculateSeverityScore = function() {
  if (!this.primary_disease.probability) return 0;
  
  let score = this.primary_disease.probability * 100;
  
  // Adjust based on category
  const categoryMultipliers = {
    'Fungal': 1.2,
    'Bacterial': 1.1,
    'Viral': 1.3,
    'Nutritional': 0.8,
    'Environmental': 0.9,
    'Pest': 1.0,
    'Physical': 0.7,
    'Other': 1.0
  };
  
  const multiplier = categoryMultipliers[this.primary_disease.category] || 1.0;
  score *= multiplier;
  
  return Math.min(Math.round(score), 100);
};

// Pre-save middleware
diseaseDiagnosisSchema.pre('save', function(next) {
  this.updated_at = new Date();
  
  // Calculate severity score if primary disease exists
  if (this.primary_disease.probability) {
    this.severity_score = this.calculateSeverityScore();
  }
  
  next();
});

module.exports = mongoose.models.DiseaseDiagnosis || mongoose.model('DiseaseDiagnosis', diseaseDiagnosisSchema);