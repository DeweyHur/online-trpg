// Test file to verify latest turn command detection

// Mock the findLatestTurnCommand function
function findLatestTurnCommand(chatHistory) {
    console.log('🔍 DEBUG - Searching for latest turn command in chat history...');

    // Search from the bottom (most recent) to top (oldest)
    for (let i = chatHistory.length - 1; i >= 0; i--) {
        const msg = chatHistory[i];
        if (msg.role === 'model') {
            const text = msg.parts[0].text;
            const turnPattern = /\$\{Turn=([^}]+)\}/g;
            const match = turnPattern.exec(text);

            if (match) {
                const turnPlayer = match[1].trim();
                console.log('🔍 DEBUG - Found latest turn command:', turnPlayer, 'in message', i);
                return turnPlayer;
            }
        }
    }

    console.log('🔍 DEBUG - No turn command found in chat history');
    return null;
}

// Test the latest turn command detection
function testLatestTurnCommand() {
    console.log('🧪 Testing latest turn command detection...');

    const testCases = [
        {
            name: 'Latest turn command at the end',
            chatHistory: [
                { role: 'model', parts: [{ text: 'First message with ${Turn=김민준}' }] },
                { role: 'user', parts: [{ text: 'User action' }] },
                { role: 'model', parts: [{ text: 'Second message with ${Turn=이서현}' }] }
            ],
            expected: '이서현'
        },
        {
            name: 'Turn command in middle',
            chatHistory: [
                { role: 'model', parts: [{ text: 'First message with ${Turn=김민준}' }] },
                { role: 'user', parts: [{ text: 'User action' }] },
                { role: 'model', parts: [{ text: 'Second message without turn command' }] }
            ],
            expected: '김민준'
        },
        {
            name: 'No turn commands',
            chatHistory: [
                { role: 'model', parts: [{ text: 'First message without turn command' }] },
                { role: 'user', parts: [{ text: 'User action' }] },
                { role: 'model', parts: [{ text: 'Second message without turn command' }] }
            ],
            expected: null
        },
        {
            name: 'Multiple turn commands - should get latest',
            chatHistory: [
                { role: 'model', parts: [{ text: 'First message with ${Turn=김민준}' }] },
                { role: 'user', parts: [{ text: 'User action' }] },
                { role: 'model', parts: [{ text: 'Second message with ${Turn=이서현}' }] },
                { role: 'user', parts: [{ text: 'Another user action' }] },
                { role: 'model', parts: [{ text: 'Third message with ${Turn=박철수}' }] }
            ],
            expected: '박철수'
        }
    ];

    testCases.forEach((testCase, index) => {
        console.log(`\n  Test ${index + 1}: ${testCase.name}`);
        console.log(`    Chat history length: ${testCase.chatHistory.length}`);

        const result = findLatestTurnCommand(testCase.chatHistory);
        console.log(`    Result: ${result}`);
        console.log(`    Expected: ${testCase.expected}`);

        const success = result === testCase.expected;
        console.log(`    ${success ? '✅ PASS' : '❌ FAIL'}`);
    });
}

// Test with actual response from logs
function testActualResponse() {
    console.log('\n🧪 Testing with actual response from logs...');

    const actualChatHistory = [
        { role: 'model', parts: [{ text: 'First message with ${Turn=김민준}' }] },
        { role: 'user', parts: [{ text: '부러진 모니터를 들어서 멀리 던져버려서 괴물을 유인해보자' }] },
        { role: 'model', parts: [{ text: '김민준은 주저할 틈도 없이 바닥에 널브러진 부러진 모니터로 손을 뻗었다...\n\n다음 플레이어의 차례입니다: ${Turn=이서현}' }] }
    ];

    console.log('🔍 DEBUG - Testing with actual chat history:');
    actualChatHistory.forEach((msg, index) => {
        console.log(`  Message ${index}: ${msg.role} - ${msg.parts[0].text.substring(0, 50)}...`);
    });

    const result = findLatestTurnCommand(actualChatHistory);
    console.log('🔍 DEBUG - Latest turn command found:', result);

    if (result === '이서현') {
        console.log('✅ Actual response test successful!');
    } else {
        console.log('❌ Actual response test failed!');
    }
}

// Run tests
console.log('🚀 Starting latest turn command tests...\n');
testLatestTurnCommand();
testActualResponse();
console.log('\n✨ All tests completed!'); 