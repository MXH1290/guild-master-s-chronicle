import { Character, Attributes } from '@/types/game';
import { CharacterCard } from '@/components/game/CharacterCard';
import { Button } from '@/components/ui/button';
import { Coins, RefreshCw, UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface RecruitmentPageProps {
  characters: Character[];
  gold: number;
  onRecruit: (character: Character, cost: number) => void;
  onRefreshRecruits: () => void;
  recruits: Character[];
}

const calculateRecruitCost = (character: Character): number => {
  const attributes = character.attributes;
  const totalStats = Object.values(attributes).reduce((sum, val) => sum + val, 0);
  const avgStat = totalStats / 6;
  
  // Base cost scales with level and average stat quality
  const baseCost = 50 + (character.level * 25);
  const statMultiplier = avgStat / 10; // 1.0 for average (10), higher for better stats
  
  return Math.round(baseCost * statMultiplier);
};

export function RecruitmentPage({ 
  characters, 
  gold, 
  onRecruit, 
  onRefreshRecruits,
  recruits 
}: RecruitmentPageProps) {
  const { toast } = useToast();

  const handleRecruit = (recruit: Character) => {
    const cost = calculateRecruitCost(recruit);
    if (gold < cost) {
      toast({
        title: "Insufficient Gold",
        description: `You need ${cost} gold to recruit ${recruit.name}.`,
        variant: "destructive",
      });
      return;
    }
    onRecruit(recruit, cost);
    toast({
      title: "Hero Recruited!",
      description: `${recruit.name} has joined your guild.`,
    });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <UserPlus className="w-6 h-6 text-primary" />
        <h1 className="font-display text-2xl">Recruitment Hall</h1>
        <div className="ml-auto flex items-center gap-4">
          <div className="flex items-center gap-2 text-yellow-400">
            <Coins className="w-5 h-5" />
            <span className="font-bold">{gold}</span>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onRefreshRecruits}
            className="gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            New Recruits
          </Button>
        </div>
      </div>

      {recruits.length === 0 ? (
        <div className="parchment p-8 text-center">
          <p className="text-ink/70 font-body">
            No adventurers seeking employment. Click "New Recruits" to scout for talent.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recruits.map((recruit, index) => {
            const cost = calculateRecruitCost(recruit);
            const canAfford = gold >= cost;

            return (
              <div 
                key={recruit.id}
                className="animate-fade-in flex flex-col"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <CharacterCard character={recruit} />
                <div className="mt-2 p-3 bg-card/50 border border-border/50 rounded-sm">
                  <Button 
                    className="w-full gap-2"
                    disabled={!canAfford}
                    onClick={() => handleRecruit(recruit)}
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Recruit</span>
                    <span className="flex items-center gap-1 ml-auto">
                      <Coins className="w-3 h-3" />
                      {cost}
                    </span>
                  </Button>
                  {!canAfford && (
                    <p className="text-xs text-destructive text-center mt-2">Not enough gold</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
