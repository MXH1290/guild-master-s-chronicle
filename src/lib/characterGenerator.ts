import { Character, CharacterClass, Attributes } from '@/types/game';

const FIRST_NAMES = [
  'Aldric', 'Elara', 'Theron', 'Meridia', 'Grimshaw', 'Lyric', 'Kael', 'Seraphina',
  'Brom', 'Isolde', 'Vex', 'Rowena', 'Tormund', 'Celeste', 'Darius', 'Mira',
  'Rook', 'Astrid', 'Caspian', 'Brynn', 'Magnus', 'Freya', 'Silas', 'Nyx',
  'Gareth', 'Willow', 'Orion', 'Ember', 'Cedric', 'Luna', 'Finnian', 'Zara'
];

const LAST_NAMES = [
  'Ironforge', 'Nightwhisper', 'Brightstaff', 'Shadowmend', 'Stormborn', 'Silvertongue',
  'Blackwood', 'Frostbane', 'Thornwood', 'Duskwalker', 'Flameheart', 'Stoneguard',
  'Ravencrest', 'Moonshadow', 'Goldenleaf', 'Darkhollow', 'Swiftarrow', 'Battleborn',
  'Mistwalker', 'Sunfire', 'Grimstone', 'Starweaver', 'Ashford', 'Wintervale'
];

const CLASSES: CharacterClass[] = ['Warrior', 'Rogue', 'Mage', 'Cleric', 'Ranger', 'Bard'];

const CLASS_PORTRAITS: Record<CharacterClass, string[]> = {
  Warrior: ['⚔️', '🛡️', '⚡'],
  Rogue: ['🗡️', '🌙', '👤'],
  Mage: ['🔮', '✨', '🌟'],
  Cleric: ['✨', '☀️', '🙏'],
  Ranger: ['🏹', '🌲', '🦅'],
  Bard: ['🎭', '🎵', '🎶']
};

const CLASS_TRAITS: Record<CharacterClass, string[][]> = {
  Warrior: [
    ['Brave', 'Fearless', 'Bold'],
    ['Stubborn', 'Hot-headed', 'Proud']
  ],
  Rogue: [
    ['Cunning', 'Sly', 'Quick-witted'],
    ['Paranoid', 'Greedy', 'Secretive']
  ],
  Mage: [
    ['Brilliant', 'Scholarly', 'Curious'],
    ['Arrogant', 'Aloof', 'Obsessive']
  ],
  Cleric: [
    ['Compassionate', 'Devout', 'Kind'],
    ['Righteous', 'Judgmental', 'Pious']
  ],
  Ranger: [
    ['Observant', 'Patient', 'Resourceful'],
    ['Lone Wolf', 'Distant', 'Wary']
  ],
  Bard: [
    ['Charming', 'Witty', 'Eloquent'],
    ['Vain', 'Dramatic', 'Meddlesome']
  ]
};

// Stat biases for each class (primary, secondary)
const CLASS_STAT_BIAS: Record<CharacterClass, (keyof Attributes)[]> = {
  Warrior: ['strength', 'constitution'],
  Rogue: ['dexterity', 'charisma'],
  Mage: ['intelligence', 'wisdom'],
  Cleric: ['wisdom', 'charisma'],
  Ranger: ['dexterity', 'wisdom'],
  Bard: ['charisma', 'dexterity']
};

function rollStat(): number {
  // 4d6 drop lowest, classic D&D style, capped at 18 for level 1
  const rolls = [1, 2, 3, 4].map(() => Math.floor(Math.random() * 6) + 1);
  rolls.sort((a, b) => b - a);
  return Math.min(rolls[0] + rolls[1] + rolls[2], 18);
}

function generateAttributes(charClass: CharacterClass): Attributes {
  const biases = CLASS_STAT_BIAS[charClass];
  
  const attrs: Attributes = {
    strength: rollStat(),
    dexterity: rollStat(),
    constitution: rollStat(),
    intelligence: rollStat(),
    wisdom: rollStat(),
    charisma: rollStat()
  };
  
  // Boost primary and secondary stats slightly for class flavor
  if (biases[0]) {
    attrs[biases[0]] = Math.min(attrs[biases[0]] + Math.floor(Math.random() * 3) + 1, 18);
  }
  if (biases[1]) {
    attrs[biases[1]] = Math.min(attrs[biases[1]] + Math.floor(Math.random() * 2) + 1, 18);
  }
  
  return attrs;
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generateCharacter(id: string): Character {
  const firstName = pickRandom(FIRST_NAMES);
  const lastName = pickRandom(LAST_NAMES);
  const charClass = pickRandom(CLASSES);
  const attributes = generateAttributes(charClass);
  
  // HP based on constitution and class
  const baseHP = charClass === 'Warrior' ? 12 : 
                 charClass === 'Ranger' ? 10 :
                 charClass === 'Cleric' ? 10 :
                 charClass === 'Rogue' ? 8 :
                 charClass === 'Bard' ? 8 : 6;
  const maxHealth = baseHP + Math.floor((attributes.constitution - 10) / 2);
  
  const traits = [
    pickRandom(CLASS_TRAITS[charClass][0]),
    pickRandom(CLASS_TRAITS[charClass][1])
  ];
  
  return {
    id,
    name: `${firstName} ${lastName}`,
    class: charClass,
    level: 1,
    attributes,
    health: maxHealth,
    maxHealth,
    stress: Math.floor(Math.random() * 15),
    maxStress: 100,
    status: ['healthy'],
    traits,
    relationships: [],
    quests: 0,
    portrait: pickRandom(CLASS_PORTRAITS[charClass])
  };
}

export function generateCharacterPool(count: number): Character[] {
  const characters: Character[] = [];
  const usedNames = new Set<string>();
  
  for (let i = 0; i < count; i++) {
    let char: Character;
    do {
      char = generateCharacter(`candidate-${i}`);
    } while (usedNames.has(char.name));
    
    usedNames.add(char.name);
    characters.push(char);
  }
  
  return characters;
}
