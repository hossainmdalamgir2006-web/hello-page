import { CartItem } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { ShieldCheck, Loader2, MapPin, Truck, Pencil, CreditCard } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatPrice } from "@/lib/formatPrice";

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
  deliveryEstimate?: string;
  onEditContact?: () => void;
  onEditShipping?: () => void;
  onEditPayment?: () => void;
}

export function OrderReviewModal({
  open, onOpenChange, items, subtotal, discount, shippingCost, codCharge, total,
  paymentMethodName, shippingAddress, onConfirm, processing,
  deliveryEstimate, onEditContact, onEditShipping, onEditPayment,
}: OrderReviewModalProps) {
  const { t } = useLanguage();

  const handleEdit = (cb?: () => void) => {
    onOpenChange(false);
    setTimeout(() => cb?.(), 100);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-store-primary" />
            {t('store.reviewYourOrder')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-3">
            <h4 className="font-medium text-sm text-muted-foreground">{t('store.items')} ({items.length})</h4>
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

          {/* Shipping with map preview icon and edit button */}
          <div className="rounded-lg border bg-muted/30 p-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 min-w-0 flex-1">
                <div className="h-12 w-12 rounded-lg bg-store-primary/10 flex items-center justify-center flex-shrink-0">
                  <MapPin className="h-5 w-5 text-store-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-medium text-sm">{t('store.shippingTo')}</h4>
                  <p className="text-sm text-muted-foreground break-words">{shippingAddress}</p>
                  {deliveryEstimate && (
                    <p className="text-xs text-store-primary font-medium mt-1 flex items-center gap-1">
                      <Truck className="h-3 w-3" /> Arrives {deliveryEstimate}
                    </p>
                  )}
                </div>
              </div>
              {onEditShipping && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEdit(onEditShipping)}
                  className="text-store-primary h-7 px-2 flex-shrink-0"
                  type="button"
                >
                  <Pencil className="h-3 w-3 mr-1" /> Edit
                </Button>
              )}
            </div>
          </div>

          {/* Payment with edit button */}
          <div className="rounded-lg border bg-muted/30 p-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 min-w-0 flex-1">
                <div className="h-12 w-12 rounded-lg bg-store-primary/10 flex items-center justify-center flex-shrink-0">
                  <CreditCard className="h-5 w-5 text-store-primary" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-medium text-sm">{t('store.payment')}</h4>
                  <p className="text-sm text-muted-foreground">{paymentMethodName}</p>
                </div>
              </div>
              {onEditPayment && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEdit(onEditPayment)}
                  className="text-store-primary h-7 px-2 flex-shrink-0"
                  type="button"
                >
                  <Pencil className="h-3 w-3 mr-1" /> Edit
                </Button>
              )}
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t('store.subtotal')}</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-sm text-store-accent">
                <span>{t('store.discount')}</span>
                <span>-{formatPrice(discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t('store.shipping')}</span>
              <span className={shippingCost === 0 ? 'text-green-600' : ''}>{shippingCost === 0 ? t('store.free') : formatPrice(shippingCost)}</span>
            </div>
            {codCharge > 0 && (
              <div className="flex justify-between text-sm text-warning">
                <span>{t('store.codCharge')}</span>
                <span>+{formatPrice(codCharge)}</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between font-bold text-lg">
              <span>{t('store.total')}</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={processing} className="flex-1">
            {t('store.goBack')}
          </Button>
          <Button
            onClick={onConfirm}
            disabled={processing}
            className="flex-1 bg-store-primary hover:bg-store-primary/90"
          >
            {processing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t('store.processing')}
              </>
            ) : (
              `${t('store.confirmAndPay')} ${formatPrice(total)}`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
