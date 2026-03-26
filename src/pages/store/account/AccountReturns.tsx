import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

import { SEOHead } from "@/components/SEOHead";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, RotateCcw, Plus } from "lucide-react";
import { DelayedLoader } from "@/components/ui/DelayedLoader";
import { GenericListSkeleton } from "@/components/skeletons";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { format, differenceInDays } from "date-fns";

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

  const REASONS = [
    { value: "Defective/Damaged Product", label: "Defective/Damaged Product" },
    { value: "Wrong Item Received", label: "Wrong Item Received" },
    { value: "Size/Color Mismatch", label: "Size/Color Mismatch" },
    { value: "Product Not As Described", label: "Product Not As Described" },
    { value: "Changed My Mind", label: "Changed My Mind" },
    { value: "Other", label: "Other" },
  ];

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    const { data: setting } = await supabase.from("store_settings" as any).select("value").eq("key", "RETURN_WINDOW_DAYS").maybeSingle();
    const windowDays = setting ? Number((setting as any).value) || 7 : 7;
    setReturnWindowDays(windowDays);
    const { data: rr } = await supabase.from("return_requests").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    setRequests(rr || []);
    const blockedOrderIds = new Set((rr || []).filter((r: any) => r.status === "rejected" || r.status === "completed").map((r: any) => r.order_id));
    const { data: customer } = await supabase.from("customers").select("id").eq("user_id", user.id).maybeSingle();
    if (customer) {
      const { data: o } = await supabase.from("orders").select("id, order_number, status, created_at, updated_at").eq("customer_id", customer.id).in("status", ["delivered", "shipped"]).order("created_at", { ascending: false });
      const eligible = (o || []).filter((order: any) => {
        if (blockedOrderIds.has(order.id)) return false;
        if (order.status === "delivered") {
          const deliveryDate = new Date(order.updated_at || order.created_at);
          if (differenceInDays(new Date(), deliveryDate) > windowDays) return false;
        }
        return true;
      });
      setOrders(eligible);
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [user]);

  const handleSubmit = async () => {
    if (!selectedOrder || !reason) { toast.error(t('account.selectOrderAndReason')); return; }
    setSubmitting(true);
    const { error } = await supabase.from("return_requests").insert({
      user_id: user!.id, order_id: selectedOrder, reason, description: description || null,
    });
    if (error) { toast.error(t('account.failedSubmitRequest')); }
    else {
      toast.success(t('account.returnSubmitted'));
      setOpen(false); setSelectedOrder(""); setReason(""); setDescription("");
      fetchData();
    }
    setSubmitting(false);
  };

  if (loading) return <DelayedLoader><GenericListSkeleton /></DelayedLoader>;

  return (
    <>
    <SEOHead title="Returns" noIndex />
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-xs text-muted-foreground">
          {t('account.returnWindowMsg')} {returnWindowDays} {t('account.daysOfDelivery')}
        </p>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" disabled={orders.length === 0}><Plus className="h-4 w-4 mr-1.5" />{t('account.newRequest')}</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{t('account.submitReturnRequest')}</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>{t('account.selectOrder')}</Label>
                <Select value={selectedOrder} onValueChange={setSelectedOrder}>
                  <SelectTrigger><SelectValue placeholder={t('account.chooseOrder')} /></SelectTrigger>
                  <SelectContent>
                    {orders.map((o) => (
                      <SelectItem key={o.id} value={o.id}>#{o.order_number} — {format(new Date(o.created_at), "MMM dd, yyyy")}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{t('account.reason')}</Label>
                <Select value={reason} onValueChange={setReason}>
                  <SelectTrigger><SelectValue placeholder={t('account.selectReason')} /></SelectTrigger>
                  <SelectContent>
                    {REASONS.map((r) => (<SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{t('account.detailsOptional')}</Label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t('account.describeIssue')} rows={3} />
              </div>
              <Button onClick={handleSubmit} disabled={submitting} className="w-full">
                {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : null}
                {t('account.submitRequest')}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {requests.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <RotateCcw className="h-12 w-12 mx-auto mb-3 opacity-40" />
            <p>{t('account.noReturnRequests')}</p>
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
                    <p className="text-xs text-muted-foreground">{format(new Date(r.created_at), "MMM dd, yyyy HH:mm")}</p>
                    {r.admin_notes && (
                      <p className="text-xs text-foreground mt-1 p-2 bg-muted rounded">
                        <strong>{t('account.admin')}:</strong> {r.admin_notes}
                      </p>
                    )}
                  </div>
                  <Badge variant={(statusColors[r.status] as any) || "secondary"}>{r.status}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
    </>
  );
}
