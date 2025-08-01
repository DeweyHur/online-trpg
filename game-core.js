// --- GAME CORE FUNCTIONS ---

// Global variables for app state
let currentSessionId = null;
let userId = null;
let characterName = null;
let chatHistory = [];
let currentSession = null;
let pollInterval = null;

// Make variables global for debugging and polling access
window.currentSession = currentSession;
window.chatHistory = chatHistory;
window.pollInterval = pollInterval;
window.userId = userId;
window.characterName = characterName;

// Turn system instances
let turnSystem = null;
let memberManager = null;
let inputModeManager = null;

// Player colors array
const playerColors = [
    'player-red', 'player-blue', 'player-green', 'player-yellow',
    'player-purple', 'player-pink', 'player-indigo', 'player-emerald'
];
let playerColorMap = {};

// --- SERVER API FUNCTIONS ---
async function apiCall(endpoint, method = 'GET', data = null) {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
        }
    };

    if (data) {
        options.body = JSON.stringify(data);
    }

    const response = await fetch(`/api${endpoint}`, options);
    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.error || 'API call failed');
    }

    return result;
}

async function callGemini(prompt, apiKey) {
    displayMessage({ text: languageManager.getText('gmThinking'), type: 'system' });

    try {
        const result = await apiCall('/gemini', 'POST', {
            prompt,
            apiKey,
            chatHistory: chatHistory.map(({ role, parts }) => ({ role, parts }))
        });

        return result.response;
    } catch (error) {
        console.error("Gemini API Error:", error);
        displayMessage({ text: languageManager.getText('gmError', { error: error.message }), type: 'error' });
        return null;
    }
}

async function createSession(geminiApiKey, startingPrompt) {
    const result = await apiCall('/sessions', 'POST', {
        geminiApiKey,
        startingPrompt
    });
    return result.session;
}

async function getSession(sessionId) {
    const result = await apiCall(`/sessions/${sessionId}`);
    return result.session;
}

async function updateSession(sessionId, updateData) {
    const result = await apiCall(`/sessions/${sessionId}`, 'PUT', updateData);
    return result.session;
}

// --- VIEW MANAGEMENT ---
function switchToGameView(sessionId) {
    currentSessionId = sessionId;
    window.currentSessionId = sessionId;
    document.getElementById('session-view').classList.add('hidden');
    document.getElementById('game-view').classList.remove('hidden');
    document.getElementById('session-id-display').textContent = sessionId;

    // Initialize turn system components
    turnSystem = new TurnSystem(languageManager);
    window.turnSystem = turnSystem; // Make global for color consistency
    memberManager = new MemberManager(turnSystem);
    inputModeManager = new InputModeManager(turnSystem, languageManager);

    memberManager.initialize('members-list');
    inputModeManager.initialize('player-action', 'input-mode-indicator', 'send-action-btn');
}

function switchToSessionView() {
    if (pollInterval) {
        console.log('🛑 Polling stopped (switching to session view):', {
            pollInterval: pollInterval,
            timestamp: new Date().toISOString()
        });
        clearInterval(pollInterval);
        pollInterval = null;
        updatePollingIndicator();
    }
    currentSessionId = null;
    window.currentSessionId = null;
    currentSession = null;
    characterName = null;
    chatHistory = [];
    document.getElementById('chat-log').innerHTML = '';
    document.getElementById('player-info').classList.add('hidden');
    document.getElementById('character-modal').classList.add('hidden'); // Ensure modal is hidden
    playerColorMap = {}; // Reset player colors

    // Reset turn system
    turnSystem = null;
    memberManager = null;
    inputModeManager = null;

    document.getElementById('game-view').classList.add('hidden');
    document.getElementById('session-view').classList.remove('hidden');
}

// --- POLLING SYSTEM ---
async function pollSession() {
    const pollStartTime = Date.now();
    window.lastPollTime = new Date().toISOString();
    trackPollingFrequency();
    try {
        if (!window.currentSession || !window.currentSession.id) {
            console.log('⏭️ Skipping poll - no current session');
            return;
        }
        const session = await getSession(window.currentSession.id);
        if (session) {
            const newChatHistory = session.chat_history || [];
            
            // Check if turnSystem exists before accessing its properties
            const currentTurn = turnSystem ? turnSystem.currentTurn : null;
            const currentPlayers = turnSystem ? turnSystem.players : {};
            
            const sessionChanged = session.chat_history !== window.chatHistory ||
                session.current_turn !== currentTurn ||
                JSON.stringify(session.players) !== JSON.stringify(currentPlayers);

            if (sessionChanged) {
                console.log('📡 Poll detected changes:', {
                    sessionId: window.currentSession.id,
                    chatHistoryChanged: session.chat_history !== window.chatHistory,
                    turnChanged: session.current_turn !== currentTurn,
                    playersChanged: JSON.stringify(session.players) !== JSON.stringify(currentPlayers),
                    timestamp: new Date().toISOString()
                });
                updateGlobalVariables(session);

                // Only update turn system if it exists
                if (turnSystem) {
                    // Store previous turn before updating
                    const previousTurn = turnSystem.currentTurn;

                    // Update turn system
                    turnSystem.initialize(session);

                    // Clean up any duplicate players
                    turnSystem.cleanupDuplicatePlayers();

                    // Set current player after cleanup
                    if (characterName) {
                        turnSystem.setCurrentPlayer(characterName);
                    }

                    // Check if turn actually changed
                    const turnChanged = session.current_turn !== previousTurn;

                    // Update UI components if memberManager exists
                    if (memberManager) {
                        memberManager.updateMembersDisplay();
                    }

                    // Re-render chat history with updated player highlighting
                    const previousPlayers = turnSystem.players ? Object.values(turnSystem.players) : [];
                    const currentPlayers = session.players ? Object.values(session.players) : [];
                    const playersChanged = JSON.stringify(previousPlayers.sort()) !== JSON.stringify(currentPlayers.sort());

                    if (playersChanged && session.players && Object.keys(session.players).length > 0) {
                        console.log('🔄 Re-rendering chat after player list change:', {
                            previous: previousPlayers,
                            current: currentPlayers
                        });
                        setTimeout(() => {
                            reRenderChatHistory();
                        }, 50); // Small delay to ensure member list is updated
                    }

                    // Reset manual mode if turn changed, but only if user isn't actively typing
                    if (turnChanged && inputModeManager) {
                        const inputElement = document.getElementById('player-action');
                        const isUserTyping = inputElement && (inputElement === document.activeElement || inputElement.value.trim().length > 0);

                        if (!isUserTyping) {
                            inputModeManager.resetManualMode();
                            inputModeManager.updateMode();
                        } else {
                            console.log('Skipping mode reset - user is actively typing');
                        }
                    }

                    // Initialize player colors for existing players
                    if (session.players) {
                        Object.values(session.players).forEach(playerName => {
                            getPlayerColor(playerName);
                        });
                    }

                    // Only add new messages instead of re-rendering everything
                    if (newChatHistory.length > window.chatHistory.length) {
                        const newMessages = newChatHistory.slice(window.chatHistory.length);
                        for (const msg of newMessages) {
                            displayMessage({
                                text: msg.parts[0].text,
                                type: msg.role === 'model' ? 'gm' : 'player',
                                author: msg.author || (msg.role === 'model' ? 'GM' : 'Player')
                            });

                            // Process commands in GM messages
                            if (msg.role === 'model') {
                                const commandUpdates = turnSystem.processCommands(msg.parts[0].text);
                                if (Object.keys(commandUpdates).length > 0) {
                                    // Update session with command changes
                                    await updateSession(window.currentSession.id, commandUpdates);
                                }
                            }
                        }
                    }
                } else {
                    console.log('⚠️ Turn system not initialized, skipping turn-related updates');
                    
                    // Still update chat history even if turn system isn't ready
                    if (newChatHistory.length > window.chatHistory.length) {
                        const newMessages = newChatHistory.slice(window.chatHistory.length);
                        for (const msg of newMessages) {
                            displayMessage({
                                text: msg.parts[0].text,
                                type: msg.role === 'model' ? 'gm' : 'player',
                                author: msg.author || (msg.role === 'model' ? 'GM' : 'Player')
                            });
                        }
                    }
                }

                window.chatHistory = newChatHistory;
            } else {
                console.log('📡 Poll completed - no changes detected');
            }
        }
    } catch (error) {
        console.error('❌ Error polling session:', error);
    } finally {
        const pollDuration = Date.now() - pollStartTime;
        console.log('⏱️ Poll completed:', {
            duration: `${pollDuration}ms`,
            timestamp: new Date().toISOString()
        });
    }
}

// --- UTILITY FUNCTIONS ---
function updateGlobalVariables(session) {
    window.currentSession = session;
    currentSession = session;
    window.chatHistory = session.chat_history || [];
    chatHistory = session.chat_history || [];
}

function restartPolling() {
    if (pollInterval) {
        clearInterval(pollInterval);
    }
    pollInterval = setInterval(pollSession, 5000);
    updatePollingIndicator();
}

function manuallyProcessCommands() {
    if (turnSystem) {
        const inputElement = document.getElementById('player-action');
        const text = inputElement.value.trim();
        if (text) {
            const commandUpdates = turnSystem.processCommands(text);
            console.log('Manual command processing result:', commandUpdates);
        }
    }
}

function getPollingStatus() {
    return {
        isPolling: pollInterval !== null,
        lastPollTime: window.lastPollTime,
        sessionId: window.currentSessionId,
        chatHistoryLength: window.chatHistory ? window.chatHistory.length : 0
    };
}

function logPollingStatus() {
    const status = getPollingStatus();
    console.log('📊 Polling Status:', status);
}

function updatePollingIndicator() {
    const indicator = document.getElementById('polling-indicator');
    if (indicator) {
        indicator.textContent = pollInterval ? '🟢' : '🔴';
        indicator.title = pollInterval ? 'Polling active' : 'Polling stopped';
    }
}

function trackPollingFrequency() {
    if (!window.pollingFrequency) {
        window.pollingFrequency = [];
    }
    window.pollingFrequency.push(Date.now());

    // Keep only last 100 polls
    if (window.pollingFrequency.length > 100) {
        window.pollingFrequency.shift();
    }
} 