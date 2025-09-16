/* NOTE: make error messages change language */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import logo from './ECS_logo.png'; 
import './CreateAccount.css';
import { useTranslation } from 'react-i18next';
import Select from 'react-select';
import i18n from './i18n';


function CreateAccount() {
  const { t } = useTranslation();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [passwordError, setPasswordError] = useState('');
  const [usernameError, setUsernameError] = useState('');


  const makeAPICall = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/profile', { mode: 'cors' });
      const data = await response.json();

    // Only set state values if data.user is defined
    if (data.user) {
      setUsername(data.user);
      setPassword(data.user);
    }
    setLoading(false);
    } 
    catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const validatePassword = (password) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(password);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    console.log("Submit button clicked.");

    // Reset the error states each time the form is submitted
    setUsernameError('');
    setPasswordError('');

    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return; // Stop form submission if passwords don't match
    }

    if (!validatePassword(password)) {
      setPasswordError('Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character');
      return; // Stop form submission if password is invalid
    }

    try {
      console.log("Sending POST request...");
      const response = await fetch('http://localhost:4000/api/users', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({ username, password })
      });

      if (response.ok) {
          const data = await response.json();
          console.log('Account created successfully:', data);
          navigate('/root');
      } else {
          const errorData = await response.json();

          if (errorData.error === 'Username already exists') {
            setUsernameError('This username is already taken. Please choose another one.');
          } else {
              console.error('Error creating account:', errorData.error);
          }
      }
  } catch (error) {
      console.error('Error submitting form:', error);
  }
};

  useEffect(() => {
    makeAPICall();
  }, []);

  return (
    <div className="container">
      <img src={logo} alt="ECS Logo" className="logo" />
      <div className="form-wrapper">
        <h2>{t("create_account_msg")}</h2>
        <Link to="/landing-page" className="homepage-link">{t("back_t")}</Link>
        <form id="accountForm" onSubmit={handleSubmit}>
          <input
            type="text"
            id="username"
            placeholder={t("username_label")}
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          {usernameError && <div className="error-message">{usernameError}</div>}

          <input
            type="password"
            id="password"
            placeholder={t("password_label")}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <input
            type="password"
            id="confirmPassword"
            placeholder={t("confirm_password_label")}
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          {passwordError && <div className="error-message">{passwordError}</div>}
          <button type="submit" className="btn">{t("create_account_msg")}</button>
        </form>
      </div>
    </div>
  );
}

export default CreateAccount;