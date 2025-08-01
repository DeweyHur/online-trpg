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
    characterNamePlaceholder: "Enter your character's name",
    joinGameButton: "Join Game",

    // Chat and actions
    playerActionPlaceholder: "What do you do? (Supports markdown formatting)",
    sendButton: "Send",
    leaveSessionButton: "Leave Session",

    // Messages
    gmThinking: "GM is thinking...",
    joinMessage: "{name} has joined the adventure!",
    systemError: "SYSTEM ERROR",
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
    promptMode: "Action Mode",
    chatMode: "Chat Mode",
    promptPlaceholder: "What action do you take? (Supports markdown formatting)",
    chatPlaceholder: "Chat with other players... (Supports markdown formatting)",
    sendActionButton: "Take Action",
    sendChatButton: "Send Chat",
    toggleModeButton: "Toggle Mode",
    removePlayerButton: "Remove Player",

    // Turn system prompts
    turnPrompt: "Current session members: {playerList}\n\nIt's now the turn of: ${currentTurn}$\n\nThis player should take their action now. Other players please wait.\n\nAfter the player's action, please respond with ${Turn=PlayerName} to set the next player's turn. Only use players who are in the member list.",
    chatPrompt: "Current session members: {playerList}\n\nIt's currently {currentTurn}'s turn.\nYou are {currentPlayerName}.\n\nThis is general chat. Do not proceed with the game as no action is being taken.\n\nAfter the player's action, please respond with ${Turn=PlayerName} to set the next player's turn. Only use players who are in the member list.",
    waitingText: "waiting",
    noPlayersText: "No players"
};

// Export for use in other files
if (typeof window !== 'undefined') {
    window.LANGUAGES_EN = LANGUAGES_EN;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { LANGUAGES_EN };
} 