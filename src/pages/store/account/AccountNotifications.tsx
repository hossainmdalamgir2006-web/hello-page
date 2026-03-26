import { useRealtimeNotifications } from "@/hooks/useRealtimeNotifications";
import { BellOff, CheckCheck } from "lucide-react";
import { SEOHead } from "@/components/SEOHead";
import { DelayedLoader } from "@/components/ui/DelayedLoader";
import { GenericListSkeleton } from "@/components/skeletons";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { useLanguage } from "@/contexts/LanguageContext";

const typeIcons: Record<string, string> = {
  order: "📦", promo: "🎉", system: "⚙️", support: "💬",
};

export default function AccountNotifications() {
  const { notifications, unreadCount, isLoading, markAsRead, markAllAsRead } = useRealtimeNotifications();
  const { t } = useLanguage();

  if (isLoading) {
    return <DelayedLoader><GenericListSkeleton /></DelayedLoader>;
  }

  return (
    <>
    <SEOHead title="Notifications" noIndex />
    <div className="space-y-4">
      {unreadCount > 0 && (
        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={markAllAsRead}>
            <CheckCheck className="h-4 w-4 mr-1.5" />{t('account.markAllRead')}
          </Button>
        </div>
      )}

      {notifications.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <BellOff className="h-12 w-12 mx-auto mb-3 opacity-40" />
            <p>{t('account.noNotifications')}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <Card
              key={n.id}
              className={cn("transition-colors cursor-pointer hover:bg-accent/50", !n.is_read && "border-primary/30 bg-primary/5")}
              onClick={() => !n.is_read && markAsRead(n.id)}
            >
              <CardContent className="flex items-start gap-3 py-3">
                <span className="text-xl mt-0.5">{typeIcons[n.type] || "🔔"}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={cn("text-sm font-medium", !n.is_read && "text-foreground")}>{n.title}</p>
                    {!n.is_read && <div className="h-2 w-2 rounded-full bg-primary shrink-0" />}
                  </div>
                  {n.message && <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>}
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}