import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { SEOHead } from "@/components/SEOHead";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Package, CheckCircle2, Truck, MapPin, Clock, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface OrderTrackingData {
  id: string;
  order_number: string;
  status: string;
  created_at: string;
  shipped_at: string | null;
  tracking_number: string | null;
  tracking_events: { status: string; created_at: string; description: string | null; location: string | null }[];
}

export default function AccountOrderTracking() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [orders, setOrders] = useState<OrderTrackingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const STEPS = [
    { key: "pending", label: t('account.orderPlaced'), icon: Package },
    { key: "processing", label: t('account.confirmed'), icon: CheckCircle2 },
    { key: "shipped", label: t('account.shipped'), icon: Truck },
    { key: "delivered", label: t('account.delivered'), icon: MapPin },
  ];

  const getStepIndex = (status: string) => {
    const map: Record<string, number> = { pending: 0, processing: 1, shipped: 2, delivered: 3, cancelled: -1 };
    return map[status] ?? 0;
  };

  useEffect(() => {
    if (!user) return;
    const fetchOrders = async () => {
      setLoading(true);
      const { data: customerData } = await supabase
        .from("customers").select("id").eq("user_id", user.id).maybeSingle();
      if (!customerData) { setLoading(false); return; }
      const { data: ordersData } = await supabase
        .from("orders")
        .select("id, order_number, status, created_at, shipped_at, tracking_number")
        .eq("customer_id", customerData.id)
        .order("created_at", { ascending: false });
      if (ordersData) {
        const withTracking = await Promise.all(
          ordersData.map(async (o) => {
            const { data: events } = await supabase
              .from("order_tracking")
              .select("status, created_at, description, location")
              .eq("order_id", o.id)
              .order("created_at", { ascending: true });
            return { ...o, tracking_events: events || [] } as OrderTrackingData;
          })
        );
        setOrders(withTracking);
      }
      setLoading(false);
    };
    fetchOrders();
  }, [user]);

  const filtered = orders.filter(
    (o) =>
      o.order_number.toLowerCase().includes(search.toLowerCase()) ||
      o.tracking_number?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <>
    <SEOHead title="Order Tracking" noIndex />
    <div className="space-y-6">
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder={t('account.searchByOrder')} value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Package className="h-12 w-12 mx-auto mb-3 opacity-40" />
            <p>{t('account.noOrdersToTrack')}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filtered.map((order) => {
            const stepIdx = getStepIndex(order.status);
            const isCancelled = order.status === "cancelled";
            return (
              <Card key={order.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <CardTitle className="text-base font-semibold">#{order.order_number}</CardTitle>
                    <div className="flex items-center gap-2">
                      {order.tracking_number && (
                        <Badge variant="outline" className="text-xs">
                          {t('account.tracking')}: {order.tracking_number}
                        </Badge>
                      )}
                      <Badge variant={isCancelled ? "destructive" : stepIdx >= 3 ? "default" : "secondary"}>
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t('account.placed')} {format(new Date(order.created_at), "MMM dd, yyyy")}
                  </p>
                </CardHeader>
                <CardContent>
                  {isCancelled ? (
                    <p className="text-sm text-destructive font-medium">{t('account.orderCancelled')}</p>
                  ) : (
                    <>
                      <div className="flex items-center justify-between mb-6">
                        {STEPS.map((step, i) => {
                          const completed = i <= stepIdx;
                          const current = i === stepIdx;
                          return (
                            <div key={step.key} className="flex flex-col items-center flex-1 relative">
                              {i > 0 && (
                                <div className={cn("absolute top-4 right-1/2 w-full h-0.5 -z-10", i <= stepIdx ? "bg-primary" : "bg-border")} />
                              )}
                              <div className={cn(
                                "h-8 w-8 rounded-full flex items-center justify-center border-2 transition-all",
                                completed ? "bg-primary border-primary text-primary-foreground" : "bg-background border-border text-muted-foreground",
                                current && "ring-4 ring-primary/20"
                              )}>
                                <step.icon className="h-4 w-4" />
                              </div>
                              <span className={cn("text-[11px] mt-1.5 font-medium text-center", completed ? "text-foreground" : "text-muted-foreground")}>
                                {step.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                      {order.tracking_events.length > 0 && (
                        <div className="border-t border-border pt-4 space-y-2">
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                            {t('account.trackingUpdates')}
                          </p>
                          {order.tracking_events.map((ev, i) => (
                            <div key={i} className="flex items-start gap-3 text-sm">
                              <Clock className="h-3.5 w-3.5 mt-0.5 text-muted-foreground shrink-0" />
                              <div>
                                <p className="font-medium capitalize">{ev.status}</p>
                                {ev.description && <p className="text-xs text-muted-foreground">{ev.description}</p>}
                                <p className="text-xs text-muted-foreground">
                                  {format(new Date(ev.created_at), "MMM dd, HH:mm")}
                                  {ev.location && ` · ${ev.location}`}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
    </>
  );
}
