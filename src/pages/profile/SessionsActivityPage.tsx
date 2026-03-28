import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { History, Monitor, Smartphone, Tablet, CheckCircle, XCircle, Clock, Shield, AlertTriangle } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { cn } from '@/lib/utils';

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

export default function SessionsActivityPage() {
  const { user } = useAuth();
  const [activities, setActivities] = useState<LoginActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) fetchActivities();
  }, [user]);

  const fetchActivities = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('login_activity')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);
      if (!error && data) setActivities(data as LoginActivityItem[]);
    } catch (err) {
      console.error('Error fetching login activity:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getDeviceType = (activity: LoginActivityItem): string => {
    const deviceInfo = activity.device_info;
    if (deviceInfo?.device) return deviceInfo.device;
    if (activity.user_agent?.includes('Mobile')) return 'Mobile';
    if (activity.user_agent?.includes('Tablet')) return 'Tablet';
    return 'Desktop';
  };

  const getDeviceIcon = (activity: LoginActivityItem) => {
    const deviceType = getDeviceType(activity).toLowerCase();
    if (deviceType.includes('mobile')) return <Smartphone className="h-4 w-4" />;
    if (deviceType.includes('tablet')) return <Tablet className="h-4 w-4" />;
    return <Monitor className="h-4 w-4" />;
  };

  const parseUserAgent = (userAgent: string | null) => {
    if (!userAgent) return { browser: 'Unknown', os: 'Unknown' };
    let browser = 'Unknown';
    let os = 'Unknown';
    if (userAgent.includes('Firefox')) browser = 'Firefox';
    else if (userAgent.includes('Chrome')) browser = 'Chrome';
    else if (userAgent.includes('Safari')) browser = 'Safari';
    else if (userAgent.includes('Edge')) browser = 'Edge';
    if (userAgent.includes('Windows')) os = 'Windows';
    else if (userAgent.includes('Mac')) os = 'macOS';
    else if (userAgent.includes('Linux')) os = 'Linux';
    else if (userAgent.includes('Android')) os = 'Android';
    else if (userAgent.includes('iOS')) os = 'iOS';
    return { browser, os };
  };

  const successCount = activities.filter(a => a.status === 'success').length;
  const failedCount = activities.filter(a => a.status !== 'success').length;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div><Skeleton className="h-8 w-48" /><Skeleton className="h-4 w-60 mt-2" /></div>
        <div className="grid gap-4 sm:grid-cols-3">{[1,2,3].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}</div>
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground tracking-tight">Login Activity</h1>
        <p className="text-sm text-muted-foreground">Recent login attempts and activity on your account</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Total Logins", value: activities.length, icon: History, color: "primary" },
          { label: "Successful", value: successCount, icon: CheckCircle, color: "success" },
          { label: "Failed", value: failedCount, icon: AlertTriangle, color: "destructive" },
        ].map((card) => {
          const borderMap: Record<string, string> = { primary: "border-l-primary", success: "border-l-success", destructive: "border-l-destructive" };
          const bgMap: Record<string, string> = { primary: "bg-primary/10", success: "bg-success/10", destructive: "bg-destructive/10" };
          const textMap: Record<string, string> = { primary: "text-primary", success: "text-success", destructive: "text-destructive" };
          const IconComp = card.icon;
          return (
            <div key={card.label} className={cn(
              "group relative rounded-xl border border-border/50 bg-card p-4 sm:p-5 transition-all duration-300",
              "hover:shadow-md hover:border-border hover:-translate-y-0.5 border-l-[3px]",
              borderMap[card.color], "animate-fade-in"
            )}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{card.label}</p>
                  <p className="text-lg sm:text-xl font-bold tracking-tight mt-1">{card.value}</p>
                </div>
                <div className={cn("rounded-lg p-2", bgMap[card.color])}>
                  <IconComp className={cn("h-5 w-5", textMap[card.color])} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 2-Column Activity List */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Successful Logins */}
        <div className="rounded-xl border border-border/50 bg-card p-5 border-l-[3px] border-l-success">
          <div className="flex items-center gap-3 mb-4">
            <div className="rounded-lg bg-success/10 p-2"><Shield className="h-5 w-5 text-success" /></div>
            <div>
              <h3 className="font-semibold">Successful Logins</h3>
              <p className="text-xs text-muted-foreground">{successCount} successful attempts</p>
            </div>
          </div>
          <ScrollArea className="h-[400px] pr-2">
            <div className="space-y-3">
              {activities.filter(a => a.status === 'success').map((activity) => {
                const { browser, os } = parseUserAgent(activity.user_agent);
                const locationStr = typeof activity.location === 'object' && activity.location ? activity.location.city || activity.location.country || '' : '';
                return (
                  <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg border bg-background hover:bg-muted/50">
                    <div className="p-2 rounded-full bg-success/10">
                      <CheckCircle className="h-4 w-4 text-success" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium">Successful login</span>
                        <Badge variant="outline" className="text-xs">{getDeviceType(activity)}</Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        {getDeviceIcon(activity)}
                        <span>{browser} on {os}</span>
                      </div>
                      {activity.ip_address && (
                        <p className="text-xs text-muted-foreground mt-1">IP: {activity.ip_address.toString()}{locationStr && ` • ${locationStr}`}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })} • {format(new Date(activity.created_at), 'MMM d, yyyy h:mm a')}
                      </p>
                    </div>
                  </div>
                );
              })}
              {successCount === 0 && <p className="text-sm text-muted-foreground text-center py-6">No successful logins</p>}
            </div>
          </ScrollArea>
        </div>

        {/* Failed Logins */}
        <div className="rounded-xl border border-border/50 bg-card p-5 border-l-[3px] border-l-destructive">
          <div className="flex items-center gap-3 mb-4">
            <div className="rounded-lg bg-destructive/10 p-2"><AlertTriangle className="h-5 w-5 text-destructive" /></div>
            <div>
              <h3 className="font-semibold">Failed Attempts</h3>
              <p className="text-xs text-muted-foreground">{failedCount} failed attempts</p>
            </div>
          </div>
          <ScrollArea className="h-[400px] pr-2">
            <div className="space-y-3">
              {activities.filter(a => a.status !== 'success').map((activity) => {
                const { browser, os } = parseUserAgent(activity.user_agent);
                const locationStr = typeof activity.location === 'object' && activity.location ? activity.location.city || activity.location.country || '' : '';
                return (
                  <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg border bg-destructive/5 border-destructive/20">
                    <div className="p-2 rounded-full bg-destructive/10">
                      <XCircle className="h-4 w-4 text-destructive" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium">Failed login</span>
                        <Badge variant="outline" className="text-xs">{getDeviceType(activity)}</Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        {getDeviceIcon(activity)}
                        <span>{browser} on {os}</span>
                      </div>
                      {activity.failure_reason && <p className="text-xs text-destructive mt-1">{activity.failure_reason}</p>}
                      {activity.ip_address && (
                        <p className="text-xs text-muted-foreground mt-1">IP: {activity.ip_address.toString()}{locationStr && ` • ${locationStr}`}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })} • {format(new Date(activity.created_at), 'MMM d, yyyy h:mm a')}
                      </p>
                    </div>
                  </div>
                );
              })}
              {failedCount === 0 && <p className="text-sm text-muted-foreground text-center py-6">No failed attempts — great!</p>}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
