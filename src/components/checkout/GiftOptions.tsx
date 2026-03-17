import { Gift, Eye, EyeOff } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface GiftOptionsProps {
  isGift: boolean;
  onIsGiftChange: (checked: boolean) => void;
  giftMessage: string;
  onGiftMessageChange: (message: string) => void;
  hidePricing: boolean;
  onHidePricingChange: (checked: boolean) => void;
}

export function GiftOptions({
  isGift,
  onIsGiftChange,
  giftMessage,
  onGiftMessageChange,
  hidePricing,
  onHidePricingChange,
}: GiftOptionsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gift className="h-5 w-5 text-store-primary" />
          Gift Options
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Checkbox
            id="isGift"
            checked={isGift}
            onCheckedChange={(checked) => onIsGiftChange(checked as boolean)}
          />
          <Label htmlFor="isGift" className="text-sm font-normal cursor-pointer">
            🎁 This order is a gift
          </Label>
        </div>

        {isGift && (
          <div className="space-y-4 pl-6 border-l-2 border-store-primary/20">
            <div>
              <Label htmlFor="giftMessage" className="text-sm">Gift Message (Optional)</Label>
              <Textarea
                id="giftMessage"
                value={giftMessage}
                onChange={(e) => onGiftMessageChange(e.target.value.slice(0, 300))}
                placeholder="Write a personal message for the recipient..."
                maxLength={300}
                className="mt-1 resize-none"
                rows={3}
              />
              <p className="text-xs text-muted-foreground mt-1">{giftMessage.length}/300</p>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="hidePricing"
                checked={hidePricing}
                onCheckedChange={(checked) => onHidePricingChange(checked as boolean)}
              />
              <Label htmlFor="hidePricing" className="text-sm font-normal cursor-pointer flex items-center gap-1.5">
                {hidePricing ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                Hide pricing from the package
              </Label>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
