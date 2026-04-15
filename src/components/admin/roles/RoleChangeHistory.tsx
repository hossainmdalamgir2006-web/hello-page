import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { History, ArrowRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface RoleChangeLog {
  id: string;
  user_email: string | null;
  description: string | null;
  old_value: any;
  new_value: any;
  created_at: string;
}

export function RoleChangeHistory() {
  const [logs, setLogs] = useState<RoleChangeLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    const { data } = await supabase
      .from('audit_logs')
      .select('id, user_email, description, old_value, new_value, created_at')
      .eq('resource_type', 'user_role')
      .order('created_at', { ascending: false })
      .limit(10);

    setLogs((data as RoleChangeLog[]) || []);
    setLoading(false);
  };

  const getRoleBadgeColor = (role: string) => {
    const map: Record<string, string> = {
      admin: 'bg-primary text-primary-foreground',
      manager: 'bg-blue-500 text-white',
      support: 'bg-secondary text-secondary-foreground',
      user: 'bg-muted text-muted-foreground',
    };
    return map[role] || map.user;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <History className="h-5 w-5" />
          Role Change History
        </CardTitle>
        <CardDescription>Recent role changes from audit logs</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-sm text-muted-foreground py-4 text-center">Loading...</p>
        ) : logs.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">No role changes recorded yet</p>
        ) : (
          <div className="space-y-3">
            {logs.map((log) => {
              const oldRole = log.old_value?.role || 'unknown';
              const newRole = log.new_value?.role || 'unknown';
              return (
                <div key={log.id} className="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-muted/30">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{log.description || 'Role changed'}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      by {log.user_email || 'Unknown'} • {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge className={`text-xs ${getRoleBadgeColor(oldRole)}`}>{oldRole}</Badge>
                    <ArrowRight className="h-3 w-3 text-muted-foreground" />
                    <Badge className={`text-xs ${getRoleBadgeColor(newRole)}`}>{newRole}</Badge>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
