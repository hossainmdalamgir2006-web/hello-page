import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { History, Monitor, Smartphone, Tablet, CheckCircle, XCircle, Shield, AlertTriangle } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { cn } from '@/lib/utils';
import { SessionManagement } from '@/components/profile/SessionManagement';

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
        <div className="grid gap-4 sm:grid-cols-3">{[1, 2, 3].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}</div>
        <div className="grid gap-6 lg:grid-cols-2"><Skeleton className="h-96 rounded-xl" /><Skeleton className="h-96 rounded-xl" /></div>
      </div>
    );
  }

  const statsCards = [
    { label: "Total Logins", value: activities.length, icon: History, color: "primary" as const },
    { label: "Successful", value: successCount, icon: CheckCircle, color: "success" as const },
    { label: "Failed", value: failedCount, icon: AlertTriangle, color: "destructive" as const },
  ];

  const borderMap = { primary: "border-l-primary", success: "border-l-success", destructive: "border-l-destructive" };
  const bgMap = { primary: "bg-primary/10", success: "bg-success/10", destructive: "bg-destructive/10" };
  const textMap = { primary: "text-primary", success: "text-success", destructive: "text-destructive" };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground tracking-tight">Login Activity</h1>
        <p className="text-sm text-muted-foreground">Recent login attempts and active sessions on your account</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        {statsCards.map((card) => {
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

      {/* 2-Column: Active Sessions left, Login History right */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Active Sessions — SessionManagement has its own Card */}
        <div>
          <SessionManagement />
        </div>

        {/* Login History */}
        <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
          <div className="flex items-center gap-3 p-5 pb-4 border-b border-border/50">
            <div className="rounded-lg bg-success/10 p-2"><History className="h-5 w-5 text-success" /></div>
            <div>
              <h3 className="font-semibold">Login History</h3>
              <p className="text-xs text-muted-foreground">{activities.length} total login attempts</p>
            </div>
          </div>
          <ScrollArea className="h-[420px]">
            <div className="p-4 space-y-3">
              {activities.map((activity) => {
                const { browser, os } = parseUserAgent(activity.user_agent);
                const successful = activity.status === 'success';
                const locationStr = typeof activity.location === 'object' && activity.location
                  ? activity.location.city || activity.location.country || ''
                  : '';
                return (
                  <div key={activity.id} className={cn(
                    "flex items-start gap-3 p-3 rounded-lg border transition-colors",
                    successful ? "bg-background hover:bg-muted/50" : "bg-destructive/5 border-destructive/20"
                  )}>
                    <div className={cn("p-1.5 rounded-full shrink-0", successful ? "bg-success/10" : "bg-destructive/10")}>
                      {successful
                        ? <CheckCircle className="h-4 w-4 text-success" />
                        : <XCircle className="h-4 w-4 text-destructive" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium">{successful ? 'Successful login' : 'Failed login'}</span>
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">{getDeviceType(activity)}</Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        {getDeviceIcon(activity)}
                        <span>{browser} on {os}</span>
                      </div>
                      {!successful && activity.failure_reason && (
                        <p className="text-xs text-destructive mt-1">{activity.failure_reason}</p>
                      )}
                      {activity.ip_address && (
                        <p className="text-xs text-muted-foreground mt-1">
                          IP: {activity.ip_address.toString()}{locationStr && ` • ${locationStr}`}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                        <span className="mx-1">•</span>
                        {format(new Date(activity.created_at), 'MMM d, yyyy h:mm a')}
                      </p>
                    </div>
                  </div>
                );
              })}
              {activities.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <History className="h-10 w-10 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No login activity recorded</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
