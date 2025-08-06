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
    joinGameTitle: "게임 참가",
    characterNamePlaceholder: "캐릭터 이름을 입력하세요",
    joinGameButton: "게임 참가",
    newCharacterButton: "새 캐릭터 생성",
    creatingCharacter: "생성 중...",
    existingPlayersTitle: "기존 플레이어",

    // Game setup template
    gameSetupTemplate: "새로운 TRPG 게임을 플레이할 예정입니다. 세계는 {worldDescription}로 설명됩니다. 주인공은 {characterName}이고 이 게임을 시작하고 싶습니다. 사람들이 자유롭게 참가하고 떠날 수 있으니 이 점을 염두에 두세요.",
    existingPlayersHelp: "플레이어를 클릭하여 해당 캐릭터로 참가하거나, 아래에서 새 캐릭터를 생성하세요.",
    newCharacterTitle: "새 캐릭터 생성",
    cancelButton: "취소",

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
    noPlayersText: "플레이어 없음",

    // Stats system
    statsLanguageInstruction: "모든 스탯 이름과 값을 한국어로 작성해주세요. 일관된 한국어 스타일을 유지해주세요.",
    campaignSettingLabel: "캠페인 설정:",
    characterNameLabel: "캐릭터 이름:",
    characterDescriptionLabel: "캐릭터 설명:",
    campaignContextLabel: "캠페인 맥락:",

    // Stats display settings
    shortStatsCount: 3,
    shortStatsSeparator: " • ",
    shortStatsClass: "text-xs text-gray-400",
    detailedStatsClass: "text-sm text-gray-400",
    noStatsMessage: "스탯이 없습니다",
    statsLabelClass: "text-sm font-medium",
    statsValueClass: "text-sm text-gray-300",


    // Prompt Templates
    promptTemplates: {
        characterStats: {
            title: "TRPG 캐릭터의 대표적인 스탯을 결정해주세요.",
            description: "캐릭터를 분석하고 대표적인 스탯을 제공해주세요.",
            format: "다음 CSV 형식으로 대표적인 스탯을 제공해주세요:\ncharacter,stat_name,value",
            guidelines: [
                "캐릭터를 가장 잘 설명하는 1-5개의 대표적인 스탯을 생성하세요",
                "시각적 명확성을 위해 스탯 이름에 이모지를 사용하세요",
                "다양한 스탯 형식을 사용하세요: 재생 가능한 스탯은 '3/5' (마나, 스태미나 등), 기본 스탯은 '14' (힘, 민첩성 등), 현재/최대 스탯은 '1/30' (체력 등) - 재생 가능한 스탯만 최대값을 가집니다",
                "직업/종족과 같은 필수 정보를 이모지 형식으로 포함할 수 있습니다 (예: 🧙‍♂️마법사, 🧝‍♀️엘프)",
                "캐릭터의 핵심 능력과 특성을 가장 잘 나타내는 스탯을 선택하세요"
            ],
            return: "CSV 데이터만 반환하세요, 추가 텍스트 없이"
        },

        batchStats: {
            title: "여러 TRPG 캐릭터의 대표적인 스탯을 결정해주세요.",
            description: "모든 캐릭터에 대해 대표적인 스탯을 제공해주세요.",
            format: "다음 형식으로 모든 캐릭터의 대표적인 스탯을 제공해주세요:\ncharacter|stat_name|value",
            guidelines: [
                "각 캐릭터를 가장 잘 설명하는 1-5개의 대표적인 스탯을 생성하세요",
                "시각적 명확성을 위해 스탯 이름에 이모지를 사용하세요",
                "같은 스탯 유형에 대해 모든 캐릭터에서 일관된 이모지를 사용하세요",
                "다양한 스탯 형식을 사용하세요: 재생 가능한 스탯은 '3/5' (마나, 스태미나 등), 기본 스탯은 '14' (힘, 민첩성 등), 현재/최대 스탯은 '1/30' (체력 등) - 재생 가능한 스탯만 최대값을 가집니다",
                "직업/종족과 같은 필수 정보를 이모지 형식으로 포함할 수 있습니다 (예: 🧙‍♂️마법사, 🧝‍♀️엘프)",
                "각 캐릭터의 핵심 능력과 특성을 가장 잘 나타내는 스탯을 선택하세요"
            ],
            return: "CSV 데이터만 반환하세요, 추가 텍스트 없이"
        },

        detailedStats: {
            title: "여러 TRPG 캐릭터의 포괄적인 스탯을 결정해주세요.",
            description: "모든 캐릭터에 대해 상세하고 포괄적인 스탯을 전체 설명과 함께 제공해주세요.",
            format: "다음 형식으로 모든 캐릭터의 상세한 스탯을 제공해주세요:\ncharacter|stat_name|value|description",
            guidelines: [
                "각 캐릭터를 완전히 설명하는 6-15개의 포괄적인 스탯을 생성하세요",
                "시각적 명확성을 위해 이모지가 포함된 설명적인 스탯 이름을 사용하세요",
                "각 스탯이 무엇을 나타내는지 설명하는 상세한 설명을 포함하세요",
                "다양한 스탯 형식을 사용하세요: 재생 가능한 스탯은 '3/5', 기본 스탯은 '14', 현재/최대 스탯은 '1/30'",
                "기본 스탯(힘, 지능 등)과 특화된 스탯(마법 친화도, 사회적 영향력 등)을 모두 포함하세요",
                "설명 열에서 각 스탯에 대한 한 줄 설명을 제공하세요",
                "캐릭터의 능력, 배경, 특성을 포괄적으로 나타내는 스탯을 선택하세요"
            ],
            return: "CSV 데이터만 반환하세요, 추가 텍스트 없이"
        }
    }
};

// Export for use in other files
if (typeof window !== 'undefined') {
    window.LANGUAGES_KO = LANGUAGES_KO;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { LANGUAGES_KO };
} 