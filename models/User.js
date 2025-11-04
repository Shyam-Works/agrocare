// models/User.js
import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema({
  first_name: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxLength: [50, 'First name cannot exceed 50 characters']
  },
  last_name: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxLength: [50, 'Last name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email address']
  },
  role: {
    type: String,
    default: 'Farmer'
  },
  description:{
    type: String,
    default: 'Hi there! How is your Plants?',
    maxLength: [500, 'Description cannot exceed 500 characters']
  },
  password_hash: {
    type: String,
    required: false
  },
  location: {
    type: String,
    default: 'Not specified',
    maxLength: [100, 'Location cannot exceed 100 characters']
  },
  profile_image_url: {
    type: String,
    default: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=128&h=128&fit=crop&crop=face',
    validate: {
      validator: function(v) {
        return /^https?:\/\/.+/.test(v)
      },
      message: 'Profile image URL must be a valid HTTP/HTTPS URL'
    }
  },
  stats: {
    total_scans: {
      type: Number,
      default: 0,
      min: [0, 'Total scans cannot be negative']
    },
    avg_plant_health: {
      type: Number,
      default: 0,
      min: [0, 'Average plant health cannot be negative'],
      max: [100, 'Average plant health cannot exceed 100']
    },
    last_scan: {
      type: Date,
      default: null
    }
  },
  google_id: {
    type: String,
    sparse: true // Allows multiple null values, creates index automatically
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  },
  resetToken: {
  type: String,
  default: null
},
resetTokenExpiry: {
  type: Date,
  default: null
},

}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
})

// Virtual for full name
UserSchema.virtual('full_name').get(function() {
  return `${this.first_name} ${this.last_name}`
})

// Pre-save middleware to update timestamp
UserSchema.pre('save', function(next) {
  this.updated_at = Date.now()
  next()
})

// Custom validation: Either password_hash or google_id must exist
UserSchema.pre('save', function(next) {
  if (!this.password_hash && !this.google_id) {
    const error = new Error('User must have either a password or Google ID')
    return next(error)
  }
  next()
})

// Instance method to check if user is Google-only
UserSchema.methods.isGoogleUser = function() {
  return this.google_id && !this.password_hash
}

// Instance method to update stats
UserSchema.methods.updateScanStats = function(plantHealth) {
  this.stats.total_scans += 1
  
  // Calculate new average
  const currentTotal = this.stats.avg_plant_health * (this.stats.total_scans - 1)
  this.stats.avg_plant_health = (currentTotal + plantHealth) / this.stats.total_scans
  
  this.stats.last_scan = new Date()
  
  return this.save()
}

// Static method to find user by email (case insensitive)
UserSchema.statics.findByEmail = function(email) {
  return this.findOne({ 
    email: { $regex: new RegExp(`^${email}$`, 'i') } 
  })
}

export default mongoose.models.User || mongoose.model('User', UserSchema)