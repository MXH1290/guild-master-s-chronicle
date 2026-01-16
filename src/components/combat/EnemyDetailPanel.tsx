import { CombatParticipant } from '@/types/combat';
import { cn } from '@/lib/utils';
import { Heart, Shield, Swords, Skull } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { getModifier } from '@/lib/statCalculations';

interface EnemyDetailPanelProps {
  enemy: CombatParticipant;
  isCurrentTurn: boolean;
}

export function EnemyDetailPanel({ enemy, isCurrentTurn }: EnemyDetailPanelProps) {
  const enemyRef = enemy.enemyRef;
  
  // Default attributes if not specified (all 10s as per user request)
  const attributes = enemyRef?.attributes || {
    strength: 10,
    dexterity: 10,
    constitution: 10,
    intelligence: 10,
    wisdom: 10,
    charisma: 10
  };

  const healthPercent = (enemy.health / enemy.maxHealth) * 100;
  const dexMod = getModifier(attributes.dexterity);
  const ac = 10 + dexMod;
  
  // Calculate attack info from enemy actions
  const strMod = getModifier(attributes.strength);
  const attackBonus = strMod;
  
  // Get enemy actions/attacks
  const actions = enemyRef?.actions || [
    { id: 'basic', name: 'Attack', type: 'attack' as const, damage: 4, description: 'Basic attack', weight: 1 }
  ];

  return (
    <div className={cn(
      "bg-card border-2 rounded-xl p-6 h-full flex flex-col",
      isCurrentTurn ? "border-destructive ring-2 ring-destructive/30" : "border-border",
      !enemy.isAlive && "opacity-60"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {enemy.isAlive ? (
            <div className="w-12 h-12 rounded-full bg-destructive/20 flex items-center justify-center">
              <span className="text-2xl">👹</span>
            </div>
          ) : (
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
              <Skull className="w-6 h-6 text-muted-foreground" />
            </div>
          )}
          <div>
            <h2 className={cn(
              "text-2xl font-bold",
              !enemy.isAlive && "line-through text-muted-foreground"
            )}>
              {enemy.name}
            </h2>
            <p className="text-muted-foreground">Enemy</p>
          </div>
        </div>
        {isCurrentTurn && enemy.isAlive && (
          <span className="px-3 py-1 bg-destructive/20 text-destructive rounded-full text-sm font-medium animate-pulse">
            Enemy Turn
          </span>
        )}
      </div>

      {!enemy.isAlive && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Skull className="w-16 h-16 mx-auto text-muted-foreground mb-2" />
            <p className="text-xl font-semibold text-muted-foreground">Defeated</p>
          </div>
        </div>
      )}

      {enemy.isAlive && (
        <>
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
              <span className="text-lg font-bold">{enemy.health} / {enemy.maxHealth}</span>
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
              <Shield className="w-5 h-5 mx-auto mb-1 text-destructive" />
              <div className="text-2xl font-bold">{ac}</div>
              <div className="text-xs text-muted-foreground">Armor Class</div>
            </div>
            <div className="bg-muted/50 rounded-lg p-3 text-center">
              <Swords className="w-5 h-5 mx-auto mb-1 text-destructive" />
              <div className="text-2xl font-bold">{attackBonus >= 0 ? '+' : ''}{attackBonus}</div>
              <div className="text-xs text-muted-foreground">To Hit</div>
            </div>
          </div>

          {/* Attributes */}
          <div className="grid grid-cols-3 gap-2 mb-6 text-sm">
            {Object.entries(attributes).map(([attr, value]) => (
              <div key={attr} className="bg-muted/30 rounded px-2 py-1 text-center">
                <span className="text-muted-foreground uppercase text-xs">{attr.slice(0, 3)}</span>
                <div className="font-semibold">
                  {value} ({getModifier(value) >= 0 ? '+' : ''}{getModifier(value)})
                </div>
              </div>
            ))}
          </div>

          {/* Attacks */}
          <div className="space-y-3 flex-1">
            <h3 className="font-semibold flex items-center gap-2">
              <Swords className="w-4 h-4 text-destructive" />
              Attacks
            </h3>
            
            <div className="space-y-2 text-sm">
              {actions.map(action => (
                <div key={action.id} className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-destructive">{action.name}</span>
                  </div>
                  <div className="flex items-center justify-between mt-1 text-xs">
                    <span className="text-muted-foreground">{action.description}</span>
                  </div>
                  <div className="flex items-center justify-between mt-1 text-xs">
                    <span className="text-muted-foreground">Attack:</span>
                    <span className="text-destructive font-mono">
                      +{attackBonus} to hit, 1d6{action.damage ? `+${Math.floor(action.damage / 2)}` : ''} damage
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
