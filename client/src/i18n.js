// import i18n from 'i18next';
// import { initReactI18next } from 'react-i18next';
// import HttpBackend from 'i18next-http-backend';

// i18n
//   .use(HttpBackend)
//   .use(initReactI18next)
//   .init({
//     lng: 'en', // default language
//     fallbackLng: 'en',
//     backend: {
//       loadPath: `https://api.i18nexus.com/project/YOUR_PROJECT_ID/languages/{{lng}}/translations.json`,
//       requestOptions: {
//         headers: {
//           Authorization: 'YOUR_API_KEY'
//         }
//       }
//     },
//     react: {
//       useSuspense: false
//     }
//   });

// export default i18n;

// import browserLang from 'browser-lang';
// import { useEffect, useState } from 'react';
// import { FormattedMessage, IntlProvider } from 'react-intl';
// import i18n from 'i18next';
// import { initReactI18next } from 'react-i18next';
// import HttpBackend from 'i18next-http-backend';

// const supportedLanguages = ["en","de","zh","it","ja","ru","ar","es","ko","fr"];

// export default function App() {
//   const defaultLocale = browserLang({
//     languages: supportedLanguages,
//     fallback: "en"
//   });

//   const [locale, setLocale] = useState(defaultLocale);
//   const [messages, setMessages] = useState(null);

//   useEffect(() => {
//     const url = `https://api.i18nexus.com/project_resources/translations/${locale}/default.json?api_key=${process.env.I18NEXUS_API_KEY}`;
    
//     fetch(url)
//       .then(response => response.json())
//       .then(data => {
//         setMessages(data);
//       });
//   }, [locale]);

//   return (
//     <IntlProvider locale={locale} messages={messages}>
//       <div className="App">
//         <p>
//           <FormattedMessage id="welcome_msg" />
//         </p>
//       </div>
//     </IntlProvider>
//   );
// }

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import translationEN from './locales/en.json';
import translationDE from './locales/de.json';

const resources = {
  en: { translation: translationEN },
  de: { translation: translationDE }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', // default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
