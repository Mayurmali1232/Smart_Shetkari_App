import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';
import mr from './locales/mr.json';
import hi from './locales/hi.json';
import gu from './locales/gu.json';
import pa from './locales/pa.json';
import kn from './locales/kn.json';
import te from './locales/te.json';
import ta from './locales/ta.json';

export const SUPPORTED_LANGUAGES = [
  { code: 'mr', name: 'मराठी', label: 'Marathi' },
  { code: 'hi', name: 'हिन्दी', label: 'Hindi' },
  { code: 'en', name: 'English', label: 'English' },
  { code: 'gu', name: 'ગુજરાતી', label: 'Gujarati' },
  { code: 'pa', name: 'ਪੰਜਾਬੀ', label: 'Punjabi' },
  { code: 'kn', name: 'ಕನ್ನಡ', label: 'Kannada' },
  { code: 'te', name: 'తెలుగు', label: 'Telugu' },
  { code: 'ta', name: 'தமிழ்', label: 'Tamil' }
];

const resources = {
  en: { translation: en },
  mr: { translation: mr },
  hi: { translation: hi },
  gu: { translation: gu },
  pa: { translation: pa },
  kn: { translation: kn },
  te: { translation: te },
  ta: { translation: ta }
};

i18n
  .use(initReactI18next)
  .init({
    compatibilityJSON: 'v4',
    resources,
    lng: 'mr', // Default Marathi for Indian farmers
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
