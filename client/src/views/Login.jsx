import React, { useState } from "react";
import "../css/login-style.css";

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (isLogin) {
      // Handle login
      console.log("Login with:", { email, password });
      // TODO: Add authentication logic
      // For now, just redirect to home
      window.location.href = '/home';
    } else {
      // Handle signup
      if (password !== confirmPassword) {
        alert("Passwords don't match!");
        return;
      }
      console.log("Sign up with:", { name, email, password });
      // TODO: Add registration logic
      // For now, just redirect to home
      window.location.href = '/';
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    // Clear form when switching
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setName("");
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <h1>Lingua Coach AI</h1>
          <p>Master your language skills with AI-powered coaching</p>
        </div>

        <div className="login-box">
          <div className="login-tabs">
            <button 
              className={`tab ${isLogin ? 'active' : ''}`}
              onClick={() => setIsLogin(true)}
            >
              Log In
            </button>
            <button 
              className={`tab ${!isLogin ? 'active' : ''}`}
              onClick={() => setIsLogin(false)}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            {!isLogin && (
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  required
                />
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>

            {!isLogin && (
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  required
                />
              </div>
            )}

            {isLogin && (
              <div className="forgot-password">
                <a href="/forgot-password">Forgot password?</a>
              </div>
            )}

            <button type="submit" className="submit-btn">
              {isLogin ? "Log In" : "Sign Up"}
            </button>
          </form>

          <div className="divider">
            <span>OR</span>
          </div>

          <div className="social-login">
            <button className="social-btn google">
              <span className="icon">G</span>
              Continue with Google
            </button>
            <button className="social-btn facebook">
              <span className="icon">f</span>
              Continue with Facebook
            </button>
          </div>

          <div className="login-footer">
            {isLogin ? (
              <p>
                Don't have an account?{" "}
                <button onClick={toggleMode} className="toggle-btn">
                  Sign up
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{" "}
                <button onClick={toggleMode} className="toggle-btn">
                  Log in
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}