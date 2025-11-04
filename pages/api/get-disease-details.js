import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    let { diseaseName, plantName, imageUrl } = req.body;

    if (!diseaseName) {
      return res.status(400).json({ error: "Disease name is required" });
    }

    console.log('=== DISEASE DETAILS REQUEST ===');
    console.log('Disease:', diseaseName);
    console.log('Plant:', plantName);
    console.log('Image URL provided:', imageUrl ? 'Yes' : 'No');

    // Validate imageUrl if provided - must be a proper URL, not a blob
    if (imageUrl && (imageUrl.startsWith('blob:') || !imageUrl.startsWith('http'))) {
      console.warn('Invalid image URL provided (blob or non-http URL), proceeding without image analysis');
      console.warn('URL was:', imageUrl);
      // Set imageUrl to null to proceed without image
      imageUrl = null;
    }

    if (imageUrl) {
      console.log('Using image URL for severity analysis:', imageUrl.substring(0, 50) + '...');
    }

    // Prepare messages array
    const messages = [
      {
        role: "system",
        content: `You are a plant pathology expert. Provide detailed, accurate information about plant diseases in JSON format. Use simple, easy-to-understand English. Be informative but concise. Always respond with valid JSON only, no markdown or extra text.`
      }
    ];

    // Build user message content
    let userContent = `Provide detailed information about the plant disease: ${diseaseName}${plantName ? ` affecting ${plantName}` : ''}`;

    // If image is provided, analyze it for disease severity
    if (imageUrl) {
      userContent += `\n\nI have provided an image of the affected plant. Please analyze the image and estimate the percentage of the plant affected by the disease (0-100%). Look at visible symptoms, affected leaf area, and overall plant health.`;
      
      messages.push({
        role: "user",
        content: [
          {
            type: "text",
            text: userContent + `\n\nReturn ONLY a valid JSON object with this exact structure:
{
  "description": "2-3 sentences about what this disease is, what causes it, and its general characteristics",
  "reference_link": "A reliable web link of wiki",
  "severity_assessment": {
    "affected_percentage": number (0-100),
    "severity_level": "mild, moderate, or severe",
    "visual_observations": "Brief description of what you observe in the image",
    "affected_areas": "Which parts of the plant show symptoms in the image"
  },
  "symptoms": {
    "early_signs": "Description of early symptoms",
    "advanced_stage": "Description of advanced symptoms",
    "affected_parts": "Which plant parts are typically affected"
  },
  "causes": {
    "primary_cause": "Main pathogen or environmental factor",
    "favorable_conditions": "Conditions that promote disease spread",
    "transmission": "How the disease spreads"
  },
  "why_it_happens": [
    "Key factor contributing to disease 1",
    "Key factor contributing to disease 2",
    "Key factor contributing to disease 3",
    "Key factor contributing to disease 4"
  ],
  "treatment_solutions": [
    {
      "title": "Immediate Action",
      "description": "First steps to take when disease is detected",
      "urgency": "high"
    },
    {
      "title": "Chemical Treatment",
      "description": "Recommended fungicides or pesticides with application method",
      "urgency": "medium"
    },
    {
      "title": "Organic Solutions",
      "description": "Natural or organic treatment options",
      "urgency": "medium"
    },
    {
      "title": "Cultural Practices",
      "description": "Long-term management through proper care",
      "urgency": "low"
    },
    {
      "title": "Prevention",
      "description": "How to prevent future outbreaks",
      "urgency": "low"
    }
  ],
  "prevention_tips": [
    "Prevention tip 1",
    "Prevention tip 2",
    "Prevention tip 3",
    "Prevention tip 4"
  ],
  "severity_level": "low, medium, or high",
  "recovery_time": "Expected time for plant recovery with proper treatment",
  "important_note": "Critical warning or important information about this disease"
}`
          },
          {
            type: "image_url",
            image_url: {
              url: imageUrl,
              detail: "high"
            }
          }
        ]
      });
    } else {
      // Without image - original behavior
      messages.push({
        role: "user",
        content: userContent + `\n\nReturn ONLY a valid JSON object with this exact structure:
{
  "description": "2-3 sentences about what this disease is, what causes it, and its general characteristics",
  "reference_link": "A reliable web link of wiki",
  "symptoms": {
    "early_signs": "Description of early symptoms",
    "advanced_stage": "Description of advanced symptoms",
    "affected_parts": "Which plant parts are typically affected"
  },
  "causes": {
    "primary_cause": "Main pathogen or environmental factor",
    "favorable_conditions": "Conditions that promote disease spread",
    "transmission": "How the disease spreads"
  },
  "why_it_happens": [
    "Key factor contributing to disease 1",
    "Key factor contributing to disease 2",
    "Key factor contributing to disease 3",
    "Key factor contributing to disease 4"
  ],
  "treatment_solutions": [
    {
      "title": "Immediate Action",
      "description": "First steps to take when disease is detected",
      "urgency": "high"
    },
    {
      "title": "Chemical Treatment",
      "description": "Recommended fungicides or pesticides with application method",
      "urgency": "medium"
    },
    {
      "title": "Organic Solutions",
      "description": "Natural or organic treatment options",
      "urgency": "medium"
    },
    {
      "title": "Cultural Practices",
      "description": "Long-term management through proper care",
      "urgency": "low"
    },
    {
      "title": "Prevention",
      "description": "How to prevent future outbreaks",
      "urgency": "low"
    }
  ],
  "prevention_tips": [
    "Prevention tip 1",
    "Prevention tip 2",
    "Prevention tip 3",
    "Prevention tip 4"
  ],
  "severity_level": "low, medium, or high",
  "recovery_time": "Expected time for plant recovery with proper treatment",
  "important_note": "Critical warning or important information about this disease"
}`
      });
    }

    const completion = await client.chat.completions.create({
      model: imageUrl ? "gpt-4o" : "gpt-4o-mini", // Use gpt-4o for vision capabilities
      messages: messages,
      max_tokens: 1500,
      temperature: 0.7,
      response_format: { type: "json_object" }
    });

    const detailedInfo = completion.choices[0].message.content;
    const parsedInfo = JSON.parse(detailedInfo);

    console.log('=== DISEASE DETAILS SUCCESS ===');
    console.log('Image analyzed:', !!imageUrl);
    console.log('Severity assessment included:', !!parsedInfo.severity_assessment);
    console.log('Tokens used:', completion.usage?.total_tokens);

    res.status(200).json({
      diseaseName,
      plantName,
      imageAnalyzed: !!imageUrl,
      details: parsedInfo,
      tokensUsed: completion.usage?.total_tokens
    });

  } catch (error) {
    console.error("Disease details API Error:", error);
    res.status(500).json({
      error: "Failed to get disease details",
      details: error.message
    });
  }
}