// pages/api/auth/register.js
import bcrypt from "bcryptjs"
import User from "../../../models/User"
import { dbConnect } from "../../../lib/dbConnect"

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  try {
    const { 
      first_name, 
      last_name, 
      email, 
      password, 
      confirm_password,
      location,
      profile_image_url 
    } = req.body

    // Validation
    if (!first_name || !last_name || !email || !password) {
      return res.status(400).json({ error: "First name, last name, email, and password are required" })
    }

    if (password !== confirm_password) {
      return res.status(400).json({ error: "Passwords do not match" })
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters long" })
    }

    await dbConnect()

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ error: "User already exists with this email" })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const user = new User({
      first_name,
      last_name,
      email,
      password_hash: hashedPassword,
      location: location || "Not specified",
      profile_image_url: profile_image_url || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=128&h=128&fit=crop&crop=face",
      stats: {
        total_scans: 0,
        avg_plant_health: 0,
        last_scan: null
      }
    })

    await user.save()

    // Return success without sensitive data
    res.status(201).json({ 
      message: "Registration successful! Please sign in with your credentials.",
      user: {
        id: user._id.toString(),
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        location: user.location,
        profile_image_url: user.profile_image_url
      }
    })

  } catch (error) {
    console.error("Registration error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}