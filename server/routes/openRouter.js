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

router.post('/generate-tts', async (req, res) => {
  const { text, language } = req.body;
  
  if (!text) {
    return res.status(400).json({ error: "Text is required" });
  }

  if (!FISH_API_KEY) {
    return res.status(500).json({ error: "FISH_API_KEY not configured" });
  }
  
  try {
    const response = await fetch('https://api.fish.audio/v1/tts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${FISH_API_KEY}`,
        'Content-Type': 'application/json',
        'model': 's1'
      },
      body: JSON.stringify({
        text: text,
        format: 'mp3',
        reference_id: req.body.reference_id || '14b139d922314a748a791a73f51a5111',

      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Fish Audio API Error:', errorText);
      return res.status(response.status).json({ error: 'Fish Audio API failed' });
    }
    
    const audioBuffer = await response.arrayBuffer();
    res.set('Content-Type', 'audio/mpeg');
    res.send(Buffer.from(audioBuffer));
  } catch (error) {
    console.error('TTS generation error:', error);
    res.status(500).json({ error: 'TTS generation failed' });
  }
});

export default router;