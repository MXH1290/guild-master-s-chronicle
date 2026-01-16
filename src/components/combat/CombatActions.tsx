import { CombatParticipant } from '@/types/combat';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Swords, Shield, Sparkles, Package } from 'lucide-react';

interface CombatActionsProps {
  currentParticipant: CombatParticipant | null;
  isHeroTurn: boolean;
  validTargets: CombatParticipant[];
  onAttack: (targetId: string) => void;
  disabled?: boolean;
}

export function CombatActions({ 
  currentParticipant, 
  isHeroTurn,
  validTargets,
  onAttack,
  disabled 
}: CombatActionsProps) {
  if (!currentParticipant || !isHeroTurn) {
    return (
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="text-center text-muted-foreground">
          <p className="text-sm">Waiting for enemy turn...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">{currentParticipant.name}'s Turn</h3>
        <span className="text-sm text-muted-foreground">
          HP: {currentParticipant.health}/{currentParticipant.maxHealth}
        </span>
      </div>

      {/* Action buttons */}
      <div className="grid grid-cols-4 gap-2">
        <Button 
          variant="outline" 
          className="flex flex-col items-center gap-1 h-auto py-3 border-primary/50 bg-primary/5"
          disabled={disabled || validTargets.length === 0}
        >
          <Swords className="w-5 h-5 text-primary" />
          <span className="text-xs">Attack</span>
        </Button>
        <Button 
          variant="outline" 
          className="flex flex-col items-center gap-1 h-auto py-3 opacity-50"
          disabled
        >
          <Sparkles className="w-5 h-5" />
          <span className="text-xs">Spells</span>
        </Button>
        <Button 
          variant="outline" 
          className="flex flex-col items-center gap-1 h-auto py-3 opacity-50"
          disabled
        >
          <Package className="w-5 h-5" />
          <span className="text-xs">Items</span>
        </Button>
        <Button 
          variant="outline" 
          className="flex flex-col items-center gap-1 h-auto py-3 opacity-50"
          disabled
        >
          <Shield className="w-5 h-5" />
          <span className="text-xs">Defend</span>
        </Button>
      </div>

      {/* Target selection */}
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">Select target:</p>
        <div className="flex flex-wrap gap-2">
          {validTargets.map(target => (
            <Button
              key={target.id}
              variant="destructive"
              size="sm"
              onClick={() => onAttack(target.id)}
              disabled={disabled}
              className="flex items-center gap-2"
            >
              <Swords className="w-4 h-4" />
              <span>{target.name}</span>
              <span className="text-xs opacity-75">
                ({target.health}/{target.maxHealth} HP)
              </span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
