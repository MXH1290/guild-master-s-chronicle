import { cn } from '@/lib/utils';

interface StatBarProps {
  value: number;
  max: number;
  variant?: 'health' | 'stress' | 'default';
  showLabel?: boolean;
  size?: 'sm' | 'md';
}

export function StatBar({ value, max, variant = 'default', showLabel = true, size = 'sm' }: StatBarProps) {
  const percentage = Math.min((value / max) * 100, 100);
  
  const getBarColor = () => {
    switch (variant) {
      case 'health':
        if (percentage > 60) return 'bg-health';
        if (percentage > 30) return 'bg-warning';
        return 'bg-destructive danger-pulse';
      case 'stress':
        if (percentage < 40) return 'bg-health';
        if (percentage < 70) return 'bg-warning';
        return 'bg-stress danger-pulse';
      default:
        return 'bg-primary';
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div className={cn("stat-bar flex-1", size === 'md' ? 'h-2' : 'h-1.5')}>
        <div 
          className={cn("stat-bar-fill", getBarColor())}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs text-muted-foreground font-body min-w-[40px] text-right">
          {value}/{max}
        </span>
      )}
    </div>
  );
}
