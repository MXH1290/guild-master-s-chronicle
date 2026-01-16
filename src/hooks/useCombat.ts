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
  getLivingParticipants,
  rollD20,
  rollWithModifier
} from '@/lib/combatUtils';
import { generateQuestBoss, enemyTemplates } from '@/data/enemies';
import { getSpellById, SONG_OF_WOE_PROGRESSION, CombatSpell } from '@/data/spells';
import { getModifier } from '@/lib/statCalculations';

interface UseCombatProps {
  heroes: Character[];
  questId: string;
  questName: string;
  questDifficulty: string;
  enemyKey?: string; // For test combat - use specific enemy template
  onCombatEnd: (result: 'victory' | 'defeat', survivors: string[], deadHeroes: string[]) => void;
}

export function useCombat({ 
  heroes, 
  questId, 
  questName, 
  questDifficulty,
  enemyKey,
  onCombatEnd 
}: UseCombatProps) {
  const [combatState, setCombatState] = useState<CombatState | null>(null);

  // Initialize combat
  const initializeCombat = useCallback(() => {
    // Use specific enemy template if provided (test combat), otherwise generate boss
    let boss: Enemy;
    if (enemyKey && enemyTemplates[enemyKey]) {
      const template = enemyTemplates[enemyKey];
      boss = {
        id: `enemy-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        ...template
      };
    } else {
      boss = generateQuestBoss(questName, questDifficulty);
    }
    
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

    // Initialize spell slot usage tracking
    const spellSlotUsage: Record<string, { level1: number; level2: number; level3: number; level4: number; level5: number }> = {};
    heroes.forEach(h => {
      spellSlotUsage[h.id] = { level1: 0, level2: 0, level3: 0, level4: 0, level5: 0 };
    });

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
      questName,
      spellSlotUsage,
      songOfWoeHits: {},
      participantsActedThisRound: []
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
    let newParticipantsActed = [...state.participantsActedThisRound];
    
    // Mark current participant as having acted
    const currentId = state.turnOrder[state.currentTurnIndex];
    if (!newParticipantsActed.includes(currentId)) {
      newParticipantsActed.push(currentId);
    }
    
    do {
      nextIndex = (nextIndex + 1) % state.turnOrder.length;
      if (nextIndex === 0) {
        newRound++;
        newParticipantsActed = []; // Reset at start of new round
        // Decrement effect durations
        state.participants = state.participants.map(p => ({
          ...p,
          activeEffects: p.activeEffects
            .map(e => ({ ...e, duration: e.duration - 1 }))
            .filter(e => e.duration > 0)
        }));
      }
      attempts++;
      if (attempts > state.turnOrder.length * 2) break;
    } while (!state.participants.find(p => p.id === state.turnOrder[nextIndex])?.isAlive);

    return {
      ...state,
      currentTurnIndex: nextIndex,
      round: newRound,
      participantsActedThisRound: newParticipantsActed
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

  // Roll dice helper
  const rollDice = useCallback((diceNotation: string): number => {
    const match = diceNotation.match(/(\d+)d(\d+)/);
    if (!match) return 1;
    const count = parseInt(match[1]);
    const sides = parseInt(match[2]);
    let total = 0;
    for (let i = 0; i < count; i++) {
      total += Math.floor(Math.random() * sides) + 1;
    }
    return total;
  }, []);

  // Execute spell casting
  const executeSpell = useCallback((spellId: string, targetId?: string) => {
    if (!combatState || !currentParticipant || currentParticipant.type !== 'hero') return;
    
    const character = currentParticipant.characterRef;
    if (!character) return;

    const spell = getSpellById(spellId);
    if (!spell) return;

    // Check spell slots
    const slotsUsed = combatState.spellSlotUsage[character.id];
    const slotKey = `level${spell.level}` as keyof typeof slotsUsed;
    const maxSlots = character.spellSlots[slotKey].max;
    
    if (slotsUsed[slotKey] >= maxSlots) {
      return; // No slots available
    }

    let newLog = [...combatState.log];
    let updatedParticipants = [...combatState.participants];
    let newSpellSlotUsage = { ...combatState.spellSlotUsage };
    let newSongOfWoeHits = { ...combatState.songOfWoeHits };
    let newTurnOrder = [...combatState.turnOrder];

    // Use spell slot
    newSpellSlotUsage[character.id] = {
      ...newSpellSlotUsage[character.id],
      [slotKey]: newSpellSlotUsage[character.id][slotKey] + 1
    };

    const spellMod = getModifier(character.attributes[spell.modifierStat]);
    const target = targetId ? updatedParticipants.find(p => p.id === targetId) : null;

    // Process spell effects
    for (const effect of spell.effects) {
      if (effect.type === 'damage' && target) {
        // Roll to hit
        const attackRoll = rollWithModifier(spellMod);
        const targetAC = target.enemyRef ? 10 + getModifier(target.enemyRef.attributes.dexterity) : 10;

        if (attackRoll.isCritical || (!attackRoll.isCriticalFail && attackRoll.total >= targetAC)) {
          const baseDamage = rollDice(effect.damageDice || '1d4');
          const damage = attackRoll.isCritical ? baseDamage * 2 : baseDamage;
          
          newLog.push(createLogEntry(
            combatState.round,
            currentParticipant.name,
            `casts ${spell.name}! Rolls ${attackRoll.total} vs AC ${targetAC}. ${attackRoll.isCritical ? 'CRITICAL! ' : ''}Deals ${damage} ${effect.damageType} damage to ${target.name}!`,
            attackRoll.isCritical ? 'critical' : 'spell',
            damage
          ));

          updatedParticipants = updatedParticipants.map(p => {
            if (p.id === targetId) {
              const newHealth = Math.max(0, p.health - damage);
              const stillAlive = newHealth > 0;
              if (!stillAlive) {
                newLog.push(createLogEntry(combatState.round, target.name, 'has been defeated!', 'death'));
              }
              return { ...p, health: newHealth, isAlive: stillAlive };
            }
            return p;
          });

          // Handle debuffs on hit (like Shocking Grasp, Guiding Bolt)
          if (effect.debuffType === 'move_to_end_initiative' || spell.effects.some(e => e.debuffType === 'move_to_end_initiative')) {
            // Move enemy to end of initiative
            const targetIndex = newTurnOrder.indexOf(targetId!);
            if (targetIndex !== -1 && targetIndex !== newTurnOrder.length - 1) {
              newTurnOrder = newTurnOrder.filter(id => id !== targetId);
              newTurnOrder.push(targetId!);
              newLog.push(createLogEntry(combatState.round, target.name, 'is stunned and moves to end of initiative!', 'debuff'));
            }
          }

          if (spell.effects.some(e => e.debuffType === 'grant_advantage')) {
            updatedParticipants = updatedParticipants.map(p => {
              if (p.id === targetId) {
                return {
                  ...p,
                  activeEffects: [...p.activeEffects, {
                    id: `advantage-${Date.now()}`,
                    type: 'grant_advantage' as const,
                    duration: 1,
                    sourceId: currentParticipant.id
                  }]
                };
              }
              return p;
            });
            newLog.push(createLogEntry(combatState.round, 'System', `Next attack against ${target.name} has advantage!`, 'buff'));
          }
        } else {
          newLog.push(createLogEntry(
            combatState.round,
            currentParticipant.name,
            `casts ${spell.name} at ${target.name}. Rolls ${attackRoll.total} vs AC ${targetAC}. ${attackRoll.isCriticalFail ? 'Critical miss!' : 'Miss!'}`,
            'miss'
          ));
        }
      }

      if (effect.type === 'heal' && target) {
        const healAmount = rollDice(effect.healDice || '1d4') + (effect.addModifier ? getModifier(character.attributes[effect.addModifier]) : 0);
        const actualHeal = Math.min(healAmount, target.maxHealth - target.health);
        
        updatedParticipants = updatedParticipants.map(p => {
          if (p.id === targetId) {
            return { ...p, health: Math.min(p.maxHealth, p.health + actualHeal) };
          }
          return p;
        });

        newLog.push(createLogEntry(
          combatState.round,
          currentParticipant.name,
          `casts ${spell.name} on ${target.name}, restoring ${actualHeal} HP!`,
          'heal',
          undefined,
          actualHeal
        ));
      }

      if (effect.type === 'buff') {
        const buffTarget = spell.targetType === 'self' ? currentParticipant : target;
        if (buffTarget) {
          updatedParticipants = updatedParticipants.map(p => {
            if (p.id === buffTarget.id) {
              return {
                ...p,
                activeEffects: [...p.activeEffects, {
                  id: `${effect.buffType}-${Date.now()}`,
                  type: effect.buffType!,
                  value: effect.buffValue,
                  duration: effect.duration || 1,
                  sourceId: currentParticipant.id
                }]
              };
            }
            return p;
          });

          const buffDesc = effect.buffType === 'ac_bonus' ? `+${effect.buffValue} AC` :
                          effect.buffType === 'attack_bonus' ? `+${effect.buffValue} to hit` : 'buff';
          newLog.push(createLogEntry(
            combatState.round,
            currentParticipant.name,
            `casts ${spell.name}! ${buffTarget.name} gains ${buffDesc} for ${effect.duration} round(s)!`,
            'buff'
          ));
        }
      }

      if (effect.type === 'special') {
        if (effect.special === 'song_of_woe' && target) {
          const hitKey = `${currentParticipant.id}-${targetId}`;
          const hitCount = newSongOfWoeHits[hitKey] || 0;
          const damageDice = SONG_OF_WOE_PROGRESSION[Math.min(hitCount, SONG_OF_WOE_PROGRESSION.length - 1)];
          
          const attackRoll = rollWithModifier(spellMod);
          const targetAC = target.enemyRef ? 10 + getModifier(target.enemyRef.attributes.dexterity) : 10;

          if (attackRoll.isCritical || (!attackRoll.isCriticalFail && attackRoll.total >= targetAC)) {
            const damage = rollDice(damageDice);
            newSongOfWoeHits[hitKey] = hitCount + 1;
            
            newLog.push(createLogEntry(
              combatState.round,
              currentParticipant.name,
              `sings Song of Woe (hit #${hitCount + 1})! Rolls ${attackRoll.total} vs AC ${targetAC}. Deals ${damage} psychic damage (${damageDice})!`,
              'spell',
              damage
            ));

            updatedParticipants = updatedParticipants.map(p => {
              if (p.id === targetId) {
                const newHealth = Math.max(0, p.health - damage);
                const stillAlive = newHealth > 0;
                if (!stillAlive) {
                  newLog.push(createLogEntry(combatState.round, target.name, 'has been defeated!', 'death'));
                }
                return { ...p, health: newHealth, isAlive: stillAlive };
              }
              return p;
            });
          } else {
            newLog.push(createLogEntry(
              combatState.round,
              currentParticipant.name,
              `sings Song of Woe at ${target.name}. Rolls ${attackRoll.total} vs AC ${targetAC}. Miss!`,
              'miss'
            ));
          }
        }

        if (effect.special === 'inspire' && target) {
          // Move target's turn to immediately after current turn
          const currentIndex = combatState.currentTurnIndex;
          const targetIndex = newTurnOrder.indexOf(targetId!);
          
          if (targetIndex !== -1 && targetIndex > currentIndex) {
            newTurnOrder = newTurnOrder.filter(id => id !== targetId);
            newTurnOrder.splice(currentIndex + 1, 0, targetId!);
            newLog.push(createLogEntry(
              combatState.round,
              currentParticipant.name,
              `inspires ${target.name}! They will act next!`,
              'buff'
            ));
          }
        }

        if (effect.special === 'elegant_distraction' && target) {
          // Add taunt effect to target
          updatedParticipants = updatedParticipants.map(p => {
            if (p.id === targetId) {
              return {
                ...p,
                activeEffects: [...p.activeEffects, {
                  id: `taunt-${Date.now()}`,
                  type: 'taunt' as const,
                  duration: 1,
                  sourceId: currentParticipant.id
                }]
              };
            }
            return p;
          });
          newLog.push(createLogEntry(
            combatState.round,
            currentParticipant.name,
            `performs an elegant distraction! ${target.name} will be targeted by the next enemy attack!`,
            'buff'
          ));
        }
      }
    }

    let newState: CombatState = {
      ...combatState,
      participants: updatedParticipants,
      log: newLog,
      spellSlotUsage: newSpellSlotUsage,
      songOfWoeHits: newSongOfWoeHits,
      turnOrder: newTurnOrder
    };

    newState = checkCombatEnd(newState);
    
    if (newState.phase === 'combat') {
      newState = advanceToNextTurn(newState);
    }

    setCombatState(newState);
  }, [combatState, currentParticipant, checkCombatEnd, advanceToNextTurn, rollDice]);

  // Get valid ally targets for spells
  const getValidAllyTargets = useCallback(() => {
    if (!combatState) return [];
    return getLivingParticipants(combatState.participants).filter(p => p.type === 'hero');
  }, [combatState]);

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
    executeSpell,
    executeEnemyTurn,
    getValidTargets,
    getValidAllyTargets,
    endCombat
  };
}
