import { useState, useCallback } from 'react';
import { GameState, Character, Quest, GameLogEntry } from '@/types/game';
import { initialGameState } from '@/data/initialData';

export function useGameState() {
  const [gameState, setGameState] = useState<GameState>(initialGameState);

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

  return {
    gameState,
    assignCharacterToQuest,
    removeCharacterFromQuest,
    startQuest,
    advanceDay,
    addLogEntry
  };
}
