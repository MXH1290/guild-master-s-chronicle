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
    <div className="bg-card/80 backdrop-blur-sm border-b border-border px-6 py-3">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Round
          </span>
          <span className="text-xl font-bold text-primary">{round}</span>
        </div>
        
        <div className="h-8 w-px bg-border" />
        
        <div className="flex-1 flex gap-2 overflow-x-auto py-1">
          {orderedParticipants.map((participant, index) => {
            const isCurrent = index === currentTurnIndex;
            const isPast = index < currentTurnIndex;
            const isHero = participant.type === 'hero';
            const isDead = !participant.isAlive;

            return (
              <div
                key={participant.id}
                className={cn(
                  "flex-shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all",
                  isCurrent && "ring-2 ring-offset-2 ring-offset-background",
                  isCurrent && isHero && "ring-primary bg-primary/10 border-primary",
                  isCurrent && !isHero && "ring-destructive bg-destructive/10 border-destructive",
                  isPast && !isCurrent && "opacity-40",
                  isDead && "opacity-30",
                  !isCurrent && !isPast && !isDead && "bg-muted/30 border-muted"
                )}
              >
                {isDead ? (
                  <Skull className="w-3.5 h-3.5 text-muted-foreground" />
                ) : isHero ? (
                  <Shield className="w-3.5 h-3.5 text-health" />
                ) : (
                  <Swords className="w-3.5 h-3.5 text-destructive" />
                )}
                <span className={cn(
                  "text-sm font-medium",
                  isCurrent && isHero && "text-primary",
                  isCurrent && !isHero && "text-destructive",
                  isDead && "line-through"
                )}>
                  {participant.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  ({participant.initiative})
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
