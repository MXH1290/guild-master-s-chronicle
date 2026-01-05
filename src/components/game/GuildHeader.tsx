import { Guild } from '@/types/game';
import { Coins, Star, Calendar, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface GuildHeaderProps {
  guild: Guild;
  onAdvanceDay: () => void;
}

export function GuildHeader({ guild, onAdvanceDay }: GuildHeaderProps) {
  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Guild Name */}
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-primary flicker" />
            <div>
              <h1 className="font-display text-xl text-shadow-sm">{guild.name}</h1>
              <p className="text-xs text-muted-foreground">Guild Master's Quarters</p>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Coins className="w-5 h-5 text-gold" />
              <span className="font-display text-lg text-gold">{guild.gold}</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-primary" />
              <span className="font-display text-lg">{guild.reputation}</span>
              <span className="text-xs text-muted-foreground">Rep</span>
            </div>
            <div className="flex items-center gap-2 border-l border-border pl-6">
              <Calendar className="w-5 h-5 text-muted-foreground" />
              <span className="font-display text-lg">Day {guild.day}</span>
            </div>
            <Button 
              onClick={onAdvanceDay}
              variant="outline"
              className="ml-2"
            >
              End Day
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
