import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { SEOHead } from "@/components/SEOHead";
import { supabase } from "@/integrations/supabase/client";
import { CreditCard, Trash2, Star } from "lucide-react";
import { DelayedLoader } from "@/components/ui/DelayedLoader";
import { GenericCardGridSkeleton } from "@/components/skeletons";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useEnabledPaymentMethods } from "@/hooks/useEnabledPaymentMethods";
import { motion } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
};

export default function AccountPaymentMethods() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { paymentMethods: enabledMethods, loading: loadingMethods } = useEnabledPaymentMethods();
  const [methods, setMethods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMethods = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase.from("saved_payment_methods").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    setMethods(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchMethods(); }, [user]);

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

  if (loading || loadingMethods) return <DelayedLoader><GenericCardGridSkeleton count={3} /></DelayedLoader>;

  const getIcon = (type: string) => enabledMethods.find((m) => m.code === type || m.method_id === type)?.icon || "💳";
  const getMethodName = (type: string) => enabledMethods.find((m) => m.code === type || m.method_id === type)?.name || type;

  return (
    <>
    <SEOHead title="Payment Methods" noIndex />
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      {methods.length === 0 ? (
        <motion.div variants={itemVariants}>
          <Card className="border-dashed">
            <CardContent className="py-16 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                <CreditCard className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-1">{t('account.noSavedPayments')}</h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">Your payment methods from orders will appear here</p>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {methods.map((m) => (
            <motion.div key={m.id} variants={itemVariants}>
              <Card className="hover:shadow-md transition-all hover:border-primary/30">
                <CardContent className="flex items-center justify-between py-4 flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getIcon(m.method_type)}</span>
                    <div>
                      <p className="font-semibold text-sm flex items-center gap-2">
                        {m.label}
                        {m.is_default && <Badge variant="default" className="text-[10px]">{t('account.default')}</Badge>}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {getMethodName(m.method_type)}{m.last_four && ` · •••• ${m.last_four}`}
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
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
    </>
  );
}
