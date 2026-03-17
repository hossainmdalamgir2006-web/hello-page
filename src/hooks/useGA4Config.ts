import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface TrackingConfig {
  measurementId: string | null;
  isEnabled: boolean;
  isLoading: boolean;
  gtmContainerId: string | null;
  gtmEnabled: boolean;
  metaPixelId: string | null;
  metaPixelEnabled: boolean;
  googleSiteVerification: string | null;
}

export function useGA4Config(): TrackingConfig {
  const [config, setConfig] = useState<TrackingConfig>({
    measurementId: null,
    isEnabled: false,
    isLoading: true,
    gtmContainerId: null,
    gtmEnabled: false,
    metaPixelId: null,
    metaPixelEnabled: false,
    googleSiteVerification: null,
  });

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const { data, error } = await supabase
        .from("store_settings" as any)
        .select("key, setting_value")
        .in("key", [
          "GA4_MEASUREMENT_ID", "GA4_ENABLED",
          "GTM_CONTAINER_ID", "GTM_ENABLED",
          "META_PIXEL_ID", "META_PIXEL_ENABLED",
          "GOOGLE_SITE_VERIFICATION",
        ]);

      if (error) throw error;

      const settings = (data as any[]) || [];
      const get = (k: string) => settings.find(s => s.key === k)?.setting_value || null;

      setConfig({
        measurementId: get("GA4_MEASUREMENT_ID"),
        isEnabled: get("GA4_ENABLED") === "true",
        isLoading: false,
        gtmContainerId: get("GTM_CONTAINER_ID"),
        gtmEnabled: get("GTM_ENABLED") === "true",
        metaPixelId: get("META_PIXEL_ID"),
        metaPixelEnabled: get("META_PIXEL_ENABLED") === "true",
        googleSiteVerification: get("GOOGLE_SITE_VERIFICATION"),
      });
    } catch (error) {
      console.error("Error fetching tracking config:", error);
      setConfig(prev => ({ ...prev, isLoading: false }));
    }
  };

  return config;
}
