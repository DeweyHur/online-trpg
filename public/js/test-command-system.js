// Test the new command system
console.log('Testing Command System...');

// Mock language manager
const mockLanguageManager = {
    getText: (key, params = {}) => {
        const texts = {
            'turnPrompt': 'Current session members: {playerList}\n\nIt\'s now the turn of: ${currentTurn}$\n\nThis player should take their action now. Other players please wait.\n\nAfter the player\'s action, please respond with ${Turn=PlayerName} to set the next player\'s turn. Only use players who are in the member list.',
            'chatPrompt': 'Current session members: {playerList}\n\nIt\'s currently {currentTurn}\'s turn.\nYou are {currentPlayerName}.\n\nThis is general chat. Do not proceed with the game as no action is being taken.\n\nAfter the player\'s action, please respond with ${Turn=PlayerName} to set the next player\'s turn. Only use players who are in the member list.'
        };
        let text = texts[key] || key;
        Object.keys(params).forEach(param => {
            text = text.replace(new RegExp(`{${param}}`, 'g'), params[param]);
        });
        return text;
    }
};

// Test TurnSystem with command parsing
function testCommandSystem() {
    console.log('1. Testing TurnSystem command parsing...');

    const TurnSystem = window.TurnSystem;
    const turnSystem = new TurnSystem(mockLanguageManager);

    // Initialize with test data
    turnSystem.initialize({
        current_turn: 'Alice',
        turn_order: ['Alice', 'Bob', 'Charlie'],
        players: { 'user1': 'Alice', 'user2': 'Bob', 'user3': 'Charlie' }
    });

    console.log('Initial turn:', turnSystem.currentTurn);

    // Test command parsing
    const testText = "The player takes an action. ${Turn=Bob} Now it's Bob's turn.";
    const commands = turnSystem.parseCommands(testText);
    console.log('Parsed commands:', commands);

    // Test command processing
    const updates = turnSystem.processCommands(testText);
    console.log('Command updates:', updates);
    console.log('New turn:', turnSystem.currentTurn);

    // Test invalid player
    const invalidText = "The GM tries to set turn to someone not in session. ${Turn=David}";
    const invalidUpdates = turnSystem.processCommands(invalidText);
    console.log('Invalid command updates:', invalidUpdates);
    console.log('Turn should still be Bob:', turnSystem.currentTurn);

    console.log('✅ Command system tests passed!');
}

// Run tests
if (typeof window !== 'undefined') {
    testCommandSystem();
} else {
    console.log('Run this in a browser environment with the turn-system.js loaded');
} 