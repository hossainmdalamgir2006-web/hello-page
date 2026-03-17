import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Loader2, Package, TrendingUp, CheckCircle, Truck, Clock, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProfileCompletion } from "@/components/account/ProfileCompletion";
import { format } from "date-fns";

interface Order {
  id: string;
  order_number: string;
  status: string;
  total: number;
  created_at: string;
}

const statusConfig: Record<string, { label: string; className: string; icon: any }> = {
  pending: { label: "Pending", className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400", icon: Clock },
  processing: { label: "Processing", className: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400", icon: Package },
  shipped: { label: "Shipped", className: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400", icon: Truck },
  delivered: { label: "Delivered", className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400", icon: CheckCircle },
};

export default function AccountDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [addressCount, setAddressCount] = useState(0);
  const [loading, setLoading] = useState(true);

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
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const totalSpent = orders.reduce((sum, o) => sum + o.total, 0);
  const deliveredCount = orders.filter((o) => o.status === "delivered").length;
  const pendingCount = orders.filter((o) => ["pending", "processing"].includes(o.status)).length;
  const shippedCount = orders.filter((o) => o.status === "shipped").length;
  const recentOrders = orders.slice(0, 5);

  const statCards = [
    { label: "Total Orders", value: orders.length, icon: Package, color: "text-blue-600 bg-blue-100 dark:bg-blue-900/30" },
    { label: "Total Spent", value: `৳${totalSpent.toLocaleString()}`, icon: TrendingUp, color: "text-green-600 bg-green-100 dark:bg-green-900/30" },
    { label: "Delivered", value: deliveredCount, icon: CheckCircle, color: "text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30" },
    { label: "In Transit", value: shippedCount, icon: Truck, color: "text-purple-600 bg-purple-100 dark:bg-purple-900/30" },
    { label: "Pending", value: pendingCount, icon: Clock, color: "text-amber-600 bg-amber-100 dark:bg-amber-900/30" },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="font-display text-xl sm:text-2xl font-bold text-foreground">
          Welcome back, {profile?.full_name || "Customer"}! 👋
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Here's what's happening with your account.</p>
      </div>

      {/* Profile Completion */}
      <ProfileCompletion
        profile={profile}
        avatarUrl={avatarUrl}
        addressCount={addressCount}
        orderCount={orders.length}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="border-none shadow-sm">
              <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                <div className={`p-2 rounded-full ${stat.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-base">Recent Orders</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => navigate("/myaccount/orders")}>
            View All <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </CardHeader>
        <CardContent>
          {recentOrders.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">No orders yet</p>
              <Button variant="outline" size="sm" className="mt-3" onClick={() => navigate("/store/products")}>
                Start Shopping
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
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
                      <p className="font-semibold text-sm">৳{order.total.toLocaleString()}</p>
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
