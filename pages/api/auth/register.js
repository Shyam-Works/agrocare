import bcrypt from "bcryptjs";
import User from "@/models/User";
import { dbConnect } from "@/lib/dbConnect";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    await dbConnect();

    const { first_name, last_name, email, password, location, profile_image_url } = req.body;

    if (!first_name || !last_name || !email || !password || !location) {
      return res.status(400).json({ error: "All fields except profile image are required" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const user = await User.create({
      first_name,
      last_name,
      email,
      password_hash,
      location,
      profile_image_url: profile_image_url || "",
    });

    return res.status(201).json({ message: "User registered successfully", user });
  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}