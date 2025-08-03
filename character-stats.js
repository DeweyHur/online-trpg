// Character Stats System for TRPG

// Helper function to get prompt template from language files
function getPromptTemplate(language, type) {
    const languageMap = {
        'en': window.LANGUAGES_EN,
        'ko': window.LANGUAGES_KO,
        'ja': window.LANGUAGES_JA
    };

    const lang = languageMap[language] || languageMap['en'];
    return lang.promptTemplates?.[type] || lang.promptTemplates?.characterStats;
}

// Helper function to get current language settings
function getCurrentLanguageSettings() {
    const language = window.languageManager?.currentLanguage || 'en';
    const languageMap = {
        'en': window.LANGUAGES_EN,
        'ko': window.LANGUAGES_KO,
        'ja': window.LANGUAGES_JA
    };
    return languageMap[language] || languageMap['en'];
}

class CharacterStatsManager {
    constructor() {
        this.characterStats = {};
    }

    // Initialize with session data
    initialize(sessionData) {
        console.log('🔍 DEBUG - CharacterStatsManager.initialize called with:', sessionData);
        this.characterStats = sessionData.character_stats || {};
        console.log('🔍 DEBUG - CharacterStatsManager.characterStats after initialization:', this.characterStats);
    }

    // Generate prompt for Gemini to determine character stats
    generateStatsPrompt(characterName, context = '') {
        const language = window.languageManager?.currentLanguage || 'en';
        const template = getPromptTemplate(language, 'characterStats');

        return `${template.title}

Character Name: ${characterName}
Context: ${context || 'General TRPG setting'}

${template.description}

${template.format}

Guidelines:
${template.guidelines.map(guideline => `- ${guideline}`).join('\n')}

${template.return}.`;
    }





    // Parse Gemini-generated stats commands
    parseGeminiStatsCommands(text) {
        // Find all GeminiStats commands and extract CSV data
        const geminiPattern = /\$\{GeminiStats=([^}]*)\}/g;
        const commands = [];
        let match;

        console.log('🔍 DEBUG - Parsing Gemini stats commands from text:', text);

        while ((match = geminiPattern.exec(text)) !== null) {
            console.log('🔍 Found GeminiStats command:', match[0]);
            console.log('🔍 Raw CSV part:', match[1]);
            console.log('🔍 Raw CSV length:', match[1].length);

            try {
                const csvData = match[1].trim();
                console.log('🔍 CSV data to parse:', csvData);

                // Parse CSV data
                const lines = csvData.split('\n').filter(line => line.trim());
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
                    // Get character name from the CSV
                    const csvCharacterName = lines[1].split(',')[0].trim();

                    const command = {
                        type: 'gemini_stats',
                        data: {
                            character: csvCharacterName,
                            stats: stats
                        }
                    };
                    commands.push(command);
                    console.log('✅ Successfully parsed CSV stats data');
                    console.log('🔍 Created command:', command);
                    console.log('🔍 Character name from CSV:', csvCharacterName);
                    console.log('🔍 Stats for character:', stats);
                } else {
                    throw new Error('No valid stats found in CSV');
                }
            } catch (error) {
                console.error('Error parsing Gemini stats command:', error);
                console.log('🔍 Problematic CSV string:', match[1]);
                console.log('🔍 CSV string length:', match[1].length);
            }
        }

        return commands;
    }



    // Process all character-related commands
    processCommands(text) {
        console.log('🔍 DEBUG - processCommands called with text:', text);
        const geminiStatsCommands = this.parseGeminiStatsCommands(text);
        console.log('🔍 DEBUG - Found geminiStatsCommands:', geminiStatsCommands);
        const updates = {};

        // Helper function to find the best matching character name
        const findBestCharacterMatch = (csvName) => {
            // Get all character names from the current session
            const sessionCharacters = window.currentSession?.players ? Object.values(window.currentSession.players) : [];

            // Try exact match first
            if (sessionCharacters.includes(csvName)) {
                return csvName;
            }

            // Try fuzzy matching for slight variations
            for (const sessionChar of sessionCharacters) {
                if (sessionChar.includes(csvName) || csvName.includes(sessionChar)) {
                    console.log('🔍 Character name matched:', csvName, '->', sessionChar);
                    return sessionChar;
                }
            }

            // If no match found, use the CSV name as-is
            console.log('🔍 No character name match found, using CSV name:', csvName);
            return csvName;
        };

        // Process Gemini-generated stats commands (CSV format only)
        geminiStatsCommands.forEach(cmd => {
            console.log('🔍 Processing Gemini stats command:', cmd);
            if (cmd.data.character && cmd.data.stats) {
                // Find the best matching character name
                const matchedCharacterName = findBestCharacterMatch(cmd.data.character);

                console.log('🔍 Before update - characterStats:', this.characterStats);
                this.characterStats[matchedCharacterName] = {
                    ...this.characterStats[matchedCharacterName],
                    ...cmd.data.stats
                };
                console.log('🔍 After update - characterStats:', this.characterStats);
                updates.characterStats = this.characterStats;
                console.log('🔍 Updates object:', updates);
            } else {
                console.log('🔍 Invalid Gemini stats command:', cmd);
            }
        });

        console.log('🔍 DEBUG - processCommands returning updates:', updates);
        return updates;
    }

    // Get character stats for a specific character
    getCharacterStats(characterName) {
        return this.characterStats[characterName] || {};
    }

    // Get short stats for display below member name
    getShortStats(characterName) {
        const stats = this.getCharacterStats(characterName);
        const lang = getCurrentLanguageSettings();
        const shortStatsCount = lang.shortStatsCount || 3;

        console.log('🔍 DEBUG - getShortStats for:', characterName);
        console.log('🔍 DEBUG - stats from getCharacterStats:', stats);
        console.log('🔍 DEBUG - all characterStats:', this.characterStats);

        // Show first N stats based on language setting
        const statNames = Object.keys(stats);
        const shortStatNames = statNames.slice(0, shortStatsCount);

        const result = shortStatNames.map(statName => ({
            name: statName,
            value: stats[statName] || '?'
        }));

        console.log('🔍 DEBUG - getShortStats result:', result);
        return result;
    }



    // Update character stats
    updateCharacterStats(characterName, newStats) {
        this.characterStats[characterName] = {
            ...this.characterStats[characterName],
            ...newStats
        };
    }



    // Get session data for saving
    getSessionData() {
        const sessionData = {
            character_stats: this.characterStats
        };
        console.log('🔍 CharacterStatsManager.getSessionData():', sessionData);
        return sessionData;
    }

    // Generate stats display HTML for member list
    generateShortStatsHTML(characterName) {
        const shortStats = this.getShortStats(characterName);
        const lang = getCurrentLanguageSettings();

        console.log('🔍 DEBUG - generateShortStatsHTML for:', characterName);
        console.log('🔍 DEBUG - shortStats:', shortStats);
        console.log('🔍 DEBUG - characterStats for this character:', this.characterStats[characterName]);

        if (shortStats.length === 0) {
            console.log('🔍 DEBUG - No short stats found for:', characterName);
            return '';
        }

        // For short stats, use emoji-only format
        const statsHTML = shortStats.map(stat => {
            // Since we're using emojis directly as stat names, just use them as-is
            return `<span class="${lang.shortStatsClass || 'text-xs text-gray-400'}">${stat.name} ${stat.value}</span>`;
        }).join(lang.shortStatsSeparator || ' • ');

        const result = `<div class="mt-1 ${lang.shortStatsClass || 'text-xs text-gray-400'}">${statsHTML}</div>`;
        console.log('🔍 DEBUG - Generated stats HTML:', result);
        return result;
    }

    // Generate stats HTML for context menu (simplified version)
    generateDetailedStatsHTML(characterName) {
        const stats = this.getCharacterStats(characterName);
        const lang = getCurrentLanguageSettings();

        if (!stats || Object.keys(stats).length === 0) {
            return `<div class="${lang.detailedStatsClass || 'text-sm text-gray-400'}">${lang.noStatsMessage || 'No stats available'}</div>`;
        }

        const statsHTML = Object.entries(stats).map(([statName, value]) =>
            `<div class="flex justify-between py-1 border-b border-gray-600 last:border-b-0">
                <span class="${lang.statsLabelClass || 'text-sm font-medium'}">${statName}:</span>
                <span class="${lang.statsValueClass || 'text-sm text-gray-300'}">${value}</span>
            </div>`
        ).join('');

        return `<div class="space-y-1">${statsHTML}</div>`;
    }
}

// Make it globally available
window.CharacterStatsManager = CharacterStatsManager; 