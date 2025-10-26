import React, { useState, useEffect, useRef } from "react";
import { useOpenRouter } from "../hooks/useOpenRouter";
import { useWebSocketTranscription } from '../hooks/transcription';
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

  const recordingTimerRef = useRef(null);
  const countdownTimerRef = useRef(null);

  const RECORDING_DURATION = 1000;

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
        clearTranscript();
  
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
          onClick={handleMicClick}
          title={isRecording ? "Stop recording" : "Start recording"}
        >
          {isRecording ? '⏹️' : '🎤'}
        </button>

        {isRecording && (
          <div className="transcription-box live">
            <h3>
              <span className="recording-indicator"></span>
              Live Transcript
            </h3>
            <div className="transcription-text">
              <span className="final-text">{transcript}</span>
              {interimTranscript && (
                <span className="interim-text"> {interimTranscript}</span>
              )}
            </div>
          </div>
        )}  

        {recordedText && !isRecording && (
          <>
            <div className="transcription-box final">
              <h3>📝 What You Said</h3>
              <div className="transcription-text">
                "{recordedText}"
              </div>
            </div>
            <button 
              className="btn analysis-btn" 
              onClick={() => window.location.href = '/analysis'}
            >
              📊 Learn More About Your Performance
            </button>
          </>
        )}
      </main>
    </div>
  );
}