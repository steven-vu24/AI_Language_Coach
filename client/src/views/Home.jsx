import React, { useState, useEffect } from "react";
import "../css/home-style.css";
// import { useNavigate } from "react-router-dom"; // Keep this in your actual file

//dummy examples for now
const topics = {
  english: [
    "Describe your favorite meal.",
    "Talk about your hometown.",
    "What's a memorable vacation you've taken?",
    "Describe a person you admire.",
    "What are your goals for this year?"
  ],
  spanish: [
    "Describe tu comida favorita.",
    "Habla sobre tu ciudad natal.",
    "¿Cuál ha sido unas vacaciones memorables para ti?",
    "Describe a una persona que admires.",
    "¿Cuáles son tus metas para este año?"
  ],
  japanese: [
    "あなたの好きな食べ物について話してください。",
    "あなたの故郷について話してください。",
    "思い出に残る旅行について話してください。",
    "尊敬している人を説明してください。",
    "今年の目標は何ですか？"
  ]
};

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

const placeholderText = {
  english: "Speak now... Your transcription will appear here",
  spanish: "Habla ahora... Tu transcripción aparecerá aquí",
  japanese: "今話してください... 文字起こしがここに表示されます"
};

export default function Home() {
  const [language, setLanguage] = useState("english");
  const [topic, setTopic] = useState("");
  const [sentence, setSentence] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState("");

  function getRandomPrompt(language) {
    const list = topics[language] || topics.english;
    return list[Math.floor(Math.random() * list.length)];
  }

  const getRandomSentence = (lang) => {
    const sentences = accentSentences[lang] || accentSentences.english;
    return sentences[Math.floor(Math.random() * sentences.length)];
  };

  const generatePrompt = () => {
    setTopic(getRandomPrompt(language));
    setSentence(getRandomSentence(language));
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      setTranscription(""); // Clear previous transcription when starting new recording
    }
  };

  useEffect(() => {
    generatePrompt(); // generate on first load
  }, [language]);

  return (
    <div className="app">
      <nav className="navbar">
        <div className="navbar-left">
          <h1>Lingua Coach AI</h1>
        </div>
        <div className="navbar-right">
          <a href="/about" className="about-link">About Us</a>
        </div>
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

        <button 
          className={`mic-button ${isRecording ? 'recording' : ''}`}
          onClick={toggleRecording}
          title={isRecording ? "Stop recording" : "Start recording"}
        >
          {isRecording ? '⏹️' : '🎤'}
        </button>

        {isRecording && (
          <div className="transcription-box">
            <h3>
              <span className="recording-indicator"></span>
              Recording...
            </h3>
            <div className={`transcription-text ${!transcription ? 'empty' : ''}`}>
              {transcription || placeholderText[language]}
            </div>
            <button 
              className="btn analysis-btn" 
              onClick={() => window.location.href = '/analysis'}
            >
              📊 Learn More About Your Performance
            </button>
          </div>
        )}
      </main>
    </div>
  );
}