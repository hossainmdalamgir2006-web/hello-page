import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { OrdersTab } from "@/components/account/OrdersTab";

export default function AccountOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data: customerData } = await supabase
        .from("customers")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (customerData) {
        const { data: ordersData } = await supabase
          .from("orders")
          .select("*")
          .eq("customer_id", customerData.id)
          .order("created_at", { ascending: false });

        if (ordersData) {
          const ordersWithItems = await Promise.all(
            ordersData.map(async (order) => {
              const { data: items } = await supabase
                .from("order_items")
                .select("*")
                .eq("order_id", order.id);

              return {
                id: order.id,
                order_number: order.order_number,
                created_at: order.created_at,
                status: order.status,
                total: Number((order as any).total || (order as any).total_amount || 0),
                subtotal: Number(order.subtotal || 0),
                shipping_cost: Number(order.shipping_cost || 0),
                discount_amount: Number(order.discount_amount || 0),
                payment_status: order.payment_status,
                payment_method: order.payment_method || "N/A",
                shipping_address: order.shipping_address,
                items: (items || []).map((i) => ({
                  id: i.id,
                  product_name: i.product_name,
                  quantity: i.quantity,
                  unit_price: Number(i.unit_price),
                  total_price: Number(i.total_price),
                  product_id: i.product_id,
                })),
              };
            })
          );
          setOrders(ordersWithItems);
        }
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-xl sm:text-2xl font-bold text-foreground">My Orders</h1>
        <p className="text-sm text-muted-foreground">View and manage your order history</p>
      </div>
      <OrdersTab orders={orders} onRefresh={fetchOrders} />
    </div>
  );
}
