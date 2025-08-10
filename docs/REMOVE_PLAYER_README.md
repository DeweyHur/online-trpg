# Remove Player Functionality

## Overview

The Remove Player functionality allows session participants to remove other players from the TRPG session. This feature is implemented with proper turn system integration, confirmation dialogs, and system notifications.

## Features

### ✅ Implemented Features

1. **Right-click Context Menu**: Right-click on any player in the members list to access the remove option
2. **Confirmation Dialog**: Prevents accidental removals with a confirmation prompt
3. **Turn System Integration**: Properly updates turn order and current turn when a player is removed
4. **System Notifications**: Automatically adds a system message when a player is removed
5. **Multi-language Support**: Available in English, Japanese, Korean, and Spanish
6. **Visual Indicators**: Help text and visual cues show how to use the feature
7. **Self-Protection**: Players cannot remove themselves from the session

### 🔧 Technical Implementation

#### Core Components

1. **TurnSystem.removePlayer()** - Handles the core logic for removing players from the turn system
2. **MemberManager.removePlayer()** - Manages UI updates and API calls
3. **Context Menu System** - Provides the right-click interface
4. **API Integration** - Persists changes to the server

#### Key Methods

```javascript
// TurnSystem class
removePlayer(playerName) {
    // Find the user ID for the player name
    const userId = Object.keys(this.players).find(id => this.players[id] === playerName);
    
    if (userId) {
        delete this.players[userId];
    }
    
    this.turnOrder = this.turnOrder.filter(name => name !== playerName);

    // If removed player was current turn, move to next
    if (this.currentTurn === playerName) {
        if (this.turnOrder.length > 0) {
            this.currentTurn = this.turnOrder[0];
        } else {
            this.currentTurn = null;
        }
    }

    this.updateTurnStatus();
}

// MemberManager class
async removePlayer(playerName) {
    this.turnSystem.removePlayer(playerName);
    this.updateMembersDisplay();

    // Add system message about player removal
    const leaveMessage = this.turnSystem.languageManager.getText('playerLeftMessage', { name: playerName });
    
    // Update session via API
    try {
        const response = await fetch(`/api/sessions/${window.currentSessionId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...this.turnSystem.getSessionData(),
                chat_history: [
                    ...(window.chatHistory || []),
                    { role: "user", parts: [{ text: leaveMessage }], author: 'SYSTEM' }
                ]
            })
        });

        if (!response.ok) {
            throw new Error('Failed to update session');
        }
    } catch (error) {
        console.error('Error removing player:', error);
    }
}
```

### 🌐 Language Support

The feature supports multiple languages with localized text:

- **English**: "Remove Player", "Are you sure you want to remove {name} from the session?"
- **Japanese**: "プレイヤー削除", "{name}をセッションから削除してもよろしいですか？"
- **Korean**: "플레이어 제거", "{name}을(를) 세션에서 제거하시겠습니까?"
- **Spanish**: "Eliminar Jugador", "¿Estás seguro de que quieres eliminar a {name} de la sesión?"

### 🎨 User Interface

1. **Members List**: Shows all players with color-coded indicators
2. **Context Menu**: Right-click to access remove option
3. **Help Text**: Clear instructions on how to use the feature
4. **Visual Cues**: "(Right-click to remove)" text for non-current players

### 🔒 Security & Validation

1. **Self-Protection**: Players cannot remove themselves
2. **Confirmation**: Required confirmation before removal
3. **Turn System Safety**: Proper handling of current turn when removing active player
4. **API Error Handling**: Graceful error handling for failed API calls

## Usage

### For Players

1. **Remove a Player**:
   - Right-click on any player in the Members list (except yourself)
   - Select "Remove Player" from the context menu
   - Confirm the action in the dialog
   - The player will be removed and a system message will appear

2. **Visual Indicators**:
   - Players you can remove show "(Right-click to remove)" text
   - Your own name shows "(You)" instead
   - Current turn player is highlighted with "TURN" badge

### For Developers

1. **Testing**: Use `test-remove-player.html` to test the functionality
2. **Integration**: The feature is automatically available when using the turn system
3. **Customization**: Modify language files to add new translations

## Files Modified

### Core Implementation
- `turn-system.js` - Added removePlayer methods and context menu system
- `index.html` - Added help text to members section

### Language Files
- `languages-en.js` - Added English translations
- `languages-ja.js` - Added Japanese translations  
- `languages-ko.js` - Added Korean translations
- `languages-example.js` - Added Spanish translations

### Testing
- `test-remove-player.js` - Unit tests for the functionality
- `test-remove-player.html` - Interactive test page

## Testing

### Manual Testing
1. Open `test-remove-player.html` in a browser
2. Add players using the test controls
3. Right-click on players to test removal
4. Run automated tests using the "Run Tests" button

### Automated Testing
```javascript
// Test the core functionality
testTurnSystemRemovePlayer();
testMemberManagerRemovePlayer();
```

## Future Enhancements

### Potential Improvements
1. **Admin System**: Only allow session creators to remove players
2. **Vote System**: Require majority vote for player removal
3. **Temporary Removal**: Option to temporarily remove players
4. **Audit Log**: Track who removed whom and when
5. **Rejoin System**: Allow removed players to rejoin with permission

### Technical Improvements
1. **WebSocket Integration**: Real-time updates for all players
2. **Better Error Handling**: More detailed error messages
3. **Undo Functionality**: Allow reversing recent removals
4. **Bulk Operations**: Remove multiple players at once

## Troubleshooting

### Common Issues

1. **Player not removed**: Check if the player name exists in the session
2. **Turn system broken**: Verify turn order is properly updated
3. **API errors**: Check network connection and server status
4. **Context menu not appearing**: Ensure right-click is enabled

### Debug Information
- Check browser console for error messages
- Verify `window.currentSessionId` is set
- Confirm `window.chatHistory` is available
- Test API endpoint connectivity

## API Endpoints

The feature uses the existing session update endpoint:
- **PUT** `/api/sessions/{sessionId}` - Updates session with removed player data

## Dependencies

- TurnSystem class from `turn-system.js`
- MemberManager class from `turn-system.js`
- LanguageManager for internationalization
- Fetch API for server communication 