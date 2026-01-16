import { CombatParticipant } from '@/types/combat';
import { cn } from '@/lib/utils';
import { Skull, Heart } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface EnemyDisplayProps {
  enemies: CombatParticipant[];
  currentTurnId: string | undefined;
}

export function EnemyDisplay({ enemies, currentTurnId }: EnemyDisplayProps) {
  return (
    <div className="space-y-3">
      {enemies.map(enemy => {
        const healthPercent = (enemy.health / enemy.maxHealth) * 100;
        const isCurrentTurn = enemy.id === currentTurnId;
        
        return (
          <div
            key={enemy.id}
            className={cn(
              "bg-card border border-border rounded-lg p-4 transition-all",
              isCurrentTurn && "ring-2 ring-destructive",
              !enemy.isAlive && "opacity-50"
            )}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {enemy.isAlive ? (
                  <div className="w-8 h-8 rounded-full bg-destructive/20 flex items-center justify-center">
                    <span className="text-destructive text-lg">👹</span>
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                    <Skull className="w-4 h-4 text-muted-foreground" />
                  </div>
                )}
                <div>
                  <h4 className={cn(
                    "font-semibold",
                    !enemy.isAlive && "line-through text-muted-foreground"
                  )}>
                    {enemy.name}
                  </h4>
                  {isCurrentTurn && enemy.isAlive && (
                    <span className="text-xs text-destructive animate-pulse">
                      Taking turn...
                    </span>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-1 text-sm">
                <Heart className={cn(
                  "w-4 h-4",
                  healthPercent > 50 ? "text-health" : 
                  healthPercent > 25 ? "text-yellow-500" : "text-destructive"
                )} />
                <span>{enemy.health}/{enemy.maxHealth}</span>
              </div>
            </div>

            <Progress 
              value={healthPercent} 
              className={cn(
                "h-3",
                healthPercent <= 25 && "[&>div]:bg-destructive",
                healthPercent > 25 && healthPercent <= 50 && "[&>div]:bg-yellow-500"
              )}
            />

            {!enemy.isAlive && (
              <div className="mt-2 text-center text-sm text-muted-foreground">
                Defeated
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
