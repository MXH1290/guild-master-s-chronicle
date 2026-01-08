import { ReactNode } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { GameSidebar } from './GameSidebar';
import { GuildHeader } from './GuildHeader';
import { Guild } from '@/types/game';

interface GameLayoutProps {
  children: ReactNode;
  guild: Guild;
  onAdvanceDay: () => void;
}

export function GameLayout({ children, guild, onAdvanceDay }: GameLayoutProps) {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full bg-background">
        <GameSidebar />
        <div className="flex-1 flex flex-col">
          <GuildHeader guild={guild} onAdvanceDay={onAdvanceDay} />
          <main className="flex-1 container mx-auto px-4 py-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
