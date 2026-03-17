import { CartItem } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { ShieldCheck, Loader2 } from "lucide-react";

interface OrderReviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: CartItem[];
  subtotal: number;
  discount: number;
  shippingCost: number;
  codCharge: number;
  total: number;
  paymentMethodName: string;
  shippingAddress: string;
  onConfirm: () => void;
  processing: boolean;
}

export function OrderReviewModal({
  open,
  onOpenChange,
  items,
  subtotal,
  discount,
  shippingCost,
  codCharge,
  total,
  paymentMethodName,
  shippingAddress,
  onConfirm,
  processing,
}: OrderReviewModalProps) {
  const formatPrice = (price: number) => `৳${price.toLocaleString('en-BD')}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-store-primary" />
            Review Your Order
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Items */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm text-muted-foreground">Items ({items.length})</h4>
            {items.map((item) => (
              <div key={`${item.id}-${item.size}-${item.color}`} className="flex gap-3">
                <div className="w-14 h-14 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.name}</p>
                  {(item.size || item.color) && (
                    <p className="text-xs text-muted-foreground">{item.size} {item.color && `/ ${item.color}`}</p>
                  )}
                  <p className="text-sm text-muted-foreground">{formatPrice(item.price)} × {item.quantity}</p>
                </div>
                <p className="text-sm font-semibold">{formatPrice(item.price * item.quantity)}</p>
              </div>
            ))}
          </div>

          <Separator />

          {/* Shipping */}
          <div>
            <h4 className="font-medium text-sm text-muted-foreground mb-1">Shipping To</h4>
            <p className="text-sm">{shippingAddress}</p>
          </div>

          {/* Payment */}
          <div>
            <h4 className="font-medium text-sm text-muted-foreground mb-1">Payment</h4>
            <p className="text-sm">{paymentMethodName}</p>
          </div>

          <Separator />

          {/* Totals */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-sm text-store-accent">
                <span>Discount</span>
                <span>-{formatPrice(discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Shipping</span>
              <span className={shippingCost === 0 ? 'text-green-600' : ''}>{shippingCost === 0 ? 'Free' : formatPrice(shippingCost)}</span>
            </div>
            {codCharge > 0 && (
              <div className="flex justify-between text-sm text-warning">
                <span>COD Charge</span>
                <span>+{formatPrice(codCharge)}</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={processing} className="flex-1">
            Go Back
          </Button>
          <Button
            onClick={onConfirm}
            disabled={processing}
            className="flex-1 bg-store-primary hover:bg-store-primary/90"
          >
            {processing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              `Confirm & Pay ${formatPrice(total)}`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
