import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Truck, Save, Loader2 } from "lucide-react";
import { useStoreSettings } from "@/hooks/useStoreSettings";
import { useQueryClient } from "@tanstack/react-query";

export function FreeShippingSettings() {
  const { settings, loading, saving, updateMultipleSettings, getSettingValue } = useStoreSettings();
  const queryClient = useQueryClient();

  const [enabled, setEnabled] = useState(true);
  const [threshold, setThreshold] = useState("2000");

  useEffect(() => {
    if (loading) return;
    const enabledRaw = (getSettingValue("free_shipping_enabled") || "true").replace(/^"|"$/g, "");
    const thresholdRaw = (getSettingValue("free_shipping_threshold") || "2000").replace(/^"|"$/g, "");
    setEnabled(enabledRaw === "true");
    setThreshold(thresholdRaw || "2000");
  }, [loading, settings]);

  const handleSave = async () => {
    const num = Number(threshold);
    if (!isFinite(num) || num < 0) return;
    const ok = await updateMultipleSettings([
      { key: "free_shipping_enabled", value: enabled ? "true" : "false" },
      { key: "free_shipping_threshold", value: String(Math.round(num)) },
    ]);
    if (ok) {
      queryClient.invalidateQueries({ queryKey: ["free-shipping-config"] });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Truck className="h-4 w-4 text-primary" />
          Free Shipping
        </CardTitle>
        <CardDescription>
          Control the free shipping progress banner shown in the cart and checkout shipping logic.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex items-start justify-between gap-4 p-3 rounded-lg border bg-muted/30">
          <div className="space-y-0.5">
            <Label htmlFor="free-shipping-enabled" className="text-sm font-medium">
              Show free shipping progress banner
            </Label>
            <p className="text-xs text-muted-foreground">
              When off, the progress bar is hidden across the storefront.
            </p>
          </div>
          <Switch
            id="free-shipping-enabled"
            checked={enabled}
            onCheckedChange={setEnabled}
            disabled={loading}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="free-shipping-threshold" className="text-xs font-medium">
            Free shipping threshold (BDT)
          </Label>
          <Input
            id="free-shipping-threshold"
            type="number"
            min={0}
            step={100}
            value={threshold}
            onChange={(e) => setThreshold(e.target.value)}
            disabled={loading}
            className="text-sm"
          />
          <p className="text-xs text-muted-foreground">
            Customers with cart subtotal ≥ this value get free shipping at checkout.
          </p>
        </div>

        <div className="flex justify-end pt-2">
          <Button onClick={handleSave} disabled={loading || saving} size="sm">
            {saving ? (
              <><Loader2 className="h-4 w-4 mr-1.5 animate-spin" />Saving...</>
            ) : (
              <><Save className="h-4 w-4 mr-1.5" />Save</>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
