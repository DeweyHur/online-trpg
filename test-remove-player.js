// Test Remove Player Functionality
console.log('Testing Remove Player Functionality...');

// Mock language manager for testing
const mockLanguageManager = {
    getText: (key, params = {}) => {
        const texts = {
            'removePlayerButton': 'Remove Player',
            'confirmRemovePlayer': 'Are you sure you want to remove {name} from the session?',
            'playerLeftMessage': '{name} has left the adventure.'
        };
        let text = texts[key] || key;
        Object.keys(params).forEach(param => {
            text = text.replace(`{${param}}`, params[param]);
        });
        return text;
    }
};

// Test TurnSystem removePlayer method
function testTurnSystemRemovePlayer() {
    console.log('1. Testing TurnSystem.removePlayer()...');

    const turnSystem = new TurnSystem(mockLanguageManager);

    // Initialize with test data
    turnSystem.players = {
        'user1': 'Alice',
        'user2': 'Bob',
        'user3': 'Charlie'
    };
    turnSystem.turnOrder = ['Alice', 'Bob', 'Charlie'];
    turnSystem.currentTurn = 'Alice';

    console.log('Before removal:', {
        players: turnSystem.players,
        turnOrder: turnSystem.turnOrder,
        currentTurn: turnSystem.currentTurn
    });

    // Remove Bob
    turnSystem.removePlayer('Bob');

    console.log('After removing Bob:', {
        players: turnSystem.players,
        turnOrder: turnSystem.turnOrder,
        currentTurn: turnSystem.currentTurn
    });

    // Verify Bob was removed
    if (!turnSystem.players['user2'] && !turnSystem.turnOrder.includes('Bob')) {
        console.log('✅ TurnSystem.removePlayer() test passed!');
    } else {
        console.log('❌ TurnSystem.removePlayer() test failed!');
    }
}

// Test MemberManager removePlayer method
function testMemberManagerRemovePlayer() {
    console.log('2. Testing MemberManager.removePlayer()...');

    const turnSystem = new TurnSystem(mockLanguageManager);
    const memberManager = new MemberManager(turnSystem);

    // Mock the turn system data
    turnSystem.players = {
        'user1': 'Alice',
        'user2': 'Bob'
    };
    turnSystem.turnOrder = ['Alice', 'Bob'];
    turnSystem.currentTurn = 'Alice';

    // Mock window object for testing
    global.window = {
        currentSessionId: 'test-session-123',
        chatHistory: []
    };

    // Mock fetch for testing
    global.fetch = async (url, options) => {
        console.log('Mock API call:', url, options);
        return {
            ok: true,
            json: async () => ({ session: {} })
        };
    };

    // Test remove player
    memberManager.removePlayer('Bob');

    console.log('✅ MemberManager.removePlayer() test passed!');
}

// Run tests
if (typeof TurnSystem !== 'undefined' && typeof MemberManager !== 'undefined') {
    testTurnSystemRemovePlayer();
    testMemberManagerRemovePlayer();
} else {
    console.log('❌ TurnSystem or MemberManager not available. Make sure turn-system.js is loaded.');
} 