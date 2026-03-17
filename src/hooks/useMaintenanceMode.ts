import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface MaintenanceConfig {
  enabled: boolean;
  message: string;
  allowed_ips: string[];
  estimated_end: string | null;
}

const DEFAULT_CONFIG: MaintenanceConfig = {
  enabled: false,
  message: "We're currently performing scheduled maintenance. We'll be back shortly!",
  allowed_ips: [],
  estimated_end: null,
};

export function useMaintenanceMode() {
  const [config, setConfig] = useState<MaintenanceConfig>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchConfig = async () => {
    try {
      const { data, error } = await supabase
        .from("store_settings" as any)
        .select("setting_value")
        .eq("key", "MAINTENANCE_MODE")
        .single();

      if (error && error.code !== "PGRST116") throw error;

      if (data && (data as any).setting_value) {
        const val = (data as any).setting_value;
        const parsed = typeof val === "string" ? JSON.parse(val) : val;
        setConfig({ ...DEFAULT_CONFIG, ...parsed });
      }
    } catch (error) {
      console.error("Error fetching maintenance config:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const updateConfig = async (updates: Partial<MaintenanceConfig>) => {
    setSaving(true);
    try {
      const newConfig = { ...config, ...updates };
      const { error } = await supabase
        .from("store_settings" as any)
        .upsert({
          key: "MAINTENANCE_MODE",
          setting_value: JSON.stringify(newConfig),
          value: JSON.stringify(newConfig),
        } as any, { onConflict: "key" });

      if (error) throw error;
      setConfig(newConfig);
      return true;
    } catch (error) {
      console.error("Error updating maintenance config:", error);
      return false;
    } finally {
      setSaving(false);
    }
  };

  return { config, loading, saving, updateConfig };
}

// Lightweight hook for store pages - only checks if maintenance is on
export function useMaintenanceCheck() {
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
  const [message, setMessage] = useState("");
  const [estimatedEnd, setEstimatedEnd] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const check = async () => {
      try {
        const { data, error } = await supabase
          .from("store_settings" as any)
          .select("setting_value")
          .eq("key", "MAINTENANCE_MODE")
          .single();

        if (error && error.code !== "PGRST116") throw error;

        if (data && (data as any).setting_value) {
          const val = (data as any).setting_value;
          const parsed = typeof val === "string" ? JSON.parse(val) : val;
          setIsMaintenanceMode(parsed.enabled === true);
          setMessage(parsed.message || DEFAULT_CONFIG.message);
          setEstimatedEnd(parsed.estimated_end || null);
        }
      } catch {
        // If we can't check, assume not in maintenance
      } finally {
        setLoading(false);
      }
    };
    check();
  }, []);

  return { isMaintenanceMode, message, estimatedEnd, loading };
}
