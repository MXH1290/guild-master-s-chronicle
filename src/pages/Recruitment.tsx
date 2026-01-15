import { useMemo, useState } from 'react';
import { Character, Attributes } from '@/types/game';
import { generateCharacter } from '@/lib/characterGenerator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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

const getStatQuality = (attributes: Attributes): 'poor' | 'average' | 'good' | 'excellent' => {
  const avg = Object.values(attributes).reduce((sum, val) => sum + val, 0) / 6;
  if (avg < 9) return 'poor';
  if (avg < 11) return 'average';
  if (avg < 13) return 'good';
  return 'excellent';
};

const qualityColors = {
  poor: 'bg-muted text-muted-foreground',
  average: 'bg-secondary text-secondary-foreground',
  good: 'bg-primary/20 text-primary',
  excellent: 'bg-yellow-500/20 text-yellow-400',
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display text-foreground">Recruitment Hall</h1>
          <p className="text-muted-foreground mt-1">Hire new adventurers to join your guild</p>
        </div>
        <div className="flex items-center gap-4">
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
        <Card className="bg-card/50 border-border/50">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No recruits available. Click "New Recruits" to find adventurers.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recruits.map((recruit) => {
            const cost = calculateRecruitCost(recruit);
            const quality = getStatQuality(recruit.attributes);
            const canAfford = gold >= cost;

            return (
              <Card 
                key={recruit.id} 
                className="bg-card/50 border-border/50 hover:border-primary/50 transition-colors"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-4xl">{recruit.portrait}</div>
                      <div>
                        <CardTitle className="text-lg">{recruit.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{recruit.class}</p>
                      </div>
                    </div>
                    <Badge variant="outline">Lvl {recruit.level}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Stat Quality</span>
                    <Badge className={qualityColors[quality]}>
                      {quality.charAt(0).toUpperCase() + quality.slice(1)}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div className="text-center p-2 bg-muted/30 rounded">
                      <div className="font-bold text-foreground">{recruit.attributes.strength}</div>
                      <div className="text-xs text-muted-foreground">STR</div>
                    </div>
                    <div className="text-center p-2 bg-muted/30 rounded">
                      <div className="font-bold text-foreground">{recruit.attributes.dexterity}</div>
                      <div className="text-xs text-muted-foreground">DEX</div>
                    </div>
                    <div className="text-center p-2 bg-muted/30 rounded">
                      <div className="font-bold text-foreground">{recruit.attributes.constitution}</div>
                      <div className="text-xs text-muted-foreground">CON</div>
                    </div>
                    <div className="text-center p-2 bg-muted/30 rounded">
                      <div className="font-bold text-foreground">{recruit.attributes.intelligence}</div>
                      <div className="text-xs text-muted-foreground">INT</div>
                    </div>
                    <div className="text-center p-2 bg-muted/30 rounded">
                      <div className="font-bold text-foreground">{recruit.attributes.wisdom}</div>
                      <div className="text-xs text-muted-foreground">WIS</div>
                    </div>
                    <div className="text-center p-2 bg-muted/30 rounded">
                      <div className="font-bold text-foreground">{recruit.attributes.charisma}</div>
                      <div className="text-xs text-muted-foreground">CHA</div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {recruit.traits.slice(0, 2).map((trait) => (
                      <Badge key={trait} variant="secondary" className="text-xs">
                        {trait}
                      </Badge>
                    ))}
                  </div>

                  <Button 
                    className="w-full gap-2"
                    disabled={!canAfford}
                    onClick={() => handleRecruit(recruit)}
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Recruit</span>
                    <span className="flex items-center gap-1">
                      <Coins className="w-3 h-3" />
                      {cost}
                    </span>
                  </Button>
                  {!canAfford && (
                    <p className="text-xs text-destructive text-center">Not enough gold</p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
