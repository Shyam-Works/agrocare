// pages/api/common-diseases.js
import OpenAI from 'openai';
import NodeCache from 'node-cache';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Cache with 12-hour TTL (in seconds)
const cache = new NodeCache({ stdTTL: 12 * 60 * 60 });

// Maximum percentage cap for top disease
const MAX_PERCENT = 60;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { location } = req.body;

  if (!location) {
    return res.status(400).json({ message: 'Location is required' });
  }

  // Check cache first
  const cachedData = cache.get(location.toLowerCase());
  if (cachedData) {
    console.log(`✅ Cache hit for ${location}`);
    return res.status(200).json({ diseases: cachedData });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an agricultural expert specializing in plant diseases. Provide accurate, location-specific information based on city demographics and historical agricultural data."
        },
        {
          role: "user",
          content: `Based on the agricultural history and demographic data of ${location} in the last 10 years, identify the 4 most common plant diseases observed in this region. 

Provide the response strictly as a JSON array with this exact structure:
[
  {"name": "Disease Name", "count": number},
  {"name": "Disease Name", "count": number},
  {"name": "Disease Name", "count": number},
  {"name": "Disease Name", "count": number}
]

The counts should represent estimated relative prevalence (highest first). Be precise — do not provide generalized or global diseases, focus only on ${location} and historical data. Only return the JSON array, no extra text.`
        }
      ],
      temperature: 0.3, // low randomness for consistency
      max_tokens: 300,
    });

    const responseText = completion.choices[0].message.content.trim();

    let diseases;
    try {
      const cleanedResponse = responseText.replace(/```json\n?|\n?```/g, '').trim();
      diseases = JSON.parse(cleanedResponse);

      // Find the raw maximum count
      const rawMax = Math.max(...diseases.map(d => d.count));

      // Convert to percentages capped at MAX_PERCENT
      diseases = diseases
        .map(d => ({
          name: d.name,
          percentage: Math.round((d.count / rawMax) * MAX_PERCENT)
        }))
        .sort((a, b) => b.percentage - a.percentage); // descending order

      // Cache the result
      cache.set(location.toLowerCase(), diseases);

    } catch (parseError) {
      console.error('Error parsing OpenAI response:', parseError);
      diseases = [];
    }

    return res.status(200).json({ diseases });
  } catch (error) {
    console.error('Error fetching common diseases:', error);
    return res.status(500).json({
      message: 'Failed to fetch common diseases',
      error: error.message
    });
  }
}
