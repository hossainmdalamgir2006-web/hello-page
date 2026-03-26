import { Card, CardContent } from "@/components/ui/card";
import { ShoppingBag, Clock, Package, Truck, TrendingUp } from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";

interface OrderStats {
  total: number;
  pending: number;
  processing: number;
  shipped: number;
  revenue: number;
}

interface OrderStatsCardsProps {
  stats: OrderStats;
}

export function OrderStatsCards({ stats }: OrderStatsCardsProps) {
  const cards = [
    { label: "Total Orders", value: stats.total.toString(), icon: ShoppingBag, color: "bg-primary/10 text-primary" },
    { label: "Pending", value: stats.pending.toString(), icon: Clock, color: "bg-warning/10 text-warning" },
    { label: "Processing", value: stats.processing.toString(), icon: Package, color: "bg-accent/10 text-accent" },
    { label: "Shipped", value: stats.shipped.toString(), icon: Truck, color: "bg-chart-5/10 text-chart-5" },
    { label: "Revenue", value: `${formatPrice((stats.revenue / 1000).toFixed(1))}k`, icon: TrendingUp, color: "bg-success/10 text-success" },
  ];

  const { formatPrice } = useCurrency();
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {cards.map((card) => (
        <Card key={card.label}>
          <CardContent className="flex items-center gap-4 p-4">
            <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${card.color.split(' ')[0]}`}>
              <card.icon className={`h-6 w-6 ${card.color.split(' ')[1]}`} />
            </div>
            <div>
              <p className="text-2xl font-bold">{card.value}</p>
              <p className="text-sm text-muted-foreground">{card.label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
