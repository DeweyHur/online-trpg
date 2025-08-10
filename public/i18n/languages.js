// Language management system for the TRPG application
// This file combines all language definitions and provides the LanguageManager class

// Combine all language definitions
const LANGUAGES = {
    en: window.LANGUAGES_EN || {},
    ko: window.LANGUAGES_KO || {},
    ja: window.LANGUAGES_JA || {}
};

// Language management class
class LanguageManager {
    constructor() {
        this.currentLanguage = this.getStoredLanguage() || 'en';
        this.init();
    }

    getStoredLanguage() {
        return localStorage.getItem('trpg-language') || 'en';
    }

    setLanguage(lang) {
        if (LANGUAGES[lang]) {
            this.currentLanguage = lang;
            localStorage.setItem('trpg-language', lang);
            this.updateUI();
        }
    }

    getText(key, params = {}) {
        const text = LANGUAGES[this.currentLanguage][key] || LANGUAGES['en'][key] || key;

        // Replace parameters in the text
        return text.replace(/\{(\w+)\}/g, (match, param) => {
            return params[param] || match;
        });
    }

    getAvailableLanguages() {
        return Object.keys(LANGUAGES).map(code => ({
            code,
            name: this.getLanguageName(code)
        }));
    }

    getLanguageName(code) {
        const names = {
            'en': 'English',
            'ko': '한국어',
            'ja': '日本語'
        };
        return names[code] || code;
    }

    init() {
        this.updateUI();
    }

    updateUI() {
        // Update all elements with data-i18n attributes
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            const text = this.getText(key);

            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                element.placeholder = text;
            } else {
                element.textContent = text;
            }
        });

        // Update title
        document.title = this.getText('pageTitle');

        // Update html lang attribute
        document.documentElement.lang = this.currentLanguage;
    }
}

// Export for use in other files
if (typeof window !== 'undefined') {
    window.LANGUAGES = LANGUAGES;
    window.LanguageManager = LanguageManager;

    // Create global languageManager instance
    window.languageManager = new LanguageManager();
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { LANGUAGES, LanguageManager };
} 