import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Clock, Package, Truck, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { type Order, type OrderStatus } from "@/hooks/useOrdersData";
import { format } from "date-fns";

const columns: { key: OrderStatus; label: string; icon: React.ElementType; color: string }[] = [
  { key: "pending", label: "Pending", icon: Clock, color: "border-t-warning" },
  { key: "processing", label: "Processing", icon: Package, color: "border-t-accent" },
  { key: "shipped", label: "Shipped", icon: Truck, color: "border-t-chart-5" },
  { key: "delivered", label: "Delivered", icon: CheckCircle2, color: "border-t-success" },
  { key: "cancelled", label: "Cancelled", icon: XCircle, color: "border-t-destructive" },
];

interface OrderKanbanViewProps {
  orders: Order[];
  onViewDetails: (order: Order) => void;
  onUpdateStatus: (orderId: string, status: OrderStatus) => void;
}

export function OrderKanbanView({ orders, onViewDetails, onUpdateStatus }: OrderKanbanViewProps) {
  const grouped = useMemo(() => {
    const map: Record<OrderStatus, Order[]> = {
      pending: [], processing: [], shipped: [], delivered: [], cancelled: [],
    };
    orders.forEach((o) => {
      if (map[o.status]) map[o.status].push(o);
    });
    return map;
  }, [orders]);

  return (
    <ScrollArea className="w-full">
      <div className="flex gap-4 pb-4 min-w-[1100px]">
        {columns.map((col) => {
          const items = grouped[col.key];
          const Icon = col.icon;
          return (
            <div key={col.key} className="flex-1 min-w-[210px]">
              <div className={cn("rounded-lg border border-t-4 bg-card", col.color)}>
                <div className="flex items-center gap-2 p-3 border-b">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium text-sm">{col.label}</span>
                  <Badge variant="secondary" className="ml-auto text-xs">{items.length}</Badge>
                </div>
                <div className="p-2 space-y-2 max-h-[60vh] overflow-y-auto">
                  {items.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-6">No orders</p>
                  ) : (
                    items.slice(0, 20).map((order) => (
                      <Card
                        key={order.id}
                        className="cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => onViewDetails(order)}
                      >
                        <CardContent className="p-3 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-mono font-bold text-primary">{order.order_number}</span>
                            <span className="text-xs text-muted-foreground">৳{order.total.toLocaleString()}</span>
                          </div>
                          <p className="text-sm font-medium truncate">{order.customer_name}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] text-muted-foreground">
                              {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                            </span>
                            <span className="text-[11px] text-muted-foreground">
                              {format(new Date(order.created_at), "dd MMM")}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
