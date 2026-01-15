import { useParams, useNavigate } from 'react-router-dom';
import { Character, Attributes } from '@/types/game';
import { StatBar } from '@/components/game/StatBar';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { getModifier } from '@/lib/statCalculations';
import { getTraitByName, getTraitColor, getTraitBg, TraitDefinition } from '@/lib/traits';
import { 
  ArrowLeft, Heart, Brain, Star, Swords, Package, 
  BookOpen, Scroll, Shield, Zap, Sparkles, CheckCircle, XCircle
} from 'lucide-react';

interface HeroDetailPageProps {
  characters: Character[];
}

const statLabels: Record<string, string> = {
  strength: 'STR',
  dexterity: 'DEX',
  constitution: 'CON',
  intelligence: 'INT',
  wisdom: 'WIS',
  charisma: 'CHA',
};

const getModifierColor = (modifier: number) => {
  if (modifier >= 3) return 'text-gold';
  if (modifier >= 1) return 'text-health';
  if (modifier === 0) return 'text-muted-foreground';
  return 'text-destructive';
};

const formatModifier = (modifier: number) => {
  if (modifier >= 0) return `+${modifier}`;
  return `${modifier}`;
};

const statAbbreviations: Record<keyof Attributes, string> = {
  strength: 'STR',
  dexterity: 'DEX',
  constitution: 'CON',
  intelligence: 'INT',
  wisdom: 'WIS',
  charisma: 'CHA',
};

const formatTraitModifiers = (trait: TraitDefinition): string => {
  const parts: string[] = [];
  for (const [stat, mod] of Object.entries(trait.modifiers)) {
    const abbrev = statAbbreviations[stat as keyof Attributes];
    parts.push(`${mod >= 0 ? '+' : ''}${mod} ${abbrev}`);
  }
  return parts.join(', ');
};

const spellTypeColors = {
  attack: 'bg-destructive/20 text-destructive',
  heal: 'bg-health/20 text-health',
  buff: 'bg-primary/20 text-primary',
  debuff: 'bg-stress/20 text-stress',
  utility: 'bg-muted text-muted-foreground',
};

const rarityColors = {
  common: 'text-muted-foreground',
  uncommon: 'text-health',
  rare: 'text-blue-400',
  epic: 'text-violet-400',
  legendary: 'text-gold',
};

export function HeroDetailPage({ characters }: HeroDetailPageProps) {
  const { heroId } = useParams();
  const navigate = useNavigate();

  const character = characters.find(c => c.id === heroId);

  if (!character) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Hero not found.</p>
        <Button variant="ghost" onClick={() => navigate('/guild')} className="mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Guild
        </Button>
      </div>
    );
  }

  const xpProgress = (character.experience / character.experienceToLevel) * 100;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back Button */}
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => navigate('/guild')}
        className="mb-4"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Guild
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Hero Header Card */}
          <div className="quest-card rounded-sm p-6">
            <div className="flex items-start gap-4 mb-6">
              <div className="text-6xl">{character.portrait}</div>
              <div className="flex-1">
                <h1 className="font-display text-2xl">{character.name}</h1>
                <div className="flex items-center gap-3 text-muted-foreground mb-2">
                  <span>{character.class}</span>
                  <span className="text-primary font-display">Level {character.level}</span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <TooltipProvider delayDuration={200}>
                    {character.traits.map((traitName) => {
                      const trait = getTraitByName(traitName);
                      const traitColor = trait ? getTraitColor(trait) : 'text-muted-foreground';
                      const traitBg = trait ? getTraitBg(trait) : 'bg-muted/50 border-muted';
                      return (
                        <Tooltip key={traitName}>
                          <TooltipTrigger asChild>
                            <div 
                              className={cn(
                                "text-xs px-2 py-1 rounded-sm border cursor-help",
                                traitBg,
                                traitColor
                              )}
                            >
                              <div className="font-medium">{traitName}</div>
                              {trait && (
                                <div className="text-[10px] opacity-80">
                                  {formatTraitModifiers(trait)}
                                </div>
                              )}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="bottom" className="max-w-[220px]">
                            {trait ? (
                              <div className="space-y-1.5">
                                <p className="text-xs">{trait.description}</p>
                                <div className="flex flex-wrap gap-2 pt-1.5 border-t border-border/50">
                                  {Object.entries(trait.modifiers).map(([stat, mod]) => (
                                    <span 
                                      key={stat}
                                      className={cn(
                                        "text-xs font-medium",
                                        mod >= 0 ? "text-health" : "text-destructive"
                                      )}
                                    >
                                      {mod >= 0 ? '+' : ''}{mod} {statAbbreviations[stat as keyof Attributes]}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            ) : (
                              <span className="text-xs">Unknown trait</span>
                            )}
                          </TooltipContent>
                        </Tooltip>
                      );
                    })}
                  </TooltipProvider>
                  {character.status.filter(s => s !== 'healthy').map((status) => (
                    <span 
                      key={status} 
                      className={cn(
                        "text-xs px-2 py-0.5 rounded-sm capitalize",
                        status === 'injured' && "bg-destructive/20 text-destructive",
                        status === 'stressed' && "bg-stress/20 text-stress",
                        status === 'afflicted' && "bg-stress/30 text-stress",
                        status === 'dead' && "bg-muted text-muted-foreground"
                      )}
                    >
                      {status}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Vitals */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Heart className="w-4 h-4 text-health" />
                  <span className="text-sm font-display">Health</span>
                  <span className="text-sm text-muted-foreground ml-auto">
                    {character.health}/{character.maxHealth}
                  </span>
                </div>
                <StatBar value={character.health} max={character.maxHealth} variant="health" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="w-4 h-4 text-stress" />
                  <span className="text-sm font-display">Stress</span>
                  <span className="text-sm text-muted-foreground ml-auto">
                    {character.stress}/{character.maxStress}
                  </span>
                </div>
                <StatBar value={character.stress} max={character.maxStress} variant="stress" />
              </div>
            </div>

            {/* Experience */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-4 h-4 text-primary" />
                <span className="text-sm font-display">Experience</span>
                <span className="text-sm text-muted-foreground ml-auto">
                  {character.experience}/{character.experienceToLevel} XP
                </span>
              </div>
              <Progress value={xpProgress} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">
                {character.experienceToLevel - character.experience} XP to level {character.level + 1}
              </p>
            </div>

            {/* Attributes */}
            <div>
              <h3 className="font-display text-sm text-muted-foreground mb-3 uppercase tracking-wider">
                Attributes
              </h3>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                {Object.entries(character.attributes).map(([stat, value]) => {
                  const modifier = getModifier(value);
                  return (
                    <div key={stat} className="bg-muted/30 rounded-sm p-3 text-center">
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        {statLabels[stat]}
                      </div>
                      <div className={cn(
                        "font-display text-xl",
                        value >= 16 && "text-primary",
                        value <= 8 && "text-destructive"
                      )}>
                        {value}
                      </div>
                      <div className={cn("text-xs font-medium", getModifierColor(modifier))}>
                        {formatModifier(modifier)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Quest History */}
          <div className="quest-card rounded-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <Scroll className="w-5 h-5 text-primary" />
              <h2 className="font-display text-lg">Quest History</h2>
              <span className="text-sm text-muted-foreground ml-auto">
                {character.quests} completed
              </span>
            </div>
            
            {character.questHistory.length > 0 ? (
              <div className="space-y-2">
                {character.questHistory.slice().reverse().map((entry, i) => (
                  <div 
                    key={i}
                    className="flex items-center gap-3 p-2 bg-muted/20 rounded-sm"
                  >
                    {entry.outcome === 'success' ? (
                      <CheckCircle className="w-4 h-4 text-health shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-destructive shrink-0" />
                    )}
                    <span className="flex-1 text-sm">{entry.questName}</span>
                    <span className="text-xs text-muted-foreground">Day {entry.day}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No quests completed yet. Send this hero on an adventure!
              </p>
            )}
          </div>
        </div>

        {/* Right Column - Inventory & Spells */}
        <div className="space-y-6">
          {/* Spells */}
          <div className="quest-card rounded-sm p-4">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-primary" />
              <h2 className="font-display text-lg">Abilities</h2>
            </div>
            
            {character.spells.length > 0 ? (
              <div className="space-y-2">
                {character.spells.map((spell) => (
                  <div key={spell.id} className="p-3 bg-muted/20 rounded-sm">
                    <div className="flex items-center gap-2 mb-1">
                      <Zap className="w-3 h-3 text-primary" />
                      <span className="font-display text-sm">{spell.name}</span>
                      <span className={cn(
                        "text-[10px] uppercase px-1.5 py-0.5 rounded-sm ml-auto",
                        spellTypeColors[spell.type]
                      )}>
                        {spell.type}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{spell.description}</p>
                    <p className="text-xs text-stress mt-1">Cost: {spell.cost} stress</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No abilities learned yet.
              </p>
            )}
          </div>

          {/* Inventory */}
          <div className="quest-card rounded-sm p-4">
            <div className="flex items-center gap-2 mb-4">
              <Package className="w-5 h-5 text-primary" />
              <h2 className="font-display text-lg">Inventory</h2>
            </div>
            
            {character.inventory.length > 0 ? (
              <div className="space-y-2">
                {character.inventory.map((item) => (
                  <div key={item.id} className="p-3 bg-muted/20 rounded-sm">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={cn("font-display text-sm", rarityColors[item.rarity])}>
                        {item.name}
                      </span>
                      {item.equipped && (
                        <Shield className="w-3 h-3 text-primary" />
                      )}
                      <span className="text-[10px] uppercase text-muted-foreground ml-auto">
                        {item.type}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                Inventory is empty.
              </p>
            )}
          </div>

          {/* Stats Summary */}
          <div className="bg-card/30 border border-border rounded-sm p-4">
            <h3 className="font-display text-sm text-muted-foreground mb-3">Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Quests Completed</span>
                <span className="font-display">{character.quests}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Items Held</span>
                <span className="font-display">{character.inventory.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Abilities Known</span>
                <span className="font-display">{character.spells.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
