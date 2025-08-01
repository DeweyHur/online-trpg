// Mock session data for testing
let mockSession = {
    players: {
        'user1': 'Alice',
        'user2': 'Bob',
        'user3': 'Charlie',
        'user4': '크리스티앙',
        'user5': 'Inhoi',
        'user6': '아슈발'
    }
};

// Mock language manager
const mockLanguageManager = {
    getText: (key) => {
        const texts = {
            'systemError': 'SYSTEM ERROR',
            'error': 'ERROR'
        };
        return texts[key] || key;
    }
};

// Mock getPlayerColor function
function getPlayerColor(playerName) {
    const colors = [
        'text-red-400', 'text-blue-400', 'text-green-400', 'text-yellow-400',
        'text-purple-400', 'text-pink-400', 'text-indigo-400', 'text-emerald-400'
    ];

    const playerNames = Object.values(mockSession.players);
    const index = playerNames.indexOf(playerName);
    return colors[index % colors.length];
}

// Mock highlightPlayerNames function
function highlightPlayerNames(text) {
    if (!mockSession || !mockSession.players) {
        return text;
    }

    const playerNames = Object.values(mockSession.players);

    if (playerNames.length === 0) {
        return text;
    }

    let highlightedText = text;
    const sortedPlayerNames = playerNames.sort((a, b) => b.length - a.length);

    sortedPlayerNames.forEach(playerName => {
        if (playerName && playerName.trim()) {
            const playerColor = getPlayerColor(playerName);
            const escapedName = playerName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(`\\b${escapedName}\\b`, 'gi');
            highlightedText = highlightedText.replace(regex, `<span class="${playerColor} font-semibold">${playerName}</span>`);
        }
    });

    return highlightedText;
}

// Mock displayMessage function
function displayMessage({ text, type, author = 'GM' }) {
    const messageEl = document.createElement('div');
    messageEl.classList.add('mb-4');

    let bgColor = 'bg-gray-700';
    let textColor = 'text-white';
    let authorPrefix = `<strong>[${author}]</strong>: `;

    switch (type) {
        case 'system':
            bgColor = 'bg-yellow-900';
            textColor = 'text-yellow-200';
            authorPrefix = `<em>[${mockLanguageManager.getText('systemError')}]</em>: `;
            break;
        case 'player':
            bgColor = 'bg-blue-900';
            textColor = 'text-blue-200';
            const playerColor = getPlayerColor(author);
            authorPrefix = `<strong class="${playerColor}">[${author}]</strong>: `;
            break;
        case 'error':
            bgColor = 'bg-red-900';
            textColor = 'text-red-200';
            authorPrefix = `<strong>[${mockLanguageManager.getText('error')}]</strong>: `;
            break;
        case 'gm':
            bgColor = 'bg-gray-700';
            textColor = 'text-indigo-200';
            break;
    }

    messageEl.classList.add(bgColor, textColor, 'p-3', 'rounded-lg', 'shadow');

    // Highlight player names in the text before parsing markdown
    const highlightedText = highlightPlayerNames(text);

    // Parse markdown and render it
    const markdownText = marked.parse(highlightedText);
    messageEl.innerHTML = `${authorPrefix}<div class="markdown-content">${markdownText}</div>`;

    document.getElementById('test-chat-log').appendChild(messageEl);
    document.getElementById('test-chat-log').scrollTop = document.getElementById('test-chat-log').scrollHeight;
}

function addTestPlayer() {
    const name = document.getElementById('player-name').value.trim();
    if (!name) {
        alert('Please enter a player name');
        return;
    }

    const userId = `user_${Date.now()}`;
    mockSession.players[userId] = name;

    updatePlayerList();
    document.getElementById('player-name').value = '';

    console.log('Added player:', name);
    console.log('Current players:', mockSession.players);
}

function updatePlayerList() {
    const playerList = document.getElementById('player-list');
    playerList.innerHTML = '';

    Object.values(mockSession.players).forEach(playerName => {
        const playerColor = getPlayerColor(playerName);
        const playerItem = document.createElement('div');
        playerItem.className = 'flex items-center space-x-2 p-2 bg-gray-700 rounded';
        playerItem.innerHTML = `
            <div class="w-3 h-3 rounded-full ${playerColor.replace('text-', 'bg-')}"></div>
            <span class="${playerColor}">${playerName}</span>
        `;
        playerList.appendChild(playerItem);
    });
}

function testHighlighting() {
    const message = document.getElementById('test-message').value.trim();
    const type = document.getElementById('message-type').value;
    const author = type === 'player' ? 'Alice' : 'GM';

    if (!message) {
        alert('Please enter a test message');
        return;
    }

    displayMessage({ text: message, type: type, author: author });
    document.getElementById('test-message').value = '';
}

function clearChat() {
    document.getElementById('test-chat-log').innerHTML = '';
}

function reRenderChat() {
    console.log('🔄 Re-rendering chat with updated highlighting');
    const chatLog = document.getElementById('test-chat-log');
    const messages = chatLog.innerHTML;

    // Clear and re-render
    chatLog.innerHTML = '';

    // Re-add the sample messages with current highlighting
    displayMessage({
        text: 'Alice attacks the goblin with her sword!',
        type: 'player',
        author: 'Alice'
    });

    displayMessage({
        text: 'The GM says: "Bob, it\'s your turn to act. Charlie is waiting for you."',
        type: 'gm',
        author: 'GM'
    });

    displayMessage({
        text: 'System: Alice, Bob, and Charlie have joined the adventure!',
        type: 'system',
        author: 'SYSTEM'
    });
}

function testPlayerListChanges() {
    const prevPlayers = ['Alice', 'Bob'];
    const currPlayers = ['Alice', 'Bob', 'Charlie'];

    console.log('Testing player list changes:');
    console.log('Previous:', prevPlayers);
    console.log('Current:', currPlayers);
    console.log('Changed:', checkPlayerListChanges(prevPlayers, currPlayers));
}

function testKoreanHighlighting() {
    console.log('Testing Korean name highlighting...');
    const testText = '크리스티앙이 Inhoi와 아슈발에게 말했습니다.';
    const highlighted = highlightPlayerNames(testText);
    console.log('Original:', testText);
    console.log('Highlighted:', highlighted);
}

// Initialize with some test messages
function initializeTest() {
    updatePlayerList();

    // Add some sample messages
    displayMessage({
        text: 'Alice attacks the goblin with her sword!',
        type: 'player',
        author: 'Alice'
    });

    displayMessage({
        text: 'The GM says: "Bob, it\'s your turn to act. Charlie is waiting for you."',
        type: 'gm',
        author: 'GM'
    });

    displayMessage({
        text: 'System: Alice, Bob, and Charlie have joined the adventure!',
        type: 'system',
        author: 'SYSTEM'
    });

    displayMessage({
        text: '크리스티앙이 거미를 공격합니다! Inhoi와 아슈발이 뒤를 지원합니다.',
        type: 'gm',
        author: 'GM'
    });

    displayMessage({
        text: 'Inhoi가 리아나를 향해 몸을 날렸다!',
        type: 'gm',
        author: 'GM'
    });
}

// Initialize when page loads
window.addEventListener('load', initializeTest); 