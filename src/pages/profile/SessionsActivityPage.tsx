import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { History, Monitor, Smartphone, Tablet, CheckCircle, XCircle, Globe, Shield, AlertTriangle, Clock, LogOut, RefreshCw, Loader2 } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useSessionManagement } from '@/hooks/useSessionManagement';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();
  const [activities, setActivities] = useState<LoginActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const {
    activeSessions,
    loading: sessionsLoading,
    revokeSession,
    revokeAllOtherSessions,
    refreshSessions,
  } = useSessionManagement();

  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [revokingAll, setRevokingAll] = useState(false);

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

  const handleRevokeSession = async (sessionId: string) => {
    setRevokingId(sessionId);
    const result = await revokeSession(sessionId);
    toast(result.success
      ? { title: 'Session Revoked', description: 'The session has been logged out.' }
      : { variant: 'destructive', title: 'Failed', description: result.error }
    );
    setRevokingId(null);
  };

  const handleRevokeAll = async () => {
    setRevokingAll(true);
    const result = await revokeAllOtherSessions();
    toast(result.success
      ? { title: 'All Other Sessions Revoked', description: 'Logged out from all other devices.' }
      : { variant: 'destructive', title: 'Failed', description: result.error }
    );
    setRevokingAll(false);
  };

  const getDeviceType = (activity: LoginActivityItem): string => {
    const deviceInfo = activity.device_info;
    if (deviceInfo?.device) return deviceInfo.device;
    if (activity.user_agent?.includes('Mobile')) return 'Mobile';
    if (activity.user_agent?.includes('Tablet')) return 'Tablet';
    return 'Desktop';
  };

  const getDeviceIcon = (activity: LoginActivityItem) => {
    const dt = getDeviceType(activity).toLowerCase();
    if (dt.includes('mobile')) return <Smartphone className="h-4 w-4" />;
    if (dt.includes('tablet')) return <Tablet className="h-4 w-4" />;
    return <Monitor className="h-4 w-4" />;
  };

  const parseUA = (ua: string | null) => {
    if (!ua) return { browser: 'Unknown', os: 'Unknown' };
    let browser = 'Unknown', os = 'Unknown';
    if (ua.includes('Firefox')) browser = 'Firefox';
    else if (ua.includes('Chrome')) browser = 'Chrome';
    else if (ua.includes('Safari')) browser = 'Safari';
    else if (ua.includes('Edge')) browser = 'Edge';
    if (ua.includes('Windows')) os = 'Windows';
    else if (ua.includes('Mac')) os = 'macOS';
    else if (ua.includes('Linux')) os = 'Linux';
    else if (ua.includes('Android')) os = 'Android';
    else if (ua.includes('iOS')) os = 'iOS';
    return { browser, os };
  };

  const parseSessionUA = (ua: string | null) => {
    if (!ua) return { device: 'Desktop', browser: 'Unknown', os: 'Unknown' };
    const l = ua.toLowerCase();
    let device = 'Desktop';
    if (l.includes('mobile')) device = 'Mobile';
    else if (l.includes('tablet') || l.includes('ipad')) device = 'Tablet';
    let browser = 'Unknown';
    if (l.includes('chrome')) browser = 'Chrome';
    else if (l.includes('firefox')) browser = 'Firefox';
    else if (l.includes('safari')) browser = 'Safari';
    else if (l.includes('edge')) browser = 'Edge';
    let os = 'Unknown';
    if (l.includes('windows')) os = 'Windows';
    else if (l.includes('mac')) os = 'macOS';
    else if (l.includes('linux')) os = 'Linux';
    else if (l.includes('android')) os = 'Android';
    else if (l.includes('iphone') || l.includes('ipad')) os = 'iOS';
    return { device, browser, os };
  };

  const getSessionDeviceIcon = (ua: string | null) => {
    const { device } = parseSessionUA(ua);
    if (device === 'Mobile') return <Smartphone className="h-5 w-5" />;
    if (device === 'Tablet') return <Tablet className="h-5 w-5" />;
    return <Monitor className="h-5 w-5" />;
  };

  const successCount = activities.filter(a => a.status === 'success').length;
  const failedCount = activities.filter(a => a.status !== 'success').length;
  const otherSessionsCount = activeSessions.filter(s => !s.is_current).length;

  if (isLoading || sessionsLoading) {
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
        {/* Active Sessions */}
        <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
          <div className="flex items-center justify-between p-5 pb-4 border-b border-border/50">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2"><Globe className="h-5 w-5 text-primary" /></div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">Active Sessions</h3>
                  <Badge variant="secondary" className="text-xs">{activeSessions.length}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">Manage sessions across devices</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={refreshSessions}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
          <ScrollArea className="h-[420px]">
            <div className="p-4 space-y-3">
              {activeSessions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Globe className="h-10 w-10 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No active sessions found</p>
                </div>
              ) : (
                <>
                  {activeSessions.map((session) => {
                    const info = parseSessionUA(session.user_agent);
                    return (
                      <div
                        key={session.id}
                        className={cn(
                          "flex items-center justify-between p-3 rounded-lg border transition-colors",
                          session.is_current ? "border-primary/40 bg-primary/5" : "bg-background hover:bg-muted/50"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "p-2 rounded-lg",
                            session.is_current ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                          )}>
                            {getSessionDeviceIcon(session.user_agent)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium">{info.browser} on {info.os}</p>
                              {session.is_current && (
                                <Badge variant="default" className="text-[10px] px-1.5 py-0">
                                  <Shield className="h-3 w-3 mr-1" />This Device
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                              <Clock className="h-3 w-3" />
                              <span>{session.is_current ? 'Active now' : `Last active ${formatDistanceToNow(new Date(session.last_activity_at), { addSuffix: true })}`}</span>
                              <span>• Started {formatDistanceToNow(new Date(session.created_at), { addSuffix: true })}</span>
                            </div>
                          </div>
                        </div>
                        {!session.is_current && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0" disabled={revokingId === session.id}>
                                {revokingId === session.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <><LogOut className="h-4 w-4 mr-1" />Log out</>}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Log out this session?</AlertDialogTitle>
                                <AlertDialogDescription>This will immediately log out the session on {info.browser} on {info.os}.</AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleRevokeSession(session.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Log out session</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    );
                  })}
                  {otherSessionsCount > 0 && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" className="w-full text-destructive hover:text-destructive mt-2" disabled={revokingAll}>
                          {revokingAll
                            ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Logging out...</>
                            : <><LogOut className="mr-2 h-4 w-4" />Log out all other sessions ({otherSessionsCount})</>}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Log out all other sessions?</AlertDialogTitle>
                          <AlertDialogDescription>This will immediately log out all sessions except the current one.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={handleRevokeAll} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Log out all</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </>
              )}
            </div>
          </ScrollArea>
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
                const { browser, os } = parseUA(activity.user_agent);
                const successful = activity.status === 'success';
                const locationStr = typeof activity.location === 'object' && activity.location
                  ? activity.location.city || activity.location.country || '' : '';
                return (
                  <div key={activity.id} className={cn(
                    "flex items-start gap-3 p-3 rounded-lg border transition-colors",
                    successful ? "bg-background hover:bg-muted/50" : "bg-destructive/5 border-destructive/20"
                  )}>
                    <div className={cn("p-1.5 rounded-full shrink-0", successful ? "bg-success/10" : "bg-destructive/10")}>
                      {successful ? <CheckCircle className="h-4 w-4 text-success" /> : <XCircle className="h-4 w-4 text-destructive" />}
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
                      {!successful && activity.failure_reason && <p className="text-xs text-destructive mt-1">{activity.failure_reason}</p>}
                      {activity.ip_address && (
                        <p className="text-xs text-muted-foreground mt-1">IP: {activity.ip_address.toString()}{locationStr && ` • ${locationStr}`}</p>
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
