import { Quest } from '@/types/game';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { Users, Swords, Map, MessageCircle, Shield, Package, ChevronRight } from 'lucide-react';

interface QuestCardCompactProps {
  quest: Quest;
}

const difficultyColors = {
  trivial: 'bg-muted-foreground/20 text-muted-foreground',
  easy: 'bg-health/20 text-health',
  medium: 'bg-warning/20 text-warning',
  hard: 'bg-destructive/20 text-destructive',
  deadly: 'bg-stress/20 text-stress danger-pulse',
};

const typeIcons = {
  combat: Swords,
  exploration: Map,
  social: MessageCircle,
  escort: Shield,
  retrieval: Package,
};

export function QuestCardCompact({ quest }: QuestCardCompactProps) {
  const navigate = useNavigate();
  const TypeIcon = typeIcons[quest.type];
  const partyCount = quest.assignedParty.length;
  const minParty = quest.requirements.minPartySize || 1;

  return (
    <div 
      onClick={() => navigate(`/quest/${quest.id}`)}
      className={cn(
        "quest-card rounded-sm p-3 cursor-pointer transition-all",
        "hover:ring-1 hover:ring-primary/30 hover:bg-card/80",
        "flex items-center gap-3"
      )}
    >
      {/* Type Icon */}
      <div className="shrink-0">
        <TypeIcon className="w-5 h-5 text-primary" />
      </div>

      {/* Quest Info */}
      <div className="flex-1 min-w-0">
        <h3 className="font-display text-sm truncate">{quest.name}</h3>
      </div>

      {/* Difficulty Badge */}
      <div className={cn(
        "shrink-0 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-sm font-medium",
        difficultyColors[quest.difficulty]
      )}>
        {quest.difficulty}
      </div>

      {/* Party Count */}
      <div className="shrink-0 flex items-center gap-1 text-xs text-muted-foreground">
        <Users className="w-3.5 h-3.5" />
        <span className={cn(
          partyCount >= minParty && "text-health"
        )}>
          {partyCount}/{quest.partySlots}
        </span>
      </div>

      {/* Arrow */}
      <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
    </div>
  );
}
