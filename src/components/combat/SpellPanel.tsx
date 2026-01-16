import { CombatParticipant } from '@/types/combat';
import { Character } from '@/types/game';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Sparkles, Zap, Heart, Shield, Target } from 'lucide-react';
import { CombatSpell, getAvailableSpells, isSpellcaster } from '@/data/spells';
import { getModifier } from '@/lib/statCalculations';
import { useState } from 'react';

interface SpellPanelProps {
  hero: CombatParticipant;
  spellSlotsUsed: { level1: number; level2: number; level3: number; level4: number; level5: number };
  validEnemyTargets: CombatParticipant[];
  validAllyTargets: CombatParticipant[];
  participantsActedThisRound: string[];
  onCastSpell: (spellId: string, targetId?: string) => void;
  disabled?: boolean;
}

export function SpellPanel({
  hero,
  spellSlotsUsed,
  validEnemyTargets,
  validAllyTargets,
  participantsActedThisRound,
  onCastSpell,
  disabled
}: SpellPanelProps) {
  const [selectedSpell, setSelectedSpell] = useState<CombatSpell | null>(null);
  const character = hero.characterRef;
  
  if (!character || !isSpellcaster(character.class)) {
    return (
      <div className="bg-muted/30 rounded-lg p-4 text-center text-muted-foreground">
        <p className="text-sm">This character cannot cast spells.</p>
      </div>
    );
  }

  const availableSpells = getAvailableSpells(character.class, character.level);
  const level1Remaining = character.spellSlots.level1.max - spellSlotsUsed.level1;
  
  const getSpellModifier = (spell: CombatSpell) => {
    const stat = spell.modifierStat;
    return getModifier(character.attributes[stat]);
  };

  const getSpellIcon = (spell: CombatSpell) => {
    const effect = spell.effects[0];
    if (effect.type === 'damage') return <Zap className="w-4 h-4" />;
    if (effect.type === 'heal') return <Heart className="w-4 h-4" />;
    if (effect.type === 'buff') return <Shield className="w-4 h-4" />;
    return <Target className="w-4 h-4" />;
  };

  const getValidTargetsForSpell = (spell: CombatSpell): CombatParticipant[] => {
    switch (spell.targetType) {
      case 'enemy':
        return validEnemyTargets;
      case 'ally':
        // For Inspire, filter to allies who haven't acted this round
        if (spell.id === 'inspire') {
          return validAllyTargets.filter(a => 
            a.id !== hero.id && !participantsActedThisRound.includes(a.id)
          );
        }
        return validAllyTargets.filter(a => a.id !== hero.id);
      case 'self':
        return [hero];
      default:
        return [];
    }
  };

  const handleSpellClick = (spell: CombatSpell) => {
    if (spell.targetType === 'self') {
      onCastSpell(spell.id, hero.id);
    } else {
      setSelectedSpell(spell);
    }
  };

  const handleTargetClick = (targetId: string) => {
    if (selectedSpell) {
      onCastSpell(selectedSpell.id, targetId);
      setSelectedSpell(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Spell Slots */}
      <div className="flex items-center gap-2 text-sm">
        <Sparkles className="w-4 h-4 text-purple-400" />
        <span className="text-muted-foreground">Level 1 Slots:</span>
        <div className="flex gap-1">
          {Array.from({ length: character.spellSlots.level1.max }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "w-3 h-3 rounded-full border-2",
                i < level1Remaining 
                  ? "bg-purple-400 border-purple-400" 
                  : "bg-transparent border-muted-foreground/30"
              )}
            />
          ))}
        </div>
        <span className="text-xs text-muted-foreground">
          ({level1Remaining}/{character.spellSlots.level1.max})
        </span>
      </div>

      {/* Spell Selection or Target Selection */}
      {selectedSpell ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Select target for {selectedSpell.name}:</p>
            <Button variant="ghost" size="sm" onClick={() => setSelectedSpell(null)}>
              Cancel
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {getValidTargetsForSpell(selectedSpell).map(target => (
              <Button
                key={target.id}
                variant={selectedSpell.targetType === 'enemy' ? 'destructive' : 'default'}
                size="sm"
                onClick={() => handleTargetClick(target.id)}
                disabled={disabled}
              >
                {target.name} ({target.health}/{target.maxHealth})
              </Button>
            ))}
            {getValidTargetsForSpell(selectedSpell).length === 0 && (
              <p className="text-sm text-muted-foreground">No valid targets available.</p>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {availableSpells.map(spell => {
            const mod = getSpellModifier(spell);
            const canCast = level1Remaining > 0;
            
            return (
              <Button
                key={spell.id}
                variant="outline"
                className={cn(
                  "w-full justify-start text-left h-auto py-2 px-3",
                  !canCast && "opacity-50"
                )}
                disabled={disabled || !canCast}
                onClick={() => handleSpellClick(spell)}
              >
                <div className="flex items-start gap-3 w-full">
                  <div className="mt-0.5 text-purple-400">
                    {getSpellIcon(spell)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{spell.name}</span>
                      <span className="text-xs text-muted-foreground">
                        +{mod} to hit
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {spell.shortDescription}
                    </p>
                  </div>
                </div>
              </Button>
            );
          })}
        </div>
      )}
    </div>
  );
}
