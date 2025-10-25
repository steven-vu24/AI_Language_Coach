import React, { useState, useEffect } from "react";
import "./css/style.css"; // your CSS from before

const topics = [
  "Describe your favorite meal.",
  "Talk about your hometown.",
  "What’s a memorable vacation you’ve taken?",
  "Describe a person you admire.",
  "What are your goals for this year?",
  "If you could learn any skill instantly, what would it be?",
  "What kind of movies do you enjoy?",
];

const accentSentences = {
  english: [
    "The quick brown fox jumps over the lazy dog.",
    "She sells seashells by the seashore.",
    "How much wood would a woodchuck chuck?",
  ],
  spanish: [
    "El perro corre por el parque.",
    "La vida es bella.",
    "Me gusta aprender nuevos idiomas.",
  ],
  japanese: [
    "私は毎朝コーヒーを飲みます。",
    "東京はとても大きいです。",
    "猫がベッドの上で寝ています。",
  ],
};

export default function App() {
  const [language, setLanguage] = useState("english");
  const [topic, setTopic] = useState("");
  const [sentence, setSentence] = useState("");

  const getRandomPrompt = () =>
    topics[Math.floor(Math.random() * topics.length)];

  const getRandomSentence = (lang) => {
    const sentences = accentSentences[lang] || accentSentences.english;
    return sentences[Math.floor(Math.random() * sentences.length)];
  };

  const generatePrompt = () => {
    setTopic(getRandomPrompt());
    setSentence(getRandomSentence(language));
  };

  useEffect(() => {
    generatePrompt(); // generate on first load
  }, [language]);

  return (
    <div className="app">
      <nav className="navbar">
        <h1>AI Speaking Practice</h1>
      </nav>

      <main className="main-content">
        <select
          className="language-select"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
        >
          <option value="english">English</option>
          <option value="spanish">Spanish</option>
          <option value="japanese">Japanese</option>
        </select>

        <div className="prompt-box">
          <h2>🗣️ Conversation Topic</h2>
          <p>{topic}</p>
        </div>

        <div className="feedback-box">
          <h2>🎧 Accent Practice</h2>
          <p>{sentence}</p>
        </div>

        <button className="btn" onClick={generatePrompt}>
          🎲 New Prompt
        </button>

        <button className="mic-button" title="Record your voice">
          🎤
        </button>
      </main>
    </div>
  );
}
