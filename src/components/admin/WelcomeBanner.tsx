import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingCart, MessageSquare, RotateCcw, AlertTriangle, ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface PendingSummary {
  pendingOrders: number;
  unreadMessages: number;
  pendingReturns: number;
  lowStockProducts: number;
}

export function WelcomeBanner() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [summary, setSummary] = useState<PendingSummary>({
    pendingOrders: 0,
    unreadMessages: 0,
    pendingReturns: 0,
    lowStockProducts: 0,
  });

  useEffect(() => {
    async function fetchSummary() {
      const [orders, messages, returns, products] = await Promise.all([
        supabase.from('orders' as any).select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('contact_messages').select('*', { count: 'exact', head: true }).eq('is_read', false).is('deleted_at', null),
        supabase.from('return_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('products' as any).select('quantity').lt('quantity', 10),
      ]);

      setSummary({
        pendingOrders: orders.count || 0,
        unreadMessages: messages.count || 0,
        pendingReturns: returns.count || 0,
        lowStockProducts: (products.data as any[])?.length || 0,
      });
    }
    fetchSummary();
  }, []);

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Admin';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  const items = [
    { count: summary.pendingOrders, label: 'pending orders', icon: ShoppingCart, color: 'text-warning', path: '/admin/orders' },
    { count: summary.unreadMessages, label: 'unread messages', icon: MessageSquare, color: 'text-primary', path: '/admin/messages' },
    { count: summary.pendingReturns, label: 'return requests', icon: RotateCcw, color: 'text-chart-5', path: '/admin/orders' },
    { count: summary.lowStockProducts, label: 'low stock items', icon: AlertTriangle, color: 'text-destructive', path: '/admin/products' },
  ].filter(item => item.count > 0);

  return (
    <Card className="border-primary/20 bg-gradient-to-r from-primary/5 via-background to-accent/5">
      <CardContent className="p-3 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              {greeting}, {displayName}! 👋
            </h2>
            {items.length > 0 ? (
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="text-sm text-muted-foreground">You have</span>
                {items.map((item, i) => (
                  <Button
                    key={item.label}
                    variant="ghost"
                    size="sm"
                    className="h-auto gap-1.5 px-2 py-1 text-sm font-medium hover:bg-primary/10"
                    onClick={() => navigate(item.path)}
                  >
                    <item.icon className={`h-3.5 w-3.5 ${item.color}`} />
                    <span>{item.count} {item.label}</span>
                    {i < items.length - 1 && <span className="text-muted-foreground ml-1">·</span>}
                  </Button>
                ))}
              </div>
            ) : (
              <p className="mt-1 text-sm text-muted-foreground">
                Everything looks great! No pending items. 🎉
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
