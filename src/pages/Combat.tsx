import { useEffect, useCallback, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Character, Quest } from '@/types/game';
import { useCombat } from '@/hooks/useCombat';
import { InitiativeTracker } from '@/components/combat/InitiativeTracker';
import { CombatLog } from '@/components/combat/CombatLog';
import { CombatEndScreen } from '@/components/combat/CombatEndScreen';
import { PartyList } from '@/components/combat/PartyList';
import { HeroDetailPanel } from '@/components/combat/HeroDetailPanel';
import { EnemyDetailPanel } from '@/components/combat/EnemyDetailPanel';
import { Loader2 } from 'lucide-react';

interface TestCombatConfig {
  heroIds: string[];
  enemyKey: string;
}

interface CombatPageProps {
  characters: Character[];
  quests: Quest[];
  activeQuests: Quest[];
  testCombatConfig?: TestCombatConfig | null;
  onCombatComplete: (
    questId: string,
    result: 'victory' | 'defeat',
    survivors: string[],
    deadHeroes: string[],
    xpReward: number,
    goldReward: number
  ) => void;
  onTestCombatEnd?: () => void;
}

export function CombatPage({ 
  characters, 
  quests, 
  activeQuests,
  testCombatConfig,
  onCombatComplete,
  onTestCombatEnd
}: CombatPageProps) {
  const navigate = useNavigate();
  const { questId } = useParams<{ questId: string }>();

  // Track which hero is selected for viewing (defaults to current turn hero)
  const [selectedHeroId, setSelectedHeroId] = useState<string | undefined>();

  // Check if this is a test combat
  const isTestCombat = questId === 'test-combat' && testCombatConfig;

  // Find the quest (only for real quests)
  const quest = isTestCombat 
    ? null 
    : [...quests, ...activeQuests].find(q => q.id === questId);
  
  // Get party members
  const partyMembers = isTestCombat
    ? characters.filter(c => testCombatConfig.heroIds.includes(c.id))
    : quest 
      ? characters.filter(c => quest.assignedParty.includes(c.id))
      : [];

  const handleCombatEnd = useCallback((
    result: 'victory' | 'defeat',
    survivors: string[],
    deadHeroes: string[]
  ) => {
    if (isTestCombat) {
      return;
    }
    
    if (!quest) return;
    
    const xpReward = result === 'victory' ? quest.rewards.experience : 0;
    const goldReward = result === 'victory' ? quest.rewards.gold : 0;
    
    onCombatComplete(quest.id, result, survivors, deadHeroes, xpReward, goldReward);
  }, [quest, onCombatComplete, isTestCombat]);

  const {
    combatState,
    currentParticipant,
    isHeroTurn,
    initializeCombat,
    executeHeroAttack,
    executeSpell,
    executeEnemyTurn,
    getValidTargets,
    getValidAllyTargets,
    endCombat
  } = useCombat({
    heroes: partyMembers,
    questId: questId || '',
    questName: isTestCombat ? 'Test Arena' : (quest?.name || 'Unknown Quest'),
    questDifficulty: quest?.difficulty || 'medium',
    enemyKey: isTestCombat ? testCombatConfig.enemyKey : undefined,
    onCombatEnd: handleCombatEnd
  });

  // Initialize combat on mount
  useEffect(() => {
    if (partyMembers.length > 0 && !combatState) {
      initializeCombat();
    }
  }, [partyMembers, combatState, initializeCombat]);

  // Auto-select current turn hero when turn changes
  useEffect(() => {
    if (currentParticipant?.type === 'hero') {
      setSelectedHeroId(currentParticipant.id);
    }
  }, [currentParticipant]);

  // Auto-execute enemy turns with a delay
  useEffect(() => {
    if (combatState?.phase === 'combat' && !isHeroTurn && currentParticipant?.isAlive) {
      const timer = setTimeout(() => {
        executeEnemyTurn();
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [combatState, isHeroTurn, currentParticipant, executeEnemyTurn]);

  if (!quest && !isTestCombat) {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Quest not found</p>
      </div>
    );
  }

  if (!combatState) {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <p className="text-muted-foreground">Initializing combat...</p>
        </div>
      </div>
    );
  }

  const heroParticipants = combatState.participants.filter(p => p.type === 'hero');
  const enemyParticipants = combatState.participants.filter(p => p.type === 'enemy');
  
  // Get the selected hero for display
  const selectedHero = heroParticipants.find(h => h.id === selectedHeroId) || heroParticipants[0];
  
  // Get the first alive enemy for display
  const displayedEnemy = enemyParticipants.find(e => e.isAlive) || enemyParticipants[0];

  return (
    <div className="fixed inset-0 bg-background flex flex-col">
      {/* Initiative Tracker - always visible at top */}
      <InitiativeTracker
        participants={combatState.participants}
        turnOrder={combatState.turnOrder}
        currentTurnIndex={combatState.currentTurnIndex}
        round={combatState.round}
      />

      {/* Main combat area */}
      <div className="flex-1 grid grid-cols-[240px_1fr_1fr_320px] gap-4 p-4 overflow-hidden">
        {/* Left column: Party List */}
        <div className="h-full overflow-hidden">
          <PartyList
            heroes={heroParticipants}
            currentTurnId={currentParticipant?.id}
            selectedHeroId={selectedHeroId}
            onSelectHero={setSelectedHeroId}
          />
        </div>

        {/* Left-center: Selected Hero Details */}
        <div className="h-full overflow-y-auto">
          {selectedHero && (
            <HeroDetailPanel
              hero={selectedHero}
              isCurrentTurn={selectedHero.id === currentParticipant?.id && isHeroTurn}
              validTargets={selectedHero.id === currentParticipant?.id ? getValidTargets() : []}
              validAllyTargets={selectedHero.id === currentParticipant?.id ? getValidAllyTargets() : []}
              spellSlotsUsed={combatState.spellSlotUsage[selectedHero.characterRef?.id || ''] || { level1: 0, level2: 0, level3: 0, level4: 0, level5: 0 }}
              participantsActedThisRound={combatState.participantsActedThisRound}
              onAttack={executeHeroAttack}
              onCastSpell={executeSpell}
              disabled={combatState.phase !== 'combat' || selectedHero.id !== currentParticipant?.id}
            />
          )}
        </div>

        {/* Right-center: Enemy Details */}
        <div className="h-full overflow-y-auto">
          {displayedEnemy && (
            <EnemyDetailPanel
              enemy={displayedEnemy}
              isCurrentTurn={displayedEnemy.id === currentParticipant?.id}
            />
          )}
        </div>

        {/* Right column: Combat Log */}
        <div className="h-full overflow-hidden">
          <CombatLog log={combatState.log} />
        </div>
      </div>

      {/* Combat End Screen */}
      {(combatState.phase === 'victory' || combatState.phase === 'defeat') && (
        <CombatEndScreen 
          combatState={combatState}
          isTestCombat={!!isTestCombat}
          onContinue={() => {
            if (isTestCombat) {
              onTestCombatEnd?.();
            } else {
              endCombat();
            }
            navigate('/');
          }}
        />
      )}
    </div>
  );
}
