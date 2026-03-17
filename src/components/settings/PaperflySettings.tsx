import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useStoreSettings } from "@/hooks/useStoreSettings";
import { Truck, Eye, EyeOff, Save, CheckCircle2, AlertCircle, RefreshCw, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function PaperflySettings() {
  const { settings, loading, saving, updateMultipleSettings, getSettingValue } = useStoreSettings();

  const [apiToken, setApiToken] = useState("");
  const [environment, setEnvironment] = useState<"sandbox" | "production">("production");
  const [showToken, setShowToken] = useState(false);
  const [testing, setTesting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<"idle" | "success" | "error">("idle");

  useEffect(() => {
    if (!loading && settings.length > 0) {
      setApiToken(getSettingValue("PAPERFLY_API_TOKEN"));
      setEnvironment((getSettingValue("PAPERFLY_ENVIRONMENT") || "production") as "sandbox" | "production");
    }
  }, [loading, settings]);

  const handleSave = async () => {
    await updateMultipleSettings([
      { key: "PAPERFLY_API_TOKEN", value: apiToken },
      { key: "PAPERFLY_ENVIRONMENT", value: environment },
    ]);
    setConnectionStatus("idle");
  };

  const testConnection = async () => {
    if (!apiToken) {
      toast.error("Please enter your API Token");
      return;
    }
    setTesting(true);
    setConnectionStatus("idle");
    try {
      await updateMultipleSettings([
        { key: "PAPERFLY_API_TOKEN", value: apiToken },
        { key: "PAPERFLY_ENVIRONMENT", value: environment },
      ]);
      await new Promise(resolve => setTimeout(resolve, 1000));

      const { data, error } = await supabase.functions.invoke("paperfly-courier", {
        body: { action: "test_connection" },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setConnectionStatus("success");
      toast.success("Paperfly connection successful!");
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

  const isConfigured = Boolean(apiToken);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
            <Truck className="h-5 w-5 text-blue-500" />
          </div>
          <div>
            <CardTitle className="flex items-center gap-2">
              Paperfly Courier
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
            <CardDescription>Paperfly courier delivery service for Bangladesh</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="paperfly-api-token">API Token *</Label>
            <div className="relative">
              <Input
                id="paperfly-api-token"
                type={showToken ? "text" : "password"}
                value={apiToken}
                onChange={(e) => setApiToken(e.target.value)}
                placeholder="Enter your Paperfly API Token"
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                onClick={() => setShowToken(!showToken)}
              >
                {showToken ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="paperfly-environment">Environment</Label>
            <Select value={environment} onValueChange={(v) => setEnvironment(v as "sandbox" | "production")}>
              <SelectTrigger id="paperfly-environment">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sandbox">Sandbox (Testing)</SelectItem>
                <SelectItem value="production">Production (Live)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            <Save className="h-4 w-4" />
            {saving ? "Saving..." : "Save Credentials"}
          </Button>
          <Button variant="outline" onClick={testConnection} disabled={testing || !apiToken} className="gap-2">
            {testing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Test Connection
          </Button>
        </div>

        <div className="rounded-lg bg-muted/50 p-4">
          <h4 className="font-medium mb-2">How to get your API Token:</h4>
          <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
            <li>Log in to your Paperfly merchant portal at merchant.paperfly.com.bd</li>
            <li>Go to Settings → API Integration</li>
            <li>Copy your API Token</li>
            <li>Paste it here, select the environment and click Save</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
}
