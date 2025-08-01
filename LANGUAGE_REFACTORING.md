# Language System Refactoring

## Overview

The language system has been refactored to separate language-specific content from the main application code, making it easier to extend to multiple languages and maintain translations.

## Changes Made

### 1. Created `languages.js` - Centralized Language File
- **Purpose**: Contains all language definitions and the LanguageManager class
- **Benefits**: 
  - Single source of truth for all translations
  - Easy to add new languages
  - Consistent structure across languages
  - No hardcoded strings in main application

### 2. Updated `turn-system.js` - Language-Agnostic Prompts
- **Before**: Hardcoded Korean and English prompts in the code
- **After**: Uses language manager to get prompts dynamically
- **Benefits**:
  - Prompts are now language-specific and extensible
  - No conditional logic for different languages
  - Easy to add new languages without code changes

### 3. Updated `index.html` - Removed Language Definitions
- **Before**: Large LANGUAGES object and LanguageManager class embedded in HTML
- **After**: Clean HTML with external language file reference
- **Benefits**:
  - Smaller, cleaner HTML file
  - Better separation of concerns
  - Easier to maintain and debug

### 4. Enhanced Language Support
- **Turn System Prompts**: Now fully language-aware
- **Parameter Substitution**: Dynamic content insertion in prompts
- **Consistent Structure**: All languages follow the same key structure

## File Structure

```
online-trpg/
├── languages.js              # Centralized language definitions
├── turn-system.js            # Language-agnostic turn system
├── index.html                # Clean HTML without language definitions
├── languages-example.js      # Example of adding new languages
└── LANGUAGE_REFACTORING.md   # This documentation
```

## Language Keys Structure

All languages now support these categories:

### Core Application
- Page titles and headers
- Session creation/joining
- Game interface elements
- Chat and actions
- Messages and errors
- Validation messages
- Confirmation dialogs
- Formatting toolbar
- Preview functionality
- Buttons

### Turn System (New)
- Member management
- Input modes (Action/Chat)
- Turn-specific prompts
- Player management
- Status indicators

## Adding New Languages

### Step 1: Add Language Definition
Add a new language object to `languages.js`:

```javascript
const LANGUAGES = {
    en: { /* existing */ },
    ko: { /* existing */ },
    ja: {  // New language
        // Copy structure from existing language
        // Translate all values
    }
};
```

### Step 2: Add Language Name
Update the `getLanguageName` method:

```javascript
getLanguageName(code) {
    const names = {
        'en': 'English',
        'ko': '한국어',
        'ja': '日本語'  // Add new language
    };
    return names[code] || code;
}
```

### Step 3: Add UI Option
Add language option to the HTML selector:

```html
<select id="language-selector">
    <option value="en">English</option>
    <option value="ko">한국어</option>
    <option value="ja">日本語</option>  <!-- Add new option -->
</select>
```

## Benefits of This Approach

### 1. Maintainability
- All translations in one place
- Easy to find and update text
- Consistent structure across languages

### 2. Extensibility
- Add new languages without touching application code
- Turn system prompts automatically support new languages
- No code changes needed for new language support

### 3. Consistency
- All languages follow the same key structure
- Parameter substitution works consistently
- Error handling is uniform

### 4. Performance
- Smaller HTML file
- Better caching of language files
- Reduced main application size

### 5. Developer Experience
- Clear separation of concerns
- Easy to debug language issues
- Simple to add new features with language support

## Turn System Language Integration

The turn system now fully supports multiple languages:

### Dynamic Prompts
- Turn prompts include current players and turn information
- Chat prompts indicate current turn and player status
- All prompts are language-specific

### Parameter Substitution
- `{playerList}`: Current session members
- `{currentTurn}`: Player whose turn it is
- `{currentPlayerName}`: Current user's character name
- `{waitingText}`: Language-specific waiting text

### Example Usage
```javascript
// Korean turn prompt
"현재 세션 멤버들: Alice, Bob, Charlie\n\n다음 플레이어의 차례입니다: $Alice$\n\n이 플레이어가 행동할 차례입니다. 다른 플레이어들은 기다려주세요."

// English turn prompt  
"Current session members: Alice, Bob, Charlie\n\nIt's now the turn of: $Alice$\n\nThis player should take their action now. Other players please wait."
```

## Testing

The refactored system maintains full backward compatibility:
- All existing functionality works unchanged
- Language switching works seamlessly
- Turn system prompts are language-aware
- No breaking changes to the API

## Future Enhancements

### Potential Improvements
1. **Language Detection**: Automatic language detection based on browser settings
2. **Translation Management**: External translation files for easier editing
3. **RTL Support**: Right-to-left language support (Arabic, Hebrew)
4. **Pluralization**: Proper pluralization rules for different languages
5. **Date/Time Formatting**: Language-specific date and time formatting

### Technical Improvements
1. **Lazy Loading**: Load language files on demand
2. **Caching**: Cache language data for better performance
3. **Validation**: Validate language file structure
4. **Fallbacks**: Better fallback mechanisms for missing translations 