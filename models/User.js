import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password_hash: { type: String, required: true },
    location: { type: String, required: true },
    profile_image_url: { type: String, required: true },
    stats: {
      total_scans: { type: Number, default: 0 },
      avg_plant_health: { type: Number, default: 0 },
      last_scan: { type: Date, default: null },
    },
    active_marketplace_listings: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    ],
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
