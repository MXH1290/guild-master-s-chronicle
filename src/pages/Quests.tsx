import { useState } from 'react';
import { Character, Quest } from '@/types/game';
import { QuestCard } from '@/components/game/QuestCard';
import { ActiveQuestCard } from '@/components/game/ActiveQuestCard';
import { GameLog } from '@/components/game/GameLog';
import { Scroll, Swords } from 'lucide-react';
import type { GameLogEntry } from '@/types/game';

interface QuestsPageProps {
  characters: Character[];
  quests: Quest[];
  activeQuests: Quest[];
  completedQuests: number;
  log: GameLogEntry[];
  onAssignCharacter: (questId: string, characterId: string) => void;
  onRemoveCharacter: (questId: string, characterId: string) => void;
  onStartQuest: (questId: string) => void;
}

export function QuestsPage({
  characters,
  quests,
  activeQuests,
  completedQuests,
  log,
  onAssignCharacter,
  onRemoveCharacter,
  onStartQuest,
}: QuestsPageProps) {
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(null);
  
  const availableQuests = quests.filter(q => q.status === 'available');
  const availableCharacters = characters.filter(c => 
    !c.status.includes('dead') && 
    !activeQuests.some(q => q.assignedParty.includes(c.id))
  );

  return (
    <div className="grid grid-cols-12 gap-6">
      {/* Main Column - Quest Board */}
      <div className="col-span-12 lg:col-span-8">
        <div className="flex items-center gap-2 mb-4">
          <Scroll className="w-5 h-5 text-primary" />
          <h2 className="font-display text-lg">Quest Board</h2>
          <span className="text-xs text-muted-foreground ml-auto">
            {availableQuests.length} contracts available
          </span>
        </div>

        {/* Character Quick-Select */}
        {availableCharacters.length > 0 && (
          <div className="mb-4 p-3 bg-card/30 border border-border rounded-sm">
            <p className="text-xs text-muted-foreground mb-2">Select an adventurer to assign:</p>
            <div className="flex flex-wrap gap-2">
              {availableCharacters.map((char) => (
                <button
                  key={char.id}
                  onClick={() => setSelectedCharacter(
                    selectedCharacter === char.id ? null : char.id
                  )}
                  className={`
                    flex items-center gap-2 px-3 py-1.5 rounded-sm text-sm transition-all
                    border border-border/50 hover:border-primary/50
                    ${selectedCharacter === char.id 
                      ? 'bg-primary/20 border-primary text-primary' 
                      : 'bg-card/50'
                    }
                  `}
                >
                  <span className="text-lg">{char.portrait}</span>
                  <span className="font-display">{char.name.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>
        )}

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
                  characters={characters}
                  selectedCharacter={selectedCharacter}
                  onAssignCharacter={onAssignCharacter}
                  onRemoveCharacter={onRemoveCharacter}
                  onStartQuest={(questId) => {
                    onStartQuest(questId);
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
      <div className="col-span-12 lg:col-span-4">
        <div className="sticky top-24 space-y-6">
          {/* Active Quests */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Swords className="w-5 h-5 text-primary" />
              <h2 className="font-display text-lg">Active Expeditions</h2>
            </div>
            
            {activeQuests.length > 0 ? (
              <div className="space-y-3">
                {activeQuests.map((quest) => (
                  <ActiveQuestCard
                    key={quest.id}
                    quest={quest}
                    characters={characters}
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
          <GameLog entries={log} />

          {/* Stats Summary */}
          <div className="bg-card/30 border border-border rounded-sm p-3">
            <h3 className="font-display text-sm text-muted-foreground mb-2">Guild Statistics</h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-muted-foreground">Quests Completed</span>
                <div className="font-display text-lg">{completedQuests}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Active Adventurers</span>
                <div className="font-display text-lg">
                  {characters.filter(c => !c.status.includes('dead')).length}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
