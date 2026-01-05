import { Character, Quest, GameState } from '@/types/game';

const portraits = [
  '⚔️', '🗡️', '🏹', '🔮', '✨', '🛡️', '⚡', '🌙'
];

export const initialCharacters: Character[] = [
  {
    id: '1',
    name: 'Aldric Ironforge',
    class: 'Warrior',
    level: 3,
    attributes: { strength: 16, dexterity: 12, constitution: 15, intelligence: 8, wisdom: 10, charisma: 11 },
    health: 45,
    maxHealth: 50,
    stress: 25,
    maxStress: 100,
    status: ['healthy'],
    traits: ['Brave', 'Stubborn'],
    relationships: [{ characterId: '2', type: 'friendly', value: 40 }],
    quests: 12,
    portrait: '⚔️'
  },
  {
    id: '2',
    name: 'Elara Nightwhisper',
    class: 'Rogue',
    level: 2,
    attributes: { strength: 10, dexterity: 17, constitution: 12, intelligence: 14, wisdom: 11, charisma: 13 },
    health: 28,
    maxHealth: 30,
    stress: 45,
    maxStress: 100,
    status: ['stressed'],
    traits: ['Cunning', 'Paranoid'],
    relationships: [{ characterId: '1', type: 'friendly', value: 35 }],
    quests: 8,
    portrait: '🗡️'
  },
  {
    id: '3',
    name: 'Theron Brightstaff',
    class: 'Mage',
    level: 4,
    attributes: { strength: 8, dexterity: 11, constitution: 10, intelligence: 18, wisdom: 14, charisma: 12 },
    health: 22,
    maxHealth: 25,
    stress: 60,
    maxStress: 100,
    status: ['stressed'],
    traits: ['Brilliant', 'Arrogant'],
    relationships: [{ characterId: '4', type: 'hostile', value: -30 }],
    quests: 15,
    portrait: '🔮'
  },
  {
    id: '4',
    name: 'Sister Meridia',
    class: 'Cleric',
    level: 3,
    attributes: { strength: 11, dexterity: 10, constitution: 13, intelligence: 12, wisdom: 17, charisma: 14 },
    health: 35,
    maxHealth: 35,
    stress: 15,
    maxStress: 100,
    status: ['healthy'],
    traits: ['Compassionate', 'Righteous'],
    relationships: [{ characterId: '3', type: 'neutral', value: 5 }],
    quests: 10,
    portrait: '✨'
  },
  {
    id: '5',
    name: 'Grimshaw the Bold',
    class: 'Ranger',
    level: 2,
    attributes: { strength: 14, dexterity: 15, constitution: 14, intelligence: 11, wisdom: 13, charisma: 9 },
    health: 20,
    maxHealth: 38,
    stress: 35,
    maxStress: 100,
    status: ['injured'],
    traits: ['Lone Wolf', 'Observant'],
    relationships: [],
    quests: 6,
    portrait: '🏹'
  },
  {
    id: '6',
    name: 'Lyric Silvertongue',
    class: 'Bard',
    level: 2,
    attributes: { strength: 9, dexterity: 13, constitution: 11, intelligence: 13, wisdom: 12, charisma: 18 },
    health: 26,
    maxHealth: 28,
    stress: 20,
    maxStress: 100,
    status: ['healthy'],
    traits: ['Charming', 'Vain'],
    relationships: [{ characterId: '2', type: 'friendly', value: 55 }],
    quests: 4,
    portrait: '🎭'
  }
];

export const initialQuests: Quest[] = [
  {
    id: 'q1',
    name: 'Clear the Goblin Warren',
    description: 'A nest of goblins has been raiding caravans on the northern road. Root them out.',
    difficulty: 'medium',
    type: 'combat',
    duration: 8,
    rewards: { gold: 150, experience: 100, reputation: 10 },
    requirements: { minLevel: 2, preferredStats: ['strength', 'constitution'], minPartySize: 3 },
    partySlots: 4,
    assignedParty: [],
    status: 'available',
    progress: 0
  },
  {
    id: 'q2',
    name: 'The Merchant\'s Plea',
    description: 'Escort a nervous merchant through bandit territory to the capital.',
    difficulty: 'easy',
    type: 'escort',
    duration: 12,
    rewards: { gold: 100, experience: 60, reputation: 15 },
    requirements: { minLevel: 1, preferredStats: ['charisma', 'wisdom'], minPartySize: 2 },
    partySlots: 3,
    assignedParty: [],
    status: 'available',
    progress: 0
  },
  {
    id: 'q3',
    name: 'Secrets of the Old Library',
    description: 'Explore the ruins of an ancient library said to contain forbidden knowledge.',
    difficulty: 'hard',
    type: 'exploration',
    duration: 16,
    rewards: { gold: 200, experience: 150, reputation: 20, items: ['Ancient Tome'] },
    requirements: { minLevel: 3, preferredStats: ['intelligence', 'wisdom'], minPartySize: 2 },
    partySlots: 4,
    assignedParty: [],
    status: 'available',
    progress: 0
  },
  {
    id: 'q4',
    name: 'Negotiate with the Dwarves',
    description: 'The mountain clans are demanding higher tribute. Someone must reason with them.',
    difficulty: 'medium',
    type: 'social',
    duration: 6,
    rewards: { gold: 80, experience: 80, reputation: 25 },
    requirements: { minLevel: 2, preferredStats: ['charisma', 'intelligence'], minPartySize: 1 },
    partySlots: 2,
    assignedParty: [],
    status: 'available',
    progress: 0
  },
  {
    id: 'q5',
    name: 'The Dragon\'s Hoard',
    description: 'Rumors speak of a young dragon hoarding treasure in the eastern caves. Deadly, but lucrative.',
    difficulty: 'deadly',
    type: 'combat',
    duration: 24,
    rewards: { gold: 500, experience: 300, reputation: 50, items: ['Dragon Scale'] },
    requirements: { minLevel: 4, preferredStats: ['strength', 'dexterity', 'constitution'], minPartySize: 4 },
    partySlots: 5,
    assignedParty: [],
    status: 'available',
    progress: 0
  }
];

export const initialGameState: GameState = {
  guild: {
    name: 'The Silver Ravens',
    gold: 500,
    reputation: 25,
    day: 1
  },
  characters: initialCharacters,
  quests: initialQuests,
  activeQuests: [],
  completedQuests: 0,
  log: [
    { id: '1', day: 1, message: 'The guild hall opens its doors. Your legend begins.', type: 'info' }
  ]
};
