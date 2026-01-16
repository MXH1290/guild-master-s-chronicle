export interface Character {
  id: string;
  name: string;
  class: CharacterClass;
  level: number;
  attributes: Attributes;
  health: number;
  maxHealth: number;
  stress: number;
  maxStress: number;
  experience: number;
  experienceToLevel: number;
  status: CharacterStatus[];
  traits: string[];
  relationships: Relationship[];
  quests: number;
  questHistory: QuestHistoryEntry[];
  inventory: InventoryItem[];
  spells: Spell[];
  portrait: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  type: 'weapon' | 'armor' | 'shield' | 'accessory' | 'consumable' | 'ammunition' | 'quest';
  subType?: 'light' | 'medium' | 'heavy';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  description: string;
  equipped?: boolean;
  // Weapon specific
  damageDice?: string;
  damageType?: 'strength' | 'dexterity' | 'strength_or_dexterity' | 'intelligence_or_wisdom';
  requiresAmmunition?: string;
  // Armor specific
  baseAC?: number;
  addsDexterity?: boolean;
  maxDexBonus?: number;
  acBonus?: number;
  // Ammunition/consumable specific
  quantity?: number;
}

export interface Spell {
  id: string;
  name: string;
  type: 'attack' | 'heal' | 'buff' | 'debuff' | 'utility';
  description: string;
  cost: number; // mana or stress cost
}

export interface QuestHistoryEntry {
  questId: string;
  questName: string;
  outcome: 'success' | 'failure';
  day: number;
}

export interface Attributes {
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
}

export type CharacterClass = 
  | 'Warrior'
  | 'Rogue'
  | 'Mage'
  | 'Cleric'
  | 'Ranger'
  | 'Bard';

export type CharacterStatus = 
  | 'healthy'
  | 'injured'
  | 'stressed'
  | 'afflicted'
  | 'recovering'
  | 'dead';

export interface Relationship {
  characterId: string;
  type: 'friendly' | 'neutral' | 'hostile';
  value: number; // -100 to 100
}

export interface Quest {
  id: string;
  name: string;
  description: string;
  difficulty: 'trivial' | 'easy' | 'medium' | 'hard' | 'deadly';
  type: QuestType;
  duration: number; // in hours
  rewards: QuestReward;
  requirements: QuestRequirements;
  partySlots: number;
  assignedParty: string[];
  status: 'available' | 'in_progress' | 'completed' | 'failed';
  progress: number;
}

export type QuestType = 
  | 'combat'
  | 'exploration'
  | 'social'
  | 'escort'
  | 'retrieval';

export interface QuestReward {
  gold: number;
  experience: number;
  reputation: number;
  items?: string[];
}

export interface QuestRequirements {
  minLevel?: number;
  preferredStats?: (keyof Attributes)[];
  minPartySize?: number;
}

export interface Guild {
  name: string;
  gold: number;
  reputation: number;
  day: number;
  shopLevel: number;
  lastRestockDay: number;
}

export interface GameState {
  guild: Guild;
  characters: Character[];
  quests: Quest[];
  activeQuests: Quest[];
  completedQuests: number;
  log: GameLogEntry[];
}

export interface GameLogEntry {
  id: string;
  day: number;
  message: string;
  type: 'info' | 'success' | 'warning' | 'danger';
}
