import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, ShieldCheck, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

interface Alert {
  id: string;
  type: 'failed' | 'lockout' | 'new_device';
  message: string;
  created_at: string;
}

export function ActiveSecurityAlerts() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    if (user) load();
  }, [user]);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const [failedRes, lockRes] = await Promise.all([
        supabase.from('login_activity').select('id, created_at, ip_address').eq('user_id', user.id).eq('status', 'failed').gte('created_at', sevenDaysAgo).order('created_at', { ascending: false }).limit(5),
        supabase.from('account_lockouts').select('id, created_at, reason').eq('email', user.email || '').gte('created_at', sevenDaysAgo).order('created_at', { ascending: false }).limit(3),
      ]);

      const list: Alert[] = [];
      (failedRes.data || []).forEach((f: any) => list.push({ id: f.id, type: 'failed', message: `Failed login attempt${f.ip_address ? ` from ${f.ip_address}` : ''}`, created_at: f.created_at }));
      (lockRes.data || []).forEach((l: any) => list.push({ id: l.id, type: 'lockout', message: `Account locked: ${l.reason || 'security policy'}`, created_at: l.created_at }));
      list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setAlerts(list.slice(0, 5));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-border/50 bg-card p-5 hover:shadow-md transition-all border-l-[3px] border-l-warning">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-warning/10 p-2"><AlertTriangle className="h-5 w-5 text-warning" /></div>
          <div>
            <h3 className="font-semibold">Active Security Alerts</h3>
            <p className="text-xs text-muted-foreground">Suspicious activity in last 7 days</p>
          </div>
        </div>
        {alerts.length > 0 && (
          <Button variant="ghost" size="sm" onClick={() => navigate('/admin/account-settings/login-activity')}>
            Review <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        )}
      </div>
      {loading ? (
        <Skeleton className="h-20 w-full" />
      ) : alerts.length === 0 ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground py-3">
          <ShieldCheck className="h-4 w-4 text-success" />
          No suspicious activity detected
        </div>
      ) : (
        <ul className="space-y-2">
          {alerts.map((a) => (
            <li key={a.id} className="flex items-start justify-between gap-3 p-2 rounded-md bg-warning/5">
              <div className="flex-1 min-w-0">
                <p className="text-sm">{a.message}</p>
                <p className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(a.created_at), { addSuffix: true })}</p>
              </div>
              <Badge variant="outline" className="text-xs">{a.type === 'failed' ? 'Failed' : a.type === 'lockout' ? 'Lockout' : 'New'}</Badge>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
