import { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { useGameState } from '@/hooks/useGameState';
import { CharacterSelection } from '@/components/game/CharacterSelection';
import { GameLayout } from '@/components/game/GameLayout';
import { QuestsPage } from './Quests';
import { QuestDetailPage } from './QuestDetail';
import { GuildPage } from './Guild';
import { HeroDetailPage } from './HeroDetail';
import { RecruitmentPage } from './Recruitment';
import { CombatPage } from './Combat';
import ShopPage from './Shop';
import { TestCombatDialog } from '@/components/combat/TestCombatDialog';

const Index = () => {
  const navigate = useNavigate();
  const [testCombatConfig, setTestCombatConfig] = useState<{
    heroIds: string[];
    enemyKey: string;
  } | null>(null);
  
  const { 
    phase,
    gameState, 
    recruits,
    shopInventory,
    startGame,
    assignCharacterToQuest, 
    removeCharacterFromQuest, 
    startQuest, 
    advanceDay,
    refreshRecruits,
    recruitCharacter,
    completeCombat,
    purchaseItem,
    equipItemToCharacter,
    unequipItem
  } = useGameState();

  const handleStartTestCombat = (heroIds: string[], enemyKey: string) => {
    setTestCombatConfig({ heroIds, enemyKey });
    navigate('/combat/test-combat');
  };

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
          element={
            <HeroDetailPage 
              characters={gameState.characters} 
              guildInventory={gameState.guildInventory}
              onEquipItem={equipItemToCharacter}
              onUnequipItem={unequipItem}
            />
          } 
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
          path="/shop" 
          element={
            <ShopPage 
              gold={gameState.guild.gold}
              shopInventory={shopInventory}
              shopLevel={gameState.guild.shopLevel}
              lastRestockDay={gameState.guild.lastRestockDay}
              currentDay={gameState.guild.day}
              onPurchase={purchaseItem}
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
              testCombatConfig={testCombatConfig}
              onCombatComplete={completeCombat}
              onTestCombatEnd={() => setTestCombatConfig(null)}
            />
          } 
        />
      </Routes>
      
      {/* Test Combat Button */}
      <TestCombatDialog 
        characters={gameState.characters}
        onStartTestCombat={handleStartTestCombat}
      />
    </GameLayout>
  );
};

export default Index;
