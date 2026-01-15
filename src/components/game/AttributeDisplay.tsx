import { Attributes } from '@/types/game';
import { cn } from '@/lib/utils';
import { getModifier } from '@/lib/statCalculations';

interface AttributeDisplayProps {
  attributes: Attributes;
  compact?: boolean;
  highlight?: (keyof Attributes)[];
}

const attributeLabels: Record<keyof Attributes, { short: string; full: string }> = {
  strength: { short: 'STR', full: 'Strength' },
  dexterity: { short: 'DEX', full: 'Dexterity' },
  constitution: { short: 'CON', full: 'Constitution' },
  intelligence: { short: 'INT', full: 'Intelligence' },
  wisdom: { short: 'WIS', full: 'Wisdom' },
  charisma: { short: 'CHA', full: 'Charisma' },
};

const getAttributeColor = (value: number) => {
  if (value >= 16) return 'text-gold';
  if (value >= 13) return 'text-foreground';
  if (value >= 10) return 'text-muted-foreground';
  return 'text-destructive';
};

const getModifierColor = (modifier: number) => {
  if (modifier >= 3) return 'text-gold';
  if (modifier >= 1) return 'text-green-500';
  if (modifier === 0) return 'text-muted-foreground';
  return 'text-destructive';
};

const formatModifier = (modifier: number) => {
  if (modifier >= 0) return `+${modifier}`;
  return `${modifier}`;
};

export function AttributeDisplay({ attributes, compact = false, highlight = [] }: AttributeDisplayProps) {
  const attributeKeys = Object.keys(attributes) as (keyof Attributes)[];

  if (compact) {
    return (
      <div className="grid grid-cols-6 gap-1">
        {attributeKeys.map((key) => {
          const modifier = getModifier(attributes[key]);
          return (
            <div 
              key={key} 
              className={cn(
                "text-center",
                highlight.includes(key) && "ring-1 ring-primary/50 rounded-sm bg-primary/10"
              )}
            >
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
                {attributeLabels[key].short}
              </div>
              <div className={cn("text-sm font-display", getAttributeColor(attributes[key]))}>
                {attributes[key]}
              </div>
              <div className={cn("text-[10px] font-medium", getModifierColor(modifier))}>
                {formatModifier(modifier)}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      {attributeKeys.map((key) => {
        const modifier = getModifier(attributes[key]);
        return (
          <div 
            key={key} 
            className={cn(
              "flex justify-between items-center px-2 py-1 rounded-sm",
              highlight.includes(key) && "bg-primary/20 ring-1 ring-primary/30"
            )}
          >
            <span className="text-xs text-muted-foreground">
              {attributeLabels[key].full}
            </span>
            <div className="flex items-center gap-2">
              <span className={cn("font-display text-sm", getAttributeColor(attributes[key]))}>
                {attributes[key]}
              </span>
              <span className={cn("text-xs font-medium", getModifierColor(modifier))}>
                ({formatModifier(modifier)})
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
