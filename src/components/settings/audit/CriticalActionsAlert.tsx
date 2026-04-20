import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, ShieldAlert } from "lucide-react";
import { AuditLogEntry } from "@/hooks/useAuditLog";
import { formatDistanceToNow } from "date-fns";

const CRITICAL_ACTIONS = ["delete", "settings_change", "permission_change", "role_change"];

interface Props {
  logs: AuditLogEntry[];
  onSelect?: (log: AuditLogEntry) => void;
}

export function CriticalActionsAlert({ logs, onSelect }: Props) {
  const criticalLogs = useMemo(() => {
    const cutoff = Date.now() - 24 * 60 * 60 * 1000;
    return logs
      .filter(l => CRITICAL_ACTIONS.includes(l.action) && new Date(l.created_at).getTime() > cutoff)
      .slice(0, 5);
  }, [logs]);

  if (criticalLogs.length === 0) return null;

  return (
    <Card className="border-destructive/40 bg-destructive/5">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-destructive">
          <ShieldAlert className="h-5 w-5" />
          Critical Actions (Last 24h)
          <Badge variant="destructive" className="ml-1">{criticalLogs.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {criticalLogs.map(log => (
          <button
            key={log.id}
            onClick={() => onSelect?.(log)}
            className="w-full flex items-center gap-3 p-2.5 rounded-lg border border-destructive/20 bg-background hover:bg-destructive/10 transition-colors text-left"
          >
            <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="destructive" className="text-[10px]">{log.action.replace(/_/g, " ")}</Badge>
                <span className="text-xs font-medium capitalize">{log.resource_type}</span>
                <span className="text-xs text-muted-foreground">by {log.user_email?.split("@")[0] || "System"}</span>
              </div>
              <p className="text-xs text-muted-foreground truncate mt-0.5">
                {log.description || "—"}
              </p>
            </div>
            <span className="text-[10px] text-muted-foreground shrink-0">
              {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
            </span>
          </button>
        ))}
      </CardContent>
    </Card>
  );
}
