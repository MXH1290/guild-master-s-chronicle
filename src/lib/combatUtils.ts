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

// Calculate Armor Class (simplified: 10 + DEX modifier)
export function calculateAC(attributes: Attributes): number {
  return 10 + getModifier(attributes.dexterity);
}

// Calculate attack bonus based on class and primary stat
export function getAttackBonus(character: Character): number {
  const primaryStat = getPrimaryAttackStat(character.class);
  const statValue = character.attributes[primaryStat];
  return getModifier(statValue) + Math.floor(character.level / 2);
}

// Calculate base damage (simplified: 1d8 + stat modifier)
export function calculateBaseDamage(character: Character): number {
  const primaryStat = getPrimaryAttackStat(character.class);
  const statValue = character.attributes[primaryStat];
  const dieRoll = Math.floor(Math.random() * 8) + 1; // 1d8
  return dieRoll + getModifier(statValue);
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
    targetAC = calculateAC(defender.characterRef.attributes);
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
