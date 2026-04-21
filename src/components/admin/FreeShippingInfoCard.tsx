import { Link } from "react-router-dom";
import { Truck, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useFreeShippingConfig } from "@/hooks/useFreeShippingConfig";
import { formatPrice } from "@/lib/formatPrice";

export function FreeShippingInfoCard() {
  const { threshold, enabled, loading } = useFreeShippingConfig();

  return (
    <Card className="border-dashed bg-muted/30">
      <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Truck className="h-5 w-5 text-primary" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-medium text-sm">Free Shipping Threshold</p>
              <Badge
                variant={enabled ? "default" : "secondary"}
                className="text-[10px]"
              >
                {loading ? "…" : enabled ? "Enabled" : "Disabled"}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {loading
                ? "Loading configuration…"
                : enabled
                ? `Orders ≥ ${formatPrice(threshold)} qualify for free shipping.`
                : "Free shipping banner is hidden across the storefront."}
            </p>
          </div>
        </div>
        <Button
          asChild
          variant="outline"
          size="sm"
          className="shrink-0 self-start sm:self-auto"
        >
          <Link to="/admin/system-settings/store">
            Manage in Store Settings
            <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
