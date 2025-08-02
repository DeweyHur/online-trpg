// Korean language definitions for the TRPG application
const LANGUAGES_KO = {
    // Page title and headers
    pageTitle: "멀티플레이어 TRPG - 서버 게이트웨이",
    mainTitle: "멀티플레이어 TRPG",
    gameTitle: "TRPG 세션",

    // Session creation
    createSessionTitle: "새 세션 만들기",
    geminiApiKeyPlaceholder: "Gemini API 키를 입력하세요",
    startingPromptPlaceholder: "시작 배경과 당신이 누구인지 설명하세요...",
    createSessionButton: "세션 만들기",

    // Session joining
    joinSessionTitle: "기존 세션 참가하기",
    sessionIdPlaceholder: "세션 ID 입력",
    joinSessionButton: "세션 참가",

    // Game interface
    sessionIdLabel: "세션 ID:",
    playingAsLabel: "플레이어:",
    createCharacterTitle: "캐릭터 만들기",
    characterNamePlaceholder: "캐릭터 이름을 입력하세요",
    joinGameButton: "게임 참가",

    // Chat and actions
    playerActionPlaceholder: "무엇을 하시겠습니까? (마크다운 형식 지원)",
    sendButton: "전송",
    leaveSessionButton: "세션 나가기",

    // Messages
    gmThinking: "GM이 생각하고 있습니다...",
    joinMessage: "{name}님이 모험에 참가했습니다!",
    playerLeftMessage: "{name}님이 모험을 떠났습니다.",
    systemError: "시스템",
    error: "오류",

    // Validation messages
    apiKeyRequired: "API 키와 시작 프롬프트가 필요합니다. 확인하시겠습니까?",
    sessionIdRequired: "세션 ID를 입력해주세요.",
    characterNameRequired: "캐릭터 이름을 입력해주세요. 확인하시겠습니까?",

    // Error messages
    couldNotCreateSession: "세션을 만들 수 없습니다: {error}",
    couldNotJoinSession: "게임에 참가할 수 없습니다: {error}",
    errorJoiningSession: "세션 참가 오류: {error}",
    gmError: "GM 오류: {error}",
    errorSendingAction: "오류: {error}",

    // Confirmation dialogs
    leaveSessionConfirm: "정말로 세션을 나가시겠습니까?",

    // Formatting toolbar
    boldTooltip: "굵게 (Ctrl+B)",
    italicTooltip: "기울임 (Ctrl+I)",
    codeTooltip: "코드",
    quoteTooltip: "인용",
    linkTooltip: "링크",
    listTooltip: "목록",
    headingTooltip: "제목",
    previewTooltip: "미리보기 토글",

    // Preview
    previewPlaceholder: "미리보기가 여기에 나타납니다...",

    // Buttons
    yes: "예",
    no: "아니오",

    // Turn system
    membersTitle: "멤버",
    membersHelpText: "플레이어를 우클릭하여 세션에서 제거할 수 있습니다.",
    promptMode: "행동 모드",
    chatMode: "채팅 모드",
    promptPlaceholder: "어떤 행동을 취하시겠습니까? (마크다운 형식 지원)",
    chatPlaceholder: "다른 플레이어들과 채팅하세요... (마크다운 형식 지원)",
    sendActionButton: "행동 취하기",
    sendChatButton: "채팅 보내기",
    toggleModeButton: "모드 전환",
    removePlayerButton: "플레이어 제거",
    confirmRemovePlayer: "{name}을(를) 세션에서 제거하시겠습니까?",

    // Turn system prompts
    turnPrompt: "현재 세션 멤버들: {playerList}\n\n다음 플레이어의 차례입니다: ${currentTurn}$\n\n이 플레이어가 행동할 차례입니다. 다른 플레이어들은 기다려주세요.\n\n플레이어의 행동 후, ${Turn=PlayerName}으로 다음 플레이어의 차례를 설정해주세요. 멤버 목록에 있는 플레이어만 사용하세요.",
    chatPrompt: "현재 세션 멤버들: {playerList}\n\n현재 {currentTurn}의 차례입니다. \n당신은 {currentPlayerName}입니다.\n\n이것은 일반 채팅입니다. 행동을 취하지 않으므로 게임을 진행하지 마세요.\n\n플레이어의 행동 후, ${Turn=PlayerName}으로 다음 플레이어의 차례를 설정해주세요. 멤버 목록에 있는 플레이어만 사용하세요.",
    waitingText: "대기 중",
    noPlayersText: "플레이어 없음"
};

// Export for use in other files
if (typeof window !== 'undefined') {
    window.LANGUAGES_KO = LANGUAGES_KO;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { LANGUAGES_KO };
} 