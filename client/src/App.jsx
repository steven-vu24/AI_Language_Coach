import React, { useState, useEffect, useRef } from "react";
import { useOpenRouter } from "./hooks/useOpenRouter";
import { useWebSocketTranscription } from './hooks/transcription';
import "./css/style.css";

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
  const [feedback, setFeedback] = useState("");
  const [recordedText, setRecordedText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const { sendMessage, loading, error } = useOpenRouter();
  const { 
    startTranscription,
    stopTranscription,
    clearTranscript,
    isConnected,
    transcript,
    interimTranscript,
    error: transcriptionerror
  } = useWebSocketTranscription();

  useEffect(() => {
    if (interimTranscript) {
      console.log('🔄 Interim transcript:', interimTranscript);
    }
  }, [interimTranscript]);

  const recordingTimerRef = useRef(null);
  const countdownTimerRef = useRef(null);

  const RECORDING_DURATION = 10;

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

  const getLanguageCode = (lang) => {
    const codes = {
      english: 'en',
      spanish: 'es',
      japanese: 'ja'
    };
    return codes[lang] || 'en';
  };

  const handleMicClick = async () => {
    if (isRecording) {
      await stopRecordingAndProcess();
    } else {
      await startRecording();
    }
  };

  const startRecording = async () => {
    try {
      console.log('🎤 Starting recording...');
      setIsRecording(true);
      setCountdown(RECORDING_DURATION);
      setRecordedText("");
      setFeedback("");

      const languageCode = getLanguageCode(language);
      await startTranscription(languageCode);

      // Start countdown
      countdownTimerRef.current = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownTimerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Auto-stop after duration
      recordingTimerRef.current = setTimeout(async () => {
        await stopRecordingAndProcess();
      }, RECORDING_DURATION * 1000);

    } catch (err) {
      console.error('Error starting recording:', err);
      setIsRecording(false);
    }
  };

  const stopRecordingAndProcess = async () => {
    console.log('⏹️ Stopping recording...');
    
    // Clear timers
    if (recordingTimerRef.current) {
      clearTimeout(recordingTimerRef.current);
    }
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
    }

    // Stop transcription
    stopTranscription();
    setIsRecording(false);
    setCountdown(0);

    await new Promise(resolve => setTimeout(resolve, 500));

    const finalTranscript = transcript.trim();
    setRecordedText(finalTranscript);
    
    console.log('📝 Recorded text:', finalTranscript);

    // Get AI feedback if we have text
    if (finalTranscript) {
      try {
        console.log('🤖 Getting AI feedback...');
        const aiResponse = await sendMessage(
          `You are a ${language} language teacher. 
          
          The student said: "${finalTranscript}"
          Language: ${language}

          Provide helpful feedback on:
          1. Grammar (if any errors)
          2. Clarity and fluency
          3. One specific tip to improve

          Keep it encouraging and concise!`
        );
        
        console.log('✅ AI feedback received');
        setFeedback(aiResponse);
      } catch (err) {
        console.error('Error getting feedback:', err);
        setFeedback('Failed to get AI feedback. Please try again.');
      }
    } else {
      setFeedback('No speech detected. Please try again and speak clearly.');
    }
  };

  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) {
        clearTimeout(recordingTimerRef.current);
      }
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
      }
      if (isConnected) {
        stopTranscription();
      }
    };
  }, []);

  useEffect(() => {
    generatePrompt();
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

        <button 
          className="mic-button" 
          onClick={handleMicClick}
          disabled={loading}
        >
          {loading ? "⏳" : "🎤"}
        </button>
      </main>
    </div>
  );
}
