// Character Stats System for TRPG
class CharacterStatsManager {
    constructor() {
        this.characterStats = {};
        this.statsTemplates = {
            // Default templates for common RPG stats
            default: {
                short: [],
                detailed: []
            },
            // Fantasy RPG template
            fantasy: {
                short: ['HP', 'MP'],
                detailed: ['HP', 'MP', 'STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA', 'AC', 'Initiative']
            },
            // Sci-fi template
            scifi: {
                short: ['HP', 'Energy'],
                detailed: ['HP', 'Energy', 'Strength', 'Agility', 'Intelligence', 'Tech', 'Combat', 'Social']
            },
            // Custom template (can be set by GM)
            custom: {
                short: [],
                detailed: []
            }
        };
        this.currentTemplate = 'default';
    }

    // Initialize with session data
    initialize(sessionData) {
        this.characterStats = sessionData.character_stats || {};
        this.currentTemplate = sessionData.stats_template || 'default';
    }

    // Generate prompt for Gemini to determine character stats
    generateStatsPrompt(characterName, context = '') {
        return `I need you to determine appropriate character stats for a TRPG character.

Character Name: ${characterName}
Context: ${context || 'General TRPG setting'}

Please analyze this character and provide appropriate stats in the following CSV format:
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

Examples of different stat types:
- Traditional RPG: HP, MP, STR, DEX, etc.
- Horror/Supernatural: Sanity, Corruption, Spiritual Debt, etc.
- Sci-fi: Energy, Tech Level, Cybernetics, etc.
- Social: Reputation, Influence, Connections, etc.

Return ONLY the CSV data, no additional text.`;
    }

    // Generate prompt for Gemini to determine appropriate stat categories
    generateTemplatePrompt(context = '') {
        return `I need you to determine appropriate stat categories for a TRPG campaign.

Context: ${context || 'General fantasy RPG setting'}

Please analyze the campaign setting and provide appropriate stat categories in the following JSON format:
{
  "template": "custom",
  "short": ["<primary_stat1>", "<primary_stat2>"],
  "detailed": ["<stat1>", "<stat2>", "<stat3>", "<stat4>", "<stat5>", "<stat6>", "<stat7>", "<stat8>"]
}

Guidelines:
- "short" should contain 2-3 most important stats that will be displayed below character names
- "detailed" should contain 6-10 stats that will be shown in the detailed view
- Use appropriate stat names for the setting (e.g., "HP/MP" for fantasy, "Health/Energy" for sci-fi)
- Consider the genre and theme of the campaign

Return ONLY the JSON object, no additional text.`;
    }

    // Parse character stats commands from GM messages
    parseStatsCommands(text) {
        const statsPattern = /\$\{Stats=([^}]+)\}/g;
        const commands = [];
        let match;

        while ((match = statsPattern.exec(text)) !== null) {
            try {
                const statsData = JSON.parse(match[1]);
                commands.push({
                    type: 'stats',
                    data: statsData
                });
            } catch (error) {
                console.error('Error parsing stats command:', error);
            }
        }

        return commands;
    }

    // Parse template commands
    parseTemplateCommands(text) {
        const templatePattern = /\$\{Template=([^}]+)\}/g;
        const commands = [];
        let match;

        while ((match = templatePattern.exec(text)) !== null) {
            try {
                const templateData = JSON.parse(match[1]);
                commands.push({
                    type: 'template',
                    data: templateData
                });
            } catch (error) {
                console.error('Error parsing template command:', error);
            }
        }

        return commands;
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
                    commands.push({
                        type: 'gemini_stats',
                        data: {
                            character: lines[1].split(',')[0].trim(), // Get character name from first data row
                            stats: stats
                        }
                    });
                    console.log('✅ Successfully parsed CSV stats data');
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

    // Parse Gemini-generated template commands
    parseGeminiTemplateCommands(text) {
        const geminiPattern = /\$\{GeminiTemplate=([^}]+)\}/g;
        const commands = [];
        let match;

        while ((match = geminiPattern.exec(text)) !== null) {
            try {
                const templateData = JSON.parse(match[1]);
                commands.push({
                    type: 'gemini_template',
                    data: templateData
                });
            } catch (error) {
                console.error('Error parsing Gemini template command:', error);
            }
        }

        return commands;
    }

    // Process all character-related commands
    processCommands(text) {
        const statsCommands = this.parseStatsCommands(text);
        const templateCommands = this.parseTemplateCommands(text);
        const geminiStatsCommands = this.parseGeminiStatsCommands(text);
        const geminiTemplateCommands = this.parseGeminiTemplateCommands(text);

        const updates = {};

        // Process manual stats commands
        statsCommands.forEach(cmd => {
            if (cmd.data.character && cmd.data.stats) {
                this.characterStats[cmd.data.character] = {
                    ...this.characterStats[cmd.data.character],
                    ...cmd.data.stats
                };
                updates.characterStats = this.characterStats;
            }
        });

        // Process manual template commands
        templateCommands.forEach(cmd => {
            if (cmd.data.template) {
                this.currentTemplate = cmd.data.template;
                if (cmd.data.short) {
                    this.statsTemplates.custom.short = cmd.data.short;
                }
                if (cmd.data.detailed) {
                    this.statsTemplates.custom.detailed = cmd.data.detailed;
                }
                updates.statsTemplate = this.currentTemplate;
            }
        });

        // Process Gemini-generated stats commands
        geminiStatsCommands.forEach(cmd => {
            if (cmd.data.character && cmd.data.stats) {
                this.characterStats[cmd.data.character] = {
                    ...this.characterStats[cmd.data.character],
                    ...cmd.data.stats
                };
                // Set template to custom when we have custom stats
                this.currentTemplate = 'custom';
                updates.characterStats = this.characterStats;
                updates.statsTemplate = this.currentTemplate;
            }
        });

        // Process Gemini-generated template commands
        geminiTemplateCommands.forEach(cmd => {
            if (cmd.data.template) {
                this.currentTemplate = cmd.data.template;
                if (cmd.data.short) {
                    this.statsTemplates.custom.short = cmd.data.short;
                }
                if (cmd.data.detailed) {
                    this.statsTemplates.custom.detailed = cmd.data.detailed;
                }
                updates.statsTemplate = this.currentTemplate;
            }
        });

        return updates;
    }

    // Get character stats for a specific character
    getCharacterStats(characterName) {
        return this.characterStats[characterName] || {};
    }

    // Get short stats for display below member name
    getShortStats(characterName) {
        const stats = this.getCharacterStats(characterName);

        // Auto-set template to custom if we have custom stats
        if (Object.keys(stats).length > 0 && this.currentTemplate === 'default') {
            this.currentTemplate = 'custom';
        }

        // If we have a template with defined short stats, use those
        if (this.currentTemplate !== 'custom' && this.statsTemplates[this.currentTemplate]) {
            const template = this.statsTemplates[this.currentTemplate];
            const shortStats = template.short || [];

            return shortStats.map(statName => ({
                name: statName,
                value: stats[statName] || '?'
            }));
        }

        // For custom templates or when no template is set, show first 2-3 stats
        const statNames = Object.keys(stats);
        const shortStatNames = statNames.slice(0, 3); // Show first 3 stats

        return shortStatNames.map(statName => ({
            name: statName,
            value: stats[statName] || '?'
        }));
    }

    // Get detailed stats for context menu
    getDetailedStats(characterName) {
        const stats = this.getCharacterStats(characterName);

        // If we have a template with defined detailed stats, use those
        if (this.currentTemplate !== 'custom' && this.statsTemplates[this.currentTemplate]) {
            const template = this.statsTemplates[this.currentTemplate];
            const detailedStats = template.detailed || [];

            return detailedStats.map(statName => ({
                name: statName,
                value: stats[statName] || '?'
            }));
        }

        // For custom templates or when no template is set, show all stats
        return Object.keys(stats).map(statName => ({
            name: statName,
            value: stats[statName] || '?'
        }));
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
        return {
            character_stats: this.characterStats,
            stats_template: this.currentTemplate
        };
    }

    // Generate stats display HTML for member list
    generateShortStatsHTML(characterName) {
        const shortStats = this.getShortStats(characterName);

        if (shortStats.length === 0) {
            return '';
        }

        const statsHTML = shortStats.map(stat =>
            `<span class="text-xs text-gray-400">${stat.name}: ${stat.value}</span>`
        ).join(' • ');

        return `<div class="mt-1 text-xs text-gray-400">${statsHTML}</div>`;
    }

    // Generate detailed stats HTML for context menu
    generateDetailedStatsHTML(characterName) {
        const detailedStats = this.getDetailedStats(characterName);

        if (detailedStats.length === 0) {
            return '<div class="text-sm text-gray-400">No stats available</div>';
        }

        const statsHTML = detailedStats.map(stat =>
            `<div class="flex justify-between py-1 border-b border-gray-600 last:border-b-0">
                <span class="text-sm font-medium">${stat.name}:</span>
                <span class="text-sm text-gray-300">${stat.value}</span>
            </div>`
        ).join('');

        return `<div class="space-y-1">${statsHTML}</div>`;
    }
}

// Make it globally available
window.CharacterStatsManager = CharacterStatsManager; 