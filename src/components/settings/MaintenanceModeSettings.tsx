import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Construction, Save, Loader2, Clock, Shield } from "lucide-react";
import { useMaintenanceMode } from "@/hooks/useMaintenanceMode";
import { toast } from "sonner";

function formatCountdown(ms: number): string {
  if (ms <= 0) return "Time elapsed";
  const totalMin = Math.floor(ms / 60000);
  const days = Math.floor(totalMin / (60 * 24));
  const hours = Math.floor((totalMin % (60 * 24)) / 60);
  const minutes = totalMin % 60;
  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  parts.push(`${minutes}m`);
  return parts.join(" ");
}

export function MaintenanceModeSettings() {
  const { config, loading, saving, updateConfig } = useMaintenanceMode();
  const [localMessage, setLocalMessage] = useState<string | null>(null);
  const [localEstimatedEnd, setLocalEstimatedEnd] = useState<string | null>(null);
  const [localAllowedIps, setLocalAllowedIps] = useState<string | null>(null);
  const [now, setNow] = useState<number>(Date.now());

  const message = localMessage ?? config.message;
  const estimatedEnd = localEstimatedEnd ?? config.estimated_end ?? "";
  const allowedIpsString =
    localAllowedIps ?? (config.allowed_ips || []).join(", ");

  // Live tick every 30s for countdown
  useEffect(() => {
    if (!config.estimated_end) return;
    const id = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(id);
  }, [config.estimated_end]);

  const handleToggle = async (enabled: boolean) => {
    const success = await updateConfig({ enabled });
    if (success) {
      toast.success(enabled ? "🚧 Maintenance mode enabled" : "✅ Store is now live");
    } else {
      toast.error("Failed to update maintenance mode");
    }
  };

  const handleSaveDetails = async () => {
    const ipList = allowedIpsString
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const success = await updateConfig({
      message,
      estimated_end: estimatedEnd || null,
      allowed_ips: ipList,
    });
    if (success) {
      toast.success("Maintenance settings saved");
      setLocalMessage(null);
      setLocalEstimatedEnd(null);
      setLocalAllowedIps(null);
    } else {
      toast.error("Failed to save settings");
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 flex items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  // Live countdown — uses saved value (not local edit)
  const savedEnd = config.estimated_end ? new Date(config.estimated_end).getTime() : null;
  const countdownMs = savedEnd ? savedEnd - now : null;

  const dirty =
    localMessage !== null || localEstimatedEnd !== null || localAllowedIps !== null;

  return (
    <Card className={config.enabled ? "border-destructive/50 bg-destructive/5" : ""}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Construction className="h-5 w-5 text-accent" />
            <div>
              <CardTitle className="flex items-center gap-2">
                Maintenance Mode
                {config.enabled && (
                  <Badge variant="destructive" className="text-xs">ACTIVE</Badge>
                )}
              </CardTitle>
              <CardDescription>
                When enabled, visitors will see a maintenance page instead of your store
              </CardDescription>
            </div>
          </div>
          <Switch
            checked={config.enabled}
            onCheckedChange={handleToggle}
            disabled={saving}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {config.enabled && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
            <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <p>Your store is currently in maintenance mode. Visitors cannot access the store. Admin panel remains accessible.</p>
          </div>
        )}

        {/* Live Countdown Preview */}
        {config.estimated_end && countdownMs !== null && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-accent/10 text-sm">
            <Clock className="h-4 w-4 text-accent" />
            <span className="text-muted-foreground">
              {countdownMs > 0 ? "Maintenance ends in:" : "Estimated end time:"}
            </span>
            <span className="font-medium text-foreground tabular-nums">
              {formatCountdown(countdownMs)}
            </span>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="maintenanceMessage">Maintenance Message</Label>
          <Textarea
            id="maintenanceMessage"
            value={message}
            onChange={(e) => setLocalMessage(e.target.value)}
            placeholder="We're currently performing scheduled maintenance..."
            rows={3}
            maxLength={500}
          />
          <p className="text-xs text-muted-foreground">{message.length}/500 characters</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="estimatedEnd">Estimated End Time (optional)</Label>
          <Input
            id="estimatedEnd"
            type="datetime-local"
            value={estimatedEnd}
            onChange={(e) => setLocalEstimatedEnd(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Visitors will see an estimated return time if set
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="allowedIps" className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-accent" />
            IP Whitelist (Bypass List)
          </Label>
          <Textarea
            id="allowedIps"
            value={allowedIpsString}
            onChange={(e) => setLocalAllowedIps(e.target.value)}
            placeholder="103.123.45.67, 203.112.5.10"
            rows={2}
          />
          <p className="text-xs text-muted-foreground">
            Comma-separated public IPs that can access the store while maintenance is active. Leave empty to block everyone (admins still bypass).
          </p>
        </div>

        <Button
          onClick={handleSaveDetails}
          disabled={saving || !dirty}
          size="sm"
          className="gap-2"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save Details
        </Button>
      </CardContent>
    </Card>
  );
}
