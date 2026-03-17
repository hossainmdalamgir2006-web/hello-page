import { useRealtimeNotifications } from "@/hooks/useRealtimeNotifications";
import { Loader2, Bell, BellOff, Check, CheckCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

const typeIcons: Record<string, string> = {
  order: "📦",
  promo: "🎉",
  system: "⚙️",
  support: "💬",
};

export default function AccountNotifications() {
  const { notifications, unreadCount, isLoading, markAsRead, markAllAsRead } = useRealtimeNotifications();

  if (isLoading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-4">
      {unreadCount > 0 && (
        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={markAllAsRead}>
            <CheckCheck className="h-4 w-4 mr-1.5" />Mark all as read
          </Button>
        </div>
      )}

      {notifications.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <BellOff className="h-12 w-12 mx-auto mb-3 opacity-40" />
            <p>No notifications yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <Card
              key={n.id}
              className={cn(
                "transition-colors cursor-pointer hover:bg-accent/50",
                !n.is_read && "border-primary/30 bg-primary/5"
              )}
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
