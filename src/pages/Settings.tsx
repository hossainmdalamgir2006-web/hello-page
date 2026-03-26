import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Store,
  CreditCard,
  Mail,
  Bell,
  Save,
  Shield,
  Loader2,
  ClipboardList,
  HardDrive,
  Plug,
} from "lucide-react";
import { IntegrationsSettings } from "@/components/settings/IntegrationsSettings";
import { CannedResponsesSettings } from "@/components/settings/CannedResponsesSettings";
import { PaymentSettings } from "@/components/settings/PaymentSettings";
import { BlockedLoginAttempts } from "@/components/admin/BlockedLoginAttempts";
import { AccountLockouts } from "@/components/admin/AccountLockouts";
import { IPSecuritySettings } from "@/components/settings/IPSecuritySettings";
import { EmailApiConfig } from "@/components/settings/EmailApiConfig";
import { AllEmailNotifications } from "@/components/settings/AllEmailNotifications";
import { AutoReplySettings } from "@/components/settings/AutoReplySettings";
import { BackupSettings } from "@/components/settings/BackupSettings";
import { AuditLogTab } from "@/components/settings/AuditLogTab";
import { StoreSettingsTab } from "@/components/settings/StoreSettingsTab";
import { EmailTemplatesTab } from "@/components/settings/EmailTemplatesTab";
import { toast } from "sonner";
import { useStoreSettings } from "@/hooks/useStoreSettings";
import { generateSchemaPDF } from "@/utils/generateSchemaPDF";
import { useEmailTemplates } from "@/hooks/useEmailTemplates";

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

export default function Settings() {
  const { settings, loading: settingsLoading, saving, updateMultipleSettings, getSettingValue } = useStoreSettings();

  const [storeSettings, setStoreSettings] = useState<StoreSettings>({
    storeName: "", storeEmail: "", storePhone: "", address: "", city: "", postalCode: "",
    country: "Bangladesh", currency: "BDT", timezone: "Asia/Dhaka", logo: "", favicon: "",
    description: "", facebookUrl: "", instagramUrl: "", twitterUrl: "", youtubeUrl: "",
  });

  const { templates: emailTemplates, loading: templatesLoading, updateTemplate, toggleTemplate, createTemplate, deleteTemplate } = useEmailTemplates();

  useEffect(() => {
    if (!settingsLoading && settings.length > 0) {
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
    }
  }, [settingsLoading, settings]);

  useEffect(() => {
    if (storeSettings.favicon) {
      let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
      if (!link) { link = document.createElement('link'); link.rel = 'icon'; document.head.appendChild(link); }
      link.href = storeSettings.favicon;
    }
  }, [storeSettings.favicon]);

  const updateStoreField = <K extends keyof StoreSettings>(key: K, value: StoreSettings[K]) => {
    setStoreSettings(prev => ({ ...prev, [key]: value }));
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
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground">Manage your store configuration and preferences</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => { generateSchemaPDF(storeSettings.storeName || undefined); toast.success("Database schema PDF downloaded!"); }} className="gap-2">
            <Database className="h-4 w-4" />
            <span className="hidden sm:inline">DB Schema</span>
          </Button>
          <Button onClick={handleSave} disabled={saving || settingsLoading} className="gap-2">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="store" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 sm:grid-cols-8 lg:w-auto lg:grid-cols-8">
          <TabsTrigger value="store" className="gap-2"><Store className="h-4 w-4 hidden sm:block" />Store</TabsTrigger>
          <TabsTrigger value="payments" className="gap-2"><CreditCard className="h-4 w-4 hidden sm:block" />Payments</TabsTrigger>
          <TabsTrigger value="emails" className="gap-2"><Mail className="h-4 w-4 hidden sm:block" />Emails</TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2"><Bell className="h-4 w-4 hidden sm:block" />Alerts</TabsTrigger>
          <TabsTrigger value="security" className="gap-2"><Shield className="h-4 w-4 hidden sm:block" />Security</TabsTrigger>
          <TabsTrigger value="audit" className="gap-2"><ClipboardList className="h-4 w-4 hidden sm:block" />Audit</TabsTrigger>
          <TabsTrigger value="backup" className="gap-2"><HardDrive className="h-4 w-4 hidden sm:block" />Backup</TabsTrigger>
          <TabsTrigger value="integrations" className="gap-2"><Plug className="h-4 w-4 hidden sm:block" />Integrations</TabsTrigger>
        </TabsList>

        <TabsContent value="store">
          <StoreSettingsTab storeSettings={storeSettings} updateStoreField={updateStoreField} />
        </TabsContent>

        <TabsContent value="payments" className="space-y-6"><PaymentSettings /></TabsContent>

        <TabsContent value="emails">
          <EmailTemplatesTab
            templates={emailTemplates}
            loading={templatesLoading}
            onUpdateTemplate={updateTemplate}
            onToggleTemplate={toggleTemplate}
            onCreateTemplate={createTemplate}
            onDeleteTemplate={deleteTemplate}
          />
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <EmailApiConfig />
          <AllEmailNotifications />
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <IPSecuritySettings />
          <AccountLockouts />
          <BlockedLoginAttempts />
        </TabsContent>

        <TabsContent value="audit" className="space-y-6"><AuditLogTab /></TabsContent>
        <TabsContent value="backup" className="space-y-6"><BackupSettings /></TabsContent>

        <TabsContent value="integrations" className="space-y-6">
          <IntegrationsSettings />
          <AutoReplySettings />
          <CannedResponsesSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}
