// English language definitions for the TRPG application
const LANGUAGES_EN = {
    // Page title and headers
    pageTitle: "Multiplayer TRPG - Server Gateway",
    mainTitle: "Multiplayer TRPG",
    gameTitle: "TRPG Session",

    // Session creation
    createSessionTitle: "Create a New Session",
    geminiApiKeyPlaceholder: "Enter your Gemini API Key",
    startingPromptPlaceholder: "Describe the starting background and who you are...",
    createSessionButton: "Create Session",

    // Session joining
    joinSessionTitle: "Join an Existing Session",
    sessionIdPlaceholder: "Enter Session ID",
    joinSessionButton: "Join Session",

    // Game interface
    sessionIdLabel: "Session ID:",
    playingAsLabel: "Playing as:",
    createCharacterTitle: "Create Your Character",
    joinGameTitle: "Join the Game",
    characterNamePlaceholder: "Enter your character's name",
    joinGameButton: "Join Game",
    newCharacterButton: "Create New Character",
    creatingCharacter: "Creating...",
    existingPlayersTitle: "Existing Players",

    // Game setup template
    gameSetupTemplate: "We're going to play a new TRPG game. The world is described by {worldDescription}. The main character is {characterName} and we want to start this game. People can join and leave freely, so keep this in mind.",
    existingPlayersHelp: "Click on a player to join as them, or create a new character below.",
    newCharacterTitle: "Create New Character",
    cancelButton: "Cancel",

    // Chat and actions
    playerActionPlaceholder: "What do you do? (Supports markdown formatting)",
    sendButton: "Send",
    leaveSessionButton: "Leave Session",

    // Messages
    gmThinking: "GM is thinking...",
    joinMessage: "{name} has joined the adventure!",
    playerLeftMessage: "{name} has left the adventure.",
    systemError: "SYSTEM",
    error: "ERROR",

    // Validation messages
    apiKeyRequired: "API Key and Starting Prompt are required. OK?",
    sessionIdRequired: "Please enter a Session ID.",
    characterNameRequired: "Please enter a character name. OK?",

    // Error messages
    couldNotCreateSession: "Could not create session: {error}",
    couldNotJoinSession: "Could not join game: {error}",
    errorJoiningSession: "Error joining session: {error}",
    gmError: "GM Error: {error}",
    errorSendingAction: "Error: {error}",

    // Confirmation dialogs
    leaveSessionConfirm: "Are you sure you want to leave the session?",

    // Formatting toolbar
    boldTooltip: "Bold (Ctrl+B)",
    italicTooltip: "Italic (Ctrl+I)",
    codeTooltip: "Code",
    quoteTooltip: "Quote",
    linkTooltip: "Link",
    listTooltip: "List",
    headingTooltip: "Heading",
    previewTooltip: "Toggle Preview",

    // Preview
    previewPlaceholder: "Preview will appear here...",

    // Buttons
    yes: "Yes",
    no: "No",

    // Turn system
    membersTitle: "Members",
    membersHelpText: "Right-click on a player to view character stats and details.",
    promptMode: "Action Mode",
    chatMode: "Chat Mode",
    promptPlaceholder: "What action do you take? (Supports markdown formatting)",
    chatPlaceholder: "Chat with other players... (Supports markdown formatting)",
    sendActionButton: "Take Action",
    sendChatButton: "Send Chat",
    toggleModeButton: "Toggle Mode",
    removePlayerButton: "Remove Player",
    confirmRemovePlayer: "Are you sure you want to remove {name} from the session?",

    // Turn system prompts
    turnPrompt: "Current session members: {playerList}\n\nIt's now the turn of: ${currentTurn}$\n\nThis player should take their action now. Other players please wait.\n\nAfter the player's action, please respond with ${Turn=PlayerName} to set the next player's turn. Only use players who are in the member list.",
    chatPrompt: "Current session members: {playerList}\n\nIt's currently {currentTurn}'s turn.\nYou are {currentPlayerName}.\n\nThis is general chat. Do not proceed with the game as no action is being taken.\n\nAfter the player's action, please respond with ${Turn=PlayerName} to set the next player's turn. Only use players who are in the member list.",
    waitingText: "waiting",
    noPlayersText: "No players",

    // Stats system
    statsLanguageInstruction: "Please write all stat names and values in English. Maintain consistent English style.",
    campaignSettingLabel: "Campaign Setting:",
    characterNameLabel: "Character Name:",
    characterDescriptionLabel: "Character Description:",
    campaignContextLabel: "Campaign Context:",

    // Stats display settings
    shortStatsCount: 3,
    shortStatsSeparator: " • ",
    shortStatsClass: "text-xs text-gray-400",
    detailedStatsClass: "text-sm text-gray-400",
    noStatsMessage: "No stats available",
    statsLabelClass: "text-sm font-medium",
    statsValueClass: "text-sm text-gray-300",


    // Prompt Templates
    promptTemplates: {
        characterStats: {
            title: "Determine representative character stats for a TRPG character.",
            description: "Analyze the character and provide representative stats.",
            format: "Please provide representative stats in the following CSV format:\ncharacter,stat_name,value",
            guidelines: [
                "Create 1-5 representative stats that best describe this character",
                "Use emoji for stat names to make them visually clear",
                "Use various stat formats: '3/5' for regeneratable stats (like mana, stamina), '14' for base stats (like strength, dexterity), '1/30' for current/max stats (like health) - only regeneratable stats should have maximum values",
                "You can include essential info like class/race in emoji format (e.g., 🧙‍♂️Wizard, 🧝‍♀️Elf)",
                "Choose stats that best represent the character's core abilities and traits"
            ],
            return: "Return ONLY the CSV data, no additional text"
        },

        batchStats: {
            title: "Determine representative character stats for multiple TRPG characters.",
            description: "Provide representative stats for all characters.",
            format: "Please provide representative stats for ALL characters in the following format:\ncharacter|stat_name|value",
            guidelines: [
                "Create 1-5 representative stats that best describe each character",
                "Use emoji for stat names to make them visually clear",
                "Use consistent emojis across all characters for the same stat types",
                "Use various stat formats: '3/5' for regeneratable stats (like mana, stamina), '14' for base stats (like strength, dexterity), '1/30' for current/max stats (like health) - only regeneratable stats should have maximum values",
                "You can include essential info like class/race in emoji format (e.g., 🧙‍♂️Wizard, 🧝‍♀️Elf)",
                "Choose stats that best represent each character's core abilities and traits"
            ],
            return: "Return ONLY the CSV data, no additional text"
        },

        detailedStats: {
            title: "Determine comprehensive character stats for multiple TRPG characters.",
            description: "Provide detailed and comprehensive stats for all characters with full descriptions.",
            format: "Please provide detailed stats for ALL characters in the following format:\ncharacter|stat_name|value|description",
            guidelines: [
                "Create 6-15 comprehensive stats that fully describe each character",
                "Use descriptive stat names with emojis for visual clarity",
                "Include detailed descriptions for each stat explaining what it represents",
                "Use various stat formats: '3/5' for regeneratable stats, '14' for base stats, '1/30' for current/max stats",
                "Include both basic stats (strength, intelligence, etc.) and specialized stats (magic affinity, social influence, etc.)",
                "Provide one-line explanations for each stat in the description column",
                "Choose stats that comprehensively represent the character's abilities, background, and traits"
            ],
            return: "Return ONLY the CSV data, no additional text"
        }
    }
};

// Export for use in other files
if (typeof window !== 'undefined') {
    window.LANGUAGES_EN = LANGUAGES_EN;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { LANGUAGES_EN };
} 