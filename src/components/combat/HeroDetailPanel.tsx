import { CombatParticipant } from '@/types/combat';
import { cn } from '@/lib/utils';
import { Heart, Shield, Swords, Package } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { getModifier } from '@/lib/statCalculations';
import { getEquippedWeapon, getEquippedArmor, getEquippedShield, calculateAC, getAttackBonus } from '@/lib/combatUtils';
import { Button } from '@/components/ui/button';

interface HeroDetailPanelProps {
  hero: CombatParticipant;
  isCurrentTurn: boolean;
  validTargets: CombatParticipant[];
  onAttack: (targetId: string) => void;
  disabled?: boolean;
}

export function HeroDetailPanel({ 
  hero, 
  isCurrentTurn, 
  validTargets, 
  onAttack,
  disabled 
}: HeroDetailPanelProps) {
  const character = hero.characterRef;
  if (!character) return null;

  const healthPercent = (hero.health / hero.maxHealth) * 100;
  const ac = calculateAC(character.attributes, character);
  const attackBonus = getAttackBonus(character);
  
  const weapon = getEquippedWeapon(character);
  const armor = getEquippedArmor(character);
  const shield = getEquippedShield(character);

  // Calculate damage info
  const strMod = getModifier(character.attributes.strength);
  const dexMod = getModifier(character.attributes.dexterity);
  const intMod = getModifier(character.attributes.intelligence);
  const wisMod = getModifier(character.attributes.wisdom);

  let damageString = `1d4${strMod >= 0 ? '+' : ''}${strMod}`;
  let attackStat = 'STR';
  
  if (weapon) {
    const damageDice = weapon.damageDice || '1d4';
    let modifier = strMod;
    
    if (weapon.damageType === 'dexterity') {
      modifier = dexMod;
      attackStat = 'DEX';
    } else if (weapon.damageType === 'strength_or_dexterity') {
      modifier = Math.max(strMod, dexMod);
      attackStat = strMod >= dexMod ? 'STR' : 'DEX';
    } else if (weapon.damageType === 'intelligence_or_wisdom') {
      modifier = Math.max(intMod, wisMod);
      attackStat = intMod >= wisMod ? 'INT' : 'WIS';
    }
    
    damageString = `${damageDice}${modifier >= 0 ? '+' : ''}${modifier}`;
  }

  return (
    <div className={cn(
      "bg-card border-2 rounded-xl p-6 h-full flex flex-col",
      isCurrentTurn ? "border-primary ring-2 ring-primary/30" : "border-border"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold">{hero.name}</h2>
          <p className="text-muted-foreground">
            Level {character.level} {character.class}
          </p>
        </div>
        {isCurrentTurn && (
          <span className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm font-medium animate-pulse">
            Your Turn
          </span>
        )}
      </div>

      {/* Health Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Heart className={cn(
              "w-5 h-5",
              healthPercent > 50 ? "text-health" : 
              healthPercent > 25 ? "text-yellow-500" : "text-destructive"
            )} />
            <span className="font-semibold">Health</span>
          </div>
          <span className="text-lg font-bold">{hero.health} / {hero.maxHealth}</span>
        </div>
        <Progress 
          value={healthPercent} 
          className={cn(
            "h-4",
            healthPercent <= 25 && "[&>div]:bg-destructive",
            healthPercent > 25 && healthPercent <= 50 && "[&>div]:bg-yellow-500"
          )}
        />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-muted/50 rounded-lg p-3 text-center">
          <Shield className="w-5 h-5 mx-auto mb-1 text-primary" />
          <div className="text-2xl font-bold">{ac}</div>
          <div className="text-xs text-muted-foreground">Armor Class</div>
        </div>
        <div className="bg-muted/50 rounded-lg p-3 text-center">
          <Swords className="w-5 h-5 mx-auto mb-1 text-primary" />
          <div className="text-2xl font-bold">{attackBonus >= 0 ? '+' : ''}{attackBonus}</div>
          <div className="text-xs text-muted-foreground">To Hit ({attackStat})</div>
        </div>
      </div>

      {/* Attributes */}
      <div className="grid grid-cols-3 gap-2 mb-6 text-sm">
        {Object.entries(character.attributes).map(([attr, value]) => (
          <div key={attr} className="bg-muted/30 rounded px-2 py-1 text-center">
            <span className="text-muted-foreground uppercase text-xs">{attr.slice(0, 3)}</span>
            <div className="font-semibold">
              {value} ({getModifier(value) >= 0 ? '+' : ''}{getModifier(value)})
            </div>
          </div>
        ))}
      </div>

      {/* Equipment */}
      <div className="space-y-3 mb-6 flex-1">
        <h3 className="font-semibold flex items-center gap-2">
          <Package className="w-4 h-4" />
          Equipment
        </h3>
        
        <div className="space-y-2 text-sm">
          <div className="bg-muted/30 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Weapon:</span>
              <span className="font-medium">{weapon?.name || 'Unarmed'}</span>
            </div>
            <div className="flex items-center justify-between mt-1 text-xs">
              <span className="text-muted-foreground">Attack:</span>
              <span className="text-primary font-mono">
                +{attackBonus} to hit, {damageString} damage
              </span>
            </div>
          </div>
          
          <div className="bg-muted/30 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Armor:</span>
              <span className="font-medium">{armor?.name || 'None'}</span>
            </div>
          </div>
          
          <div className="bg-muted/30 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Shield:</span>
              <span className="font-medium">{shield?.name || 'None'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Attack Actions - only show if it's this hero's turn */}
      {isCurrentTurn && validTargets.length > 0 && (
        <div className="border-t border-border pt-4">
          <p className="text-sm text-muted-foreground mb-2">Select target to attack:</p>
          <div className="flex flex-wrap gap-2">
            {validTargets.map(target => (
              <Button
                key={target.id}
                variant="destructive"
                size="sm"
                onClick={() => onAttack(target.id)}
                disabled={disabled}
                className="flex items-center gap-2"
              >
                <Swords className="w-4 h-4" />
                <span>{target.name}</span>
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
