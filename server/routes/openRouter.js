import express from "express";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const FISH_API_KEY = process.env.FISH_API_KEY;

router.get("/test", (req, res) => {
  res.json({ 
    status: "✅ Server is running",
    timestamp: new Date().toISOString(),
    hasApiKey: !!OPENROUTER_API_KEY,
    apiKeyPreview: OPENROUTER_API_KEY ? `${OPENROUTER_API_KEY.substring(0, 15)}...` : "❌ MISSING",
    environment: {
      nodeVersion: process.version,
      port: process.env.PORT || 5001
    }
  });
});


router.post("/chat", async (req, res) => {
  try {
    const { message, model = 'meta-llama/llama-3.2-3b-instruct:free' } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        messages: [{ role: 'user', content: message }],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return res.status(response.status).json({ error: errorData });
    }

    const data = await response.json();
    res.json({ content: data.choices[0].message.content });

  } catch (error) {
    console.error('OpenRouter API Error:', error);
    res.status(500).json({ error: 'Failed to get AI response' });
  }
});

export default router;