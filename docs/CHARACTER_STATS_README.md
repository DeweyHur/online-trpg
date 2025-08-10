# Character Stats System

The Character Stats System allows GMs to track and display character statistics in a flexible way that works with any TRPG system.

## Features

- **Flexible Stats**: Support for any type of character stats (HP, MP, STR, DEF, etc.)
- **Short Display**: Key stats shown below member names in the member list
- **Detailed View**: Full stats available in right-click context menu
- **Template System**: Pre-built templates for different RPG genres
- **Command Integration**: Uses the existing `${}` command system

## How It Works

### 1. AI-Powered Stats Generation

Instead of hardcoded templates, the system uses Gemini AI to determine appropriate stats:

- **Ask Gemini for Templates**: Describe your campaign setting and let Gemini suggest appropriate stat categories
- **Ask Gemini for Character Stats**: Describe characters and let Gemini generate appropriate stats
- **Dynamic Adaptation**: Stats automatically adapt to your campaign's genre and theme
- **Manual Override**: Still supports manual stat setting if preferred

### 2. AI-Powered Command System

The GM can ask Gemini to generate appropriate stats and templates:

#### Ask Gemini for Campaign Template
```
Please analyze this TRPG campaign setting and determine appropriate stat categories.

Campaign Setting: A medieval fantasy campaign with magic, dragons, and epic quests.

I need you to provide stat categories in this exact JSON format:
{
  "template": "custom",
  "short": ["<primary_stat1>", "<primary_stat2>"],
  "detailed": ["<stat1>", "<stat2>", "<stat3>", "<stat4>", "<stat5>", "<stat6>", "<stat7>", "<stat8>"]
}

Return ONLY the JSON object, no additional text.
```

#### Ask Gemini for Character Stats
```
I need you to determine appropriate character stats for a TRPG character.

Character Name: Elshikh
Character Description: A burdened spirit, a ghost haunted by past transgressions and suffering. You feel a "deafening" scream and are anchored by heavy chains of guilt.
Campaign Context: Supernatural horror campaign focused on spirits and redemption

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
- Stats should reflect the character's abilities, condition, or state

Return ONLY the JSON object, no additional text.
```

#### Manual Commands (Still Supported)
```
${Template={"template": "fantasy"}}
${Stats={"character": "Gandalf", "stats": {"HP": 45, "MP": 80, "STR": 12, "WIS": 18}}}
```

### 3. Display

- **Short Stats**: Displayed below member names (e.g., "HP: 45 • MP: 80")
- **Detailed Stats**: Available in right-click context menu with full stat breakdown

## Usage Examples

### Example 1: Ask Gemini for Fantasy Campaign Template
GM sends: "Please analyze this TRPG campaign setting and determine appropriate stat categories.

Campaign Setting: A medieval fantasy campaign set in the kingdom of Eldoria. Players are adventurers exploring ancient ruins, fighting monsters, and uncovering magical secrets. The world has magic, dragons, elves, dwarves, and humans. Characters can be warriors, mages, rogues, clerics, or rangers.

I need you to provide stat categories in this exact JSON format:
{
  "template": "custom",
  "short": ["<primary_stat1>", "<primary_stat2>"],
  "detailed": ["<stat1>", "<stat2>", "<stat3>", "<stat4>", "<stat5>", "<stat6>", "<stat7>", "<stat8>"]
}

Return ONLY the JSON object, no additional text."

### Example 2: Ask Gemini for Character Stats
GM sends: "I need you to determine appropriate character stats for a TRPG character.

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
- Stats should reflect the character's abilities, condition, or state

Return ONLY the JSON object, no additional text."

### Example 3: Manual Override (Still Supported)
GM sends: "${Stats={"character": "Gandalf", "stats": {"HP": 45, "MP": 80, "STR": 12, "WIS": 18}}}"

## Technical Details

### Database Schema
- `character_stats`: JSONB column storing character stats
- `stats_template`: TEXT column storing current template name

### File Structure
- `character-stats.js`: Main character stats manager
- `turn-system.js`: Updated to integrate with stats system
- `game-core.js`: Updated to initialize stats manager

### Integration Points
- Member list display shows short stats
- Context menu shows detailed stats
- Commands processed through existing `${}` system
- Session data includes stats for persistence

## API Commands

### Stats Command Format
```
${Stats={"character": "CharacterName", "stats": {"StatName": "Value"}}}
```

### Template Command Format
```
${Template={"template": "templateName"}}
```

### Custom Template Format
```
${Template={"template": "custom", "short": ["Stat1", "Stat2"], "detailed": ["Stat1", "Stat2", "Stat3"]}}
```

## Best Practices

1. **Consistent Naming**: Use consistent stat names across all characters
2. **Template First**: Set the template before adding character stats
3. **Clear Values**: Use clear, descriptive values (numbers, percentages, etc.)
4. **Regular Updates**: Update stats when they change in the story
5. **Backup Data**: The system automatically saves stats to the database

## Troubleshooting

### Stats Not Showing
- Check that the character name matches exactly
- Verify the template is set correctly
- Ensure the stats command format is correct

### Template Issues
- Use one of the predefined templates: "default", "fantasy", "scifi"
- For custom templates, provide both "short" and "detailed" arrays
- Template names are case-sensitive

### Database Issues
- Character stats are stored in JSONB format
- Check that the migration has been applied
- Verify database permissions

## Future Enhancements

- Visual stat bars/progress indicators
- Stat change history tracking
- Export/import character sheets
- Integration with dice rolling system
- Stat-based automation features 