import React, { useState, useEffect } from "react";
import { useOpenRouter } from "../hooks/useOpenRouter";
import "../css/home-style.css";

export default function Analysis() {
  const [isPlayingUser, setIsPlayingUser] = useState(false);
    const [isPlayingPerfect, setIsPlayingPerfect] = useState(false);
    const [recordedText, setRecordedText] = useState("");
    const [language, setLanguage] = useState("english");
    const [feedback, setFeedback] = useState("");
    const [sentence, setSentence] = useState("");
    const [isLoadingFeedback, setIsLoadingFeedback] = useState(false);
    const [audioUrl, setAudioUrl] = useState(null);
  
    const [selectedVoice, setSelectedVoice] = useState("voice1"); // 🔹 NEW
    const { sendMessage, loading, error } = useOpenRouter();

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
    const loadDataAndGenerateFeedback = async () => {
      const savedText = sessionStorage.getItem('recordedText');
      const savedLanguage = sessionStorage.getItem('selectedLanguage');
      const savedSentence = sessionStorage.getItem('sentence');
      const savedFeedback = sessionStorage.getItem('feedback');
      const savedAudio = sessionStorage.getItem('audioRecording');
  
      console.log('📥 Loading session data:', {
        recordedText: savedText,
        language: savedLanguage,
        sentence: savedSentence,
        hasFeedback: !!savedFeedback,
        hasAudio: !!savedAudio,
        audioSize: savedAudio ? savedAudio.length : 0
      });
  
      if (savedText) setRecordedText(savedText);
      if (savedLanguage) setLanguage(savedLanguage);
      if (savedSentence) setSentence(savedSentence);
  
      if (savedAudio) {
        setAudioUrl(savedAudio);
        console.log('✅ Audio loaded from sessionStorage');
        console.log('   Format:', savedAudio.substring(0, 30));
      } else {
        console.warn('⚠️ No audio found in sessionStorage');
      }
  
      if (savedFeedback) {
        console.log('✅ Using cached feedback');
        setFeedback(savedFeedback);
        return;
      }
  
        if (savedText && !savedFeedback) {
          console.log('🤖 Generating new AI feedback...');
          setIsLoadingFeedback(true);
  
          try {
            const aiResponse = await sendMessage(
              `You are a ${savedLanguage || 'english'} language teacher. 
              
              The student said: "${savedText}"
              Expected phrase: "${savedSentence || 'N/A'}"
              Language: ${savedLanguage || 'english'}
  
              Provide helpful feedback on:
              1. Grammar (if any errors)
              2. Clarity and fluency
              3. One specific tip to improve
  
              Keep it encouraging and concise!`
            );
            
            console.log('✅ AI feedback received');
            setFeedback(aiResponse);
            sessionStorage.setItem('feedback', aiResponse);
            
          } catch (err) {
            console.error('❌ Error getting feedback:', err);
            const errorMessage = 'Failed to get AI feedback. Please try again.';
            setFeedback(errorMessage);
            sessionStorage.setItem('feedback', errorMessage);
          } finally {
            setIsLoadingFeedback(false);
          }
        } else if (!savedText) {
          const noDataMessage = 'No speech detected. Please record something first.';
          setFeedback(noDataMessage);
        }
      };
  
      loadDataAndGenerateFeedback();
    }, []); 

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

  const regenerateFeedback = async () => {
    if (!recordedText) {
      alert('No recording available to analyze');
      return;
    }

    console.log('🔄 Regenerating feedback...');
    setIsLoadingFeedback(true);
    setFeedback('');

    try {
      const aiResponse = await sendMessage(
        `You are a ${language} language teacher. 
        
        The student said: "${recordedText}"
        Expected phrase: "${sentence}"
        Language: ${language}

        Provide helpful feedback on:
        1. Grammar (if any errors)
        2. Clarity and fluency
        3. One specific tip to improve

        Keep it encouraging and concise!`
      );
      
      console.log('✅ New feedback received');
      setFeedback(aiResponse);
      sessionStorage.setItem('feedback', aiResponse);
      
    } catch (err) {
      console.error('❌ Error regenerating feedback:', err);
      setFeedback('Failed to get AI feedback. Please try again.');
    } finally {
      setIsLoadingFeedback(false);
    }
  };


  // ✅ Download audio function
  const handleDownloadAudio = () => {
    if (!audioUrl) {
      alert('No audio available to download');
      return;
    }

    console.log('💾 Downloading audio...');
    const link = document.createElement('a');
    link.href = audioUrl;
    link.download = `recording-${language}-${Date.now()}.webm`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    console.log('✅ Download started');
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
        <div className="feedback-box" style={{ 
          width: '500px', 
          marginTop: '2rem',
          borderLeft: feedback ? '4px solid #667eea' : '4px solid #999'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '1rem'
          }}>
            <h2 style={{ margin: 0 }}>🤖 Detailed Feedback</h2>
            {recordedText && !isLoadingFeedback && (
              <button
                onClick={regenerateFeedback}
                style={{
                  padding: '0.5rem 1rem',
                  background: '#667eea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  transition: 'all 0.3s'
                }}
                onMouseEnter={(e) => e.target.style.background = '#5568d3'}
                onMouseLeave={(e) => e.target.style.background = '#667eea'}
              >
                🔄 Regenerate
              </button>
            )}
          </div>

          {/* Loading State */}
          {isLoadingFeedback ? (
            <div style={{
              textAlign: 'center',
              padding: '3rem',
              background: '#f8f9fa',
              borderRadius: '8px'
            }}>
              <div className="spinner" style={{
                width: '40px',
                height: '40px',
                border: '4px solid rgba(102, 126, 234, 0.3)',
                borderTop: '4px solid #667eea',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 1rem'
              }}></div>
              <p style={{ color: '#666', margin: 0 }}>
                Analyzing your speech...
              </p>
            </div>
          ) : feedback ? (
            <div style={{ 
              textAlign: 'left', 
              lineHeight: '1.8', 
              whiteSpace: 'pre-line',
              color: '#333',
              padding: '1.5rem',
              background: feedback.includes('Failed') || feedback.includes('No speech')
                ? '#fff3cd'
                : '#f0f9ff',
              borderRadius: '8px',
              border: '1px solid ' + (feedback.includes('Failed') || feedback.includes('No speech')
                ? '#ffc107'
                : '#667eea')
            }}>
              {feedback}
            </div>
          ) : (
            <p style={{ 
              fontStyle: 'italic', 
              color: '#999',
              textAlign: 'center',
              padding: '2rem',
              background: '#f8f9fa',
              borderRadius: '8px'
            }}>
              No feedback available. Complete a practice session to receive AI feedback.
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div style={{ 
          display: 'flex', 
          gap: '1rem', 
          marginTop: '2rem',
          justifyContent: 'center'
        }}>
          <a href="/home" style={{ textDecoration: 'none', flex: 1, maxWidth: '300px' }}>
            <button className="btn" style={{
              width: '100%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              padding: '1rem 2rem',
              fontSize: '1.1rem'
            }}>
              🎤 Practice Again
            </button>
          </a>
        </div>
      </main>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}