import { Character, Attributes } from './game';

export interface Enemy {
  id: string;
  name: string;
  maxHealth: number;
  health: number;
  attributes: Attributes;
  actions: EnemyAction[];
  experienceReward: number;
  goldReward: number;
  lootTable?: LootDrop[];
}

export interface EnemyAction {
  id: string;
  name: string;
  type: 'attack' | 'heal' | 'buff' | 'debuff';
  damage?: number;
  healing?: number;
  description: string;
  weight: number; // For AI action selection probability
}

export interface LootDrop {
  itemId: string;
  itemName: string;
  dropChance: number; // 0-1
}

export interface CombatParticipant {
  id: string;
  name: string;
  type: 'hero' | 'enemy';
  initiative: number;
  initiativeRoll: number;
  dexterityModifier: number;
  health: number;
  maxHealth: number;
  isAlive: boolean;
  characterRef?: Character;
  enemyRef?: Enemy;
  // Active buffs/debuffs
  activeEffects: ActiveEffect[];
}

export interface ActiveEffect {
  id: string;
  type: 'ac_bonus' | 'attack_bonus' | 'advantage_next_attack' | 'grant_advantage' | 'taunt';
  value?: number;
  duration: number; // Rounds remaining
  sourceId: string; // Who applied this effect
  targetId?: string; // For effects that target others (like taunt)
}

export interface CombatAction {
  type: 'attack' | 'spell' | 'item' | 'defend' | 'flee';
  actorId: string;
  targetId?: string;
  spellId?: string;
  itemId?: string;
}

export interface CombatLogEntry {
  id: string;
  turn: number;
  actorName: string;
  message: string;
  type: 'attack' | 'damage' | 'heal' | 'miss' | 'critical' | 'death' | 'info' | 'victory' | 'defeat' | 'spell' | 'buff' | 'debuff';
  damage?: number;
  healing?: number;
}

export type CombatPhase = 'initiative' | 'combat' | 'victory' | 'defeat';

export interface CombatState {
  phase: CombatPhase;
  participants: CombatParticipant[];
  turnOrder: string[]; // IDs in initiative order
  currentTurnIndex: number;
  round: number;
  log: CombatLogEntry[];
  enemies: Enemy[];
  heroes: Character[];
  selectedAction: CombatAction | null;
  questId: string;
  questName: string;
  // Spell tracking
  spellSlotUsage: Record<string, { level1: number; level2: number; level3: number; level4: number; level5: number }>;
  songOfWoeHits: Record<string, number>; // Track Song of Woe hits per caster per enemy
  participantsActedThisRound: string[]; // Track who has already acted this round (for Inspire)
}

// D20 roll result
export interface DiceRoll {
  roll: number;
  modifier: number;
  total: number;
  isCritical: boolean; // Natural 20
  isCriticalFail: boolean; // Natural 1
}

export interface AttackResult {
  hit: boolean;
  damage: number;
  isCritical: boolean;
  isCriticalFail: boolean;
  attackRoll: DiceRoll;
  targetAC: number;
}
