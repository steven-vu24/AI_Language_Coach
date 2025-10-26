import React, { useState, useEffect } from "react";
import "../css/home-style.css";

export default function Analysis() {
  const [isPlayingUser, setIsPlayingUser] = useState(false);
  const [isPlayingPerfect, setIsPlayingPerfect] = useState(false);
  const [recordedText, setRecordedText] = useState("");
  const [language, setLanguage] = useState("english");
  const [selectedVoice, setSelectedVoice] = useState("voice1"); // 🔹 NEW

  // 🔹 Example voice options (replace IDs with your real ones)
  const voices = [
    { id: "5196af35f6ff4a0dbf541793fc9f2157", name: "Donald Trump", value: "voice1" },
    { id: "14b139d922314a748a791a73f51a5111", name: "Chinese Accent", value: "voice2" },
    { id: "8e468a7c906648e3bb4cb7c08185b14a", name: "Indian Accent", value: "voice3" },
    { id: "03397b4c4be74759b72533b663fbd001", name: "Elon", value: "voice4" },
    { id: "a5971a1fd805441aaf3b0bbe8c9f1ab6", name: "Dexter Morgan", value: "voice5" },
    { id: "2b14512a5bd54e809bb159aef7f5f614", name: "The Rock", value: "voice6" },
    { id: "54e3a85ac9594ffa83264b8a494b901b", name: "Spongebob", value: "voice7" },
    { id: "d34183dcf4a041f5a82aa3dd19644329", name: "Naruto", value: "voice8" },
    { id: "a98724d565bd4a80947f47c7994d18f0", name: "Kanye West", value: "voice9" },
    { id: "abb3ca44111b405fb90a7eb5157ad656", name: "Drake", value: "voice10" },




    

  ];

  useEffect(() => {
    const savedText = sessionStorage.getItem("recordedText");
    const savedLanguage = sessionStorage.getItem("selectedLanguage");
    if (savedText) setRecordedText(savedText);
    if (savedLanguage) setLanguage(savedLanguage);
  }, []);

  const handlePlayUserAudio = () => {
    setIsPlayingUser(true);
    setTimeout(() => setIsPlayingUser(false), 2000);
  };

  const handlePlayPerfectAudio = async () => {
    if (!recordedText) return;

    setIsPlayingPerfect(true);
    try {
      console.log("🎵 Generating TTS for:", recordedText);
      console.log("🎤 Voice selected:", selectedVoice);

      // Find selected voice ID
      const voiceObj = voices.find((v) => v.value === selectedVoice);

      const response = await fetch("http://localhost:5001/api/openrouter/generate-tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: recordedText,
          language: language,
          reference_id: voiceObj.id, // 🔹 Send chosen voice ID
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "TTS generation failed");
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);

      audio.onended = () => {
        setIsPlayingPerfect(false);
        URL.revokeObjectURL(audioUrl);
      };

      await audio.play();
    } catch (error) {
      console.error("Error with perfect audio:", error);
      setIsPlayingPerfect(false);
      alert(`Failed to generate pronunciation: ${error.message}`);
    }
  };

  return (
    <div className="app">
      <nav className="navbar">
        <div className="navbar-left">
          <h1>Lingua Coach AI</h1>
        </div>
        <div className="navbar-right">
          <a href="/home" className="about-link">← Back to Home</a>
        </div>
      </nav>

      <main className="main-content">
        <h2 style={{ color: "var(--text-on-dark)", marginBottom: "2rem" }}>
          📊 Performance Analysis
        </h2>

        {/* Phrase Display Box */}
        <div className="prompt-box" style={{ width: "500px" }}>
          <h2>Your Phrase</h2>
          <p style={{ fontSize: "1.1rem", lineHeight: "1.6" }}>
            {recordedText || "No recording found. Please record something first."}
          </p>
        </div>

        {/* Accuracy Score */}
        <div className="accuracy-box">
          <h2>Accuracy Score</h2>
          <div className="score-circle">
            <span className="score-number">67</span>
            <span className="score-percent">%</span>
          </div>
          <p className="score-label">Great job! Keep practicing!</p>
        </div>

        {/* 🔹 Voice Selection Dropdown (Themed) */}
        <div className="voice-select-container">
          <label htmlFor="voiceSelect" className="voice-label">
            🎙️ Choose Voice:
          </label>
          <select
            id="voiceSelect"
            value={selectedVoice}
            onChange={(e) => setSelectedVoice(e.target.value)}
            className="voice-dropdown"
          >
            {voices.map((voice) => (
              <option key={voice.value} value={voice.value}>
                {voice.name}
              </option>
            ))}
          </select>
        </div>

        {/* Audio Playback Buttons */}
        <div className="audio-controls">
          <button
            className={`btn audio-btn ${isPlayingUser ? "playing" : ""}`}
            onClick={handlePlayUserAudio}
            disabled={isPlayingUser || !recordedText}
          >
            {isPlayingUser ? "▶️ Playing..." : "🎤 Play Your Recording"}
          </button>

          <button
            className={`btn audio-btn ${isPlayingPerfect ? "playing" : ""}`}
            onClick={handlePlayPerfectAudio}
            disabled={isPlayingPerfect}
          >
            {isPlayingPerfect ? "▶️ Playing..." : "⭐ Play Perfect Pronunciation"}
          </button>
        </div>

        {/* Detailed Feedback */}
        <div className="feedback-box" style={{ width: "500px", marginTop: "2rem" }}>
          <h2>Detailed Feedback</h2>
          <div style={{ textAlign: "left", lineHeight: "1.8" }}>
            <p><strong>Language:</strong> {language.charAt(0).toUpperCase() + language.slice(1)}</p>
            <p><strong>Strengths:</strong></p>
            <ul style={{ marginLeft: "1.5rem" }}>
              <li>Clear pronunciation of consonants</li>
              <li>Good pacing and rhythm</li>
            </ul>
            <p><strong>Areas to Improve:</strong></p>
            <ul style={{ marginLeft: "1.5rem" }}>
              <li>Work on the "th" sound in "the"</li>
              <li>Emphasize the vowel in "jumps"</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
