import { CharacterClass } from '@/types/game';

export type WeaponDamageType = 'strength' | 'dexterity' | 'strength_or_dexterity' | 'intelligence_or_wisdom';

export interface ShopItem {
  id: string;
  name: string;
  type: 'weapon' | 'armor' | 'shield' | 'consumable' | 'ammunition';
  subType?: 'light' | 'medium' | 'heavy';
  description: string;
  price: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  classRestrictions?: CharacterClass[]; // If undefined, all classes can use
  // Weapon specific
  damageDice?: string; // e.g., '1d6', '1d4'
  damageType?: WeaponDamageType;
  requiresAmmunition?: string; // ID of required ammunition
  // Armor specific
  baseAC?: number;
  addsDexterity?: boolean;
  maxDexBonus?: number; // Max DEX bonus for medium armor
  acBonus?: number; // For shields
  // Consumable specific
  quantity?: number;
  shopLevel: number; // Minimum shop level required to stock this item
}

// Level 1 Shop Items
export const shopItems: ShopItem[] = [
  // === WEAPONS ===
  {
    id: 'shortsword',
    name: 'Shortsword',
    type: 'weapon',
    description: 'A versatile blade equally suited for slashing and thrusting. Can be wielded with strength or finesse.',
    price: 25,
    rarity: 'common',
    classRestrictions: ['Warrior', 'Rogue', 'Cleric', 'Ranger', 'Bard'], // Not Mage
    damageDice: '1d6',
    damageType: 'strength_or_dexterity',
    shopLevel: 1
  },
  {
    id: 'dagger',
    name: 'Dagger',
    type: 'weapon',
    description: 'A small, nimble blade favored by those who rely on speed and precision.',
    price: 10,
    rarity: 'common',
    // All classes can use
    damageDice: '1d4',
    damageType: 'dexterity',
    shopLevel: 1
  },
  {
    id: 'shortbow',
    name: 'Shortbow',
    type: 'weapon',
    description: 'A compact bow for ranged attacks. Requires arrows to use.',
    price: 30,
    rarity: 'common',
    classRestrictions: ['Warrior', 'Rogue', 'Cleric', 'Ranger', 'Bard'], // Not Mage
    damageDice: '1d6',
    damageType: 'dexterity',
    requiresAmmunition: 'arrows',
    shopLevel: 1
  },
  {
    id: 'staff',
    name: 'Staff',
    type: 'weapon',
    description: 'A wooden staff imbued with magical potential. Channels arcane or divine power.',
    price: 20,
    rarity: 'common',
    classRestrictions: ['Mage', 'Cleric'], // Only Mage and Cleric
    damageDice: '1d4',
    damageType: 'intelligence_or_wisdom',
    shopLevel: 1
  },

  // === AMMUNITION ===
  {
    id: 'arrows',
    name: 'Arrows (20)',
    type: 'ammunition',
    description: 'A quiver of 20 arrows for use with bows.',
    price: 5,
    rarity: 'common',
    quantity: 20,
    shopLevel: 1
  },

  // === ARMOR ===
  {
    id: 'leather_armor',
    name: 'Leather Armor',
    type: 'armor',
    subType: 'light',
    description: 'Light armor made from cured leather. Offers basic protection without hindering movement.',
    price: 35,
    rarity: 'common',
    classRestrictions: ['Warrior', 'Rogue', 'Cleric', 'Ranger', 'Bard'], // Not Mage
    baseAC: 12,
    addsDexterity: true,
    shopLevel: 1
  },
  {
    id: 'shield',
    name: 'Shield',
    type: 'shield',
    description: 'A wooden shield reinforced with iron. Provides additional protection in combat.',
    price: 20,
    rarity: 'common',
    classRestrictions: ['Warrior', 'Rogue', 'Cleric', 'Ranger', 'Bard'], // Not Mage
    acBonus: 2,
    shopLevel: 1
  },
  {
    id: 'chain_mail',
    name: 'Chain Mail',
    type: 'armor',
    subType: 'medium',
    description: 'Interlocking metal rings form this protective armor. Offers better protection but limits agility.',
    price: 75,
    rarity: 'common',
    classRestrictions: ['Warrior', 'Cleric', 'Ranger'], // Not Rogue, Mage, Bard
    baseAC: 13,
    addsDexterity: true,
    maxDexBonus: 2,
    shopLevel: 1
  },
  {
    id: 'breastplate',
    name: 'Breastplate',
    type: 'armor',
    subType: 'medium',
    description: 'A fitted metal chest piece with shoulder guards. Good protection while maintaining some mobility.',
    price: 100,
    rarity: 'common',
    classRestrictions: ['Warrior', 'Cleric', 'Ranger'], // Not Rogue, Mage, Bard
    baseAC: 14,
    addsDexterity: true,
    maxDexBonus: 2,
    shopLevel: 1
  }
];

// Get items available at a given shop level
export function getAvailableShopItems(shopLevel: number): ShopItem[] {
  return shopItems.filter(item => item.shopLevel <= shopLevel);
}

// Check if a character class can equip an item
export function canClassEquip(itemId: string, characterClass: CharacterClass): boolean {
  const item = shopItems.find(i => i.id === itemId);
  if (!item) return false;
  if (!item.classRestrictions) return true;
  return item.classRestrictions.includes(characterClass);
}

// Get shop item by ID
export function getShopItemById(itemId: string): ShopItem | undefined {
  return shopItems.find(item => item.id === itemId);
}
