import { Quest, Character, Attributes } from '@/types/game';
import { cn } from '@/lib/utils';
import { Clock, Users, Coins, Star, Swords, Map, MessageCircle, Package, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CharacterCard } from './CharacterCard';

interface QuestCardProps {
  quest: Quest;
  characters: Character[];
  onAssignCharacter: (questId: string, characterId: string) => void;
  onRemoveCharacter: (questId: string, characterId: string) => void;
  onStartQuest: (questId: string) => void;
  selectedCharacter?: string | null;
}

const difficultyColors = {
  trivial: 'text-muted-foreground border-muted-foreground/30',
  easy: 'text-health border-health/30',
  medium: 'text-warning border-warning/30',
  hard: 'text-destructive border-destructive/30',
  deadly: 'text-stress border-stress/30 danger-pulse',
};

const typeIcons = {
  combat: Swords,
  exploration: Map,
  social: MessageCircle,
  escort: Shield,
  retrieval: Package,
};

export function QuestCard({ 
  quest, 
  characters, 
  onAssignCharacter, 
  onRemoveCharacter, 
  onStartQuest,
  selectedCharacter 
}: QuestCardProps) {
  const TypeIcon = typeIcons[quest.type];
  const assignedCharacters = characters.filter(c => quest.assignedParty.includes(c.id));
  const canStart = assignedCharacters.length >= (quest.requirements.minPartySize || 1);
  const canAddMore = quest.assignedParty.length < quest.partySlots;

  const handleCardClick = () => {
    if (selectedCharacter && canAddMore && !quest.assignedParty.includes(selectedCharacter)) {
      onAssignCharacter(quest.id, selectedCharacter);
    }
  };

  return (
    <div 
      className={cn(
        "quest-card rounded-sm p-4",
        selectedCharacter && canAddMore && "cursor-pointer hover:ring-1 hover:ring-primary/30"
      )}
      onClick={handleCardClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <TypeIcon className="w-5 h-5 text-primary" />
          <h3 className="font-display text-base">{quest.name}</h3>
        </div>
        <span className={cn(
          "text-[10px] uppercase tracking-wider px-2 py-0.5 border rounded-sm",
          difficultyColors[quest.difficulty]
        )}>
          {quest.difficulty}
        </span>
      </div>

      {/* Description */}
      <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
        {quest.description}
      </p>

      {/* Requirements */}
      <div className="flex flex-wrap gap-3 mb-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          <span>{quest.duration}h</span>
        </div>
        <div className="flex items-center gap-1">
          <Users className="w-3 h-3" />
          <span>{quest.requirements.minPartySize || 1}-{quest.partySlots}</span>
        </div>
        {quest.requirements.minLevel && (
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3" />
            <span>Lv.{quest.requirements.minLevel}+</span>
          </div>
        )}
      </div>

      {/* Preferred Stats */}
      {quest.requirements.preferredStats && (
        <div className="mb-4">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Preferred: </span>
          {quest.requirements.preferredStats.map((stat) => (
            <span key={stat} className="text-xs text-primary ml-1">
              {stat.slice(0, 3).toUpperCase()}
            </span>
          ))}
        </div>
      )}

      {/* Rewards */}
      <div className="flex gap-4 mb-4 p-2 bg-muted/30 rounded-sm">
        <div className="flex items-center gap-1">
          <Coins className="w-3 h-3 text-gold" />
          <span className="text-sm text-gold">{quest.rewards.gold}</span>
        </div>
        <div className="flex items-center gap-1">
          <Star className="w-3 h-3 text-primary" />
          <span className="text-sm">{quest.rewards.experience} XP</span>
        </div>
      </div>

      {/* Party Slots */}
      <div className="mb-4">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
          Party ({assignedCharacters.length}/{quest.partySlots})
        </div>
        <div className="grid gap-2">
          {assignedCharacters.map((char) => (
            <div 
              key={char.id} 
              className="flex items-center gap-2 p-2 bg-muted/50 rounded-sm cursor-pointer hover:bg-muted/70"
              onClick={(e) => {
                e.stopPropagation();
                onRemoveCharacter(quest.id, char.id);
              }}
            >
              <span className="text-lg">{char.portrait}</span>
              <span className="text-sm flex-1">{char.name}</span>
              <span className="text-xs text-muted-foreground">×</span>
            </div>
          ))}
          {Array.from({ length: quest.partySlots - assignedCharacters.length }).map((_, i) => (
            <div 
              key={i} 
              className="h-10 border border-dashed border-border/50 rounded-sm flex items-center justify-center text-xs text-muted-foreground"
            >
              {selectedCharacter ? 'Click to assign' : 'Empty slot'}
            </div>
          ))}
        </div>
      </div>

      {/* Start Button */}
      <Button 
        className="w-full"
        disabled={!canStart}
        onClick={(e) => {
          e.stopPropagation();
          onStartQuest(quest.id);
        }}
      >
        {canStart ? 'Embark on Quest' : `Need ${quest.requirements.minPartySize || 1}+ adventurers`}
      </Button>
    </div>
  );
}
