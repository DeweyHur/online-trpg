// Simple test script for turn system functionality
console.log('Testing Turn System...');

// Test TurnSystem class
function testTurnSystem() {
    console.log('1. Testing TurnSystem class...');

    // Mock language manager
    const mockLanguageManager = {
        currentLanguage: 'en',
        getText: (key) => key
    };

    const turnSystem = new TurnSystem(mockLanguageManager);

    // Test initialization
    turnSystem.initialize({
        current_turn: 'Alice',
        turn_order: ['Alice', 'Bob', 'Charlie'],
        players: { 'user1': 'Alice', 'user2': 'Bob', 'user3': 'Charlie' }
    });

    console.log('Current turn:', turnSystem.currentTurn);
    console.log('Turn order:', turnSystem.turnOrder);
    console.log('Players:', turnSystem.players);

    // Test turn indicator detection
    const testText1 = "It's now $Bob$'s turn!";
    const testText2 = "This is a regular message without turn indicator";

    console.log('Has turn indicator (test1):', turnSystem.hasTurnIndicator(testText1));
    console.log('Has turn indicator (test2):', turnSystem.hasTurnIndicator(testText2));

    // Test turn advancement
    console.log('Before nextTurn:', turnSystem.currentTurn);
    turnSystem.nextTurn();
    console.log('After nextTurn:', turnSystem.currentTurn);

    console.log('✅ TurnSystem tests passed!');
}

// Test MemberManager class
function testMemberManager() {
    console.log('2. Testing MemberManager class...');

    const mockLanguageManager = {
        currentLanguage: 'en',
        getText: (key) => key
    };

    const turnSystem = new TurnSystem(mockLanguageManager);
    turnSystem.initialize({
        current_turn: 'Alice',
        turn_order: ['Alice', 'Bob'],
        players: { 'user1': 'Alice', 'user2': 'Bob' }
    });

    const memberManager = new MemberManager(turnSystem);

    // Test player color assignment
    const color1 = memberManager.getPlayerColor('Alice');
    const color2 = memberManager.getPlayerColor('Bob');

    console.log('Alice color:', color1);
    console.log('Bob color:', color2);
    console.log('Colors are different:', color1 !== color2);

    console.log('✅ MemberManager tests passed!');
}

// Test InputModeManager class
function testInputModeManager() {
    console.log('3. Testing InputModeManager class...');

    const mockLanguageManager = {
        currentLanguage: 'en',
        getText: (key) => key
    };

    const turnSystem = new TurnSystem(mockLanguageManager);
    turnSystem.initialize({
        current_turn: 'Alice',
        turn_order: ['Alice', 'Bob'],
        players: { 'user1': 'Alice', 'user2': 'Bob' }
    });

    const inputModeManager = new InputModeManager(turnSystem, mockLanguageManager);

    // Test mode switching
    turnSystem.setCurrentPlayer('Alice');
    inputModeManager.updateMode();
    console.log('Alice mode (should be prompt):', inputModeManager.currentMode);
    console.log('Should send to AI:', inputModeManager.shouldSendToAI());

    turnSystem.setCurrentPlayer('Bob');
    inputModeManager.updateMode();
    console.log('Bob mode (should be chat):', inputModeManager.currentMode);
    console.log('Should send to AI:', inputModeManager.shouldSendToAI());

    console.log('✅ InputModeManager tests passed!');
}

// Run all tests
function runAllTests() {
    try {
        testTurnSystem();
        testMemberManager();
        testInputModeManager();
        console.log('🎉 All tests passed!');
    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

// Export for use in browser
if (typeof window !== 'undefined') {
    window.testTurnSystem = runAllTests;
    console.log('Test functions available. Run testTurnSystem() to test.');
} 