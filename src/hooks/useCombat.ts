import { useState, useCallback, useMemo } from 'react';
import { Character } from '@/types/game';
import { 
  CombatState, 
  CombatPhase, 
  CombatParticipant, 
  Enemy,
  CombatLogEntry,
  CombatAction
} from '@/types/combat';
import {
  createHeroParticipant,
  createEnemyParticipant,
  sortByInitiative,
  performAttack,
  createLogEntry,
  areAllEnemiesDefeated,
  areAllHeroesDefeated,
  getCurrentTurnParticipant,
  getLivingParticipants
} from '@/lib/combatUtils';
import { generateQuestBoss } from '@/data/enemies';

interface UseCombatProps {
  heroes: Character[];
  questId: string;
  questName: string;
  questDifficulty: string;
  onCombatEnd: (result: 'victory' | 'defeat', survivors: string[], deadHeroes: string[]) => void;
}

export function useCombat({ 
  heroes, 
  questId, 
  questName, 
  questDifficulty,
  onCombatEnd 
}: UseCombatProps) {
  const [combatState, setCombatState] = useState<CombatState | null>(null);

  // Initialize combat
  const initializeCombat = useCallback(() => {
    const boss = generateQuestBoss(questName, questDifficulty);
    
    // Create participants
    const heroParticipants = heroes.map(h => createHeroParticipant(h));
    const enemyParticipants = [createEnemyParticipant(boss)];
    
    const allParticipants = [...heroParticipants, ...enemyParticipants];
    const sorted = sortByInitiative(allParticipants);
    const turnOrder = sorted.map(p => p.id);

    // Create initial log with initiative rolls
    const initLog: CombatLogEntry[] = [
      createLogEntry(0, 'System', `Combat begins against ${boss.name}!`, 'info'),
      ...sorted.map((p, idx) => 
        createLogEntry(
          0, 
          p.name, 
          `rolls initiative: ${p.initiativeRoll} + ${p.dexterityModifier} = ${p.initiative}`,
          'info'
        )
      )
    ];

    setCombatState({
      phase: 'combat',
      participants: sorted,
      turnOrder,
      currentTurnIndex: 0,
      round: 1,
      log: initLog,
      enemies: [boss],
      heroes,
      selectedAction: null,
      questId,
      questName
    });
  }, [heroes, questId, questName, questDifficulty]);

  // Get current participant
  const currentParticipant = useMemo(() => {
    if (!combatState) return null;
    return getCurrentTurnParticipant(
      combatState.participants,
      combatState.turnOrder,
      combatState.currentTurnIndex
    );
  }, [combatState]);

  // Check if it's a hero's turn
  const isHeroTurn = useMemo(() => {
    return currentParticipant?.type === 'hero';
  }, [currentParticipant]);

  // Get valid targets for attack
  const getValidTargets = useCallback(() => {
    if (!combatState || !currentParticipant) return [];
    
    const targetType = currentParticipant.type === 'hero' ? 'enemy' : 'hero';
    return getLivingParticipants(combatState.participants).filter(p => p.type === targetType);
  }, [combatState, currentParticipant]);

  // Advance to next turn
  const advanceToNextTurn = useCallback((state: CombatState): CombatState => {
    // Find next living participant
    let nextIndex = state.currentTurnIndex;
    let newRound = state.round;
    let attempts = 0;
    
    do {
      nextIndex = (nextIndex + 1) % state.turnOrder.length;
      if (nextIndex === 0) {
        newRound++;
      }
      attempts++;
      // Safety check to prevent infinite loop
      if (attempts > state.turnOrder.length * 2) break;
    } while (!state.participants.find(p => p.id === state.turnOrder[nextIndex])?.isAlive);

    return {
      ...state,
      currentTurnIndex: nextIndex,
      round: newRound
    };
  }, []);

  // Check for combat end conditions
  const checkCombatEnd = useCallback((state: CombatState): CombatState => {
    const enemiesDefeated = areAllEnemiesDefeated(state.participants);
    const heroesDefeated = areAllHeroesDefeated(state.participants);

    if (enemiesDefeated) {
      const survivors = state.participants
        .filter(p => p.type === 'hero' && p.isAlive)
        .map(p => p.id);
      const deadHeroes = state.participants
        .filter(p => p.type === 'hero' && !p.isAlive)
        .map(p => p.id);

      const totalXP = state.enemies.reduce((sum, e) => sum + e.experienceReward, 0);
      const totalGold = state.enemies.reduce((sum, e) => sum + e.goldReward, 0);

      return {
        ...state,
        phase: 'victory',
        log: [
          ...state.log,
          createLogEntry(state.round, 'System', `Victory! All enemies defeated!`, 'victory'),
          createLogEntry(state.round, 'System', `Gained ${totalXP} XP and ${totalGold} gold!`, 'info')
        ]
      };
    }

    if (heroesDefeated) {
      return {
        ...state,
        phase: 'defeat',
        log: [
          ...state.log,
          createLogEntry(state.round, 'System', `Defeat... All heroes have fallen.`, 'defeat')
        ]
      };
    }

    return state;
  }, []);

  // Execute hero attack
  const executeHeroAttack = useCallback((targetId: string) => {
    if (!combatState || !currentParticipant || currentParticipant.type !== 'hero') return;

    const target = combatState.participants.find(p => p.id === targetId);
    if (!target || !target.isAlive) return;

    const attackResult = performAttack(currentParticipant, target);
    
    let newLog = [...combatState.log];
    let updatedParticipants = [...combatState.participants];

    if (attackResult.isCritical) {
      newLog.push(createLogEntry(
        combatState.round,
        currentParticipant.name,
        `CRITICAL HIT! Rolls ${attackResult.attackRoll.roll} (natural 20) vs AC ${attackResult.targetAC}. Deals ${attackResult.damage} damage to ${target.name}!`,
        'critical',
        attackResult.damage
      ));
    } else if (attackResult.isCriticalFail) {
      newLog.push(createLogEntry(
        combatState.round,
        currentParticipant.name,
        `Critical miss! Rolls ${attackResult.attackRoll.roll} (natural 1). The attack goes wide!`,
        'miss'
      ));
    } else if (attackResult.hit) {
      newLog.push(createLogEntry(
        combatState.round,
        currentParticipant.name,
        `attacks ${target.name}. Rolls ${attackResult.attackRoll.total} (${attackResult.attackRoll.roll}+${attackResult.attackRoll.modifier}) vs AC ${attackResult.targetAC}. Hit! Deals ${attackResult.damage} damage.`,
        'attack',
        attackResult.damage
      ));
    } else {
      newLog.push(createLogEntry(
        combatState.round,
        currentParticipant.name,
        `attacks ${target.name}. Rolls ${attackResult.attackRoll.total} (${attackResult.attackRoll.roll}+${attackResult.attackRoll.modifier}) vs AC ${attackResult.targetAC}. Miss!`,
        'miss'
      ));
    }

    // Apply damage
    if (attackResult.hit) {
      updatedParticipants = updatedParticipants.map(p => {
        if (p.id === targetId) {
          const newHealth = Math.max(0, p.health - attackResult.damage);
          const stillAlive = newHealth > 0;
          
          if (!stillAlive) {
            newLog.push(createLogEntry(
              combatState.round,
              target.name,
              `has been defeated!`,
              'death'
            ));
          }
          
          return { ...p, health: newHealth, isAlive: stillAlive };
        }
        return p;
      });
    }

    let newState: CombatState = {
      ...combatState,
      participants: updatedParticipants,
      log: newLog
    };

    // Check for combat end
    newState = checkCombatEnd(newState);
    
    // Advance turn if combat continues
    if (newState.phase === 'combat') {
      newState = advanceToNextTurn(newState);
    }

    setCombatState(newState);
  }, [combatState, currentParticipant, checkCombatEnd, advanceToNextTurn]);

  // Execute enemy turn (AI controlled)
  const executeEnemyTurn = useCallback(() => {
    if (!combatState || !currentParticipant || currentParticipant.type !== 'enemy') return;

    // Simple AI: attack random living hero
    const livingHeroes = getLivingParticipants(combatState.participants).filter(p => p.type === 'hero');
    if (livingHeroes.length === 0) return;

    const target = livingHeroes[Math.floor(Math.random() * livingHeroes.length)];
    const attackResult = performAttack(currentParticipant, target);

    let newLog = [...combatState.log];
    let updatedParticipants = [...combatState.participants];

    if (attackResult.isCritical) {
      newLog.push(createLogEntry(
        combatState.round,
        currentParticipant.name,
        `CRITICAL HIT on ${target.name}! Deals ${attackResult.damage} damage!`,
        'critical',
        attackResult.damage
      ));
    } else if (attackResult.isCriticalFail) {
      newLog.push(createLogEntry(
        combatState.round,
        currentParticipant.name,
        `fumbles their attack against ${target.name}!`,
        'miss'
      ));
    } else if (attackResult.hit) {
      newLog.push(createLogEntry(
        combatState.round,
        currentParticipant.name,
        `attacks ${target.name} for ${attackResult.damage} damage!`,
        'damage',
        attackResult.damage
      ));
    } else {
      newLog.push(createLogEntry(
        combatState.round,
        currentParticipant.name,
        `misses ${target.name}!`,
        'miss'
      ));
    }

    // Apply damage
    if (attackResult.hit) {
      updatedParticipants = updatedParticipants.map(p => {
        if (p.id === target.id) {
          const newHealth = Math.max(0, p.health - attackResult.damage);
          const stillAlive = newHealth > 0;
          
          if (!stillAlive) {
            newLog.push(createLogEntry(
              combatState.round,
              target.name,
              `has fallen in battle!`,
              'death'
            ));
          }
          
          return { ...p, health: newHealth, isAlive: stillAlive };
        }
        return p;
      });
    }

    let newState: CombatState = {
      ...combatState,
      participants: updatedParticipants,
      log: newLog
    };

    // Check for combat end
    newState = checkCombatEnd(newState);
    
    // Advance turn if combat continues
    if (newState.phase === 'combat') {
      newState = advanceToNextTurn(newState);
    }

    setCombatState(newState);
  }, [combatState, currentParticipant, checkCombatEnd, advanceToNextTurn]);

  // End combat and report results
  const endCombat = useCallback(() => {
    if (!combatState) return;
    
    const survivors = combatState.participants
      .filter(p => p.type === 'hero' && p.isAlive)
      .map(p => p.id);
    const deadHeroes = combatState.participants
      .filter(p => p.type === 'hero' && !p.isAlive)
      .map(p => p.id);

    onCombatEnd(
      combatState.phase === 'victory' ? 'victory' : 'defeat',
      survivors,
      deadHeroes
    );
  }, [combatState, onCombatEnd]);

  return {
    combatState,
    currentParticipant,
    isHeroTurn,
    initializeCombat,
    executeHeroAttack,
    executeEnemyTurn,
    getValidTargets,
    endCombat
  };
}
