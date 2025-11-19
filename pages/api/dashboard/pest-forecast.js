// pages/api/dashboard/pest-forecast.js

import { dbConnect } from "@/lib/dbConnect";
import mongoose from "mongoose";
import CategoryScan from "@/models/CategoryScan";
import PlantCategory from "@/models/PlantCategory";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const session = await getServerSession(req, res, authOptions);

  if (!session || !session.user || !session.user.id) {
    return res.status(401).json({ message: "Authentication required" });
  }

  // Check for OpenAI API key
  if (!process.env.OPENAI_API_KEY) {
    console.error("❌ OPENAI_API_KEY not configured");
    return res.status(500).json({ 
      success: false,
      message: "AI service not configured. Please add OPENAI_API_KEY to environment variables." 
    });
  }

  const userId = session.user.id;
  const { categoryId = "all", days = 3 } = req.query;

  try {
    console.log("\n========== PEST FORECAST API REQUEST ==========");
    console.log("User ID:", userId);
    console.log("Category Filter:", categoryId);
    console.log("Days to analyze:", days);

    await dbConnect();

    // Get recent scans (last N days)
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(days));

    const matchCriteria = {
      user_id: userId,
      diagnosed_date: { $gte: daysAgo },
    };

    if (categoryId && categoryId !== "all") {
      matchCriteria.category_id = new mongoose.Types.ObjectId(categoryId);
    }

    // Fetch recent scans
    const recentScans = await CategoryScan.find(matchCriteria)
      .sort({ diagnosed_date: -1 })
      .limit(20)
      .lean();

    console.log("Found", recentScans.length, "recent scans");

    if (recentScans.length === 0) {
      return res.status(200).json({
        forecast: null,
        message: "No recent scan data available for analysis",
      });
    }

    // Get category info
    let categoryName = "All Plants";
    if (categoryId && categoryId !== "all") {
      const category = await PlantCategory.findById(categoryId).lean();
      categoryName = category?.category_name || "Unknown Category";
    }

    // Fetch weather data - try both possible endpoints
    let weatherData = { location: {}, current: {}, forecast: [] };
    try {
      const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
      
      // Try the correct spelling first
      let weatherRes = await fetch(`${baseUrl}/api/weather/forcast`);
      
      // If that fails, try the typo version (forcast)
      if (!weatherRes.ok) {
        console.log("Trying alternative weather endpoint...");
        weatherRes = await fetch(`${baseUrl}/api/weather/forcast`);
      }
      
      if (!weatherRes.ok) {
        console.warn("Weather fetch failed, using empty data");
      } else {
        weatherData = await weatherRes.json();
        console.log("Weather data fetched for:", weatherData.location?.city);
      }
    } catch (weatherError) {
      console.warn("Weather API error (continuing without weather):", weatherError.message);
    }

    // Prepare data summary for AI
    const diseaseStats = {};
    let totalDiseased = 0;
    let avgSeverity = 0;
    let severitySum = 0;
    let severityCount = 0;

    recentScans.forEach((scan) => {
      const isHealthy =
        !scan.disease_name || scan.disease_name.toLowerCase() === "healthy";

      if (!isHealthy) {
        totalDiseased++;
        const diseaseName = scan.disease_name || "Unknown";
        diseaseStats[diseaseName] = (diseaseStats[diseaseName] || 0) + 1;

        if (scan.severity_percentage != null) {
          severitySum += scan.severity_percentage;
          severityCount++;
        }
      }
    });

    if (severityCount > 0) {
      avgSeverity = Math.round(severitySum / severityCount);
    }

    const topDiseases = Object.entries(diseaseStats)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([name, count]) => ({ name, count }));

    // Extract weather trends
    const current = weatherData.current || {};
    const next48Hours = weatherData.forecast?.slice(0, 48) || [];
    
    const avgHumidity = next48Hours.length > 0 
      ? Math.round(next48Hours.reduce((sum, h) => sum + h.humidity, 0) / next48Hours.length)
      : current.humidity || 0;
    
    const avgTemp = next48Hours.length > 0
      ? Math.round(next48Hours.reduce((sum, h) => sum + h.temp, 0) / next48Hours.length)
      : current.temp || 0;
    
    const totalPrecip = next48Hours.reduce((sum, h) => sum + (h.precipitation || 0), 0);
    const rainProbability = next48Hours.length > 0
      ? Math.round(next48Hours.reduce((sum, h) => sum + (h.pop || 0), 0) / next48Hours.length)
      : 0;

    // Prepare AI prompt
    const prompt = `You are an agricultural AI assistant specializing in plant disease forecasting and prevention.

**User's Recent Plant Data (Last ${days} days):**
- Plant Category: ${categoryName}
- Total Scans: ${recentScans.length}
- Diseased Plants: ${totalDiseased}
- Average Severity: ${avgSeverity}%
- Top Diseases Detected: ${topDiseases.map(d => `${d.name} (${d.count} cases)`).join(", ") || "None"}

**Upcoming Weather Forecast (Next 48 hours):**
- Location: ${weatherData.location?.city}, ${weatherData.location?.state}
- Average Temperature: ${avgTemp}°C
- Average Humidity: ${avgHumidity}%
- Total Expected Precipitation: ${totalPrecip.toFixed(1)}mm
- Rain Probability: ${rainProbability}%

Based on this data, provide a pest and disease forecast. Return ONLY a valid JSON object with this structure:

{
  "risk_level": "<low, medium, or high>",
  "risk_score": <number 0-100>,
  "risk_trend": [
    {"day": "Today", "risk": <0-100>, "level": "<low, medium, or high>"},
    {"day": "Tomorrow", "risk": <0-100>, "level": "<low, medium, or high>"},
    {"day": "Day 3", "risk": <0-100>, "level": "<low, medium, or high>"}
  ],
  "risk_distribution": {
    "low": <percentage 0-100>,
    "medium": <percentage 0-100>,
    "high": <percentage 0-100>
  },
  "summary": "Brief 2-3 sentence forecast of pest/disease risks based on weather and current plant health",
  "weather_impact": "How the upcoming weather conditions affect disease risks",
  "recommended_chemicals": [
    "Chemical name 1 (for specific condition)",
    "Chemical name 2 (for specific condition)"
  ],
  "preventive_actions": [
    "Specific actionable recommendation 1",
    "Specific actionable recommendation 2",
    "Specific actionable recommendation 3"
  ],
  "diseases_to_watch": [
    {
      "name": "Disease name",
      "reason": "Why this is a concern given weather/current data"
    }
  ]
}

IMPORTANT: 
- Classify each day as "low" (risk 0-33), "medium" (risk 34-66), or "high" (risk 67-100)
- Calculate risk_distribution based on the 3-day forecast (e.g., if 1 day is low, 1 is medium, 1 is high, then: low: 33, medium: 33, high: 33)
- Ensure risk_distribution percentages add up to 100

Consider:
- High humidity + moderate temps = fungal disease risk
- Recent disease history suggests vulnerability
- Rain increases spread risk
- Temperature extremes stress plants
- Category-specific vulnerabilities`;

    console.log("Calling OpenAI API for forecast...");

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an expert agricultural AI. Provide accurate, actionable pest and disease forecasts in JSON format only."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 1500,
      temperature: 0.7,
      response_format: { type: "json_object" }
    });

    const forecastData = JSON.parse(completion.choices[0].message.content);

    console.log("✅ Forecast Generated");
    console.log("Risk Level:", forecastData.risk_level);
    console.log("Risk Score:", forecastData.risk_score);

    res.status(200).json({
      success: true,
      forecast: forecastData,
      metadata: {
        scansAnalyzed: recentScans.length,
        categoryName,
        location: weatherData.location?.city,
        tokensUsed: completion.usage?.total_tokens
      }
    });

  } catch (error) {
    console.error("❌ PEST FORECAST API ERROR:", error.message);
    console.error("Error stack:", error.stack);
    
    // Check if it's an OpenAI error
    if (error.message?.includes("API key")) {
      return res.status(500).json({
        success: false,
        message: "OpenAI API key issue. Please check your configuration.",
        error: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Failed to generate forecast",
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}