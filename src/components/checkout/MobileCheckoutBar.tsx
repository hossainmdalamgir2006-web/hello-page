import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronUp, ChevronDown, ShieldCheck } from "lucide-react";
import { formatPrice } from "@/lib/formatPrice";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

interface MobileCheckoutBarProps {
  total: number;
  subtotal: number;
  discount: number;
  shippingCost: number;
  codCharge: number;
  itemCount: number;
  processing: boolean;
  disabled: boolean;
}

export function MobileCheckoutBar({
  total,
  subtotal,
  discount,
  shippingCost,
  codCharge,
  itemCount,
  processing,
  disabled,
}: MobileCheckoutBarProps) {
  const { t } = useLanguage();
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t bg-background/95 backdrop-blur-md shadow-[0_-4px_20px_rgba(0,0,0,0.08)] pb-[env(safe-area-inset-bottom)]">
      {expanded && (
        <div className="border-b px-4 py-3 space-y-1.5 max-h-[40vh] overflow-y-auto">
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
            <span className={cn(shippingCost === 0 && "text-green-600")}>
              {shippingCost === 0 ? t('store.free') : formatPrice(shippingCost)}
            </span>
          </div>
          {codCharge > 0 && (
            <div className="flex justify-between text-sm text-warning">
              <span>{t('store.codCharge')}</span>
              <span>+{formatPrice(codCharge)}</span>
            </div>
          )}
        </div>
      )}

      <div className="px-4 py-3 flex items-center gap-3">
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className="flex-1 text-left min-w-0"
        >
          <div className="flex items-center gap-1.5">
            <p className="text-xs text-muted-foreground">
              {itemCount} {itemCount === 1 ? "item" : "items"}
            </p>
            {expanded ? (
              <ChevronDown className="h-3 w-3 text-muted-foreground" />
            ) : (
              <ChevronUp className="h-3 w-3 text-muted-foreground" />
            )}
          </div>
          <p className="font-bold text-lg text-foreground leading-tight">
            {formatPrice(total)}
          </p>
        </button>

        <Button
          type="submit"
          size="lg"
          disabled={processing || disabled}
          className="bg-store-primary hover:bg-store-primary/90 min-w-[160px]"
        >
          {processing ? (
            t('store.processing')
          ) : (
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4" />
              {t('store.reviewPlaceOrder')}
            </span>
          )}
        </Button>
      </div>
    </div>
  );
}
