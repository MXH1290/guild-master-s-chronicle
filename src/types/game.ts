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
  status: CharacterStatus[];
  traits: string[];
  relationships: Relationship[];
  quests: number;
  portrait: string;
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
