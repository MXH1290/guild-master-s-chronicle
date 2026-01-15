import { Attributes, Character } from '@/types/game';

/**
 * STAT SYSTEM REFERENCE
 * 
 * STRENGTH (STR):
 * - Melee hit chance bonus
 * - Melee damage bonus
 * - Inventory carry capacity
 * 
 * DEXTERITY (DEX):
 * - Initiative order (higher = earlier turn)
 * - Trap dodge chance
 * - Movement range
 * - Ranged hit chance bonus
 * - Ranged damage bonus
 * 
 * CONSTITUTION (CON):
 * - Maximum health
 * 
 * INTELLIGENCE (INT):
 * - Spell hit chance bonus
 * - Spell damage bonus
 * - Intelligence-based event success chance
 * 
 * WISDOM (WIS):
 * - Magic resistance
 * - Wisdom-based event success chance
 * 
 * CHARISMA (CHA):
 * - Party cohesion bonus
 * - Charisma-based event success chance
 */

// Attribute modifier (D&D style: (stat - 10) / 2)
export function getModifier(stat: number): number {
  return Math.floor((stat - 10) / 2);
}

// STRENGTH CALCULATIONS
export function getMeleeHitBonus(attributes: Attributes): number {
  return getModifier(attributes.strength);
}

export function getMeleeDamageBonus(attributes: Attributes): number {
  return Math.max(0, getModifier(attributes.strength));
}

export function getCarryCapacity(attributes: Attributes): number {
  // Base 5 slots + STR modifier (min 3 total)
  return Math.max(3, 5 + getModifier(attributes.strength));
}

// DEXTERITY CALCULATIONS
export function getInitiativeBonus(attributes: Attributes): number {
  return getModifier(attributes.dexterity);
}

export function getTrapDodgeChance(attributes: Attributes): number {
  // Base 30% + 5% per DEX modifier
  return Math.min(95, Math.max(5, 30 + getModifier(attributes.dexterity) * 5));
}

export function getMovementRange(attributes: Attributes): number {
  // Base 3 tiles + DEX modifier (min 2)
  return Math.max(2, 3 + Math.floor(getModifier(attributes.dexterity) / 2));
}

export function getRangedHitBonus(attributes: Attributes): number {
  return getModifier(attributes.dexterity);
}

export function getRangedDamageBonus(attributes: Attributes): number {
  return Math.max(0, Math.floor(getModifier(attributes.dexterity) / 2));
}

// CONSTITUTION CALCULATIONS
export function calculateMaxHealth(level: number, attributes: Attributes): number {
  // Base 10 HP + CON modifier per level, minimum 1 HP per level
  const conBonus = getModifier(attributes.constitution);
  const hpPerLevel = Math.max(1, 6 + conBonus);
  return 10 + (level * hpPerLevel);
}

// INTELLIGENCE CALCULATIONS
export function getSpellHitBonus(attributes: Attributes): number {
  return getModifier(attributes.intelligence);
}

export function getSpellDamageBonus(attributes: Attributes): number {
  return Math.max(0, getModifier(attributes.intelligence));
}

export function getIntelligenceEventBonus(attributes: Attributes): number {
  // Percentage bonus for INT-based events
  return getModifier(attributes.intelligence) * 5;
}

// WISDOM CALCULATIONS
export function getMagicResistance(attributes: Attributes): number {
  // Base 10% + 5% per WIS modifier (capped 5-80%)
  return Math.min(80, Math.max(5, 10 + getModifier(attributes.wisdom) * 5));
}

export function getWisdomEventBonus(attributes: Attributes): number {
  // Percentage bonus for WIS-based events
  return getModifier(attributes.wisdom) * 5;
}

// CHARISMA CALCULATIONS
export function getPartyCohesionBonus(attributes: Attributes): number {
  // Contributes to party morale/stress resistance
  return getModifier(attributes.charisma) * 2;
}

export function getCharismaEventBonus(attributes: Attributes): number {
  // Percentage bonus for CHA-based events
  return getModifier(attributes.charisma) * 5;
}

// DERIVED COMBAT STATS
export interface DerivedCombatStats {
  // Offense
  meleeHitBonus: number;
  meleeDamage: number;
  rangedHitBonus: number;
  rangedDamage: number;
  spellHitBonus: number;
  spellDamage: number;
  
  // Defense
  maxHealth: number;
  magicResistance: number;
  trapDodge: number;
  
  // Utility
  initiative: number;
  movement: number;
  carryCapacity: number;
  cohesionBonus: number;
  
  // Event bonuses
  intEventBonus: number;
  wisEventBonus: number;
  chaEventBonus: number;
}

export function calculateDerivedStats(character: Character): DerivedCombatStats {
  const { attributes, level } = character;
  
  return {
    // Offense
    meleeHitBonus: getMeleeHitBonus(attributes),
    meleeDamage: getMeleeDamageBonus(attributes),
    rangedHitBonus: getRangedHitBonus(attributes),
    rangedDamage: getRangedDamageBonus(attributes),
    spellHitBonus: getSpellHitBonus(attributes),
    spellDamage: getSpellDamageBonus(attributes),
    
    // Defense
    maxHealth: calculateMaxHealth(level, attributes),
    magicResistance: getMagicResistance(attributes),
    trapDodge: getTrapDodgeChance(attributes),
    
    // Utility
    initiative: getInitiativeBonus(attributes),
    movement: getMovementRange(attributes),
    carryCapacity: getCarryCapacity(attributes),
    cohesionBonus: getPartyCohesionBonus(attributes),
    
    // Event bonuses
    intEventBonus: getIntelligenceEventBonus(attributes),
    wisEventBonus: getWisdomEventBonus(attributes),
    chaEventBonus: getCharismaEventBonus(attributes),
  };
}

// Class combat type for determining which stat to use for attacks
export type CombatStyle = 'melee' | 'ranged' | 'magic';

export function getClassCombatStyle(characterClass: string): CombatStyle {
  switch (characterClass) {
    case 'Warrior':
      return 'melee';
    case 'Rogue':
    case 'Ranger':
      return 'ranged';
    case 'Mage':
      return 'magic';
    case 'Cleric':
      return 'magic';
    case 'Bard':
      return 'magic';
    default:
      return 'melee';
  }
}

export function getPrimaryAttackStat(characterClass: string): keyof Attributes {
  const style = getClassCombatStyle(characterClass);
  switch (style) {
    case 'melee':
      return 'strength';
    case 'ranged':
      return 'dexterity';
    case 'magic':
      return 'intelligence';
  }
}
