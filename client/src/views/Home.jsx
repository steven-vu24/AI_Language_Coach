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

const fillerWordPrompts = {
  english: [
    "Explain how the internet works in detail.",
    "Describe the process of making your favorite dish step-by-step.",
    "Explain how climate change affects the environment.",
    "Walk through your morning routine from start to finish.",
    "Describe how a car engine works.",
    "Explain the plot of your favorite movie or book.",
    "Describe how to play your favorite sport or game.",
    "Explain the education system in your country.",
    "Walk through the process of planning a vacation.",
    "Describe how social media has changed society."
  ],
  spanish: [
    "Explica cómo funciona el internet en detalle.",
    "Describe el proceso de hacer tu plato favorito paso a paso.",
    "Explica cómo el cambio climático afecta el medio ambiente.",
    "Describe tu rutina matutina desde el principio hasta el final.",
    "Describe cómo funciona el motor de un coche.",
    "Explica la trama de tu película o libro favorito.",
    "Describe cómo se juega tu deporte o juego favorito.",
    "Explica el sistema educativo de tu país.",
    "Describe el proceso de planear unas vacaciones.",
    "Describe cómo las redes sociales han cambiado la sociedad."
  ],
  japanese: [
    "インターネットの仕組みを詳しく説明してください。",
    "お気に入りの料理の作り方を順を追って説明してください。",
    "気候変動が環境に与える影響を説明してください。",
    "朝のルーティンを最初から最後まで説明してください。",
    "車のエンジンの仕組みを説明してください。",
    "お気に入りの映画や本のあらすじを説明してください。",
    "お気に入りのスポーツやゲームのやり方を説明してください。",
    "あなたの国の教育システムを説明してください。",
    "休暇の計画プロセスを説明してください。",
    "ソーシャルメディアが社会をどのように変えたか説明してください。"
  ]
};

const accentSentences = {
  english: [
    "I'm going to the store to buy some groceries.",
    "What time does the meeting start tomorrow?",
    "The weather is beautiful today, isn't it?",
    "I really enjoyed the movie we watched last night.",
    "Can you help me with this project?",
    "My family is planning a trip next month.",
    "I've been learning this language for two years.",
    "The restaurant downtown has excellent food.",
    "I need to finish my work before Friday.",
    "Would you like to get coffee this afternoon?"
  ],
  spanish: [
    "Voy a la tienda a comprar algunas cosas.",
    "¿A qué hora empieza la reunión mañana?",
    "El clima está hermoso hoy, ¿verdad?",
    "Realmente disfruté la película que vimos anoche.",
    "¿Me puedes ayudar con este proyecto?",
    "Mi familia está planeando un viaje el próximo mes.",
    "He estado aprendiendo este idioma por dos años.",
    "El restaurante del centro tiene comida excelente.",
    "Necesito terminar mi trabajo antes del viernes.",
    "¿Te gustaría tomar un café esta tarde?"
  ],
  japanese: [
    "今日は天気がとてもいいですね。",
    "明日の会議は何時に始まりますか？",
    "昨夜見た映画はとても面白かったです。",
    "来月、家族で旅行に行く予定です。",
    "このプロジェクトを手伝ってもらえますか？",
    "二年間、この言語を勉強しています。",
    "市内のレストランはとても美味しいです。",
    "金曜日までに仕事を終わらせる必要があります。",
    "今日の午後、コーヒーを飲みに行きませんか？",
    "スーパーに買い物に行ってきます。"
  ]
};

const pronunciationSentences = {
  english: [
    "The sixth sick sheik's sixth sheep's sick.",
    "Peter Piper picked a peck of pickled peppers.",
    "Rubber baby buggy bumpers bounced badly.",
    "Unique New York, unique New York, you know you need unique New York.",
    "Red lorry, yellow lorry, red lorry, yellow lorry.",
    "Irish wristwatch, Swiss wristwatch.",
    "Toy boat, toy boat, toy boat.",
    "Specific Pacific, specific Pacific.",
    "Three free throws, three free throws.",
    "Freshly fried flying fish, freshly fried flesh."
  ],
  spanish: [
    "Tres tristes tigres tragaban trigo en un trigal.",
    "El perro de San Roque no tiene rabo porque Ramón Ramírez se lo ha robado.",
    "Parangaricutirimícuaro es un pueblo de México.",
    "Perejil comí, perejil cené, y de tanto perejil me emperejilé.",
    "El cielo está enladrillado, quien lo desenladrillará.",
    "Compadre, cómpreme un coco. Compadre, no compro coco.",
    "Erre con erre guitarra, erre con erre barril.",
    "Pablito clavó un clavito en la calva de un calvito.",
    "Cuando cuentes cuentos, cuenta cuantos cuentos cuentas.",
    "El hipopótamo Hipo está con hipo."
  ],
  japanese: [
    "生麦生米生卵 (なまむぎなまごめなまたまご)",
    "赤巻紙青巻紙黄巻紙 (あかまきがみあおまきがみきまきがみ)",
    "東京特許許可局 (とうきょうとっきょきょかきょく)",
    "隣の客はよく柿食う客だ (となりのきゃくはよくかきくうきゃくだ)",
    "この竹垣に竹立てかけたのは竹立てかけたかったから (このたけがきにたけたてかけたのはたけたてかけたかったから)",
    "バスガス爆発 (ばすがすばくはつ)",
    "お綾や親にお謝り (おあややおやにおあやまり)",
    "高速道路公社 (こうそくどうろこうしゃ)",
    "きゃりーぱみゅぱみゅ",
    "新人歌手新春シャンソンショー (しんじんかしゅしんしゅんしゃんそんしょー)"
  ]
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
  const [fillerPrompt, setFillerPrompt] = useState("");
  const [pronunciationSentence, setPronunciationSentence] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState("");
  const [conversationMode, setConversationMode] = useState(true);
  const [accentMode, setAccentMode] = useState(true);
  const [fillerMode, setFillerMode] = useState(false);
  const [pronunciationMode, setPronunciationMode] = useState(false);

  function getRandomPrompt(language) {
    const list = topics[language] || topics.english;
    return list[Math.floor(Math.random() * list.length)];
  }

  const getRandomSentence = (lang) => {
    const sentences = accentSentences[lang] || accentSentences.english;
    return sentences[Math.floor(Math.random() * sentences.length)];
  };

  const getRandomFillerPrompt = (lang) => {
    const prompts = fillerWordPrompts[lang] || fillerWordPrompts.english;
    return prompts[Math.floor(Math.random() * prompts.length)];
  };

  const getRandomPronunciationSentence = (lang) => {
    const sentences = pronunciationSentences[lang] || pronunciationSentences.english;
    return sentences[Math.floor(Math.random() * sentences.length)];
  };

  const generatePrompt = () => {
    setTopic(getRandomPrompt(language));
    setSentence(getRandomSentence(language));
    setFillerPrompt(getRandomFillerPrompt(language));
    setPronunciationSentence(getRandomPronunciationSentence(language));
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

  const hasActiveMode = conversationMode || accentMode || fillerMode || pronunciationMode;

  return (
    <div className="app">
      <nav className="navbar">
        <div className="navbar-left">
          <h1>Lingua Coach AI</h1>
        </div>
        <div className="navbar-right">
          <a href="/about" className="about-link">About Us</a>
          <a href="/" className="about-link logout-link">Log Out</a>
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

        <div className="mode-container">
          <button
            className={`mode-box ${conversationMode ? 'active' : 'inactive'}`}
            onClick={() => setConversationMode(!conversationMode)}
          >
            <h2>🗣️ Conversation Topic</h2>
            <p className="mode-instruction">Answer this prompt:</p>
            <p>{topic}</p>
            <div className="mode-indicator">
              {conversationMode ? "✓ Selected" : "Click to select"}
            </div>
          </button>

          <button
            className={`mode-box ${accentMode ? 'active' : 'inactive'}`}
            onClick={() => setAccentMode(!accentMode)}
          >
            <h2>🎧 Accent Practice</h2>
            <p className="mode-instruction">Read this sentence:</p>
            <p>{sentence}</p>
            <div className="mode-indicator">
              {accentMode ? "✓ Selected" : "Click to select"}
            </div>
          </button>

          <button
            className={`mode-box ${fillerMode ? 'active' : 'inactive'}`}
            onClick={() => setFillerMode(!fillerMode)}
          >
            <h2>🎯 Filler Word Reduction</h2>
            <p className="mode-instruction">Answer this prompt:</p>
            <p>{fillerPrompt}</p>
            <div className="mode-indicator">
              {fillerMode ? "✓ Selected" : "Click to select"}
            </div>
          </button>

          <button
            className={`mode-box ${pronunciationMode ? 'active' : 'inactive'}`}
            onClick={() => setPronunciationMode(!pronunciationMode)}
          >
            <h2>👄 Pronunciation Challenge</h2>
            <p className="mode-instruction">Read this sentence:</p>
            <p>{pronunciationSentence}</p>
            <div className="mode-indicator">
              {pronunciationMode ? "✓ Selected" : "Click to select"}
            </div>
          </button>
        </div>

        <button className="btn" onClick={generatePrompt}>
          🎲 New Prompt
        </button>

        <button 
          className={`mic-button ${isRecording ? 'recording' : ''} ${!hasActiveMode ? 'disabled' : ''}`}
          onClick={toggleRecording}
          disabled={!hasActiveMode}
          title={
            !hasActiveMode 
              ? "Select at least one mode to start recording"
              : isRecording 
              ? "Stop recording" 
              : "Start recording"
          }
        >
          {isRecording ? '⏹️' : '🎤'}
        </button>

        {!hasActiveMode && (
          <p className="warning-text">
            Please select at least one practice mode to begin recording
          </p>
        )}

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