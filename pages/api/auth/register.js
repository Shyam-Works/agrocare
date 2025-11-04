// pages/api/auth/register.js
import bcrypt from "bcryptjs"
import User from "../../../models/User"
import { dbConnect } from "../../../lib/dbConnect"

// Enhanced password validation function
function validatePassword(password) {
  const requirements = {
    minLength: password.length >= 6,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password)
  };
  
  const isValid = Object.values(requirements).every(Boolean);
  const missingRequirements = Object.entries(requirements)
    .filter(([key, valid]) => !valid)
    .map(([key]) => {
      switch(key) {
        case 'minLength': return 'at least 6 characters';
        case 'hasUppercase': return 'one uppercase letter';
        case 'hasLowercase': return 'one lowercase letter';
        case 'hasNumber': return 'one number';
        case 'hasSpecialChar': return 'one special character';
        default: return key;
      }
    });
  
  return { isValid, missingRequirements };
}

// Add the missing validateRegistrationData function
function validateRegistrationData(data) {
  const errors = []

  if (!data.first_name || data.first_name.trim() === '') errors.push('First name is required')
  if (!data.last_name || data.last_name.trim() === '') errors.push('Last name is required')
  if (!data.email || data.email.trim() === '') errors.push('Email is required')
  if (!data.password) errors.push('Password is required')

  if (data.password && data.confirm_password && data.password !== data.confirm_password) {
    errors.push('Passwords do not match')
  }

  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('Invalid email format')
  }

  if (data.password) {
    const passwordValidation = validatePassword(data.password)
    if (!passwordValidation.isValid) {
      errors.push(`Password must contain: ${passwordValidation.missingRequirements.join(', ')}`)
    }
  }

  return { isValid: errors.length === 0, errors }
}

async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  try {
    console.log("Registration attempt:", { email: req.body.email }); // Log for debugging

    const { 
      first_name, 
      last_name, 
      email, 
      password, 
      confirm_password,
      location,
      profile_image_url 
    } = req.body

    // Validate required fields
    if (!first_name || !last_name || !email || !password) {
      return res.status(400).json({ error: "First name, last name, email, and password are required" })
    }

    // Validate password confirmation
    if (password !== confirm_password) {
      return res.status(400).json({ error: "Passwords do not match" })
    }

    // Enhanced password validation
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({ 
        error: `Password must contain: ${passwordValidation.missingRequirements.join(', ')}`
      });
    }

    // Connect to database
    await dbConnect()
    console.log("Database connected successfully"); // Debug log

    // Check if user already exists (case insensitive email check)
    const existingUser = await User.findOne({ 
      email: { $regex: new RegExp(email, 'i') } 
    })
    
    if (existingUser) {
      console.log("User already exists:", email); // Debug log
      return res.status(400).json({ error: "User already exists with this email" })
    }

    // Hash password with higher salt rounds for security
    console.log("Hashing password..."); // Debug log
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user with trimmed and formatted data
    const userData = {
      first_name: first_name.trim(),
      last_name: last_name.trim(),
      email: email.toLowerCase().trim(),
      password_hash: hashedPassword,
      location: location ? location.trim() : "Not specified",
      profile_image_url: profile_image_url || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=128&h=128&fit=crop&crop=face",
      stats: {
        total_scans: 0,
        avg_plant_health: 0,
        last_scan: null
      },
      created_at: new Date(),
      updated_at: new Date()
    };

    console.log("Creating user..."); // Debug log
    const user = new User(userData);
    await user.save();
    console.log("User created successfully:", user._id); // Debug log

    // Return success response without sensitive data
    res.status(201).json({ 
      message: "Registration successful! Please sign in with your credentials.",
      user: {
        id: user._id.toString(),
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        location: user.location,
        profile_image_url: user.profile_image_url,
        created_at: user.created_at
      }
    })

  } catch (error) {
    console.error("Registration error:", error);
    
    // Handle specific MongoDB errors
    if (error.code === 11000) {
      return res.status(400).json({ error: "Email already exists" });
    }
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ error: `Validation error: ${validationErrors.join(', ')}` });
    }
    
    res.status(500).json({ error: "Internal server error. Please try again." })
  }
}

export default handler
export { validatePassword, validateRegistrationData }