import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { ShieldCheck, Tag, X, Sparkles } from 'lucide-react';

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
  formatPrice: (price: number) => string;
}

export function CheckoutOrderSummary({
  items, subtotal, discount, shippingCost, codCharge, total,
  isAutoDiscountApplied, couponCode, onCouponCodeChange, appliedCouponCode,
  onApplyCoupon, onRemoveCoupon, couponLoading, processing,
  selectedZoneId, selectedRateId, acceptedTerms,
  selectedZoneName, selectedRateName, selectedRateMaxOrderAmount,
  formatPrice,
}: CheckoutOrderSummaryProps) {
  return (
    <div className="lg:col-span-1">
      <Card className="sticky top-24">
        <CardHeader><CardTitle>Order Summary</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {items.map((item) => (
              <div key={`${item.id}-${item.size}-${item.color}`} className="flex gap-3">
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{item.name}</p>
                  {(item.size || item.color) && <p className="text-xs text-muted-foreground">{item.size} {item.color && `/ ${item.color}`}</p>}
                  <p className="text-sm">{formatPrice(item.price)} × {item.quantity}</p>
                </div>
              </div>
            ))}
          </div>

          <Separator />

          {appliedCouponCode ? (
            <div className="flex items-center justify-between p-3 bg-store-accent/10 rounded-lg border border-store-accent">
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-store-accent" />
                <span className="font-medium text-sm">{appliedCouponCode}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={onRemoveCoupon} className="text-destructive h-6 px-2"><X className="h-3 w-3" /></Button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Input placeholder="Coupon code" value={couponCode} onChange={(e) => onCouponCodeChange(e.target.value.toUpperCase())} className="h-9" />
              <Button type="button" variant="outline" size="sm" onClick={onApplyCoupon} disabled={couponLoading || !couponCode.trim()}>Apply</Button>
            </div>
          )}

          <Separator />

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-sm text-store-accent">
                <span className="flex items-center gap-1">
                  {isAutoDiscountApplied && <Sparkles className="h-3 w-3" />}
                  {isAutoDiscountApplied ? "Auto Discount" : "Discount"}
                </span>
                <span>-{formatPrice(discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                Shipping
                {selectedZoneName && selectedRateName && <span className="block text-xs">{selectedZoneName} • {selectedRateName}</span>}
              </span>
              <span className={shippingCost === 0 ? 'text-green-600' : ''}>{shippingCost === 0 ? 'Free' : formatPrice(shippingCost)}</span>
            </div>
            {codCharge > 0 && (
              <div className="flex justify-between text-sm text-warning">
                <span>COD Charge</span>
                <span>+{formatPrice(codCharge)}</span>
              </div>
            )}
            {selectedRateMaxOrderAmount && subtotal < selectedRateMaxOrderAmount && (
              <p className="text-xs text-muted-foreground">Order ৳{(selectedRateMaxOrderAmount - subtotal).toLocaleString()} more for free delivery!</p>
            )}
          </div>

          <Separator />

          <div className="flex justify-between font-semibold text-lg">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>

          <Button type="submit" size="lg" className="w-full bg-store-primary hover:bg-store-primary/90" disabled={processing || !selectedZoneId || !selectedRateId || !acceptedTerms}>
            {processing ? "Processing..." : `Review & Place Order • ${formatPrice(total)}`}
          </Button>

          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="h-4 w-4" /><span>Secure checkout</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
