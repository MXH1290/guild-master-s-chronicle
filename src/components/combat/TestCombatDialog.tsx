import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Character } from '@/types/game';
import { enemyTemplates } from '@/data/enemies';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Swords, Shield, Heart, Zap } from 'lucide-react';

interface TestCombatDialogProps {
  characters: Character[];
  onStartTestCombat: (heroIds: string[], enemyKey: string) => void;
}

export function TestCombatDialog({ characters, onStartTestCombat }: TestCombatDialogProps) {
  const [selectedHeroes, setSelectedHeroes] = useState<string[]>([]);
  const [selectedEnemy, setSelectedEnemy] = useState<string>('goblin');
  const [open, setOpen] = useState(false);

  const aliveCharacters = characters.filter(c => !c.status.includes('dead'));

  const toggleHero = (heroId: string) => {
    setSelectedHeroes(prev =>
      prev.includes(heroId)
        ? prev.filter(id => id !== heroId)
        : [...prev, heroId]
    );
  };

  const handleStart = () => {
    if (selectedHeroes.length === 0) return;
    onStartTestCombat(selectedHeroes, selectedEnemy);
    setOpen(false);
  };

  const enemyList = Object.entries(enemyTemplates);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          className="fixed bottom-6 right-6 z-50 shadow-lg gap-2"
          size="lg"
        >
          <Swords className="w-5 h-5" />
          Test Combat
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Swords className="w-5 h-5" />
            Test Combat Arena
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 mt-4">
          {/* Hero Selection */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              Select Adventurers ({selectedHeroes.length} selected)
            </h3>
            <ScrollArea className="h-[300px] pr-3">
              <div className="space-y-2">
                {aliveCharacters.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No adventurers available</p>
                ) : (
                  aliveCharacters.map(hero => (
                    <label
                      key={hero.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedHeroes.includes(hero.id)
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <Checkbox
                        checked={selectedHeroes.includes(hero.id)}
                        onCheckedChange={() => toggleHero(hero.id)}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{hero.name}</div>
                        <div className="text-xs text-muted-foreground">
                          Lv.{hero.level} {hero.class}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Heart className="w-3 h-3" />
                        {hero.health}/{hero.maxHealth}
                      </div>
                    </label>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Enemy Selection */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              Select Enemy
            </h3>
            <ScrollArea className="h-[300px] pr-3">
              <div className="space-y-2">
                {enemyList.map(([key, enemy]) => (
                  <label
                    key={key}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedEnemy === key
                        ? 'border-destructive bg-destructive/10'
                        : 'border-border hover:border-destructive/50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="enemy"
                      value={key}
                      checked={selectedEnemy === key}
                      onChange={() => setSelectedEnemy(key)}
                      className="sr-only"
                    />
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      selectedEnemy === key ? 'border-destructive' : 'border-muted-foreground'
                    }`}>
                      {selectedEnemy === key && (
                        <div className="w-2 h-2 rounded-full bg-destructive" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium">{enemy.name}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-2">
                        <span className="flex items-center gap-1">
                          <Heart className="w-3 h-3" />
                          {enemy.maxHealth} HP
                        </span>
                        <span className="flex items-center gap-1">
                          <Zap className="w-3 h-3" />
                          {enemy.actions[0]?.damage} DMG
                        </span>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {enemy.experienceReward} XP
                    </div>
                  </label>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleStart}
            disabled={selectedHeroes.length === 0}
            className="gap-2"
          >
            <Swords className="w-4 h-4" />
            Start Combat
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
