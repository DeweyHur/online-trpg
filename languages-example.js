// Example: How to add a new language to the TRPG application
// This file demonstrates how to extend the language system with per-language files

// To add a new language (e.g., Spanish), you would:

// 1. Create a new language file (e.g., languages-es.js):
/*
// languages-es.js
const LANGUAGES_ES = {
    // Page title and headers
    pageTitle: "TRPG Multijugador - Puerta de Enlace del Servidor",
    mainTitle: "TRPG Multijugador",
    gameTitle: "Sesión TRPG",

    // Session creation
    createSessionTitle: "Crear Nueva Sesión",
    geminiApiKeyPlaceholder: "Ingresa tu Clave API de Gemini",
    startingPromptPlaceholder: "Describe el fondo inicial y quién eres...",
    createSessionButton: "Crear Sesión",

    // Session joining
    joinSessionTitle: "Unirse a Sesión Existente",
    sessionIdPlaceholder: "Ingresa ID de Sesión",
    joinSessionButton: "Unirse a Sesión",

    // Game interface
    sessionIdLabel: "ID de Sesión:",
    playingAsLabel: "Jugando como:",
    createCharacterTitle: "Crear Tu Personaje",
    characterNamePlaceholder: "Ingresa el nombre de tu personaje",
    joinGameButton: "Unirse al Juego",

    // Chat and actions
    playerActionPlaceholder: "¿Qué haces? (Soporta formato markdown)",
    sendButton: "Enviar",
    leaveSessionButton: "Salir de Sesión",

    // Messages
    gmThinking: "El GM está pensando...",
    joinMessage: "¡{name} se ha unido a la aventura!",
    playerLeftMessage: "{name} ha abandonado la aventura.",
    systemError: "ERROR DEL SISTEMA",
    error: "ERROR",

    // Validation messages
    apiKeyRequired: "Se requiere Clave API y Prompt Inicial. ¿OK?",
    sessionIdRequired: "Por favor ingresa un ID de Sesión.",
    characterNameRequired: "Por favor ingresa un nombre de personaje. ¿OK?",

    // Error messages
    couldNotCreateSession: "No se pudo crear la sesión: {error}",
    couldNotJoinSession: "No se pudo unir al juego: {error}",
    errorJoiningSession: "Error al unirse a la sesión: {error}",
    gmError: "Error del GM: {error}",
    errorSendingAction: "Error: {error}",

    // Confirmation dialogs
    leaveSessionConfirm: "¿Estás seguro de que quieres salir de la sesión?",

    // Formatting toolbar
    boldTooltip: "Negrita (Ctrl+B)",
    italicTooltip: "Cursiva (Ctrl+I)",
    codeTooltip: "Código",
    quoteTooltip: "Cita",
    linkTooltip: "Enlace",
    listTooltip: "Lista",
    headingTooltip: "Encabezado",
    previewTooltip: "Alternar Vista Previa",

    // Preview
    previewPlaceholder: "La vista previa aparecerá aquí...",

    // Buttons
    yes: "Sí",
    no: "No",

    // Turn system
    membersTitle: "Miembros",
    membersHelpText: "Haz clic derecho en un jugador para eliminarlo de la sesión.",
    promptMode: "Modo Acción",
    chatMode: "Modo Chat",
    promptPlaceholder: "¿Qué acción tomas? (Soporta formato markdown)",
    chatPlaceholder: "Chatea con otros jugadores... (Soporta formato markdown)",
    sendActionButton: "Tomar Acción",
    sendChatButton: "Enviar Chat",
    toggleModeButton: "Alternar Modo",
    removePlayerButton: "Eliminar Jugador",
    confirmRemovePlayer: "¿Estás seguro de que quieres eliminar a {name} de la sesión?",

    // Turn system prompts
    turnPrompt: "Miembros actuales de la sesión: {playerList}\n\nEs el turno de: ${currentTurn}$\n\nEste jugador debe tomar su acción ahora. Otros jugadores por favor esperen.",
    chatPrompt: "Miembros actuales de la sesión: {playerList}\n\nActualmente es el turno de {currentTurn}.\nTú eres {currentPlayerName}.\n\nEste es chat general. No procedas con el juego ya que no se está tomando ninguna acción.",
    waitingText: "esperando",
    noPlayersText: "Sin jugadores"
};

// Export for use in other files
if (typeof window !== 'undefined') {
    window.LANGUAGES_ES = LANGUAGES_ES;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { LANGUAGES_ES };
}
*/

// 2. Add the language to the main languages.js file:
/*
// In languages.js, update the LANGUAGES object:
const LANGUAGES = {
    en: window.LANGUAGES_EN || {},
    ko: window.LANGUAGES_KO || {},
    ja: window.LANGUAGES_JA || {},
    es: window.LANGUAGES_ES || {}  // Add this line
};
*/

// 3. Add the language name to the getLanguageName method:
/*
getLanguageName(code) {
    const names = {
        'en': 'English',
        'ko': '한국어',
        'ja': '日本語',
        'es': 'Español'  // Add this line
    };
    return names[code] || code;
}
*/

// 4. Add the language option to the HTML selector:
/*
<select id="language-selector" class="bg-gray-700 text-white px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
    <option value="en">English</option>
    <option value="ko">한국어</option>
    <option value="ja">日本語</option>
    <option value="es">Español</option>  <!-- Add this line -->
</select>
*/

// 5. Include the new language file in index.html:
/*
<script src="languages-en.js"></script>
<script src="languages-ko.js"></script>
<script src="languages-ja.js"></script>
<script src="languages-es.js"></script>  <!-- Add this line -->
<script src="languages.js"></script>
*/

// Benefits of this per-language file approach:
// 1. Each language is completely isolated in its own file
// 2. Easy to manage and maintain individual languages
// 3. Can load only the languages you need
// 4. Better organization and file structure
// 5. Easier for translators to work on specific languages
// 6. No risk of accidentally modifying other languages
// 7. Better version control and collaboration
// 8. Can be loaded dynamically if needed

// Usage example:
// const languageManager = new LanguageManager();
// languageManager.setLanguage('es'); // Switch to Spanish
// const text = languageManager.getText('mainTitle'); // Returns "TRPG Multijugador" 