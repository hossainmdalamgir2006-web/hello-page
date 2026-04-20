import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, AlertCircle, Activity } from "lucide-react";
import { useStoreSettings } from "@/hooks/useStoreSettings";
import { cn } from "@/lib/utils";

type Status = "configured" | "not_configured";

interface IntegrationItem {
  name: string;
  type: "courier" | "analytics";
  keys: string[];
}

const INTEGRATIONS: IntegrationItem[] = [
  { name: "Steadfast", type: "courier", keys: ["STEADFAST_API_KEY", "STEADFAST_SECRET_KEY"] },
  { name: "Pathao", type: "courier", keys: ["PATHAO_CLIENT_ID", "PATHAO_CLIENT_SECRET"] },
  { name: "RedX", type: "courier", keys: ["REDX_API_TOKEN"] },
  { name: "Paperfly", type: "courier", keys: ["PAPERFLY_USERNAME", "PAPERFLY_PASSWORD"] },
  { name: "Google Analytics 4", type: "analytics", keys: ["GA4_MEASUREMENT_ID"] },
  { name: "Google Tag Manager", type: "analytics", keys: ["GTM_CONTAINER_ID"] },
  { name: "Meta Pixel", type: "analytics", keys: ["META_PIXEL_ID"] },
];

export function IntegrationHealthGrid() {
  const { settings, loading, getSettingValue } = useStoreSettings();

  const items = INTEGRATIONS.map(i => {
    const allConfigured = i.keys.every(k => Boolean(getSettingValue(k)));
    return { ...i, status: allConfigured ? ("configured" as Status) : ("not_configured" as Status) };
  });

  const configuredCount = items.filter(i => i.status === "configured").length;

  if (loading) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          Integration Health
          <Badge variant="outline" className="ml-1">
            {configuredCount}/{items.length} Active
          </Badge>
        </CardTitle>
        <CardDescription>Live status of all configured services</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {items.map(item => (
            <div
              key={item.name}
              className={cn(
                "flex items-center gap-2 p-3 rounded-lg border transition-colors",
                item.status === "configured"
                  ? "border-success/30 bg-success/5"
                  : "border-border bg-muted/30"
              )}
            >
              {item.status === "configured" ? (
                <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
              ) : (
                <XCircle className="h-4 w-4 text-muted-foreground shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">{item.name}</p>
                <p className="text-[10px] text-muted-foreground capitalize">{item.type}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
