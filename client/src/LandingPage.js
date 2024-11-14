import React from 'react';
import { Link } from 'react-router-dom';
import logo from './ECS_logo.png'; 
import './LandingPage.css'; 

const LandingPage = () => {
    return (
        <div className="home-container">
            <img src={logo} alt="ECS Logo" className="home-logo" />
            <h1></h1>
            <div className="navigation-buttons">
                <Link to="/login">
                    <button className="navigation-button">Login</button>
                </Link>
                <Link to="/create-account">
                    <button className="navigation-button">Create Account</button>
                </Link>
            </div>
            {/* Rest */}
        </div>
    );
};

export default LandingPage;