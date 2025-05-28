import React from 'react';
import { Link } from 'react-router-dom';
import logo from './ECS_logo.png'; 
import './LandingPage.css';
import { useTranslation } from 'react-i18next';
import i18n from './i18n';

//<h1>{t('cubicLevel.title')}</h1>


const LandingPage = () => {
    const { t } = useTranslation();

    const changeLanguage = (e) => {
        i18n.changeLanguage(e.target.value);
    };

    console.log(i18n);

    return (
        <div className="home-container">
            <img src={logo} alt="ECS Logo" className="home-logo" />

            {/* Language Selector */}
            <div style={{ marginTop: '20px' }}>
                <label htmlFor="language-select" style={{ marginRight: '10px', color: 'black' }}>
                {t('language_label')}
                </label>
                <select
                    id="language-select"
                    className="language-dropdown"
                    onChange={changeLanguage}
                    defaultValue={i18n.language}
                >
                    <option value="en">English</option>
                    <option value="de">Deutsch</option>
                </select>

            </div>

            {/* Heading */}
            {/* <h1 style={{ color: 'black', marginTop: '2rem' }}>{t('landing_heading')}</h1> */}
            
            {/* <h1></h1> */}
            <div className="navigation-buttons">
                <Link to="/login">
                    <button className="navigation-button">{t('login_button')}</button>
                </Link>
                <Link to="/create-account">
                    <button className="navigation-button">{t('create_account_button')}</button>
                </Link>
            </div>
        </div>
    );
};

export default LandingPage;
