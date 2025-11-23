import OpenAI from "openai";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]"; 
import { dbConnect } from "@/lib/dbConnect";
import GardenPlan from "@/models/GardenPlan";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 1. Helper to fetch REAL plant image using Plant.id KB API
const fetchPlantImage = async (scientificName, commonName) => {
  const apiKey = process.env.PLANT_ID_API_KEY;
  
  // Fallback image if API fails (LoremFlickr is reliable for placeholders)
  const fallbackUrl = `https://loremflickr.com/500/500/${encodeURIComponent(commonName || 'plant')},garden/all`;

  // A. Try Plant.id Knowledge Base Search
  if (apiKey) {
    try {
      // Step 1: Search for the plant entity to get access_token
      // We search by scientific name for accuracy, fallback to common name
      const query = scientificName || commonName;
      const searchUrl = `https://plant.id/api/v3/kb/plants/name_search?q=${encodeURIComponent(query)}`;
      
      const searchRes = await fetch(searchUrl, {
        headers: { 'Api-Key': apiKey }
      });

      if (searchRes.ok) {
        const searchData = await searchRes.json();
        // Take the first/best match
        const entity = searchData.entities?.[0]; 

        if (entity && entity.access_token) {
          // Step 2: Get details (image) using access_token
          const detailsUrl = `https://plant.id/api/v3/kb/plants/${entity.access_token}?details=image`;
          const detailsRes = await fetch(detailsUrl, {
            headers: { 'Api-Key': apiKey }
          });

          if (detailsRes.ok) {
            const detailsData = await detailsRes.json();
            if (detailsData.image?.value) {
              return detailsData.image.value; // Found real image!
            }
          }
        }
      }
    } catch (error) {
      console.error(`Plant.id fetch failed for ${commonName}:`, error.message);
      // Fallback proceeds below
    }
  }

  return fallbackUrl;
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    await dbConnect();
    
    // Auth Check
    let session;
    try {
        session = await getServerSession(req, res, authOptions);
    } catch (e) {
        console.error("Auth Session Error:", e);
    }

    if (!session || !session.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { action, imageUrl, size, cost, idea, selectedPlantName } = req.body;

    // ==========================================
    // ACTION 1: SUGGEST PLANTS
    // ==========================================
    if (action === 'suggest') {
        if (!imageUrl || !idea) return res.status(400).json({ error: "Image and idea required" });

        console.log("Analyzing Garden Plan for:", session.user.email);

        // A. Call ChatGPT Vision
        const systemPrompt = `You are an expert landscape architect. 
        Analyze the user's backyard image and their goal: "${idea}". 
        Constraints: Budget $${cost}, Area ${size}m².
        
        Return a JSON object with a "suggestions" array of exactly 4 plants.
        Each plant object must have:
        - "common_name": String (e.g., "Tomato")
        - "scientific_name": String (e.g., "Solanum lycopersicum") - CRITICAL for image search
        - "care_level": String (Enum: "High", "Moderate", "Low", "Normal")
        - "sun_requirement": String (Max 2 words, e.g. "Full Sun")
        - "days_to_harvest": String (e.g. "60 days")
        `;

        const gptResponse = await client.chat.completions.create({
            model: "gpt-4o", 
            messages: [
                { role: "system", content: systemPrompt },
                { 
                    role: "user", 
                    content: [
                        { type: "text", text: "Suggest 4 plants for this space." },
                        { type: "image_url", image_url: { url: imageUrl } }
                    ] 
                }
            ],
            response_format: { type: "json_object" }
        });

        const content = gptResponse.choices[0].message.content;
        const gptData = JSON.parse(content);
        let suggestions = gptData.suggestions;

        // B. Fetch Images (Parallel)
        // We use Promise.all to fetch all images at once
        suggestions = await Promise.all(suggestions.map(async (plant) => {
            const realImageUrl = await fetchPlantImage(plant.scientific_name, plant.common_name);
            return {
                ...plant,
                image_url: realImageUrl
            };
        }));

        // C. Save Plan to DB
        try {
            await GardenPlan.create({
                user_id: session.user.id,
                original_image_url: imageUrl,
                inputs: { estimated_size: size, estimated_cost: cost, user_idea: idea },
                suggestions: suggestions
            });
        } catch (dbError) {
            console.error("Failed to save plan to DB:", dbError);
        }

        return res.status(200).json(suggestions);
    }

    // ==========================================
    // ACTION 2: GET DETAILED GUIDE
    // ==========================================
    if (action === 'detail') {
        if (!selectedPlantName) return res.status(400).json({ error: "Plant name required" });

        const systemPrompt = `Provide a detailed growing guide for the plant "${selectedPlantName}".
        Return valid JSON matching this structure EXACTLY:
        {
            "watering": { 
                "frequency": "e.g. Once a day", 
                "tip": "Detailed tip about moisture" 
            },
            "fertilizer": { 
                "type": "e.g. Balanced NPK 10-10-10", 
                "frequency": "e.g. Every 2 weeks", 
                "tip": "Organic matter tip" 
            },
            "pest": { 
                "fungicide": "Recommended fungicide name", 
                "insecticide": "Recommended insecticide name", 
                "tip": "General pest prevention tip" 
            },
            "seed": { 
                "type": "Recommended variety/type", 
                "depth": "e.g. 1/4 inch", 
                "spacing": "e.g. 18 inches" 
            },
            "season": "e.g. Spring to Fall",
            "spacing": "e.g. 24-36 inches apart",
            "support_tip": "Tip about stakes or cages",
            "equipment": ["Item 1", "Item 2", "Item 3"]
        }`;

        const gptResponse = await client.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: "system", content: systemPrompt }],
            response_format: { type: "json_object" }
        });

        const details = JSON.parse(gptResponse.choices[0].message.content);
        return res.status(200).json(details);
    }

  } catch (error) {
    console.error("Plan Garden API Error:", error);
    return res.status(500).json({ error: error.message || "Internal Server Error" });
  }
}