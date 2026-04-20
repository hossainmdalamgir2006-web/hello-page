import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, TrendingUp, Award } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from "recharts";
import { format, subDays, startOfDay } from "date-fns";

interface ReviewLite {
  id: string;
  rating: number;
  created_at: string;
  products?: { name: string } | null;
  product_id?: string;
}

interface Props {
  reviews: ReviewLite[];
}

export function ReviewAnalyticsCard({ reviews }: Props) {
  const trend = useMemo(() => {
    const days = 30;
    const today = startOfDay(new Date());
    const dayMap = new Map<string, { sum: number; count: number }>();
    for (let i = days - 1; i >= 0; i--) {
      const d = format(subDays(today, i), "MMM d");
      dayMap.set(d, { sum: 0, count: 0 });
    }
    reviews.forEach(r => {
      const d = format(startOfDay(new Date(r.created_at)), "MMM d");
      const cell = dayMap.get(d);
      if (cell) { cell.sum += r.rating; cell.count += 1; }
    });
    return Array.from(dayMap.entries()).map(([date, v]) => ({
      date,
      avg: v.count > 0 ? Number((v.sum / v.count).toFixed(2)) : null,
      count: v.count,
    }));
  }, [reviews]);

  const distribution = useMemo(() => {
    const dist = [5, 4, 3, 2, 1].map(star => ({
      star: `${star}★`,
      count: reviews.filter(r => r.rating === star).length,
      starNum: star,
    }));
    return dist;
  }, [reviews]);

  const topProducts = useMemo(() => {
    const map = new Map<string, { name: string; count: number; sum: number }>();
    reviews.forEach(r => {
      const name = (r.products as any)?.name || "Unknown";
      const key = r.product_id || name;
      const cell = map.get(key) || { name, count: 0, sum: 0 };
      cell.count += 1;
      cell.sum += r.rating;
      map.set(key, cell);
    });
    return Array.from(map.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
      .map(p => ({ ...p, avg: Number((p.sum / p.count).toFixed(1)) }));
  }, [reviews]);

  const starColors = ["hsl(var(--success))", "hsl(var(--primary))", "hsl(var(--warning))", "hsl(var(--destructive))", "hsl(var(--destructive))"];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Review Analytics
        </CardTitle>
        <CardDescription>Insights from the last 30 days</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Trend */}
          <div className="lg:col-span-2">
            <p className="text-sm font-medium mb-2">Average Rating Trend</p>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trend}>
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={4} />
                  <YAxis domain={[0, 5]} tick={{ fontSize: 10 }} width={24} />
                  <Tooltip
                    contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 6, fontSize: 12 }}
                    formatter={(v: any) => v === null ? ["No data", ""] : [v, "Avg rating"]}
                  />
                  <Line type="monotone" dataKey="avg" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} connectNulls />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Distribution */}
          <div>
            <p className="text-sm font-medium mb-2">Rating Distribution</p>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={distribution} layout="vertical">
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="star" tick={{ fontSize: 11 }} width={28} />
                  <Tooltip
                    contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 6, fontSize: 12 }}
                  />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                    {distribution.map((_, i) => <Cell key={i} fill={starColors[i]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Top Products */}
        {topProducts.length > 0 && (
          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-sm font-medium mb-3 flex items-center gap-1.5">
              <Award className="h-4 w-4 text-primary" /> Most Reviewed Products
            </p>
            <div className="space-y-2">
              {topProducts.map((p, i) => (
                <div key={i} className="flex items-center gap-3 p-2 rounded-lg border border-border bg-muted/20">
                  <Badge i={i} />
                  <p className="text-sm font-medium flex-1 truncate">{p.name}</p>
                  <div className="flex items-center gap-1 text-xs">
                    <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">{p.avg}</span>
                  </div>
                  <span className="text-xs text-muted-foreground tabular-nums">{p.count} reviews</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Badge({ i }: { i: number }) {
  const colors = ["bg-yellow-500/20 text-yellow-700 dark:text-yellow-400", "bg-muted text-muted-foreground", "bg-orange-500/20 text-orange-700 dark:text-orange-400", "bg-muted text-muted-foreground", "bg-muted text-muted-foreground"];
  return (
    <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${colors[i] || colors[1]}`}>
      {i + 1}
    </span>
  );
}
