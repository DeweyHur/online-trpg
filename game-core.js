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
let characterStatsManager = null;

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

// Function to ask Gemini to determine character stats
async function askGeminiForCharacterStats(characterName, context = '', apiKey) {
    if (!window.characterStatsManager) {
        console.error('Character stats manager not initialized');
        return null;
    }

    const prompt = window.characterStatsManager.generateStatsPrompt(characterName, context);
    const response = await callGemini(prompt, apiKey);

    if (response) {
        try {
            // Try to extract JSON from the response
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const statsData = JSON.parse(jsonMatch[0]);

                // Validate the response format
                if (statsData.character && statsData.stats && typeof statsData.stats === 'object') {
                    return `\${GeminiStats=${JSON.stringify(statsData)}}`;
                } else {
                    console.warn('Gemini returned invalid stats format:', statsData);
                    // Return a retry prompt
                    return `Gemini didn't return the right format. Please try again with this exact prompt:

${prompt}

The response should be a JSON object with "character" and "stats" fields.`;
                }
            } else {
                console.warn('No JSON found in Gemini response:', response);
                // Return a retry prompt
                return `Gemini didn't return valid JSON. Please try again with this exact prompt:

${prompt}

The response should be ONLY a JSON object, no additional text.`;
            }
        } catch (error) {
            console.error('Error parsing Gemini stats response:', error);
            // Return a retry prompt
            return `Error parsing Gemini response. Please try again with this exact prompt:

${prompt}

The response should be valid JSON format.`;
        }
    }

    return null;
}

// Function to ask Gemini to determine stat template
async function askGeminiForStatTemplate(context = '', apiKey) {
    if (!window.characterStatsManager) {
        console.error('Character stats manager not initialized');
        return null;
    }

    const prompt = window.characterStatsManager.generateTemplatePrompt(context);
    const response = await callGemini(prompt, apiKey);

    if (response) {
        try {
            // Try to extract JSON from the response
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const templateData = JSON.parse(jsonMatch[0]);

                // Validate the response format
                if (templateData.template && templateData.short && templateData.detailed) {
                    return `\${GeminiTemplate=${JSON.stringify(templateData)}}`;
                } else {
                    console.warn('Gemini returned invalid template format:', templateData);
                    // Return a retry prompt
                    return `Gemini didn't return the right template format. Please try again with this exact prompt:

${prompt}

The response should be a JSON object with "template", "short", and "detailed" fields.`;
                }
            } else {
                console.warn('No JSON found in Gemini template response:', response);
                // Return a retry prompt
                return `Gemini didn't return valid JSON for template. Please try again with this exact prompt:

${prompt}

The response should be ONLY a JSON object, no additional text.`;
            }
        } catch (error) {
            console.error('Error parsing Gemini template response:', error);
            // Return a retry prompt
            return `Error parsing Gemini template response. Please try again with this exact prompt:

${prompt}

The response should be valid JSON format.`;
        }
    }

    return null;
}

// Function to automatically request stats for new characters
async function autoRequestCharacterStats(newCharacters, apiKey) {
    if (!apiKey || !window.characterStatsManager) {
        console.warn('Cannot auto-request stats: missing API key or stats manager');
        return;
    }

    console.log('🤖 Auto-requesting stats for new characters:', newCharacters);

    for (const characterName of newCharacters) {
        try {
            // Generate a context based on the character name and current session
            const context = window.currentSession?.starting_prompt || 'TRPG campaign';

            // Create a basic character description based on the name
            const characterDescription = `Character named ${characterName} in the current campaign`;

            const prompt = generateCharacterStatsPrompt(characterName, characterDescription, context);
            const response = await callGemini(prompt, apiKey);

            // Debug logging
            console.log('🔍 DEBUG - Gemini Response for', characterName, ':');
            console.log('Response length:', response?.length || 0);
            console.log('Full response:', response);
            console.log('Response ends with "}":', response?.trim().endsWith('}'));
            console.log('Response contains "character":', response?.includes('"character"'));
            console.log('Response contains "stats":', response?.includes('"stats"'));

            if (response) {
                try {
                    // Parse CSV response from Gemini
                    console.log('🔍 Parsing CSV response for', characterName);
                    console.log('🔍 Raw response:', response);

                    const lines = response.trim().split('\n').filter(line => line.trim());
                    console.log('🔍 CSV lines:', lines);

                    if (lines.length < 2) {
                        throw new Error('CSV must have at least header and one data row');
                    }

                    // Skip header row and parse data rows
                    const stats = {};
                    for (let i = 1; i < lines.length; i++) {
                        const line = lines[i].trim();
                        if (line) {
                            const parts = line.split(',').map(part => part.trim());
                            if (parts.length >= 3) {
                                const [character, statName, value] = parts;
                                if (character && statName && value) {
                                    stats[statName] = value;
                                }
                            }
                        }
                    }

                    console.log('🔍 Parsed stats:', stats);

                    if (Object.keys(stats).length > 0) {
                        // Convert stats back to CSV format for the command
                        const csvLines = ['character,stat_name,value'];
                        for (const [statName, value] of Object.entries(stats)) {
                            csvLines.push(`${characterName},${statName},${value}`);
                        }
                        const csvData = csvLines.join('\n');

                        // Process the stats command using CSV format
                        const command = `\${GeminiStats=${csvData}}`;
                        if (window.turnSystem) {
                            // Force the template to custom BEFORE processing commands
                            if (window.characterStatsManager) {
                                console.log('🔍 Setting template to custom before processing');
                                window.characterStatsManager.currentTemplate = 'custom';
                            }

                            const updates = window.turnSystem.processCommands(command);
                            console.log('✅ Auto-generated stats for', characterName, ':', updates);

                            // Update the session with the new stats
                            if (Object.keys(updates).length > 0) {
                                await updateSession(window.currentSessionId, {
                                    ...window.turnSystem.getSessionData()
                                });
                            }
                        }
                    } else {
                        throw new Error('No valid stats found in CSV');
                    }
                } catch (error) {
                    console.error('Error parsing Gemini CSV response for', characterName, ':', error);
                    console.log('🔍 Problematic response for debugging:', response);
                }
            }

            // Add a small delay between requests to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
            console.error('Error auto-requesting stats for', characterName, ':', error);
        }
    }

    // Update the member display after all stats are processed
    if (window.turnSystem && window.turnSystem.memberManager) {
        console.log('🔄 Updating member display after all stats processed');
        window.turnSystem.memberManager.updateMembersDisplay();
    }
}

// Function to request stats for existing characters that don't have stats
async function requestStatsForExistingCharacters(apiKey) {
    if (!apiKey || !window.characterStatsManager || !window.currentSession) {
        console.warn('Cannot request stats for existing characters: missing required data');
        return;
    }

    const allCharacters = Object.values(window.currentSession.players || {});
    const charactersWithStats = Object.keys(window.characterStatsManager.characterStats || {});
    const charactersWithoutStats = allCharacters.filter(name => !charactersWithStats.includes(name));

    if (charactersWithoutStats.length > 0) {
        console.log('🤖 Requesting stats for existing characters without stats:', charactersWithoutStats);
        await batchRequestCharacterStats(charactersWithoutStats, apiKey);
    } else {
        console.log('✅ All characters already have stats');
        // Force template to custom if we have custom stats
        if (charactersWithStats.length > 0) {
            window.characterStatsManager.currentTemplate = 'custom';

            // Update the member display to show the stats
            if (window.turnSystem && window.turnSystem.memberManager) {
                window.turnSystem.memberManager.updateMembersDisplay();
            }
        }
    }
}

// Helper function to get current language from language manager
function getCurrentLanguage() {
    return window.languageManager?.currentLanguage || 'en';
}

// Helper function to generate a prompt for asking Gemini about character stats
function generateCharacterStatsPrompt(characterName, characterDescription, campaignContext) {
    return `I need you to determine appropriate character stats for a TRPG character.

Character Name: ${characterName}
Character Description: ${characterDescription}
Campaign Context: ${campaignContext}

Please provide stats in the following CSV format:
character,stat_name,value
${characterName},<stat_name_1>,<value_1>
${characterName},<stat_name_2>,<value_2>
${characterName},<stat_name_3>,<value_3>
${characterName},<stat_name_4>,<value_4>
${characterName},<stat_name_5>,<value_5>

Guidelines:
- Create 3-8 stats that are appropriate for this character and campaign setting
- Use descriptive stat names that fit the genre and theme
- Values can be numbers, percentages, or descriptive text
- Stats should reflect the character's abilities, condition, or state
- Include the header row: character,stat_name,value

Return ONLY the CSV data, no additional text.`;
}

// Helper function to generate a prompt for asking Gemini about campaign templates
function generateCampaignTemplatePrompt(campaignDescription) {
    return `Please analyze this TRPG campaign setting and determine appropriate stat categories.

Campaign Setting: ${campaignDescription}

I need you to provide stat categories in this exact JSON format:
{
  "template": "custom",
  "short": ["<primary_stat1>", "<primary_stat2>"],
  "detailed": ["<stat1>", "<stat2>", "<stat3>", "<stat4>", "<stat5>", "<stat6>", "<stat7>", "<stat8>"]
}

Guidelines:
- "short" should contain 2-3 most important stats displayed below character names
- "detailed" should contain 6-10 stats shown in the detailed view
- Use appropriate stat names for the setting
- Consider the genre and theme

Return ONLY the JSON object, no additional text.`;
}

// Function to batch request stats for multiple characters with consistent language
async function batchRequestCharacterStats(characterNames, apiKey) {
    if (!apiKey || !window.characterStatsManager) {
        console.warn('Cannot batch request stats: missing API key or stats manager');
        return;
    }

    console.log('🤖 Batch requesting stats for characters:', characterNames);

    try {
        // Generate a context based on the current session
        const context = window.currentSession?.starting_prompt || 'TRPG campaign';
        const language = getCurrentLanguage();

        console.log('🔍 Using current language:', language);

        // Create a batch prompt for all characters
        const prompt = generateBatchStatsPrompt(characterNames, context, language);
        const response = await callGemini(prompt, apiKey);

        if (response) {
            try {
                // Parse CSV response from Gemini
                console.log('🔍 Parsing batch CSV response');
                console.log('🔍 Raw response:', response);

                const lines = response.trim().split('\n').filter(line => line.trim());
                console.log('🔍 CSV lines:', lines);

                if (lines.length < 2) {
                    throw new Error('CSV must have at least header and one data row');
                }

                // Process all characters from the batch response
                const characterStats = {};
                for (let i = 1; i < lines.length; i++) {
                    const line = lines[i].trim();
                    if (line) {
                        const parts = line.split(',').map(part => part.trim());
                        if (parts.length >= 3) {
                            const [character, statName, value] = parts;
                            if (character && statName && value) {
                                if (!characterStats[character]) {
                                    characterStats[character] = {};
                                }
                                characterStats[character][statName] = value;
                            }
                        }
                    }
                }

                console.log('🔍 Parsed batch stats:', characterStats);

                // Process stats for each character
                for (const characterName of characterNames) {
                    if (characterStats[characterName] && Object.keys(characterStats[characterName]).length > 0) {
                        // Convert stats back to CSV format for the command
                        const csvLines = ['character,stat_name,value'];
                        for (const [statName, value] of Object.entries(characterStats[characterName])) {
                            csvLines.push(`${characterName},${statName},${value}`);
                        }
                        const csvData = csvLines.join('\n');

                        // Process the stats command using CSV format
                        const command = `\${GeminiStats=${csvData}}`;
                        if (window.turnSystem) {
                            // Force the template to custom BEFORE processing commands
                            if (window.characterStatsManager) {
                                console.log('🔍 Setting template to custom before processing');
                                window.characterStatsManager.currentTemplate = 'custom';
                            }

                            const updates = window.turnSystem.processCommands(command);
                            console.log('✅ Batch-generated stats for', characterName, ':', updates);

                            // Update the session with the new stats
                            if (Object.keys(updates).length > 0) {
                                await updateSession(window.currentSessionId, {
                                    ...window.turnSystem.getSessionData()
                                });
                            }
                        }
                    }
                }

                // Update the member display after all stats are processed
                if (window.turnSystem && window.turnSystem.memberManager) {
                    console.log('🔄 Updating member display after batch stats processed');
                    window.turnSystem.memberManager.updateMembersDisplay();
                }

            } catch (error) {
                console.error('Error parsing batch Gemini CSV response:', error);
                console.log('🔍 Problematic response for debugging:', response);
            }
        }

    } catch (error) {
        console.error('Error batch requesting stats:', error);
    }
}

// Helper function to generate a batch prompt for multiple characters
function generateBatchStatsPrompt(characterNames, campaignContext, language) {
    const languageInstructions = {
        'ko': '모든 스탯 이름과 값을 한국어로 작성해주세요. 일관된 한국어 스타일을 유지해주세요.',
        'ja': 'すべてのステータス名と値を日本語で記述してください。一貫した日本語スタイルを維持してください。',
        'en': 'Please write all stat names and values in English. Maintain consistent English style.'
    };

    const instruction = languageInstructions[language] || languageInstructions['en'];

    return `I need you to determine appropriate character stats for multiple TRPG characters with consistent language and style.

Characters: ${characterNames.join(', ')}
Campaign Context: ${campaignContext}
Language: ${language}

${instruction}

Please provide stats for ALL characters in the following CSV format:
character,stat_name,value
${characterNames.map(name => `${name},<stat_name_1>,<value_1>`).join('\n')}
${characterNames.map(name => `${name},<stat_name_2>,<value_2>`).join('\n')}
${characterNames.map(name => `${name},<stat_name_3>,<value_3>`).join('\n')}
${characterNames.map(name => `${name},<stat_name_4>,<value_4>`).join('\n')}
${characterNames.map(name => `${name},<stat_name_5>,<value_5>`).join('\n')}

Guidelines:
- Create 3-8 stats that are appropriate for this campaign setting
- Use consistent stat names across all characters
- Use consistent language (${language}) for all stat names and values
- Use emojis for stat names to make them more visual and compact
- Use 2/5 style ratings (like "3/5", "4/5", "2/5") for values to keep them short
- Stats should reflect each character's unique abilities and role
- Include the header row: character,stat_name,value

Examples of emoji stat names:
- 💪 for Strength/힘/力
- 🧠 for Intelligence/지능/知能
- ⚡ for Agility/민첩/敏捷
- 🛡️ for Defense/방어/防御
- 🔥 for Fire/화염/炎
- ❄️ for Ice/얼음/氷
- 🌟 for Magic/마법/魔法
- 🎯 for Accuracy/정확도/命中

Return ONLY the CSV data, no additional text.`;
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

    // Initialize character stats manager
    characterStatsManager = new CharacterStatsManager();
    window.characterStatsManager = characterStatsManager;
    turnSystem.memberManager = memberManager; // Attach memberManager to turnSystem
    inputModeManager = new InputModeManager(turnSystem, languageManager);

    // Add event listener for stats request button
    const requestStatsBtn = document.getElementById('request-stats-btn');
    if (requestStatsBtn) {
        requestStatsBtn.addEventListener('click', async () => {
            if (window.currentSession?.gemini_api_key) {
                requestStatsBtn.disabled = true;
                requestStatsBtn.textContent = '🤖 Requesting...';

                try {
                    await requestStatsForExistingCharacters(window.currentSession.gemini_api_key);
                    requestStatsBtn.textContent = '✅ Stats Requested';
                    setTimeout(() => {
                        requestStatsBtn.textContent = '🤖 Request Stats for All Characters';
                        requestStatsBtn.disabled = false;
                    }, 3000);
                } catch (error) {
                    console.error('Error requesting stats:', error);
                    requestStatsBtn.textContent = '❌ Error - Try Again';
                    setTimeout(() => {
                        requestStatsBtn.textContent = '🤖 Request Stats for All Characters';
                        requestStatsBtn.disabled = false;
                    }, 3000);
                }
            } else {
                console.warn('No Gemini API key available for stats request');
            }
        });
    }
    window.inputModeManager = inputModeManager; // Make global for access from app-init.js

    memberManager.initialize('members-list');
    inputModeManager.initialize('player-action', 'input-mode-indicator', 'send-action-btn');

    // Display initial chat history if available
    if (window.chatHistory && window.chatHistory.length > 0) {
        displayInitialChatHistory();
    }
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
                // console.log('📡 Poll detected changes:', {
                //     sessionId: window.currentSession.id,
                //     chatHistoryChanged: session.chat_history !== window.chatHistory,
                //     turnChanged: session.current_turn !== currentTurn,
                //     playersChanged: JSON.stringify(session.players) !== JSON.stringify(currentPlayers),
                //     timestamp: new Date().toISOString()
                // });
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

                    // Detect new characters for auto-stats
                    const newCharacters = currentPlayers.filter(name => !previousPlayers.includes(name));

                    if (newCharacters.length > 0) {
                        console.log('🆕 New characters detected:', newCharacters);

                        // Auto-request stats for new characters
                        const apiKey = session.gemini_api_key;
                        if (apiKey) {
                            // Run batch request in background to avoid blocking polling
                            batchRequestCharacterStats(newCharacters, apiKey).catch(error => {
                                console.error('Error in batch request stats:', error);
                            });
                        }
                    }

                    if (playersChanged && session.players && Object.keys(session.players).length > 0) {
                        // console.log('🔄 Re-rendering chat after player list change:', {
                        //     previous: previousPlayers,
                        //     current: currentPlayers
                        // });
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
                        // console.log('📡 Processing new messages:', newMessages.length);

                        for (const msg of newMessages) {
                            // console.log('📡 Processing message:', msg);
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
                    } else {
                        // console.log('📡 No new messages to display');
                    }
                } else {
                    console.log('⚠️ Turn system not initialized, skipping turn-related updates');

                    // Still update chat history even if turn system isn't ready
                    if (newChatHistory.length > window.chatHistory.length) {
                        const newMessages = newChatHistory.slice(window.chatHistory.length);
                        console.log('📡 Processing new messages (fallback):', newMessages.length);

                        for (const msg of newMessages) {
                            console.log('📡 Processing message (fallback):', msg);
                            displayMessage({
                                text: msg.parts[0].text,
                                type: msg.role === 'model' ? 'gm' : 'player',
                                author: msg.author || (msg.role === 'model' ? 'GM' : 'Player')
                            });
                        }
                    } else {
                        console.log('📡 No new messages to display (fallback)');
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

    // Initialize character stats manager with session data
    if (characterStatsManager) {
        characterStatsManager.initialize(session);
    }
}

function displayInitialChatHistory() {
    console.log('📝 Displaying initial chat history:', window.chatHistory.length, 'messages');

    // Clear existing chat
    const chatLog = document.getElementById('chat-log');
    if (chatLog) {
        chatLog.innerHTML = '';
    }

    // Display all messages in chat history
    if (window.chatHistory && window.chatHistory.length > 0) {
        window.chatHistory.forEach(msg => {
            displayMessage({
                text: msg.parts[0].text,
                type: msg.role === 'model' ? 'gm' : 'player',
                author: msg.author || (msg.role === 'model' ? 'GM' : 'Player')
            });
        });
        console.log('📝 Initial chat history displayed successfully');

        // Scroll to bottom after displaying all messages
        chatLog.scrollTop = chatLog.scrollHeight;
    } else {
        console.log('📝 No initial chat history to display');
    }
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