import { useEffect, useCallback } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Character, Quest } from '@/types/game';
import { useCombat } from '@/hooks/useCombat';
import { InitiativeTracker } from '@/components/combat/InitiativeTracker';
import { CombatLog } from '@/components/combat/CombatLog';
import { CombatActions } from '@/components/combat/CombatActions';
import { EnemyDisplay } from '@/components/combat/EnemyDisplay';
import { PartyDisplay } from '@/components/combat/PartyDisplay';
import { CombatEndScreen } from '@/components/combat/CombatEndScreen';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface CombatPageProps {
  characters: Character[];
  quests: Quest[];
  activeQuests: Quest[];
  onCombatComplete: (
    questId: string,
    result: 'victory' | 'defeat',
    survivors: string[],
    deadHeroes: string[],
    xpReward: number,
    goldReward: number
  ) => void;
}

export function CombatPage({ 
  characters, 
  quests, 
  activeQuests,
  onCombatComplete 
}: CombatPageProps) {
  const navigate = useNavigate();
  const { questId } = useParams<{ questId: string }>();
  const location = useLocation();

  // Find the quest
  const quest = [...quests, ...activeQuests].find(q => q.id === questId);
  
  // Get party members
  const partyMembers = quest 
    ? characters.filter(c => quest.assignedParty.includes(c.id))
    : [];

  const handleCombatEnd = useCallback((
    result: 'victory' | 'defeat',
    survivors: string[],
    deadHeroes: string[]
  ) => {
    if (!quest) return;
    
    const xpReward = result === 'victory' ? quest.rewards.experience : 0;
    const goldReward = result === 'victory' ? quest.rewards.gold : 0;
    
    onCombatComplete(quest.id, result, survivors, deadHeroes, xpReward, goldReward);
  }, [quest, onCombatComplete]);

  const {
    combatState,
    currentParticipant,
    isHeroTurn,
    initializeCombat,
    executeHeroAttack,
    executeEnemyTurn,
    getValidTargets,
    endCombat
  } = useCombat({
    heroes: partyMembers,
    questId: questId || '',
    questName: quest?.name || 'Unknown Quest',
    questDifficulty: quest?.difficulty || 'medium',
    onCombatEnd: handleCombatEnd
  });

  // Initialize combat on mount
  useEffect(() => {
    if (partyMembers.length > 0 && !combatState) {
      initializeCombat();
    }
  }, [partyMembers, combatState, initializeCombat]);

  // Auto-execute enemy turns with a delay
  useEffect(() => {
    if (combatState?.phase === 'combat' && !isHeroTurn && currentParticipant?.isAlive) {
      const timer = setTimeout(() => {
        executeEnemyTurn();
      }, 1500); // 1.5 second delay for readability
      
      return () => clearTimeout(timer);
    }
  }, [combatState, isHeroTurn, currentParticipant, executeEnemyTurn]);

  if (!quest) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">Quest not found</p>
        <Button variant="outline" onClick={() => navigate('/')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Return to Quests
        </Button>
      </div>
    );
  }

  if (!combatState) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">Initializing combat...</p>
      </div>
    );
  }

  const heroParticipants = combatState.participants.filter(p => p.type === 'hero');
  const enemyParticipants = combatState.participants.filter(p => p.type === 'enemy');

  return (
    <div className="flex flex-col h-full">
      {/* Initiative Tracker - always visible at top */}
      <InitiativeTracker
        participants={combatState.participants}
        turnOrder={combatState.turnOrder}
        currentTurnIndex={combatState.currentTurnIndex}
        round={combatState.round}
      />

      {/* Main combat area */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 p-4 overflow-hidden">
        {/* Left column: Party */}
        <div className="space-y-4">
          <PartyDisplay 
            heroes={heroParticipants}
            currentTurnId={currentParticipant?.id}
          />
        </div>

        {/* Center column: Enemy & Actions */}
        <div className="space-y-4">
          <EnemyDisplay 
            enemies={enemyParticipants}
            currentTurnId={currentParticipant?.id}
          />
          
          <CombatActions
            currentParticipant={currentParticipant}
            isHeroTurn={isHeroTurn}
            validTargets={getValidTargets()}
            onAttack={executeHeroAttack}
            disabled={combatState.phase !== 'combat'}
          />
        </div>

        {/* Right column: Combat Log */}
        <div className="h-full min-h-[300px]">
          <CombatLog log={combatState.log} />
        </div>
      </div>

      {/* Combat End Screen */}
      {(combatState.phase === 'victory' || combatState.phase === 'defeat') && (
        <CombatEndScreen 
          combatState={combatState}
          onContinue={() => {
            endCombat();
            navigate('/');
          }}
        />
      )}
    </div>
  );
}
