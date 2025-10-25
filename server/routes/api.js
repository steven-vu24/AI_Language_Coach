import express from "express";
const router = express.Router();

router.get("/prompt", (req, res) => {
  res.json({ prompt: "Describe your morning routine." });
});

router.post("/feedback", (req, res) => {
  const { text } = req.body;
  res.json({ feedback: `You said: "${text}". Grammar and accent feedback will appear here.` });
});

export default router;
