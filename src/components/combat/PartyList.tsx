import { CombatParticipant } from '@/types/combat';
import { cn } from '@/lib/utils';
import { Skull, Heart, Shield } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface PartyListProps {
  heroes: CombatParticipant[];
  currentTurnId: string | undefined;
  selectedHeroId: string | undefined;
  onSelectHero: (heroId: string) => void;
}

export function PartyList({ heroes, currentTurnId, selectedHeroId, onSelectHero }: PartyListProps) {
  return (
    <div className="space-y-2 h-full flex flex-col">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2 px-2">
        <Shield className="w-4 h-4" />
        Your Party
      </h3>
      
      <div className="flex-1 space-y-2 overflow-y-auto">
        {heroes.map(hero => {
          const healthPercent = (hero.health / hero.maxHealth) * 100;
          const isCurrentTurn = hero.id === currentTurnId;
          const isSelected = hero.id === selectedHeroId;
          
          return (
            <button
              key={hero.id}
              onClick={() => onSelectHero(hero.id)}
              className={cn(
                "w-full text-left bg-card/50 border rounded-lg p-3 transition-all hover:bg-card",
                isSelected && "ring-2 ring-primary bg-primary/5",
                isCurrentTurn && !isSelected && "border-primary/50",
                !hero.isAlive && "opacity-50"
              )}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  {hero.isAlive ? (
                    <div className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center",
                      isCurrentTurn ? "bg-primary/20" : "bg-health/20"
                    )}>
                      <span className="text-sm">⚔️</span>
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                      <Skull className="w-3 h-3 text-muted-foreground" />
                    </div>
                  )}
                  <div>
                    <span className={cn(
                      "font-medium text-sm block",
                      !hero.isAlive && "line-through text-muted-foreground",
                      isCurrentTurn && "text-primary"
                    )}>
                      {hero.name}
                    </span>
                    {hero.characterRef && (
                      <span className="text-xs text-muted-foreground">
                        {hero.characterRef.class}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-1 text-xs">
                  <Heart className={cn(
                    "w-3 h-3",
                    healthPercent > 50 ? "text-health" : 
                    healthPercent > 25 ? "text-yellow-500" : "text-destructive"
                  )} />
                  <span>{hero.health}/{hero.maxHealth}</span>
                </div>
              </div>

              <Progress 
                value={healthPercent} 
                className={cn(
                  "h-1.5",
                  healthPercent <= 25 && "[&>div]:bg-destructive",
                  healthPercent > 25 && healthPercent <= 50 && "[&>div]:bg-yellow-500"
                )}
              />

              {isCurrentTurn && hero.isAlive && (
                <div className="mt-1 text-xs text-primary animate-pulse">
                  Current turn
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
