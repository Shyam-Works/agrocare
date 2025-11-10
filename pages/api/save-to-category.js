import { dbConnect } from "@/lib/dbConnect";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";
import mongoose from "mongoose";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    
    if (!session || !session.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { diagnosis_data, category_name, category_id, create_new } = req.body;

    if (!diagnosis_data) {
      return res.status(400).json({ message: "Diagnosis data is required" });
    }

    await dbConnect();
    const db = (await dbConnect()).connection.db;

    const toObjectId = (id) => {
      if (typeof id === 'string') {
        return mongoose.Types.ObjectId.isValid(id) 
          ? new mongoose.Types.ObjectId(id) 
          : id;
      }
      return id;
    };

    let finalCategoryId;
    let categoryData;

    // Create new category or use existing
    if (create_new && category_name) {
      const existingCategory = await db.collection("plant_categories").findOne({
        user_id: session.user.id,
        category_name: category_name.trim()
      });

      if (existingCategory) {
        finalCategoryId = existingCategory._id;
        categoryData = existingCategory;
      } else {
        const newCategory = {
          user_id: session.user.id,
          category_name: category_name.trim(),
          plant_type: diagnosis_data.plant_name || null,
          created_at: new Date(),
          updated_at: new Date()
        };

        const result = await db.collection("plant_categories").insertOne(newCategory);
        finalCategoryId = result.insertedId;
        categoryData = { ...newCategory, _id: finalCategoryId };
      }
    } else if (category_id) {
      categoryData = await db.collection("plant_categories").findOne({
        _id: toObjectId(category_id),
        user_id: session.user.id
      });

      if (!categoryData) {
        return res.status(404).json({ message: "Category not found" });
      }

      finalCategoryId = categoryData._id;
    } else {
      return res.status(400).json({ 
        message: "Either category_id or category_name must be provided" 
      });
    }

    // Create a scan record with the diagnosis data
    const scanRecord = {
      category_id: finalCategoryId,
      user_id: session.user.id,
      disease_name: diagnosis_data.disease_name,
      confidence_percentage: diagnosis_data.confidence_percentage,
      severity_percentage: diagnosis_data.severity_percentage || null,
      image_url: diagnosis_data.image_url,
      plant_name: diagnosis_data.plant_name,
      diagnosed_date: new Date(diagnosis_data.diagnosed_date),
      created_at: new Date()
    };

    await db.collection("category_scans").insertOne(scanRecord);

    // Update category's updated_at timestamp
    await db.collection("plant_categories").updateOne(
      { _id: finalCategoryId },
      { $set: { updated_at: new Date() } }
    );

    console.log('Saved scan to category:', categoryData.category_name);

    return res.status(200).json({
      success: true,
      message: "Diagnosis saved to category successfully",
      category: {
        id: finalCategoryId.toString(),
        name: categoryData.category_name
      }
    });

  } catch (error) {
    console.error("Error saving to category:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to save to category",
      error: error.message
    });
  }
}