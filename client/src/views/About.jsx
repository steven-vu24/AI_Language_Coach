import React from "react";
import "../css/home-style.css";

export default function About() {
  return (
    <div className="app">
      <nav className="navbar">
        <div className="navbar-left">
          <h1>Lingua Coach AI</h1>
        </div>
        <div className="navbar-right">
          <a href="/" className="about-link">← Back to Home</a>
        </div>
      </nav>

      <main className="main-content">
        <h2 style={{ color: 'var(--text-on-dark)', marginBottom: '2rem', fontSize: '2rem' }}>
          About Us
        </h2>

        <div className="about-section">
          <h2>🎯 Mission</h2>
          <p>
            Lingua Coach AI helps you practice speaking and pronunciation through 
            interactive prompts and feedback. We're committed to making language 
            learning accessible, engaging, and effective for everyone.
          </p>
        </div>

        <div className="about-section">
          <h2>📧 Contact</h2>
          <div className="contact-list">
            <a href="mailto:stevenvu446@berkeley.edu" className="contact-email">
              stevenvu446@berkeley.edu
            </a>
            <a href="mailto:clg238@cornell.edu" className="contact-email">
              clg238@cornell.edu
            </a>
            <a href="mailto:gabomel2006@outlook.com" className="contact-email">
              gabomel2006@outlook.com
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}