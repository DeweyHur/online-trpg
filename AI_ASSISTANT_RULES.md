# AI Assistant Rules for TRPG Stats Generation

## Core Principles

### 1. **Do NOT Specify Stats to Gemini**
- **NEVER** tell Gemini which specific stats to use
- **NEVER** provide a list of required emojis or stat names
- **NEVER** force specific stat categories
- Let Gemini evaluate and choose the most appropriate stats naturally

### 2. **Short Stats (Representative Stats with Emoji)**
- Purpose: Quick visual representation of character's core abilities
- Format: Emoji + numeric value (e.g., "💪 3/5", "🧠 4/5")
- Guidelines:
  - Let Gemini choose which stats best represent the character
  - Use emoji for visual clarity
  - Use consistent rating format (3/5, 4/5, 2/5, etc.)
  - Focus on core abilities and traits that best describe the character
  - 3-8 representative stats per character

### 3. **Detailed Stats (Comprehensive Character Information)**
- Purpose: Complete character profile including stats, perks, and skills
- Format: JSON with stats, perks, and skills
- Guidelines:
  - **Stats**: Numeric values only (3/5, 4/5, etc.)
  - **Perks**: Special abilities (NO numeric values)
  - **Skills**: Areas of expertise (NO numeric values)
  - Include Korean/Japanese/English descriptions
  - 2-4 unique perks per character
  - 2-4 skills per character

### 4. **Multi-Language Support**
- Support Korean (ko), Japanese (ja), and English (en)
- Use language-appropriate templates
- Maintain consistent style within each language
- All descriptions should be in the target language

### 5. **Prompt Template System**
- Use `prompt-templates.js` for all prompt generation
- Templates are organized by language and type
- Never hardcode prompts in individual files
- Always use `getPromptTemplate(language, type)` function

## Implementation Rules

### When Updating Prompts:
1. **NEVER** add specific stat requirements
2. **NEVER** list required emojis
3. **ALWAYS** use the template system
4. **ALWAYS** let Gemini evaluate and choose
5. **ALWAYS** support multiple languages

### When Debugging Stats Issues:
1. Check character name matching
2. Verify CSV parsing
3. Ensure session data is being saved
4. Check UI display logic
5. Verify language template usage

### When Adding New Features:
1. Use the template system
2. Support all languages
3. Don't specify stats to Gemini
4. Let Gemini evaluate naturally
5. Maintain the separation between short and detailed stats

## Template Structure

### Character Stats Template:
- Title: "Determine representative character stats"
- Description: "Analyze and provide representative stats"
- Format: CSV with character, stat_name, value
- Guidelines: Focus on representative stats, use emoji, consistent rating

### Detailed Stats Template:
- Title: "Provide comprehensive character information"
- Description: "Include stats, perks, and skills"
- Format: JSON with stats, perks, skills
- Guidelines: Stats have numeric values, perks/skills have descriptions only

### Batch Stats Template:
- Title: "Determine representative stats for multiple characters"
- Description: "Provide stats for all characters"
- Format: CSV for all characters
- Guidelines: Consistent emojis across characters, representative stats

## Language-Specific Considerations

### Korean (ko):
- Use Korean titles and descriptions
- Include Korean text names for stats
- Maintain Korean language style

### Japanese (ja):
- Use Japanese titles and descriptions
- Include Japanese text names for stats
- Maintain Japanese language style

### English (en):
- Use English titles and descriptions
- Include English text names for stats
- Maintain English language style

## Error Prevention

### Common Mistakes to Avoid:
1. **Specifying stats to Gemini** - Let it choose naturally
2. **Hardcoding prompts** - Always use templates
3. **Forgetting language support** - Always support ko/ja/en
4. **Mixing numeric and descriptive values** - Stats only for numeric
5. **Forgetting character name matching** - Handle variations properly

### Quality Checks:
1. Are prompts using the template system?
2. Are all languages supported?
3. Is Gemini free to choose stats?
4. Are short and detailed stats properly separated?
5. Are character names being matched correctly?

## Summary

**Remember**: The goal is to let Gemini evaluate characters naturally and choose the most representative stats, while providing comprehensive character information that includes both numeric stats and descriptive perks/skills. Never restrict Gemini's ability to choose appropriate stats for each character. 