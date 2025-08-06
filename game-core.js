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

// Debug configuration
const DEBUG_CONFIG = {
    PLAYER_DETECTION: true,
    STATS_GENERATION: true,
    SESSION_UPDATES: true
};

// Track stats requests to prevent duplicates
const statsRequestTracker = {
    pendingRequests: new Set(),
    completedRequests: new Set()
};

// Player colors array
const playerColors = [
    'player-red', 'player-blue', 'player-green', 'player-yellow',
    'player-purple', 'player-pink', 'player-indigo', 'player-emerald'
];
let playerColorMap = {};

// --- SERVER API FUNCTIONS ---
async function apiCall(endpoint, method = 'GET', data = null) {
    console.log(`🌐 HTTP ${method} ${endpoint}`, data ? `with data: ${JSON.stringify(data).substring(0, 200)}...` : '');

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
        console.error(`❌ HTTP ${method} ${endpoint} failed:`, result.error || 'API call failed');
        throw new Error(result.error || 'API call failed');
    }

    console.log(`✅ HTTP ${method} ${endpoint} successful`);
    return result;
}

async function callGemini(prompt, apiKey) {
    displayMessage({ text: languageManager.getText('gmThinking'), type: 'system' });

    try {
        console.log('🔍 DEBUG - Calling Gemini API with prompt length:', prompt.length);
        const result = await apiCall('/gemini', 'POST', {
            prompt,
            apiKey,
            chatHistory: chatHistory.map(({ role, parts }) => ({ role, parts }))
        });
        console.log('🔍 DEBUG - Gemini API result received:', result ? 'Yes' : 'No');

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
    // First check the UI selector value directly
    const languageSelector = document.getElementById('language-selector');
    if (languageSelector && languageSelector.value) {
        return languageSelector.value;
    }
    // Fallback to language manager
    return window.languageManager?.currentLanguage || 'en';
}

// Helper function to generate a prompt for asking Gemini about character stats
function generateCharacterStatsPrompt(characterName, characterDescription, campaignContext) {
    const language = getCurrentLanguage();
    const template = getPromptTemplate(language, 'characterStats');

    return `${template.title}

${lang.characterNameLabel} ${characterName}
${lang.characterDescriptionLabel} ${characterDescription}
${lang.campaignContextLabel} ${campaignContext}

${template.description}

${template.format}

Guidelines:
${template.guidelines.map(guideline => `- ${guideline}`).join('\n')}

${template.return}`;
}

// Helper function to generate a prompt for asking Gemini about campaign templates
function generateCampaignTemplatePrompt(campaignDescription) {
    const language = getCurrentLanguage();
    const lang = getCurrentLanguageSettings();

    return `${lang.campaignTemplateTitle || 'Please analyze this TRPG campaign setting and determine appropriate stat categories.'}

${lang.campaignSettingLabel} ${campaignDescription}

${lang.campaignTemplateDescription || 'I need you to provide stat categories in this exact JSON format:'}
{
  "template": "custom",
  "short": ["<primary_stat1>", "<primary_stat2>"],
  "detailed": ["<stat1>", "<stat2>", "<stat3>", "<stat4>", "<stat5>", "<stat6>", "<stat7>", "<stat8>"]
}

${lang.campaignTemplateGuidelines || 'Guidelines:'}
- ${lang.campaignTemplateShortGuideline || '"short" should contain 2-3 most important stats displayed below character names'}
- ${lang.campaignTemplateDetailedGuideline || '"detailed" should contain 6-10 stats shown in the detailed view'}
- ${lang.campaignTemplateAppropriateGuideline || 'Use appropriate stat names for the setting'}
- ${lang.campaignTemplateGenreGuideline || 'Consider the genre and theme'}

${lang.campaignTemplateReturn || 'Return ONLY the JSON object, no additional text.'}`;
}

// Function to batch request stats for multiple characters with consistent language
async function batchRequestCharacterStats(characterNames, apiKey) {
    if (!apiKey || !window.characterStatsManager) {
        console.warn('Cannot batch request stats: missing API key or stats manager');
        return;
    }

    // Check for pending or completed requests
    const requestKey = characterNames.sort().join(',');
    if (statsRequestTracker.pendingRequests.has(requestKey)) {
        if (DEBUG_CONFIG.STATS_GENERATION) {
            console.log('🔍 DEBUG - Stats request already pending for:', characterNames);
        }
        return;
    }

    if (statsRequestTracker.completedRequests.has(requestKey)) {
        if (DEBUG_CONFIG.STATS_GENERATION) {
            console.log('🔍 DEBUG - Stats already generated for:', characterNames);
        }
        return;
    }

    // Mark request as pending
    statsRequestTracker.pendingRequests.add(requestKey);
    console.log('🤖 Batch requesting stats for characters:', characterNames);

    try {
        // Generate a context based on the current session
        const context = window.currentSession?.starting_prompt || 'TRPG campaign';
        const language = getCurrentLanguage();

        console.log('🔍 Using current language:', language);

        // Request short stats first
        console.log('🤖 Requesting short stats for characters:', characterNames);
        const shortPrompt = generateBatchShortStatsPrompt(characterNames, context, language);
        console.log('🔍 DEBUG - Sending short stats prompt to Gemini:', shortPrompt);
        const shortResponse = await callGemini(shortPrompt, apiKey);
        console.log('🔍 DEBUG - Short stats response received:', shortResponse ? 'Yes' : 'No');

        // Request detailed stats second
        console.log('🤖 Requesting detailed stats for characters:', characterNames);
        const detailedPrompt = generateBatchDetailedStatsPrompt(characterNames, context, language);
        console.log('🔍 DEBUG - Sending detailed stats prompt to Gemini:', detailedPrompt);
        const detailedResponse = await callGemini(detailedPrompt, apiKey);
        console.log('🔍 DEBUG - Detailed stats response received:', detailedResponse ? 'Yes' : 'No');
        console.log('🔍 DEBUG - Detailed response content:', detailedResponse);
        console.log('🔍 DEBUG - Detailed response type:', typeof detailedResponse);
        console.log('🔍 DEBUG - Detailed response length:', detailedResponse ? detailedResponse.length : 'null');

        // Initialize stats objects
        let characterStats = {};
        let detailedStats = {};

        if (shortResponse) {
            try {
                // Parse short stats CSV response
                console.log('🔍 Parsing short stats CSV response');
                console.log('🔍 Raw short stats response:', shortResponse);


                const shortLines = shortResponse.trim().split('\n').filter(line => line.trim());
                console.log('🔍 Short stats CSV lines:', shortLines);

                if (shortLines.length < 2) {
                    throw new Error('Short stats CSV must have at least header and one data row');
                }

                // Process short stats
                characterStats = {};
                for (let i = 1; i < shortLines.length; i++) {
                    const line = shortLines[i].trim();
                    if (line) {
                        const parts = line.split('|').map(part => part.trim());
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

                console.log('🔍 Parsed short stats:', characterStats);
            } catch (error) {
                console.error('Error parsing short stats CSV response:', error);
                console.log('🔍 Problematic short stats response for debugging:', shortResponse);
            }
        }

        if (detailedResponse) {
            try {
                // Parse detailed stats CSV response
                console.log('🔍 Parsing detailed stats CSV response');
                console.log('🔍 Raw detailed stats response:', detailedResponse);
                console.log('🔍 Detailed response type:', typeof detailedResponse);
                console.log('🔍 Detailed response length:', detailedResponse.length);

                const detailedLines = detailedResponse.trim().split('\n').filter(line => line.trim());
                console.log('🔍 Detailed stats CSV lines:', detailedLines);

                if (detailedLines.length < 2) {
                    throw new Error('Detailed stats CSV must have at least header and one data row');
                }

                // Process detailed stats
                detailedStats = {};
                for (let i = 1; i < detailedLines.length; i++) {
                    const line = detailedLines[i].trim();
                    if (line) {
                        const parts = line.split('|').map(part => part.trim());
                        if (parts.length >= 4) {
                            const character = parts[0];
                            const statName = parts[1];
                            const value = parts[2];
                            const description = parts[3];

                            if (character && statName && value) {
                                if (!detailedStats[character]) {
                                    detailedStats[character] = {};
                                }
                                detailedStats[character][statName] = {
                                    value: value,
                                    description: description || ''
                                };
                            }
                        }
                    }
                }

                console.log('🔍 Parsed detailed stats:', detailedStats);
            } catch (error) {
                console.error('Error parsing detailed stats CSV response:', error);
                console.log('🔍 Problematic detailed stats response for debugging:', detailedResponse);
            }
        }

        // Process stats for each character
        for (const characterName of characterNames) {
            // Find the best matching character name from the parsed stats
            let matchedCharacterKey = characterName;
            for (const key of Object.keys(characterStats || {})) {
                if (key === characterName || key.includes(characterName) || characterName.includes(key.split(' ')[0])) {
                    matchedCharacterKey = key;
                    console.log('🔍 Matched character name:', characterName, '->', matchedCharacterKey);
                    break;
                }
            }

            // Process short stats
            if (characterStats && characterStats[matchedCharacterKey] && Object.keys(characterStats[matchedCharacterKey]).length > 0) {
                // Convert short stats back to CSV format for the command
                const csvLines = ['character,stat_name,value'];
                for (const [statName, value] of Object.entries(characterStats[matchedCharacterKey])) {
                    csvLines.push(`${characterName},${statName},${value}`);
                }
                const csvData = csvLines.join('\n');

                // Process the short stats command using CSV format
                const command = `\${GeminiStats=${csvData}}`;
                if (window.turnSystem) {
                    // Force the template to custom BEFORE processing commands
                    if (window.characterStatsManager) {
                        console.log('🔍 Setting template to custom before processing short stats');
                        window.characterStatsManager.currentTemplate = 'custom';
                    }

                    const updates = window.turnSystem.processCommands(command);
                    console.log('✅ Batch-generated short stats for', characterName, ':', updates);
                }
            }

            // Process detailed stats
            if (detailedStats && detailedStats[matchedCharacterKey] && Object.keys(detailedStats[matchedCharacterKey]).length > 0) {
                // Store detailed stats directly in the character stats manager
                if (window.characterStatsManager) {
                    window.characterStatsManager.detailedStats[characterName] = detailedStats[matchedCharacterKey];
                    console.log('✅ Stored detailed stats for', characterName, ':', detailedStats[matchedCharacterKey]);
                }
            }
        }

        // Update the session with both short and detailed stats
        if (window.turnSystem && window.characterStatsManager) {
            const sessionData = window.turnSystem.getSessionData();
            if (DEBUG_CONFIG.SESSION_UPDATES) {
                console.log('🔍 DEBUG - Full session data with detailed stats:', sessionData);
            }
            await updateSession(window.currentSessionId, sessionData);

            // Force refresh the character stats manager
            if (window.characterStatsManager) {
                if (DEBUG_CONFIG.SESSION_UPDATES) {
                    console.log('🔍 DEBUG - Refreshing character stats manager with detailed stats');
                }
                window.characterStatsManager.initialize(sessionData);
            }
        }

        // Update the member display after all stats are processed
        if (window.turnSystem && window.turnSystem.memberManager) {
            console.log('🔄 Updating member display after batch stats processed');
            window.turnSystem.memberManager.updateMembersDisplay();
        }

        // Mark request as completed
        statsRequestTracker.pendingRequests.delete(requestKey);
        statsRequestTracker.completedRequests.add(requestKey);

    } catch (error) {
        console.error('Error batch requesting stats:', error);
        // Remove from pending on error
        statsRequestTracker.pendingRequests.delete(requestKey);
    }
}

// Helper function to generate a batch prompt for short stats
function generateBatchShortStatsPrompt(characterNames, campaignContext, language) {
    const template = getPromptTemplate(language, 'batchStats');

    // Generate character list for the format
    const characterList = characterNames.map(name =>
        `${name},<stat_name_1>,<value_1>\n${name},<stat_name_2>,<value_2>\n${name},<stat_name_3>,<value_3}\n${name},<stat_name_4>,<value_4>\n${name},<stat_name_5>,<value_5>`
    ).join('\n');

    return `${template.title}

Characters: ${characterNames.join(', ')}
Campaign Context: ${campaignContext}
Language: ${language}

${template.description}

${template.format.replace('{characterList}', characterList)}

Guidelines:
${template.guidelines.map(guideline => `- ${guideline}`).join('\n')}

${template.return}`;
}

// Helper function to generate a batch prompt for detailed stats
function generateBatchDetailedStatsPrompt(characterNames, campaignContext, language) {
    const template = getPromptTemplate(language, 'detailedStats');

    // Generate character list for the format
    const characterList = characterNames.map(name =>
        `${name},<stat_name_1>,<value_1>,<description_1>\n${name},<stat_name_2>,<value_2>,<description_2>\n${name},<stat_name_3>,<value_3>,<description_3>\n${name},<stat_name_4>,<value_4>,<description_4>\n${name},<stat_name_5>,<value_5>,<description_5>\n${name},<stat_name_6>,<value_6>,<description_6>\n${name},<stat_name_7>,<value_7>,<description_7>\n${name},<stat_name_8>,<value_8>,<description_8>`
    ).join('\n');

    return `${template.title}

Characters: ${characterNames.join(', ')}
Campaign Context: ${campaignContext}
Language: ${language}

${template.description}

${template.format.replace('{characterList}', characterList)}

Guidelines:
${template.guidelines.map(guideline => `- ${guideline}`).join('\n')}

${template.return}`;
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
        console.log('🔄 Polling session:', window.currentSession.id);
        const session = await getSession(window.currentSession.id);
        if (session) {
            const newChatHistory = session.chat_history || [];

            // Check if turnSystem exists before accessing its properties
            const currentTurn = turnSystem ? turnSystem.currentTurn : null;
            const currentPlayers = turnSystem ? turnSystem.players : {};
            const currentCharacterStats = window.characterStatsManager ? window.characterStatsManager.characterStats : {};

            const sessionChanged = session.chat_history !== window.chatHistory ||
                session.current_turn !== currentTurn ||
                JSON.stringify(session.players) !== JSON.stringify(currentPlayers) ||
                JSON.stringify(session.character_stats) !== JSON.stringify(currentCharacterStats);

            if (sessionChanged) {
                console.log('📡 Poll detected changes:', {
                    sessionId: window.currentSession.id,
                    chatHistoryChanged: session.chat_history !== window.chatHistory,
                    turnChanged: session.current_turn !== currentTurn,
                    playersChanged: JSON.stringify(session.players) !== JSON.stringify(currentPlayers),
                    characterStatsChanged: JSON.stringify(session.character_stats) !== JSON.stringify(currentCharacterStats),
                    sessionCharacterStats: session.character_stats,
                    currentCharacterStats: currentCharacterStats,
                    sessionChanged: sessionChanged,
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
                        console.log('🔍 DEBUG - Updating member display after session change');
                        memberManager.updateMembersDisplay();
                    } else {
                        console.log('🔍 DEBUG - memberManager not available for update');
                    }

                    // Re-render chat history with updated player highlighting
                    const previousPlayers = turnSystem.players ? Object.values(turnSystem.players) : [];
                    const currentPlayers = session.players ? Object.values(session.players) : [];
                    const playersChanged = JSON.stringify(previousPlayers.sort()) !== JSON.stringify(currentPlayers.sort());

                    // Detect new characters for auto-stats
                    const newCharacters = currentPlayers.filter(name => !previousPlayers.includes(name));

                    // Detect characters without stats
                    const charactersWithoutStats = currentPlayers.filter(name => {
                        const characterStats = window.characterStatsManager?.characterStats[name] || {};
                        return Object.keys(characterStats).length === 0;
                    });

                    // Check if we already have stats for these characters
                    const charactersWithoutStatsFiltered = charactersWithoutStats.filter(name => {
                        const requestKey = [name].sort().join(',');
                        return !statsRequestTracker.completedRequests.has(requestKey);
                    });

                    if (DEBUG_CONFIG.PLAYER_DETECTION) {
                        console.log('🔍 DEBUG - Player detection analysis:', {
                            previousPlayers,
                            currentPlayers,
                            newCharacters,
                            charactersWithoutStats,
                            charactersWithoutStatsFiltered,
                            playersChanged,
                            previousPlayersLength: previousPlayers.length,
                            currentPlayersLength: currentPlayers.length,
                            newCharactersLength: newCharacters.length,
                            charactersWithoutStatsLength: charactersWithoutStats.length,
                            charactersWithoutStatsFilteredLength: charactersWithoutStatsFiltered.length
                        });
                    }

                    // Generate stats for new characters OR characters without stats
                    const charactersNeedingStats = [...new Set([...newCharacters, ...charactersWithoutStatsFiltered])];

                    if (charactersNeedingStats.length > 0) {
                        console.log('🆕 Characters needing stats:', charactersNeedingStats);

                        // Auto-request stats for characters
                        const apiKey = session.gemini_api_key;
                        if (apiKey) {
                            if (DEBUG_CONFIG.STATS_GENERATION) {
                                console.log('🔍 DEBUG - Starting batch stats request for:', charactersNeedingStats);
                            }
                            // Run batch request in background to avoid blocking polling
                            batchRequestCharacterStats(charactersNeedingStats, apiKey).catch(error => {
                                console.error('Error in batch request stats:', error);
                            });
                        } else {
                            if (DEBUG_CONFIG.STATS_GENERATION) {
                                console.log('🔍 DEBUG - No API key available for stats request');
                            }
                        }
                    } else {
                        if (DEBUG_CONFIG.PLAYER_DETECTION) {
                            console.log('🔍 DEBUG - No characters need stats');
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
    console.log('📝 Chat history content:', window.chatHistory);

    // Clear existing chat
    const chatLog = document.getElementById('chat-log');
    if (chatLog) {
        chatLog.innerHTML = '';
    }

    // Display all messages in chat history
    if (window.chatHistory && window.chatHistory.length > 0) {
        window.chatHistory.forEach((msg, index) => {
            console.log(`📝 Displaying message ${index}:`, msg);
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