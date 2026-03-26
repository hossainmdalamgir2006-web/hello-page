import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { SEOHead } from "@/components/SEOHead";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Package, TrendingUp, CheckCircle, Truck, Clock, ArrowRight, ShoppingBag, User, HelpCircle } from "lucide-react";
import { DelayedLoader } from "@/components/ui/DelayedLoader";
import { DashboardSkeleton } from "@/components/skeletons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProfileCompletion } from "@/components/account/ProfileCompletion";
import { format } from "date-fns";
import { formatPrice } from "@/lib/formatPrice";

interface Order {
  id: string;
  order_number: string;
  status: string;
  total: number;
  created_at: string;
}

export default function AccountDashboard() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [addressCount, setAddressCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const statusConfig: Record<string, { label: string; className: string; icon: any }> = {
    pending: { label: t('account.pending'), className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400", icon: Clock },
    processing: { label: t('account.processing'), className: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400", icon: Package },
    shipped: { label: t('account.shipped'), className: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400", icon: Truck },
    delivered: { label: t('account.delivered'), className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400", icon: CheckCircle },
  };

  const quickActions = [
    { label: t('account.myOrders'), icon: Package, url: "/myaccount/orders", color: "text-blue-600 dark:text-blue-400" },
    { label: t('account.shopNow'), icon: ShoppingBag, url: "/store/products", color: "text-accent" },
    { label: t('account.editProfile'), icon: User, url: "/myaccount/settings", color: "text-emerald-600 dark:text-emerald-400" },
    { label: t('account.getSupport'), icon: HelpCircle, url: "/myaccount/support", color: "text-purple-600 dark:text-purple-400" },
  ];

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", user.id)
          .single();
        if (profileData) {
          setProfile(profileData);
          setAvatarUrl(profileData.avatar_url);
        }

        const { count } = await supabase
          .from("user_addresses")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id);
        setAddressCount(count || 0);

        const { data: customerData } = await supabase
          .from("customers")
          .select("id")
          .eq("user_id", user.id)
          .maybeSingle();

        if (customerData) {
          const { data: ordersData } = await supabase
            .from("orders")
            .select("id, order_number, status, created_at, total_amount")
            .eq("customer_id", customerData.id)
            .order("created_at", { ascending: false });

          if (ordersData) {
            setOrders(
              ordersData.map((o: any) => ({
                id: o.id,
                order_number: o.order_number,
                status: o.status,
                total: Number(o.total_amount || 0),
                created_at: o.created_at,
              }))
            );
          }
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  if (loading) {
    return <DelayedLoader><DashboardSkeleton /></DelayedLoader>;
  }

  const totalSpent = orders.reduce((sum, o) => sum + o.total, 0);
  const deliveredCount = orders.filter((o) => o.status === "delivered").length;
  const pendingCount = orders.filter((o) => ["pending", "processing"].includes(o.status)).length;
  const shippedCount = orders.filter((o) => o.status === "shipped").length;
  const recentOrders = orders.slice(0, 5);

  const statCards = [
    { label: t('account.totalOrders'), value: orders.length, borderColor: "border-l-blue-500", textColor: "text-blue-600 dark:text-blue-400" },
    { label: t('account.totalSpent'), value: `${formatPrice(totalSpent)}`, borderColor: "border-l-green-500", textColor: "text-green-600 dark:text-green-400" },
    { label: t('account.delivered'), value: deliveredCount, borderColor: "border-l-emerald-500", textColor: "text-emerald-600 dark:text-emerald-400" },
    { label: t('account.inTransit'), value: shippedCount, borderColor: "border-l-purple-500", textColor: "text-purple-600 dark:text-purple-400" },
    { label: t('account.pending'), value: pendingCount, borderColor: "border-l-amber-500", textColor: "text-amber-600 dark:text-amber-400" },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-gradient-to-r from-primary/5 via-accent/5 to-transparent p-5 sm:p-6 border border-border">
        <h1 className="font-display text-xl sm:text-2xl font-bold text-foreground">
          {t('account.welcomeBack')}, {profile?.full_name || t('orders.customer')}! 👋
        </h1>
        <p className="text-sm text-muted-foreground mt-1">{t('account.whatsHappening')}</p>
      </div>

      <ProfileCompletion profile={profile} avatarUrl={avatarUrl} addressCount={addressCount} orderCount={orders.length} />

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {statCards.map((stat) => (
          <Card key={stat.label} className={`border-l-4 ${stat.borderColor} shadow-sm`}>
            <CardContent className="p-4">
              <p className={`text-2xl font-bold ${stat.textColor}`}>{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.label}
              onClick={() => navigate(action.url)}
              className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-4 text-center transition-all hover:shadow-md hover:border-primary/20 hover:-translate-y-0.5 group"
            >
              <Icon className={`h-5 w-5 ${action.color} transition-transform group-hover:scale-110`} />
              <span className="text-xs font-medium text-foreground">{action.label}</span>
            </button>
          );
        })}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-base">{t('account.recentOrders')}</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => navigate("/myaccount/orders")}>
            {t('account.viewAll')} <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </CardHeader>
        <CardContent>
          {recentOrders.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">{t('account.noOrdersYet')}</p>
              <Button variant="outline" size="sm" className="mt-3" onClick={() => navigate("/store/products")}>
                {t('account.startShopping')}
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {recentOrders.map((order) => {
                const status = statusConfig[order.status] || statusConfig.pending;
                const StatusIcon = status.icon;
                return (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => navigate("/myaccount/orders")}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${status.className}`}>
                        <StatusIcon className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{order.order_number}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(order.created_at), "MMM dd, yyyy")}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sm">{formatPrice(order.total)}</p>
                      <Badge className={status.className} variant="secondary">
                        {status.label}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
