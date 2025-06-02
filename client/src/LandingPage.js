import React from 'react';
import { Link } from 'react-router-dom';
import logo from './ECS_logo.png';
import './LandingPage.css';
import { useTranslation } from 'react-i18next';
import i18n from './i18n';
import Select from 'react-select';

const LandingPage = () => {
  const { t } = useTranslation();

  const options = [
    { value: 'en', label: 'English' },
    { value: 'de', label: 'Deutsch' }
  ];

  const currentLang = options.find(opt => opt.value === i18n.language) || options[0];

  const handleLanguageChange = (selectedOption) => {
    i18n.changeLanguage(selectedOption.value);
  };

  return (
    <div className="home-container">
      <img src={logo} alt="ECS Logo" className="home-logo" />

      {/* Language Dropdown (placed lower on the page) */}
      <div className="language-bar">
        <span className="language-label">{t('language_label')}</span>
        <Select
            defaultValue={currentLang}
            onChange={handleLanguageChange}
            options={options}
            isSearchable={false}
            className="language-select"
            styles={{
            control: (base, state) => ({
                ...base,
                backgroundColor: '#007bff',
                border: 'none',
                borderRadius: '5px',
                padding: '2px 4px',
                minHeight: '38px',
                width: '140px',
                color: 'white',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
                cursor: 'pointer',
                transition: 'filter 0.2s ease-in-out',
                filter: state.isHovered ? 'brightness(90%)' : 'brightness(100%)',
            }),
            singleValue: (base) => ({
                ...base,
                color: 'white',
                fontWeight: 'bold',
            }),
            option: (base, state) => ({
                ...base,
                backgroundColor: state.isFocused ? '#f0f0f0' : 'white',
                color: 'black',
                cursor: 'pointer'
            }),
            dropdownIndicator: (base) => ({
                ...base,
                color: 'white',
                padding: '0 8px',
                '&:hover': {
                  color: '#f0f0f0'
                }
            }),
            menu: (base) => ({
                ...base,
                borderRadius: '5px',
                marginTop: '4px'
            }),
            indicatorSeparator: () => ({ display: 'none' })
            }}
        />
        </div>


      {/* <h1 style={{ color: 'black', marginTop: '2rem' }}>{t('landing_heading')}</h1> */}

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
