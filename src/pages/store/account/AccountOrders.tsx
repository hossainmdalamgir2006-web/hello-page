import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { DelayedLoader } from "@/components/ui/DelayedLoader";
import { OrdersListSkeleton } from "@/components/skeletons";
import { OrdersTab } from "@/components/account/OrdersTab";

import { SEOHead } from "@/components/SEOHead";

export default function AccountOrders() {
  const { user } = useAuth();
  const { t } = useLanguage();
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
    return <DelayedLoader><OrdersListSkeleton /></DelayedLoader>;
  }

  return (
    <>
      <SEOHead title="My Orders" noIndex />
      <OrdersTab orders={orders} onRefresh={fetchOrders} />
    </>
  );
}