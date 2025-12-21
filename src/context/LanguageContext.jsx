import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import trTranslations from '../locales/tr.json';
import enTranslations from '../locales/en.json';

const translations = {
    tr: trTranslations,
    en: enTranslations
};

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState('tr');

    // Tarayıcı dilini veya localStorage'daki tercihi algıla
    useEffect(() => {
        // Önce localStorage'a bak
        const savedLang = localStorage.getItem('language');
        if (savedLang && (savedLang === 'tr' || savedLang === 'en')) {
            setLanguage(savedLang);
            return;
        }

        // Tarayıcı dilini kontrol et
        const browserLang = navigator.language || navigator.userLanguage;
        if (browserLang) {
            // tr, tr-TR, en-US, en-GB vb. formatlarını kontrol et
            if (browserLang.toLowerCase().startsWith('tr')) {
                setLanguage('tr');
            } else {
                // Türkçe değilse İngilizce göster
                setLanguage('en');
            }
        }
    }, []);

    // Dil değiştir ve localStorage'a kaydet
    const changeLanguage = useCallback((lang) => {
        if (lang === 'tr' || lang === 'en') {
            setLanguage(lang);
            localStorage.setItem('language', lang);
        }
    }, []);

    // Dil değiştir (toggle)
    const toggleLanguage = useCallback(() => {
        const newLang = language === 'tr' ? 'en' : 'tr';
        setLanguage(newLang);
        localStorage.setItem('language', newLang);
    }, [language]);

    // Çeviri fonksiyonu - nested keys destekler: t('nav.home')
    const t = useCallback((key) => {
        const keys = key.split('.');
        let result = translations[language];

        for (const k of keys) {
            if (result && result[k] !== undefined) {
                result = result[k];
            } else {
                // Key bulunamazsa key'i döndür
                console.warn(`Translation key not found: ${key}`);
                return key;
            }
        }

        return result;
    }, [language]);

    return (
        <LanguageContext.Provider value={{ language, setLanguage: changeLanguage, toggleLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};

export default LanguageContext;
