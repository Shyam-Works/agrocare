import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { 
      prompt,           // User's message
      systemPrompt,     // Custom system prompt from each feature
      conversationHistory, // Previous messages for context
      model,           // Optional: override model
      maxTokens,       // Optional: override token limit
      temperature      // Optional: override creativity
    } = req.body;

    // Validation
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    // Build messages array
    const messages = [];
    
    // Add system prompt if provided, otherwise use default
    if (systemPrompt) {
      messages.push({
        role: "system",
        content: systemPrompt
      });
    }
    
    // Add conversation history if provided (for context)
    if (conversationHistory && Array.isArray(conversationHistory)) {
      messages.push(...conversationHistory);
    }
    
    // Add current user message
    messages.push({
      role: "user",
      content: prompt
    });

    // Call OpenAI with configurable options
    const completion = await client.chat.completions.create({
      model: model || "gpt-4o-mini",
      messages: messages,
      max_tokens: maxTokens || 150,
      temperature: temperature !== undefined ? temperature : 0.7,
    });

    const reply = completion.choices[0].message.content;
    
    res.status(200).json({ 
      reply,
      tokensUsed: completion.usage?.total_tokens 
    });

  } catch (error) {
    console.error("Chat API Error:", error);
    res.status(500).json({ 
      error: "Something went wrong",
      details: error.message
    });
  }
}