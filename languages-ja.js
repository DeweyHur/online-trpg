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
    characterDescriptionPlaceholder: "キャラクターの背景、性格、外見を説明してください...",
    joinGameButton: "ゲーム参加",
    existingPlayersHelp: "プレイヤーをクリックしてそのキャラクターとして参加するか、下で新しいキャラクターを作成してください。",
    newCharacterTitle: "新しいキャラクター作成",
    cancelButton: "キャンセル",

    // Game setup template
    gameSetupTemplate: "新しいTRPGゲームをプレイする予定です。世界は {worldDescription} で説明されています。主人公は {characterName} で、このゲームを開始したいと思います。人々は自由に参加したり去ったりできるので、この点を念頭に置いてください。\n\n最初のシーンを生き生きと描写してください。雰囲気を設定し、{characterName} に相互作用できる明確な開始状況を提供してください。環境、即座の挑戦や機会、そして {characterName} がこの瞬間に見たり、聞いたり、感じたりできるものを描写してください。",

    // Character joining template
    characterJoiningTemplate: "新しいキャラクター {characterName} が世界に参加しました。彼/彼女の背景は {background} です。そのキャラクターがこの状況にどのように参加するかを説明してください。",

    // Chat and actions
    playerActionPlaceholder: "何をしますか？ (マークダウン形式対応)",
    sendButton: "送信",
    leaveSessionButton: "セッション退出",

    // Messages
    gmThinking: "GMが考えています...",
    joinMessage: "{name}が冒険に参加しました！",
    playerLeftMessage: "{name}が冒険を去りました。",
    systemError: "システム",
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
    membersHelpText: "プレイヤーを右クリックしてセッションから削除できます。",
    promptMode: "アクションモード",
    chatMode: "チャットモード",
    promptPlaceholder: "どのような行動を取りますか？ (マークダウン形式対応)",
    chatPlaceholder: "他のプレイヤーとチャットしてください... (マークダウン形式対応)",
    sendActionButton: "行動を取る",
    sendChatButton: "チャット送信",
    toggleModeButton: "モード切り替え",
    removePlayerButton: "プレイヤー削除",
    confirmRemovePlayer: "{name}をセッションから削除してもよろしいですか？",

    // Turn system prompts
    turnPrompt: "現在のセッションメンバー: {playerList}\n\n次のプレイヤーの番です: ${currentTurn}$\n\nこのプレイヤーが行動を取る番です。他のプレイヤーはお待ちください。\n\nプレイヤーの行動後、${Turn=PlayerName}で次のプレイヤーの番を設定してください。メンバーリストにいるプレイヤーのみ使用してください。",
    chatPrompt: "現在のセッションメンバー: {playerList}\n\n現在 {currentTurn} の番です。\nあなたは {currentPlayerName} です。\n\nこれは一般的なチャットです。行動を取らないのでゲームを進行しないでください。\n\nプレイヤーの行動後、${Turn=PlayerName}で次のプレイヤーの番を設定してください。メンバーリストにいるプレイヤーのみ使用してください。",
    waitingText: "待機中",
    noPlayersText: "プレイヤーなし",

    // Stats system
    statsLanguageInstruction: "すべてのステータス名と値を日本語で記述してください。一貫した日本語スタイルを維持してください。",
    requestDetailedStatsButton: "📊 詳細ステータ스要求",

    // Prompt Templates
    promptTemplates: {
        characterStats: {
            title: "TRPGキャラクターの代表的なステータスを決定してください。",
            description: "キャラクターを分析し、代表的なステータスを提供してください。",
            format: "以下のCSV形式で代表的なステータスを提供してください:\ncharacter,stat_name,value",
            guidelines: [
                "キャラクターを最もよく説明する1-5個の代表的なステータスを生成してください",
                "視覚的な明確性のためにステータス名に絵文字を使用してください",
                "様々なステータス形式を使用してください: 再生可能なステータスは「3/5」（マナ、スタミナなど）、基本ステータスは「14」（力、敏捷性など）、現在/最大ステータスは「1/30」（体力など） - 再生可能なステータスのみ最大値を持ちます",
                "職業/種族などの重要な情報を絵文字形式で含めることができます（例: 🧙‍♂️魔法使い、🧝‍♀️エルフ）",
                "キャラクターの核心能力と特性を最もよく表すステータスを選択してください"
            ],
            return: "CSVデータのみを返してください、追加テキストなし"
        },

        batchStats: {
            title: "複数のTRPGキャラクターの代表的なステータスを決定してください。",
            description: "すべてのキャラクターに代表的なステータスを提供してください。",
            format: "以下のCSV形式ですべてのキャラクターの代表的なステータスを提供してください:\ncharacter,stat_name,value",
            guidelines: [
                "各キャラクターを最もよく説明する1-5個の代表的なステータスを生成してください",
                "視覚的な明確性のためにステータス名に絵文字を使用してください",
                "同じステータスタイプについてすべてのキャラクターで一貫した絵文字を使用してください",
                "様々なステータス形式を使用してください: 再生可能なステータスは「3/5」（マナ、スタミナなど）、基本ステータスは「14」（力、敏捷性など）、現在/最大ステータスは「1/30」（体力など） - 再生可能なステータスのみ最大値を持ちます",
                "職業/種族などの重要な情報を絵文字形式で含めることができます（例: 🧙‍♂️魔法使い、🧝‍♀️エルフ）",
                "各キャラクターの核心能力と特性を最もよく表すステータスを選択してください"
            ],
            return: "CSVデータのみを返してください、追加テキストなし"
        }
    }
};

// Export for use in other files
if (typeof window !== 'undefined') {
    window.LANGUAGES_JA = LANGUAGES_JA;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { LANGUAGES_JA };
} 