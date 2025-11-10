import mongoose from 'mongoose';

const CategoryScanSchema = new mongoose.Schema({
  category_id: { type: mongoose.Schema.Types.ObjectId, ref: 'PlantCategory' },
  user_id: { type: String, required: true },
  disease_name: String,
  confidence_percentage: Number,
  severity_percentage: Number,
  image_url: String,
  plant_name: String,
  diagnosed_date: { type: Date, default: Date.now },
  created_at: { type: Date, default: Date.now }
});

export default mongoose.models.CategoryScan || mongoose.model('CategoryScan', CategoryScanSchema, 'category_scans');