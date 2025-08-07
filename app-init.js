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

        if (!sessionId) {
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

    // Function to populate existing players in the modal
    function populateExistingPlayers() {
        const existingPlayersList = document.getElementById('existing-players-list');
        const existingPlayersSection = document.getElementById('existing-players-section');

        if (!existingPlayersList || !existingPlayersSection) {
            console.error('Existing players elements not found');
            return;
        }

        // Get current players from the session
        const currentPlayers = window.currentSession?.players || {};
        const playerNames = Object.values(currentPlayers);

        if (playerNames.length > 0) {
            existingPlayersSection.classList.remove('hidden');
            existingPlayersList.innerHTML = '';

            playerNames.forEach(playerName => {
                const playerButton = document.createElement('button');
                playerButton.className = 'w-full bg-gray-700 hover:bg-gray-600 text-white p-2 rounded text-left transition duration-300';
                playerButton.textContent = playerName;
                playerButton.addEventListener('click', () => {
                    joinAsExistingPlayer(playerName);
                });
                existingPlayersList.appendChild(playerButton);
            });
        } else {
            existingPlayersSection.classList.add('hidden');
        }
    }

    // Function to join as existing player
    async function joinAsExistingPlayer(name) {
        // Get player name display element first
        const playerNameDisplay = document.getElementById('player-name-display');

        // Disable all buttons in the modal to prevent multiple requests
        const allButtons = document.querySelectorAll('#character-modal button');
        allButtons.forEach(btn => {
            btn.disabled = true;
        });

        try {
            characterName = name;
            window.characterName = name;
            playerNameDisplay.textContent = name;

            // Apply player color
            const playerColor = window.turnSystem?.memberManager?.getPlayerColor(name) || 'text-blue-400';

            if (playerNameDisplay) {
                playerNameDisplay.textContent = name;
                playerNameDisplay.className = 'font-semibold ' + playerColor;

                // Check if color is actually applied
                setTimeout(() => {
                    const computedStyle = window.getComputedStyle(playerNameDisplay);

                    // If color class didn't work, try inline style
                    if (!playerNameDisplay.className.includes('text-') || computedStyle.color === 'rgb(156, 163, 175)') {
                        const colorMap = {
                            'text-red-400': '#f87171',
                            'text-blue-400': '#60a5fa',
                            'text-green-400': '#4ade80',
                            'text-yellow-400': '#facc15',
                            'text-purple-400': '#c084fc',
                            'text-pink-400': '#f472b6',
                            'text-indigo-400': '#818cf8',
                            'text-emerald-400': '#34d399'
                        };
                        const hexColor = colorMap[playerColor] || '#60a5fa';
                        playerNameDisplay.style.color = hexColor;
                    }
                }, 100);

                // Fallback: ensure color is applied after a short delay
                setTimeout(() => {
                    if (!playerNameDisplay.className.includes('text-')) {
                        playerNameDisplay.className = 'font-semibold ' + playerColor;
                    }
                }, 200);

                // Retry mechanism: if turn system isn't ready, retry after a delay
                if (!window.turnSystem?.memberManager) {
                    setTimeout(() => {
                        if (window.turnSystem?.memberManager) {
                            const retryColor = window.turnSystem.memberManager.getPlayerColor(name);
                            playerNameDisplay.className = 'font-semibold ' + retryColor;
                        }
                    }, 1000);
                }
            } else {
                console.error('Player name display element not found (existing player)');
            }

            // Hide modal
            characterModal.classList.add('hidden');
            playerInfo.classList.remove('hidden');

            // Clear input
            document.getElementById('character-name').value = '';

            // Trigger auto-stats generation for existing character
            if (window.currentSession?.gemini_api_key) {
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

    // Test function to manually apply player color (for debugging)
    window.testPlayerColor = function (playerName) {
        const playerColor = window.turnSystem?.memberManager?.getPlayerColor(playerName) || 'text-blue-400';
        const playerNameDisplay = document.getElementById('player-name-display');

        if (playerNameDisplay) {
            playerNameDisplay.textContent = playerName;
            playerNameDisplay.className = 'font-semibold ' + playerColor;
        } else {
            console.error('Test: Player name display element not found');
        }
    };

    // Character creation
    createCharacterBtn.addEventListener('click', async () => {
        const name = document.getElementById('character-name').value.trim();
        const description = document.getElementById('character-description').value.trim();
        if (!name) {
            alert(languageManager.getText('characterNameRequired'));
            return;
        }

        // Disable inputs to prevent multiple requests
        const characterNameInput = document.getElementById('character-name');
        const characterDescriptionInput = document.getElementById('character-description');
        const createButton = document.getElementById('create-character-btn');
        characterNameInput.disabled = true;
        characterDescriptionInput.disabled = true;
        createButton.disabled = true;
        createButton.textContent = languageManager.getText('creatingCharacter');

        try {
            characterName = name;
            window.characterName = name;

            // Get player name display element first
            const playerNameDisplay = document.getElementById('player-name-display');
            playerNameDisplay.textContent = name;

            // Check if this is a new session (no current session exists)
            if (window.pendingSessionData) {
                // Create the session now with the character name
                const startPrompt = window.pendingSessionData.startingPrompt;
                const apiKey = window.pendingSessionData.apiKey;

                // Generate the game setup prompt using the template
                const gameSetupPrompt = languageManager.getText('gameSetupTemplate', {
                    worldDescription: startPrompt,
                    characterName: name
                });

                // Create session first to get session ID
                const session = await createSession(apiKey, startPrompt);
                updateGlobalVariables(session);
                switchToGameView(session.id);

                // Initialize turn system and set first player as current turn
                if (window.turnSystem) {
                    window.turnSystem.players = { [name]: name };
                    window.turnSystem.turnOrder = [name];
                    window.turnSystem.currentTurn = name;
                    window.turnSystem.updateTurnStatus();
                }

                // Generate turn prompt for the first player
                const turnPrompt = languageManager.getText('turnPrompt', {
                    playerList: name,
                    currentTurn: name
                });

                // Combine game setup with turn prompt
                const combinedPrompt = `${gameSetupPrompt}\n\n${turnPrompt}`;

                // Show thinking indicator
                showThinkingIndicator();

                // Call Gemini for initial response with turn prompt
                const initialGMResponse = await callGemini(combinedPrompt, apiKey);

                // Hide thinking indicator
                hideThinkingIndicator();
                if (initialGMResponse) {
                    const initialHistory = [
                        { role: "user", parts: [{ text: combinedPrompt }], author: 'SYSTEM' },
                        { role: "model", parts: [{ text: initialGMResponse }], author: 'GM' }
                    ];

                    // Update session with initial chat history and turn data
                    await updateSession(session.id, {
                        chat_history: initialHistory,
                        current_turn: name,
                        turn_order: [name],
                        players: { [name]: name }
                    });

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
                // For new sessions, the player is already added in the initial setup
                // For existing sessions, add the player if not already there
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

                            // For new characters (not the first character), send character joining prompt
                            if (!window.pendingSessionData && window.currentSession?.gemini_api_key) {

                                // Generate character joining prompt
                                const characterJoiningPrompt = languageManager.getText('characterJoiningTemplate', {
                                    characterName: name,
                                    background: description || 'No background provided'
                                });

                                // Show thinking indicator
                                showThinkingIndicator();

                                // Call Gemini for character joining response
                                const characterJoiningResponse = await callGemini(characterJoiningPrompt, window.currentSession.gemini_api_key);

                                // Hide thinking indicator
                                hideThinkingIndicator();

                                if (characterJoiningResponse) {
                                    // Add the character joining conversation to chat history
                                    const characterJoiningHistory = [
                                        { role: "user", parts: [{ text: characterJoiningPrompt }], author: 'SYSTEM' },
                                        { role: "model", parts: [{ text: characterJoiningResponse }], author: 'GM' }
                                    ];

                                    // Update session with new chat history
                                    const updatedChatHistory = [...window.chatHistory, ...characterJoiningHistory];
                                    await updateSession(window.currentSessionId, {
                                        chat_history: updatedChatHistory
                                    });

                                    // Update global chat history
                                    window.chatHistory = updatedChatHistory;
                                    chatHistory = updatedChatHistory;

                                    // Display the new messages immediately in the UI
                                    characterJoiningHistory.forEach(msg => {
                                        displayMessage({
                                            text: msg.parts[0].text,
                                            type: msg.role === 'model' ? 'gm' : 'player',
                                            author: msg.author || (msg.role === 'model' ? 'GM' : 'Player')
                                        });
                                    });

                                    // Now request stats after the character joining response is processed
                                    batchRequestCharacterStats([name], window.currentSession.gemini_api_key).catch(error => {
                                        console.error('Error in auto-stats generation:', error);
                                    });
                                }
                            } else {
                                // For existing characters or first character, request stats immediately
                                if (window.currentSession?.gemini_api_key) {
                                    batchRequestCharacterStats([name], window.currentSession.gemini_api_key).catch(error => {
                                        console.error('Error in auto-stats generation:', error);
                                    });
                                }
                            }
                        } catch (error) {
                            console.error('Error updating session with new player:', error);
                        }
                    }
                }

                const playerColor = window.turnSystem?.memberManager?.getPlayerColor(name) || 'text-blue-400';

                if (playerNameDisplay) {
                    playerNameDisplay.textContent = name;
                    playerNameDisplay.className = 'font-semibold ' + playerColor;

                    // Check if color is actually applied
                    setTimeout(() => {
                        const computedStyle = window.getComputedStyle(playerNameDisplay);

                        // If color class didn't work, try inline style
                        if (!playerNameDisplay.className.includes('text-') || computedStyle.color === 'rgb(156, 163, 175)') {
                            const colorMap = {
                                'text-red-400': '#f87171',
                                'text-blue-400': '#60a5fa',
                                'text-green-400': '#4ade80',
                                'text-yellow-400': '#facc15',
                                'text-purple-400': '#c084fc',
                                'text-pink-400': '#f472b6',
                                'text-indigo-400': '#818cf8',
                                'text-emerald-400': '#34d399'
                            };
                            const hexColor = colorMap[playerColor] || '#60a5fa';
                            playerNameDisplay.style.color = hexColor;
                        }
                    }, 100);

                    // Fallback: ensure color is applied after a short delay
                    setTimeout(() => {
                        if (!playerNameDisplay.className.includes('text-')) {
                            playerNameDisplay.className = 'font-semibold ' + playerColor;
                        }
                    }, 200);

                    // Retry mechanism: if turn system isn't ready, retry after a delay
                    if (!window.turnSystem?.memberManager) {
                        setTimeout(() => {
                            if (window.turnSystem?.memberManager) {
                                const retryColor = window.turnSystem.memberManager.getPlayerColor(name);
                                playerNameDisplay.className = 'font-semibold ' + retryColor;
                            }
                        }, 1000);
                    }
                } else {
                    console.error('Player name display element not found');
                }
            }

            playerInfo.classList.remove('hidden');
            characterModal.classList.add('hidden');
            document.getElementById('character-name').value = '';
            document.getElementById('character-description').value = '';

        } catch (error) {
            console.error('Error during character creation:', error);
            // Re-enable inputs on error
            characterNameInput.disabled = false;
            characterDescriptionInput.disabled = false;
            createButton.disabled = false;
            createButton.textContent = languageManager.getText('joinGameButton');
        }
    });

    // Cancel character creation
    cancelCharacterBtn.addEventListener('click', () => {
        characterModal.classList.add('hidden');
        document.getElementById('character-name').value = '';
        document.getElementById('character-description').value = '';
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

    // Mobile members sidebar toggle
    const toggleMembersBtn = document.getElementById('toggle-members-btn');
    const membersSidebar = document.getElementById('members-sidebar');
    const formatToolbar = document.querySelector('.format-toolbar');
    const inputModeIndicator = document.getElementById('input-mode-indicator');

    if (toggleMembersBtn && membersSidebar) {
        toggleMembersBtn.addEventListener('click', () => {
            const isHidden = membersSidebar.classList.contains('hidden');
            if (isHidden) {
                // Show members panel and hide chat area
                membersSidebar.classList.remove('hidden');
                membersSidebar.classList.add('block');
                toggleMembersBtn.textContent = '✕';
                toggleMembersBtn.title = 'Hide Members';

                // Hide chat area elements on mobile only
                if (window.innerWidth < 1024) {
                    if (chatLog) chatLog.classList.add('hidden');
                    if (playerActionInput) playerActionInput.classList.add('hidden');
                    if (sendActionBtn) sendActionBtn.classList.add('hidden');
                    if (formatToolbar) formatToolbar.classList.add('hidden');
                    if (inputModeIndicator) inputModeIndicator.classList.add('hidden');
                    if (modeToggleBtn) modeToggleBtn.classList.add('hidden');
                }
            } else {
                // Hide members panel and show chat area
                membersSidebar.classList.add('hidden');
                membersSidebar.classList.remove('block');
                toggleMembersBtn.textContent = '👥';
                toggleMembersBtn.title = 'Show Members';

                // Show chat area elements
                if (chatLog) chatLog.classList.remove('hidden');
                if (playerActionInput) playerActionInput.classList.remove('hidden');
                if (sendActionBtn) sendActionBtn.classList.remove('hidden');
                if (formatToolbar) formatToolbar.classList.remove('hidden');
                if (inputModeIndicator) inputModeIndicator.classList.remove('hidden');
                if (modeToggleBtn) modeToggleBtn.classList.remove('hidden');
            }
        });
    }

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

    // Handle window resize to show/hide elements appropriately
    window.addEventListener('resize', () => {
        if (window.innerWidth >= 1024) {
            // On tablet/desktop, always show chat area
            if (chatLog) chatLog.classList.remove('hidden');
            if (playerActionInput) playerActionInput.classList.remove('hidden');
            if (sendActionBtn) sendActionBtn.classList.remove('hidden');
            if (formatToolbar) formatToolbar.classList.remove('hidden');
            if (inputModeIndicator) inputModeIndicator.classList.remove('hidden');
            if (modeToggleBtn) modeToggleBtn.classList.remove('hidden');
        }
    });
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initializeApp); 