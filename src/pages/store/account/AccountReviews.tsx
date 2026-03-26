import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { SEOHead } from "@/components/SEOHead";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Star, MessageSquare, Plus } from "lucide-react";
import { DelayedLoader } from "@/components/ui/DelayedLoader";
import { GenericListSkeleton } from "@/components/skeletons";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export default function AccountReviews() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [reviews, setReviews] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    const { data: reviewsData } = await supabase.from("product_reviews").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    const productIds = (reviewsData || []).map((r: any) => r.product_id).filter(Boolean);
    let productMap: Record<string, string> = {};
    if (productIds.length > 0) {
      const { data: prods } = await supabase.from("products").select("id, name").in("id", productIds);
      prods?.forEach((p: any) => { productMap[p.id] = p.name; });
    }
    setReviews((reviewsData || []).map((r: any) => ({ ...r, product_name: productMap[r.product_id] || "Unknown Product" })));
    const { data: customer } = await supabase.from("customers").select("id").eq("user_id", user.id).maybeSingle();
    if (customer) {
      const { data: orderItems } = await supabase.from("orders").select("id").eq("customer_id", customer.id).eq("status", "delivered");
      if (orderItems && orderItems.length > 0) {
        const orderIds = orderItems.map((o: any) => o.id);
        const { data: items } = await supabase.from("order_items").select("product_id, product_name").in("order_id", orderIds);
        const reviewedIds = new Set((reviewsData || []).map((r: any) => r.product_id));
        const uniqueProducts = new Map<string, string>();
        (items || []).forEach((i: any) => {
          if (i.product_id && !reviewedIds.has(i.product_id)) uniqueProducts.set(i.product_id, i.product_name);
        });
        setProducts(Array.from(uniqueProducts, ([id, name]) => ({ id, name })));
      }
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [user]);

  const handleSubmit = async () => {
    if (!selectedProduct || rating === 0) { toast.error(t('account.selectProductAndRating')); return; }
    setSubmitting(true);
    const { error } = await supabase.from("product_reviews").insert({
      user_id: user!.id, product_id: selectedProduct, rating, title: title || null, content: content || null, is_approved: null,
    });
    if (error) { toast.error(t('store.failedSubmitReview')); }
    else {
      toast.success(t('store.reviewSubmitted'));
      setOpen(false); setSelectedProduct(""); setRating(0); setTitle(""); setContent("");
      fetchData();
    }
    setSubmitting(false);
  };

  if (loading) return <DelayedLoader><GenericListSkeleton /></DelayedLoader>;

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" disabled={products.length === 0}>
              <Plus className="h-4 w-4 mr-1.5" />{t('account.writeReviewBtn')}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{t('store.writeReview')}</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>{t('account.product')}</Label>
                <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                  <SelectTrigger><SelectValue placeholder={t('account.selectProduct')} /></SelectTrigger>
                  <SelectContent>
                    {products.map((p) => (<SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{t('store.rating')}</Label>
                <div className="flex gap-1 mt-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button key={s} type="button" onMouseEnter={() => setHoverRating(s)} onMouseLeave={() => setHoverRating(0)} onClick={() => setRating(s)}>
                      <Star className={cn("h-7 w-7 transition-colors", (hoverRating || rating) >= s ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground")} />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label>{t('store.titleOptional')}</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t('account.greatProduct')} />
              </div>
              <div>
                <Label>{t('store.reviewLabel')}</Label>
                <Textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder={t('account.shareExperience')} rows={3} />
              </div>
              <Button onClick={handleSubmit} disabled={submitting} className="w-full">
                {submitting && <Loader2 className="h-4 w-4 animate-spin mr-1.5" />}
                {t('store.submitReview')}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {reviews.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-40" />
            <p>{t('account.noReviews')}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <Card key={r.id}>
              <CardContent className="py-4">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="space-y-1">
                    <p className="font-semibold text-sm">{r.product_name}</p>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className={cn("h-4 w-4", s <= r.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground")} />
                      ))}
                    </div>
                    {r.title && <p className="text-sm font-medium">{r.title}</p>}
                    {r.content && <p className="text-xs text-muted-foreground">{r.content}</p>}
                    <p className="text-xs text-muted-foreground">{format(new Date(r.created_at), "MMM dd, yyyy")}</p>
                  </div>
                  <Badge variant={r.is_approved ? "default" : "secondary"}>
                    {r.is_approved ? t('account.published') : t('account.pending')}
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
