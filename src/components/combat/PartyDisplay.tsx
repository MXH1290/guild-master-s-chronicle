import { CombatParticipant } from '@/types/combat';
import { cn } from '@/lib/utils';
import { Skull, Heart, Shield } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface PartyDisplayProps {
  heroes: CombatParticipant[];
  currentTurnId: string | undefined;
}

export function PartyDisplay({ heroes, currentTurnId }: PartyDisplayProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
        <Shield className="w-4 h-4" />
        Your Party
      </h3>
      
      <div className="grid gap-2">
        {heroes.map(hero => {
          const healthPercent = (hero.health / hero.maxHealth) * 100;
          const isCurrentTurn = hero.id === currentTurnId;
          
          return (
            <div
              key={hero.id}
              className={cn(
                "bg-card/50 border border-border rounded-lg p-3 transition-all",
                isCurrentTurn && "ring-2 ring-primary bg-primary/5",
                !hero.isAlive && "opacity-50"
              )}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  {hero.isAlive ? (
                    <div className="w-6 h-6 rounded-full bg-health/20 flex items-center justify-center">
                      <span className="text-sm">⚔️</span>
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                      <Skull className="w-3 h-3 text-muted-foreground" />
                    </div>
                  )}
                  <span className={cn(
                    "font-medium text-sm",
                    !hero.isAlive && "line-through text-muted-foreground",
                    isCurrentTurn && "text-primary"
                  )}>
                    {hero.name}
                  </span>
                  {hero.characterRef && (
                    <span className="text-xs text-muted-foreground">
                      ({hero.characterRef.class})
                    </span>
                  )}
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
                  "h-2",
                  healthPercent <= 25 && "[&>div]:bg-destructive",
                  healthPercent > 25 && healthPercent <= 50 && "[&>div]:bg-yellow-500"
                )}
              />

              {isCurrentTurn && hero.isAlive && (
                <div className="mt-1 text-xs text-primary animate-pulse">
                  Your turn!
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
