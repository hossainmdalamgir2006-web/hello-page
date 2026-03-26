import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { RotateCcw, Clock, CheckCircle2, XCircle, DollarSign } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/formatPrice";

interface RecentReturn {
  id: string;
  reason: string;
  status: string;
  created_at: string;
  order_number: string;
  customer_name: string;
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: "Pending", color: "bg-warning/10 text-warning border-warning/20", icon: Clock },
  approved: { label: "Approved", color: "bg-success/10 text-success border-success/20", icon: CheckCircle2 },
  rejected: { label: "Rejected", color: "bg-destructive/10 text-destructive border-destructive/20", icon: XCircle },
  completed: { label: "Completed", color: "bg-primary/10 text-primary border-primary/20", icon: RotateCcw },
};

export function RecentReturnRequests({ loading: externalLoading }: { loading?: boolean }) {
  const [returns, setReturns] = useState<RecentReturn[]>([]);
  const [stats, setStats] = useState({ pending: 0, completed: 0, totalRefunded: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      setLoading(true);
      // Fetch latest 5 return requests
      const { data: rr } = await supabase
        .from('return_requests')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      const enriched: RecentReturn[] = [];
      for (const r of (rr || [])) {
        let order_number = '';
        let customer_name = '';
        if (r.order_id) {
          const { data: order } = await supabase
            .from('orders')
            .select('order_number, customer_id')
            .eq('id', r.order_id)
            .maybeSingle();
          if (order) {
            order_number = (order as any).order_number || '';
            if ((order as any).customer_id) {
              const { data: c } = await supabase
                .from('customers')
                .select('full_name')
                .eq('id', (order as any).customer_id)
                .maybeSingle();
              customer_name = (c as any)?.full_name || '';
            }
          }
        }
        enriched.push({ id: r.id, reason: r.reason, status: r.status, created_at: r.created_at, order_number, customer_name });
      }
      setReturns(enriched);

      // Pending count
      const { count: pendingCount } = await supabase
        .from('return_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      // Completed count
      const { count: completedCount } = await supabase
        .from('return_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed');

      // Total refunded
      const { data: refunded } = await supabase
        .from('orders' as any)
        .select('refund_amount')
        .eq('refund_status', 'refunded');

      const totalRefunded = ((refunded as any[]) || []).reduce((sum, o) => sum + Number(o.refund_amount || 0), 0);

      setStats({ pending: pendingCount || 0, completed: completedCount || 0, totalRefunded });
      setLoading(false);
    }
    fetch();
  }, []);

  if (loading || externalLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-14" />)}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Mini stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-warning/10 border border-warning/20">
          <Clock className="h-4 w-4 text-warning" />
          <div>
            <p className="text-lg font-bold">{stats.pending}</p>
            <p className="text-xs text-muted-foreground">Pending</p>
          </div>
        </div>
        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-success/10 border border-success/20">
          <CheckCircle2 className="h-4 w-4 text-success" />
          <div>
            <p className="text-lg font-bold">{stats.completed}</p>
            <p className="text-xs text-muted-foreground">Completed</p>
          </div>
        </div>
        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-chart-5/10 border border-chart-5/20">
          <DollarSign className="h-4 w-4 text-chart-5" />
          <div>
            <p className="text-lg font-bold">{formatPrice(stats.totalRefunded)}</p>
            <p className="text-xs text-muted-foreground">Refunded</p>
          </div>
        </div>
      </div>

      {returns.length === 0 ? (
        <p className="text-center text-sm text-muted-foreground py-4">No return requests yet</p>
      ) : (
        <div className="space-y-2">
          {returns.map((r) => {
            const sc = statusConfig[r.status] || statusConfig.pending;
            return (
              <div key={r.id} className="flex items-center justify-between gap-2 p-2.5 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium truncate">{r.customer_name || "Unknown"}</p>
                    {r.order_number && (
                      <span className="text-xs text-muted-foreground">#{r.order_number}</span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{r.reason}</p>
                  <p className="text-xs text-muted-foreground">{format(new Date(r.created_at), "MMM dd, HH:mm")}</p>
                </div>
                <Badge variant="outline" className={cn("text-xs shrink-0", sc.color)}>
                  <sc.icon className="h-3 w-3 mr-1" />
                  {sc.label}
                </Badge>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
