import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Quest, Character, Attributes } from '@/types/game';
import { cn } from '@/lib/utils';
import { 
  Clock, Users, Coins, Star, Swords, Map, MessageCircle, 
  Package, Shield, ArrowLeft, ChevronRight 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface QuestDetailPageProps {
  quests: Quest[];
  characters: Character[];
  activeQuests: Quest[];
  onAssignCharacter: (questId: string, characterId: string) => void;
  onRemoveCharacter: (questId: string, characterId: string) => void;
  onStartQuest: (questId: string) => void;
}

const difficultyColors = {
  trivial: 'text-muted-foreground border-muted-foreground/30',
  easy: 'text-health border-health/30',
  medium: 'text-warning border-warning/30',
  hard: 'text-destructive border-destructive/30',
  deadly: 'text-stress border-stress/30',
};

const typeIcons = {
  combat: Swords,
  exploration: Map,
  social: MessageCircle,
  escort: Shield,
  retrieval: Package,
};

export function QuestDetailPage({
  quests,
  characters,
  activeQuests,
  onAssignCharacter,
  onRemoveCharacter,
  onStartQuest,
}: QuestDetailPageProps) {
  const { questId } = useParams();
  const navigate = useNavigate();
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(null);

  const quest = quests.find(q => q.id === questId);
  
  if (!quest) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Quest not found.</p>
        <Button variant="ghost" onClick={() => navigate('/')} className="mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Quest Board
        </Button>
      </div>
    );
  }

  const TypeIcon = typeIcons[quest.type];
  const assignedCharacters = characters.filter(c => quest.assignedParty.includes(c.id));
  const availableCharacters = characters.filter(c => 
    !c.status.includes('dead') && 
    !quest.assignedParty.includes(c.id) &&
    !activeQuests.some(q => q.assignedParty.includes(c.id))
  );
  const canStart = assignedCharacters.length >= (quest.requirements.minPartySize || 1);
  const canAddMore = quest.assignedParty.length < quest.partySlots;

  const handleStartQuest = () => {
    onStartQuest(quest.id);
    navigate('/');
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Back Button */}
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => navigate('/')}
        className="mb-4"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Quest Board
      </Button>

      {/* Quest Card */}
      <div className="quest-card rounded-sm p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <TypeIcon className="w-6 h-6 text-primary" />
            <div>
              <h1 className="font-display text-xl">{quest.name}</h1>
              <span className="text-sm text-muted-foreground capitalize">{quest.type} Quest</span>
            </div>
          </div>
          <span className={cn(
            "text-xs uppercase tracking-wider px-3 py-1 border rounded-sm font-medium",
            difficultyColors[quest.difficulty]
          )}>
            {quest.difficulty}
          </span>
        </div>

        {/* Description */}
        <p className="text-muted-foreground mb-6 leading-relaxed">
          {quest.description}
        </p>

        {/* Requirements & Info Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-muted/30 rounded-sm p-3">
            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
              <Clock className="w-3 h-3" />
              Duration
            </div>
            <div className="font-display text-lg">{quest.duration}h</div>
          </div>
          <div className="bg-muted/30 rounded-sm p-3">
            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
              <Users className="w-3 h-3" />
              Party Size
            </div>
            <div className="font-display text-lg">{quest.requirements.minPartySize || 1}-{quest.partySlots}</div>
          </div>
          <div className="bg-muted/30 rounded-sm p-3">
            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
              <Star className="w-3 h-3" />
              Min Level
            </div>
            <div className="font-display text-lg">{quest.requirements.minLevel || 1}</div>
          </div>
          <div className="bg-muted/30 rounded-sm p-3">
            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
              <Swords className="w-3 h-3" />
              Preferred
            </div>
            <div className="font-display text-sm">
              {quest.requirements.preferredStats?.map(s => s.slice(0, 3).toUpperCase()).join(', ') || 'Any'}
            </div>
          </div>
        </div>

        {/* Rewards */}
        <div className="mb-6">
          <h3 className="font-display text-sm text-muted-foreground mb-2 uppercase tracking-wider">Rewards</h3>
          <div className="flex gap-6 p-3 bg-primary/5 border border-primary/20 rounded-sm">
            <div className="flex items-center gap-2">
              <Coins className="w-5 h-5 text-gold" />
              <span className="font-display text-lg text-gold">{quest.rewards.gold}</span>
              <span className="text-xs text-muted-foreground">Gold</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-primary" />
              <span className="font-display text-lg">{quest.rewards.experience}</span>
              <span className="text-xs text-muted-foreground">XP</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              <span className="font-display text-lg">{quest.rewards.reputation}</span>
              <span className="text-xs text-muted-foreground">Rep</span>
            </div>
          </div>
          {quest.rewards.items && quest.rewards.items.length > 0 && (
            <div className="mt-2 text-sm text-muted-foreground">
              <span className="text-primary">Bonus Items:</span> {quest.rewards.items.join(', ')}
            </div>
          )}
        </div>

        {/* Party Assignment */}
        <div className="border-t border-border pt-6">
          <h3 className="font-display text-sm text-muted-foreground mb-3 uppercase tracking-wider">
            Assigned Party ({assignedCharacters.length}/{quest.partySlots})
          </h3>
          
          {/* Assigned Characters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
            {assignedCharacters.map((char) => (
              <div 
                key={char.id} 
                className="flex items-center gap-3 p-3 bg-muted/50 rounded-sm cursor-pointer hover:bg-muted/70 transition-colors"
                onClick={() => onRemoveCharacter(quest.id, char.id)}
              >
                <span className="text-2xl">{char.portrait}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-display text-sm truncate">{char.name}</div>
                  <div className="text-xs text-muted-foreground">{char.class} Lv.{char.level}</div>
                </div>
                <span className="text-xs text-muted-foreground hover:text-destructive">Remove</span>
              </div>
            ))}
            {Array.from({ length: quest.partySlots - assignedCharacters.length }).map((_, i) => (
              <div 
                key={i} 
                className="h-16 border border-dashed border-border/50 rounded-sm flex items-center justify-center text-xs text-muted-foreground"
              >
                Empty slot
              </div>
            ))}
          </div>

          {/* Available Characters */}
          {canAddMore && availableCharacters.length > 0 && (
            <div className="mb-6">
              <h4 className="text-xs text-muted-foreground mb-2">Available Adventurers:</h4>
              <div className="flex flex-wrap gap-2">
                {availableCharacters.map((char) => (
                  <button
                    key={char.id}
                    onClick={() => onAssignCharacter(quest.id, char.id)}
                    className="flex items-center gap-2 px-3 py-2 rounded-sm text-sm transition-all
                      border border-border/50 hover:border-primary/50 hover:bg-primary/10 bg-card/50"
                  >
                    <span className="text-lg">{char.portrait}</span>
                    <span className="font-display">{char.name.split(' ')[0]}</span>
                    <span className="text-xs text-muted-foreground">{char.class}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Start Button */}
          <Button 
            className="w-full"
            size="lg"
            disabled={!canStart}
            onClick={handleStartQuest}
          >
            {canStart ? 'Embark on Quest' : `Need ${quest.requirements.minPartySize || 1}+ adventurers`}
          </Button>
        </div>
      </div>
    </div>
  );
}
