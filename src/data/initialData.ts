import { Quest, GameState } from '@/types/game';

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
