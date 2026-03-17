import { Button } from '@/components/ui/button';
import { ShoppingBag, Heart, Share2, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { forwardRef } from 'react';

interface ProductActionsProps {
  onAddToCart: () => void;
  onBuyNow: () => void;
  onWishlistToggle: () => void;
  onShare: (platform: string) => void;
  onToggleCompare?: () => void;
  inWishlist: boolean;
  disabled: boolean;
  hasRelated: boolean;
  showCompare: boolean;
}

export const ProductActions = forwardRef<HTMLDivElement, ProductActionsProps>(({
  onAddToCart, onBuyNow, onWishlistToggle, onShare, onToggleCompare,
  inWishlist, disabled, hasRelated, showCompare,
}, ref) => (
  <>
    <div ref={ref} className="flex gap-3 mb-4">
      <Button size="lg" className="flex-1 bg-store-primary hover:bg-store-primary/90" onClick={onAddToCart} disabled={disabled}>
        <ShoppingBag className="h-4 w-4 mr-2" /> Add to Cart
      </Button>
      <Button size="lg" variant="secondary" className="flex-1" onClick={onBuyNow} disabled={disabled}>Buy Now</Button>
      <Button size="lg" variant="outline" onClick={onWishlistToggle} className={inWishlist ? "text-store-secondary" : ""}>
        <Heart className={cn("h-5 w-5", inWishlist && "fill-current")} />
      </Button>
      <Button size="lg" variant="outline" onClick={() => onShare('copy')}><Share2 className="h-5 w-5" /></Button>
    </div>
    <div className="flex gap-2 mb-6 flex-wrap">
      <Button variant="outline" size="sm" onClick={() => onShare('whatsapp')}>WhatsApp</Button>
      <Button variant="outline" size="sm" onClick={() => onShare('facebook')}>Facebook</Button>
      {hasRelated && (
        <Button variant="outline" size="sm" onClick={onToggleCompare}>
          <BarChart3 className="h-4 w-4 mr-1" /> Compare
        </Button>
      )}
    </div>
  </>
));

ProductActions.displayName = 'ProductActions';
