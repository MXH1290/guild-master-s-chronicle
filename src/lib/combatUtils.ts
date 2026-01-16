import { Character, Attributes } from '@/types/game';
import { 
  Enemy, 
  CombatParticipant, 
  DiceRoll, 
  AttackResult,
  CombatLogEntry 
} from '@/types/combat';
import { getModifier, getPrimaryAttackStat } from './statCalculations';

// Roll a d20 (1-20)
export function rollD20(): number {
  return Math.floor(Math.random() * 20) + 1;
}

// Roll with a modifier
export function rollWithModifier(modifier: number): DiceRoll {
  const roll = rollD20();
  return {
    roll,
    modifier,
    total: roll + modifier,
    isCritical: roll === 20,
    isCriticalFail: roll === 1
  };
}

// Roll initiative for a participant
export function rollInitiative(dexterity: number): { roll: number; modifier: number; total: number } {
  const roll = rollD20();
  const modifier = getModifier(dexterity);
  return {
    roll,
    modifier,
    total: roll + modifier
  };
}

// Create combat participant from character
export function createHeroParticipant(character: Character): CombatParticipant {
  const initiative = rollInitiative(character.attributes.dexterity);
  return {
    id: character.id,
    name: character.name,
    type: 'hero',
    initiative: initiative.total,
    initiativeRoll: initiative.roll,
    dexterityModifier: initiative.modifier,
    health: character.health,
    maxHealth: character.maxHealth,
    isAlive: character.health > 0,
    characterRef: character,
    activeEffects: []
  };
}

// Create combat participant from enemy
export function createEnemyParticipant(enemy: Enemy): CombatParticipant {
  const initiative = rollInitiative(enemy.attributes.dexterity);
  return {
    id: enemy.id,
    name: enemy.name,
    type: 'enemy',
    initiative: initiative.total,
    initiativeRoll: initiative.roll,
    dexterityModifier: initiative.modifier,
    health: enemy.health,
    maxHealth: enemy.maxHealth,
    isAlive: enemy.health > 0,
    enemyRef: enemy,
    activeEffects: []
  };
}

// Sort participants by initiative (highest first)
export function sortByInitiative(participants: CombatParticipant[]): CombatParticipant[] {
  return [...participants].sort((a, b) => {
    // Higher initiative goes first
    if (b.initiative !== a.initiative) {
      return b.initiative - a.initiative;
    }
    // Tie-breaker: higher dex modifier
    if (b.dexterityModifier !== a.dexterityModifier) {
      return b.dexterityModifier - a.dexterityModifier;
    }
    // Final tie-breaker: heroes go before enemies
    if (a.type !== b.type) {
      return a.type === 'hero' ? -1 : 1;
    }
    return 0;
  });
}

// Check if character has a weapon equipped
export function hasWeaponEquipped(character: Character): boolean {
  return character.inventory.some(item => item.type === 'weapon' && item.equipped);
}

// Check if character has armor equipped
export function hasArmorEquipped(character: Character): boolean {
  return character.inventory.some(item => item.type === 'armor' && item.equipped);
}

// Get equipped weapon (if any)
export function getEquippedWeapon(character: Character): import('@/types/game').InventoryItem | undefined {
  return character.inventory.find(item => item.type === 'weapon' && item.equipped);
}

// Get equipped armor (if any)
export function getEquippedArmor(character: Character): import('@/types/game').InventoryItem | undefined {
  return character.inventory.find(item => item.type === 'armor' && item.equipped);
}

// Get equipped shield (if any)
export function getEquippedShield(character: Character): import('@/types/game').InventoryItem | undefined {
  return character.inventory.find(item => item.type === 'shield' && item.equipped);
}

// Calculate Armor Class based on equipped armor
export function calculateAC(attributes: Attributes, character?: Character): number {
  const dexMod = getModifier(attributes.dexterity);
  
  if (!character) {
    // For enemies without character reference
    return 10 + dexMod;
  }

  let baseAC = 10 + dexMod; // Unarmored default

  const armor = getEquippedArmor(character);
  if (armor && armor.baseAC) {
    if (armor.addsDexterity) {
      const effectiveDexMod = armor.maxDexBonus !== undefined 
        ? Math.min(dexMod, armor.maxDexBonus) 
        : dexMod;
      baseAC = armor.baseAC + effectiveDexMod;
    } else {
      baseAC = armor.baseAC;
    }
  }

  // Add shield bonus
  const shield = getEquippedShield(character);
  if (shield && shield.acBonus) {
    baseAC += shield.acBonus;
  }

  return baseAC;
}

// Get weapon stat modifier based on damage type
function getWeaponStatModifier(weapon: import('@/types/game').InventoryItem, character: Character): number {
  const strMod = getModifier(character.attributes.strength);
  const dexMod = getModifier(character.attributes.dexterity);
  const intMod = getModifier(character.attributes.intelligence);
  const wisMod = getModifier(character.attributes.wisdom);

  switch (weapon.damageType) {
    case 'strength':
      return strMod;
    case 'dexterity':
      return dexMod;
    case 'strength_or_dexterity':
      return Math.max(strMod, dexMod);
    case 'intelligence_or_wisdom':
      return Math.max(intMod, wisMod);
    default:
      return strMod;
  }
}

// Roll a d4 (1-4)
export function rollD4(): number {
  return Math.floor(Math.random() * 4) + 1;
}

// Parse dice notation (e.g., "1d6" returns {count: 1, sides: 6})
function parseDice(diceNotation: string): { count: number; sides: number } {
  const match = diceNotation.match(/(\d+)d(\d+)/);
  if (!match) return { count: 1, sides: 4 };
  return { count: parseInt(match[1]), sides: parseInt(match[2]) };
}

// Roll damage dice
function rollDamageDice(diceNotation: string): number {
  const { count, sides } = parseDice(diceNotation);
  let total = 0;
  for (let i = 0; i < count; i++) {
    total += Math.floor(Math.random() * sides) + 1;
  }
  return total;
}

// Calculate attack bonus
// Unarmed: STR modifier + level bonus
// Armed: Based on weapon damage type
export function getAttackBonus(character: Character): number {
  const levelBonus = Math.floor(character.level / 2);
  const weapon = getEquippedWeapon(character);
  
  if (weapon) {
    return getWeaponStatModifier(weapon, character) + levelBonus;
  }
  
  // Unarmed: STR modifier + level bonus
  return getModifier(character.attributes.strength) + levelBonus;
}

// Calculate base damage
// Unarmed: 1d4 + STR modifier
// Armed: Based on weapon dice and damage type
export function calculateBaseDamage(character: Character): number {
  const weapon = getEquippedWeapon(character);
  
  if (weapon && weapon.damageDice) {
    const dieRoll = rollDamageDice(weapon.damageDice);
    const modifier = getWeaponStatModifier(weapon, character);
    return Math.max(1, dieRoll + modifier);
  }
  
  // Unarmed: 1d4 + STR modifier
  const strMod = getModifier(character.attributes.strength);
  const dieRoll = rollD4();
  return Math.max(1, dieRoll + strMod);
}

// Perform an attack roll
export function performAttack(
  attacker: CombatParticipant,
  defender: CombatParticipant
): AttackResult {
  let attackBonus = 0;
  let baseDamage = 0;
  let targetAC = 10;

  if (attacker.type === 'hero' && attacker.characterRef) {
    attackBonus = getAttackBonus(attacker.characterRef);
    baseDamage = calculateBaseDamage(attacker.characterRef);
  } else if (attacker.type === 'enemy' && attacker.enemyRef) {
    // Enemies use strength for now
    attackBonus = getModifier(attacker.enemyRef.attributes.strength);
    baseDamage = Math.floor(Math.random() * 6) + 1 + getModifier(attacker.enemyRef.attributes.strength);
  }

  if (defender.type === 'hero' && defender.characterRef) {
    targetAC = calculateAC(defender.characterRef.attributes, defender.characterRef);
  } else if (defender.type === 'enemy' && defender.enemyRef) {
    targetAC = calculateAC(defender.enemyRef.attributes);
  }

  const attackRoll = rollWithModifier(attackBonus);

  // Critical hit always hits and does double damage
  if (attackRoll.isCritical) {
    return {
      hit: true,
      damage: baseDamage * 2,
      isCritical: true,
      isCriticalFail: false,
      attackRoll,
      targetAC
    };
  }

  // Critical fail always misses
  if (attackRoll.isCriticalFail) {
    return {
      hit: false,
      damage: 0,
      isCritical: false,
      isCriticalFail: true,
      attackRoll,
      targetAC
    };
  }

  // Normal hit check
  const hit = attackRoll.total >= targetAC;
  return {
    hit,
    damage: hit ? Math.max(1, baseDamage) : 0,
    isCritical: false,
    isCriticalFail: false,
    attackRoll,
    targetAC
  };
}

// Create a combat log entry
export function createLogEntry(
  turn: number,
  actorName: string,
  message: string,
  type: CombatLogEntry['type'],
  damage?: number,
  healing?: number
): CombatLogEntry {
  return {
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    turn,
    actorName,
    message,
    type,
    damage,
    healing
  };
}

// Check if all enemies are defeated
export function areAllEnemiesDefeated(participants: CombatParticipant[]): boolean {
  return participants.filter(p => p.type === 'enemy').every(p => !p.isAlive);
}

// Check if all heroes are defeated
export function areAllHeroesDefeated(participants: CombatParticipant[]): boolean {
  return participants.filter(p => p.type === 'hero').every(p => !p.isAlive);
}

// Get living participants
export function getLivingParticipants(participants: CombatParticipant[]): CombatParticipant[] {
  return participants.filter(p => p.isAlive);
}

// Get current turn participant
export function getCurrentTurnParticipant(
  participants: CombatParticipant[],
  turnOrder: string[],
  currentTurnIndex: number
): CombatParticipant | undefined {
  const currentId = turnOrder[currentTurnIndex];
  return participants.find(p => p.id === currentId);
}
