import { useState } from 'react';
import { useGameState } from '@/hooks/useGameState';
import { GuildHeader } from '@/components/game/GuildHeader';
import { CharacterCard } from '@/components/game/CharacterCard';
import { QuestCard } from '@/components/game/QuestCard';
import { ActiveQuestCard } from '@/components/game/ActiveQuestCard';
import { GameLog } from '@/components/game/GameLog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Users, Scroll, Swords } from 'lucide-react';
import { cn } from '@/lib/utils';

const Index = () => {
  const { 
    gameState, 
    assignCharacterToQuest, 
    removeCharacterFromQuest, 
    startQuest, 
    advanceDay 
  } = useGameState();
  
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(null);

  const availableCharacters = gameState.characters.filter(c => 
    !c.status.includes('dead') && 
    !gameState.activeQuests.some(q => q.assignedParty.includes(c.id))
  );

  const availableQuests = gameState.quests.filter(q => q.status === 'available');

  return (
    <div className="min-h-screen bg-background">
      <GuildHeader guild={gameState.guild} onAdvanceDay={advanceDay} />

      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Left Column - Roster */}
          <div className="col-span-3">
            <div className="sticky top-24">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-primary" />
                <h2 className="font-display text-lg">Guild Roster</h2>
              </div>
              <p className="text-xs text-muted-foreground mb-4">
                Select an adventurer, then click a quest to assign them.
              </p>
              <ScrollArea className="h-[calc(100vh-220px)]">
                <div className="space-y-3 pr-3">
                  {availableCharacters.map((character) => (
                    <div 
                      key={character.id}
                      className="animate-fade-in"
                      style={{ animationDelay: `${availableCharacters.indexOf(character) * 50}ms` }}
                    >
                      <CharacterCard
                        character={character}
                        selected={selectedCharacter === character.id}
                        onClick={() => setSelectedCharacter(
                          selectedCharacter === character.id ? null : character.id
                        )}
                      />
                    </div>
                  ))}
                  {availableCharacters.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <p className="text-sm">All adventurers are on quests or incapacitated.</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>

          {/* Center Column - Quest Board */}
          <div className="col-span-6">
            <div className="flex items-center gap-2 mb-4">
              <Scroll className="w-5 h-5 text-primary" />
              <h2 className="font-display text-lg">Quest Board</h2>
              <span className="text-xs text-muted-foreground ml-auto">
                {availableQuests.length} contracts available
              </span>
            </div>

            {availableQuests.length > 0 ? (
              <div className="grid gap-4">
                {availableQuests.map((quest, index) => (
                  <div 
                    key={quest.id}
                    className="animate-fade-in"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <QuestCard
                      quest={quest}
                      characters={gameState.characters}
                      selectedCharacter={selectedCharacter}
                      onAssignCharacter={assignCharacterToQuest}
                      onRemoveCharacter={removeCharacterFromQuest}
                      onStartQuest={(questId) => {
                        startQuest(questId);
                        setSelectedCharacter(null);
                      }}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="parchment p-8 text-center">
                <p className="text-ink/70 font-body">
                  The quest board stands empty. Perhaps tomorrow will bring new opportunities...
                </p>
              </div>
            )}
          </div>

          {/* Right Column - Active Quests & Log */}
          <div className="col-span-3">
            <div className="sticky top-24 space-y-6">
              {/* Active Quests */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Swords className="w-5 h-5 text-primary" />
                  <h2 className="font-display text-lg">Active Expeditions</h2>
                </div>
                
                {gameState.activeQuests.length > 0 ? (
                  <div className="space-y-3">
                    {gameState.activeQuests.map((quest) => (
                      <ActiveQuestCard
                        key={quest.id}
                        quest={quest}
                        characters={gameState.characters}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="border border-dashed border-border/50 rounded-sm p-4 text-center">
                    <p className="text-sm text-muted-foreground">
                      No active expeditions
                    </p>
                  </div>
                )}
              </div>

              {/* Game Log */}
              <GameLog entries={gameState.log} />

              {/* Stats Summary */}
              <div className="bg-card/30 border border-border rounded-sm p-3">
                <h3 className="font-display text-sm text-muted-foreground mb-2">Guild Statistics</h3>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-muted-foreground">Quests Completed</span>
                    <div className="font-display text-lg">{gameState.completedQuests}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Active Adventurers</span>
                    <div className="font-display text-lg">
                      {gameState.characters.filter(c => !c.status.includes('dead')).length}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
