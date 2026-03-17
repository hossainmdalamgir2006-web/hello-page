import { useState, useEffect, lazy, Suspense } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { ShoppingCart, Package, Users, TrendingUp, AlertCircle, Clock, RefreshCw, RotateCcw } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { StatsCard } from "@/components/admin/StatsCard";
import { QuickActions } from "@/components/admin/QuickActions";
import { DateRangeSelector, DateRangePreset } from "@/components/admin/DateRangeSelector";
import { DashboardWidget } from "@/components/admin/DashboardWidget";
import { DashboardWidgetPicker } from "@/components/admin/DashboardWidgetPicker";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useDashboardLayout } from "@/hooks/useDashboardLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

// Lazy-loaded heavy dashboard widgets
const SalesChart = lazy(() => import("@/components/admin/SalesChart").then(m => ({ default: m.SalesChart })));
const TopProducts = lazy(() => import("@/components/admin/TopProducts").then(m => ({ default: m.TopProducts })));
const RecentOrders = lazy(() => import("@/components/admin/RecentOrders").then(m => ({ default: m.RecentOrders })));
const ActivityFeed = lazy(() => import("@/components/admin/ActivityFeed").then(m => ({ default: m.ActivityFeed })));
const GoalTracker = lazy(() => import("@/components/admin/GoalTracker").then(m => ({ default: m.GoalTracker })));
const PeriodComparison = lazy(() => import("@/components/admin/PeriodComparison").then(m => ({ default: m.PeriodComparison })));
const RecentReturnRequests = lazy(() => import("@/components/admin/RecentReturnRequests").then(m => ({ default: m.RecentReturnRequests })));

const WidgetLoader = () => <Skeleton className="h-48 w-full rounded-lg" />;

const Index = () => {
  const [dateRangePreset, setDateRangePreset] = useState<DateRangePreset>("last30days");
  const [customRange, setCustomRange] = useState<{ from: Date; to: Date } | undefined>();
  const [pendingReturns, setPendingReturns] = useState(0);
  const [refundStats, setRefundStats] = useState({ count: 0, amount: 0 });
  const { 
    stats, 
    recentOrders, 
    topProducts, 
    salesData, 
    loading, 
    refetch,
    dateRange,
  } = useDashboardData(dateRangePreset, customRange);

  // Fetch pending return requests count and refund stats
  useEffect(() => {
    async function fetchReturnStats() {
      const { count } = await supabase
        .from('return_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');
      setPendingReturns(count || 0);

      const { data: refunded } = await supabase
        .from('orders' as any)
        .select('refund_amount, refund_status')
        .eq('refund_status', 'refunded');
      if (refunded) {
        const total = (refunded as any[]).reduce((sum, o) => sum + Number(o.refund_amount || 0), 0);
        setRefundStats({ count: (refunded as any[]).length, amount: total });
      }
    }
    fetchReturnStats();
  }, []);
  
  const {
    widgets,
    visibleWidgets,
    moveWidget,
    removeWidget,
    addWidget,
    resetLayout,
  } = useDashboardLayout();
  
  const { t } = useLanguage();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      moveWidget(active.id as string, over.id as string);
    }
  };

  const handleDateRangeChange = (preset: DateRangePreset, range?: { from: Date; to: Date }) => {
    setDateRangePreset(preset);
    if (range) {
      setCustomRange(range);
    }
  };

  const formatCurrency = (amount: number) => {
    return `৳${amount.toLocaleString('en-BD')}`;
  };

  const statsData = [
    { 
      title: t('dashboard.totalSales'), 
      value: formatCurrency(stats.totalSales), 
      change: stats.salesChange, 
      icon: TrendingUp, 
      iconBg: "accent" as const 
    },
    { 
      title: t('dashboard.totalOrders'), 
      value: stats.totalOrders.toString(), 
      change: stats.ordersChange, 
      icon: ShoppingCart, 
      iconBg: "primary" as const 
    },
    { 
      title: t('dashboard.totalProducts'), 
      value: stats.totalProducts.toString(), 
      change: stats.productsChange, 
      icon: Package, 
      iconBg: "warning" as const 
    },
    { 
      title: t('dashboard.totalCustomers'), 
      value: stats.totalCustomers.toString(), 
      change: stats.customersChange, 
      icon: Users, 
      iconBg: "success" as const 
    },
    { 
      title: "Total Refunds", 
      value: refundStats.count.toString(), 
      change: 0, 
      icon: RotateCcw, 
      iconBg: "warning" as const 
    },
    { 
      title: "Total Refunded", 
      value: formatCurrency(refundStats.amount), 
      change: 0, 
      icon: RotateCcw, 
      iconBg: "accent" as const 
    },
  ];

  const comparisonMetrics = [
    {
      label: "Sales",
      current: stats.monthlySales,
      previous: stats.previousSales,
      format: "currency" as const,
    },
    {
      label: "Orders",
      current: stats.monthlyOrders,
      previous: stats.previousOrders,
      format: "number" as const,
    },
    {
      label: "Customers",
      current: stats.monthlyCustomers,
      previous: stats.previousCustomers,
      format: "number" as const,
    },
    {
      label: "Avg. Order",
      current: stats.monthlyOrders > 0 ? stats.monthlySales / stats.monthlyOrders : 0,
      previous: stats.previousOrders > 0 ? stats.previousSales / stats.previousOrders : 0,
      format: "currency" as const,
    },
  ];

  const renderWidget = (widget: typeof visibleWidgets[0]) => {
    switch (widget.type) {
      case "alerts":
        if (stats.pendingOrders === 0 && stats.lowStockProducts === 0 && pendingReturns === 0) return null;
        return (
          <DashboardWidget
            key={widget.id}
            id={widget.id}
            title={widget.title}
            onRemove={() => removeWidget(widget.id)}
            className="lg:col-span-4"
          >
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {stats.pendingOrders > 0 && (
                <div className="flex items-center gap-3 rounded-lg border border-warning/30 bg-warning/10 p-3">
                  <Clock className="h-5 w-5 text-warning" />
                  <span className="text-sm font-medium">{stats.pendingOrders} pending orders need attention</span>
                </div>
              )}
              {stats.lowStockProducts > 0 && (
                <div className="flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-3">
                  <AlertCircle className="h-5 w-5 text-destructive" />
                  <span className="text-sm font-medium">{stats.lowStockProducts} products are low on stock</span>
                </div>
              )}
              {pendingReturns > 0 && (
                <div className="flex items-center gap-3 rounded-lg border border-chart-5/30 bg-chart-5/10 p-3">
                  <RotateCcw className="h-5 w-5 text-chart-5" />
                  <span className="text-sm font-medium">{pendingReturns} return/refund request(s) pending</span>
                </div>
              )}
            </div>
          </DashboardWidget>
        );

      case "stats":
        return (
          <DashboardWidget
            key={widget.id}
            id={widget.id}
            title={widget.title}
            onRemove={() => removeWidget(widget.id)}
            className="lg:col-span-4"
          >
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-6">
              {loading ? (
                Array.from({ length: 6 }).map((_, index) => (
                  <Skeleton key={index} className="h-28 rounded-lg" />
                ))
              ) : (
                statsData.map((stat) => (
                  <StatsCard key={stat.title} {...stat} />
                ))
              )}
            </div>
          </DashboardWidget>
        );

      case "periodComparison":
        return (
          <DashboardWidget
            key={widget.id}
            id={widget.id}
            title={widget.title}
            onRemove={() => removeWidget(widget.id)}
            className="lg:col-span-4"
          >
            <Suspense fallback={<WidgetLoader />}>
              <PeriodComparison
                metrics={comparisonMetrics}
                currentPeriodLabel={`${format(dateRange.from, "MMM d")} - ${format(dateRange.to, "MMM d")}`}
                previousPeriodLabel="Previous period"
                loading={loading}
              />
            </Suspense>
          </DashboardWidget>
        );

      case "salesChart":
        return (
          <DashboardWidget
            key={widget.id}
            id={widget.id}
            title={widget.title}
            onRemove={() => removeWidget(widget.id)}
            className="lg:col-span-2"
          >
            <Suspense fallback={<WidgetLoader />}>
              <SalesChart data={salesData} loading={loading} />
            </Suspense>
          </DashboardWidget>
        );

      case "goalTracker":
        return (
          <DashboardWidget
            key={widget.id}
            id={widget.id}
            title={widget.title}
            onRemove={() => removeWidget(widget.id)}
            className="lg:col-span-1"
          >
            <Suspense fallback={<WidgetLoader />}>
              <GoalTracker
                currentSales={stats.monthlySales}
                currentOrders={stats.monthlyOrders}
                currentCustomers={stats.monthlyCustomers}
                salesGoal={100000}
                ordersGoal={50}
                customersGoal={20}
                loading={loading}
              />
            </Suspense>
          </DashboardWidget>
        );

      case "activityFeed":
        return (
          <DashboardWidget
            key={widget.id}
            id={widget.id}
            title={widget.title}
            onRemove={() => removeWidget(widget.id)}
            className="lg:col-span-1"
          >
            <Suspense fallback={<WidgetLoader />}>
              <ActivityFeed limit={8} />
            </Suspense>
          </DashboardWidget>
        );

      case "topProducts":
        return (
          <DashboardWidget
            key={widget.id}
            id={widget.id}
            title={widget.title}
            onRemove={() => removeWidget(widget.id)}
            className="lg:col-span-2"
          >
            <Suspense fallback={<WidgetLoader />}>
              <TopProducts products={topProducts} loading={loading} />
            </Suspense>
          </DashboardWidget>
        );

      case "recentOrders":
        return (
          <DashboardWidget
            key={widget.id}
            id={widget.id}
            title={widget.title}
            onRemove={() => removeWidget(widget.id)}
            className="lg:col-span-3"
          >
            <Suspense fallback={<WidgetLoader />}>
              <RecentOrders orders={recentOrders} loading={loading} />
            </Suspense>
          </DashboardWidget>
        );

      case "returnRequests":
        return (
          <DashboardWidget
            key={widget.id}
            id={widget.id}
            title={widget.title}
            onRemove={() => removeWidget(widget.id)}
            className="lg:col-span-1"
          >
            <Suspense fallback={<WidgetLoader />}>
              <RecentReturnRequests loading={loading} />
            </Suspense>
          </DashboardWidget>
        );

      default:
        return null;
    }
  };

  return (
    <>
      {/* Page Header */}
      <div className="mb-6 sm:mb-8 flex flex-col gap-3 sm:gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="font-display text-xl sm:text-2xl font-bold text-foreground">{t('dashboard.title')}</h1>
            <p className="text-sm sm:text-base text-muted-foreground">{t('dashboard.welcome')}! Drag widgets to rearrange your dashboard.</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <DateRangeSelector
              value={dateRangePreset}
              customRange={customRange}
              onChange={handleDateRangeChange}
            />
            <Button variant="outline" size="sm" onClick={refetch} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <DashboardWidgetPicker
              widgets={widgets}
              onAddWidget={addWidget}
              onResetLayout={resetLayout}
            />
            <QuickActions onRefresh={refetch} loading={loading} />
          </div>
        </div>
      </div>

      {/* Draggable Widget Grid */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={visibleWidgets.map((w) => w.id)}
          strategy={rectSortingStrategy}
        >
          <div className="grid gap-4 sm:gap-6 lg:grid-cols-4">
            {visibleWidgets.map((widget) => renderWidget(widget))}
          </div>
        </SortableContext>
      </DndContext>
    </>
  );
};

export default Index;
