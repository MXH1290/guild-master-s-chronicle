import { Enemy } from '@/types/combat';

// Basic enemy templates for different quest difficulties
export const enemyTemplates: Record<string, Omit<Enemy, 'id'>> = {
  goblin: {
    name: 'Goblin',
    maxHealth: 15,
    health: 15,
    attributes: {
      strength: 8,
      dexterity: 14,
      constitution: 10,
      intelligence: 8,
      wisdom: 8,
      charisma: 6
    },
    actions: [
      { id: 'slash', name: 'Slash', type: 'attack', damage: 4, description: 'A quick slash with a rusty blade', weight: 1 }
    ],
    experienceReward: 25,
    goldReward: 10
  },
  skeleton: {
    name: 'Skeleton',
    maxHealth: 20,
    health: 20,
    attributes: {
      strength: 10,
      dexterity: 12,
      constitution: 12,
      intelligence: 6,
      wisdom: 8,
      charisma: 4
    },
    actions: [
      { id: 'bone_strike', name: 'Bone Strike', type: 'attack', damage: 5, description: 'Strikes with bony claws', weight: 1 }
    ],
    experienceReward: 30,
    goldReward: 15
  },
  bandit: {
    name: 'Bandit',
    maxHealth: 25,
    health: 25,
    attributes: {
      strength: 12,
      dexterity: 12,
      constitution: 12,
      intelligence: 10,
      wisdom: 10,
      charisma: 10
    },
    actions: [
      { id: 'dagger', name: 'Dagger Strike', type: 'attack', damage: 6, description: 'A quick dagger thrust', weight: 1 }
    ],
    experienceReward: 40,
    goldReward: 25
  },
  orc: {
    name: 'Orc Warrior',
    maxHealth: 40,
    health: 40,
    attributes: {
      strength: 16,
      dexterity: 10,
      constitution: 14,
      intelligence: 7,
      wisdom: 10,
      charisma: 8
    },
    actions: [
      { id: 'greataxe', name: 'Greataxe Swing', type: 'attack', damage: 10, description: 'A devastating axe swing', weight: 1 }
    ],
    experienceReward: 75,
    goldReward: 40
  },
  troll: {
    name: 'Cave Troll',
    maxHealth: 80,
    health: 80,
    attributes: {
      strength: 18,
      dexterity: 8,
      constitution: 18,
      intelligence: 5,
      wisdom: 8,
      charisma: 4
    },
    actions: [
      { id: 'slam', name: 'Crushing Slam', type: 'attack', damage: 14, description: 'Slams the ground with massive fists', weight: 1 }
    ],
    experienceReward: 150,
    goldReward: 80
  },
  dragon_wyrmling: {
    name: 'Dragon Wyrmling',
    maxHealth: 100,
    health: 100,
    attributes: {
      strength: 16,
      dexterity: 14,
      constitution: 16,
      intelligence: 12,
      wisdom: 12,
      charisma: 14
    },
    actions: [
      { id: 'bite', name: 'Bite', type: 'attack', damage: 12, description: 'Snaps with razor-sharp teeth', weight: 0.6 },
      { id: 'fire_breath', name: 'Fire Breath', type: 'attack', damage: 18, description: 'Breathes a cone of fire', weight: 0.4 }
    ],
    experienceReward: 250,
    goldReward: 150
  }
};

// Get enemy for a quest based on difficulty
export function getEnemyForDifficulty(difficulty: string): Enemy {
  const templates: Record<string, string[]> = {
    trivial: ['goblin'],
    easy: ['goblin', 'skeleton'],
    medium: ['bandit', 'skeleton', 'orc'],
    hard: ['orc', 'troll'],
    deadly: ['troll', 'dragon_wyrmling']
  };

  const possibleEnemies = templates[difficulty] || ['goblin'];
  const templateKey = possibleEnemies[Math.floor(Math.random() * possibleEnemies.length)];
  const template = enemyTemplates[templateKey];

  return {
    id: `enemy-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    ...template
  };
}

// Generate a boss enemy for quest completion
export function generateQuestBoss(questName: string, difficulty: string): Enemy {
  const baseEnemy = getEnemyForDifficulty(difficulty);
  
  // Scale boss based on difficulty
  const difficultyMultipliers: Record<string, number> = {
    trivial: 1,
    easy: 1.25,
    medium: 1.5,
    hard: 2,
    deadly: 2.5
  };
  
  const multiplier = difficultyMultipliers[difficulty] || 1;
  
  return {
    ...baseEnemy,
    name: `${questName} Boss`,
    maxHealth: Math.floor(baseEnemy.maxHealth * multiplier),
    health: Math.floor(baseEnemy.maxHealth * multiplier),
    experienceReward: Math.floor(baseEnemy.experienceReward * multiplier),
    goldReward: Math.floor(baseEnemy.goldReward * multiplier)
  };
}
