// --- APP INITIALIZATION & EVENT HANDLERS ---

// Initialize app when DOM is ready
function initializeApp() {
    // --- DOM ELEMENTS ---
    const sessionView = document.getElementById('session-view');
    const gameView = document.getElementById('game-view');
    const createSessionBtn = document.getElementById('create-session-btn');
    const joinSessionBtn = document.getElementById('join-session-btn');
    const sendActionBtn = document.getElementById('send-action-btn');
    const leaveSessionBtn = document.getElementById('leave-session-btn');
    const sessionIdDisplay = document.getElementById('session-id-display');
    const chatLog = document.getElementById('chat-log');
    const playerActionInput = document.getElementById('player-action');
    const characterModal = document.getElementById('character-modal');
    const createCharacterBtn = document.getElementById('create-character-btn');
    const playerInfo = document.getElementById('player-info');
    const playerNameDisplay = document.getElementById('player-name-display');
    const previewToggle = document.getElementById('preview-toggle');
    const previewArea = document.getElementById('preview-area');
    const scrollToBottomBtn = document.getElementById('scroll-to-bottom');
    const languageSelector = document.getElementById('language-selector');
    const modeToggleBtn = document.getElementById('mode-toggle-btn');

    // --- EVENT LISTENERS ---
    createSessionBtn.addEventListener('click', async () => {
        const apiKey = document.getElementById('gemini-api-key').value.trim();
        const startPrompt = document.getElementById('starting-prompt').value.trim();

        if (!apiKey || !startPrompt) {
            createCustomConfirm(languageManager.getText('apiKeyRequired'));
            return;
        }

        try {
            // Create session via server
            const session = await createSession(apiKey, startPrompt);
            updateGlobalVariables(session);

            const initialUserMessage = { role: "user", parts: [{ text: startPrompt }], author: 'SYSTEM' };
            chatHistory.push(initialUserMessage);

            // Call Gemini for initial response
            const initialGMResponse = await callGemini(startPrompt, apiKey);
            if (!initialGMResponse) return;

            const initialHistory = [
                initialUserMessage,
                { role: "model", parts: [{ text: initialGMResponse }], author: 'GM' }
            ];

            // Update session via server
            await updateSession(window.currentSession.id, { chat_history: initialHistory });

            // Switch to game view
            switchToGameView(window.currentSession.id);

            // Start polling
            restartPolling();

            // Display initial chat history (including the messages we just created)
            displayInitialChatHistory();

            // Show character creation modal after creating session
            setTimeout(() => {
                const characterModal = document.getElementById('character-modal');
                if (characterModal) {
                    characterModal.classList.remove('hidden');
                } else {
                    console.error('Character modal not found');
                }
            }, 100); // Small delay to ensure UI is ready

        } catch (error) {
            console.error('Error creating session:', error);
            displayMessage({ text: languageManager.getText('sessionCreationError', { error: error.message }), type: 'error' });
        }
    });

    joinSessionBtn.addEventListener('click', async () => {
        const sessionId = document.getElementById('session-id-input').value.trim();

        console.log('Join session attempt:', { sessionId });

        if (!sessionId) {
            console.log('Validation failed: session ID is empty');
            createCustomConfirm(languageManager.getText('sessionIdRequired'));
            return;
        }

        try {
            // Get session via server
            const session = await getSession(sessionId);
            if (!session) {
                displayMessage({ text: languageManager.getText('sessionNotFound'), type: 'error' });
                return;
            }

            updateGlobalVariables(session);
            switchToGameView(sessionId);
            restartPolling();

            // Show character creation modal after joining session
            setTimeout(() => {
                const characterModal = document.getElementById('character-modal');
                if (characterModal) {
                    characterModal.classList.remove('hidden');
                } else {
                    console.error('Character modal not found');
                }
            }, 100); // Small delay to ensure UI is ready

        } catch (error) {
            console.error('Error joining session:', error);
            displayMessage({ text: languageManager.getText('joinSessionError', { error: error.message }), type: 'error' });
        }
    });

    sendActionBtn.addEventListener('click', async () => {
        const action = playerActionInput.value.trim();
        if (!action) return;

        if (!characterName) {
            // Show character creation modal
            characterModal.classList.remove('hidden');
            return;
        }

        try {
            // Add user message to chat
            const userMessage = { role: "user", parts: [{ text: action }], author: characterName };
            chatHistory.push(userMessage);
            displayMessage({ text: action, type: 'player', author: characterName });

            // Clear input
            playerActionInput.value = '';
            updatePreview();

            // Call Gemini using the API key from the session data
            const apiKey = window.currentSession.gemini_api_key;
            if (!apiKey) {
                displayMessage({ text: 'No API key found in session. Please contact the session creator.', type: 'error' });
                return;
            }
            const response = await callGemini(action, apiKey);
            if (!response) return;

            // Add GM response to chat
            const gmMessage = { role: "model", parts: [{ text: response }], author: 'GM' };
            chatHistory.push(gmMessage);
            displayMessage({ text: response, type: 'gm', author: 'GM' });

            // Update session via server
            await updateSession(window.currentSession.id, { chat_history: chatHistory });

        } catch (error) {
            console.error('Error sending action:', error);
            displayMessage({ text: languageManager.getText('actionError', { error: error.message }), type: 'error' });
        }
    });

    leaveSessionBtn.addEventListener('click', async () => {
        const confirmed = await createCustomConfirm(languageManager.getText('leaveSessionConfirm'));
        if (confirmed) {
            switchToSessionView();
        }
    });

    // Character creation
    createCharacterBtn.addEventListener('click', () => {
        const name = document.getElementById('character-name').value.trim();
        if (!name) {
            alert(languageManager.getText('characterNameRequired'));
            return;
        }

        characterName = name;
        window.characterName = name;
        playerNameDisplay.textContent = name;

        // Apply player color to the player name display
        if (window.turnSystem && window.turnSystem.memberManager) {
            // Add the player to turnSystem if not already there
            if (!window.turnSystem.players || !Object.values(window.turnSystem.players).includes(name)) {
                if (!window.turnSystem.players) {
                    window.turnSystem.players = {};
                }
                // Add player with a unique key
                const playerKey = `player_${Date.now()}`;
                window.turnSystem.players[playerKey] = name;
            }

            const playerColor = window.turnSystem.memberManager.getPlayerColor(name);
            const playerNameDisplay = document.getElementById('player-name-display');

            if (playerNameDisplay) {
                playerNameDisplay.className = 'font-semibold ' + playerColor;
            }
        }

        playerInfo.classList.remove('hidden');
        characterModal.classList.add('hidden');
        document.getElementById('character-name').value = '';
    });

    // Preview toggle
    previewToggle.addEventListener('change', () => {
        if (previewToggle.checked) {
            previewArea.classList.remove('hidden');
            updatePreview();
        } else {
            previewArea.classList.add('hidden');
        }
    });

    // Scroll to bottom
    scrollToBottomBtn.addEventListener('click', () => {
        chatLog.scrollTop = chatLog.scrollHeight;
    });

    // Show/hide scroll to bottom button based on scroll position
    chatLog.addEventListener('scroll', () => {
        const isAtBottom = chatLog.scrollHeight - chatLog.clientHeight - chatLog.scrollTop < 50;
        if (isAtBottom) {
            scrollToBottomBtn.classList.add('opacity-0', 'pointer-events-none');
        } else {
            scrollToBottomBtn.classList.remove('opacity-0', 'pointer-events-none');
        }
    });

    // Mode toggle button
    modeToggleBtn.addEventListener('click', () => {
        if (inputModeManager) {
            const newMode = inputModeManager.currentMode === 'chat' ? 'prompt' : 'chat';
            inputModeManager.setMode(newMode, true);
            console.log('Mode toggled to:', newMode);
        } else {
            console.error('Input mode manager not initialized');
        }
    });

    // Language selector
    languageSelector.addEventListener('change', () => {
        const selectedLanguage = languageSelector.value;
        languageManager.setLanguage(selectedLanguage);
        updateTooltips();

        // Update UI text
        document.getElementById('create-session-text').textContent = languageManager.getText('createSession');
        document.getElementById('join-session-text').textContent = languageManager.getText('joinSession');
        document.getElementById('send-action-text').textContent = languageManager.getText('sendAction');
        document.getElementById('leave-session-text').textContent = languageManager.getText('leaveSession');
    });

    // Input event listeners
    playerActionInput.addEventListener('input', () => {
        if (previewToggle.checked) {
            updatePreview();
        }
    });

    playerActionInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendActionBtn.click();
        }
    });

    // Format buttons
    document.querySelectorAll('[data-format]').forEach(button => {
        button.addEventListener('click', () => {
            const format = button.getAttribute('data-format');
            formatText(format);
        });
    });

    // Initialize tooltips
    updateTooltips();
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initializeApp); 