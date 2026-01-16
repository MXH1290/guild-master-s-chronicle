import { CombatState, CombatParticipant } from '@/types/combat';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Trophy, Skull, Coins, Star, ArrowRight } from 'lucide-react';

interface CombatEndScreenProps {
  combatState: CombatState;
  onContinue: () => void;
}

export function CombatEndScreen({ combatState, onContinue }: CombatEndScreenProps) {
  const isVictory = combatState.phase === 'victory';
  
  const survivors = combatState.participants.filter(p => p.type === 'hero' && p.isAlive);
  const fallen = combatState.participants.filter(p => p.type === 'hero' && !p.isAlive);
  
  const totalXP = combatState.enemies.reduce((sum, e) => sum + e.experienceReward, 0);
  const totalGold = combatState.enemies.reduce((sum, e) => sum + e.goldReward, 0);

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className={cn(
        "bg-card border-2 rounded-xl p-8 max-w-md w-full mx-4 text-center space-y-6",
        isVictory ? "border-health" : "border-destructive"
      )}>
        {/* Icon */}
        <div className={cn(
          "w-20 h-20 mx-auto rounded-full flex items-center justify-center",
          isVictory ? "bg-health/20" : "bg-destructive/20"
        )}>
          {isVictory ? (
            <Trophy className="w-10 h-10 text-health" />
          ) : (
            <Skull className="w-10 h-10 text-destructive" />
          )}
        </div>

        {/* Title */}
        <div>
          <h2 className={cn(
            "text-3xl font-bold",
            isVictory ? "text-health" : "text-destructive"
          )}>
            {isVictory ? 'Victory!' : 'Defeat'}
          </h2>
          <p className="text-muted-foreground mt-2">
            {isVictory 
              ? `${combatState.questName} has been completed!`
              : 'Your party has been defeated...'}
          </p>
        </div>

        {/* Rewards (victory only) */}
        {isVictory && (
          <div className="bg-muted/30 rounded-lg p-4 space-y-3">
            <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
              Rewards
            </h3>
            <div className="flex justify-center gap-8">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" />
                <span className="font-semibold">{totalXP} XP</span>
              </div>
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-yellow-500" />
                <span className="font-semibold">{totalGold} Gold</span>
              </div>
            </div>
          </div>
        )}

        {/* Survivors */}
        {survivors.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
              {isVictory ? 'Survivors' : 'Escaped'}
            </h3>
            <div className="flex flex-wrap justify-center gap-2">
              {survivors.map(hero => (
                <span 
                  key={hero.id}
                  className="px-3 py-1 bg-health/10 text-health rounded-full text-sm"
                >
                  {hero.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Fallen */}
        {fallen.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-semibold text-sm uppercase tracking-wide text-destructive/70">
              Fallen Heroes
            </h3>
            <div className="flex flex-wrap justify-center gap-2">
              {fallen.map(hero => (
                <span 
                  key={hero.id}
                  className="px-3 py-1 bg-destructive/10 text-destructive rounded-full text-sm flex items-center gap-1"
                >
                  <Skull className="w-3 h-3" />
                  {hero.name}
                </span>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Heroes who fall in battle and are not healed before combat ends are lost forever.
            </p>
          </div>
        )}

        {/* Continue button */}
        <Button 
          onClick={onContinue}
          size="lg"
          className={cn(
            "w-full",
            isVictory ? "bg-health hover:bg-health/90" : ""
          )}
        >
          Continue
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
