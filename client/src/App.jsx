import React from "react";

function App() {
  return (
    <div className="app">
      {/* Navbar */}
      <nav className="navbar">
        <h1>LinguaCoach AI</h1>
        <ul>
          <li>Home</li>
          <li>About</li>
          <li>Contact</li>
        </ul>
      </nav>

      {/* Main */}
      <main className="main-content">
        <h2>Perfect Your Accent & Grammar with AI</h2>
        <p>Practice speaking naturally and fluently in any language. Choose a language, start speaking, and receive feedback instantly.</p>

        {/* Language Select */}
        <select className = "language-select">
          <option>English</option>
          <option>Spanish</option>
          <option>French</option>
          <option>Japanese</option>
          <option>Korean</option>
        </select>

        {/* Mode Buttons */}
        <div className="mode-buttons">
          <button>Grammar Practice</button>
          <button>Accent Practice</button>
        </div>

        {/* Prompt Box */}
        <div className="prompt-box">
          Click a mode to get started!
        </div>

        {/* Mic Button */}
        <button className="mic-button">🎤</button>

        {/* Feedback Box */}
        <div className="feedback-box"></div>
      </main>

      {/* Footer */}
      <footer>
        © 2025 LinguaCoach AI — Prototype UI by Steven, Chris, Gabriel
      </footer>
    </div>
  );
}

export default App;
