// pages/api/dashboard/data.js (SIMPLIFIED & FIXED)

import { dbConnect } from "@/lib/dbConnect";
import mongoose from "mongoose";
import CategoryScan from "@/models/CategoryScan";
import PlantCategory from "@/models/PlantCategory";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

const getDateFilter = (range) => {
  const now = new Date();
  switch (range) {
    case "7d":
      now.setDate(now.getDate() - 7);
      break;
    case "30d":
      now.setDate(now.getDate() - 30);
      break;
    case "90d":
      now.setDate(now.getDate() - 90);
      break;
    case "1y":
      now.setFullYear(now.getFullYear() - 1);
      break;
    default:
      now.setDate(now.getDate() - 30);
      break;
  }
  return now;
};

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store, max-age=0");

  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const session = await getServerSession(req, res, authOptions);

  if (!session || !session.user || !session.user.id) {
    console.log("❌ Unauthorized: No valid session found.");
    return res.status(401).json({ message: "Authentication required" });
  }

  const userId = session.user.id;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: "Invalid User ID format" });
  }

  const { timeRange = "30d", categoryId = "all" } = req.query;

  try {
    console.log("\n========== DASHBOARD API REQUEST ==========");
    console.log("1. User ID:", userId);
    console.log("2. Category Filter:", categoryId);
    console.log("3. Time Range:", timeRange);

    await dbConnect();
    console.log("4. DB Connected");

    await CategoryScan.init();
    await PlantCategory.init();

    const dateFilter = getDateFilter(timeRange);
    console.log("5. Date Filter:", dateFilter);

    // Base match criteria
    const matchCriteria = {
      user_id: userId,
      diagnosed_date: { $gte: dateFilter },
    };

    if (categoryId && categoryId !== "all") {
      matchCriteria.category_id = new mongoose.Types.ObjectId(categoryId);
    }

    console.log("6. Match Criteria:", JSON.stringify(matchCriteria, null, 2));

    // FIXED: Build categories from scans since plant_categories is empty
    console.log("\n--- Fetching User Categories ---");
    console.log("Looking for user_id:", userId, "(type:", typeof userId, ")");

    // Get all scans for this user in the time range
    const allUserScans = await CategoryScan.find({
      user_id: userId,
      diagnosed_date: { $gte: dateFilter },
    }).lean();
    console.log("Found", allUserScans.length, "scans in time range");

    // Build categories from unique category_ids in scans
    const categoryMap = new Map();

    allUserScans.forEach((scan) => {
      const catId = scan.category_id?.toString();
      if (catId) {
        if (!categoryMap.has(catId)) {
          categoryMap.set(catId, {
            id: catId,
            name: `Category ${categoryMap.size + 1}`, // Default name
            count: 0,
          });
        }
        categoryMap.get(catId).count++;
      }
    });

    // Try to get real category names from plant_categories collection
    if (categoryMap.size > 0) {
      const categoryIds = Array.from(categoryMap.keys()).map(
        (id) => new mongoose.Types.ObjectId(id)
      );
      const realCategories = await PlantCategory.find({
        _id: { $in: categoryIds },
      }).lean();

      console.log(
        "Found",
        realCategories.length,
        "categories in plant_categories collection"
      );

      realCategories.forEach((cat) => {
        const catId = cat._id.toString();
        if (categoryMap.has(catId)) {
          categoryMap.get(catId).name = cat.category_name;
        }
      });
    }

    // Convert map to array
    const categoriesFormatted = Array.from(categoryMap.values());
    console.log("Final categories:", categoriesFormatted);

    console.log("\n--- Final Categories ---");
    console.log(JSON.stringify(categoriesFormatted, null, 2));

    // Determine if plant is healthy
    const isHealthyCondition = {
      $or: [
        { $eq: ["$disease_name", "healthy"] },
        { $eq: ["$disease_name", "Healthy"] },
        { $eq: ["$disease_name", null] },
      ],
    };

    // P1: Stats & Aggregates
    const statsPipeline = [
      { $match: matchCriteria },
      {
        $group: {
          _id: null,
          totalDiagnoses: { $sum: 1 },
          diseasedPlants: {
            $sum: {
              $cond: [isHealthyCondition, 0, 1],
            },
          },
          healthyPlants: {
            $sum: {
              $cond: [isHealthyCondition, 1, 0],
            },
          },
          totalSeverity: {
            $sum: {
              $cond: [
                isHealthyCondition,
                0,
                { $ifNull: ["$severity_percentage", 0] },
              ],
            },
          },
          diseasedCount: {
            $sum: {
              $cond: [isHealthyCondition, 0, 1],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          totalDiagnoses: 1,
          diseasedPlants: 1,
          healthyPlants: 1,
          avgSeverity: {
            $cond: [
              { $gt: ["$diseasedCount", 0] },
              {
                $round: [{ $divide: ["$totalSeverity", "$diseasedCount"] }, 0],
              },
              0,
            ],
          },
        },
      },
    ];

    // P2: Previous period stats
    const prevDateFilter = getDateFilter(timeRange);
    const duration = new Date() - dateFilter;
    prevDateFilter.setTime(dateFilter.getTime() - duration);
    const prevMatchCriteria = {
      user_id: userId,
      diagnosed_date: { $gte: prevDateFilter, $lt: dateFilter },
    };
    if (categoryId && categoryId !== "all") {
      prevMatchCriteria.category_id = new mongoose.Types.ObjectId(categoryId);
    }
    const prevStatsPipeline = [
      { $match: prevMatchCriteria },
      { $group: { _id: null, totalDiagnoses: { $sum: 1 } } },
      { $project: { _id: 0, totalDiagnoses: 1 } },
    ];

    // P3: Disease Trend
    const groupFormat =
      timeRange === "7d" || timeRange === "30d" ? "%Y-%m-%d" : "%Y-%m";
    const trendPipeline = [
      { $match: matchCriteria },
      {
        $group: {
          _id: {
            $dateToString: { format: groupFormat, date: "$diagnosed_date" },
          },
          diseased: {
            $sum: {
              $cond: [isHealthyCondition, 0, 1],
            },
          },
          healthy: {
            $sum: {
              $cond: [isHealthyCondition, 1, 0],
            },
          },
          totalSeverity: {
            $sum: {
              $cond: [
                isHealthyCondition,
                0,
                { $ifNull: ["$severity_percentage", 0] },
              ],
            },
          },
          diseasedCount: {
            $sum: {
              $cond: [isHealthyCondition, 0, 1],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          date: "$_id",
          diseased: 1,
          healthy: 1,
          severity: {
            $cond: [
              { $gt: ["$diseasedCount", 0] },
              {
                $round: [{ $divide: ["$totalSeverity", "$diseasedCount"] }, 0],
              },
              0,
            ],
          },
        },
      },
      { $sort: { date: 1 } },
    ];

    // P4: Disease Distribution
    const distributionPipeline = [
      {
        $match: {
          ...matchCriteria,
          disease_name: {
            $exists: true,
            $nin: ["healthy", "Healthy", null, ""],
          },
        },
      },
      { $group: { _id: "$disease_name", value: { $sum: 1 } } },
      { $sort: { value: -1 } },
      { $limit: 4 },
    ];

    // P5: Severity Levels
  // Replace the P5: Severity Levels section in your API file with this:

// P5: Severity Levels - FIXED to include 0 values
const severityPipeline = [
  {
    $match: {
      ...matchCriteria,
      severity_percentage: { $exists: true, $ne: null }, // Include all scans with severity (including 0)
    },
  },
  {
    $addFields: {
      severityLevel: {
        $switch: {
          branches: [
            { case: { $lt: ["$severity_percentage", 20] }, then: "Mild" },
            { case: { $lt: ["$severity_percentage", 50] }, then: "Moderate" },
            { case: { $gte: ["$severity_percentage", 50] }, then: "Severe" },
          ],
          default: "Mild", // Default to Mild for edge cases
        },
      },
    },
  },
  {
    $group: {
      _id: "$severityLevel",
      count: { $sum: 1 },
    },
  },
  {
    $project: {
      _id: 0,
      level: "$_id",
      count: 1,
    },
  },
];

    // P6: Scan Activity
    const dateFilterActivity = getDateFilter("1y");
    const activityPipeline = [
      {
        $match: {
          user_id: userId,
          diagnosed_date: { $gte: dateFilterActivity },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$diagnosed_date" } },
          scans: { $sum: 1 },
        },
      },
      { $project: { _id: 0, monthYear: "$_id", scans: 1 } },
      { $sort: { monthYear: 1 } },
    ];

    // P7: Recent Diagnoses
    const recentDiagnosesPipeline = [
      {
        $match: {
          user_id: userId,
        },
      },
      { $sort: { diagnosed_date: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "plant_categories",
          localField: "category_id",
          foreignField: "_id",
          as: "categoryInfo",
        },
      },
      {
        $project: {
          diagnosed_date: 1,
          category_name: {
            $ifNull: [
              { $arrayElemAt: ["$categoryInfo.category_name", 0] },
              "Uncategorized",
            ],
          },
          disease_name: 1,
          severity_percentage: 1,
          plant_name: 1,
        },
      },
    ];

    // Execute pipelines
    console.log("\n--- Running Aggregations ---");
    const [
      statsResult,
      prevStatsResult,
      trendData,
      distributionDataRaw,
      severityDataRaw,
      activityDataRaw,
      recentDiagnosesRaw,
    ] = await Promise.all([
      CategoryScan.aggregate(statsPipeline),
      CategoryScan.aggregate(prevStatsPipeline),
      CategoryScan.aggregate(trendPipeline),
      CategoryScan.aggregate(distributionPipeline),
      CategoryScan.aggregate(severityPipeline),
      CategoryScan.aggregate(activityPipeline),
      CategoryScan.aggregate(recentDiagnosesPipeline),
    ]);

    console.log("✅ Aggregations Complete");

    // Format stats
    const currentStats = statsResult[0] || {
      totalDiagnoses: 0,
      diseasedPlants: 0,
      healthyPlants: 0,
      avgSeverity: 0,
    };
    const prevStats = prevStatsResult[0] || { totalDiagnoses: 0 };

    let change = 0;
    if (prevStats.totalDiagnoses > 0) {
      change = Math.round(
        ((currentStats.totalDiagnoses - prevStats.totalDiagnoses) /
          prevStats.totalDiagnoses) *
          100
      );
    } else if (currentStats.totalDiagnoses > 0) {
      change = 100;
    }

    const statsFormatted = [
      {
        title: "Total Diagnoses",
        value: currentStats.totalDiagnoses.toString(),
        change: change,
        trend: change >= 0 ? "up" : "down",
        color: "blue",
        icon: "Activity",
      },
      {
        title: "Diseased Plants",
        value: currentStats.diseasedPlants.toString(),
        change: 0,
        trend: "up",
        color: "red",
        icon: "AlertTriangle",
      },
      {
        title: "Avg Severity",
        value: `${currentStats.avgSeverity}%`,
        change: 0,
        trend: "up",
        color: "orange",
        icon: "TrendingUp",
      },
    ];

    // Format disease distribution
    const totalDiseased = distributionDataRaw.reduce(
      (sum, item) => sum + item.value,
      0
    );
    let othersCount = totalDiseased;
    const diseaseDistribution = distributionDataRaw.map((item) => {
      othersCount -= item.value;
      return {
        name: item._id || "Unknown",
        value: item.value,
        percentage:
          totalDiseased > 0
            ? Math.round((item.value / totalDiseased) * 100)
            : 0,
      };
    });
    if (othersCount > 0) {
      const othersPercentage =
        totalDiseased > 0 ? Math.round((othersCount / totalDiseased) * 100) : 0;
      diseaseDistribution.push({
        name: "Others",
        value: othersCount,
        percentage: othersPercentage,
      });
    }

    // Format severity data
    const severityMapping = {
      Mild: "#6A8E4E",
      Moderate: "#D9A40B",
      Severe: "#A0522D",
    };
    const severityData = Object.keys(severityMapping).map((level) => {
      const dataPoint = severityDataRaw.find((d) => d.level === level) || {
        count: 0,
      };
      return {
        level: level,
        count: dataPoint.count,
        color: severityMapping[level],
      };
    });

    // Format monthly scans
    // Define all months
    const monthOrder = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    // Map raw data to month names
    const monthlyRaw = activityDataRaw.map((item) => {
      const monthIndex = parseInt(item.monthYear.slice(5)) - 1;
      return { month: monthOrder[monthIndex], scans: item.scans };
    });

    // Fill in missing months with 0 scans
    const monthlyScans = monthOrder.map((month) => {
      const found = monthlyRaw.find((item) => item.month === month);
      return found || { month, scans: 0 };
    });

    // Format recent diagnoses
    const recentDiagnosesFormatted = recentDiagnosesRaw.map((item) => {
      const isHealthy =
        !item.disease_name || item.disease_name.toLowerCase() === "healthy";
      const severity = isHealthy ? 0 : item.severity_percentage || 0;

      return {
        date: new Date(item.diagnosed_date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        category: item.category_name || "Uncategorized",
        disease: isHealthy ? "Healthy" : item.disease_name || "Unknown Disease",
        severity: severity,
        status: isHealthy
          ? "Healthy"
          : severity > 50
          ? "Active"
          : severity > 15
          ? "Monitoring"
          : "Treated",
      };
    });

    console.log("\n========== SENDING RESPONSE ==========");
    console.log("Categories:", categoriesFormatted.length);
    console.log(
      "Stats:",
      statsFormatted.map((s) => `${s.title}: ${s.value}`)
    );
    console.log("=========================================\n");

    res.status(200).json({
      stats: statsFormatted,
      categories: categoriesFormatted,
      diseaseTrendData: trendData,
      diseaseDistribution: diseaseDistribution,
      severityData: severityData,
      monthlyScans: monthlyScans,
      recentDiagnoses: recentDiagnosesFormatted,
    });
  } catch (error) {
    console.error("❌ FATAL API ERROR:", error.message, error.stack);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
}
