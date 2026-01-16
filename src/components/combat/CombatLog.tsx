import { useEffect, useRef } from 'react';
import { CombatLogEntry } from '@/types/combat';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Swords, Heart, Skull, Target, Sparkles, Info, Trophy, XCircle } from 'lucide-react';

interface CombatLogProps {
  log: CombatLogEntry[];
}

const logTypeConfig: Record<CombatLogEntry['type'], { icon: typeof Swords; color: string }> = {
  attack: { icon: Swords, color: 'text-primary' },
  damage: { icon: Target, color: 'text-destructive' },
  heal: { icon: Heart, color: 'text-health' },
  miss: { icon: XCircle, color: 'text-muted-foreground' },
  critical: { icon: Sparkles, color: 'text-yellow-500' },
  death: { icon: Skull, color: 'text-destructive' },
  info: { icon: Info, color: 'text-muted-foreground' },
  victory: { icon: Trophy, color: 'text-health' },
  defeat: { icon: Skull, color: 'text-destructive' }
};

export function CombatLog({ log }: CombatLogProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auto-scroll to bottom when new entries are added
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [log]);

  return (
    <div className="flex flex-col h-full bg-card/50 border border-border rounded-lg">
      <div className="px-3 py-2 border-b border-border">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Combat Log
        </h3>
      </div>
      
      <ScrollArea className="flex-1 p-3" ref={scrollRef}>
        <div className="space-y-2">
          {log.map((entry) => {
            const config = logTypeConfig[entry.type];
            const Icon = config.icon;

            return (
              <div 
                key={entry.id}
                className={cn(
                  "flex items-start gap-2 text-sm p-2 rounded-md",
                  entry.type === 'critical' && "bg-yellow-500/10",
                  entry.type === 'death' && "bg-destructive/10",
                  entry.type === 'victory' && "bg-health/10",
                  entry.type === 'defeat' && "bg-destructive/10"
                )}
              >
                <Icon className={cn("w-4 h-4 mt-0.5 flex-shrink-0", config.color)} />
                <div className="flex-1">
                  <span className="font-medium">{entry.actorName}</span>
                  {' '}
                  <span className="text-muted-foreground">{entry.message}</span>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
