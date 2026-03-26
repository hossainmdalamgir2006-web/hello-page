import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Save, Loader2 } from "lucide-react";
import { StoreSettingsTab } from "@/components/settings/StoreSettingsTab";
import { useStoreSettings } from "@/hooks/useStoreSettings";
import { toast } from "sonner";
import { useBeforeUnload } from "react-router-dom";

interface StoreSettings {
  storeName: string;
  storeEmail: string;
  storePhone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  currency: string;
  timezone: string;
  logo: string;
  favicon: string;
  description: string;
  facebookUrl: string;
  instagramUrl: string;
  twitterUrl: string;
  youtubeUrl: string;
}

export default function StorePage() {
  const { settings, loading, saving, updateMultipleSettings, getSettingValue } = useStoreSettings();
  const [isDirty, setIsDirty] = useState(false);
  const initializedRef = useRef(false);

  const [storeSettings, setStoreSettings] = useState<StoreSettings>({
    storeName: "", storeEmail: "", storePhone: "", address: "", city: "", postalCode: "",
    country: "Bangladesh", currency: "BDT", timezone: "Asia/Dhaka", logo: "", favicon: "",
    description: "", facebookUrl: "", instagramUrl: "", twitterUrl: "", youtubeUrl: "",
  });

  // Warn on browser close/refresh when dirty
  useBeforeUnload(
    useCallback((e) => {
      if (isDirty) {
        e.preventDefault();
      }
    }, [isDirty])
  );

  // Also warn via native beforeunload
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (isDirty) { e.preventDefault(); }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  useEffect(() => {
    if (!loading && settings.length > 0) {
      setStoreSettings({
        storeName: getSettingValue("STORE_NAME") || "",
        storeEmail: getSettingValue("STORE_EMAIL") || "",
        storePhone: getSettingValue("STORE_PHONE") || "",
        address: getSettingValue("STORE_ADDRESS") || "",
        city: getSettingValue("STORE_CITY") || "",
        postalCode: getSettingValue("STORE_POSTAL_CODE") || "",
        country: getSettingValue("STORE_COUNTRY") || "Bangladesh",
        currency: getSettingValue("STORE_CURRENCY") || "BDT",
        timezone: getSettingValue("STORE_TIMEZONE") || "Asia/Dhaka",
        logo: getSettingValue("STORE_LOGO") || "",
        favicon: getSettingValue("STORE_FAVICON") || "",
        description: getSettingValue("STORE_DESCRIPTION") || "",
        facebookUrl: getSettingValue("STORE_FACEBOOK_URL") || "",
        instagramUrl: getSettingValue("STORE_INSTAGRAM_URL") || "",
        twitterUrl: getSettingValue("STORE_TWITTER_URL") || "",
        youtubeUrl: getSettingValue("STORE_YOUTUBE_URL") || "",
      });
      initializedRef.current = true;
      setIsDirty(false);
    }
  }, [loading, settings]);

  useEffect(() => {
    if (storeSettings.favicon) {
      let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
      if (!link) { link = document.createElement('link'); link.rel = 'icon'; document.head.appendChild(link); }
      link.href = storeSettings.favicon;
    }
  }, [storeSettings.favicon]);

  const updateStoreField = <K extends keyof StoreSettings>(key: K, value: StoreSettings[K]) => {
    setStoreSettings(prev => ({ ...prev, [key]: value }));
    if (initializedRef.current) setIsDirty(true);
  };

  const handleSave = async () => {
    await updateMultipleSettings([
      { key: "STORE_NAME", value: storeSettings.storeName },
      { key: "STORE_EMAIL", value: storeSettings.storeEmail },
      { key: "STORE_PHONE", value: storeSettings.storePhone },
      { key: "STORE_ADDRESS", value: storeSettings.address },
      { key: "STORE_CITY", value: storeSettings.city },
      { key: "STORE_POSTAL_CODE", value: storeSettings.postalCode },
      { key: "STORE_COUNTRY", value: storeSettings.country },
      { key: "STORE_CURRENCY", value: storeSettings.currency },
      { key: "STORE_TIMEZONE", value: storeSettings.timezone },
      { key: "STORE_LOGO", value: storeSettings.logo },
      { key: "STORE_FAVICON", value: storeSettings.favicon },
      { key: "STORE_DESCRIPTION", value: storeSettings.description },
      { key: "STORE_FACEBOOK_URL", value: storeSettings.facebookUrl },
      { key: "STORE_INSTAGRAM_URL", value: storeSettings.instagramUrl },
      { key: "STORE_TWITTER_URL", value: storeSettings.twitterUrl },
      { key: "STORE_YOUTUBE_URL", value: storeSettings.youtubeUrl },
    ]);
    setIsDirty(false);
  };

  return (
    <div className="space-y-6">
      {/* Unsaved changes banner */}
      {isDirty && (
        <div className="flex items-center justify-between rounded-lg border border-warning/30 bg-warning/5 px-4 py-3">
          <p className="text-sm font-medium text-warning">You have unsaved changes</p>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => { initializedRef.current = false; setIsDirty(false); window.location.reload(); }}>
              Discard
            </Button>
            <Button size="sm" onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Save className="h-4 w-4 mr-1" />}
              Save Now
            </Button>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Store Settings</h2>
          <p className="text-sm text-muted-foreground">Basic store information, branding and social links</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => { generateSchemaPDF(storeSettings.storeName || undefined); toast.success("Database schema PDF downloaded!"); }} className="gap-2">
            <Database className="h-4 w-4" />
            <span className="hidden sm:inline">DB Schema</span>
          </Button>
          <Button size="sm" onClick={handleSave} disabled={saving || loading} className="gap-2">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
      <StoreSettingsTab storeSettings={storeSettings} updateStoreField={updateStoreField} />
    </div>
  );
}
