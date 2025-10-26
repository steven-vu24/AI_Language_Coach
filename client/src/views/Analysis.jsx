import React, { useState, useEffect } from "react";
import "../css/home-style.css";

export default function Analysis() {
  const [isPlayingUser, setIsPlayingUser] = useState(false);
  const [isPlayingPerfect, setIsPlayingPerfect] = useState(false);
  const [recordedText, setRecordedText] = useState("");
  const [language, setLanguage] = useState("english");

  // Retrieve the recorded text from sessionStorage when component mounts
  useEffect(() => {
    const savedText = sessionStorage.getItem('recordedText');
    const savedLanguage = sessionStorage.getItem('selectedLanguage');
    
    if (savedText) {
      setRecordedText(savedText);
    }
    if (savedLanguage) {
      setLanguage(savedLanguage);
    }
  }, []);

  const handlePlayUserAudio = () => {
    setIsPlayingUser(true);
    // TODO: Implement actual audio playback
    setTimeout(() => setIsPlayingUser(false), 2000);
  };

  const handlePlayPerfectAudio = async () => {
    if (!recordedText) return;
    
    setIsPlayingPerfect(true);
    
    try {
      // Call your backend endpoint to generate TTS
      const response = await fetch('/api/generate-tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: recordedText,
          language: language
        })
      });
      
      if (!response.ok) throw new Error('TTS generation failed');
      
      // Get the audio blob and play it
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      
      audio.onended = () => {
        setIsPlayingPerfect(false);
        URL.revokeObjectURL(audioUrl);
      };
      
      await audio.play();
    } catch (error) {
      console.error('Error playing perfect audio:', error);
      setIsPlayingPerfect(false);
      alert('Failed to generate perfect pronunciation');
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
        <h2 style={{ color: 'var(--text-on-dark)', marginBottom: '2rem' }}>
          📊 Performance Analysis
        </h2>

        {/* Phrase Display Box */}
        <div className="prompt-box" style={{ width: '500px' }}>
          <h2>Your Phrase</h2>
          <p style={{ fontSize: '1.1rem', lineHeight: '1.6' }}>
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

        {/* Audio Playback Buttons */}
        <div className="audio-controls">
          <button 
            className={`btn audio-btn ${isPlayingUser ? 'playing' : ''}`}
            onClick={handlePlayUserAudio}
            disabled={isPlayingUser || !recordedText}
          >
            {isPlayingUser ? '▶️ Playing...' : '🎤 Play Your Recording'}
          </button>

          <button 
            className={`btn audio-btn ${isPlayingPerfect ? 'playing' : ''}`}
            onClick={handlePlayPerfectAudio}
            disabled={isPlayingPerfect}
          >
            {isPlayingPerfect ? '▶️ Playing...' : '⭐ Play Perfect Pronunciation'}
          </button>
        </div>

        {/* Detailed Feedback */}
        <div className="feedback-box" style={{ width: '500px', marginTop: '2rem' }}>
          <h2>Detailed Feedback</h2>
          <div style={{ textAlign: 'left', lineHeight: '1.8' }}>
            <p><strong>Language:</strong> {language.charAt(0).toUpperCase() + language.slice(1)}</p>
            <p><strong>Strengths:</strong></p>
            <ul style={{ marginLeft: '1.5rem' }}>
              <li>Clear pronunciation of consonants</li>
              <li>Good pacing and rhythm</li>
            </ul>
            <p><strong>Areas to Improve:</strong></p>
            <ul style={{ marginLeft: '1.5rem' }}>
              <li>Work on the "th" sound in "the"</li>
              <li>Emphasize the vowel in "jumps"</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}