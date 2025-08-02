// Character Stats System Examples
// These are example commands that GMs can use in their TRPG sessions

const CHARACTER_STATS_EXAMPLES = {
    // Template Commands
    templates: {
        setFantasy: '${Template={"template": "fantasy"}}',
        setScifi: '${Template={"template": "scifi"}}',
        setDefault: '${Template={"template": "default"}}',
        setCustom: '${Template={"template": "custom", "short": ["HP", "MP"], "detailed": ["HP", "MP", "STR", "DEX", "CON", "INT", "WIS", "CHA"]}}'
    },

    // Fantasy RPG Examples
    fantasy: {
        gandalf: '${Stats={"character": "Gandalf", "stats": {"HP": 45, "MP": 80, "STR": 12, "DEX": 14, "CON": 15, "INT": 16, "WIS": 18, "CHA": 17, "AC": 16, "Initiative": 2}}}',
        aragorn: '${Stats={"character": "Aragorn", "stats": {"HP": 65, "MP": 0, "STR": 16, "DEX": 14, "CON": 15, "INT": 12, "WIS": 14, "CHA": 16, "AC": 18, "Initiative": 3}}}',
        legolas: '${Stats={"character": "Legolas", "stats": {"HP": 55, "MP": 0, "STR": 12, "DEX": 18, "CON": 14, "INT": 14, "WIS": 16, "CHA": 15, "AC": 17, "Initiative": 4}}}',
        gimli: '${Stats={"character": "Gimli", "stats": {"HP": 75, "MP": 0, "STR": 18, "DEX": 10, "CON": 18, "INT": 10, "WIS": 12, "CHA": 8, "AC": 19, "Initiative": 1}}}'
    },

    // Sci-fi RPG Examples
    scifi: {
        neo: '${Stats={"character": "Neo", "stats": {"HP": 100, "Energy": 85, "Strength": 8, "Agility": 12, "Intelligence": 15, "Tech": 18, "Combat": 14, "Social": 10}}}',
        trinity: '${Stats={"character": "Trinity", "stats": {"HP": 90, "Energy": 70, "Strength": 10, "Agility": 16, "Intelligence": 12, "Tech": 14, "Combat": 18, "Social": 8}}}',
        morpheus: '${Stats={"character": "Morpheus", "stats": {"HP": 120, "Energy": 60, "Strength": 14, "Agility": 10, "Intelligence": 16, "Tech": 12, "Combat": 16, "Social": 14}}}'
    },

    // Default RPG Examples
    default: {
        warrior: '${Stats={"character": "Warrior", "stats": {"HP": 50, "MP": 0, "STR": 16, "DEF": 12, "AGI": 10, "INT": 8, "WIS": 10, "CHA": 12}}}',
        mage: '${Stats={"character": "Mage", "stats": {"HP": 30, "MP": 100, "STR": 6, "DEF": 8, "AGI": 12, "INT": 18, "WIS": 16, "CHA": 14}}}',
        rogue: '${Stats={"character": "Rogue", "stats": {"HP": 40, "MP": 20, "STR": 10, "DEF": 10, "AGI": 16, "INT": 12, "WIS": 14, "CHA": 16}}}'
    },

    // Stat Updates (for when stats change during gameplay)
    updates: {
        damage: '${Stats={"character": "Gandalf", "stats": {"HP": 35}}}', // Gandalf takes 10 damage
        healing: '${Stats={"character": "Aragorn", "stats": {"HP": 75}}}', // Aragorn heals 10 HP
        levelUp: '${Stats={"character": "Neo", "stats": {"HP": 120, "Energy": 100, "Strength": 10}}}', // Neo levels up
        equipment: '${Stats={"character": "Legolas", "stats": {"AC": 19}}}', // Legolas gets better armor
        status: '${Stats={"character": "Gimli", "stats": {"HP": 50, "MP": 0}}}' // Gimli is poisoned
    }
};

// Usage Examples for GMs:

/*
1. Set up a Fantasy Campaign:
   Copy and paste: ${Template={"template": "fantasy"}}
   Then add characters:
   ${Stats={"character": "Gandalf", "stats": {"HP": 45, "MP": 80, "STR": 12, "DEX": 14, "CON": 15, "INT": 16, "WIS": 18, "CHA": 17, "AC": 16, "Initiative": 2}}}

2. Set up a Sci-fi Campaign:
   Copy and paste: ${Template={"template": "scifi"}}
   Then add characters:
   ${Stats={"character": "Neo", "stats": {"HP": 100, "Energy": 85, "Strength": 8, "Agility": 12, "Intelligence": 15, "Tech": 18, "Combat": 14, "Social": 10}}}

3. Update stats during combat:
   ${Stats={"character": "Gandalf", "stats": {"HP": 35}}} // Gandalf takes damage
   ${Stats={"character": "Aragorn", "stats": {"HP": 75}}} // Aragorn heals

4. Create custom stats for a unique campaign:
   ${Template={"template": "custom", "short": ["Health", "Mana"], "detailed": ["Health", "Mana", "Attack", "Defense", "Speed", "Magic"]}}
   ${Stats={"character": "CustomHero", "stats": {"Health": 100, "Mana": 50, "Attack": 15, "Defense": 12, "Speed": 8, "Magic": 20}}}
*/

// Make it globally available
if (typeof window !== 'undefined') {
    window.CHARACTER_STATS_EXAMPLES = CHARACTER_STATS_EXAMPLES;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CHARACTER_STATS_EXAMPLES };
} 