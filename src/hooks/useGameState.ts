import { useState, useCallback } from 'react';
import { GameState, Character, Quest, GameLogEntry } from '@/types/game';
import { initialQuests } from '@/data/initialData';
import { generateCharacter } from '@/lib/characterGenerator';

export type GamePhase = 'selection' | 'playing';

export function useGameState() {
  const [phase, setPhase] = useState<GamePhase>('selection');
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [recruits, setRecruits] = useState<Character[]>([]);

  const startGame = useCallback((selectedCharacters: Character[]) => {
    setGameState({
      guild: {
        name: 'The Silver Ravens',
        gold: 500,
        reputation: 25,
        day: 1
      },
      characters: selectedCharacters,
      quests: initialQuests.map(q => ({ ...q, assignedParty: [], status: 'available' as const, progress: 0 })),
      activeQuests: [],
      completedQuests: 0,
      log: [
        { id: '1', day: 1, message: 'The guild hall opens its doors. Your legend begins.', type: 'info' }
      ]
    });
    setPhase('playing');
  }, []);

  const addLogEntry = useCallback((message: string, type: GameLogEntry['type'] = 'info') => {
    setGameState(prev => ({
      ...prev,
      log: [
        ...prev.log,
        {
          id: Date.now().toString(),
          day: prev.guild.day,
          message,
          type
        }
      ]
    }));
  }, []);

  const assignCharacterToQuest = useCallback((questId: string, characterId: string) => {
    setGameState(prev => {
      // Check if character is already in another quest
      const characterInQuest = prev.quests.find(q => 
        q.assignedParty.includes(characterId) && q.status === 'available'
      );
      
      if (characterInQuest && characterInQuest.id !== questId) {
        return prev;
      }

      const character = prev.characters.find(c => c.id === characterId);
      
      return {
        ...prev,
        quests: prev.quests.map(quest => {
          if (quest.id !== questId) return quest;
          if (quest.assignedParty.includes(characterId)) return quest;
          if (quest.assignedParty.length >= quest.partySlots) return quest;
          
          return {
            ...quest,
            assignedParty: [...quest.assignedParty, characterId]
          };
        })
      };
    });
  }, []);

  const removeCharacterFromQuest = useCallback((questId: string, characterId: string) => {
    setGameState(prev => ({
      ...prev,
      quests: prev.quests.map(quest => {
        if (quest.id !== questId) return quest;
        return {
          ...quest,
          assignedParty: quest.assignedParty.filter(id => id !== characterId)
        };
      })
    }));
  }, []);

  const startQuest = useCallback((questId: string) => {
    setGameState(prev => {
      const quest = prev.quests.find(q => q.id === questId);
      if (!quest) return prev;
      
      const partyNames = quest.assignedParty
        .map(id => prev.characters.find(c => c.id === id)?.name)
        .filter(Boolean)
        .join(', ');

      return {
        ...prev,
        quests: prev.quests.map(q => 
          q.id === questId ? { ...q, status: 'in_progress' as const } : q
        ),
        activeQuests: [...prev.activeQuests, { ...quest, status: 'in_progress' as const }],
        log: [
          ...prev.log,
          {
            id: Date.now().toString(),
            day: prev.guild.day,
            message: `${partyNames} departed for "${quest.name}"`,
            type: 'info' as const
          }
        ]
      };
    });
  }, []);

  const advanceDay = useCallback(() => {
    setGameState(prev => {
      let newLog = [...prev.log];
      let newGold = prev.guild.gold;
      let newReputation = prev.guild.reputation;
      let newCompletedQuests = prev.completedQuests;
      let newCharacters = [...prev.characters];
      let completedQuestIds: string[] = [];

      // Progress active quests
      const updatedActiveQuests = prev.activeQuests.map(quest => {
        const progressIncrease = Math.floor(100 / (quest.duration / 8)); // ~8 hours per day
        const newProgress = Math.min(quest.progress + progressIncrease, 100);
        
        return { ...quest, progress: newProgress };
      });

      // Check for completed quests
      updatedActiveQuests.forEach(quest => {
        if (quest.progress >= 100) {
          // Quest completed - determine success/failure
          const partyPower = quest.assignedParty.reduce((sum, charId) => {
            const char = newCharacters.find(c => c.id === charId);
            if (!char) return sum;
            return sum + char.level + (char.attributes.strength + char.attributes.constitution) / 10;
          }, 0);

          const difficultyMod = {
            trivial: 0.95, easy: 0.85, medium: 0.7, hard: 0.5, deadly: 0.3
          }[quest.difficulty];

          const success = Math.random() < difficultyMod + (partyPower / 20);

          if (success) {
            newGold += quest.rewards.gold;
            newReputation += quest.rewards.reputation;
            newCompletedQuests++;

            newLog.push({
              id: Date.now().toString() + quest.id,
              day: prev.guild.day + 1,
              message: `"${quest.name}" completed successfully! Gained ${quest.rewards.gold} gold.`,
              type: 'success'
            });

            // Characters gain experience and stress
            quest.assignedParty.forEach(charId => {
              const charIndex = newCharacters.findIndex(c => c.id === charId);
              if (charIndex !== -1) {
                newCharacters[charIndex] = {
                  ...newCharacters[charIndex],
                  stress: Math.min(newCharacters[charIndex].stress + Math.floor(Math.random() * 15) + 5, 100),
                  quests: newCharacters[charIndex].quests + 1
                };
              }
            });
          } else {
            // Failure - characters take damage and stress
            quest.assignedParty.forEach(charId => {
              const charIndex = newCharacters.findIndex(c => c.id === charId);
              if (charIndex !== -1) {
                const damage = Math.floor(Math.random() * 15) + 10;
                const stressGain = Math.floor(Math.random() * 25) + 15;
                
                newCharacters[charIndex] = {
                  ...newCharacters[charIndex],
                  health: Math.max(newCharacters[charIndex].health - damage, 0),
                  stress: Math.min(newCharacters[charIndex].stress + stressGain, 100),
                  status: newCharacters[charIndex].health - damage <= 0 
                    ? ['dead'] 
                    : newCharacters[charIndex].health - damage < newCharacters[charIndex].maxHealth * 0.3
                      ? ['injured']
                      : newCharacters[charIndex].status
                };
              }
            });

            newLog.push({
              id: Date.now().toString() + quest.id,
              day: prev.guild.day + 1,
              message: `"${quest.name}" failed! The party returns wounded and demoralized.`,
              type: 'danger'
            });
          }

          completedQuestIds.push(quest.id);
        }
      });

      // Update character stress states
      newCharacters = newCharacters.map(char => {
        if (char.status.includes('dead')) return char;
        
        const newStatus: typeof char.status = [];
        if (char.health < char.maxHealth * 0.3) newStatus.push('injured');
        if (char.stress > 70) newStatus.push('stressed');
        if (char.stress > 90) newStatus.push('afflicted');
        if (newStatus.length === 0) newStatus.push('healthy');
        
        return { ...char, status: newStatus };
      });

      // Rest characters not on quests (heal a bit, reduce stress)
      const charactersOnQuests = new Set(
        updatedActiveQuests
          .filter(q => !completedQuestIds.includes(q.id))
          .flatMap(q => q.assignedParty)
      );

      newCharacters = newCharacters.map(char => {
        if (charactersOnQuests.has(char.id) || char.status.includes('dead')) return char;
        
        return {
          ...char,
          health: Math.min(char.health + 5, char.maxHealth),
          stress: Math.max(char.stress - 10, 0)
        };
      });

      return {
        ...prev,
        guild: {
          ...prev.guild,
          day: prev.guild.day + 1,
          gold: newGold,
          reputation: newReputation
        },
        characters: newCharacters,
        activeQuests: updatedActiveQuests.filter(q => !completedQuestIds.includes(q.id)),
        quests: prev.quests.filter(q => !completedQuestIds.includes(q.id)),
        completedQuests: newCompletedQuests,
        log: newLog
      };
    });
  }, []);

  const getLowestLivingLevel = useCallback(() => {
    if (!gameState) return 1;
    const livingChars = gameState.characters.filter(c => !c.status.includes('dead'));
    if (livingChars.length === 0) return 1;
    return Math.min(...livingChars.map(c => c.level));
  }, [gameState]);

  const refreshRecruits = useCallback(() => {
    const level = getLowestLivingLevel();
    const newRecruits: Character[] = [];
    
    for (let i = 0; i < 4; i++) {
      const recruitId = `recruit-${Date.now()}-${i}`;
      const recruit = generateCharacter(recruitId);
      recruit.level = level;
      newRecruits.push(recruit);
    }
    
    setRecruits(newRecruits);
  }, [getLowestLivingLevel]);

  const recruitCharacter = useCallback((character: Character, cost: number) => {
    setGameState(prev => {
      if (!prev || prev.guild.gold < cost) return prev;
      
      return {
        ...prev,
        guild: {
          ...prev.guild,
          gold: prev.guild.gold - cost
        },
        characters: [...prev.characters, { ...character, id: `hero-${Date.now()}` }],
        log: [
          ...prev.log,
          {
            id: Date.now().toString(),
            day: prev.guild.day,
            message: `${character.name} the ${character.class} has joined the guild!`,
            type: 'success' as const
          }
        ]
      };
    });
    
    // Remove from recruits list
    setRecruits(prev => prev.filter(r => r.id !== character.id));
  }, []);

  const completeCombat = useCallback((
    questId: string,
    result: 'victory' | 'defeat',
    survivors: string[],
    deadHeroes: string[],
    xpReward: number,
    goldReward: number
  ) => {
    setGameState(prev => {
      if (!prev) return prev;

      let newCharacters = prev.characters.map(char => {
        if (deadHeroes.includes(char.id)) {
          return { ...char, health: 0, status: ['dead'] as Character['status'] };
        }
        if (survivors.includes(char.id)) {
          return {
            ...char,
            experience: char.experience + Math.floor(xpReward / survivors.length),
            quests: char.quests + 1
          };
        }
        return char;
      });

      const quest = [...prev.quests, ...prev.activeQuests].find(q => q.id === questId);
      const questName = quest?.name || 'Unknown Quest';

      return {
        ...prev,
        guild: {
          ...prev.guild,
          gold: prev.guild.gold + goldReward,
          reputation: prev.guild.reputation + (result === 'victory' ? (quest?.rewards.reputation || 5) : 0)
        },
        characters: newCharacters,
        activeQuests: prev.activeQuests.filter(q => q.id !== questId),
        quests: prev.quests.filter(q => q.id !== questId),
        completedQuests: result === 'victory' ? prev.completedQuests + 1 : prev.completedQuests,
        log: [
          ...prev.log,
          {
            id: Date.now().toString(),
            day: prev.guild.day,
            message: result === 'victory' 
              ? `"${questName}" completed! Gained ${goldReward} gold and ${xpReward} XP.`
              : `"${questName}" failed. The party was defeated.`,
            type: result === 'victory' ? 'success' as const : 'danger' as const
          }
        ]
      };
    });
  }, []);

  return {
    phase,
    gameState,
    recruits,
    startGame,
    assignCharacterToQuest,
    removeCharacterFromQuest,
    startQuest,
    advanceDay,
    addLogEntry,
    refreshRecruits,
    recruitCharacter,
    completeCombat
  };
}
