import { useState } from 'react';
import { ShoppingBag, Coins, RefreshCw, Sword, Shield, Shirt, Package } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { ShopItem, getAvailableShopItems } from '@/data/shopItems';
import { InventoryItem, CharacterClass } from '@/types/game';

interface ShopPageProps {
  gold: number;
  shopInventory: ShopItem[];
  shopLevel: number;
  lastRestockDay: number;
  currentDay: number;
  onPurchase: (item: ShopItem) => void;
}

function getItemIcon(type: ShopItem['type']) {
  switch (type) {
    case 'weapon':
      return <Sword className="w-5 h-5" />;
    case 'armor':
      return <Shirt className="w-5 h-5" />;
    case 'shield':
      return <Shield className="w-5 h-5" />;
    default:
      return <Package className="w-5 h-5" />;
  }
}

function getClassRestrictionText(restrictions?: CharacterClass[]): string {
  if (!restrictions) return 'All classes';
  return restrictions.join(', ');
}

function getDamageText(item: ShopItem): string {
  if (!item.damageDice) return '';
  
  switch (item.damageType) {
    case 'strength':
      return `${item.damageDice} + STR`;
    case 'dexterity':
      return `${item.damageDice} + DEX`;
    case 'strength_or_dexterity':
      return `${item.damageDice} + STR/DEX`;
    case 'intelligence_or_wisdom':
      return `${item.damageDice} + INT/WIS`;
    default:
      return item.damageDice;
  }
}

function getACText(item: ShopItem): string {
  if (item.acBonus) {
    return `+${item.acBonus} AC`;
  }
  if (item.baseAC) {
    let text = `AC ${item.baseAC}`;
    if (item.addsDexterity) {
      text += item.maxDexBonus ? ` + DEX (max ${item.maxDexBonus})` : ' + DEX';
    }
    return text;
  }
  return '';
}

export default function ShopPage({
  gold,
  shopInventory,
  shopLevel,
  lastRestockDay,
  currentDay,
  onPurchase
}: ShopPageProps) {
  const { toast } = useToast();
  const daysUntilRestock = 7 - ((currentDay - lastRestockDay) % 7);

  const handlePurchase = (item: ShopItem) => {
    if (gold < item.price) {
      toast({
        title: 'Insufficient Gold',
        description: `You need ${item.price - gold} more gold to purchase ${item.name}.`,
        variant: 'destructive'
      });
      return;
    }
    onPurchase(item);
    toast({
      title: 'Purchase Complete',
      description: `You purchased ${item.name} for ${item.price} gold.`
    });
  };

  const weapons = shopInventory.filter(item => item.type === 'weapon');
  const armor = shopInventory.filter(item => item.type === 'armor' || item.type === 'shield');
  const other = shopInventory.filter(item => item.type === 'ammunition' || item.type === 'consumable');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ShoppingBag className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-2xl font-display text-foreground">Shop</h1>
            <p className="text-sm text-muted-foreground">Level {shopLevel} Shop</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-muted/50 rounded-lg">
            <Coins className="w-5 h-5 text-yellow-500" />
            <span className="font-bold text-foreground">{gold}</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-muted/50 rounded-lg">
            <RefreshCw className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Restocks in {daysUntilRestock} day{daysUntilRestock !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Weapons Section */}
      {weapons.length > 0 && (
        <section>
          <h2 className="text-lg font-display mb-3 flex items-center gap-2">
            <Sword className="w-5 h-5 text-primary" />
            Weapons
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {weapons.map(item => (
              <ShopItemCard
                key={item.id}
                item={item}
                gold={gold}
                onPurchase={() => handlePurchase(item)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Armor Section */}
      {armor.length > 0 && (
        <section>
          <h2 className="text-lg font-display mb-3 flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Armor & Shields
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {armor.map(item => (
              <ShopItemCard
                key={item.id}
                item={item}
                gold={gold}
                onPurchase={() => handlePurchase(item)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Other Items Section */}
      {other.length > 0 && (
        <section>
          <h2 className="text-lg font-display mb-3 flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" />
            Supplies
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {other.map(item => (
              <ShopItemCard
                key={item.id}
                item={item}
                gold={gold}
                onPurchase={() => handlePurchase(item)}
              />
            ))}
          </div>
        </section>
      )}

      {shopInventory.length === 0 && (
        <Card className="bg-muted/30">
          <CardContent className="py-12 text-center">
            <ShoppingBag className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">The shop is empty. Check back after it restocks.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

interface ShopItemCardProps {
  item: ShopItem;
  gold: number;
  onPurchase: () => void;
}

function ShopItemCard({ item, gold, onPurchase }: ShopItemCardProps) {
  const canAfford = gold >= item.price;
  const damageText = getDamageText(item);
  const acText = getACText(item);

  return (
    <Card className="bg-card/80 border-border/50 hover:border-primary/30 transition-colors">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {getItemIcon(item.type)}
            <CardTitle className="text-base">{item.name}</CardTitle>
          </div>
          <Badge variant="outline" className="text-xs">
            {item.rarity}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">{item.description}</p>
        
        <div className="space-y-1.5">
          {damageText && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Damage:</span>
              <span className="font-medium text-foreground">{damageText}</span>
            </div>
          )}
          {acText && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Protection:</span>
              <span className="font-medium text-foreground">{acText}</span>
            </div>
          )}
          {item.requiresAmmunition && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-amber-500">⚠ Requires arrows</span>
            </div>
          )}
          {item.quantity && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Quantity:</span>
              <span className="font-medium text-foreground">{item.quantity}</span>
            </div>
          )}
        </div>

        <Separator />

        <div className="text-xs text-muted-foreground">
          {getClassRestrictionText(item.classRestrictions)}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Coins className="w-4 h-4 text-yellow-500" />
            <span className="font-bold">{item.price}</span>
          </div>
          <Button
            size="sm"
            onClick={onPurchase}
            disabled={!canAfford}
            variant={canAfford ? 'default' : 'secondary'}
          >
            {canAfford ? 'Buy' : 'Cannot Afford'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
