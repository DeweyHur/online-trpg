// Turn-based TRPG System
class TurnSystem {
    constructor(languageManager) {
        this.languageManager = languageManager;
        this.currentTurn = null;
        this.turnOrder = [];
        this.players = {};
        this.currentPlayerName = null;
        this.isMyTurn = false;
    }

    // Initialize turn system with session data
    initialize(sessionData) {
        this.currentTurn = sessionData.current_turn || null;
        this.turnOrder = sessionData.turn_order || [];
        this.players = sessionData.players || {};
        this.updateTurnStatus();
    }

    // Update turn status based on current player
    updateTurnStatus() {
        if (this.currentPlayerName) {
            this.isMyTurn = this.currentTurn === this.currentPlayerName;
        }
    }

    // Set current player name
    setCurrentPlayer(playerName) {
        this.currentPlayerName = playerName;
        this.updateTurnStatus();
    }

    // Get turn-specific prompt based on language
    getTurnPrompt() {
        const playerList = Object.values(this.players).length > 0 ?
            Object.values(this.players).join(', ') :
            this.languageManager.getText('noPlayersText');

        return this.languageManager.getText('turnPrompt', {
            playerList: playerList,
            currentTurn: this.currentTurn
        });
    }

    // Get chat mode prompt (when not player's turn)
    getChatPrompt() {
        const playerList = Object.values(this.players).length > 0 ?
            Object.values(this.players).join(', ') :
            this.languageManager.getText('noPlayersText');

        return this.languageManager.getText('chatPrompt', {
            playerList: playerList,
            currentTurn: this.currentTurn || this.languageManager.getText('waitingText'),
            currentPlayerName: this.currentPlayerName
        });
    }

    // Check if text contains turn indicator
    hasTurnIndicator(text) {
        if (!this.currentTurn) return false;

        const turnPattern = /\$([^$]+)\$/g;
        const matches = text.match(turnPattern);
        if (matches) {
            const playerName = matches[0].replace(/\$/g, '');
            return playerName === this.currentTurn;
        }
        return false;
    }

    // Extract turn indicator from text
    extractTurnIndicator(text) {
        const turnPattern = /\$([^$]+)\$/g;
        const matches = text.match(turnPattern);
        if (matches) {
            return matches[0].replace(/\$/g, '');
        }
        return null;
    }

    // Parse commands in the format ${Command=Value}
    parseCommands(text) {
        const commandPattern = /\$\{([^=]+)=([^}]+)\}/g;
        const commands = [];
        let match;

        while ((match = commandPattern.exec(text)) !== null) {
            // Skip GeminiStats commands as they're handled by characterStatsManager
            if (match[1].trim().toLowerCase() === 'geministats') {
                continue;
            }

            commands.push({
                command: match[1].trim(),
                value: match[2].trim()
            });
        }

        return commands;
    }

    // Process commands and update game state
    processCommands(text) {
        const commands = this.parseCommands(text);
        const updates = {};

        // Process character stats commands if stats manager exists
        if (window.characterStatsManager) {
            const statsUpdates = window.characterStatsManager.processCommands(text);
            Object.assign(updates, statsUpdates);
        }

        // Process Gemini-generated commands
        if (window.characterStatsManager) {
            const geminiUpdates = window.characterStatsManager.processCommands(text);
            Object.assign(updates, geminiUpdates);
        }

        commands.forEach(cmd => {
            switch (cmd.command.toLowerCase()) {
                case 'turn':
                    // Only set turn if the player exists in the session
                    const playerNames = Object.values(this.players);
                    if (playerNames.includes(cmd.value)) {
                        this.currentTurn = cmd.value;
                        this.updateTurnStatus();
                        updates.current_turn = cmd.value;
                    } else {
                        console.warn(`Cannot set turn to ${cmd.value} - player not in session. Available players: ${playerNames.join(', ')}`);
                    }
                    break;
                // Add more commands here as needed
                default:
                    console.warn(`Unknown command: ${cmd.command} = ${cmd.value}`);
            }
        });

        return updates;
    }

    // Update turn order when players join/leave
    updateTurnOrder() {
        // Remove duplicates from turn order
        const uniquePlayers = Object.values(this.players);
        this.turnOrder = [...new Set(uniquePlayers)];

        if (this.turnOrder.length > 0 && !this.currentTurn) {
            this.currentTurn = this.turnOrder[0];
        }
    }

    // Move to next turn
    nextTurn() {
        if (this.turnOrder.length === 0) return;

        const currentIndex = this.turnOrder.indexOf(this.currentTurn);
        const nextIndex = (currentIndex + 1) % this.turnOrder.length;
        this.currentTurn = this.turnOrder[nextIndex];
        this.updateTurnStatus();
    }

    // Remove player from turn system
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

    // Get session data for API calls
    getSessionData() {
        const sessionData = {
            current_turn: this.currentTurn,
            turn_order: this.turnOrder,
            players: this.players
        };

        // Include character stats data if available
        if (window.characterStatsManager) {
            Object.assign(sessionData, window.characterStatsManager.getSessionData());
        }

        return sessionData;
    }

    // Clean up duplicate players from session data
    cleanupDuplicatePlayers() {
        const uniquePlayers = {};
        const seenNames = new Set();

        // Keep only the first occurrence of each player name
        Object.entries(this.players).forEach(([id, name]) => {
            if (!seenNames.has(name)) {
                uniquePlayers[id] = name;
                seenNames.add(name);
            }
        });

        this.players = uniquePlayers;
        this.updateTurnOrder();
    }
}

// Member Management System
class MemberManager {
    constructor(turnSystem) {
        this.turnSystem = turnSystem;
        this.membersContainer = null;
        this.contextMenu = null;
    }

    // Initialize member manager
    initialize(containerId) {
        this.membersContainer = document.getElementById(containerId);
        this.createContextMenu();
    }

    // Create context menu for member removal
    createContextMenu() {
        this.contextMenu = document.createElement('div');
        this.contextMenu.className = 'fixed bg-gray-800 border border-gray-600 rounded-md shadow-lg z-50 hidden';
        this.contextMenu.style.minWidth = '250px';

        // Create stats section
        const statsSection = document.createElement('div');
        statsSection.id = 'context-stats-section';
        statsSection.className = 'p-3 border-b border-gray-600';

        const statsTitle = document.createElement('div');
        statsTitle.className = 'text-sm font-semibold text-indigo-400 mb-2';
        statsTitle.textContent = 'Character Stats';
        statsSection.appendChild(statsTitle);

        const statsContent = document.createElement('div');
        statsContent.id = 'context-stats-content';
        statsContent.className = 'text-sm';
        statsSection.appendChild(statsContent);

        this.contextMenu.appendChild(statsSection);

        // Create remove player section
        const removeSection = document.createElement('div');
        removeSection.id = 'context-remove-section';
        removeSection.className = 'p-2';
        removeSection.innerHTML = `
            <button id="remove-player-btn" class="text-red-400 hover:text-red-300 text-sm px-3 py-1 rounded hover:bg-gray-700 w-full text-left">
                ${this.turnSystem.languageManager.getText('removePlayerButton')}
            </button>
        `;
        this.contextMenu.appendChild(removeSection);

        document.body.appendChild(this.contextMenu);

        // Handle remove player action
        document.getElementById('remove-player-btn').addEventListener('click', () => {
            const playerName = this.contextMenu.dataset.playerName;

            // Show confirmation dialog
            if (confirm(`${this.turnSystem.languageManager.getText('confirmRemovePlayer', { name: playerName })}`)) {
                this.removePlayer(playerName);
            }

            this.hideContextMenu();
        });

        // Hide context menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.contextMenu.contains(e.target) && !e.target.closest('.member-item')) {
                this.hideContextMenu();
            }
        });
    }

    // Show context menu
    showContextMenu(e, playerName) {
        e.preventDefault();
        e.stopPropagation();

        this.contextMenu.style.left = e.pageX + 'px';
        this.contextMenu.style.top = e.pageY + 'px';
        this.contextMenu.dataset.playerName = playerName;

        // Update stats content
        const statsContent = document.getElementById('context-stats-content');
        if (statsContent && window.characterStatsManager) {
            statsContent.innerHTML = window.characterStatsManager.generateDetailedStatsHTML(playerName);
        }

        // Show/hide remove option based on whether it's the current player
        const removeSection = document.getElementById('context-remove-section');
        if (removeSection) {
            if (playerName === this.turnSystem.currentPlayerName) {
                removeSection.style.display = 'none';
            } else {
                removeSection.style.display = 'block';
            }
        }

        this.contextMenu.classList.remove('hidden');
    }

    // Hide context menu
    hideContextMenu() {
        this.contextMenu.classList.add('hidden');
    }

    // Update members display
    updateMembersDisplay() {
        if (!this.membersContainer) return;

        this.membersContainer.innerHTML = '';

        // Remove duplicates from players list
        const uniquePlayers = [...new Set(Object.values(this.turnSystem.players))];

        uniquePlayers.forEach(playerName => {
            const memberItem = document.createElement('div');
            memberItem.className = `member-item p-2 hover:bg-gray-700 rounded cursor-pointer ${playerName === this.turnSystem.currentTurn ? 'bg-indigo-600' : ''}`;

            const playerColor = this.getPlayerColor(playerName);
            const playerBgColor = this.getPlayerBgColor(playerName);

            // Get character stats if available
            let statsHTML = '';
            if (window.characterStatsManager) {
                statsHTML = window.characterStatsManager.generateShortStatsHTML(playerName);
            }

            memberItem.innerHTML = `
                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-2">
                        <div class="w-3 h-3 rounded-full ${playerBgColor}"></div>
                        <span class="text-sm ${playerColor}">${playerName}</span>
                        ${playerName === this.turnSystem.currentTurn ? '<span class="text-xs bg-yellow-500 text-black px-1 rounded">TURN</span>' : ''}
                    </div>
                    <div class="flex items-center space-x-1">
                        <span class="text-xs text-gray-400">${playerName === this.turnSystem.currentPlayerName ? '(You)' : ''}</span>
                        ${playerName !== this.turnSystem.currentPlayerName ? '<span class="text-xs text-gray-500">(Right-click for details)</span>' : ''}
                    </div>
                </div>
                ${statsHTML}
            `;

            // Add context menu for all players (for stats details)
            memberItem.addEventListener('contextmenu', (e) => {
                this.showContextMenu(e, playerName);
            });

            this.membersContainer.appendChild(memberItem);
        });
    }

    // Get player color class for text
    getPlayerColor(playerName) {
        const colors = [
            'text-red-400', 'text-blue-400', 'text-green-400', 'text-yellow-400',
            'text-purple-400', 'text-pink-400', 'text-indigo-400', 'text-emerald-400'
        ];
        const uniquePlayers = [...new Set(Object.values(this.turnSystem.players))];
        const index = uniquePlayers.indexOf(playerName);
        return colors[index % colors.length];
    }

    // Get player background color class for dots
    getPlayerBgColor(playerName) {
        const colors = [
            'bg-red-400', 'bg-blue-400', 'bg-green-400', 'bg-yellow-400',
            'bg-purple-400', 'bg-pink-400', 'bg-indigo-400', 'bg-emerald-400'
        ];
        const uniquePlayers = [...new Set(Object.values(this.turnSystem.players))];
        const index = uniquePlayers.indexOf(playerName);
        return colors[index % colors.length];
    }

    // Remove player from session
    async removePlayer(playerName) {
        this.turnSystem.removePlayer(playerName);
        this.updateMembersDisplay();

        // Re-render chat history with updated player highlighting
        if (window.reRenderChatHistory) {
            console.log('🔄 Re-rendering chat after player removal');
            setTimeout(() => {
                window.reRenderChatHistory();
            }, 50); // Small delay to ensure member list is updated
        }

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
}

// Input Mode Manager
class InputModeManager {
    constructor(turnSystem, languageManager) {
        this.turnSystem = turnSystem;
        this.languageManager = languageManager;
        this.currentMode = 'chat'; // 'chat' or 'prompt'
        this.manualModeSet = false; // Track if user manually set the mode
        this.inputElement = null;
        this.modeIndicator = null;
        this.sendButton = null;
    }

    // Initialize input mode manager
    initialize(inputId, modeIndicatorId, sendButtonId) {
        this.inputElement = document.getElementById(inputId);
        this.modeIndicator = document.getElementById(modeIndicatorId);
        this.sendButton = document.getElementById(sendButtonId);
        this.updateMode();
    }

    // Update input mode based on turn status (only if not manually set)
    updateMode() {
        // Only auto-update if user hasn't manually set the mode
        if (!this.manualModeSet) {
            console.log('Auto-updating mode:', {
                isMyTurn: this.turnSystem.isMyTurn,
                currentTurn: this.turnSystem.currentTurn,
                currentPlayerName: this.turnSystem.currentPlayerName,
                manualModeSet: this.manualModeSet
            });

            if (this.turnSystem.isMyTurn) {
                this.setMode('prompt');
            } else {
                this.setMode('chat');
            }
        } else {
            console.log('Skipping auto-update - manual mode set');
        }
    }

    // Set specific mode
    setMode(mode, isManual = false) {
        console.log('Setting mode:', { mode, isManual, previousMode: this.currentMode });
        this.currentMode = mode;
        if (isManual) {
            this.manualModeSet = true;
            console.log('Manual mode set to true');
        }
        this.updateUI();
    }

    // Update UI based on current mode
    updateUI() {
        if (this.currentMode === 'prompt') {
            this.modeIndicator.textContent = this.languageManager.getText('promptMode');
            this.modeIndicator.className = 'text-sm font-semibold text-green-400';
            this.inputElement.placeholder = this.languageManager.getText('promptPlaceholder');
            this.sendButton.textContent = this.languageManager.getText('sendActionButton');
            this.sendButton.className = 'bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-md transition duration-300 self-end';
        } else {
            this.modeIndicator.textContent = this.languageManager.getText('chatMode');
            this.modeIndicator.className = 'text-sm font-semibold text-blue-400';
            this.inputElement.placeholder = this.languageManager.getText('chatPlaceholder');
            this.sendButton.textContent = this.languageManager.getText('sendChatButton');
            this.sendButton.className = 'bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-md transition duration-300 self-end';
        }
    }

    // Get appropriate prompt based on mode
    getPrompt() {
        if (this.currentMode === 'prompt') {
            return this.turnSystem.getTurnPrompt();
        } else {
            return this.turnSystem.getChatPrompt();
        }
    }

    // Check if input should be sent to AI
    shouldSendToAI() {
        return this.currentMode === 'prompt';
    }

    // Reset manual mode flag (called when turn changes)
    resetManualMode() {
        this.manualModeSet = false;
    }
}

// Export classes for use in main application
window.TurnSystem = TurnSystem;
window.MemberManager = MemberManager;
window.InputModeManager = InputModeManager; 