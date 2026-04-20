import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Shield, CheckCircle2, AlertCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface ScoreItem {
  label: string;
  earned: boolean;
  points: number;
  tip: string;
}

export function SecurityScoreCard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<ScoreItem[]>([]);

  useEffect(() => {
    if (user) calculate();
  }, [user]);

  const calculate = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [tfaRes, recRes, devRes, actRes, pwdRes] = await Promise.all([
        supabase.from('two_factor_auth' as any).select('is_enabled').eq('user_id', user.id).maybeSingle(),
        supabase.from('recovery_codes' as any).select('id').eq('user_id', user.id).limit(1),
        supabase.from('trusted_devices' as any).select('id').eq('user_id', user.id).limit(1),
        supabase.from('login_activity').select('id').eq('user_id', user.id).eq('status', 'success').limit(1),
        supabase.from('password_change_history').select('changed_at').eq('user_id', user.id).order('changed_at', { ascending: false }).limit(1).maybeSingle(),
      ]);

      const tfaEnabled = !!(tfaRes.data as any)?.is_enabled;
      const hasRecovery = (recRes.data?.length || 0) > 0;
      const hasTrusted = (devRes.data?.length || 0) > 0;
      const hasActivity = (actRes.data?.length || 0) > 0;
      const pwdRecent = pwdRes.data ? (Date.now() - new Date((pwdRes.data as any).changed_at).getTime()) < 90 * 24 * 60 * 60 * 1000 : false;

      setItems([
        { label: 'Two-Factor Authentication', earned: tfaEnabled, points: 40, tip: 'Enable 2FA to gain +40 points' },
        { label: 'Recovery Codes', earned: hasRecovery, points: 20, tip: 'Generate recovery codes to gain +20 points' },
        { label: 'Recent Password Update', earned: pwdRecent, points: 20, tip: 'Update your password to gain +20 points' },
        { label: 'Trusted Devices', earned: hasTrusted, points: 10, tip: 'Configure trusted devices to gain +10 points' },
        { label: 'Active Account', earned: hasActivity, points: 10, tip: 'Recent successful login required' },
      ]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const score = items.reduce((sum, it) => sum + (it.earned ? it.points : 0), 0);
  const colorClass = score >= 80 ? 'text-success' : score >= 50 ? 'text-warning' : 'text-destructive';
  const bgRing = score >= 80 ? 'stroke-success' : score >= 50 ? 'stroke-warning' : 'stroke-destructive';
  const circumference = 2 * Math.PI * 45;
  const dash = (score / 100) * circumference;

  if (loading) {
    return (
      <div className="rounded-xl border border-border/50 bg-card p-5 border-l-[3px] border-l-primary">
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border/50 bg-card p-5 hover:shadow-md transition-all border-l-[3px] border-l-primary">
      <div className="flex items-center gap-3 mb-4">
        <div className="rounded-lg bg-primary/10 p-2"><Shield className="h-5 w-5 text-primary" /></div>
        <div>
          <h3 className="font-semibold">Security Score</h3>
          <p className="text-xs text-muted-foreground">Your account security health</p>
        </div>
      </div>
      <div className="flex items-center gap-6">
        <div className="relative w-28 h-28 shrink-0">
          <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="none" className="stroke-muted" strokeWidth="8" />
            <circle cx="50" cy="50" r="45" fill="none" className={bgRing} strokeWidth="8" strokeLinecap="round" strokeDasharray={`${dash} ${circumference}`} />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center flex-col">
            <span className={`text-2xl font-bold ${colorClass}`}>{score}</span>
            <span className="text-xs text-muted-foreground">/ 100</span>
          </div>
        </div>
        <ul className="flex-1 space-y-1.5 text-sm">
          {items.map((it) => (
            <li key={it.label} className="flex items-start gap-2">
              {it.earned ? (
                <CheckCircle2 className="h-4 w-4 text-success mt-0.5 shrink-0" />
              ) : (
                <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              )}
              <span className={it.earned ? '' : 'text-muted-foreground'}>
                {it.earned ? it.label : it.tip}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
