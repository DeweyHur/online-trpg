# Voice Mode System for TRPG Chat

A comprehensive text-to-speech system that integrates with your existing TRPG chat application to read messages aloud.

## Features

### 🎯 Core Functionality
- **Automatic message reading** - Reads new chat messages as they appear
- **Voice customization** - Adjustable speed, pitch, and volume
- **Message filtering** - Choose to read all messages, GM only, or player only
- **Queue management** - Handles multiple messages without interruption
- **Markdown cleaning** - Removes formatting for better speech quality

### 🌍 Multi-language Support
- **English, Korean, Japanese** - Full localization support
- **Language-aware voice selection** - Automatically selects appropriate voices
- **Dynamic language switching** - Works with your existing language system

### 🎛️ User Controls
- **Enable/Disable toggle** - Quick voice mode activation
- **Manual speak button** - Read current chat message
- **Stop speaking** - Immediately halt speech
- **Auto-read settings** - Configure automatic reading behavior

## Quick Integration

### 1. Add to Your HTML Files

Include the voice mode script in your existing HTML files:

```html
<!-- Load language files first -->
<script src="languages-en.js"></script>
<script src="languages-ko.js"></script>
<script src="languages-ja.js"></script>
<script src="languages.js"></script>

<!-- Load voice mode -->
<script src="voice-mode.js"></script>
```

### 2. Automatic Integration

The voice mode system automatically:
- ✅ Hooks into your existing `displayMessage` function
- ✅ Creates voice controls in the game view
- ✅ Integrates with your language system
- ✅ Works with all your existing HTML files

### 3. No Code Changes Required

The system is designed to work with your existing codebase without modifications. It automatically:
- Detects your `displayMessage` function
- Creates voice controls in `#game-view`
- Uses your existing language manager
- Works with your current chat structure

## Usage

### Basic Usage
1. **Enable Voice Mode** - Click the "Enable Voice" button
2. **Configure Settings** - Adjust speed, pitch, volume as needed
3. **Choose What to Read** - Select all messages, GM only, or player only
4. **Enjoy** - Messages will be read automatically as they appear

### Advanced Features

#### Voice Selection
- Choose from available system voices
- Automatic language matching
- Voice quality varies by system

#### Speed Control
- Range: 0.5x to 2.0x
- Default: 0.9x (slightly slower for clarity)
- Real-time adjustment

#### Message Filtering
- **All Messages** - Reads everything
- **GM Only** - Only reads GM responses
- **Player Only** - Only reads player actions

#### Manual Controls
- **Speak Current** - Read the last message
- **Stop Speaking** - Immediately stop all speech

## Technical Details

### Browser Compatibility
- ✅ Chrome/Chromium (best support)
- ✅ Firefox (good support)
- ✅ Safari (limited voices)
- ✅ Edge (good support)

### Voice Quality
- **System-dependent** - Quality varies by OS
- **Language support** - Depends on installed voices
- **Real-time** - No external API required

### Performance
- **Lightweight** - No external dependencies
- **Efficient** - Queue-based speech management
- **Non-blocking** - Doesn't interfere with chat

## Integration Examples

### With Your Existing Files

The voice mode works with all your current HTML files:

```html
<!-- index-server.html -->
<!-- index-supabase.html -->
<!-- index-firebase.html -->
<!-- index-static.html -->
<!-- index-guest.html -->

<!-- Just add these script tags -->
<script src="languages-en.js"></script>
<script src="languages-ko.js"></script>
<script src="languages-ja.js"></script>
<script src="languages.js"></script>
<script src="voice-mode.js"></script>
```

### Custom Integration

If you need custom integration:

```javascript
// Initialize voice mode manually
window.voiceMode = new VoiceMode();

// Hook into displayMessage manually
window.voiceMode.hookIntoDisplayMessage();

// Speak custom text
window.voiceMode.speakText("Hello, this is a test message");
```

## Language Support

### English
```javascript
voiceMode: "Voice Mode",
enableVoice: "Enable Voice",
disableVoice: "Disable Voice",
// ... more strings
```

### Korean
```javascript
voiceMode: "음성 모드",
enableVoice: "음성 활성화",
disableVoice: "음성 비활성화",
// ... more strings
```

### Japanese
```javascript
voiceMode: "音声モード",
enableVoice: "音声を有効にする",
disableVoice: "音声を無効にする",
// ... more strings
```

## Troubleshooting

### Common Issues

#### No Voices Available
- **Solution**: Install system voices
- **Windows**: Settings > Time & Language > Speech
- **Mac**: System Preferences > Accessibility > Speech
- **Linux**: Install speech synthesis packages

#### Voice Not Working
- **Check**: Browser permissions for audio
- **Try**: Different browser (Chrome recommended)
- **Verify**: System audio is working

#### Messages Not Reading
- **Check**: Voice mode is enabled
- **Verify**: Auto-read is checked
- **Confirm**: Message filtering settings

### Debug Mode

Enable debug logging:

```javascript
// Add to console for debugging
console.log('Voice mode status:', window.voiceMode.isEnabled);
console.log('Available voices:', window.voiceMode.availableVoices);
console.log('Current settings:', window.voiceMode.settings);
```

## Alternative Approaches

### 1. Web Speech API (Current Implementation)
- ✅ Built into browsers
- ✅ No external dependencies
- ✅ Works offline
- ❌ Voice quality varies

### 2. External TTS Services
- **Google Cloud TTS** - High quality, requires API key
- **Amazon Polly** - Natural voices, paid service
- **Azure Speech** - Microsoft's solution

### 3. Local TTS Libraries
- **ResponsiveVoice.js** - Cross-browser compatibility
- **SpeechSynthesis** - Current implementation
- **Custom TTS engines** - For advanced users

## Future Enhancements

### Planned Features
- **Voice character mapping** - Different voices for different characters
- **Emotion detection** - Adjust tone based on message content
- **Background music** - Ambient sounds during reading
- **Voice recording** - Save custom voice clips

### Advanced Integration
- **Discord bot** - Voice mode for Discord
- **Mobile app** - Native mobile voice support
- **Accessibility** - Screen reader integration

## Files Created

1. **`voice-mode.js`** - Main voice mode system
2. **`voice-mode-integration-example.html`** - Integration example
3. **`VOICE_MODE_README.md`** - This documentation
4. **Language updates** - Added voice mode strings to all language files

## Support

For issues or questions:
1. Check browser compatibility
2. Verify system voice installation
3. Test with the integration example
4. Review console for error messages

The voice mode system is designed to be plug-and-play with your existing TRPG application. Simply include the script files and the voice controls will appear automatically in your game interface. 