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
    characterRef: character
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
    enemyRef: enemy
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

// Calculate Armor Class
// Unarmored: 10 + DEX modifier
// Armored: Will be based on armor type (to be implemented with armor items)
export function calculateAC(attributes: Attributes, character?: Character): number {
  const dexMod = getModifier(attributes.dexterity);
  
  // If character provided, check for equipped armor
  if (character && hasArmorEquipped(character)) {
    // TODO: Calculate based on armor type when armor items are added
    // For now, equipped armor gives base 12 + (dex mod / 2, rounded down)
    return 12 + Math.floor(dexMod / 2);
  }
  
  // Unarmored: 10 + DEX modifier
  return 10 + dexMod;
}

// Calculate attack bonus
// Unarmed: STR modifier + level bonus
// Armed: Based on weapon type (to be implemented)
export function getAttackBonus(character: Character): number {
  const levelBonus = Math.floor(character.level / 2);
  
  if (hasWeaponEquipped(character)) {
    // TODO: Calculate based on weapon type when weapon items are added
    // For now, use class primary stat
    const primaryStat = getPrimaryAttackStat(character.class);
    const statValue = character.attributes[primaryStat];
    return getModifier(statValue) + levelBonus;
  }
  
  // Unarmed: STR modifier + level bonus
  return getModifier(character.attributes.strength) + levelBonus;
}

// Roll a d4 (1-4)
export function rollD4(): number {
  return Math.floor(Math.random() * 4) + 1;
}

// Calculate base damage
// Unarmed: 1d4 + STR modifier
// Armed: Based on weapon type (to be implemented)
export function calculateBaseDamage(character: Character): number {
  if (hasWeaponEquipped(character)) {
    // TODO: Calculate based on weapon type when weapon items are added
    // For now, use 1d8 + primary stat modifier
    const primaryStat = getPrimaryAttackStat(character.class);
    const statValue = character.attributes[primaryStat];
    const dieRoll = Math.floor(Math.random() * 8) + 1; // 1d8
    return dieRoll + getModifier(statValue);
  }
  
  // Unarmed: 1d4 + STR modifier
  const strMod = getModifier(character.attributes.strength);
  const dieRoll = rollD4();
  return dieRoll + strMod;
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
