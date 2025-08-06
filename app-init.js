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
    const cancelCharacterBtn = document.getElementById('cancel-character-btn');
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

        console.log('🔍 DEBUG - API Key length:', apiKey.length);
        console.log('🔍 DEBUG - Starting prompt:', startPrompt);
        console.log('🔍 DEBUG - Starting prompt length:', startPrompt.length);

        if (!apiKey || !startPrompt) {
            createCustomConfirm(languageManager.getText('apiKeyRequired'));
            return;
        }

        try {
            // Store the starting prompt and API key for later use
            window.pendingSessionData = {
                apiKey: apiKey,
                startingPrompt: startPrompt
            };

            // Switch to game view without creating session yet
            document.getElementById('session-view').classList.add('hidden');
            document.getElementById('game-view').classList.remove('hidden');

            // Show character creation modal
            setTimeout(() => {
                const characterModal = document.getElementById('character-modal');
                if (characterModal) {
                    characterModal.classList.remove('hidden');
                    // Hide existing players section for new sessions
                    const existingPlayersSection = document.getElementById('existing-players-section');
                    if (existingPlayersSection) {
                        existingPlayersSection.classList.add('hidden');
                    }
                    // Update modal for new session
                    const modalTitle = characterModal.querySelector('h2');
                    const createButton = document.getElementById('create-character-btn');
                    if (modalTitle) modalTitle.textContent = languageManager.getText('createCharacterTitle');
                    if (createButton) createButton.textContent = languageManager.getText('joinGameButton');
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
                    populateExistingPlayers();
                    // Update modal for joining session
                    const modalTitle = characterModal.querySelector('h2');
                    const createButton = document.getElementById('create-character-btn');
                    if (modalTitle) modalTitle.textContent = languageManager.getText('joinGameTitle');
                    if (createButton) createButton.textContent = languageManager.getText('newCharacterButton');
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

            // Only call Gemini if in action/prompt mode
            if (window.inputModeManager && window.inputModeManager.shouldSendToAI()) {
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
            }

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

    // Function to populate existing players list
    function populateExistingPlayers() {
        const existingPlayersList = document.getElementById('existing-players-list');
        const existingPlayersSection = document.getElementById('existing-players-section');

        if (!existingPlayersList || !window.currentSession) {
            console.log('🔍 populateExistingPlayers: Missing elements or session');
            return;
        }

        const players = window.currentSession.players || {};
        const playerNames = Object.values(players);

        console.log('🔍 populateExistingPlayers: Found players:', playerNames);

        if (playerNames.length === 0) {
            existingPlayersSection.classList.add('hidden');
            console.log('🔍 populateExistingPlayers: No players, hiding section');
            return;
        }

        existingPlayersSection.classList.remove('hidden');
        existingPlayersList.innerHTML = '';
        console.log('🔍 populateExistingPlayers: Showing section with', playerNames.length, 'players');

        playerNames.forEach(playerName => {
            const playerButton = document.createElement('button');
            playerButton.className = 'w-full text-left p-2 bg-gray-700 hover:bg-gray-600 rounded text-sm transition duration-200';
            playerButton.textContent = playerName;
            playerButton.addEventListener('click', () => {
                joinAsExistingPlayer(playerName);
            });
            existingPlayersList.appendChild(playerButton);
        });
    }

    // Function to join as existing player
    async function joinAsExistingPlayer(name) {
        // Disable all buttons in the modal to prevent multiple requests
        const allButtons = document.querySelectorAll('#character-modal button');
        allButtons.forEach(btn => {
            btn.disabled = true;
        });

        try {
            characterName = name;
            window.characterName = name;
            playerNameDisplay.textContent = name;

            // Hide modal
            characterModal.classList.add('hidden');
            playerInfo.classList.remove('hidden');

            // Clear input
            document.getElementById('character-name').value = '';

            // Trigger auto-stats generation for existing character
            if (window.currentSession?.gemini_api_key) {
                console.log('🆕 Triggering auto-stats generation for:', name);
                batchRequestCharacterStats([name], window.currentSession.gemini_api_key).catch(error => {
                    console.error('Error requesting stats for existing character:', error);
                });
            }
        } catch (error) {
            console.error('Error joining as existing player:', error);
            // Re-enable buttons on error
            allButtons.forEach(btn => {
                btn.disabled = false;
            });
        }
    }

    // Character creation
    createCharacterBtn.addEventListener('click', async () => {
        const name = document.getElementById('character-name').value.trim();
        if (!name) {
            alert(languageManager.getText('characterNameRequired'));
            return;
        }

        // Disable inputs to prevent multiple requests
        const characterNameInput = document.getElementById('character-name');
        const createButton = document.getElementById('create-character-btn');
        characterNameInput.disabled = true;
        createButton.disabled = true;
        createButton.textContent = languageManager.getText('creatingCharacter');

        try {
            characterName = name;
            window.characterName = name;
            playerNameDisplay.textContent = name;

            // Check if this is a new session (no current session exists)
            if (window.pendingSessionData) {
                // Create the session now with the character name
                const startPrompt = window.pendingSessionData.startingPrompt;
                const apiKey = window.pendingSessionData.apiKey;

                console.log('🔍 DEBUG - Creating session with data:', { startPrompt, characterName: name });

                // Generate the game setup prompt using the template
                const gameSetupPrompt = languageManager.getText('gameSetupTemplate', {
                    worldDescription: startPrompt,
                    characterName: name
                });
                console.log('🔍 DEBUG - Generated game setup prompt:', gameSetupPrompt);

                // Show thinking indicator
                showThinkingIndicator();

                // Call Gemini for initial response
                const initialGMResponse = await callGemini(gameSetupPrompt, apiKey);

                // Hide thinking indicator
                hideThinkingIndicator();
                if (initialGMResponse) {
                    const initialHistory = [
                        { role: "user", parts: [{ text: gameSetupPrompt }], author: 'SYSTEM' },
                        { role: "model", parts: [{ text: initialGMResponse }], author: 'GM' }
                    ];

                    // Create session with the initial chat history
                    const session = await createSession(apiKey, startPrompt);
                    updateGlobalVariables(session);
                    switchToGameView(session.id);

                    // Update session with initial chat history
                    await updateSession(session.id, { chat_history: initialHistory });

                    console.log('🔍 DEBUG - Chat history updated:', initialHistory);

                    // Update global chat history variables
                    window.chatHistory = initialHistory;
                    chatHistory = initialHistory;

                    // Display initial chat history
                    displayInitialChatHistory();

                    // Start polling now that we have chat history
                    restartPolling();

                    // Clear the pending data
                    delete window.pendingSessionData;
                }
            }

            // Apply player color to the player name display
            if (window.turnSystem && window.turnSystem.memberManager) {
                // Add the player to turnSystem if not already there
                if (!window.turnSystem.players || !window.turnSystem.players[name]) {
                    if (!window.turnSystem.players) {
                        window.turnSystem.players = {};
                    }
                    // Add player using name as key
                    window.turnSystem.players[name] = name;

                    // Update the session on the server with the new player
                    if (window.currentSessionId) {
                        try {
                            await updateSession(window.currentSessionId, {
                                ...window.turnSystem.getSessionData()
                            });
                            console.log('✅ Player added to session:', name);

                            // Trigger auto-stats generation for the new player
                            if (window.currentSession?.gemini_api_key) {
                                console.log('🆕 Triggering auto-stats generation for:', name);
                                batchRequestCharacterStats([name], window.currentSession.gemini_api_key).catch(error => {
                                    console.error('Error in auto-stats generation:', error);
                                });
                            }
                        } catch (error) {
                            console.error('Error updating session with new player:', error);
                        }
                    }
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

        } catch (error) {
            console.error('Error during character creation:', error);
            // Re-enable inputs on error
            characterNameInput.disabled = false;
            createButton.disabled = false;
            createButton.textContent = languageManager.getText('joinGameButton');
        }
    });

    // Cancel character creation
    cancelCharacterBtn.addEventListener('click', () => {
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
        if (window.inputModeManager) {
            const newMode = window.inputModeManager.currentMode === 'chat' ? 'prompt' : 'chat';
            window.inputModeManager.setMode(newMode, true);
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

        // Update UI text with null checks
        const createSessionText = document.getElementById('create-session-text');
        const joinSessionText = document.getElementById('join-session-text');
        const sendActionText = document.getElementById('send-action-text');
        const leaveSessionText = document.getElementById('leave-session-text');

        if (createSessionText) createSessionText.textContent = languageManager.getText('createSession');
        if (joinSessionText) joinSessionText.textContent = languageManager.getText('joinSession');
        if (sendActionText) sendActionText.textContent = languageManager.getText('sendAction');
        if (leaveSessionText) leaveSessionText.textContent = languageManager.getText('leaveSession');
    });

    // Input event listeners
    playerActionInput.addEventListener('input', () => {
        if (previewToggle.checked) {
            updatePreview();
        }
    });

    // Handle Korean IME composition
    let isComposing = false;

    playerActionInput.addEventListener('compositionstart', () => {
        isComposing = true;
    });

    playerActionInput.addEventListener('compositionend', () => {
        isComposing = false;
    });

    playerActionInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey && !isComposing) {
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