import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Loader2, Clock, Shield, Bell } from "lucide-react";
import { useSLAConfig, SLAConfig } from "@/hooks/useSLAConfig";

export function SLASettings() {
  const { config, isLoading, saveConfig } = useSLAConfig();
  const [localConfig, setLocalConfig] = useState<SLAConfig>(config);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setLocalConfig(config);
    }
  }, [isLoading, config]);

  const handleSave = async () => {
    setIsSaving(true);
    await saveConfig(localConfig);
    setIsSaving(false);
  };

  const hasChanges = JSON.stringify(localConfig) !== JSON.stringify(config);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  const priorityFields = [
    {
      id: "critical-priority",
      label: "Critical Priority Response (minutes)",
      value: localConfig.criticalPriorityResponseMinutes,
      key: "criticalPriorityResponseMinutes" as const,
      fallback: 5,
      iconColor: "text-destructive",
      desc: "Highest urgency — immediate response needed",
    },
    {
      id: "urgent-priority",
      label: "Urgent Priority Response (minutes)",
      value: localConfig.urgentPriorityResponseMinutes,
      key: "urgentPriorityResponseMinutes" as const,
      fallback: 15,
      iconColor: "text-destructive",
      desc: "Very high urgency items",
    },
    {
      id: "high-priority",
      label: "High Priority Response (minutes)",
      value: localConfig.highPriorityResponseMinutes,
      key: "highPriorityResponseMinutes" as const,
      fallback: 30,
      iconColor: "text-warning",
      desc: "Important items requiring quick attention",
    },
    {
      id: "first-response",
      label: "Default / Medium Response (minutes)",
      value: localConfig.firstResponseMinutes,
      key: "firstResponseMinutes" as const,
      fallback: 60,
      iconColor: "",
      desc: "Normal priority tickets & chats",
    },
    {
      id: "low-priority",
      label: "Low Priority Response (minutes)",
      value: localConfig.lowPriorityResponseMinutes,
      key: "lowPriorityResponseMinutes" as const,
      fallback: 120,
      iconColor: "text-muted-foreground",
      desc: "Non-urgent items, longer response window",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          SLA Configuration
        </CardTitle>
        <CardDescription>
          Set Service Level Agreement (SLA) targets — breach alerts will trigger based on response time
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Priority Response Times */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {priorityFields.map((field) => (
            <div key={field.id} className="space-y-2">
              <Label htmlFor={field.id} className="flex items-center gap-2">
                <Clock className={`h-4 w-4 ${field.iconColor}`} />
                {field.label}
              </Label>
              <Input
                id={field.id}
                type="number"
                min={1}
                value={field.value}
                onChange={(e) =>
                  setLocalConfig((prev) => ({
                    ...prev,
                    [field.key]: parseInt(e.target.value) || field.fallback,
                  }))
                }
                className="w-40"
              />
              <p className="text-xs text-muted-foreground">{field.desc}</p>
            </div>
          ))}

          <div className="space-y-2">
            <Label htmlFor="resolution-hours" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Resolution Time (hours)
            </Label>
            <Input
              id="resolution-hours"
              type="number"
              min={1}
              value={localConfig.resolutionHours}
              onChange={(e) =>
                setLocalConfig((prev) => ({
                  ...prev,
                  resolutionHours: parseInt(e.target.value) || 24,
                }))
              }
              className="w-40"
            />
            <p className="text-xs text-muted-foreground">Maximum time to resolve a ticket</p>
          </div>
        </div>

        {/* Auto Notification Toggle */}
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="flex items-center gap-3">
            <Bell className="h-5 w-5 text-warning" />
            <div>
              <p className="font-medium text-sm">Auto-Notify on SLA Breach</p>
              <p className="text-xs text-muted-foreground">
                Automatically send notifications to agents when SLA targets are missed
              </p>
            </div>
          </div>
          <Switch
            checked={localConfig.autoNotifyOnBreach}
            onCheckedChange={(checked) =>
              setLocalConfig((prev) => ({ ...prev, autoNotifyOnBreach: checked }))
            }
          />
        </div>

        <Button onClick={handleSave} disabled={!hasChanges || isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Settings"
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
