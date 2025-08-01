// Japanese language definitions for the TRPG application
// Example of how to add a new language
const LANGUAGES_JA = {
    // Page title and headers
    pageTitle: "マルチプレイヤー TRPG - サーバーゲートウェイ",
    mainTitle: "マルチプレイヤー TRPG",
    gameTitle: "TRPG セッション",

    // Session creation
    createSessionTitle: "新しいセッションを作成",
    geminiApiKeyPlaceholder: "Gemini API キーを入力してください",
    startingPromptPlaceholder: "開始背景とあなたが誰かを説明してください...",
    createSessionButton: "セッション作成",

    // Session joining
    joinSessionTitle: "既存のセッションに参加",
    sessionIdPlaceholder: "セッション ID を入力",
    joinSessionButton: "セッション参加",

    // Game interface
    sessionIdLabel: "セッション ID:",
    playingAsLabel: "プレイヤー:",
    createCharacterTitle: "キャラクター作成",
    characterNamePlaceholder: "キャラクター名を入力してください",
    joinGameButton: "ゲーム参加",

    // Chat and actions
    playerActionPlaceholder: "何をしますか？ (マークダウン形式対応)",
    sendButton: "送信",
    leaveSessionButton: "セッション退出",

    // Messages
    gmThinking: "GMが考えています...",
    joinMessage: "{name}が冒険に参加しました！",
    systemError: "システムエラー",
    error: "エラー",

    // Validation messages
    apiKeyRequired: "API キーと開始プロンプトが必要です。確認しますか？",
    sessionIdRequired: "セッション ID を入力してください。",
    characterNameRequired: "キャラクター名を入力してください。確認しますか？",

    // Error messages
    couldNotCreateSession: "セッションを作成できませんでした: {error}",
    couldNotJoinSession: "ゲームに参加できませんでした: {error}",
    errorJoiningSession: "セッション参加エラー: {error}",
    gmError: "GM エラー: {error}",
    errorSendingAction: "エラー: {error}",

    // Confirmation dialogs
    leaveSessionConfirm: "本当にセッションを退出しますか？",

    // Formatting toolbar
    boldTooltip: "太字 (Ctrl+B)",
    italicTooltip: "斜体 (Ctrl+I)",
    codeTooltip: "コード",
    quoteTooltip: "引用",
    linkTooltip: "リンク",
    listTooltip: "リスト",
    headingTooltip: "見出し",
    previewTooltip: "プレビュー切り替え",

    // Preview
    previewPlaceholder: "プレビューがここに表示されます...",

    // Buttons
    yes: "はい",
    no: "いいえ",

    // Turn system
    membersTitle: "メンバー",
    promptMode: "アクションモード",
    chatMode: "チャットモード",
    promptPlaceholder: "どのような行動を取りますか？ (マークダウン形式対応)",
    chatPlaceholder: "他のプレイヤーとチャットしてください... (マークダウン形式対応)",
    sendActionButton: "行動を取る",
    sendChatButton: "チャット送信",
    toggleModeButton: "モード切り替え",
    removePlayerButton: "プレイヤー削除",

    // Turn system prompts
    turnPrompt: "現在のセッションメンバー: {playerList}\n\n次のプレイヤーの番です: ${currentTurn}$\n\nこのプレイヤーが行動を取る番です。他のプレイヤーはお待ちください。",
    chatPrompt: "現在のセッションメンバー: {playerList}\n\n現在 {currentTurn} の番です。\nあなたは {currentPlayerName} です。\n\nこれは一般的なチャットです。行動を取らないのでゲームを進行しないでください。",
    waitingText: "待機中",
    noPlayersText: "プレイヤーなし"
};

// Export for use in other files
if (typeof window !== 'undefined') {
    window.LANGUAGES_JA = LANGUAGES_JA;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { LANGUAGES_JA };
} 