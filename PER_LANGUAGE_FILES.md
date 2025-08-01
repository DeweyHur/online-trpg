# Per-Language File Structure

## Overview

The language system has been refactored to use separate files for each language, making it more modular, maintainable, and easier to extend.

## File Structure

```
online-trpg/
├── languages-en.js          # English language definitions
├── languages-ko.js          # Korean language definitions  
├── languages-ja.js          # Japanese language definitions (example)
├── languages.js             # Main language manager (combines all languages)
├── turn-system.js           # Turn system (language-agnostic)
├── index.html               # Main application (includes language files)
├── languages-example.js     # Example of adding new languages
└── PER_LANGUAGE_FILES.md    # This documentation
```

## How It Works

### 1. Individual Language Files
Each language has its own file (e.g., `languages-en.js`, `languages-ko.js`):

```javascript
// languages-en.js
const LANGUAGES_EN = {
    pageTitle: "Multiplayer TRPG - Server Gateway",
    mainTitle: "Multiplayer TRPG",
    // ... all English translations
};

// Export for use in other files
if (typeof window !== 'undefined') {
    window.LANGUAGES_EN = LANGUAGES_EN;
}
```

### 2. Main Language Manager
The `languages.js` file combines all language files:

```javascript
// languages.js
const LANGUAGES = {
    en: window.LANGUAGES_EN || {},
    ko: window.LANGUAGES_KO || {},
    ja: window.LANGUAGES_JA || {}
};

class LanguageManager {
    // ... language management logic
}
```

### 3. HTML Integration
Language files are included in the correct order:

```html
<script src="languages-en.js"></script>
<script src="languages-ko.js"></script>
<script src="languages-ja.js"></script>
<script src="languages.js"></script>
```

## Adding a New Language

### Step 1: Create Language File
Create a new file `languages-[code].js` (e.g., `languages-es.js` for Spanish):

```javascript
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

    // ... copy structure from existing language and translate all values

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
```

### Step 2: Update Main Language Manager
Add the new language to `languages.js`:

```javascript
// In languages.js
const LANGUAGES = {
    en: window.LANGUAGES_EN || {},
    ko: window.LANGUAGES_KO || {},
    ja: window.LANGUAGES_JA || {},
    es: window.LANGUAGES_ES || {}  // Add this line
};
```

### Step 3: Add Language Name
Update the `getLanguageName` method in `languages.js`:

```javascript
getLanguageName(code) {
    const names = {
        'en': 'English',
        'ko': '한국어',
        'ja': '日本語',
        'es': 'Español'  // Add this line
    };
    return names[code] || code;
}
```

### Step 4: Add UI Option
Add the language option to the HTML selector in `index.html`:

```html
<select id="language-selector" class="bg-gray-700 text-white px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
    <option value="en">English</option>
    <option value="ko">한국어</option>
    <option value="ja">日本語</option>
    <option value="es">Español</option>  <!-- Add this line -->
</select>
```

### Step 5: Include Language File
Add the script tag in `index.html`:

```html
<script src="languages-en.js"></script>
<script src="languages-ko.js"></script>
<script src="languages-ja.js"></script>
<script src="languages-es.js"></script>  <!-- Add this line -->
<script src="languages.js"></script>
```

## Language Keys Structure

All language files must include these categories:

### Core Application
- **Page titles and headers**: `pageTitle`, `mainTitle`, `gameTitle`
- **Session management**: `createSessionTitle`, `joinSessionTitle`, etc.
- **Game interface**: `sessionIdLabel`, `playingAsLabel`, etc.
- **Chat and actions**: `playerActionPlaceholder`, `sendButton`, etc.
- **Messages**: `gmThinking`, `joinMessage`, `systemError`, `error`
- **Validation**: `apiKeyRequired`, `sessionIdRequired`, etc.
- **Errors**: `couldNotCreateSession`, `couldNotJoinSession`, etc.
- **Confirmation dialogs**: `leaveSessionConfirm`
- **Formatting toolbar**: `boldTooltip`, `italicTooltip`, etc.
- **Preview**: `previewPlaceholder`
- **Buttons**: `yes`, `no`

### Turn System (Required)
- **Member management**: `membersTitle`
- **Input modes**: `promptMode`, `chatMode`
- **Placeholders**: `promptPlaceholder`, `chatPlaceholder`
- **Action buttons**: `sendActionButton`, `sendChatButton`
- **Mode controls**: `toggleModeButton`
- **Player management**: `removePlayerButton`
- **Turn prompts**: `turnPrompt`, `chatPrompt`
- **Status text**: `waitingText`, `noPlayersText`

## Benefits of Per-Language Files

### 1. **Modularity**
- Each language is completely isolated
- No risk of accidentally modifying other languages
- Easy to remove or disable specific languages

### 2. **Maintainability**
- Clear file organization
- Easy to find and update specific language content
- Better version control for language changes

### 3. **Collaboration**
- Multiple translators can work on different language files simultaneously
- No merge conflicts between different languages
- Clear ownership of language files

### 4. **Performance**
- Can load only the languages you need
- Smaller individual file sizes
- Better caching (language files change less frequently)

### 5. **Extensibility**
- Easy to add new languages without touching existing code
- Can dynamically load languages based on user preference
- Support for language-specific features

### 6. **Quality Control**
- Easier to validate language file structure
- Can implement language-specific validation rules
- Better error handling for missing translations

## Best Practices

### 1. **Consistent Structure**
- Always include all required keys
- Use the same key names across all languages
- Maintain consistent commenting and organization

### 2. **Parameter Substitution**
- Use `{parameterName}` for dynamic content
- Document all parameters used in each language
- Test parameter substitution thoroughly

### 3. **File Naming**
- Use ISO language codes (e.g., `en`, `ko`, `ja`, `es`)
- Follow the pattern `languages-[code].js`
- Use lowercase for language codes

### 4. **Export Pattern**
- Always include both browser and Node.js exports
- Use consistent export naming (`LANGUAGES_[CODE]`)
- Include proper error handling for missing files

### 5. **Documentation**
- Include comments for each language section
- Document any language-specific considerations
- Provide examples of parameter usage

## Testing

### 1. **Language Switching**
Test that all languages can be selected and applied correctly.

### 2. **Parameter Substitution**
Verify that dynamic content (like player names) displays correctly in all languages.

### 3. **Turn System Integration**
Ensure turn system prompts work correctly in all languages.

### 4. **Error Handling**
Test behavior when language files are missing or incomplete.

### 5. **Performance**
Verify that loading multiple language files doesn't significantly impact performance.

## Future Enhancements

### 1. **Dynamic Loading**
Load language files on demand based on user selection.

### 2. **Language Detection**
Automatically detect user's preferred language from browser settings.

### 3. **Translation Management**
Integrate with external translation management systems.

### 4. **RTL Support**
Add support for right-to-left languages (Arabic, Hebrew).

### 5. **Pluralization**
Implement proper pluralization rules for different languages.

### 6. **Date/Time Formatting**
Add language-specific date and time formatting.

## Troubleshooting

### Common Issues

1. **Language not appearing in selector**
   - Check that the language file is included in HTML
   - Verify the language is added to `languages.js`
   - Ensure the language name is added to `getLanguageName`

2. **Missing translations**
   - Verify all required keys are present in the language file
   - Check for typos in key names
   - Ensure the language file is loaded before `languages.js`

3. **Parameter substitution not working**
   - Check that parameters are properly formatted `{parameterName}`
   - Verify the parameter is being passed to `getText()`
   - Test with a simple parameter first

4. **Turn system prompts not working**
   - Ensure all turn system keys are present
   - Check that `turnPrompt` and `chatPrompt` include proper parameters
   - Verify the language file is properly loaded 