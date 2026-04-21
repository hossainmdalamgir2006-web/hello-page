import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertTriangle, Construction, Save, Loader2, Clock, Shield } from "lucide-react";
import { useMaintenanceMode } from "@/hooks/useMaintenanceMode";
import { parseIPList } from "@/lib/ipMatch";
import { toast } from "sonner";

const TIMEZONES = [
  "Asia/Dhaka",
  "Asia/Kolkata",
  "Asia/Karachi",
  "Asia/Dubai",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Europe/London",
  "Europe/Berlin",
  "America/New_York",
  "America/Los_Angeles",
  "UTC",
];

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

/**
 * Convert a wall-clock "datetime-local" string (YYYY-MM-DDTHH:mm) interpreted
 * in `tz` to a UTC ISO string for storage.
 */
function localInputToUTCISO(localStr: string, tz: string): string | null {
  if (!localStr) return null;
  // Parse as if UTC to get a stable starting point
  const asIfUTC = new Date(`${localStr}:00Z`);
  if (isNaN(asIfUTC.getTime())) return null;
  // What does that UTC instant render as in the target tz?
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  const parts = dtf.formatToParts(asIfUTC).reduce((acc: any, p) => {
    acc[p.type] = p.value;
    return acc;
  }, {});
  const renderedAsUTC = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour === "24" ? 0 : parts.hour),
    Number(parts.minute),
    Number(parts.second),
  );
  // Offset = how far the tz is ahead of UTC at that instant
  const offsetMs = renderedAsUTC - asIfUTC.getTime();
  return new Date(asIfUTC.getTime() - offsetMs).toISOString();
}

/** Convert a UTC ISO string into a "YYYY-MM-DDTHH:mm" string in `tz`. */
function utcISOToLocalInput(iso: string | null, tz: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const dtf = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const parts = dtf.formatToParts(d).reduce((acc: any, p) => {
    acc[p.type] = p.value;
    return acc;
  }, {});
  const hh = parts.hour === "24" ? "00" : parts.hour;
  return `${parts.year}-${parts.month}-${parts.day}T${hh}:${parts.minute}`;
}

const browserTZ =
  Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";

export function MaintenanceModeSettings() {
  const { config, loading, saving, updateConfig } = useMaintenanceMode();
  const [localMessage, setLocalMessage] = useState<string | null>(null);
  const [localEstimatedEnd, setLocalEstimatedEnd] = useState<string | null>(null);
  const [localTimezone, setLocalTimezone] = useState<string | null>(null);
  const [localAllowedIps, setLocalAllowedIps] = useState<string | null>(null);
  const [now, setNow] = useState<number>(Date.now());

  const message = localMessage ?? config.message;
  const timezone =
    localTimezone ?? config.estimated_end_timezone ?? browserTZ;
  const estimatedEndInput =
    localEstimatedEnd ?? utcISOToLocalInput(config.estimated_end, timezone);
  const allowedIpsString =
    localAllowedIps ?? (config.allowed_ips || []).join(", ");

  // Live IP validation preview
  const ipPreview = useMemo(
    () => parseIPList(allowedIpsString),
    [allowedIpsString],
  );

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
    if (ipPreview.invalid.length > 0) {
      toast.error(
        `Invalid IP / CIDR entries: ${ipPreview.invalid.slice(0, 3).join(", ")}${
          ipPreview.invalid.length > 3 ? "…" : ""
        }`,
      );
      return;
    }
    const isoEnd = estimatedEndInput
      ? localInputToUTCISO(estimatedEndInput, timezone)
      : null;
    const success = await updateConfig({
      message,
      estimated_end: isoEnd,
      estimated_end_timezone: isoEnd ? timezone : null,
      allowed_ips: ipPreview.valid,
    });
    if (success) {
      toast.success("Maintenance settings saved");
      setLocalMessage(null);
      setLocalEstimatedEnd(null);
      setLocalTimezone(null);
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
  const savedEnd = config.estimated_end
    ? new Date(config.estimated_end).getTime()
    : null;
  const countdownMs = savedEnd ? savedEnd - now : null;
  const savedTZ = config.estimated_end_timezone || browserTZ;
  const localizedEnd = config.estimated_end
    ? new Intl.DateTimeFormat(undefined, {
        timeZone: savedTZ,
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(config.estimated_end))
    : null;

  const dirty =
    localMessage !== null ||
    localEstimatedEnd !== null ||
    localTimezone !== null ||
    localAllowedIps !== null;

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
          <div className="flex flex-col gap-1 p-3 rounded-lg bg-accent/10 text-sm">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-accent" />
              <span className="text-muted-foreground">
                {countdownMs > 0 ? "Maintenance ends in:" : "Estimated end time:"}
              </span>
              <span className="font-medium text-foreground tabular-nums">
                {formatCountdown(countdownMs)}
              </span>
            </div>
            {localizedEnd && (
              <p className="text-xs text-muted-foreground pl-6">
                {localizedEnd} ({savedTZ})
              </p>
            )}
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="estimatedEnd">Estimated End Time (optional)</Label>
            <Input
              id="estimatedEnd"
              type="datetime-local"
              value={estimatedEndInput}
              onChange={(e) => setLocalEstimatedEnd(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="timezone">Timezone</Label>
            <Select
              value={timezone}
              onValueChange={(v) => setLocalTimezone(v)}
            >
              <SelectTrigger id="timezone">
                <SelectValue placeholder="Select timezone" />
              </SelectTrigger>
              <SelectContent>
                {!TIMEZONES.includes(browserTZ) && (
                  <SelectItem value={browserTZ}>{browserTZ} (browser)</SelectItem>
                )}
                {TIMEZONES.map((tz) => (
                  <SelectItem key={tz} value={tz}>
                    {tz}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <p className="text-xs text-muted-foreground md:col-span-3">
            The countdown uses this timezone so it matches your store's local time.
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
            placeholder="103.123.45.67, 203.0.113.0/24"
            rows={2}
          />
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
            <span className="text-muted-foreground">
              Supports IPv4 + CIDR (e.g.{" "}
              <code className="font-mono">203.0.113.0/24</code>). Comma or newline separated.
            </span>
            {ipPreview.valid.length > 0 && (
              <span className="text-emerald-600 dark:text-emerald-400">
                ✓ {ipPreview.valid.length} valid
              </span>
            )}
            {ipPreview.invalid.length > 0 && (
              <span className="text-destructive">
                ✗ Invalid: {ipPreview.invalid.slice(0, 3).join(", ")}
                {ipPreview.invalid.length > 3 ? "…" : ""}
              </span>
            )}
          </div>
        </div>

        <Button
          onClick={handleSaveDetails}
          disabled={saving || !dirty || ipPreview.invalid.length > 0}
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
