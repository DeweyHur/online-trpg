# Turn-Based TRPG System

This document describes the new turn-based system implemented in the multiplayer TRPG application.

## Features

### 1. Turn-Based Gameplay
- Players take turns in a specific order
- The GM (Gemini AI) prompts the current player to take action
- Turn indicators use special syntax: `$PlayerName$`
- Automatic turn advancement when GM response contains turn indicator

### 2. Member Management
- **Members Sidebar**: Shows all players in the session with their current status
- **Turn Indicator**: Current player's turn is highlighted with "TURN" badge
- **Player Colors**: Each player gets a unique color for easy identification
- **Context Menu**: Right-click on any player (except yourself) to remove them from the session

### 3. Dual Input Modes
- **Action Mode**: When it's your turn, input is sent to Gemini AI for game progression
- **Chat Mode**: When it's not your turn, input is for general chat (not sent to AI)
- **Mode Toggle**: Manual toggle button to switch between modes
- **Automatic Switching**: Input mode automatically switches based on turn status

### 4. Language Support
- **English**: Full turn system support with English prompts
- **Korean**: Full turn system support with Korean prompts
- **Dynamic Prompts**: System prompts change based on current language setting

## How It Works

### Turn Flow
1. **Session Creation**: First player to join becomes the first turn
2. **Player Joins**: New players are added to the turn order
3. **Action Phase**: Current player takes action (sent to Gemini AI)
4. **GM Response**: AI responds and may include turn indicator (`$NextPlayer$`)
5. **Turn Advancement**: If turn indicator is detected, turn automatically advances
6. **Cycle Continues**: Process repeats until session ends

### Input Modes

#### Action Mode (Green)
- **When**: It's your turn
- **Purpose**: Take game actions that progress the story
- **AI Integration**: Input is sent to Gemini AI with turn-specific prompts
- **Visual**: Green button and "Action Mode" indicator

#### Chat Mode (Blue)
- **When**: It's not your turn
- **Purpose**: General communication with other players
- **AI Integration**: Input is NOT sent to Gemini AI
- **Visual**: Blue button and "Chat Mode" indicator

### Member Management

#### Adding Players
- Players automatically join when they create a character
- Turn order is updated automatically
- Player colors are assigned sequentially

#### Removing Players
- Right-click on any player in the members list
- Select "Remove Player" from context menu
- Player is removed from session and turn order
- If removed player was current turn, turn advances to next player

## Technical Implementation

### Database Schema
```sql
ALTER TABLE trpg_sessions ADD COLUMN current_turn TEXT DEFAULT NULL;
ALTER TABLE trpg_sessions ADD COLUMN turn_order JSONB DEFAULT '[]'::jsonb;
```

### Key Classes
- **TurnSystem**: Manages turn logic and state
- **MemberManager**: Handles member display and removal
- **InputModeManager**: Controls input mode switching

### API Endpoints
- All existing endpoints work with new turn system
- Session updates include turn data
- Real-time updates via polling

## Usage Examples

### Creating a Session
1. Enter Gemini API key and starting prompt
2. Click "Create Session"
3. Enter character name
4. First player automatically becomes current turn

### Joining a Session
1. Enter session ID
2. Click "Join Session"
3. Enter character name
4. Player is added to turn order

### Taking Actions
1. Wait for your turn (indicated by green "Action Mode")
2. Enter your action in the input field
3. Click "Take Action" or press Enter
4. GM responds and may advance turn

### Chatting
1. When not your turn, input is in "Chat Mode" (blue)
2. Type your message
3. Click "Send Chat" or press Enter
4. Message appears in chat but doesn't progress game

### Managing Players
1. Right-click on any player in members list
2. Select "Remove Player"
3. Player is removed from session

## Language-Specific Features

### English Prompts
- Turn prompts include current members and turn information
- Chat prompts indicate it's not an action
- Clear instructions for AI behavior

### Korean Prompts
- Korean language prompts for all turn system features
- Cultural adaptations where appropriate
- Full Korean UI support

## Future Enhancements

### Potential Features
- **Turn Timer**: Automatic turn advancement after time limit
- **Turn Skipping**: Allow players to skip their turn
- **Turn Order Editing**: Drag-and-drop to reorder turns
- **Turn History**: Track previous turns and actions
- **Turn Notifications**: Push notifications for turn changes

### Technical Improvements
- **WebSocket Support**: Real-time updates instead of polling
- **Turn Validation**: Prevent invalid turn actions
- **Turn Logging**: Detailed turn history and analytics
- **Performance Optimization**: Reduce API calls and improve responsiveness 