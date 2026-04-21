import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useStoreSettingsCache } from "@/hooks/useStoreSettingsCache";

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

// Fetch visitor's public IP (cached in sessionStorage)
async function getVisitorIP(): Promise<string | null> {
  try {
    const cached = sessionStorage.getItem("__visitor_ip");
    if (cached) return cached;
    const res = await fetch("https://api.ipify.org?format=json");
    if (!res.ok) return null;
    const data = await res.json();
    if (data?.ip) {
      sessionStorage.setItem("__visitor_ip", data.ip);
      return data.ip;
    }
    return null;
  } catch {
    return null;
  }
}

// Lightweight hook — reads from shared store_settings cache (no extra DB call)
export function useMaintenanceCheck() {
  const { data: settings, isLoading } = useStoreSettingsCache();
  const [visitorIP, setVisitorIP] = useState<string | null>(null);

  const parsed = useMemo(() => {
    if (!settings) return null;
    const raw = settings["MAINTENANCE_MODE"];
    if (!raw) return null;
    try {
      return typeof raw === "string" ? JSON.parse(raw) : raw;
    } catch {
      return null;
    }
  }, [settings]);

  const allowedIps: string[] = useMemo(() => {
    const ips = parsed?.allowed_ips;
    if (!ips) return [];
    if (Array.isArray(ips)) return ips.map((s: string) => String(s).trim()).filter(Boolean);
    if (typeof ips === "string") return ips.split(",").map((s) => s.trim()).filter(Boolean);
    return [];
  }, [parsed]);

  const maintenanceEnabled = parsed?.enabled === true;

  // Only fetch visitor IP if maintenance is on AND there's a whitelist to check
  useEffect(() => {
    if (maintenanceEnabled && allowedIps.length > 0 && visitorIP === null) {
      getVisitorIP().then((ip) => setVisitorIP(ip));
    }
  }, [maintenanceEnabled, allowedIps.length, visitorIP]);

  const result = useMemo(() => {
    if (!parsed) {
      return { isMaintenanceMode: false, message: DEFAULT_CONFIG.message, estimatedEnd: null };
    }
    const isWhitelisted = visitorIP && allowedIps.includes(visitorIP);
    return {
      isMaintenanceMode: maintenanceEnabled && !isWhitelisted,
      message: parsed.message || DEFAULT_CONFIG.message,
      estimatedEnd: parsed.estimated_end || null,
    };
  }, [parsed, maintenanceEnabled, allowedIps, visitorIP]);

  // Still "loading" while we're waiting for the IP check (so we don't flash maintenance page to whitelisted users)
  const stillResolvingIP = maintenanceEnabled && allowedIps.length > 0 && visitorIP === null;

  return { ...result, loading: isLoading || stillResolvingIP };
}
