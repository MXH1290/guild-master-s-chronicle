import { Quest, Character } from '@/types/game';
import { cn } from '@/lib/utils';
import { Clock, Swords, Map, MessageCircle, Package, Shield } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface ActiveQuestCardProps {
  quest: Quest;
  characters: Character[];
}

const typeIcons = {
  combat: Swords,
  exploration: Map,
  social: MessageCircle,
  escort: Shield,
  retrieval: Package,
};

const difficultyColors = {
  trivial: 'border-muted-foreground/30',
  easy: 'border-health/50',
  medium: 'border-warning/50',
  hard: 'border-destructive/50',
  deadly: 'border-stress/50',
};

export function ActiveQuestCard({ quest, characters }: ActiveQuestCardProps) {
  const TypeIcon = typeIcons[quest.type];
  const assignedCharacters = characters.filter(c => quest.assignedParty.includes(c.id));
  const hoursRemaining = Math.ceil((quest.duration * (100 - quest.progress)) / 100);

  return (
    <div className={cn(
      "border-l-4 p-3 bg-card/60 rounded-sm",
      difficultyColors[quest.difficulty]
    )}>
      <div className="flex items-center gap-2 mb-2">
        <TypeIcon className="w-4 h-4 text-primary" />
        <h4 className="font-display text-sm flex-1 truncate">{quest.name}</h4>
      </div>

      <div className="mb-2">
        <Progress value={quest.progress} className="h-1.5" />
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          <span>~{hoursRemaining}h remaining</span>
        </div>
        <div className="flex -space-x-1">
          {assignedCharacters.map((char) => (
            <span 
              key={char.id} 
              className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-xs"
              title={char.name}
            >
              {char.portrait}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
