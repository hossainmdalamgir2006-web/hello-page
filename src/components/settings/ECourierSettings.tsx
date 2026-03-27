import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useStoreSettings } from "@/hooks/useStoreSettings";
import { Truck, Eye, EyeOff, Save, CheckCircle2, AlertCircle, RefreshCw, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function ECourierSettings() {
  const { settings, loading, saving, updateMultipleSettings, getSettingValue } = useStoreSettings();

  const [apiKey, setApiKey] = useState("");
  const [apiSecret, setApiSecret] = useState("");
  const [userId, setUserId] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [showApiSecret, setShowApiSecret] = useState(false);
  const [testing, setTesting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<"idle" | "success" | "error">("idle");

  useEffect(() => {
    if (!loading && settings.length > 0) {
      setApiKey(getSettingValue("ECOURIER_API_KEY"));
      setApiSecret(getSettingValue("ECOURIER_API_SECRET"));
      setUserId(getSettingValue("ECOURIER_USER_ID"));
    }
  }, [loading, settings]);

  const handleSave = async () => {
    await updateMultipleSettings([
      { key: "ECOURIER_API_KEY", value: apiKey },
      { key: "ECOURIER_API_SECRET", value: apiSecret },
      { key: "ECOURIER_USER_ID", value: userId },
    ]);
    setConnectionStatus("idle");
  };

  const testConnection = async () => {
    if (!apiKey || !apiSecret) {
      toast.error("Please enter both API Key and API Secret");
      return;
    }
    setTesting(true);
    setConnectionStatus("idle");
    try {
      await updateMultipleSettings([
        { key: "ECOURIER_API_KEY", value: apiKey },
        { key: "ECOURIER_API_SECRET", value: apiSecret },
        { key: "ECOURIER_USER_ID", value: userId },
      ]);
      await new Promise(resolve => setTimeout(resolve, 1000));

      const { data, error } = await supabase.functions.invoke("ecourier-courier", {
        body: { action: "test_connection" },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setConnectionStatus("success");
      toast.success("eCourier connection successful!");
    } catch (error: any) {
      setConnectionStatus("error");
      toast.error(error.message || "Connection failed");
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  const isConfigured = Boolean(apiKey && apiSecret);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white border overflow-hidden">
            <img src="/logos/ecourier.svg" alt="eCourier" className="h-8 w-8 object-contain" />
          </div>
          <div>
            <CardTitle className="flex items-center gap-2">
              eCourier
              {isConfigured ? (
                <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                  <CheckCircle2 className="mr-1 h-3 w-3" />Configured
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
                  <AlertCircle className="mr-1 h-3 w-3" />Not Configured
                </Badge>
              )}
              {connectionStatus === "success" && (
                <Badge variant="outline" className="bg-success/10 text-success border-success/20">Connected</Badge>
              )}
              {connectionStatus === "error" && (
                <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">Connection Failed</Badge>
              )}
            </CardTitle>
            <CardDescription>eCourier delivery service integration for Bangladesh</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="ecourier-api-key">API Key *</Label>
            <div className="relative">
              <Input
                id="ecourier-api-key"
                type={showApiKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your eCourier API Key"
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                onClick={() => setShowApiKey(!showApiKey)}
              >
                {showApiKey ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="ecourier-api-secret">API Secret *</Label>
            <div className="relative">
              <Input
                id="ecourier-api-secret"
                type={showApiSecret ? "text" : "password"}
                value={apiSecret}
                onChange={(e) => setApiSecret(e.target.value)}
                placeholder="Enter your eCourier API Secret"
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                onClick={() => setShowApiSecret(!showApiSecret)}
              >
                {showApiSecret ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-2 max-w-sm">
          <Label htmlFor="ecourier-user-id">User ID (optional)</Label>
          <Input
            id="ecourier-user-id"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="Enter your eCourier User ID"
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            <Save className="h-4 w-4" />
            {saving ? "Saving..." : "Save Credentials"}
          </Button>
          <Button variant="outline" onClick={testConnection} disabled={testing || !apiKey || !apiSecret} className="gap-2">
            {testing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Test Connection
          </Button>
        </div>

        <div className="rounded-lg bg-muted/50 p-4">
          <h4 className="font-medium mb-2">How to get your API credentials:</h4>
          <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
            <li>Log in to your eCourier merchant account at backoffice.ecourier.com.bd</li>
            <li>Go to Settings → API Configuration</li>
            <li>Copy your API Key and API Secret</li>
            <li>Paste them here and click Save</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
}
