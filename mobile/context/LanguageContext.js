import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n, { SUPPORTED_LANGUAGES } from '../i18n';
import { authService } from '../services/authService';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language || 'mr');

  useEffect(() => {
    loadLanguage();
  }, []);

  const loadLanguage = async () => {
    try {
      const saved = await AsyncStorage.getItem('preferredLanguage');
      if (saved) {
        setCurrentLanguage(saved);
        i18n.changeLanguage(saved);
      }
    } catch (e) {
      console.warn('Failed to load language preference:', e);
    }
  };

  const changeLanguage = async (langCode) => {
    try {
      await i18n.changeLanguage(langCode);
      setCurrentLanguage(langCode);
      await AsyncStorage.setItem('preferredLanguage', langCode);

      // If user is logged in, sync with backend profile
      const token = await AsyncStorage.getItem('accessToken');
      if (token) {
        authService.updateLanguage(langCode).catch((e) => {
          console.warn('Could not sync language with profile:', e);
        });
      }
    } catch (e) {
      console.warn('Failed to switch language:', e);
    }
  };

  return (
    <LanguageContext.Provider
      value={{
        currentLanguage,
        changeLanguage,
        supportedLanguages: SUPPORTED_LANGUAGES
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
