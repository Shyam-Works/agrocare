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

    // Improved image validation - accept both HTTP URLs and base64 encoded images
    let validImageUrl = null;
    if (imageUrl) {
      console.log('Original image URL/data length:', imageUrl.substring(0, 100));
      
      // Check if it's a base64 encoded image
      if (imageUrl.startsWith('data:image/')) {
        console.log('✓ Base64 encoded image detected');
        validImageUrl = imageUrl;
      }
      // Check if it's a valid HTTP/HTTPS URL
      else if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
        console.log('✓ HTTP URL detected');
        validImageUrl = imageUrl;
      }
      // Reject blob URLs
      else if (imageUrl.startsWith('blob:')) {
        console.warn('✗ Blob URL detected - cannot be used. Please convert to base64 or upload to cloud storage first.');
      }
      else {
        console.warn('✗ Invalid image format. Expected: http(s):// URL or data:image/ base64');
      }
    }

    if (validImageUrl) {
      console.log('✓ Valid image will be used for severity analysis');
    } else if (imageUrl) {
      console.log('✗ Image provided but invalid format - proceeding without image analysis');
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

    // If valid image is provided, analyze it for disease severity
    if (validImageUrl) {
      userContent += `\n\nI have provided an image of the affected plant. Please analyze the image carefully and estimate the percentage of the plant affected by the disease (1-100%) excluding 0. Look at visible symptoms, affected leaf area, discoloration, spots, wilting, and overall plant health. Be specific in your observations.`;
      
      messages.push({
        role: "user",
        content: [
          {
            type: "text",
            text: userContent + `\n\nReturn ONLY a valid JSON object with this exact structure:
{
  "description": "2-3 sentences about what this disease is, what causes it, and its general characteristics",
  "reference_link": "A reliable web link to Wikipedia or educational resource",
  "severity_assessment": {
    "affected_percentage": <number between 1-100> excluding 0,
    "severity_level": "<mild, moderate, or severe>",
    "visual_observations": "Brief description of what you observe in the image (e.g., leaf spots, discoloration, wilting)",
    "affected_areas": "Which parts of the plant show symptoms in the image (e.g., lower leaves, stems, entire plant)"
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
  "severity_level": "<low, medium, or high>",
  "recovery_time": "Expected time for plant recovery with proper treatment",
  "important_note": "Critical warning or important information about this disease"
}`
          },
          {
            type: "image_url",
            image_url: {
              url: validImageUrl,
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
  "reference_link": "A reliable web link to Wikipedia or educational resource",
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
  "severity_level": "<low, medium, or high>",
  "recovery_time": "Expected time for plant recovery with proper treatment",
  "important_note": "Critical warning or important information about this disease"
}`
      });
    }

    console.log('Calling OpenAI API...');
    console.log('Model:', validImageUrl ? "gpt-4o" : "gpt-4o-mini");

    const completion = await client.chat.completions.create({
      model: validImageUrl ? "gpt-4o" : "gpt-4o-mini", // Use gpt-4o for vision capabilities
      messages: messages,
      max_tokens: 2000,
      temperature: 0.7,
      response_format: { type: "json_object" }
    });

    const detailedInfo = completion.choices[0].message.content;
    const parsedInfo = JSON.parse(detailedInfo);

    console.log('=== DISEASE DETAILS SUCCESS ===');
    console.log('Image analyzed:', !!validImageUrl);
    console.log('Severity assessment included:', !!parsedInfo.severity_assessment);
    if (parsedInfo.severity_assessment) {
      console.log('Affected percentage:', parsedInfo.severity_assessment.affected_percentage + '%');
      console.log('Severity level:', parsedInfo.severity_assessment.severity_level);
    }
    console.log('Tokens used:', completion.usage?.total_tokens);

    res.status(200).json({
      diseaseName,
      plantName,
      imageAnalyzed: !!validImageUrl,
      details: parsedInfo,
      tokensUsed: completion.usage?.total_tokens
    });

  } catch (error) {
    console.error("=== DISEASE DETAILS API ERROR ===");
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    res.status(500).json({
      error: "Failed to get disease details",
      details: error.message
    });
  }
}