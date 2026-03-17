import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, RotateCcw, Plus, Package } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { format, differenceInDays } from "date-fns";

const REASONS = [
  "Defective/Damaged Product",
  "Wrong Item Received",
  "Size/Color Mismatch",
  "Product Not As Described",
  "Changed My Mind",
  "Other",
];

const statusColors: Record<string, string> = {
  pending: "secondary",
  approved: "default",
  rejected: "destructive",
  completed: "default",
};

export default function AccountReturns() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState("");
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [returnWindowDays, setReturnWindowDays] = useState(7);

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);

    // Fetch return window setting
    const { data: setting } = await supabase
      .from("store_settings" as any)
      .select("value")
      .eq("key", "RETURN_WINDOW_DAYS")
      .maybeSingle();
    const windowDays = setting ? Number((setting as any).value) || 7 : 7;
    setReturnWindowDays(windowDays);

    // Fetch return requests
    const { data: rr } = await supabase
      .from("return_requests")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setRequests(rr || []);

    // Get order IDs that already have rejected/completed return requests
    const blockedOrderIds = new Set(
      (rr || [])
        .filter((r: any) => r.status === "rejected" || r.status === "completed")
        .map((r: any) => r.order_id)
    );

    // Fetch orders for new request
    const { data: customer } = await supabase
      .from("customers")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (customer) {
      const { data: o } = await supabase
        .from("orders")
        .select("id, order_number, status, created_at, updated_at")
        .eq("customer_id", customer.id)
        .in("status", ["delivered", "shipped"])
        .order("created_at", { ascending: false });

      // Filter: exclude blocked orders and orders outside the return window
      const eligible = (o || []).filter((order: any) => {
        if (blockedOrderIds.has(order.id)) return false;
        // Check return window based on updated_at (when status changed to delivered)
        if (order.status === "delivered") {
          const deliveryDate = new Date(order.updated_at || order.created_at);
          const daysSince = differenceInDays(new Date(), deliveryDate);
          if (daysSince > windowDays) return false;
        }
        return true;
      });
      setOrders(eligible);
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [user]);

  const handleSubmit = async () => {
    if (!selectedOrder || !reason) {
      toast.error("Please select an order and reason");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("return_requests").insert({
      user_id: user!.id,
      order_id: selectedOrder,
      reason,
      description: description || null,
    });
    if (error) {
      toast.error("Failed to submit request");
    } else {
      toast.success("Return request submitted!");
      setOpen(false);
      setSelectedOrder("");
      setReason("");
      setDescription("");
      fetchData();
    }
    setSubmitting(false);
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-xs text-muted-foreground">
          Return requests must be submitted within {returnWindowDays} days of delivery.
        </p>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" disabled={orders.length === 0}><Plus className="h-4 w-4 mr-1.5" />New Request</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Submit Return/Refund Request</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Select Order</Label>
                <Select value={selectedOrder} onValueChange={setSelectedOrder}>
                  <SelectTrigger><SelectValue placeholder="Choose an order" /></SelectTrigger>
                  <SelectContent>
                    {orders.map((o) => (
                      <SelectItem key={o.id} value={o.id}>
                        #{o.order_number} — {format(new Date(o.created_at), "MMM dd, yyyy")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Reason</Label>
                <Select value={reason} onValueChange={setReason}>
                  <SelectTrigger><SelectValue placeholder="Select reason" /></SelectTrigger>
                  <SelectContent>
                    {REASONS.map((r) => (
                      <SelectItem key={r} value={r}>{r}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Details (optional)</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the issue..."
                  rows={3}
                />
              </div>
              <Button onClick={handleSubmit} disabled={submitting} className="w-full">
                {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : null}
                Submit Request
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {requests.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <RotateCcw className="h-12 w-12 mx-auto mb-3 opacity-40" />
            <p>No return/refund requests</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {requests.map((r) => (
            <Card key={r.id}>
              <CardContent className="py-4">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="space-y-1">
                    <p className="font-semibold text-sm">{r.reason}</p>
                    {r.description && <p className="text-xs text-muted-foreground">{r.description}</p>}
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(r.created_at), "MMM dd, yyyy HH:mm")}
                    </p>
                    {r.admin_notes && (
                      <p className="text-xs text-foreground mt-1 p-2 bg-muted rounded">
                        <strong>Admin:</strong> {r.admin_notes}
                      </p>
                    )}
                  </div>
                  <Badge variant={(statusColors[r.status] as any) || "secondary"}>
                    {r.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
