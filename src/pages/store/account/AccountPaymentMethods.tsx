import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { SEOHead } from "@/components/SEOHead";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, CreditCard, Plus, Trash2, Star } from "lucide-react";
import { DelayedLoader } from "@/components/ui/DelayedLoader";
import { GenericCardGridSkeleton } from "@/components/skeletons";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useEnabledPaymentMethods } from "@/hooks/useEnabledPaymentMethods";

export default function AccountPaymentMethods() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { paymentMethods: enabledMethods, loading: loadingMethods } = useEnabledPaymentMethods();
  const [methods, setMethods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [methodType, setMethodType] = useState("");
  const [label, setLabel] = useState("");
  const [lastFour, setLastFour] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchMethods = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase.from("saved_payment_methods").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    setMethods(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchMethods(); }, [user]);

  const handleAdd = async () => {
    if (!methodType || !label) { toast.error(t('account.fillAllFields')); return; }
    setSubmitting(true);
    const { error } = await supabase.from("saved_payment_methods").insert({
      user_id: user!.id, method_type: methodType, label, last_four: lastFour || null, is_default: methods.length === 0,
    });
    if (error) { toast.error(t('account.failedToAdd')); }
    else {
      toast.success(t('account.paymentMethodAdded'));
      setOpen(false); setMethodType(""); setLabel(""); setLastFour("");
      fetchMethods();
    }
    setSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("saved_payment_methods").delete().eq("id", id);
    if (!error) { toast.success(t('account.removed')); fetchMethods(); }
  };

  const handleSetDefault = async (id: string) => {
    await supabase.from("saved_payment_methods").update({ is_default: false }).eq("user_id", user!.id);
    await supabase.from("saved_payment_methods").update({ is_default: true }).eq("id", id);
    toast.success(t('account.defaultUpdated'));
    fetchMethods();
  };

  if (loading || loadingMethods) {
    return <DelayedLoader><GenericCardGridSkeleton count={3} /></DelayedLoader>;
  }

  const getIcon = (type: string) => enabledMethods.find((m) => m.code === type || m.method_id === type)?.icon || "💳";
  const getMethodName = (type: string) => enabledMethods.find((m) => m.code === type || m.method_id === type)?.name || type;

  return (
    <>
    <SEOHead title="Payment Methods" noIndex />
    <div className="space-y-6">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="h-4 w-4 mr-1.5" />{t('account.addMethod')}</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{t('account.addPaymentMethod')}</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>{t('account.type')}</Label>
                <Select value={methodType} onValueChange={setMethodType}>
                  <SelectTrigger><SelectValue placeholder={t('account.selectType')} /></SelectTrigger>
                  <SelectContent>
                    {METHOD_TYPES.map((m) => (
                      <SelectItem key={m.value} value={m.value}>{m.icon} {m.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{t('account.labelAccountName')}</Label>
                <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. Personal bKash" />
              </div>
              <div>
                <Label>{t('account.lastFourDigits')}</Label>
                <Input value={lastFour} onChange={(e) => setLastFour(e.target.value)} placeholder="1234" maxLength={4} />
              </div>
              <Button onClick={handleAdd} disabled={submitting} className="w-full">
                {submitting && <Loader2 className="h-4 w-4 animate-spin mr-1.5" />}
                {t('common.save')}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {methods.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <CreditCard className="h-12 w-12 mx-auto mb-3 opacity-40" />
            <p>{t('account.noSavedPayments')}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {methods.map((m) => (
            <Card key={m.id}>
              <CardContent className="flex items-center justify-between py-4 flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{getIcon(m.method_type)}</span>
                  <div>
                    <p className="font-semibold text-sm flex items-center gap-2">
                      {m.label}
                      {m.is_default && <Badge variant="default" className="text-[10px]">{t('account.default')}</Badge>}
                    </p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {m.method_type}{m.last_four && ` · •••• ${m.last_four}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {!m.is_default && (
                    <Button variant="ghost" size="sm" onClick={() => handleSetDefault(m.id)}>
                      <Star className="h-4 w-4" />
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => handleDelete(m.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
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
