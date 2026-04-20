import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Loader2, Inbox } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface NotificationRow {
  id: string;
  type: string;
  title: string;
  message: string | null;
  is_read: boolean | null;
  created_at: string;
}

export function RecentNotificationActivity() {
  const [items, setItems] = useState<NotificationRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data, error } = await supabase
          .from("notifications")
          .select("id, type, title, message, is_read, created_at")
          .order("created_at", { ascending: false })
          .limit(20);
        if (error) throw error;
        setItems((data as NotificationRow[]) || []);
      } catch (e) {
        console.error("Failed to load notifications:", e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-accent" />
          Recent Activity
          <Badge variant="secondary" className="ml-auto">Last 20</Badge>
        </CardTitle>
        <CardDescription>Latest notifications dispatched across the system</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Inbox className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No recent notifications</p>
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((n) => (
              <div key={n.id} className="flex items-start justify-between gap-3 rounded-lg border border-border p-3 hover:bg-muted/30 transition-colors">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className="text-[10px] uppercase">{n.type}</Badge>
                    <p className="font-medium text-sm truncate">{n.title}</p>
                    {n.is_read ? (
                      <Badge variant="secondary" className="text-[10px]">Read</Badge>
                    ) : (
                      <Badge variant="default" className="text-[10px]">New</Badge>
                    )}
                  </div>
                  {n.message && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{n.message}</p>
                  )}
                </div>
                <span className="text-xs text-muted-foreground shrink-0 whitespace-nowrap">
                  {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
