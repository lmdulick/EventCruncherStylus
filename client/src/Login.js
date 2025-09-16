/* NOTE: make error messages change language */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import logo from './ECS_logo.png'; 
import './Login.css'; 
import { useTranslation } from 'react-i18next';
import Select from 'react-select';
import i18n from './i18n';

function Login() {
  const { t } = useTranslation();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch('http://localhost:4000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
  
      if (response.ok) {
        const { userId } = await response.json(); // Get userId from backend response
        localStorage.setItem('loggedInUserId', userId); // Store userId in localStorage
        navigate('/root'); // Redirect to the main application
      } else {
        // Display error pop-up
        setShowPopup(true);
        setTimeout(() => {
          setShowPopup(false);
        }, 3000); // Hide the pop-up after 3 seconds
      }
    } catch (error) {
      console.error('Error logging in:', error);
      setErrorMessage('An error occurred. Please try again.');
    }
  };

  return (
    <div className="login-container">
      {showPopup && (
        <div className="popup-notification">
          <div className="popup-path">localhost:3000</div>
          <div className="popup-message">Invalid username or password</div>
        </div>
      )}
      <div className="login-content">
        <img src={logo} alt="ECS Logo" className="login-logo" />
        <form onSubmit={handleLogin} className="login-form">
          <h2 className="login-title">{t("login_button")}</h2>
          <Link to="/landing-page" className="homepage-link">{t("back_t")}</Link>
          <div className="login-input-group">
            <input
              type="text"
              id="username"
              className="login-input"
              placeholder={t("username_label")}
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              className="login-input"
              placeholder={t("password_label")}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {errorMessage && <div className="error-message">{errorMessage}</div>}
          <button type="submit" className="login-btn">{t("login_button")}</button>
        </form>
      </div>
    </div>
  );
}

export default Login;
