import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import logo from './ECS_logo.png'; 
import './Login.css'; 

function Login() {
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
          <h2 className="login-title">Login</h2>
          <Link to="/" className="homepage-link">Back</Link>
          <div className="login-input-group">
            <input
              type="text"
              id="username"
              className="login-input"
              placeholder="Username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              className="login-input"
              placeholder="Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {errorMessage && <div className="error-message">{errorMessage}</div>}
          <button type="submit" className="login-btn">Login</button>
        </form>
      </div>
    </div>
  );
}

export default Login;
