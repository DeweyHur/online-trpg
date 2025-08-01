# Multi-Language Support

This TRPG application supports multiple languages through a centralized language management system.

## Current Languages

- **English (en)** - Default language
- **Korean (ko)** - 한국어

## Adding New Languages

To add a new language, follow these steps:

### 1. Add Language Data

Edit `languages.js` and add a new language object to the `LANGUAGES` constant:

```javascript
const LANGUAGES = {
    en: {
        // English translations...
    },
    ko: {
        // Korean translations...
    },
    // Add your new language here
    es: {
        // Spanish translations
        pageTitle: "TRPG Multijugador - Puerta de Enlace del Servidor",
        mainTitle: "TRPG Multijugador",
        gameTitle: "Sesión TRPG",
        // ... add all other keys
    }
};
```

### 2. Add Language Name

In the `getLanguageName` method of the `LanguageManager` class, add the display name for your language:

```javascript
getLanguageName(code) {
    const names = {
        'en': 'English',
        'ko': '한국어',
        'es': 'Español'  // Add your language here
    };
    return names[code] || code;
}
```

### 3. Add to Language Selector

In `index.html`, add an option to the language selector:

```html
<select id="language-selector" class="bg-gray-700 text-white px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
    <option value="en">English</option>
    <option value="ko">한국어</option>
    <option value="es">Español</option>  <!-- Add your language here -->
</select>
```

## Required Translation Keys

Make sure to translate all these keys for your new language:

### Page Elements
- `pageTitle` - Browser tab title
- `mainTitle` - Main application title
- `gameTitle` - Game session title

### Session Management
- `createSessionTitle` - Create session section title
- `geminiApiKeyPlaceholder` - API key input placeholder
- `startingPromptPlaceholder` - Starting prompt textarea placeholder
- `createSessionButton` - Create session button text
- `joinSessionTitle` - Join session section title
- `sessionIdPlaceholder` - Session ID input placeholder
- `joinSessionButton` - Join session button text

### Game Interface
- `sessionIdLabel` - Session ID display label
- `playingAsLabel` - Player name display label
- `createCharacterTitle` - Character creation modal title
- `characterNamePlaceholder` - Character name input placeholder
- `joinGameButton` - Join game button text

### Chat and Actions
- `playerActionPlaceholder` - Player action input placeholder
- `sendButton` - Send button text
- `leaveSessionButton` - Leave session button text

### Messages
- `gmThinking` - GM thinking message
- `joinMessage` - Player join message (use {name} for player name)
- `systemError` - System error label
- `error` - Error label

### Validation Messages
- `apiKeyRequired` - API key validation message
- `sessionIdRequired` - Session ID validation message
- `characterNameRequired` - Character name validation message

### Error Messages
- `couldNotCreateSession` - Session creation error (use {error} for error message)
- `couldNotJoinSession` - Session join error (use {error} for error message)
- `errorJoiningSession` - Session join error (use {error} for error message)
- `gmError` - GM error (use {error} for error message)
- `errorSendingAction` - Action sending error (use {error} for error message)

### Confirmation Dialogs
- `leaveSessionConfirm` - Leave session confirmation message

### Formatting Toolbar
- `boldTooltip` - Bold button tooltip
- `italicTooltip` - Italic button tooltip
- `codeTooltip` - Code button tooltip
- `quoteTooltip` - Quote button tooltip
- `linkTooltip` - Link button tooltip
- `listTooltip` - List button tooltip
- `headingTooltip` - Heading button tooltip
- `previewTooltip` - Preview toggle tooltip

### Preview
- `previewPlaceholder` - Preview area placeholder text

### Buttons
- `yes` - Yes button text
- `no` - No button text

## Parameter Substitution

Some messages support parameter substitution using `{parameterName}` syntax:

- `joinMessage` uses `{name}` for the player's name
- Error messages use `{error}` for the error message

Example:
```javascript
joinMessage: "{name}님이 모험에 참가했습니다!",  // Korean
joinMessage: "{name} has joined the adventure!", // English
```

## Testing

After adding a new language:

1. Refresh the page
2. Select your new language from the dropdown
3. Verify all text elements are properly translated
4. Test all functionality to ensure translations work correctly

## Best Practices

1. **Keep translations concise** - UI space is limited
2. **Maintain consistency** - Use consistent terminology across the application
3. **Test thoroughly** - Ensure all dynamic content (error messages, etc.) works correctly
4. **Consider cultural differences** - Some UI patterns may need adjustment for different languages
5. **Use proper encoding** - Ensure your file is saved with UTF-8 encoding for proper character display 