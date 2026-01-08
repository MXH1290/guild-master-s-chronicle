import { Character, Quest } from '@/types/game';
import { QuestCardCompact } from '@/components/game/QuestCardCompact';
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
}

export function QuestsPage({
  characters,
  quests,
  activeQuests,
  completedQuests,
  log,
}: QuestsPageProps) {
  const availableQuests = quests.filter(q => q.status === 'available');

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

        {availableQuests.length > 0 ? (
          <div className="space-y-2">
            {availableQuests.map((quest, index) => (
              <div 
                key={quest.id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <QuestCardCompact quest={quest} />
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
