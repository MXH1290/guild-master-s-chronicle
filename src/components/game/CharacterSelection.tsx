import { useState, useMemo } from 'react';
import { Character } from '@/types/game';
import { generateCharacterPool } from '@/lib/characterGenerator';
import { CharacterCard } from './CharacterCard';
import { AttributeDisplay } from './AttributeDisplay';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Users, Sparkles, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CharacterSelectionProps {
  onComplete: (characters: Character[]) => void;
}

const POOL_SIZE = 8;
const REQUIRED_SELECTIONS = 3;

export function CharacterSelection({ onComplete }: CharacterSelectionProps) {
  const candidatePool = useMemo(() => generateCharacterPool(POOL_SIZE), []);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else if (next.size < REQUIRED_SELECTIONS) {
        next.add(id);
      }
      return next;
    });
  };

  const handleConfirm = () => {
    const selected = candidatePool
      .filter(c => selectedIds.has(c.id))
      .map((c, i) => ({ ...c, id: `char-${i + 1}` }));
    onComplete(selected);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="max-w-5xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-3">
            <Sparkles className="w-6 h-6 text-primary" />
            <h1 className="font-display text-3xl text-foreground">Assemble Your Guild</h1>
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <p className="text-muted-foreground font-body max-w-lg mx-auto">
            A new guild rises from the ashes. Choose <span className="text-primary font-semibold">{REQUIRED_SELECTIONS} adventurers</span> from 
            the wanderers gathered at your hall to begin your legend.
          </p>
        </div>

        {/* Selection Counter */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <Users className="w-5 h-5 text-muted-foreground" />
          <span className="font-display text-lg">
            <span className={cn(
              "transition-colors",
              selectedIds.size === REQUIRED_SELECTIONS ? "text-primary" : "text-foreground"
            )}>
              {selectedIds.size}
            </span>
            <span className="text-muted-foreground"> / {REQUIRED_SELECTIONS} selected</span>
          </span>
        </div>

        {/* Character Grid */}
        <ScrollArea className="h-[calc(100vh-320px)]">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-4">
            {candidatePool.map((character, index) => {
              const isSelected = selectedIds.has(character.id);
              const isDisabled = !isSelected && selectedIds.size >= REQUIRED_SELECTIONS;
              
              return (
                <div
                  key={character.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 75}ms` }}
                >
                  <div
                    onClick={() => !isDisabled && toggleSelection(character.id)}
                    className={cn(
                      "relative cursor-pointer transition-all duration-200",
                      isDisabled && "opacity-40 cursor-not-allowed",
                      isSelected && "ring-2 ring-primary ring-offset-2 ring-offset-background rounded-sm"
                    )}
                  >
                    {isSelected && (
                      <div className="absolute -top-2 -right-2 z-10 bg-primary rounded-full p-1">
                        <Check className="w-4 h-4 text-primary-foreground" />
                      </div>
                    )}
                    <CharacterCard
                      character={character}
                      selected={isSelected}
                      onClick={() => {}}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>

        {/* Confirm Button */}
        <div className="flex justify-center mt-6">
          <Button
            size="lg"
            disabled={selectedIds.size !== REQUIRED_SELECTIONS}
            onClick={handleConfirm}
            className="font-display text-lg px-8"
          >
            <Users className="w-5 h-5 mr-2" />
            Found the Guild
          </Button>
        </div>
      </div>
    </div>
  );
}
