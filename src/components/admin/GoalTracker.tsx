import { useState } from "react";
import { Target, TrendingUp, Edit2, Check, X, History, ChevronLeft } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { bn } from "date-fns/locale";

interface MonthlyGoal {
  month: string;
  sales_target: number;
  orders_target: number;
  customers_target: number;
  sales_actual: number;
  orders_actual: number;
  customers_actual: number;
}

interface GoalTrackerProps {
  currentGoal: MonthlyGoal | null;
  history: MonthlyGoal[];
  currentSales: number;
  currentOrders: number;
  currentCustomers: number;
  loading?: boolean;
  onUpdateTarget?: (field: "sales_target" | "orders_target" | "customers_target", value: number) => void;
}

interface GoalItem {
  id: string;
  label: string;
  current: number;
  target: number;
  unit: string;
  field: "sales_target" | "orders_target" | "customers_target";
}

export function GoalTracker({
  currentGoal,
  history,
  currentSales,
  currentOrders,
  currentCustomers,
  loading = false,
  onUpdateTarget,
}: GoalTrackerProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  const [showHistory, setShowHistory] = useState(false);

  const goals: GoalItem[] = [
    {
      id: "sales",
      label: "Monthly Sales",
      current: currentSales,
      target: currentGoal?.sales_target ?? 100000,
      unit: "৳",
      field: "sales_target",
    },
    {
      id: "orders",
      label: "Monthly Orders",
      current: currentOrders,
      target: currentGoal?.orders_target ?? 50,
      unit: "",
      field: "orders_target",
    },
    {
      id: "customers",
      label: "New Customers",
      current: currentCustomers,
      target: currentGoal?.customers_target ?? 20,
      unit: "",
      field: "customers_target",
    },
  ];

  const handleEditStart = (goal: GoalItem) => {
    setEditingId(goal.id);
    setEditValue(goal.target.toString());
  };

  const handleEditSave = (goal: GoalItem) => {
    const newTarget = parseInt(editValue) || 0;
    if (newTarget > 0 && onUpdateTarget) {
      onUpdateTarget(goal.field, newTarget);
    }
    setEditingId(null);
  };

  const formatValue = (value: number, unit: string) => {
    return unit ? `${unit}${value.toLocaleString()}` : value.toLocaleString();
  };

  if (loading) {
    return (
      <div className="rounded-xl bg-card p-4 sm:p-6 shadow-card">
        <Skeleton className="h-5 w-32 mb-2" />
        <Skeleton className="h-4 w-48 mb-4" />
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i}>
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-3 w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (showHistory) {
    return (
      <div className="rounded-xl bg-card p-4 sm:p-6 shadow-card">
        <div className="flex items-center gap-2 mb-4">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setShowHistory(false)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="font-display text-base font-semibold text-foreground">Goal History</h2>
        </div>
        {history.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">No previous data yet</p>
        ) : (
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {history.map((h) => {
              const salesPct = h.sales_target > 0 ? Math.min((h.sales_actual / h.sales_target) * 100, 100) : 0;
              const ordersPct = h.orders_target > 0 ? Math.min((h.orders_actual / h.orders_target) * 100, 100) : 0;
              const customersPct = h.customers_target > 0 ? Math.min((h.customers_actual / h.customers_target) * 100, 100) : 0;
              const overallPct = Math.round((salesPct + ordersPct + customersPct) / 3);
              const allAchieved = h.sales_actual >= h.sales_target && h.orders_actual >= h.orders_target && h.customers_actual >= h.customers_target;

              return (
                <div key={h.month} className="border rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {format(parseISO(h.month), "MMMM yyyy")}
                    </span>
                    <Badge variant={allAchieved ? "default" : "secondary"} className={cn("text-xs", allAchieved && "bg-success text-success-foreground")}>
                      {allAchieved ? "✅ Achieved" : `${overallPct}%`}
                    </Badge>
                  </div>
                  <div className="space-y-1.5">
                    <HistoryRow label="Sales" actual={h.sales_actual} target={h.sales_target} unit="৳" />
                    <HistoryRow label="Orders" actual={h.orders_actual} target={h.orders_target} unit="" />
                    <HistoryRow label="Customers" actual={h.customers_actual} target={h.customers_target} unit="" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-card p-4 sm:p-6 shadow-card">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="font-display text-base sm:text-lg font-semibold text-foreground flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Goals & Targets
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">This month's progress</p>
        </div>
        <Button variant="ghost" size="sm" className="h-8 gap-1 text-xs" onClick={() => setShowHistory(true)}>
          <History className="h-3.5 w-3.5" />
          History
        </Button>
      </div>

      <div className="space-y-5">
        {goals.map((goal) => {
          const percentage = goal.target > 0 ? Math.min((goal.current / goal.target) * 100, 100) : 0;
          const isAchieved = goal.current >= goal.target;
          const isEditing = editingId === goal.id;

          return (
            <div key={goal.id}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-foreground">{goal.label}</span>
                <div className="flex items-center gap-2">
                  {isEditing ? (
                    <div className="flex items-center gap-1">
                      <Input
                        type="number"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="h-7 w-24 text-xs"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleEditSave(goal);
                          if (e.key === "Escape") setEditingId(null);
                        }}
                      />
                      <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => handleEditSave(goal)}>
                        <Check className="h-3 w-3 text-success" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => setEditingId(null)}>
                        <X className="h-3 w-3 text-destructive" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <span className="text-xs text-muted-foreground">
                        {formatValue(goal.current, goal.unit)} / {formatValue(goal.target, goal.unit)}
                      </span>
                      <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => handleEditStart(goal)}>
                        <Edit2 className="h-3 w-3" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
              <Progress value={percentage} className={cn("h-2", isAchieved && "[&>div]:bg-success")} />
              <div className="flex items-center justify-between mt-1">
                <span className={cn("text-xs font-medium", isAchieved ? "text-success" : "text-muted-foreground")}>
                  {percentage.toFixed(0)}%
                </span>
                {isAchieved ? (
                  <span className="text-xs text-success flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" /> Goal achieved!
                  </span>
                ) : (
                  <span className="text-xs text-muted-foreground">
                    {formatValue(goal.target - goal.current, goal.unit)} to go
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function HistoryRow({ label, actual, target, unit }: { label: string; actual: number; target: number; unit: string }) {
  const pct = target > 0 ? Math.min((actual / target) * 100, 100) : 0;
  const achieved = actual >= target;
  const fmt = (v: number) => unit ? `${unit}${v.toLocaleString()}` : v.toLocaleString();

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground w-16 shrink-0">{label}</span>
      <Progress value={pct} className={cn("h-1.5 flex-1", achieved && "[&>div]:bg-success")} />
      <span className="text-xs text-muted-foreground whitespace-nowrap">
        {fmt(actual)}/{fmt(target)}
      </span>
      <span className="text-xs">{achieved ? "✅" : "❌"}</span>
    </div>
  );
}
