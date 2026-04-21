import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { ShieldCheck, Tag, X, Sparkles, Truck, Plus, Minus, PiggyBank, ChevronDown, ChevronUp } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatPrice } from "@/lib/formatPrice";
import { Progress } from '@/components/ui/progress';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  size?: string;
  color?: string;
}

interface CheckoutOrderSummaryProps {
  items: CartItem[];
  subtotal: number;
  discount: number;
  shippingCost: number;
  codCharge: number;
  total: number;
  isAutoDiscountApplied: boolean;
  couponCode: string;
  onCouponCodeChange: (code: string) => void;
  appliedCouponCode?: string | null;
  onApplyCoupon: () => void;
  onRemoveCoupon: () => void;
  couponLoading: boolean;
  processing: boolean;
  selectedZoneId: string;
  selectedRateId: string;
  acceptedTerms: boolean;
  selectedZoneName?: string;
  selectedRateName?: string;
  selectedRateMaxOrderAmount?: number | null;
  selectedRateMinDays?: number | null;
  selectedRateMaxDays?: number | null;
  freeShippingThreshold?: number;
  freeShippingEnabled?: boolean;
  onUpdateQuantity?: (id: string, quantity: number, size?: string, color?: string) => void;
  hideMobileSubmit?: boolean;
}

function formatDeliveryWindow(minDays?: number | null, maxDays?: number | null): string {
  const min = minDays ?? 1;
  const max = maxDays ?? Math.max(min + 2, 3);
  const today = new Date();
  const minDate = new Date(today);
  minDate.setDate(today.getDate() + min);
  const maxDate = new Date(today);
  maxDate.setDate(today.getDate() + max);
  const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return `${fmt(minDate)} – ${fmt(maxDate)}`;
}

export function CheckoutOrderSummary({
  items, subtotal, discount, shippingCost, codCharge, total,
  isAutoDiscountApplied, couponCode, onCouponCodeChange, appliedCouponCode,
  onApplyCoupon, onRemoveCoupon, couponLoading, processing,
  selectedZoneId, selectedRateId, acceptedTerms,
  selectedZoneName, selectedRateName, selectedRateMaxOrderAmount,
  selectedRateMinDays, selectedRateMaxDays,
  freeShippingThreshold, freeShippingEnabled,
  onUpdateQuantity, hideMobileSubmit,
}: CheckoutOrderSummaryProps) {
  const { t } = useLanguage();
  const [mobileOpen, setMobileOpen] = useState(false);

  const showFreeShippingNudge =
    freeShippingEnabled && freeShippingThreshold && subtotal > 0 && subtotal < freeShippingThreshold;
  const remainingForFree = showFreeShippingNudge ? freeShippingThreshold! - subtotal : 0;
  const freeShippingProgress = showFreeShippingNudge
    ? Math.min(100, (subtotal / freeShippingThreshold!) * 100)
    : 100;

  const deliveryWindow = formatDeliveryWindow(selectedRateMinDays, selectedRateMaxDays);

  const summaryBody = (
    <CardContent className="space-y-4">
      {/* Items list with quantity controls */}
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {items.map((item) => (
          <div key={`${item.id}-${item.size}-${item.color}`} className="flex gap-3">
            <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0 relative">
              <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
              <span className="absolute -top-1 -right-1 bg-store-primary text-store-primary-foreground text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {item.quantity}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{item.name}</p>
              {(item.size || item.color) && (
                <p className="text-xs text-muted-foreground">
                  {item.size} {item.color && `/ ${item.color}`}
                </p>
              )}
              <div className="flex items-center justify-between mt-1">
                <p className="text-sm font-semibold">{formatPrice(item.price * item.quantity)}</p>
                {onUpdateQuantity && (
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => onUpdateQuantity(item.id, item.quantity - 1, item.size, item.color)}
                      disabled={item.quantity <= 1}
                      aria-label="Decrease quantity"
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => onUpdateQuantity(item.id, item.quantity + 1, item.size, item.color)}
                      aria-label="Increase quantity"
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <Separator />

      {/* Coupon */}
      {appliedCouponCode ? (
        <div className="flex items-center justify-between p-3 bg-store-accent/10 rounded-lg border border-store-accent">
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-store-accent" />
            <span className="font-medium text-sm">{appliedCouponCode}</span>
          </div>
          <Button variant="ghost" size="sm" onClick={onRemoveCoupon} className="text-destructive h-6 px-2">
            <X className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        <div className="flex gap-2">
          <Input
            placeholder={t('store.couponCode')}
            value={couponCode}
            onChange={(e) => onCouponCodeChange(e.target.value.toUpperCase())}
            className="h-9"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onApplyCoupon}
            disabled={couponLoading || !couponCode.trim()}
          >
            {t('store.apply')}
          </Button>
        </div>
      )}

      {/* Free shipping nudge */}
      {showFreeShippingNudge && (
        <div className="p-3 bg-store-primary/5 rounded-lg border border-store-primary/20 space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Truck className="h-4 w-4 text-store-primary" />
            <span>
              Add <strong className="text-store-primary">{formatPrice(remainingForFree)}</strong> more for{' '}
              <strong className="text-green-600">FREE shipping</strong>
            </span>
          </div>
          <Progress value={freeShippingProgress} className="h-1.5" />
        </div>
      )}

      <Separator />

      {/* Totals */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">{t('store.subtotal')}</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-sm text-store-accent">
            <span className="flex items-center gap-1">
              {isAutoDiscountApplied && <Sparkles className="h-3 w-3" />}
              {isAutoDiscountApplied ? t('store.autoDiscount') : t('store.discount')}
            </span>
            <span>-{formatPrice(discount)}</span>
          </div>
        )}
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">
            {t('store.shipping')}
            {selectedZoneName && selectedRateName && (
              <span className="block text-xs">{selectedZoneName} • {selectedRateName}</span>
            )}
          </span>
          <span className={shippingCost === 0 ? 'text-green-600 font-medium' : ''}>
            {shippingCost === 0 ? t('store.free') : formatPrice(shippingCost)}
          </span>
        </div>
        {codCharge > 0 && (
          <div className="flex justify-between text-sm text-warning">
            <span>{t('store.codCharge')}</span>
            <span>+{formatPrice(codCharge)}</span>
          </div>
        )}
        {selectedRateMaxOrderAmount && subtotal < selectedRateMaxOrderAmount && (
          <p className="text-xs text-muted-foreground">
            {formatPrice((selectedRateMaxOrderAmount - subtotal))} {t('store.orderMoreForFree')}
          </p>
        )}
      </div>

      {/* Estimated delivery */}
      {selectedRateId && (
        <div className="flex items-center gap-2 p-2.5 bg-muted/50 rounded-lg text-sm">
          <Truck className="h-4 w-4 text-store-primary flex-shrink-0" />
          <div>
            <p className="text-xs text-muted-foreground">Estimated delivery</p>
            <p className="font-medium">{deliveryWindow}</p>
          </div>
        </div>
      )}

      {/* Savings highlight */}
      {discount > 0 && (
        <div className="flex items-center gap-2 p-2.5 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-900 text-sm">
          <PiggyBank className="h-4 w-4 text-green-600 flex-shrink-0" />
          <span className="text-green-700 dark:text-green-400 font-medium">
            You're saving {formatPrice(discount)}!
          </span>
        </div>
      )}

      <Separator />

      <div className="flex justify-between font-semibold text-lg">
        <span>{t('store.total')}</span>
        <span>{formatPrice(total)}</span>
      </div>

      <Button
        type="submit"
        size="lg"
        className={cn(
          "w-full bg-store-primary hover:bg-store-primary/90",
          hideMobileSubmit && "hidden lg:flex"
        )}
        disabled={processing || !selectedZoneId || !selectedRateId || !acceptedTerms}
      >
        {processing ? t('store.processing') : `${t('store.reviewPlaceOrder')} • ${formatPrice(total)}`}
      </Button>

      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <ShieldCheck className="h-4 w-4" /><span>{t('store.secureCheckout')}</span>
      </div>
    </CardContent>
  );

  return (
    <div className="lg:col-span-1">
      {/* Desktop sticky card */}
      <Card className="hidden lg:block sticky top-24">
        <CardHeader><CardTitle>{t('store.orderSummary')}</CardTitle></CardHeader>
        {summaryBody}
      </Card>

      {/* Mobile collapsible card */}
      <Card className="lg:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen((o) => !o)}
          className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
        >
          <div className="flex items-center gap-2">
            <span className="font-semibold">{t('store.orderSummary')}</span>
            <span className="text-xs text-muted-foreground">
              ({items.length} {items.length === 1 ? 'item' : 'items'})
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold">{formatPrice(total)}</span>
            {mobileOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </div>
        </button>
        {mobileOpen && summaryBody}
      </Card>
    </div>
  );
}
