import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface FreeShippingConfig {
  threshold: number;
  enabled: boolean;
}

const DEFAULT_CONFIG: FreeShippingConfig = { threshold: 2000, enabled: true };

async function fetchFreeShippingConfig(): Promise<FreeShippingConfig> {
  const { data, error } = await supabase
    .from("store_settings" as any)
    .select("key, setting_value")
    .in("key", ["free_shipping_threshold", "free_shipping_enabled"]);

  if (error) return DEFAULT_CONFIG;

  const map: Record<string, string> = {};
  for (const row of (data as any[]) || []) {
    if (row?.key && row?.setting_value != null) {
      map[row.key] = String(row.setting_value).replace(/^"|"$/g, "");
    }
  }

  const thresholdRaw = map["free_shipping_threshold"];
  const enabledRaw = map["free_shipping_enabled"];

  const threshold = thresholdRaw ? Number(thresholdRaw) : DEFAULT_CONFIG.threshold;
  const enabled = enabledRaw ? enabledRaw === "true" : DEFAULT_CONFIG.enabled;

  return {
    threshold: isFinite(threshold) && threshold > 0 ? threshold : DEFAULT_CONFIG.threshold,
    enabled,
  };
}

export function useFreeShippingConfig() {
  const { data, isLoading } = useQuery({
    queryKey: ["free-shipping-config"],
    queryFn: fetchFreeShippingConfig,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  return {
    threshold: data?.threshold ?? DEFAULT_CONFIG.threshold,
    enabled: data?.enabled ?? DEFAULT_CONFIG.enabled,
    loading: isLoading,
  };
}
