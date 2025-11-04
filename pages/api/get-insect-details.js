// pages/api/get-insect-details.js
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { insectName } = req.body;

    if (!insectName) {
      return res.status(400).json({ error: "Insect name is required" });
    }

    const completion = await client.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are an entomologist and agricultural expert. Provide detailed, accurate information about insects with focus on their impact on agriculture and gardening. Use simple, easy-to-understand English. Be informative but concise. Always respond with valid JSON only, no markdown or extra text.`
        },
        {
          role: "user",
          content: `Provide detailed information about the insect: ${insectName}

Return ONLY a valid JSON object with this exact structure:
{
  "description": "2-3 sentences about what this insect is, its scientific classification, and general characteristics",
  "common_names": ["Common name 1", "Common name 2", "Common name 3"],
  "appearance": {
    "body": "Description of body structure, size, and main features",
    "colors": "Description of coloration and patterns",
    "distinctive_features": "Unique identifying features"
  },
  "lifecycle": {
    "stages": "Description of life cycle stages (egg, larva, pupa, adult)",
    "duration": "How long each stage typically lasts",
    "breeding_season": "When they typically reproduce"
  },
  "habitat_and_distribution": {
    "preferred_habitat": "Where this insect typically lives",
    "geographic_distribution": "Regions and countries where commonly found",
    "climate_preference": "Temperature and climate they thrive in"
  },
  "impact_on_agriculture": {
    "pest_status": "Is it beneficial, harmful, or neutral to agriculture",
    "affected_plants": ["Plant 1", "Plant 2", "Plant 3", "Plant 4"],
    "type_of_damage": "How it damages plants (if applicable)",
    "damage_signs": "Visible signs of infestation on plants"
  },
  "management_for_gardeners": [
    {
      "title": "Prevention Methods",
      "description": "How to prevent infestation"
    },
    {
      "title": "Natural Control",
      "description": "Organic and biological control methods"
    },
    {
      "title": "Chemical Control",
      "description": "When and how to use pesticides if necessary"
    },
    {
      "title": "Monitoring Tips",
      "description": "How to detect early signs of presence"
    }
  ],
  "beneficial_aspects": [
    "Beneficial role 1 (pollination, pest control, etc.)",
    "Beneficial role 2",
    "Beneficial role 3"
  ],
  "interesting_facts": [
    "Fascinating fact 1",
    "Fascinating fact 2",
    "Fascinating fact 3"
  ],
  "seasonal_activity": "When this insect is most active during the year"
}`
        }
      ],
      max_tokens: 1000,
      temperature: 0.7,
      response_format: { type: "json_object" }
    });

    const detailedInfo = completion.choices[0].message.content;
    const parsedInfo = JSON.parse(detailedInfo);
    
    res.status(200).json({ 
      insectName,
      details: parsedInfo,
      tokensUsed: completion.usage?.total_tokens 
    });

  } catch (error) {
    console.error("Insect details API Error:", error);
    res.status(500).json({ 
      error: "Failed to get insect details",
      details: error.message
    });
  }
}