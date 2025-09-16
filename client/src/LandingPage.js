import React from 'react';
import { Link } from 'react-router-dom';
import logo from './ECS_logo4.png';
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
      <h1 className="ecs-title">{t('landing_heading')}</h1>

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
              backgroundColor: '#3AB07E',
              border: 'none',
              borderRadius: '6px',
              minHeight: '38px',
              width: '140px',
              color: '#fff',
              boxShadow: state.isFocused
                ? '0 0 0 2px rgba(58,176,126,0.4)'
                : '0 2px 4px rgba(0,0,0,0.15)',
              cursor: 'pointer',
            }),
            singleValue: (base) => ({
              ...base,
              color: '#fff',
              fontWeight: '600',
            }),
            option: (base, state) => ({
              ...base,
              backgroundColor: state.isFocused ? '#f0f0f0' : '#fff',
              color: '#000',
              cursor: 'pointer',
            }),
            dropdownIndicator: (base) => ({
              ...base,
              color: '#fff',
              padding: '0 8px',
              '&:hover': { color: '#f0f0f0' },
            }),
            menu: (base) => ({
              ...base,
              borderRadius: '6px',
              marginTop: '4px',
            }),
            indicatorSeparator: () => ({ display: 'none' }),
          }}
        />
      </div>

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

