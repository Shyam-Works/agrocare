import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { plantName } = req.body;

    if (!plantName) {
      return res.status(400).json({ error: "Plant name is required" });
    }

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a botanical expert. Provide detailed, accurate information about plants in JSON format. Use simple, easy-to-understand English. Be informative but concise. Always respond with valid JSON only, no markdown or extra text.`
        },
        {
          role: "user",
          content: `Provide detailed information about the plant: ${plantName}

Return ONLY a valid JSON object with this exact structure:
{
  "description": "2-3 sentences about what this plant is, its key features, and general characteristics",
  "appearance": {
    "leaves": "Description of leaves",
    "flowers": "Description of flowers if any",
    "growth": "Description of growth pattern"
  },
  "ideal_conditions": "1-2 sentences about ideal light, temperature, soil, and climate",
  "why_people_love_it": [
    "Benefit or attractive feature 1",
    "Benefit or attractive feature 2",
    "Benefit or attractive feature 3",
    "Benefit or attractive feature 4"
  ],
  "care_tips": [
    {
      "title": "Water Regularly",
      "description": "Specific watering advice"
    },
    {
      "title": "Light Requirements",
      "description": "Specific light advice"
    },
    {
      "title": "Humidity Needs",
      "description": "Specific humidity advice"
    },
    {
      "title": "Fertilization",
      "description": "Specific fertilizer advice"
    },
    {
      "title": "Maintenance",
      "description": "Additional care tip"
    }
  ],
  "fun_fact": "One interesting fact about this plant"
}`
        }
      ],
      max_tokens: 800,
      temperature: 0.7,
      response_format: { type: "json_object" }
    });

    const detailedInfo = completion.choices[0].message.content;
    const parsedInfo = JSON.parse(detailedInfo);
    
    res.status(200).json({ 
      plantName,
      details: parsedInfo,
      tokensUsed: completion.usage?.total_tokens 
    });

  } catch (error) {
    console.error("Plant details API Error:", error);
    res.status(500).json({ 
      error: "Failed to get plant details",
      details: error.message
    });
  }
}