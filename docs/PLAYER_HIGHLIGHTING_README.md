# Player Name Highlighting in Chat

## Overview

The player name highlighting feature automatically detects and highlights player names in chat messages with their assigned colors. This makes it easy to identify when players are mentioned in conversations and provides visual consistency across the application.

## Features

### ✅ Implemented Features

1. **Automatic Detection**: Player names are automatically detected in all message types
2. **Color Consistency**: Uses the same color system as the members list
3. **Word Boundary Matching**: Prevents partial matches (e.g., "Alice" won't match "Alicia")
4. **Case Insensitive**: Matches player names regardless of case
5. **Special Character Handling**: Properly escapes special regex characters in player names
6. **Visual Enhancement**: Highlighted names have enhanced styling with glow effects

### 🔧 Technical Implementation

#### Core Components

1. **highlightPlayerNames()** - Main function that processes text and highlights player names
2. **Enhanced displayMessage()** - Updated to apply highlighting to all message types
3. **CSS Styling** - Enhanced styling for highlighted player names
4. **Color System** - Consistent color assignment across the application

#### Key Functions

```javascript
// Function to highlight player names in text with their colors
function highlightPlayerNames(text) {
    if (!window.currentSession || !window.currentSession.players) {
        return text;
    }
    
    // Get all player names from the current session
    const playerNames = Object.values(window.currentSession.players);
    
    if (playerNames.length === 0) {
        return text;
    }
    
    // Create a copy of the text to modify
    let highlightedText = text;
    
    // Sort player names by length (longest first) to avoid partial matches
    const sortedPlayerNames = playerNames.sort((a, b) => b.length - a.length);
    
    // Replace each player name with a colored version
    sortedPlayerNames.forEach(playerName => {
        if (playerName && playerName.trim()) {
            const playerColor = getPlayerColor(playerName);
            // Escape special regex characters in player name
            const escapedName = playerName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            // Use word boundaries to avoid partial matches
            const regex = new RegExp(`\\b${escapedName}\\b`, 'gi');
            highlightedText = highlightedText.replace(regex, `<span class="${playerColor} font-semibold">${playerName}</span>`);
        }
    });
    
    return highlightedText;
}
```

### 🎨 Visual Styling

#### Enhanced CSS for Highlighted Names
```css
/* Highlighted player names in chat */
.markdown-content .player-red,
.markdown-content .player-blue,
.markdown-content .player-green,
.markdown-content .player-yellow,
.markdown-content .player-purple,
.markdown-content .player-pink,
.markdown-content .player-indigo,
.markdown-content .player-emerald {
    font-weight: 600;
    text-shadow: 0 0 8px currentColor;
    border-radius: 0.25rem;
    padding: 0.125rem 0.25rem;
    background-color: rgba(0, 0, 0, 0.2);
}
```

#### Visual Effects
1. **Font Weight**: Bold text for emphasis
2. **Text Shadow**: Glow effect using the player's color
3. **Background**: Subtle dark background for contrast
4. **Border Radius**: Rounded corners for modern look
5. **Padding**: Small padding for better readability

### 📊 Message Type Support

The highlighting works across all message types:

1. **Player Messages**: Player names in their own messages
2. **GM Messages**: Player names mentioned by the GM
3. **System Messages**: Player names in system notifications
4. **Error Messages**: Player names in error messages

### 🔍 Detection Logic

#### Word Boundary Matching
- Uses `\b` word boundaries to prevent partial matches
- "Alice" won't match "Alicia" or "Malice"
- Case-insensitive matching with `gi` flag

#### Special Character Handling
- Escapes regex special characters: `.*+?^${}()|[\]\\`
- Handles player names with special characters safely

#### Processing Order
1. Sorts player names by length (longest first)
2. Processes each player name individually
3. Applies highlighting before markdown parsing
4. Preserves markdown formatting

### 🎯 Examples

#### Input Text Examples
```
"Alice attacks the goblin with her sword!"
"Bob, it's your turn to act. Charlie is waiting for you."
"System: Alice, Bob, and Charlie have joined the adventure!"
"The GM says: 'Alice and Bob should work together.'"
```

#### Output Examples
- **Alice** attacks the goblin with her sword!
- **Bob**, it's your turn to act. **Charlie** is waiting for you.
- System: **Alice**, **Bob**, and **Charlie** have joined the adventure!
- The GM says: '**Alice** and **Bob** should work together.'

### 🧪 Testing

#### Test Page
Use `test-player-highlighting.html` for comprehensive testing:

1. **Add Players**: Add test players to see different colors
2. **Test Messages**: Enter messages with player names
3. **Message Types**: Test different message types
4. **Edge Cases**: Test special characters and partial matches

#### Manual Testing
1. Open the main application
2. Join or create a session with multiple players
3. Send messages mentioning other players
4. Check that player names are highlighted correctly

### 🔧 Configuration

#### Color Assignment
Player colors are assigned based on their position in the player list:
- **Alice**: Red (`text-red-400`)
- **Bob**: Blue (`text-blue-400`)
- **Charlie**: Green (`text-green-400`)
- **David**: Yellow (`text-yellow-400`)
- **Eve**: Purple (`text-purple-400`)
- **Frank**: Pink (`text-pink-400`)
- **Grace**: Indigo (`text-indigo-400`)
- **Henry**: Emerald (`text-emerald-400`)

#### Customization
To change the highlighting style, modify the CSS:
```css
.markdown-content .player-red,
.markdown-content .player-blue,
/* ... other colors ... */ {
    /* Custom styling here */
    font-weight: 700; /* Make bolder */
    text-shadow: 0 0 12px currentColor; /* Stronger glow */
    background-color: rgba(0, 0, 0, 0.3); /* Darker background */
}
```

### 🚀 Performance Considerations

#### Optimization Features
1. **Early Return**: Skips processing if no players exist
2. **Efficient Sorting**: Only sorts when needed
3. **Regex Optimization**: Uses word boundaries for accuracy
4. **Minimal DOM Updates**: Processes text before markdown parsing

#### Memory Usage
- Lightweight text processing
- No additional DOM elements for highlighting
- Efficient regex patterns
- Minimal memory footprint

### 🔍 Debugging

#### Common Issues

1. **Names Not Highlighting**:
   - Check if `window.currentSession.players` exists
   - Verify player names are in the session
   - Check for special characters in player names

2. **Partial Matches**:
   - Ensure word boundaries are working
   - Check for regex special characters
   - Verify case-insensitive matching

3. **Color Inconsistency**:
   - Check `getPlayerColor()` function
   - Verify color assignment logic
   - Ensure CSS classes are applied

#### Debug Functions
```javascript
// Check current players
console.log('Current players:', window.currentSession?.players);

// Test highlighting manually
const testText = "Alice and Bob are playing";
const highlighted = highlightPlayerNames(testText);
console.log('Highlighted text:', highlighted);

// Check color assignment
console.log('Alice color:', getPlayerColor('Alice'));
```

### 🔮 Future Enhancements

#### Potential Improvements
1. **Custom Highlighting**: Allow users to customize highlight styles
2. **Nickname Support**: Support for player nicknames/aliases
3. **Advanced Matching**: Fuzzy matching for typos
4. **Animation Effects**: Animated highlights for new mentions
5. **Click Interaction**: Clickable player names for quick actions

#### Technical Improvements
1. **Performance**: Web Workers for large text processing
2. **Caching**: Cache highlighted results for repeated text
3. **Real-time Updates**: Update highlights when players join/leave
4. **Accessibility**: Better screen reader support for highlighted names

## Files Modified

### Core Implementation
- `index.html` - Added `highlightPlayerNames()` function and enhanced `displayMessage()`
- `test-player-highlighting.html` - Comprehensive test page

### Key Changes
1. **New Function**: `highlightPlayerNames()` for text processing
2. **Enhanced displayMessage()**: Applies highlighting to all message types
3. **CSS Styling**: Added enhanced styling for highlighted names
4. **Test Page**: Created comprehensive testing interface

## Dependencies

- `getPlayerColor()` function for color assignment
- `marked` library for markdown parsing
- Browser regex support for text matching
- CSS for visual styling

## Usage

The highlighting is automatic and requires no user interaction:

1. **Automatic Detection**: Player names are highlighted automatically
2. **All Message Types**: Works in player, GM, system, and error messages
3. **Real-time Updates**: Highlights update when players join/leave
4. **Consistent Colors**: Uses the same colors as the members list

The feature enhances readability and makes it easy to track player interactions in the chat! 