// Multi-language support for TRPG application
const LANGUAGES = {
    en: {
        // Page title and headers
        pageTitle: "Multiplayer TRPG - Server Gateway",
        mainTitle: "Multiplayer TRPG",
        gameTitle: "TRPG Session",

        // Session creation
        createSessionTitle: "Create a New Session",
        geminiApiKeyPlaceholder: "Enter your Gemini API Key",
        startingPromptPlaceholder: "Describe the starting background and who you are...",
        createSessionButton: "Create Session",

        // Session joining
        joinSessionTitle: "Join an Existing Session",
        sessionIdPlaceholder: "Enter Session ID",
        joinSessionButton: "Join Session",

        // Game interface
        sessionIdLabel: "Session ID:",
        playingAsLabel: "Playing as:",
        createCharacterTitle: "Create Your Character",
        characterNamePlaceholder: "Enter your character's name",
        joinGameButton: "Join Game",

        // Chat and actions
        playerActionPlaceholder: "What do you do? (Supports markdown formatting)",
        sendButton: "Send",
        leaveSessionButton: "Leave Session",

        // Messages
        gmThinking: "GM is thinking...",
        joinMessage: "{name} has joined the adventure!",
        systemError: "SYSTEM ERROR",
        error: "ERROR",

        // Validation messages
        apiKeyRequired: "API Key and Starting Prompt are required. OK?",
        sessionIdRequired: "Please enter a Session ID.",
        characterNameRequired: "Please enter a character name. OK?",

        // Error messages
        couldNotCreateSession: "Could not create session: {error}",
        couldNotJoinSession: "Could not join game: {error}",
        errorJoiningSession: "Error joining session: {error}",
        gmError: "GM Error: {error}",
        errorSendingAction: "Error: {error}",

        // Confirmation dialogs
        leaveSessionConfirm: "Are you sure you want to leave the session?",

        // Formatting toolbar
        boldTooltip: "Bold (Ctrl+B)",
        italicTooltip: "Italic (Ctrl+I)",
        codeTooltip: "Code",
        quoteTooltip: "Quote",
        linkTooltip: "Link",
        listTooltip: "List",
        headingTooltip: "Heading",
        previewTooltip: "Toggle Preview",

        // Preview
        previewPlaceholder: "Preview will appear here...",

        // Buttons
        yes: "Yes",
        no: "No"
    },

    ko: {
        // Page title and headers
        pageTitle: "멀티플레이어 TRPG - 서버 게이트웨이",
        mainTitle: "멀티플레이어 TRPG",
        gameTitle: "TRPG 세션",

        // Session creation
        createSessionTitle: "새 세션 만들기",
        geminiApiKeyPlaceholder: "Gemini API 키를 입력하세요",
        startingPromptPlaceholder: "시작 배경과 당신이 누구인지 설명하세요...",
        createSessionButton: "세션 만들기",

        // Session joining
        joinSessionTitle: "기존 세션 참가하기",
        sessionIdPlaceholder: "세션 ID 입력",
        joinSessionButton: "세션 참가",

        // Game interface
        sessionIdLabel: "세션 ID:",
        playingAsLabel: "플레이어:",
        createCharacterTitle: "캐릭터 만들기",
        characterNamePlaceholder: "캐릭터 이름을 입력하세요",
        joinGameButton: "게임 참가",

        // Chat and actions
        playerActionPlaceholder: "무엇을 하시겠습니까? (마크다운 형식 지원)",
        sendButton: "전송",
        leaveSessionButton: "세션 나가기",

        // Messages
        gmThinking: "GM이 생각하고 있습니다...",
        joinMessage: "{name}님이 모험에 참가했습니다!",
        systemError: "시스템 오류",
        error: "오류",

        // Validation messages
        apiKeyRequired: "API 키와 시작 프롬프트가 필요합니다. 확인하시겠습니까?",
        sessionIdRequired: "세션 ID를 입력해주세요.",
        characterNameRequired: "캐릭터 이름을 입력해주세요. 확인하시겠습니까?",

        // Error messages
        couldNotCreateSession: "세션을 만들 수 없습니다: {error}",
        couldNotJoinSession: "게임에 참가할 수 없습니다: {error}",
        errorJoiningSession: "세션 참가 오류: {error}",
        gmError: "GM 오류: {error}",
        errorSendingAction: "오류: {error}",

        // Confirmation dialogs
        leaveSessionConfirm: "정말로 세션을 나가시겠습니까?",

        // Formatting toolbar
        boldTooltip: "굵게 (Ctrl+B)",
        italicTooltip: "기울임 (Ctrl+I)",
        codeTooltip: "코드",
        quoteTooltip: "인용",
        linkTooltip: "링크",
        listTooltip: "목록",
        headingTooltip: "제목",
        previewTooltip: "미리보기 토글",

        // Preview
        previewPlaceholder: "미리보기가 여기에 나타납니다...",

        // Buttons
        yes: "예",
        no: "아니오"
    }
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
            'ko': '한국어'
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

// Make LanguageManager globally available
window.LanguageManager = LanguageManager;

// Create global language manager instance - will be initialized after DOM loads
window.languageManager = null;

// Debug: Check if LanguageManager is properly defined
console.log('LanguageManager defined:', typeof window.LanguageManager);
console.log('LanguageManager constructor:', window.LanguageManager);

// Make LanguageManager globally available
window.LanguageManager = LanguageManager; 