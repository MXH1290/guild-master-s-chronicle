import { Attributes } from '@/types/game';

export type TraitRarity = 'extremely_rare' | 'rare' | 'common';

export interface TraitDefinition {
  name: string;
  rarity: TraitRarity;
  modifiers: Partial<Record<keyof Attributes, number>>;
  description: string;
}

// Rarity weights for trait selection
const RARITY_WEIGHTS: Record<TraitRarity, number> = {
  extremely_rare: 2,  // 2% chance
  rare: 18,           // 18% chance
  common: 80          // 80% chance
};

export const TRAIT_DEFINITIONS: TraitDefinition[] = [
  // EXTREMELY RARE TRAITS
  {
    name: 'Heroic',
    rarity: 'extremely_rare',
    modifiers: { strength: 2, dexterity: 2, constitution: 2 },
    description: 'A natural born hero with exceptional physical prowess.'
  },
  {
    name: 'Leader',
    rarity: 'extremely_rare',
    modifiers: { intelligence: 2, wisdom: 2, charisma: 2 },
    description: 'A commanding presence with sharp mind and silver tongue.'
  },
  {
    name: 'Doomed',
    rarity: 'extremely_rare',
    modifiers: { strength: -2, dexterity: -2, constitution: -2 },
    description: 'Cursed with physical frailty and misfortune.'
  },
  {
    name: 'Brain-Dead',
    rarity: 'extremely_rare',
    modifiers: { intelligence: -2, wisdom: -2, charisma: -2 },
    description: 'Severely lacking in mental faculties.'
  },

  // RARE TRAITS
  {
    name: 'Strong',
    rarity: 'rare',
    modifiers: { strength: 2, constitution: 2 },
    description: 'Naturally powerful and resilient.'
  },
  {
    name: 'Wise',
    rarity: 'rare',
    modifiers: { intelligence: 2, wisdom: 2 },
    description: 'Deeply thoughtful and knowledgeable.'
  },
  {
    name: 'Athletic',
    rarity: 'rare',
    modifiers: { strength: 2, dexterity: 2 },
    description: 'Peak physical conditioning and agility.'
  },
  {
    name: 'Witty',
    rarity: 'rare',
    modifiers: { wisdom: 2, charisma: 2 },
    description: 'Quick-witted with a silver tongue.'
  },
  {
    name: 'Stoic',
    rarity: 'rare',
    modifiers: { constitution: 2, wisdom: 2 },
    description: 'Enduring and mentally fortified.'
  },
  {
    name: 'Commanding',
    rarity: 'rare',
    modifiers: { strength: 2, charisma: 2 },
    description: 'A powerful presence that demands respect.'
  },
  {
    name: 'Arcane',
    rarity: 'rare',
    modifiers: { intelligence: 2, wisdom: 2 },
    description: 'Naturally attuned to magical forces.'
  },
  {
    name: 'Graceful',
    rarity: 'rare',
    modifiers: { dexterity: 2, charisma: 2 },
    description: 'Elegant in movement and manner.'
  },
  {
    name: 'Frail',
    rarity: 'rare',
    modifiers: { strength: -2, constitution: -2 },
    description: 'Physically weak and easily exhausted.'
  },
  {
    name: 'Sickly',
    rarity: 'rare',
    modifiers: { constitution: -2, intelligence: -2 },
    description: 'Prone to illness affecting body and mind.'
  },
  {
    name: 'Simple',
    rarity: 'rare',
    modifiers: { wisdom: -2, intelligence: -2 },
    description: 'Not the sharpest tool in the shed.'
  },
  {
    name: 'Dull',
    rarity: 'rare',
    modifiers: { charisma: -2, wisdom: -2 },
    description: 'Boring and lacking in insight.'
  },
  {
    name: 'Flat-Footed',
    rarity: 'rare',
    modifiers: { dexterity: -2 },
    description: 'Slow to react and clumsy in movement.'
  },
  {
    name: 'Coward',
    rarity: 'rare',
    modifiers: { strength: -2, charisma: -2 },
    description: 'Lacks courage and conviction.'
  },

  // COMMON TRAITS
  {
    name: 'Reckless',
    rarity: 'common',
    modifiers: { strength: 2, wisdom: -2 },
    description: 'Bold and powerful, but lacks judgment.'
  },
  {
    name: 'Book-Worm',
    rarity: 'common',
    modifiers: { intelligence: 2, strength: -2 },
    description: 'Brilliant mind in a fragile body.'
  },
  {
    name: 'Small',
    rarity: 'common',
    modifiers: { dexterity: 2, constitution: -2 },
    description: 'Quick and nimble, but easily hurt.'
  },
  {
    name: 'Huge',
    rarity: 'common',
    modifiers: { strength: 2, dexterity: -2 },
    description: 'Powerful but lumbering.'
  },
  {
    name: 'Fat',
    rarity: 'common',
    modifiers: { constitution: 2, dexterity: -2 },
    description: 'Tough to bring down, but slow on their feet.'
  },
  {
    name: 'Overthinker',
    rarity: 'common',
    modifiers: { wisdom: 2, charisma: -2 },
    description: 'Deeply analytical but socially awkward.'
  },
  {
    name: 'Hot-Headed',
    rarity: 'common',
    modifiers: { constitution: 2, charisma: -2 },
    description: 'Tough as nails but hard to get along with.'
  },
  {
    name: 'Comedian',
    rarity: 'common',
    modifiers: { charisma: 2, intelligence: -2 },
    description: 'Life of the party, but not very bright.'
  },
  {
    name: 'Scholar',
    rarity: 'common',
    modifiers: { intelligence: 2, constitution: -2 },
    description: 'Brilliant but physically frail from years of study.'
  },
  {
    name: 'Playful',
    rarity: 'common',
    modifiers: { charisma: 2, strength: -2 },
    description: 'Charming and fun, but lacks muscle.'
  },
  {
    name: 'Quick',
    rarity: 'common',
    modifiers: { dexterity: 2, intelligence: -2 },
    description: 'Fast reflexes but slow to think.'
  },
  {
    name: 'Twitchy',
    rarity: 'common',
    modifiers: { dexterity: 2, charisma: -2, wisdom: -2 },
    description: 'Lightning fast but nervous and unpredictable.'
  },
  {
    name: 'Naive',
    rarity: 'common',
    modifiers: { charisma: 2, wisdom: -2, intelligence: -2 },
    description: 'Likeable but easily fooled.'
  },
  {
    name: 'Single-Minded',
    rarity: 'common',
    modifiers: { wisdom: 2, charisma: -2, dexterity: -2 },
    description: 'Focused to a fault, ignoring everything else.'
  },
  {
    name: 'Chronic-Injury',
    rarity: 'common',
    modifiers: { intelligence: 2, strength: -2, constitution: -2 },
    description: 'Sharp mind in a broken body.'
  }
];

// Group traits by rarity for efficient selection
const TRAITS_BY_RARITY: Record<TraitRarity, TraitDefinition[]> = {
  extremely_rare: TRAIT_DEFINITIONS.filter(t => t.rarity === 'extremely_rare'),
  rare: TRAIT_DEFINITIONS.filter(t => t.rarity === 'rare'),
  common: TRAIT_DEFINITIONS.filter(t => t.rarity === 'common')
};

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function selectRarity(): TraitRarity {
  const roll = Math.random() * 100;
  if (roll < RARITY_WEIGHTS.extremely_rare) {
    return 'extremely_rare';
  } else if (roll < RARITY_WEIGHTS.extremely_rare + RARITY_WEIGHTS.rare) {
    return 'rare';
  }
  return 'common';
}

export function selectRandomTraits(count: number = 2): TraitDefinition[] {
  const selectedTraits: TraitDefinition[] = [];
  const usedNames = new Set<string>();

  while (selectedTraits.length < count) {
    const rarity = selectRarity();
    const traitsOfRarity = TRAITS_BY_RARITY[rarity];
    const trait = pickRandom(traitsOfRarity);
    
    // Avoid duplicate traits
    if (!usedNames.has(trait.name)) {
      selectedTraits.push(trait);
      usedNames.add(trait.name);
    }
  }

  return selectedTraits;
}

export function getTraitByName(name: string): TraitDefinition | undefined {
  return TRAIT_DEFINITIONS.find(t => t.name === name);
}

export function applyTraitModifiers(baseAttributes: Attributes, traits: string[]): Attributes {
  const modified = { ...baseAttributes };
  
  for (const traitName of traits) {
    const trait = getTraitByName(traitName);
    if (trait) {
      for (const [stat, modifier] of Object.entries(trait.modifiers)) {
        const key = stat as keyof Attributes;
        modified[key] = Math.max(1, Math.min(20, modified[key] + modifier));
      }
    }
  }
  
  return modified;
}

// Calculate net stat change for a trait (sum of all modifiers)
export function getTraitNetValue(trait: TraitDefinition): number {
  return Object.values(trait.modifiers).reduce((sum, mod) => sum + mod, 0);
}

export type TraitValueType = 'positive' | 'neutral' | 'negative';

export function getTraitValueType(trait: TraitDefinition): TraitValueType {
  const netValue = getTraitNetValue(trait);
  if (netValue > 0) return 'positive';
  if (netValue < 0) return 'negative';
  return 'neutral';
}

export function getTraitColor(trait: TraitDefinition): string {
  const valueType = getTraitValueType(trait);
  switch (valueType) {
    case 'positive':
      return 'text-health';
    case 'negative':
      return 'text-destructive';
    case 'neutral':
      return 'text-muted-foreground';
  }
}

export function getTraitBg(trait: TraitDefinition): string {
  const valueType = getTraitValueType(trait);
  switch (valueType) {
    case 'positive':
      return 'bg-health/15 border-health/40';
    case 'negative':
      return 'bg-destructive/15 border-destructive/40';
    case 'neutral':
      return 'bg-muted/50 border-muted';
  }
}

// Legacy rarity-based colors (kept for potential future use)
export function getTraitRarityColor(rarity: TraitRarity): string {
  switch (rarity) {
    case 'extremely_rare':
      return 'text-legendary';
    case 'rare':
      return 'text-rare';
    case 'common':
      return 'text-foreground';
  }
}

export function getTraitRarityBg(rarity: TraitRarity): string {
  switch (rarity) {
    case 'extremely_rare':
      return 'bg-legendary/20 border-legendary/50';
    case 'rare':
      return 'bg-rare/20 border-rare/50';
    case 'common':
      return 'bg-muted/50 border-muted';
  }
}
