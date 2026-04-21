import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Minus, Plus, X, ShoppingBag, ArrowLeft, Truck, Tag, Loader2, Sparkles, Heart, Bookmark, Share2, MessageSquare, PackageCheck, CheckSquare, Square, AlertTriangle, ShieldCheck, Lock, HelpCircle, Trash2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { useCart } from "@/contexts/CartContext";
import { useCoupon } from "@/hooks/useCoupon";
import { useAutoDiscountRules } from "@/hooks/useAutoDiscountRules";
import { useWishlist } from "@/contexts/WishlistContext";
import { FreeShippingProgress } from "@/components/store/FreeShippingProgress";
import { SEOHead } from "@/components/SEOHead";
import { toast } from "sonner";
import { useShippingRates } from "@/hooks/useShippingRates";
import { formatPrice } from "@/lib/formatPrice";

export default function Cart() {
  const { items, removeItem, updateQuantity, updateItemNote, subtotal, clearCart, savedItems, saveForLater, moveToCart, removeSavedItem, selectedKeys, toggleSelected, selectAll, deselectAll, selectedItems, selectedSubtotal, selectedCount, removeSelectedItems } = useCart();
  const { t } = useLanguage();
  const { appliedCoupon, loading: couponLoading, validateCoupon, removeCoupon } = useCoupon();
  const { calculateDiscount: calculateAutoDiscount, getActiveRules } = useAutoDiscountRules();
  const { addItem: addToWishlist } = useWishlist();
  const { rates } = useShippingRates();
  const [couponCode, setCouponCode] = useState("");
  const [expandedNotes, setExpandedNotes] = useState<Record<string, boolean>>({});
  const [stockData, setStockData] = useState<Record<string, number>>({});
  const navigate = useNavigate();

  // Fetch real-time stock for cart items
  useEffect(() => {
    const fetchStock = async () => {
      if (items.length === 0) return;
      const productIds = [...new Set(items.map(i => i.id))];
      const { data } = await (await import("@/integrations/supabase/client")).supabase
        .from('products')
        .select('id, quantity')
        .in('id', productIds);
      if (data) {
        const map: Record<string, number> = {};
        data.forEach(p => { map[p.id] = p.quantity; });
        setStockData(map);
      }
    };
    fetchStock();
  }, [items.length]);

  
  const checkoutSubtotal = selectedSubtotal;
  const autoDiscount = calculateAutoDiscount(checkoutSubtotal, selectedItems);
  const activeAutoRules = getActiveRules().filter(rule => {
    if (rule.rule_type === "cart_total") return rule.min_purchase && checkoutSubtotal >= rule.min_purchase;
    return true;
  });
  
  const couponDiscount = appliedCoupon?.discountAmount || 0;
  const discount = Math.max(couponDiscount, autoDiscount);
  const isAutoDiscountApplied = autoDiscount > couponDiscount && autoDiscount > 0;
  
  // Dynamic shipping cost from DB rates, fallback to default
  const shippingCost = (() => {
    // Find a matching rate based on order amount
    const matchingRate = rates.find(r => 
      r.is_active && 
      (r.min_order_amount === null || checkoutSubtotal >= r.min_order_amount) &&
      (r.max_order_amount === null || checkoutSubtotal <= r.max_order_amount)
    );
    if (matchingRate) return matchingRate.rate;
    // Fallback: free shipping over 2000, else 100
    return checkoutSubtotal >= 2000 ? 0 : 100;
  })();
  const total = checkoutSubtotal - discount + shippingCost;

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    await validateCoupon(couponCode, checkoutSubtotal);
  };

  const handleRemoveCoupon = () => {
    removeCoupon();
    setCouponCode("");
  };

  const handleProceedToCheckout = () => {
    if (selectedItems.length === 0) {
      toast.error("Please select at least one item to checkout");
      return;
    }
    navigate("/checkout", {
      state: isAutoDiscountApplied ? {
        autoDiscount, autoDiscountRuleName: activeAutoRules[0]?.name || "Auto Discount",
      } : appliedCoupon ? {
        couponId: appliedCoupon.coupon.id, couponCode: appliedCoupon.coupon.code, discountAmount: appliedCoupon.discountAmount,
      } : undefined,
    });
  };

  const handleShareCart = () => {
    const cartSummary = items.map(i => `${i.name} x${i.quantity}`).join('\n');
    const text = `My Cart:\n${cartSummary}\nTotal: ${formatPrice(subtotal)}`;
    if (navigator.share) {
      navigator.share({ title: 'My Shopping Cart', text });
    } else {
      navigator.clipboard.writeText(text);
      toast.success("Cart copied to clipboard!");
    }
  };

  const handleMoveToWishlist = (item: typeof items[0]) => {
    addToWishlist(item.id);
    removeItem(item.id, item.size, item.color);
  };

  const getItemKey = (item: { id: string; size?: string; color?: string }) => `${item.id}-${item.size}-${item.color}`;

  const handleQuantityInput = (item: typeof items[0], value: string) => {
    const num = parseInt(value, 10);
    const maxStock = stockData[item.id] ?? 99;
    if (!isNaN(num) && num > 0 && num <= maxStock) {
      updateQuantity(item.id, num, item.size, item.color);
    } else if (!isNaN(num) && num > maxStock) {
      updateQuantity(item.id, maxStock, item.size, item.color);
      toast.error(`Only ${maxStock} available in stock`);
    }
  };

  const getStockWarning = (item: typeof items[0]) => {
    const stock = stockData[item.id];
    if (stock === undefined) return null;
    if (stock <= 0) return { text: "Out of Stock", critical: true };
    if (stock <= 5) return { text: `Only ${stock} left in stock`, critical: false };
    if (item.quantity > stock) return { text: `Only ${stock} available`, critical: true };
    return null;
  };

  if (items.length === 0 && savedItems.length === 0) {
    return (
      <>
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-store-primary/10 to-store-secondary/10 flex items-center justify-center ring-1 ring-border/50">
            <ShoppingBag className="w-16 h-16 text-store-primary/70" />
          </div>
          <h1 className="font-display text-3xl font-bold mb-3 tracking-tight">{t('store.cartEmpty')}</h1>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            {t('store.cartEmptyDesc')}
          </p>
          <Button size="lg" className="bg-store-primary hover:bg-store-primary/90 rounded-full px-8" asChild>
            <Link to="/products">{t('store.startShopping')}</Link>
          </Button>
        </div>
      </>
    );
  }

  return (
    <>
      <SEOHead title={t('store.shoppingCart')} description="Review your shopping cart items and proceed to checkout." canonicalPath="/cart" noIndex />
      {/* Hero Banner - matching Contact page style */}
      <div className="relative overflow-hidden bg-gradient-to-br from-store-primary/10 via-store-primary/5 to-transparent">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-store-primary/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-store-primary/8 rounded-full blur-2xl" />
        </div>
        <div className="container mx-auto px-4 py-12 md:py-16 text-center relative z-10">
          <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-3">
            {t('store.shoppingCart')}
          </h1>
          <p className="text-muted-foreground text-base md:text-lg max-w-xl mx-auto">
            {items.length} {items.length === 1 ? 'item' : 'items'} in your bag
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Free Shipping Progress Bar */}
        <FreeShippingProgress subtotal={checkoutSubtotal} threshold={2000} className="mb-6" />

        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-3">
            <div className="flex justify-between items-center mb-2 px-1">
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={items.length > 0 && selectedKeys.size === items.length}
                  onCheckedChange={(checked) => checked ? selectAll() : deselectAll()}
                />
                <p className="text-sm text-muted-foreground">
                  {selectedKeys.size > 0 
                    ? `${selectedKeys.size} of ${items.length} selected`
                    : `${items.length} ${items.length === 1 ? 'item' : 'items'} in your cart`
                  }
                </p>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" onClick={handleShareCart} className="text-muted-foreground hover:text-foreground">
                  <Share2 className="h-4 w-4 mr-1" /> {t('store.share')}
                </Button>
                <Button variant="ghost" size="sm" onClick={clearCart} className="text-muted-foreground hover:text-destructive">
                  {t('store.clearCart')}
                </Button>
              </div>
            </div>

            {items.map((item) => {
              const key = getItemKey(item);
              const isSelected = selectedKeys.has(key);
              return (
                <Card key={key} className={`group rounded-2xl border transition-all duration-200 hover:shadow-md ${isSelected ? 'border-store-primary/40 bg-card shadow-sm' : 'border-border/60 bg-card/50 opacity-80'}`}>
                  <CardContent className="p-4 sm:p-5">
                    <div className="flex gap-4">
                      <div className="flex items-start pt-1">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleSelected(key)}
                        />
                      </div>
                      <Link to={`/product/${item.id}`} className="flex-shrink-0">
                        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-muted ring-1 ring-border/50">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                        </div>
                      </Link>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between gap-2">
                          <div>
                            <Link to={`/product/${item.id}`}>
                              <h3 className="font-medium text-foreground hover:text-store-primary transition-colors">{item.name}</h3>
                            </Link>
                            {(item.size || item.color) && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {item.size && `${t('store.sizeLabel')}: ${item.size}`}{item.size && item.color && ' • '}{item.color && `${t('store.colorLabel')}: ${item.color}`}
                              </p>
                            )}
                            {/* Stock Warning */}
                            {(() => {
                              const warning = getStockWarning(item);
                              if (warning) return (
                                <p className={`text-xs mt-1 flex items-center gap-1 ${warning.critical ? 'text-destructive font-medium' : 'text-warning'}`}>
                                  <AlertTriangle className="h-3 w-3" /> {warning.text}
                                </p>
                              );
                              return null;
                            })()}
                            {/* Estimated Delivery */}
                            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                              <PackageCheck className="h-3 w-3" /> {t('store.estimatedDelivery')}
                            </p>
                          </div>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive flex-shrink-0"
                            onClick={() => removeItem(item.id, item.size, item.color)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center gap-1 border border-border/70 rounded-full bg-background">
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full"
                              onClick={() => updateQuantity(item.id, item.quantity - 1, item.size, item.color)}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <Input
                              type="number"
                              min={1}
                              max={99}
                              value={item.quantity}
                              onChange={(e) => handleQuantityInput(item, e.target.value)}
                              className="w-10 h-8 text-center border-0 p-0 text-sm font-medium bg-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full"
                              onClick={() => {
                                const maxStock = stockData[item.id] ?? 99;
                                if (item.quantity >= maxStock) {
                                  toast.error(`Only ${maxStock} available in stock`);
                                  return;
                                }
                                updateQuantity(item.id, item.quantity + 1, item.size, item.color);
                              }}
                              disabled={stockData[item.id] !== undefined && item.quantity >= stockData[item.id]}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-foreground text-lg leading-tight">{formatPrice(item.price * item.quantity)}</p>
                            {item.comparePrice && (
                              <p className="text-xs text-muted-foreground line-through">{formatPrice(item.comparePrice * item.quantity)}</p>
                            )}
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex gap-2 mt-3 flex-wrap">
                          <Button variant="ghost" size="sm" className="h-7 text-xs px-2"
                            onClick={() => saveForLater(item.id, item.size, item.color)}
                          >
                            <Bookmark className="h-3 w-3 mr-1" /> {t('store.saveForLater')}
                          </Button>
                          <Button variant="ghost" size="sm" className="h-7 text-xs px-2"
                            onClick={() => handleMoveToWishlist(item)}
                          >
                            <Heart className="h-3 w-3 mr-1" /> {t('store.wishlist')}
                          </Button>
                          <Button variant="ghost" size="sm" className="h-7 text-xs px-2"
                            onClick={() => setExpandedNotes(prev => ({ ...prev, [key]: !prev[key] }))}
                          >
                            <MessageSquare className="h-3 w-3 mr-1" /> {item.note ? t('store.editNote') : t('store.addNote')}
                          </Button>
                        </div>

                        {/* Item Note */}
                        {expandedNotes[key] && (
                          <div className="mt-2">
                            <Input
                              placeholder="e.g. Gift wrap this item"
                              value={item.note || ''}
                              onChange={(e) => updateItemNote(item.id, e.target.value.slice(0, 200), item.size, item.color)}
                              maxLength={200}
                              className="h-8 text-sm"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {/* Saved for Later */}
            {savedItems.length > 0 && (
              <div className="mt-8">
                <h2 className="font-display text-lg font-semibold mb-4 flex items-center gap-2">
                  <Bookmark className="h-5 w-5" /> {t('store.savedForLater')} ({savedItems.length})
                </h2>
                <div className="space-y-3">
                  {savedItems.map((item) => (
                    <Card key={getItemKey(item)} className="bg-muted/30">
                      <CardContent className="p-3">
                        <div className="flex gap-3 items-center">
                          <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm truncate">{item.name}</h4>
                            <p className="text-sm font-semibold">{formatPrice(item.price)}</p>
                          </div>
                          <div className="flex gap-1">
                            <Button variant="outline" size="sm" className="h-8 text-xs"
                              onClick={() => moveToCart(item.id, item.size, item.color)}
                            >{t('store.moveToCart')}
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              onClick={() => removeSavedItem(item.id, item.size, item.color)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24 rounded-2xl border-border/60 shadow-sm overflow-hidden">
              <CardHeader className="bg-muted/30 border-b border-border/50 pb-4">
                <CardTitle className="text-base font-semibold tracking-tight">{t('store.orderSummary')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5 pt-5">
                {/* Coupon Code */}
                {appliedCoupon ? (
                  <div className="flex items-center justify-between p-3 bg-store-accent/10 rounded-xl border border-store-accent/30">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-store-accent/20 flex items-center justify-center">
                        <Tag className="h-4 w-4 text-store-accent" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{appliedCoupon.coupon.code}</p>
                        <p className="text-xs text-muted-foreground">
                          {appliedCoupon.coupon.discount_type === 'percentage'
                            ? `${appliedCoupon.coupon.discount_value}% off`
                            : `${formatPrice(appliedCoupon.coupon.discount_value)} off`}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={handleRemoveCoupon} className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10 rounded-full">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Input
                      placeholder={t('store.couponCode')}
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                      className="rounded-lg"
                    />
                    <Button variant="outline" onClick={handleApplyCoupon} disabled={couponLoading || !couponCode.trim()} className="rounded-lg">
                      {couponLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : t('store.apply')}
                    </Button>
                  </div>
                )}

                {/* Totals */}
                <div className="space-y-2.5 pt-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t('store.subtotal')} ({selectedCount} {t('store.items')})</span>
                    <span className="font-medium">{formatPrice(checkoutSubtotal)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-sm text-store-accent">
                      <span className="flex items-center gap-1">
                        {isAutoDiscountApplied && <Sparkles className="h-3 w-3" />}
                        {isAutoDiscountApplied ? "Auto Discount" : t('store.discount')}
                      </span>
                      <span className="font-medium">-{formatPrice(discount)}</span>
                    </div>
                  )}
                  {isAutoDiscountApplied && activeAutoRules.length > 0 && (
                    <p className="text-xs text-store-accent">✨ {activeAutoRules[0].name} applied!</p>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <Truck className="h-3.5 w-3.5" /> {t('store.shipping')}
                    </span>
                    <span className={`font-medium ${shippingCost === 0 ? 'text-green-600 dark:text-green-400' : ''}`}>
                      {shippingCost === 0 ? t('store.free') : formatPrice(shippingCost)}
                    </span>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between items-baseline">
                  <span className="font-semibold text-base">{t('store.total')}</span>
                  <span className="font-bold text-xl text-store-primary">{formatPrice(total)}</span>
                </div>

                <Button size="lg" className="w-full bg-store-primary hover:bg-store-primary/90 rounded-xl h-12 font-semibold shadow-sm" onClick={handleProceedToCheckout} disabled={selectedItems.length === 0}>
                  {t('store.proceedToCheckout')}
                </Button>

                <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground pt-1">
                  <Lock className="h-3 w-3" />
                  <span>Secure SSL Checkout</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
