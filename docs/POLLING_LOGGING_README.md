# Polling Logging System

## Overview

The polling logging system provides comprehensive monitoring and logging for the TRPG application's polling mechanism. It tracks when polling starts/stops, frequency, duration, and provides visual indicators in the UI.

## Features

### ✅ Implemented Features

1. **Comprehensive Logging**: Detailed logs for polling start, stop, restart, and execution
2. **Frequency Tracking**: Monitors actual polling frequency vs expected (5 seconds)
3. **Visual Indicators**: Real-time polling status in the UI
4. **Performance Monitoring**: Tracks poll duration and frequency deviations
5. **Debug Functions**: Global functions for debugging polling status
6. **Error Handling**: Graceful error logging for failed polls

### 🔧 Technical Implementation

#### Core Components

1. **Enhanced pollSession()** - Added timing and logging to the main polling function
2. **Polling Status Functions** - Functions to track and display polling status
3. **Visual Indicators** - UI elements showing polling status
4. **Frequency Tracking** - Historical tracking of polling intervals

#### Key Functions

```javascript
// Enhanced pollSession with logging
async function pollSession() {
    const pollStartTime = Date.now();
    window.lastPollTime = new Date().toISOString();
    trackPollingFrequency();
    
    try {
        // ... existing polling logic ...
    } finally {
        const pollDuration = Date.now() - pollStartTime;
        console.log('⏱️ Poll completed:', {
            duration: `${pollDuration}ms`,
            timestamp: new Date().toISOString()
        });
    }
}

// Polling status tracking
function getPollingStatus() {
    return {
        isActive: pollInterval !== null,
        interval: pollInterval,
        frequency: '5000ms (5 seconds)',
        lastPoll: window.lastPollTime || 'Never',
        sessionId: window.currentSessionId
    };
}

// Frequency tracking
function trackPollingFrequency() {
    const now = Date.now();
    if (!window.pollingHistory) {
        window.pollingHistory = [];
    }
    
    window.pollingHistory.push(now);
    
    // Keep only last 20 polls for frequency calculation
    if (window.pollingHistory.length > 20) {
        window.pollingHistory = window.pollingHistory.slice(-20);
    }
    
    // Calculate average frequency
    if (window.pollingHistory.length > 1) {
        const intervals = [];
        for (let i = 1; i < window.pollingHistory.length; i++) {
            intervals.push(window.pollingHistory[i] - window.pollingHistory[i-1]);
        }
        const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
        
        console.log('📈 Polling frequency:', {
            averageInterval: `${Math.round(avgInterval)}ms`,
            expectedInterval: '5000ms',
            deviation: `${Math.round((avgInterval - 5000) / 50)}%`,
            totalPolls: window.pollingHistory.length
        });
    }
}
```

### 📊 Logging Categories

#### 1. **Polling Lifecycle Logs**
- `🔄 Polling started` - When polling begins
- `🛑 Polling stopped` - When polling is stopped
- `🔄 Polling restarted` - When polling is restarted

#### 2. **Poll Execution Logs**
- `📡 Poll detected changes` - When changes are found
- `📡 Poll completed - no changes detected` - When no changes found
- `⏱️ Poll completed` - Duration and timing info
- `❌ Error polling session` - Error handling

#### 3. **Frequency Tracking Logs**
- `📈 Polling frequency` - Average interval and deviation
- `⏭️ Skipping poll - no current session` - When polling is skipped

#### 4. **Status Logs**
- `📊 Polling Status` - Current status information

### 🎨 User Interface

#### Visual Indicators
1. **Polling Status Indicator**: Green pulsing dot when active, gray when stopped
2. **Status Text**: Shows "Polling: 5s" when active, "Polling: Stopped" when inactive
3. **Location**: Top-right corner of the game interface

#### Status Display
```html
<div id="polling-status" class="text-xs text-gray-500">
    <span id="polling-indicator" class="inline-block w-2 h-2 rounded-full bg-green-500 mr-1 animate-pulse"></span>
    <span id="polling-text">Polling: 5s</span>
</div>
```

### 🔍 Debug Functions

#### Global Functions Available
```javascript
// Get current polling status
window.getPollingStatus()

// Log current status to console
window.logPollingStatus()

// Track frequency (called automatically)
window.trackPollingFrequency()
```

#### Example Usage
```javascript
// Check polling status
const status = window.getPollingStatus();
console.log('Current status:', status);

// Log detailed status
window.logPollingStatus();

// Monitor frequency over time
setInterval(() => {
    window.trackPollingFrequency();
}, 10000); // Check every 10 seconds
```

## Configuration

### Polling Frequency
- **Current**: 5000ms (5 seconds)
- **Configurable**: Change the interval in `setInterval(pollSession, 5000)`
- **Recommended**: 3-10 seconds for optimal performance

### Logging Levels
- **Verbose**: All logs enabled by default
- **Performance**: Frequency tracking enabled
- **Error**: Error logging always enabled

## Monitoring

### What Gets Logged

1. **Polling Events**:
   - Start/Stop/Restart events
   - Session changes detected
   - Error conditions

2. **Performance Metrics**:
   - Poll duration (how long each poll takes)
   - Frequency tracking (actual vs expected intervals)
   - Deviation from expected 5-second interval

3. **Session Information**:
   - Session ID being polled
   - Current session state
   - Player count and turn information

### Console Output Examples

```
🔄 Polling started: {
  interval: "5000ms (5 seconds)",
  pollInterval: 123,
  sessionId: "abc123",
  timestamp: "2024-01-15T10:30:00.000Z"
}

📡 Poll detected changes: {
  sessionId: "abc123",
  chatHistoryChanged: true,
  turnChanged: false,
  playersChanged: false,
  timestamp: "2024-01-15T10:30:05.000Z"
}

📈 Polling frequency: {
  averageInterval: "5002ms",
  expectedInterval: "5000ms",
  deviation: "0%",
  totalPolls: 15
}

⏱️ Poll completed: {
  duration: "245ms",
  timestamp: "2024-01-15T10:30:05.000Z"
}
```

## Testing

### Manual Testing
1. Open the application in a browser
2. Join or create a session
3. Open browser console (F12)
4. Watch for polling logs
5. Use `window.logPollingStatus()` to check status

### Test Page
Use `test-polling-logging.html` for isolated testing:
1. Open the test page
2. Use the controls to start/stop polling
3. Monitor console output
4. Check frequency tracking

### Automated Testing
```javascript
// Test polling status
function testPollingStatus() {
    const status = window.getPollingStatus();
    console.assert(status.frequency === '5000ms (5 seconds)', 'Frequency should be 5 seconds');
    console.assert(typeof status.isActive === 'boolean', 'isActive should be boolean');
}

// Test frequency tracking
function testFrequencyTracking() {
    window.trackPollingFrequency();
    console.assert(window.pollingHistory, 'pollingHistory should exist');
}
```

## Troubleshooting

### Common Issues

1. **Polling Not Starting**:
   - Check if session is properly initialized
   - Verify `window.currentSession` exists
   - Check console for error messages

2. **High Frequency Deviation**:
   - Browser tab inactive (throttling)
   - Network connectivity issues
   - Server response delays

3. **Missing Logs**:
   - Ensure console is open (F12)
   - Check for JavaScript errors
   - Verify polling is actually running

### Debug Commands

```javascript
// Check if polling is active
console.log('Polling active:', window.pollInterval !== null);

// Get detailed status
window.logPollingStatus();

// Check frequency history
console.log('Polling history:', window.pollingHistory);

// Force a poll (for testing)
pollSession();
```

## Performance Considerations

### Memory Usage
- Polling history limited to last 20 polls
- Automatic cleanup of old data
- Minimal memory footprint

### Network Impact
- 5-second intervals = 12 requests per minute
- Lightweight API calls
- Efficient change detection

### Browser Performance
- Non-blocking async operations
- Minimal UI updates
- Efficient logging system

## Future Enhancements

### Potential Improvements
1. **Configurable Intervals**: Allow users to adjust polling frequency
2. **Advanced Analytics**: More detailed performance metrics
3. **WebSocket Integration**: Real-time updates instead of polling
4. **Adaptive Polling**: Adjust frequency based on activity
5. **Log Export**: Export polling logs for analysis

### Technical Improvements
1. **Better Error Recovery**: Automatic retry mechanisms
2. **Performance Optimization**: Reduce unnecessary API calls
3. **Enhanced Monitoring**: More detailed metrics and alerts
4. **User Controls**: Allow users to pause/resume polling

## Files Modified

### Core Implementation
- `index.html` - Enhanced polling functions and UI indicators
- `test-polling-logging.html` - Test page for polling functionality

### Key Changes
1. **Enhanced pollSession()** - Added timing and comprehensive logging
2. **Visual Indicators** - Added polling status to UI
3. **Frequency Tracking** - Historical tracking of polling intervals
4. **Debug Functions** - Global functions for monitoring
5. **Error Handling** - Improved error logging and recovery

## Dependencies

- Browser console API for logging
- `setInterval` for polling mechanism
- DOM manipulation for UI updates
- Fetch API for session updates 