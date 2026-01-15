import { Character, CharacterClass, Attributes, Spell, InventoryItem } from '@/types/game';
import { selectRandomTraits, applyTraitModifiers } from './traits';
import { calculateMaxHealth } from './statCalculations';

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

const CLASS_SPELLS: Record<CharacterClass, Spell[]> = {
  Warrior: [
    { id: 'w1', name: 'Battle Cry', type: 'buff', description: 'Boosts party morale and attack power.', cost: 10 },
    { id: 'w2', name: 'Shield Wall', type: 'buff', description: 'Reduces incoming damage for all allies.', cost: 15 },
  ],
  Rogue: [
    { id: 'r1', name: 'Smoke Bomb', type: 'utility', description: 'Creates cover to escape or ambush.', cost: 10 },
    { id: 'r2', name: 'Backstab', type: 'attack', description: 'A devastating attack from the shadows.', cost: 15 },
  ],
  Mage: [
    { id: 'm1', name: 'Fireball', type: 'attack', description: 'Hurls a ball of fire at enemies.', cost: 20 },
    { id: 'm2', name: 'Arcane Shield', type: 'buff', description: 'Creates a protective magical barrier.', cost: 15 },
    { id: 'm3', name: 'Lightning Bolt', type: 'attack', description: 'A devastating bolt of electricity.', cost: 25 },
  ],
  Cleric: [
    { id: 'c1', name: 'Heal', type: 'heal', description: 'Restores health to an ally.', cost: 15 },
    { id: 'c2', name: 'Bless', type: 'buff', description: 'Increases luck and protection.', cost: 10 },
    { id: 'c3', name: 'Smite', type: 'attack', description: 'Divine damage against evil.', cost: 20 },
  ],
  Ranger: [
    { id: 'rg1', name: 'Hunter\'s Mark', type: 'debuff', description: 'Marks a target for increased damage.', cost: 10 },
    { id: 'rg2', name: 'Entangling Shot', type: 'debuff', description: 'Roots enemies in place with vines.', cost: 15 },
  ],
  Bard: [
    { id: 'b1', name: 'Inspiring Song', type: 'buff', description: 'Boosts party stats through music.', cost: 10 },
    { id: 'b2', name: 'Lullaby', type: 'debuff', description: 'Puts enemies to sleep.', cost: 15 },
    { id: 'b3', name: 'Healing Melody', type: 'heal', description: 'Soothes wounds with magical music.', cost: 20 },
  ],
};

const STARTING_ITEMS: Record<CharacterClass, InventoryItem[]> = {
  Warrior: [
    { id: 'sw1', name: 'Iron Longsword', type: 'weapon', rarity: 'common', description: 'A sturdy blade for battle.', equipped: true },
    { id: 'sh1', name: 'Wooden Shield', type: 'armor', rarity: 'common', description: 'Basic protection.', equipped: true },
  ],
  Rogue: [
    { id: 'dg1', name: 'Twin Daggers', type: 'weapon', rarity: 'common', description: 'Quick and deadly.', equipped: true },
    { id: 'cl1', name: 'Leather Cloak', type: 'armor', rarity: 'common', description: 'Light and stealthy.', equipped: true },
  ],
  Mage: [
    { id: 'st1', name: 'Apprentice Staff', type: 'weapon', rarity: 'common', description: 'Channels arcane energy.', equipped: true },
    { id: 'rb1', name: 'Cloth Robes', type: 'armor', rarity: 'common', description: 'Light mage attire.', equipped: true },
  ],
  Cleric: [
    { id: 'mc1', name: 'Holy Mace', type: 'weapon', rarity: 'common', description: 'Blessed for battle.', equipped: true },
    { id: 'ch1', name: 'Chain Mail', type: 'armor', rarity: 'common', description: 'Protective holy armor.', equipped: true },
  ],
  Ranger: [
    { id: 'bw1', name: 'Hunting Bow', type: 'weapon', rarity: 'common', description: 'Accurate and reliable.', equipped: true },
    { id: 'la1', name: 'Leather Armor', type: 'armor', rarity: 'common', description: 'Flexible protection.', equipped: true },
  ],
  Bard: [
    { id: 'lt1', name: 'Lute', type: 'weapon', rarity: 'common', description: 'A magical instrument.', equipped: true },
    { id: 'fc1', name: 'Fancy Clothes', type: 'armor', rarity: 'common', description: 'Stylish performance attire.', equipped: true },
  ],
};

// Class stat bonuses: primary +4, secondary +2
const CLASS_STAT_BONUSES: Record<CharacterClass, { primary: keyof Attributes; primaryBonus: number; secondary: keyof Attributes; secondaryBonus: number }> = {
  Warrior: { primary: 'strength', primaryBonus: 4, secondary: 'constitution', secondaryBonus: 2 },
  Rogue: { primary: 'dexterity', primaryBonus: 4, secondary: 'constitution', secondaryBonus: 2 },
  Ranger: { primary: 'dexterity', primaryBonus: 4, secondary: 'wisdom', secondaryBonus: 2 },
  Bard: { primary: 'charisma', primaryBonus: 4, secondary: 'intelligence', secondaryBonus: 2 },
  Mage: { primary: 'intelligence', primaryBonus: 4, secondary: 'wisdom', secondaryBonus: 2 },
  Cleric: { primary: 'wisdom', primaryBonus: 4, secondary: 'strength', secondaryBonus: 2 },
};

// Generate base stats between 8-12
function generateBaseStat(): number {
  return Math.floor(Math.random() * 5) + 8; // 8-12 range
}

function generateBaseAttributes(): Attributes {
  return {
    strength: generateBaseStat(),
    dexterity: generateBaseStat(),
    constitution: generateBaseStat(),
    intelligence: generateBaseStat(),
    wisdom: generateBaseStat(),
    charisma: generateBaseStat()
  };
}

function applyClassBonuses(attributes: Attributes, charClass: CharacterClass): Attributes {
  const bonuses = CLASS_STAT_BONUSES[charClass];
  const modified = { ...attributes };
  
  modified[bonuses.primary] = Math.min(20, modified[bonuses.primary] + bonuses.primaryBonus);
  modified[bonuses.secondary] = Math.min(20, modified[bonuses.secondary] + bonuses.secondaryBonus);
  
  return modified;
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function getExperienceForLevel(level: number): number {
  return level * 100; // 100 XP per level
}

export function generateCharacter(id: string): Character {
  const firstName = pickRandom(FIRST_NAMES);
  const lastName = pickRandom(LAST_NAMES);
  const charClass = pickRandom(CLASSES);
  
  // Generate base attributes (8-12 range)
  const baseAttributes = generateBaseAttributes();
  
  // Select 2 random traits with rarity weighting
  const selectedTraits = selectRandomTraits(2);
  const traitNames = selectedTraits.map(t => t.name);
  
  // Apply trait modifiers to base attributes
  const attributesWithTraits = applyTraitModifiers(baseAttributes, traitNames);
  
  // Apply class bonuses (final step)
  const attributes = applyClassBonuses(attributesWithTraits, charClass);
  
  // Calculate max health using constitution (uses the stat calculation system)
  const level = 1;
  const maxHealth = calculateMaxHealth(level, attributes);
  
  // Give starting spells (1-2 random from class pool)
  const classSpells = CLASS_SPELLS[charClass];
  const numSpells = Math.min(classSpells.length, Math.floor(Math.random() * 2) + 1);
  const spells = [...classSpells].sort(() => Math.random() - 0.5).slice(0, numSpells);
  
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
    experience: 0,
    experienceToLevel: getExperienceForLevel(2),
    status: ['healthy'],
    traits: traitNames,
    relationships: [],
    quests: 0,
    questHistory: [],
    inventory: [...STARTING_ITEMS[charClass]],
    spells,
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
