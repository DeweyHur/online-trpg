// --- UI & DISPLAY FUNCTIONS ---

// --- MARKDOWN & FORMATTING FUNCTIONS ---
function getPlayerColor(playerName) {
    // Use the same logic as MemberManager for consistency
    const colors = [
        'text-red-400', 'text-blue-400', 'text-green-400', 'text-yellow-400',
        'text-purple-400', 'text-pink-400', 'text-indigo-400', 'text-emerald-400'
    ];

    // Get unique players from current session if available
    let uniquePlayers = [];
    if (window.currentSession && window.currentSession.players) {
        uniquePlayers = [...new Set(Object.values(window.currentSession.players))];
    } else if (window.turnSystem && window.turnSystem.players) {
        uniquePlayers = [...new Set(Object.values(window.turnSystem.players))];
    }

    const index = uniquePlayers.indexOf(playerName);
    return colors[index % colors.length];
}

function formatText(format) {
    const textarea = document.getElementById('player-action');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);

    let replacement = '';
    let cursorOffset = 0;

    switch (format) {
        case 'bold':
            replacement = `**${selectedText}**`;
            cursorOffset = 2;
            break;
        case 'italic':
            replacement = `*${selectedText}*`;
            cursorOffset = 1;
            break;
        case 'code':
            replacement = `\`${selectedText}\``;
            cursorOffset = 1;
            break;
        case 'quote':
            replacement = `> ${selectedText}`;
            cursorOffset = 2;
            break;
        case 'link':
            replacement = `[${selectedText}](url)`;
            cursorOffset = -3;
            break;
        case 'list':
            if (selectedText) {
                replacement = `- ${selectedText}`;
                cursorOffset = 2;
            } else {
                replacement = `- `;
                cursorOffset = 2;
            }
            break;
        case 'heading':
            replacement = `# ${selectedText}`;
            cursorOffset = 2;
            break;
    }

    textarea.value = textarea.value.substring(0, start) + replacement + textarea.value.substring(end);
    textarea.focus();
    textarea.setSelectionRange(start + replacement.length + cursorOffset, start + replacement.length + cursorOffset);
}

// Function to highlight player names in text with their colors
function highlightPlayerNames(text) {
    if (!window.currentSession || !window.currentSession.players) {
        console.log('⚠️ No session data available for highlighting');
        return text;
    }

    // Get all player names from the current session
    const playerNames = Object.values(window.currentSession.players);

    if (playerNames.length === 0) {
        return text;
    }

    // Create a copy of the text to modify
    let highlightedText = text;
    let highlightCount = 0;

    // Sort player names by length (longest first) to avoid partial matches
    const sortedPlayerNames = playerNames.sort((a, b) => b.length - a.length);

    // Replace each player name with a colored version
    sortedPlayerNames.forEach(playerName => {
        if (playerName && playerName.trim()) {
            const playerColor = getPlayerColor(playerName);
            // Escape special regex characters in player name
            const escapedName = playerName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

            // Create a more robust regex that handles Korean and Unicode characters
            // Use a simple approach: match the name with surrounding non-word characters
            const regex = new RegExp(`(^|[^\\w])${escapedName}([^\\w]|$)`, 'gi');

            const matches = highlightedText.match(regex);
            if (matches) {
                highlightCount += matches.length;
            }
            // Replace with captured groups preserved
            highlightedText = highlightedText.replace(regex, `$1<span class="${playerColor} font-semibold">${playerName}</span>$2`);
        }
    });

    // Removed console log to reduce spam

    return highlightedText;
}

// --- MESSAGE DISPLAY ---
function displayMessage({ text, type, author = 'GM' }) {
    // console.log('📝 Displaying message:', { text, type, author });

    const messageEl = document.createElement('div');
    messageEl.classList.add('mb-4');

    let bgColor = 'bg-gray-700';
    let textColor = 'text-white';
    let authorPrefix = `<strong>[${author}]</strong>: `;

    switch (type) {
        case 'system':
            bgColor = 'bg-yellow-900';
            textColor = 'text-yellow-200';
            authorPrefix = `<em>[${languageManager.getText('systemError')}]</em>: `;
            break;
        case 'player':
            bgColor = 'bg-blue-900';
            textColor = 'text-blue-200';
            // Add player color class to author name
            const playerColor = getPlayerColor(author);
            authorPrefix = `<strong class="${playerColor}">[${author}]</strong>: `;
            break;
        case 'error':
            bgColor = 'bg-red-900';
            textColor = 'text-red-200';
            authorPrefix = `<strong>[${languageManager.getText('error')}]</strong>: `;
            break;
        case 'gm':
            bgColor = 'bg-gray-700';
            textColor = 'text-indigo-200';
            break;
    }

    messageEl.classList.add(bgColor, textColor, 'p-3', 'rounded-lg', 'shadow');

    // Highlight player names in the text before parsing markdown
    // Apply to all message types, not just player messages
    const highlightedText = highlightPlayerNames(text);

    // Parse markdown and render it
    const markdownText = marked.parse(highlightedText);
    messageEl.innerHTML = `${authorPrefix}<div class="markdown-content">${markdownText}</div>`;

    const chatLog = document.getElementById('chat-log');
    if (!chatLog) {
        console.error('❌ Chat log element not found!');
        return;
    }

    // console.log('📝 Adding message to chat log:', messageEl.innerHTML);
    chatLog.appendChild(messageEl);

    // Only auto-scroll if user is already at the bottom (within 50px)
    const isAtBottom = chatLog.scrollHeight - chatLog.clientHeight - chatLog.scrollTop < 50;
    if (isAtBottom) {
        chatLog.scrollTop = chatLog.scrollHeight;
    }

    // console.log('📝 Message added successfully. Chat log children:', chatLog.children.length);
}

// --- MODAL & CONFIRMATION ---
function createCustomConfirm(message) {
    return new Promise((resolve) => {
        const backdrop = document.createElement('div');
        backdrop.className = 'confirm-modal-backdrop';

        const modal = document.createElement('div');
        modal.className = 'confirm-modal';

        const messageEl = document.createElement('p');
        messageEl.textContent = message;
        messageEl.className = 'text-lg mb-6';

        const btnContainer = document.createElement('div');
        btnContainer.className = 'flex justify-end space-x-4';

        const yesBtn = document.createElement('button');
        yesBtn.textContent = languageManager.getText('yes');
        yesBtn.className = 'bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md transition duration-300';

        const noBtn = document.createElement('button');
        noBtn.textContent = languageManager.getText('no');
        noBtn.className = 'bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-md transition duration-300';

        yesBtn.onclick = () => {
            document.body.removeChild(backdrop);
            resolve(true);
        };

        noBtn.onclick = () => {
            document.body.removeChild(backdrop);
            resolve(false);
        };

        btnContainer.appendChild(noBtn);
        btnContainer.appendChild(yesBtn);
        modal.appendChild(messageEl);
        modal.appendChild(btnContainer);
        backdrop.appendChild(modal);
        document.body.appendChild(backdrop);
    });
}

// --- PREVIEW & TOOLTIP FUNCTIONS ---
function updatePreview() {
    const inputElement = document.getElementById('player-action');
    const previewArea = document.getElementById('preview-area');
    const text = inputElement.value.trim();

    if (text) {
        // Highlight player names in preview
        const highlightedText = highlightPlayerNames(text);
        const markdownText = marked.parse(highlightedText);
        previewArea.innerHTML = `<div class="markdown-content">${markdownText}</div>`;
        previewArea.classList.remove('hidden');
    } else {
        previewArea.classList.add('hidden');
    }
}

function updateTooltips() {
    // Update tooltips for formatting buttons
    const formatButtons = document.querySelectorAll('[data-format]');
    formatButtons.forEach(button => {
        const format = button.getAttribute('data-format');
        const tooltip = languageManager.getText(`format${format.charAt(0).toUpperCase() + format.slice(1)}`);
        button.title = tooltip;
    });
}

// --- CHAT RENDERING ---
function reRenderChatHistory() {
    console.log('🔄 Re-rendering chat history with updated highlighting');
    const chatLog = document.getElementById('chat-log');
    const currentScroll = chatLog.scrollTop;
    const wasAtBottom = chatLog.scrollHeight - chatLog.clientHeight - chatLog.scrollTop < 50;

    // Clear chat
    chatLog.innerHTML = '';

    // Re-render all messages with current highlighting
    if (window.chatHistory) {
        window.chatHistory.forEach(msg => {
            displayMessage({
                text: msg.parts[0].text,
                type: msg.role === 'model' ? 'gm' : 'player',
                author: msg.author || (msg.role === 'model' ? 'GM' : 'Player')
            });
        });
    }

    // Restore scroll position
    if (wasAtBottom) {
        chatLog.scrollTop = chatLog.scrollHeight;
    } else {
        chatLog.scrollTop = currentScroll;
    }
}

// --- PLAYER LIST UTILITIES ---
function checkPlayerListChanges(previousPlayers, currentPlayers) {
    const prevSet = new Set(previousPlayers);
    const currSet = new Set(currentPlayers);

    const added = [...currSet].filter(player => !prevSet.has(player));
    const removed = [...prevSet].filter(player => !currSet.has(player));

    return {
        added,
        removed,
        hasChanges: added.length > 0 || removed.length > 0
    };
} 