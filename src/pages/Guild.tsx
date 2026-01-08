import { useNavigate } from 'react-router-dom';
import { Character } from '@/types/game';
import { CharacterCard } from '@/components/game/CharacterCard';
import { Users, Skull, Heart } from 'lucide-react';

interface GuildPageProps {
  characters: Character[];
}

export function GuildPage({ characters }: GuildPageProps) {
  const navigate = useNavigate();
  const alive = characters.filter(c => !c.status.includes('dead'));
  const dead = characters.filter(c => c.status.includes('dead'));

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Users className="w-6 h-6 text-primary" />
        <h1 className="font-display text-2xl">Guild Roster</h1>
        <span className="text-muted-foreground text-sm ml-auto">
          {alive.length} active adventurers
        </span>
      </div>

      {/* Active Members */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Heart className="w-4 h-4 text-health" />
          <h2 className="font-display text-lg text-muted-foreground">Active Members</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {alive.map((character, index) => (
            <div 
              key={character.id}
              className="animate-fade-in cursor-pointer"
              style={{ animationDelay: `${index * 50}ms` }}
              onClick={() => navigate(`/hero/${character.id}`)}
            >
              <CharacterCard character={character} />
            </div>
          ))}
        </div>

        {alive.length === 0 && (
          <div className="parchment p-8 text-center">
            <p className="text-ink/70 font-body">
              The guild hall stands empty. All adventurers have fallen...
            </p>
          </div>
        )}
      </div>

      {/* Fallen Members */}
      {dead.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Skull className="w-4 h-4 text-muted-foreground" />
            <h2 className="font-display text-lg text-muted-foreground">Memorial Wall</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 opacity-60">
            {dead.map((character) => (
              <div 
                key={character.id}
                className="cursor-pointer"
                onClick={() => navigate(`/hero/${character.id}`)}
              >
                <CharacterCard character={character} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
