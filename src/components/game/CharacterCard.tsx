import { Character } from '@/types/game';
import { StatBar } from './StatBar';
import { AttributeDisplay } from './AttributeDisplay';
import { cn } from '@/lib/utils';
import { getTraitByName, getTraitRarityColor, getTraitRarityBg } from '@/lib/traits';
import { Heart, Brain, Swords, AlertTriangle } from 'lucide-react';

interface CharacterCardProps {
  character: Character;
  selected?: boolean;
  onClick?: () => void;
  compact?: boolean;
}

const classColors: Record<string, string> = {
  Warrior: 'border-l-red-500',
  Rogue: 'border-l-violet-500',
  Mage: 'border-l-blue-500',
  Cleric: 'border-l-yellow-500',
  Ranger: 'border-l-green-500',
  Bard: 'border-l-pink-500',
};

export function CharacterCard({ character, selected, onClick, compact = false }: CharacterCardProps) {
  const isIncapacitated = character.status.includes('dead') || character.health <= 0;
  const isInjured = character.status.includes('injured') || character.health < character.maxHealth * 0.5;
  const isStressed = character.stress > 70;

  if (compact) {
    return (
      <div 
        className={cn(
          "character-card border-l-4 p-2 rounded-sm cursor-pointer",
          classColors[character.class],
          selected && "selected",
          isIncapacitated && "opacity-50 grayscale"
        )}
        onClick={onClick}
      >
        <div className="flex items-center gap-2">
          <span className="text-2xl">{character.portrait}</span>
          <div className="flex-1 min-w-0">
            <div className="font-display text-sm truncate">{character.name}</div>
            <div className="text-xs text-muted-foreground">{character.class} Lv.{character.level}</div>
          </div>
          <div className="flex flex-col gap-1">
            {isInjured && <Heart className="w-3 h-3 text-destructive" />}
            {isStressed && <Brain className="w-3 h-3 text-stress" />}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={cn(
        "character-card border-l-4 p-4 rounded-sm cursor-pointer",
        classColors[character.class],
        selected && "selected",
        isIncapacitated && "opacity-50 grayscale"
      )}
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <div className="text-4xl">{character.portrait}</div>
        <div className="flex-1 min-w-0">
          <h3 className="font-display text-base truncate">{character.name}</h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{character.class}</span>
            <span className="text-primary">Lv.{character.level}</span>
          </div>
          <div className="flex gap-1 mt-1 flex-wrap">
            {character.traits.map((traitName) => {
              const trait = getTraitByName(traitName);
              const rarityColor = trait ? getTraitRarityColor(trait.rarity) : 'text-muted-foreground';
              const rarityBg = trait ? getTraitRarityBg(trait.rarity) : 'bg-muted/50 border-muted';
              return (
                <span 
                  key={traitName} 
                  className={cn(
                    "text-[10px] px-1.5 py-0.5 rounded-sm border",
                    rarityBg,
                    rarityColor
                  )}
                  title={trait?.description}
                >
                  {traitName}
                </span>
              );
            })}
          </div>
        </div>
      </div>

      {/* Status Bars */}
      <div className="space-y-2 mb-3">
        <div>
          <div className="flex items-center gap-1 mb-1">
            <Heart className="w-3 h-3 text-health" />
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Health</span>
          </div>
          <StatBar value={character.health} max={character.maxHealth} variant="health" />
        </div>
        <div>
          <div className="flex items-center gap-1 mb-1">
            <Brain className="w-3 h-3 text-stress" />
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Stress</span>
          </div>
          <StatBar value={character.stress} max={character.maxStress} variant="stress" />
        </div>
      </div>

      {/* Attributes */}
      <AttributeDisplay attributes={character.attributes} compact />

      {/* Status Effects */}
      {character.status.length > 0 && !character.status.includes('healthy') && (
        <div className="mt-3 pt-2 border-t border-border/50">
          <div className="flex gap-1 flex-wrap">
            {character.status.filter(s => s !== 'healthy').map((status) => (
              <span 
                key={status} 
                className={cn(
                  "text-[10px] px-1.5 py-0.5 rounded-sm capitalize",
                  status === 'injured' && "bg-destructive/20 text-destructive",
                  status === 'stressed' && "bg-stress/20 text-stress",
                  status === 'afflicted' && "bg-stress/30 text-stress",
                  status === 'recovering' && "bg-warning/20 text-warning",
                  status === 'dead' && "bg-muted text-muted-foreground"
                )}
              >
                {status}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Quest Count */}
      <div className="mt-3 pt-2 border-t border-border/50 flex items-center gap-1 text-muted-foreground">
        <Swords className="w-3 h-3" />
        <span className="text-xs">{character.quests} quests completed</span>
      </div>
    </div>
  );
}
