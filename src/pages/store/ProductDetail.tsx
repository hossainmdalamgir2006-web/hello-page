import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Minus, Plus, Heart, Truck, RefreshCw, Shield, ShoppingBag, Package, AlertTriangle, Star, Copy, Bell, Clock, CreditCard, Lock, Ruler } from "lucide-react";
import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ProductReviews } from "@/components/store/ProductReviews";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import { useProductVariants } from "@/hooks/useProductVariants";
import { useIsMobile } from "@/hooks/use-mobile";
import { useStoreSettings } from "@/hooks/useStoreSettings";
import { cn } from "@/lib/utils";

import { ProductImageGallery } from "@/components/product/ProductImageGallery";
import { ProductActions } from "@/components/product/ProductActions";
import { ProductTrustBadges } from "@/components/product/ProductTrustBadges";
import { RelatedProductsGrid } from "@/components/product/RelatedProductsGrid";
import { StickyAddToCartBar } from "@/components/product/StickyAddToCartBar";

// --- Types ---
interface Product {
  id: string; name: string; slug?: string; description: string | null;
  price: number; compare_at_price: number | null; images: string[];
  category: string | null; quantity: number; sku: string | null;
  product_type: string | null; brand?: string | null;
  video_url?: string | null; youtube_url?: string | null;
}

interface GroupChildProduct {
  id: string; name: string; price: number; compare_at_price: number | null;
  images: string[]; quantity: number; selected: boolean; childQuantity: number;
}

interface BundleChildProduct {
  id: string; name: string; price: number; images: string[]; quantity: number; bundleQty: number;
}

interface RelatedProduct {
  id: string; name: string; price: number; compare_at_price: number | null;
  images: string[]; category: string | null;
}

interface ReviewSummary { averageRating: number; totalReviews: number; distribution: Record<number, number>; }
interface ProductAttribute { id: string; attribute_name: string; attribute_values: string[]; }

// --- Helpers ---
function extractYoutubeId(url: string): string | null {
  const patterns = [/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/, /^([a-zA-Z0-9_-]{11})$/];
  for (const p of patterns) { const m = url.match(p); if (m) return m[1]; }
  return null;
}

function useCountdown(endTime: string | null) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [expired, setExpired] = useState(!endTime);
  useEffect(() => {
    if (!endTime) return;
    const update = () => {
      const diff = new Date(endTime).getTime() - Date.now();
      if (diff <= 0) { setExpired(true); return; }
      setTimeLeft({ days: Math.floor(diff / 86400000), hours: Math.floor((diff % 86400000) / 3600000), minutes: Math.floor((diff % 3600000) / 60000), seconds: Math.floor((diff % 60000) / 1000) });
    };
    update();
    const i = setInterval(update, 1000);
    return () => clearInterval(i);
  }, [endTime]);
  return { timeLeft, expired };
}

function RatingStars({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} className={cn(s <= Math.round(rating) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30")} style={{ width: size, height: size }} />
      ))}
    </div>
  );
}

function SizeGuideModal({ sizeGuide, sizeGuideNote }: { sizeGuide: { size: string; chest: string; waist: string; hip: string }[]; sizeGuideNote: string }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="link" size="sm" className="text-store-primary p-0 h-auto"><Ruler className="h-3.5 w-3.5 mr-1" /> Size Guide</Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>Size Guide</DialogTitle></DialogHeader>
        <Table>
          <TableHeader><TableRow><TableHead>Size</TableHead><TableHead>Chest</TableHead><TableHead>Waist</TableHead><TableHead>Hip</TableHead></TableRow></TableHeader>
          <TableBody>
            {sizeGuide.map((r) => (<TableRow key={r.size}><TableCell className="font-medium">{r.size}</TableCell><TableCell>{r.chest}"</TableCell><TableCell>{r.waist}"</TableCell><TableCell>{r.hip}"</TableCell></TableRow>))}
          </TableBody>
        </Table>
        {sizeGuideNote && <p className="text-xs text-muted-foreground mt-2">{sizeGuideNote} <Link to="/size-guide" className="text-store-primary underline">Full guide →</Link></p>}
      </DialogContent>
    </Dialog>
  );
}

function CountdownBanner({ discount }: { discount: number }) {
  const [endTime] = useState(() => { const end = new Date(); end.setHours(end.getHours() + 24); return end.toISOString(); });
  const { timeLeft, expired } = useCountdown(endTime);
  if (expired) return null;
  return (
    <div className="mb-4 p-3 rounded-lg bg-gradient-to-r from-store-secondary/10 to-store-accent/10 border border-store-secondary/20">
      <div className="flex items-center gap-2 mb-2"><Clock className="h-4 w-4 text-store-secondary" /><span className="text-sm font-semibold text-store-secondary">Limited Time Offer — {discount}% OFF</span></div>
      <div className="flex gap-2">
        {[{ label: 'D', value: timeLeft.days }, { label: 'H', value: timeLeft.hours }, { label: 'M', value: timeLeft.minutes }, { label: 'S', value: timeLeft.seconds }].map(({ label, value }) => (
          <div key={label} className="bg-background rounded-md px-2 py-1 text-center min-w-[40px] shadow-sm">
            <div className="text-lg font-bold text-foreground">{String(value).padStart(2, '0')}</div>
            <div className="text-[10px] text-muted-foreground">{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addItem, setIsOpen } = useCart();
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlist();
  const { addItem: trackView } = useRecentlyViewed();
  const isMobile = useIsMobile();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const [groupChildren, setGroupChildren] = useState<GroupChildProduct[]>([]);
  const [bundleChildren, setBundleChildren] = useState<BundleChildProduct[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<RelatedProduct[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [reviewSummary, setReviewSummary] = useState<ReviewSummary>({ averageRating: 0, totalReviews: 0, distribution: {} });
  const [attributes, setAttributes] = useState<ProductAttribute[]>([]);
  const [notifyEmail, setNotifyEmail] = useState("");
  const [showNotifyForm, setShowNotifyForm] = useState(false);
  const [showCompare, setShowCompare] = useState(false);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const actionsRef = useRef<HTMLDivElement>(null);

  const { variants } = useProductVariants(product?.id || null);
  const { getSettingValue } = useStoreSettings();
  const inWishlist = product ? isInWishlist(product.id) : false;

  const trustBadges = useMemo(() => {
    const raw = getSettingValue("PRODUCT_TRUST_BADGES");
    if (raw) { try { return JSON.parse(raw); } catch {} }
    return [{ icon: "truck", label: "Free Shipping", enabled: true }, { icon: "refresh", label: "7-Day Returns", enabled: true }, { icon: "lock", label: "SSL Secured", enabled: true }, { icon: "credit-card", label: "Safe Payment", enabled: true }];
  }, [getSettingValue]);

  const sizeGuide = useMemo(() => {
    const raw = getSettingValue("PRODUCT_SIZE_GUIDE");
    if (raw) { try { return JSON.parse(raw); } catch {} }
    return [{ size: "S", chest: "36-38", waist: "28-30", hip: "36-38" }, { size: "M", chest: "38-40", waist: "30-32", hip: "38-40" }, { size: "L", chest: "40-42", waist: "32-34", hip: "40-42" }, { size: "XL", chest: "42-44", waist: "34-36", hip: "42-44" }, { size: "XXL", chest: "44-46", waist: "36-38", hip: "44-46" }];
  }, [getSettingValue]);

  const sizeGuideEnabled = getSettingValue("PRODUCT_SIZE_GUIDE_ENABLED") !== "false";
  const sizeGuideNote = getSettingValue("PRODUCT_SIZE_GUIDE_NOTE") || "Between sizes? Go up for comfort.";

  const handleWishlistToggle = () => { if (!product) return; inWishlist ? removeFromWishlist(product.id) : addToWishlist(product.id); };

  // Sticky bar observer
  useEffect(() => {
    if (!actionsRef.current) return;
    const observer = new IntersectionObserver(([entry]) => setShowStickyBar(!entry.isIntersecting), { threshold: 0 });
    observer.observe(actionsRef.current);
    return () => observer.disconnect();
  }, [product]);

  useEffect(() => { fetchProduct(); }, [slug]);

  const activeVariant = useMemo(() => { if (!selectedVariant) return null; return variants.find(v => v.id === selectedVariant) || null; }, [selectedVariant, variants]);

  useEffect(() => { if (activeVariant?.image_url && product?.images) { const idx = product.images.indexOf(activeVariant.image_url); if (idx >= 0) setSelectedImageIndex(idx); } }, [activeVariant, product?.images]);

  const fetchProduct = async () => {
    if (!slug) return;
    setLoading(true);
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);
    const query = supabase.from("products").select("id, name, description, price, compare_at_price, images, category, quantity, sku, product_type, brand, video_url, youtube_url, slug");
    const { data, error } = isUUID ? await query.eq("id", slug).single() : await query.eq("slug", slug).single();

    if (!error && data) {
      const p: Product = {
        id: data.id, name: data.name, description: data.description, price: Number(data.price),
        compare_at_price: data.compare_at_price ? Number(data.compare_at_price) : null,
        images: data.images || [], category: data.category, quantity: data.quantity, sku: data.sku,
        product_type: (data as any).product_type || 'simple', slug: (data as any).slug || undefined,
        brand: (data as any).brand || null, video_url: (data as any).video_url || null, youtube_url: (data as any).youtube_url || null,
      };
      setProduct(p);
      setSelectedImageIndex(0);
      trackView({ id: p.id, name: p.name, price: p.price, compare_at_price: p.compare_at_price, image: p.images?.[0] || '/placeholder.svg', category: p.category });

      const { data: reviews } = await supabase.from('product_reviews').select('rating').eq('product_id', p.id).eq('is_approved', true);
      if (reviews && reviews.length > 0) {
        const dist: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        let sum = 0;
        reviews.forEach((r: any) => { dist[r.rating] = (dist[r.rating] || 0) + 1; sum += r.rating; });
        setReviewSummary({ averageRating: sum / reviews.length, totalReviews: reviews.length, distribution: dist });
      }

      const { data: attrs } = await supabase.from('product_attribute_definitions').select('id, attribute_name, attribute_values').eq('product_id', p.id).order('sort_order', { ascending: true });
      if (attrs) setAttributes(attrs as ProductAttribute[]);

      if (p.product_type === 'grouped') {
        const { data: groupItems } = await supabase.from('product_group_items').select('child_product_id, quantity').eq('parent_product_id', p.id).order('sort_order', { ascending: true });
        if (groupItems && groupItems.length > 0) {
          const childIds = groupItems.map((g: any) => g.child_product_id);
          const { data: childProducts } = await supabase.from('products').select('id, name, price, compare_at_price, images, quantity').in('id', childIds);
          if (childProducts) {
            const ordered = childIds.map(cid => (childProducts as any[]).find(cp => cp.id === cid)).filter(Boolean);
            setGroupChildren(ordered.map((cp: any) => ({ id: cp.id, name: cp.name, price: Number(cp.price), compare_at_price: cp.compare_at_price ? Number(cp.compare_at_price) : null, images: cp.images || [], quantity: cp.quantity || 0, selected: true, childQuantity: 1 })));
          }
        }
      }

      if (p.product_type === 'bundle') {
        const { data: bundleItems } = await supabase.from('product_group_items').select('child_product_id, quantity').eq('parent_product_id', p.id).order('sort_order', { ascending: true });
        if (bundleItems && bundleItems.length > 0) {
          const childIds = bundleItems.map((b: any) => b.child_product_id);
          const { data: childProducts } = await supabase.from('products').select('id, name, price, images, quantity').in('id', childIds);
          if (childProducts) {
            const ordered = childIds.map((cid, idx) => { const cp = (childProducts as any[]).find(cp => cp.id === cid); const bi = (bundleItems as any[])[idx]; return cp ? { ...cp, bundleQty: bi?.quantity || 1 } : null; }).filter(Boolean);
            setBundleChildren(ordered.map((cp: any) => ({ id: cp.id, name: cp.name, price: Number(cp.price), images: cp.images || [], quantity: cp.quantity || 0, bundleQty: cp.bundleQty })));
          }
        }
      }

      if (p.category) {
        const { data: related } = await supabase.from('products').select('id, name, price, compare_at_price, images, category').eq('category', p.category).eq('is_active', true).is('deleted_at', null).neq('id', p.id).limit(4);
        if (related) setRelatedProducts(related.map((r: any) => ({ id: r.id, name: r.name, price: Number(r.price), compare_at_price: r.compare_at_price ? Number(r.compare_at_price) : null, images: r.images || [], category: r.category })));
      }
    }
    setLoading(false);
  };

  const isGrouped = product?.product_type === 'grouped';
  const isBundle = product?.product_type === 'bundle';
  const selectedChildren = groupChildren.filter(c => c.selected);

  const displayPrice = isGrouped ? selectedChildren.reduce((sum, c) => sum + c.price * c.childQuantity, 0) : (activeVariant?.price ?? product?.price ?? 0);
  const displayComparePrice = isGrouped ? (selectedChildren.some(c => c.compare_at_price) ? selectedChildren.reduce((sum, c) => sum + (c.compare_at_price || c.price) * c.childQuantity, 0) : null) : (activeVariant?.compare_at_price ?? product?.compare_at_price ?? null);
  const displayQuantity = isGrouped ? (selectedChildren.length > 0 ? Math.min(...selectedChildren.map(c => Math.floor(c.quantity / c.childQuantity))) : 0) : (activeVariant ? (activeVariant.quantity || 0) : (product?.quantity ?? 0));

  const toggleGroupChild = (childId: string) => { setGroupChildren(prev => prev.map(c => c.id === childId ? { ...c, selected: !c.selected } : c)); };
  const updateGroupChildQuantity = (childId: string, qty: number) => { setGroupChildren(prev => prev.map(c => c.id === childId ? { ...c, childQuantity: Math.max(1, Math.min(qty, c.quantity)) } : c)); };

  const handleAddToCart = useCallback(() => {
    if (!product) return;
    if (isGrouped) {
      if (selectedChildren.length === 0) { toast.error("Please select at least one product"); return; }
      for (const child of selectedChildren) addItem({ id: child.id, name: child.name, price: child.price, comparePrice: child.compare_at_price || undefined, image: child.images?.[0] || "/placeholder.svg" }, child.childQuantity);
      toast.success(`${selectedChildren.length} items added to cart!`);
      return;
    }
    if (isBundle) { addItem({ id: product.id, name: product.name, price: displayPrice, comparePrice: displayComparePrice || undefined, image: product.images?.[0] || "/placeholder.svg" }, quantity); toast.success("Bundle added to cart!"); return; }
    if (variants.length > 0 && !selectedVariant) { toast.error("Please select a variant"); return; }
    const imageUrl = activeVariant?.image_url || (product.images.length > 0 ? product.images[0] : "/placeholder.svg");
    addItem({ id: product.id, name: product.name + (activeVariant ? ` - ${activeVariant.name}` : ""), price: displayPrice, comparePrice: displayComparePrice || undefined, image: imageUrl, size: activeVariant?.name || undefined }, quantity);
    toast.success("Added to cart!");
  }, [product, isGrouped, isBundle, selectedChildren, quantity, variants, selectedVariant, activeVariant, displayPrice, displayComparePrice, addItem]);

  const handleBuyNow = () => { handleAddToCart(); setIsOpen(false); navigate("/checkout"); };

  const discount = displayComparePrice ? Math.round((1 - displayPrice / displayComparePrice) * 100) : 0;

  const currentImage = useMemo(() => {
    if (activeVariant?.image_url) return activeVariant.image_url;
    if (product?.images && product.images.length > selectedImageIndex) return product.images[selectedImageIndex];
    return product?.images?.[0] || "/placeholder.svg";
  }, [product?.images, selectedImageIndex, activeVariant]);

  const youtubeId = useMemo(() => product?.youtube_url ? extractYoutubeId(product.youtube_url) : null, [product?.youtube_url]);

  const handleShare = (platform: string) => {
    const url = window.location.href;
    const text = `Check out ${product?.name}`;
    if (platform === 'whatsapp') window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
    else if (platform === 'facebook') window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
    else { navigator.clipboard.writeText(url); toast.success("Link copied!"); }
  };

  const handleNotifySubmit = () => {
    if (!notifyEmail) { toast.error("Please enter your email"); return; }
    toast.success("We'll notify you when this product is back in stock!");
    setShowNotifyForm(false);
    setNotifyEmail("");
  };

  const hasFlashSale = discount > 0 && product?.compare_at_price;

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="aspect-square bg-muted rounded-lg animate-pulse" />
          <div className="space-y-4">
            <div className="h-8 bg-muted rounded w-3/4 animate-pulse" />
            <div className="h-6 bg-muted rounded w-1/4 animate-pulse" />
            <div className="h-24 bg-muted rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="font-display text-2xl font-bold mb-4">Product Not Found</h1>
        <p className="text-muted-foreground mb-6">The product you're looking for doesn't exist.</p>
        <Button asChild><Link to="/products">Back to Products</Link></Button>
      </div>
    );
  }

  const productJsonLd = {
    "@context": "https://schema.org", "@type": "Product", name: product.name,
    description: product.description || undefined, image: product.images?.[0], sku: product.sku || undefined,
    brand: product.brand ? { "@type": "Brand", name: product.brand } : undefined,
    offers: { "@type": "Offer", price: displayPrice, priceCurrency: "BDT", availability: displayQuantity > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock" },
    ...(reviewSummary.totalReviews > 0 && { aggregateRating: { "@type": "AggregateRating", ratingValue: reviewSummary.averageRating.toFixed(1), reviewCount: reviewSummary.totalReviews } }),
  };

  return (
    <>
      <SEOHead title={product.name} description={product.description?.slice(0, 160) || `Buy ${product.name} online`} canonicalPath={`/product/${product.slug || product.id}`} ogImage={product.images?.[0]} ogType="product" jsonLd={productJsonLd} />

      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* Image Gallery */}
          <ProductImageGallery
            images={product.images} productName={product.name} videoUrl={product.video_url}
            youtubeId={youtubeId} discount={discount} isBundle={isBundle} isMobile={isMobile}
            selectedImageIndex={selectedImageIndex} onSelectImage={setSelectedImageIndex} currentImage={currentImage}
          />

          {/* Product Info */}
          <div>
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-sm text-muted-foreground">{product.category}</p>
                {product.brand && <Badge variant="outline" className="text-xs">{product.brand}</Badge>}
              </div>
              <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">{product.name}</h1>
              {reviewSummary.totalReviews > 0 && (
                <div className="flex items-center gap-2 mb-2">
                  <RatingStars rating={reviewSummary.averageRating} size={18} />
                  <span className="text-sm font-medium">{reviewSummary.averageRating.toFixed(1)}</span>
                  <span className="text-sm text-muted-foreground">({reviewSummary.totalReviews} reviews)</span>
                </div>
              )}
              {product.sku && (
                <div className="flex items-center gap-2">
                  <p className="text-sm text-muted-foreground">SKU: {product.sku}</p>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => { navigator.clipboard.writeText(product.sku!); toast.success("SKU copied!"); }}><Copy className="h-3 w-3" /></Button>
                </div>
              )}
            </div>

            {hasFlashSale && <CountdownBanner discount={discount} />}

            {/* Price */}
            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl font-bold text-foreground">{isGrouped && selectedChildren.length > 0 ? 'Total: ' : ''}৳{displayPrice.toLocaleString()}</span>
              {displayComparePrice && <span className="text-xl text-muted-foreground line-through">৳{displayComparePrice.toLocaleString()}</span>}
              {discount > 0 && <Badge className="bg-store-accent text-store-accent-foreground">Save ৳{((displayComparePrice || 0) - displayPrice).toLocaleString()}</Badge>}
            </div>

            {/* Stock */}
            <div className="mb-6 space-y-2">
              {displayQuantity > 0 ? (
                <>
                  <Badge variant="outline" className="text-success border-success">In Stock ({displayQuantity} available)</Badge>
                  {displayQuantity <= 5 && <div className="flex items-center gap-2 text-warning text-sm"><AlertTriangle className="h-4 w-4" /><span>Only {displayQuantity} left in stock — order soon!</span></div>}
                </>
              ) : (
                <div className="space-y-3">
                  <Badge variant="outline" className="text-destructive border-destructive">Out of Stock</Badge>
                  {!showNotifyForm ? (
                    <Button variant="outline" size="sm" onClick={() => setShowNotifyForm(true)}><Bell className="h-4 w-4 mr-2" /> Notify When Available</Button>
                  ) : (
                    <div className="flex gap-2">
                      <Input placeholder="Your email" type="email" value={notifyEmail} onChange={(e) => setNotifyEmail(e.target.value)} className="max-w-[200px]" />
                      <Button size="sm" onClick={handleNotifySubmit} className="bg-store-primary hover:bg-store-primary/90">Notify Me</Button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <Separator className="my-6" />

            {/* Bundle Items */}
            {isBundle && bundleChildren.length > 0 && (
              <div className="mb-6">
                <h4 className="font-medium mb-3 flex items-center gap-2"><Package className="h-4 w-4" /> This bundle includes ({bundleChildren.length} items)</h4>
                <div className="space-y-2">
                  {bundleChildren.map((child) => (
                    <Card key={child.id} className="border-dashed">
                      <CardContent className="p-3 flex items-center gap-3">
                        <Link to={`/product/${child.id}`} className="h-12 w-12 rounded bg-muted overflow-hidden shrink-0"><img src={child.images?.[0] || '/placeholder.svg'} alt={child.name} className="h-full w-full object-cover" /></Link>
                        <div className="flex-1 min-w-0"><Link to={`/product/${child.id}`} className="text-sm font-medium truncate block hover:text-store-primary transition-colors">{child.name}</Link><span className="text-xs text-muted-foreground">Qty: {child.bundleQty}</span></div>
                        <span className="text-sm font-bold">৳{child.price.toLocaleString()}</span>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Grouped Items */}
            {isGrouped && groupChildren.length > 0 && (
              <div className="mb-6">
                <h4 className="font-medium mb-3 flex items-center gap-2"><Package className="h-4 w-4" /> Products in this group ({selectedChildren.length}/{groupChildren.length} selected)</h4>
                <div className="space-y-2">
                  {groupChildren.map((child) => {
                    const childDiscount = child.compare_at_price ? Math.round((1 - child.price / child.compare_at_price) * 100) : 0;
                    return (
                      <Card key={child.id} className={cn("transition-all", child.selected ? "border-store-primary/50 bg-store-primary/5" : "opacity-60")}>
                        <CardContent className="p-3 flex items-center gap-3">
                          <Checkbox checked={child.selected} onCheckedChange={() => toggleGroupChild(child.id)} disabled={child.quantity === 0} />
                          <Link to={`/product/${child.id}`} className="h-12 w-12 rounded bg-muted overflow-hidden shrink-0"><img src={child.images?.[0] || '/placeholder.svg'} alt={child.name} className="h-full w-full object-cover" /></Link>
                          <div className="flex-1 min-w-0">
                            <Link to={`/product/${child.id}`} className="text-sm font-medium truncate block hover:text-store-primary transition-colors">{child.name}</Link>
                            <div className="flex items-center gap-2"><span className="text-sm font-bold">৳{child.price.toLocaleString()}</span>{child.compare_at_price && <span className="text-xs text-muted-foreground line-through">৳{child.compare_at_price.toLocaleString()}</span>}{childDiscount > 0 && <Badge variant="secondary" className="text-xs">{childDiscount}% OFF</Badge>}</div>
                          </div>
                          {child.selected && child.quantity > 0 && (
                            <div className="flex items-center border rounded-lg">
                              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => updateGroupChildQuantity(child.id, child.childQuantity - 1)} disabled={child.childQuantity <= 1}><Minus className="h-3 w-3" /></Button>
                              <span className="w-8 text-center text-sm">{child.childQuantity}</span>
                              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => updateGroupChildQuantity(child.id, child.childQuantity + 1)} disabled={child.childQuantity >= child.quantity}><Plus className="h-3 w-3" /></Button>
                            </div>
                          )}
                          {child.quantity === 0 ? <Badge variant="outline" className="text-destructive text-xs">Out of Stock</Badge> : !child.selected ? <Badge variant="outline" className="text-xs">{child.quantity} in stock</Badge> : null}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Variants */}
            {variants.length > 0 && !isGrouped && !isBundle && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium">Select Variant</h4>
                  {sizeGuideEnabled && <SizeGuideModal sizeGuide={sizeGuide} sizeGuideNote={sizeGuideNote} />}
                </div>
                <div className="flex flex-wrap gap-2">
                  {variants.filter(v => v.is_active).map((variant) => (
                    <Button key={variant.id} variant={selectedVariant === variant.id ? "default" : "outline"} className={cn(selectedVariant === variant.id ? "bg-store-primary hover:bg-store-primary/90" : "", (variant.quantity || 0) === 0 && "opacity-50")} onClick={() => setSelectedVariant(variant.id)} disabled={(variant.quantity || 0) === 0}>
                      <span>{variant.name}</span>{variant.price != null && <span className="ml-1 text-xs opacity-75">৳{variant.price.toLocaleString()}</span>}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            {!isGrouped && (
              <div className="mb-6">
                <h4 className="font-medium mb-3">Quantity</h4>
                <div className="flex items-center gap-3">
                  <div className="flex items-center border rounded-lg">
                    <Button variant="ghost" size="icon" onClick={() => setQuantity(Math.max(1, quantity - 1))} disabled={quantity <= 1}><Minus className="h-4 w-4" /></Button>
                    <span className="w-12 text-center font-medium">{quantity}</span>
                    <Button variant="ghost" size="icon" onClick={() => setQuantity(Math.min(displayQuantity, quantity + 1))} disabled={quantity >= displayQuantity}><Plus className="h-4 w-4" /></Button>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <ProductActions
              ref={actionsRef}
              onAddToCart={handleAddToCart}
              onBuyNow={handleBuyNow}
              onWishlistToggle={handleWishlistToggle}
              onShare={handleShare}
              onToggleCompare={() => setShowCompare(!showCompare)}
              inWishlist={inWishlist}
              disabled={displayQuantity === 0}
              hasRelated={relatedProducts.length > 0}
              showCompare={showCompare}
            />

            {/* Trust Badges */}
            <ProductTrustBadges badges={trustBadges} />
          </div>
        </div>

        {/* Compare */}
        {showCompare && relatedProducts.length > 0 && (
          <div className="mt-8 mb-8">
            <h3 className="font-display text-xl font-bold mb-4">Compare Products</h3>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[120px]">Feature</TableHead>
                    <TableHead className="min-w-[150px] text-center font-bold text-store-primary">{product.name}</TableHead>
                    {relatedProducts.slice(0, 3).map(rp => (<TableHead key={rp.id} className="min-w-[150px] text-center"><Link to={`/product/${rp.id}`} className="hover:text-store-primary">{rp.name}</Link></TableHead>))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow><TableCell className="font-medium">Price</TableCell><TableCell className="text-center font-bold">৳{product.price.toLocaleString()}</TableCell>{relatedProducts.slice(0, 3).map(rp => (<TableCell key={rp.id} className="text-center">৳{rp.price.toLocaleString()}</TableCell>))}</TableRow>
                  <TableRow><TableCell className="font-medium">Category</TableCell><TableCell className="text-center">{product.category || 'N/A'}</TableCell>{relatedProducts.slice(0, 3).map(rp => (<TableCell key={rp.id} className="text-center">{rp.category || 'N/A'}</TableCell>))}</TableRow>
                  <TableRow><TableCell className="font-medium">Brand</TableCell><TableCell className="text-center">{product.brand || 'N/A'}</TableCell>{relatedProducts.slice(0, 3).map(rp => (<TableCell key={rp.id} className="text-center">—</TableCell>))}</TableRow>
                  <TableRow><TableCell className="font-medium">Stock</TableCell><TableCell className="text-center"><Badge variant={displayQuantity > 0 ? "outline" : "destructive"} className="text-xs">{displayQuantity > 0 ? 'In Stock' : 'Out of Stock'}</Badge></TableCell>{relatedProducts.slice(0, 3).map(rp => (<TableCell key={rp.id} className="text-center"><Badge variant="outline" className="text-xs">Available</Badge></TableCell>))}</TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="mt-12">
          <Tabs defaultValue="description">
            <TabsList className="w-full justify-start border-b rounded-none bg-transparent h-auto p-0 flex-wrap">
              <TabsTrigger value="description" className="rounded-none border-b-2 border-transparent data-[state=active]:border-store-primary data-[state=active]:bg-transparent">Description</TabsTrigger>
              {attributes.length > 0 && <TabsTrigger value="specifications" className="rounded-none border-b-2 border-transparent data-[state=active]:border-store-primary data-[state=active]:bg-transparent">Specifications</TabsTrigger>}
              <TabsTrigger value="details" className="rounded-none border-b-2 border-transparent data-[state=active]:border-store-primary data-[state=active]:bg-transparent">Details</TabsTrigger>
              <TabsTrigger value="reviews" className="rounded-none border-b-2 border-transparent data-[state=active]:border-store-primary data-[state=active]:bg-transparent">Reviews ({reviewSummary.totalReviews})</TabsTrigger>
            </TabsList>
            <TabsContent value="description" className="py-6"><div className="prose max-w-none"><p className="text-muted-foreground">{product.description || "No description available."}</p></div></TabsContent>
            {attributes.length > 0 && (
              <TabsContent value="specifications" className="py-6">
                <Table><TableBody>{attributes.map((attr) => (<TableRow key={attr.id}><TableCell className="font-medium w-1/3">{attr.attribute_name}</TableCell><TableCell>{attr.attribute_values.join(', ')}</TableCell></TableRow>))}</TableBody></Table>
              </TabsContent>
            )}
            <TabsContent value="details" className="py-6">
              <ul className="space-y-2 text-muted-foreground">
                <li><strong>Category:</strong> {product.category || "N/A"}</li>
                <li><strong>SKU:</strong> {product.sku || "N/A"}</li>
                {product.brand && <li><strong>Brand:</strong> {product.brand}</li>}
                <li><strong>Type:</strong> {product.product_type || "Simple"}</li>
              </ul>
            </TabsContent>
            <TabsContent value="reviews" className="py-6"><ProductReviews productId={product.id} /></TabsContent>
          </Tabs>
        </div>

        {/* Related Products */}
        <RelatedProductsGrid products={relatedProducts} />
      </div>

      {/* Sticky Mobile Bar */}
      {isMobile && displayQuantity > 0 && (
        <StickyAddToCartBar
          productName={product.name}
          displayPrice={displayPrice}
          onAddToCart={handleAddToCart}
          onBuyNow={handleBuyNow}
          visible={showStickyBar}
        />
      )}
    </>
  );
}
