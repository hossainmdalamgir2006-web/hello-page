import { Button } from '@/components/ui/button';
import { ShoppingBag } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCurrency } from "@/contexts/CurrencyContext";

interface StickyAddToCartBarProps {
  productName: string;
  displayPrice: number;
  onAddToCart: () => void;
  onBuyNow: () => void;
  visible: boolean;
}

export function StickyAddToCartBar({ productName, displayPrice, onAddToCart, onBuyNow, visible }: StickyAddToCartBarProps) {
  const { t } = useLanguage();
  
  if (!visible) return null;

  const { formatPrice } = useCurrency();
  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t shadow-lg p-3 flex items-center gap-3 animate-slide-up">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold truncate">{productName}</p>
          <p className="text-lg font-bold text-store-primary">{formatPrice(displayPrice)}</p>
        </div>
        <Button size="sm" className="bg-store-primary hover:bg-store-primary/90 shrink-0" onClick={onAddToCart}>
          <ShoppingBag className="h-4 w-4 mr-1" /> {t('store.addShort')}
        </Button>
        <Button size="sm" variant="secondary" className="shrink-0" onClick={onBuyNow}>{t('store.buyNow')}</Button>
      </div>
      <div className="h-20" />
    </>
  );
}