# Gemini Character Stats Prompts Guide

This guide shows GMs how to prompt Gemini to automatically generate appropriate character stats and templates for their TRPG campaigns.

## 🎯 **How It Works**

Instead of manually setting stats, you can ask Gemini to analyze characters and campaigns to determine appropriate stats. The system will automatically process Gemini's responses and update character stats.

## 📝 **Prompt Templates**

### **1. Ask Gemini to Set Campaign Template**

**Prompt:**
```
Please analyze this TRPG campaign setting and determine appropriate stat categories.

Campaign Setting: [Describe your campaign - genre, theme, setting, etc.]

I need you to provide stat categories in this exact JSON format:
{
  "template": "custom",
  "short": ["<primary_stat1>", "<primary_stat2>"],
  "detailed": ["<stat1>", "<stat2>", "<stat3>", "<stat4>", "<stat5>", "<stat6>", "<stat7>", "<stat8>"]
}

Guidelines:
- "short" should contain 2-3 most important stats displayed below character names
- "detailed" should contain 6-10 stats shown in the detailed view
- Use appropriate stat names for the setting
- Consider the genre and theme

Return ONLY the JSON object, no additional text.
```

**Example Campaign Descriptions:**
- "A cyberpunk sci-fi campaign where players are hackers and corporate agents"
- "A medieval fantasy campaign with magic, dragons, and epic quests"
- "A post-apocalyptic survival campaign with limited resources"
- "A superhero campaign with powers and secret identities"

### **2. Ask Gemini to Generate Character Stats**

**Prompt:**
```
I need you to determine appropriate character stats for a TRPG character.

Character Name: [Character Name]
Character Description: [Describe the character - role, background, personality, etc.]
Campaign Context: [Brief description of the campaign setting]

Please provide stats in this exact JSON format:
{
  "character": "[Character Name]",
  "stats": {
    "<stat_name_1>": <value>,
    "<stat_name_2>": <value>,
    "<stat_name_3>": <value>,
    "<stat_name_4>": <value>,
    "<stat_name_5>": <value>
  }
}

Guidelines:
- Create 3-8 stats that are appropriate for this character and campaign setting
- Use descriptive stat names that fit the genre and theme
- Values can be numbers, percentages, or descriptive text
- Consider the character's role, background, and campaign context
- Stats should reflect the character's abilities, condition, or state

Examples of different stat types:
- Traditional RPG: HP, MP, STR, DEX, etc.
- Horror/Supernatural: Sanity, Corruption, Spiritual Debt, etc.
- Sci-fi: Energy, Tech Level, Cybernetics, etc.
- Social: Reputation, Influence, Connections, etc.

Return ONLY the JSON object, no additional text.
```

## 🎮 **Example Prompts**

### **Fantasy Campaign Setup**

**GM to Gemini:**
```
Please analyze this TRPG campaign setting and determine appropriate stat categories.

Campaign Setting: A medieval fantasy campaign set in the kingdom of Eldoria. Players are adventurers exploring ancient ruins, fighting monsters, and uncovering magical secrets. The world has magic, dragons, elves, dwarves, and humans. Characters can be warriors, mages, rogues, clerics, or rangers.

I need you to provide stat categories in this exact JSON format:
{
  "template": "custom",
  "short": ["<primary_stat1>", "<primary_stat2>"],
  "detailed": ["<stat1>", "<stat2>", "<stat3>", "<stat4>", "<stat5>", "<stat6>", "<stat7>", "<stat8>"]
}

Guidelines:
- "short" should contain 2-3 most important stats displayed below character names
- "detailed" should contain 6-10 stats shown in the detailed view
- Use appropriate stat names for the setting
- Consider the genre and theme

Return ONLY the JSON object, no additional text.
```

**Expected Gemini Response:**
```json
{
  "template": "custom",
  "short": ["HP", "MP"],
  "detailed": ["HP", "MP", "STR", "DEX", "CON", "INT", "WIS", "CHA", "AC", "Initiative"]
}
```

### **Sci-fi Campaign Setup**

**GM to Gemini:**
```
Please analyze this TRPG campaign setting and determine appropriate stat categories.

Campaign Setting: A cyberpunk sci-fi campaign set in Neo-Tokyo 2087. Players are hackers, corporate agents, street samurai, and tech-wizards navigating a world of cybernetic implants, virtual reality, and corporate espionage. Technology and social skills are as important as combat.

I need you to provide stat categories in this exact JSON format:
{
  "template": "custom",
  "short": ["<primary_stat1>", "<primary_stat2>"],
  "detailed": ["<stat1>", "<stat2>", "<stat3>", "<stat4>", "<stat5>", "<stat6>", "<stat7>", "<stat8>"]
}

Guidelines:
- "short" should contain 2-3 most important stats displayed below character names
- "detailed" should contain 6-10 stats shown in the detailed view
- Use appropriate stat names for the setting
- Consider the genre and theme

Return ONLY the JSON object, no additional text.
```

**Expected Gemini Response:**
```json
{
  "template": "custom",
  "short": ["Health", "Energy"],
  "detailed": ["Health", "Energy", "Strength", "Agility", "Intelligence", "Tech", "Combat", "Social"]
}
```

### **Character Generation**

**GM to Gemini:**
```
I need you to determine appropriate character stats for a TRPG character.

Character Name: Elshikh
Character Description: A burdened spirit, a ghost haunted by past transgressions and suffering. You feel a "deafening" scream and are anchored by heavy chains of guilt. Your essence is "loud" to other spirits, and you're bound to the earthly plane through your past actions and physical remains.
Campaign Context: Supernatural horror campaign focused on spirits, redemption, and the weight of past actions

Please provide stats in this exact JSON format:
{
  "character": "Elshikh",
  "stats": {
    "<stat_name_1>": <value>,
    "<stat_name_2>": <value>,
    "<stat_name_3>": <value>,
    "<stat_name_4>": <value>,
    "<stat_name_5>": <value>
  }
}

Guidelines:
- Create 3-8 stats that are appropriate for this character and campaign setting
- Use descriptive stat names that fit the genre and theme
- Values can be numbers, percentages, or descriptive text
- Consider the character's role, background, and campaign context
- Stats should reflect the character's abilities, condition, or state

Return ONLY the JSON object, no additional text.
```

**Expected Gemini Response:**
```json
{
  "character": "Elshikh",
  "stats": {
    "Spiritual Debt": "9/10",
    "Internal Torment": "8/10",
    "Ethereal Presence": "7/10",
    "Lingering Resolve": "5/10",
    "Mortal Tether": "8/10"
  }
}
```

## 🔧 **Integration with TRPG System**

### **Automatic Processing**

When Gemini responds with the correct JSON format, the system will automatically:

1. **For Template Responses**: Update the stat categories for the campaign
2. **For Character Stats**: Add or update the character's stats
3. **Display Updates**: Show the new stats in the member list and context menu

### **Manual Override**

If you want to manually set stats instead of using Gemini, you can still use the original commands:

```
${Template={"template": "fantasy"}}
${Stats={"character": "Gandalf", "stats": {"HP": 45, "MP": 80, "STR": 12, "WIS": 18}}}
```

## 🎯 **Best Practices**

1. **Be Specific**: Provide detailed character and campaign descriptions
2. **Use Clear Context**: Explain the genre, setting, and tone
3. **Follow the Format**: Ensure Gemini returns only the JSON object
4. **Test Responses**: Verify the stats make sense for your campaign
5. **Iterate**: Ask Gemini to adjust stats if they don't fit

## 🚀 **Advanced Usage**

### **Dynamic Stat Updates**

You can ask Gemini to update character stats during gameplay:

**Prompt:**
```
Update the stats for Shadow Blade after taking 15 damage in combat and using a healing stim.

Current Stats: HP: 85, MP: 0, STR: 14, DEX: 18, CON: 16, INT: 12, WIS: 10, CHA: 8

Provide updated stats in JSON format.
```

### **Campaign Evolution**

As your campaign evolves, ask Gemini to adjust the stat template:

**Prompt:**
```
Our campaign has evolved to include more social intrigue and less combat. Please suggest updated stat categories that emphasize social skills and relationships.
```

### **Helper Functions**

The system includes helper functions to generate prompts:

**For Character Stats:**
```javascript
generateCharacterStatsPrompt("Elshikh", "A burdened spirit haunted by past transgressions", "Supernatural horror campaign")
```

**For Campaign Templates:**
```javascript
generateCampaignTemplatePrompt("A cyberpunk sci-fi campaign set in Neo-Tokyo 2087")
```

### **Error Handling**

If Gemini doesn't return the right format, the system will:
1. Detect invalid JSON or missing fields
2. Provide the exact prompt that should be used
3. Give clear instructions on what format is expected
4. Allow you to retry with the corrected prompt

This system allows for dynamic, AI-assisted character and campaign management that adapts to your specific TRPG needs! 