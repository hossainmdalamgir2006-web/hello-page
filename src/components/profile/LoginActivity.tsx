import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { History, Monitor, Smartphone, Tablet, CheckCircle, XCircle, Clock, Search, Download, Sparkles, ShieldAlert } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';

interface LoginActivityItem {
  id: string;
  user_id: string | null;
  email: string | null;
  ip_address: string | null;
  user_agent: string | null;
  device_info: any;
  location: any;
  status: string;
  failure_reason: string | null;
  created_at: string;
}

type FilterType = 'all' | 'success' | 'failed' | '7d' | '30d';

export function LoginActivity() {
  const { user } = useAuth();
  const [activities, setActivities] = useState<LoginActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (user) fetchLoginActivity();
  }, [user]);

  const fetchLoginActivity = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('login_activity')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(200);
      if (error) throw error;
      setActivities((data || []) as LoginActivityItem[]);
    } catch (e) {
      console.error('Error fetching login activity:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const parseUserAgent = (ua: string | null) => {
    if (!ua) return { browser: 'Unknown', os: 'Unknown' };
    let browser = 'Unknown', os = 'Unknown';
    if (ua.includes('Firefox')) browser = 'Firefox';
    else if (ua.includes('Edge')) browser = 'Edge';
    else if (ua.includes('Chrome')) browser = 'Chrome';
    else if (ua.includes('Safari')) browser = 'Safari';
    if (ua.includes('Windows')) os = 'Windows';
    else if (ua.includes('Mac')) os = 'macOS';
    else if (ua.includes('Linux')) os = 'Linux';
    else if (ua.includes('Android')) os = 'Android';
    else if (ua.includes('iPhone') || ua.includes('iOS')) os = 'iOS';
    return { browser, os };
  };

  const getDeviceType = (a: LoginActivityItem) => {
    if (a.device_info?.device) return a.device_info.device;
    if (a.user_agent?.includes('Mobile')) return 'Mobile';
    if (a.user_agent?.includes('Tablet')) return 'Tablet';
    return 'Desktop';
  };

  const getDeviceIcon = (a: LoginActivityItem) => {
    const dt = getDeviceType(a).toLowerCase();
    if (dt.includes('mobile')) return <Smartphone className="h-4 w-4" />;
    if (dt.includes('tablet')) return <Tablet className="h-4 w-4" />;
    return <Monitor className="h-4 w-4" />;
  };

  // Detect new device: this IP+UA combo first seen in last 24h
  const knownSignatures = useMemo(() => {
    const sigs = new Map<string, string>();
    [...activities].reverse().forEach((a) => {
      const sig = `${a.ip_address || ''}|${a.user_agent || ''}`;
      if (!sigs.has(sig)) sigs.set(sig, a.created_at);
    });
    return sigs;
  }, [activities]);

  // Suspicious: 5+ failed in 1 hour
  const suspiciousIds = useMemo(() => {
    const suspicious = new Set<string>();
    const failed = activities.filter((a) => a.status === 'failed');
    failed.forEach((a) => {
      const t = new Date(a.created_at).getTime();
      const cluster = failed.filter((b) => {
        const tb = new Date(b.created_at).getTime();
        return Math.abs(tb - t) <= 3600000;
      });
      if (cluster.length >= 5) cluster.forEach((c) => suspicious.add(c.id));
    });
    return suspicious;
  }, [activities]);

  const filtered = useMemo(() => {
    let list = activities;
    if (filter === 'success') list = list.filter((a) => a.status === 'success');
    else if (filter === 'failed') list = list.filter((a) => a.status === 'failed');
    else if (filter === '7d') {
      const cutoff = Date.now() - 7 * 86400000;
      list = list.filter((a) => new Date(a.created_at).getTime() >= cutoff);
    } else if (filter === '30d') {
      const cutoff = Date.now() - 30 * 86400000;
      list = list.filter((a) => new Date(a.created_at).getTime() >= cutoff);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((a) =>
        (a.ip_address || '').toLowerCase().includes(q) ||
        (a.user_agent || '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [activities, filter, search]);

  const exportCSV = () => {
    const headers = ['Date', 'Status', 'Device', 'Browser', 'OS', 'IP Address', 'Location'];
    const rows = filtered.map((a) => {
      const { browser, os } = parseUserAgent(a.user_agent);
      const loc = typeof a.location === 'object' && a.location ? (a.location.city || a.location.country || '') : (a.location || '');
      return [
        format(new Date(a.created_at), 'yyyy-MM-dd HH:mm:ss'),
        a.status,
        getDeviceType(a),
        browser,
        os,
        a.ip_address || '',
        String(loc),
      ].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',');
    });
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `login-activity-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader><Skeleton className="h-6 w-40" /><Skeleton className="h-4 w-60 mt-2" /></CardHeader>
        <CardContent>
          <div className="space-y-4">{[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2"><Skeleton className="h-4 w-32" /><Skeleton className="h-3 w-48" /></div>
            </div>
          ))}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <CardTitle className="flex items-center gap-2"><History className="h-5 w-5" />Login Activity</CardTitle>
            <CardDescription>Recent login attempts and activity on your account</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={exportCSV} disabled={filtered.length === 0}>
            <Download className="h-4 w-4 mr-2" />Export CSV
          </Button>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 mt-4">
          <Tabs value={filter} onValueChange={(v) => setFilter(v as FilterType)} className="w-full sm:w-auto">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="success">Successful</TabsTrigger>
              <TabsTrigger value="failed">Failed</TabsTrigger>
              <TabsTrigger value="7d">7 days</TabsTrigger>
              <TabsTrigger value="30d">30 days</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search by IP or device..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filtered.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No matching activity</p>
          </div>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4">
              {filtered.map((activity) => {
                const { browser, os } = parseUserAgent(activity.user_agent);
                const successful = activity.status === 'success';
                const sig = `${activity.ip_address || ''}|${activity.user_agent || ''}`;
                const firstSeen = knownSignatures.get(sig);
                const isNew = firstSeen === activity.created_at && (Date.now() - new Date(firstSeen).getTime()) < 7 * 86400000;
                const isSuspicious = suspiciousIds.has(activity.id);
                const locationStr = typeof activity.location === 'object' && activity.location ? (activity.location.city || activity.location.country || '') : (activity.location || '');
                return (
                  <div key={activity.id} className={`flex items-start gap-4 p-3 rounded-lg border ${successful ? 'bg-background hover:bg-muted/50' : 'bg-destructive/5 border-destructive/20'}`}>
                    <div className={`p-2 rounded-full ${successful ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                      {successful ? <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" /> : <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium">{successful ? 'Successful login' : 'Failed login attempt'}</span>
                        <Badge variant="outline" className="text-xs">{getDeviceType(activity)}</Badge>
                        {isNew && <Badge className="text-xs bg-primary/10 text-primary border-primary/20"><Sparkles className="h-3 w-3 mr-1" />New device</Badge>}
                        {isSuspicious && <Badge variant="destructive" className="text-xs"><ShieldAlert className="h-3 w-3 mr-1" />Suspicious</Badge>}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        {getDeviceIcon(activity)}<span>{browser} on {os}</span>
                      </div>
                      {activity.ip_address && (
                        <p className="text-xs text-muted-foreground mt-1">
                          IP: {activity.ip_address.toString()}{locationStr && ` • ${locationStr}`}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">
                        {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                        <span className="mx-1">•</span>
                        {format(new Date(activity.created_at), 'MMM d, yyyy h:mm a')}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
