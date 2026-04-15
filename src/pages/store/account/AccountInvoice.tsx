import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { SEOHead } from "@/components/SEOHead";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Download, FileText, Receipt } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { toast } from "sonner";
import { generateInvoicePDF, type InvoiceTemplateConfig } from "@/utils/generateInvoicePDF";
import { useDocumentTemplates } from "@/hooks/useDocumentTemplates";
import { usePageContent } from "@/hooks/useSiteContent";
import { formatPrice } from "@/lib/formatPrice";
import { motion } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
};

export default function AccountInvoice() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);
  const { getTemplateConfig } = useDocumentTemplates();
  const { data: headerContent } = usePageContent("header");
  const headerCont = (headerContent?.content as any) || {};

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      setLoading(true);
      const { data: customer } = await supabase.from("customers").select("id").eq("user_id", user.id).maybeSingle();
      if (!customer) { setLoading(false); return; }
      const { data } = await supabase
        .from("orders")
        .select("id, order_number, status, payment_status, total_amount, shipping_cost, discount_amount, created_at, payment_method, shipping_address")
        .eq("customer_id", customer.id).order("created_at", { ascending: false });
      if (data) {
        const withItems = await Promise.all(data.map(async (o) => {
          const { data: items } = await supabase.from("order_items").select("product_name, quantity, unit_price, total_price").eq("order_id", o.id);
          return { ...o, items: items || [] };
        }));
        setOrders(withItems);
      }
      setLoading(false);
    };
    fetch();
  }, [user]);

  const handleDownload = (order: any) => {
    setDownloading(order.id);
    try {
      const templateCfg = getTemplateConfig("invoice") as InvoiceTemplateConfig | undefined;
      // Merge store name from Header Settings if not set in template
      const headerStoreName = headerCont.store_name || "";
      const headerStoreLogo = headerCont.store_logo || "";
      const cfg: InvoiceTemplateConfig | undefined = templateCfg ? {
        ...templateCfg,
        store_name: headerStoreName || templateCfg.store_name || "YOUR STORE",
        store_logo_url: headerStoreLogo || templateCfg.store_logo_url || "",
      } : undefined;
      const addr = order.shipping_address;
      let addressStr = "N/A";
      if (addr) {
        if (typeof addr === "string") addressStr = addr;
        else addressStr = [addr.name, addr.address, addr.city, addr.area].filter(Boolean).join(", ");
      }
      const subtotal = order.items.reduce((s: number, i: any) => s + Number(i.total_price), 0);
      generateInvoicePDF({
        order_number: order.order_number,
        created_at: order.created_at,
        customer_name: addr?.name || "Customer",
        customer_email: "",
        customer_phone: addr?.phone || "",
        shipping_address: addressStr,
        items: order.items,
        subtotal,
        shipping_cost: order.shipping_cost || 0,
        discount: order.discount_amount || 0,
        total: order.total_amount,
        payment_method: order.payment_method || "N/A",
        payment_status: order.payment_status || "pending",
      }, cfg);
      toast.success(t('account.invoiceDownloaded'));
    } catch { toast.error(t('account.failedToGenerate')); }
    finally { setDownloading(null); }
  };

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <>
    <SEOHead title="Invoices" noIndex />
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
      {orders.length === 0 ? (
        <motion.div variants={itemVariants}>
          <Card className="border-dashed">
            <CardContent className="py-16 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                <Receipt className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-1">{t('account.noInvoices')}</h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">Your order invoices will appear here once you make a purchase</p>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        orders.map((order) => (
          <motion.div key={order.id} variants={itemVariants}>
            <Card className="hover:shadow-md transition-all hover:border-primary/30">
              <CardContent className="flex items-center justify-between py-4 flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">#{order.order_number}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(order.created_at), "MMM dd, yyyy")} · {formatPrice(order.total_amount)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={order.payment_status === "paid" ? "default" : "secondary"}>
                    {order.payment_status || t('account.pending')}
                  </Badge>
                  <Button size="sm" variant="outline" onClick={() => handleDownload(order)} disabled={downloading === order.id}>
                    {downloading === order.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                    <span className="ml-1.5">{t('common.download')}</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))
      )}
    </motion.div>
    </>
  );
}
