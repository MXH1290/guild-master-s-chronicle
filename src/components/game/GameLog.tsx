import { GameLogEntry } from '@/types/game';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

interface GameLogProps {
  entries: GameLogEntry[];
}

export function GameLog({ entries }: GameLogProps) {
  return (
    <div className="border border-border bg-card/30 rounded-sm">
      <div className="px-3 py-2 border-b border-border">
        <h3 className="font-display text-sm text-muted-foreground">Chronicle</h3>
      </div>
      <ScrollArea className="h-[200px]">
        <div className="p-3 space-y-2">
          {entries.slice().reverse().map((entry) => (
            <div 
              key={entry.id} 
              className={cn(
                "text-sm leading-relaxed",
                entry.type === 'info' && "text-muted-foreground",
                entry.type === 'success' && "text-health",
                entry.type === 'warning' && "text-warning",
                entry.type === 'danger' && "text-destructive"
              )}
            >
              <span className="text-xs text-muted-foreground/60 mr-2">Day {entry.day}</span>
              {entry.message}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
