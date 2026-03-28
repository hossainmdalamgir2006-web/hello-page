import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice } from "@/lib/formatPrice";

interface SalesDataPoint {
  name: string;
  sales: number;
  orders: number;
}

interface SalesChartProps {
  data?: SalesDataPoint[];
  loading?: boolean;
}

export function SalesChart({ data = [], loading = false }: SalesChartProps) {
  if (loading) {
    return (
      <div>
        <Skeleton className="h-60 sm:h-80 w-full" />
      </div>
    );
  }

  const hasData = data.some(d => d.sales > 0);

  return (
    <div>
      <div className="h-60 sm:h-80">
        {!hasData ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            No sales data available yet
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis 
                dataKey="name" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                interval="preserveStartEnd"
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                tickFormatter={(value) => `${formatPrice(value / 1000)}k`}
                width={45}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  boxShadow: "var(--shadow-md)"
                }}
                formatter={(value: number, name: string) => [
                  name === 'sales' ? `${formatPrice(value)}` : value,
                  name === 'sales' ? 'Sales' : 'Orders'
                ]}
              />
              <Area 
                type="monotone" 
                dataKey="sales" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                fill="url(#salesGradient)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
