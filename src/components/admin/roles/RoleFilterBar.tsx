import { Button } from '@/components/ui/button';
import { User, ShieldCheck, Shield, Crown, Users } from 'lucide-react';

type AppRole = 'user' | 'admin' | 'manager' | 'support';
type FilterValue = 'all' | AppRole;

interface RoleFilterBarProps {
  activeFilter: FilterValue;
  onFilterChange: (filter: FilterValue) => void;
  counts: Record<AppRole, number>;
}

const filters: { value: FilterValue; label: string; icon: React.ReactNode }[] = [
  { value: 'all', label: 'All', icon: <Users className="h-4 w-4" /> },
  { value: 'user', label: 'User', icon: <User className="h-4 w-4" /> },
  { value: 'support', label: 'Support', icon: <ShieldCheck className="h-4 w-4" /> },
  { value: 'manager', label: 'Manager', icon: <Shield className="h-4 w-4" /> },
  { value: 'admin', label: 'Admin', icon: <Crown className="h-4 w-4" /> },
];

export function RoleFilterBar({ activeFilter, onFilterChange, counts }: RoleFilterBarProps) {
  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <div className="flex flex-wrap gap-2">
      {filters.map((f) => {
        const count = f.value === 'all' ? total : counts[f.value as AppRole];
        const isActive = activeFilter === f.value;
        return (
          <Button
            key={f.value}
            variant={isActive ? 'default' : 'outline'}
            size="sm"
            onClick={() => onFilterChange(f.value)}
            className="gap-1.5"
          >
            {f.icon}
            {f.label}
            <span className={`ml-1 text-xs rounded-full px-1.5 py-0.5 ${isActive ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
              {count}
            </span>
          </Button>
        );
      })}
    </div>
  );
}
