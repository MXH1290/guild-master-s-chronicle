import { CharacterClass } from '@/types/game';

export type SpellTargetType = 'enemy' | 'ally' | 'self' | 'all_enemies' | 'all_allies';
export type SpellDamageType = 'fire' | 'lightning' | 'radiant' | 'psychic' | 'necrotic' | 'force';
export type SpellModifierStat = 'intelligence' | 'wisdom' | 'charisma';

export interface SpellEffect {
  type: 'damage' | 'heal' | 'buff' | 'debuff' | 'special';
  damageDice?: string; // e.g., '1d10', '2d6'
  damageType?: SpellDamageType;
  healDice?: string; // e.g., '1d4'
  addModifier?: SpellModifierStat; // Add this stat's modifier to damage/healing
  buffType?: 'ac_bonus' | 'attack_bonus' | 'advantage_next_attack';
  buffValue?: number;
  debuffType?: 'move_to_end_initiative' | 'grant_advantage' | 'taunt';
  duration?: number; // in rounds
  special?: 'song_of_woe' | 'inspire' | 'elegant_distraction';
}

export interface CombatSpell {
  id: string;
  name: string;
  level: number; // Spell level (1, 2, 3, etc.)
  classes: CharacterClass[]; // Which classes can use this spell
  targetType: SpellTargetType;
  modifierStat: SpellModifierStat; // Stat used for spell attack rolls
  description: string;
  shortDescription: string; // For combat UI
  effects: SpellEffect[];
}

// Calculate spell slots by level
export function getSpellSlots(characterLevel: number, spellLevel: number): number {
  // Characters get spell slots at odd levels for that spell level
  // Level 1: 3 1st-level slots
  // Level 3: 3 1st-level + 2 2nd-level slots
  // Level 5: 3 1st-level + 2 2nd-level + 2 3rd-level slots
  // etc.
  
  const requiredLevel = (spellLevel - 1) * 2 + 1; // Level 1 for 1st, 3 for 2nd, 5 for 3rd
  
  if (characterLevel < requiredLevel) return 0;
  
  if (spellLevel === 1) return 3;
  return 2; // Higher level spell slots
}

// Check if a class is a spellcaster
export function isSpellcaster(charClass: CharacterClass): boolean {
  return charClass === 'Mage' || charClass === 'Cleric' || charClass === 'Bard';
}

// Get the primary spellcasting stat for a class
export function getSpellcastingStat(charClass: CharacterClass): SpellModifierStat | null {
  switch (charClass) {
    case 'Mage': return 'intelligence';
    case 'Cleric': return 'wisdom';
    case 'Bard': return 'charisma';
    default: return null;
  }
}

// Get spells available to a class at a given level
export function getAvailableSpells(charClass: CharacterClass, characterLevel: number): CombatSpell[] {
  const maxSpellLevel = Math.ceil(characterLevel / 2);
  return ALL_SPELLS.filter(spell => 
    spell.classes.includes(charClass) && spell.level <= maxSpellLevel
  );
}

// ============================================
// SPELL DEFINITIONS
// ============================================

// MAGE SPELLS
const MAGE_SPELLS: CombatSpell[] = [
  {
    id: 'firebolt',
    name: 'Firebolt',
    level: 1,
    classes: ['Mage'],
    targetType: 'enemy',
    modifierStat: 'intelligence',
    description: 'Hurls a bolt of fire at an enemy, dealing 1d10 fire damage.',
    shortDescription: '1d10 fire damage',
    effects: [{
      type: 'damage',
      damageDice: '1d10',
      damageType: 'fire'
    }]
  },
  {
    id: 'shocking_grasp',
    name: 'Shocking Grasp',
    level: 1,
    classes: ['Mage'],
    targetType: 'enemy',
    modifierStat: 'intelligence',
    description: 'Lightning arcs from your hand, dealing 1d6 lightning damage. On hit, the enemy\'s turn is moved to the end of the initiative order for this round.',
    shortDescription: '1d6 lightning + push to end of initiative',
    effects: [
      {
        type: 'damage',
        damageDice: '1d6',
        damageType: 'lightning'
      },
      {
        type: 'debuff',
        debuffType: 'move_to_end_initiative',
        duration: 1
      }
    ]
  },
  {
    id: 'shield',
    name: 'Shield',
    level: 1,
    classes: ['Mage'],
    targetType: 'self',
    modifierStat: 'intelligence',
    description: 'An invisible barrier of magical force appears, granting +5 AC for 1 round.',
    shortDescription: '+5 AC for 1 round',
    effects: [{
      type: 'buff',
      buffType: 'ac_bonus',
      buffValue: 5,
      duration: 1
    }]
  }
];

// CLERIC SPELLS
const CLERIC_SPELLS: CombatSpell[] = [
  {
    id: 'healing_word',
    name: 'Healing Word',
    level: 1,
    classes: ['Cleric'],
    targetType: 'ally',
    modifierStat: 'wisdom',
    description: 'A word of healing restores 1d4 + your Wisdom modifier hit points to an ally.',
    shortDescription: '1d4+WIS healing',
    effects: [{
      type: 'heal',
      healDice: '1d4',
      addModifier: 'wisdom'
    }]
  },
  {
    id: 'bless',
    name: 'Bless',
    level: 1,
    classes: ['Cleric'],
    targetType: 'ally',
    modifierStat: 'wisdom',
    description: 'Bless an ally, granting them +2 to attack rolls for 1 round.',
    shortDescription: '+2 to hit for 1 round',
    effects: [{
      type: 'buff',
      buffType: 'attack_bonus',
      buffValue: 2,
      duration: 1
    }]
  },
  {
    id: 'guiding_bolt',
    name: 'Guiding Bolt',
    level: 1,
    classes: ['Cleric'],
    targetType: 'enemy',
    modifierStat: 'wisdom',
    description: 'A flash of radiant light deals 2d6 radiant damage. On hit, the next attack against this enemy has advantage.',
    shortDescription: '2d6 radiant + grants advantage',
    effects: [
      {
        type: 'damage',
        damageDice: '2d6',
        damageType: 'radiant'
      },
      {
        type: 'debuff',
        debuffType: 'grant_advantage',
        duration: 1
      }
    ]
  }
];

// BARD SPELLS
const BARD_SPELLS: CombatSpell[] = [
  {
    id: 'elegant_distraction',
    name: 'Elegant Distraction',
    level: 1,
    classes: ['Bard'],
    targetType: 'ally',
    modifierStat: 'charisma',
    description: 'The bard performs an elegant distraction. The selected ally becomes the guaranteed target of the enemy\'s next attack.',
    shortDescription: 'Ally becomes taunt target',
    effects: [{
      type: 'special',
      special: 'elegant_distraction'
    }]
  },
  {
    id: 'inspire',
    name: 'Inspire',
    level: 1,
    classes: ['Bard'],
    targetType: 'ally',
    modifierStat: 'charisma',
    description: 'Select an ally who hasn\'t acted this round. They take their turn immediately after yours.',
    shortDescription: 'Ally acts next',
    effects: [{
      type: 'special',
      special: 'inspire'
    }]
  },
  {
    id: 'song_of_woe',
    name: 'Song of Woe',
    level: 1,
    classes: ['Bard'],
    targetType: 'enemy',
    modifierStat: 'charisma',
    description: 'A haunting melody that grows in power. Deals 1d4 psychic damage on first hit, increasing with each subsequent hit (1d6, 1d8, 1d10, 1d12, 2d12 cap).',
    shortDescription: 'Escalating psychic damage',
    effects: [{
      type: 'special',
      special: 'song_of_woe'
    }]
  }
];

// All spells combined
export const ALL_SPELLS: CombatSpell[] = [
  ...MAGE_SPELLS,
  ...CLERIC_SPELLS,
  ...BARD_SPELLS
];

// Get a spell by ID
export function getSpellById(spellId: string): CombatSpell | undefined {
  return ALL_SPELLS.find(s => s.id === spellId);
}

// Song of Woe damage dice progression
export const SONG_OF_WOE_PROGRESSION = ['1d4', '1d6', '1d8', '1d10', '1d12', '2d12'];
