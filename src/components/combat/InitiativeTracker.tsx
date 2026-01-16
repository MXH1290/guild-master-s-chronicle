import { CombatParticipant } from '@/types/combat';
import { cn } from '@/lib/utils';
import { Skull, Swords, Shield } from 'lucide-react';

interface InitiativeTrackerProps {
  participants: CombatParticipant[];
  turnOrder: string[];
  currentTurnIndex: number;
  round: number;
}

export function InitiativeTracker({ 
  participants, 
  turnOrder, 
  currentTurnIndex,
  round 
}: InitiativeTrackerProps) {
  const orderedParticipants = turnOrder.map(id => 
    participants.find(p => p.id === id)
  ).filter(Boolean) as CombatParticipant[];

  return (
    <div className="bg-card border-b border-border px-4 py-3">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Initiative Order
        </h3>
        <span className="text-xs text-muted-foreground">Round {round}</span>
      </div>
      
      <div className="flex gap-2 overflow-x-auto pb-1">
        {orderedParticipants.map((participant, index) => {
          const isCurrent = index === currentTurnIndex;
          const isPast = index < currentTurnIndex;
          const isHero = participant.type === 'hero';
          const isDead = !participant.isAlive;

          return (
            <div
              key={participant.id}
              className={cn(
                "flex-shrink-0 flex flex-col items-center px-3 py-2 rounded-lg border transition-all",
                isCurrent && "ring-2 ring-primary bg-primary/10 border-primary",
                isPast && !isCurrent && "opacity-50",
                isDead && "opacity-30",
                !isCurrent && !isPast && !isDead && "bg-muted/30 border-muted",
                isHero ? "border-l-2 border-l-health" : "border-l-2 border-l-destructive"
              )}
            >
              <div className="flex items-center gap-1.5">
                {isDead ? (
                  <Skull className="w-3.5 h-3.5 text-muted-foreground" />
                ) : isHero ? (
                  <Shield className="w-3.5 h-3.5 text-health" />
                ) : (
                  <Swords className="w-3.5 h-3.5 text-destructive" />
                )}
                <span className={cn(
                  "text-sm font-medium truncate max-w-[80px]",
                  isCurrent && "text-primary",
                  isDead && "line-through"
                )}>
                  {participant.name}
                </span>
              </div>
              
              <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                <span>Init: {participant.initiative}</span>
                {!isDead && (
                  <span className={cn(
                    participant.health < participant.maxHealth * 0.3 && "text-destructive"
                  )}>
                    {participant.health}/{participant.maxHealth} HP
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
