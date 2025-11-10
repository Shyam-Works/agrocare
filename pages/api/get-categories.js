import { dbConnect } from "@/lib/dbConnect";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    // Get user session
    const session = await getServerSession(req, res, authOptions);
    
    if (!session || !session.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    await dbConnect();
    const db = (await dbConnect()).connection.db;

    // Fetch user's categories with aggregated stats
    const categories = await db
      .collection("plant_categories")
      .aggregate([
        {
          $match: { user_id: session.user.id }
        },
        {
          $lookup: {
            from: "disease_diagnoses",
            localField: "_id",
            foreignField: "category_id",
            as: "diagnoses"
          }
        },
        {
          $addFields: {
            stats: {
              total_scans: { $size: "$diagnoses" },
              last_scan: { $max: "$diagnoses.created_at" },
              trend: {
                $cond: {
                  if: { $gt: [{ $size: "$diagnoses" }, 0] },
                  then: "active",
                  else: "inactive"
                }
              }
            }
          }
        },
        {
          $project: {
            diagnoses: 0
          }
        },
        {
          $sort: { created_at: -1 }
        }
      ])
      .toArray();

    return res.status(200).json({
      success: true,
      categories: categories
    });

  } catch (error) {
    console.error("Error fetching categories:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch categories",
      error: error.message
    });
  }
}