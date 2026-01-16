import { Routes, Route } from 'react-router-dom';
import { useGameState } from '@/hooks/useGameState';
import { CharacterSelection } from '@/components/game/CharacterSelection';
import { GameLayout } from '@/components/game/GameLayout';
import { QuestsPage } from './Quests';
import { QuestDetailPage } from './QuestDetail';
import { GuildPage } from './Guild';
import { HeroDetailPage } from './HeroDetail';
import { RecruitmentPage } from './Recruitment';
import { CombatPage } from './Combat';

const Index = () => {
  const { 
    phase,
    gameState, 
    recruits,
    startGame,
    assignCharacterToQuest, 
    removeCharacterFromQuest, 
    startQuest, 
    advanceDay,
    refreshRecruits,
    recruitCharacter,
    completeCombat
  } = useGameState();

  // Show character selection screen at game start
  if (phase === 'selection') {
    return <CharacterSelection onComplete={startGame} />;
  }

  // Safety check - should never happen once game starts
  if (!gameState) return null;

  return (
    <GameLayout guild={gameState.guild} onAdvanceDay={advanceDay}>
      <Routes>
        <Route 
          path="/" 
          element={
            <QuestsPage
              characters={gameState.characters}
              quests={gameState.quests}
              activeQuests={gameState.activeQuests}
              completedQuests={gameState.completedQuests}
              log={gameState.log}
            />
          } 
        />
        <Route 
          path="/quest/:questId" 
          element={
            <QuestDetailPage
              quests={gameState.quests}
              characters={gameState.characters}
              activeQuests={gameState.activeQuests}
              onAssignCharacter={assignCharacterToQuest}
              onRemoveCharacter={removeCharacterFromQuest}
              onStartQuest={startQuest}
            />
          } 
        />
        <Route 
          path="/guild" 
          element={<GuildPage characters={gameState.characters} />} 
        />
        <Route 
          path="/hero/:heroId" 
          element={<HeroDetailPage characters={gameState.characters} />} 
        />
        <Route 
          path="/recruitment" 
          element={
            <RecruitmentPage 
              characters={gameState.characters}
              gold={gameState.guild.gold}
              recruits={recruits}
              onRecruit={recruitCharacter}
              onRefreshRecruits={refreshRecruits}
            />
          } 
        />
        <Route 
          path="/combat/:questId" 
          element={
            <CombatPage
              characters={gameState.characters}
              quests={gameState.quests}
              activeQuests={gameState.activeQuests}
              onCombatComplete={completeCombat}
            />
          } 
        />
      </Routes>
    </GameLayout>
  );
};

export default Index;
