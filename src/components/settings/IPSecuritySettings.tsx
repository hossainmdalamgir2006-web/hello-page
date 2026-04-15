import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Loader2, 
  Shield, 
  Globe, 
  Ban, 
  Check,
  Plus,
  Trash2,
  RefreshCw,
  Clock,
  AlertTriangle,
  Settings,
  Activity,
  Smartphone,
  Monitor
} from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';

interface BlockedIP {
  id: string;
  ip_address: string;
  reason: string | null;
  blocked_until: string | null;
  is_permanent: boolean;
  blocked_by: string | null;
  created_at: string;
}

interface GeoRule {
  id: string;
  country_code: string;
  country_name: string | null;
  is_blocked: boolean;
  reason: string | null;
  created_at: string;
  updated_at: string;
}

interface RateLimitSetting {
  id: string;
  setting_key: string;
  endpoint: string | null;
  max_requests: number;
  time_window_seconds: number;
  block_duration_seconds: number;
  window_seconds: number;
  is_enabled: boolean;
  created_at: string;
  updated_at: string;
}

interface BlockedDevice {
  id: string;
  device_fingerprint: string | null;
  device_name: string | null;
  user_agent: string | null;
  reason: string | null;
  is_permanent: boolean;
  blocked_until: string | null;
  created_at: string;
}

const COMMON_COUNTRIES = [
  { code: 'CN', name: 'China' },
  { code: 'RU', name: 'Russia' },
  { code: 'KP', name: 'North Korea' },
  { code: 'IR', name: 'Iran' },
  { code: 'NG', name: 'Nigeria' },
  { code: 'VN', name: 'Vietnam' },
  { code: 'IN', name: 'India' },
  { code: 'BR', name: 'Brazil' },
  { code: 'UA', name: 'Ukraine' },
  { code: 'PK', name: 'Pakistan' },
];

export function IPSecuritySettings() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [blockedIPs, setBlockedIPs] = useState<BlockedIP[]>([]);
  const [geoRules, setGeoRules] = useState<GeoRule[]>([]);
  const [rateLimitSettings, setRateLimitSettings] = useState<RateLimitSetting[]>([]);
  const [blockedDevices, setBlockedDevices] = useState<BlockedDevice[]>([]);
  const [activeTab, setActiveTab] = useState('blocked-ips');
  
  // Dialog states
  const [showBlockIPDialog, setShowBlockIPDialog] = useState(false);
  const [showGeoRuleDialog, setShowGeoRuleDialog] = useState(false);
  const [showAddRateLimitDialog, setShowAddRateLimitDialog] = useState(false);
  const [showBlockDeviceDialog, setShowBlockDeviceDialog] = useState(false);
  const [newIP, setNewIP] = useState('');
  const [newIPReason, setNewIPReason] = useState('');
  const [newIPPermanent, setNewIPPermanent] = useState(false);
  const [newIPDuration, setNewIPDuration] = useState('24');
  const [newCountryCode, setNewCountryCode] = useState('');
  const [newCountryReason, setNewCountryReason] = useState('');

  // Rate limit dialog states
  const [newRLEndpoint, setNewRLEndpoint] = useState('');
  const [newRLMaxRequests, setNewRLMaxRequests] = useState('100');
  const [newRLTimeWindow, setNewRLTimeWindow] = useState('60');
  const [newRLBlockDuration, setNewRLBlockDuration] = useState('300');

  // Device block dialog states
  const [newDeviceFingerprint, setNewDeviceFingerprint] = useState('');
  const [newDeviceName, setNewDeviceName] = useState('');
  const [newDeviceUserAgent, setNewDeviceUserAgent] = useState('');
  const [newDeviceReason, setNewDeviceReason] = useState('');
  const [newDevicePermanent, setNewDevicePermanent] = useState(true);
  const [newDeviceDuration, setNewDeviceDuration] = useState('24');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [ipsRes, geoRes, settingsRes, devicesRes] = await Promise.all([
        supabase.from('blocked_ips').select('*').order('created_at', { ascending: false }),
        supabase.from('geo_blocking_rules').select('*').order('created_at', { ascending: false }),
        supabase.from('ip_rate_limit_settings').select('*'),
        supabase.from('blocked_devices').select('*').order('created_at', { ascending: false }),
      ]);

      if (ipsRes.error) throw ipsRes.error;
      setBlockedIPs((ipsRes.data || []).map((ip: any) => ({
        id: ip.id,
        ip_address: String(ip.ip_address),
        reason: ip.reason,
        blocked_until: ip.blocked_until,
        is_permanent: ip.is_permanent,
        blocked_by: ip.blocked_by,
        created_at: ip.created_at,
      })));

      if (geoRes.error) throw geoRes.error;
      setGeoRules((geoRes.data || []).map((rule: any) => ({
        id: rule.id,
        country_code: rule.country_code,
        country_name: rule.country_name,
        is_blocked: rule.is_blocked,
        reason: rule.reason,
        created_at: rule.created_at,
        updated_at: rule.updated_at,
      })));

      if (settingsRes.error) throw settingsRes.error;
      setRateLimitSettings((settingsRes.data || []).map((s: any) => ({
        id: s.id,
        setting_key: s.setting_key,
        endpoint: s.endpoint,
        max_requests: s.max_requests,
        time_window_seconds: s.time_window_seconds,
        block_duration_seconds: s.block_duration_seconds,
        window_seconds: s.window_seconds,
        is_enabled: s.is_enabled,
        created_at: s.created_at,
        updated_at: s.updated_at,
      })));

      if (devicesRes.error) throw devicesRes.error;
      setBlockedDevices((devicesRes.data || []).map((d: any) => ({
        id: d.id,
        device_fingerprint: d.device_fingerprint,
        device_name: d.device_name,
        user_agent: d.user_agent,
        reason: d.reason,
        is_permanent: d.is_permanent,
        blocked_until: d.blocked_until,
        created_at: d.created_at,
      })));
    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load security settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleBlockIP = async () => {
    if (!newIP.trim()) {
      toast.error('Please enter an IP address');
      return;
    }

    const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    if (!ipRegex.test(newIP.trim())) {
      toast.error('Please enter a valid IP address');
      return;
    }

    try {
      const { error } = await supabase
        .from('blocked_ips')
        .insert({
          ip_address: newIP.trim(),
          reason: newIPReason || 'Manually blocked',
          blocked_by: user?.id,
          blocked_until: newIPPermanent ? null : new Date(Date.now() + parseInt(newIPDuration) * 60 * 60 * 1000).toISOString(),
          is_permanent: newIPPermanent,
        });

      if (error) throw error;

      toast.success(`IP ${newIP} has been blocked`);
      setShowBlockIPDialog(false);
      setNewIP('');
      setNewIPReason('');
      setNewIPPermanent(false);
      setNewIPDuration('24');
      fetchData();
    } catch (error: any) {
      toast.error('Failed to block IP: ' + error.message);
    }
  };

  const handleUnblockIP = async (id: string) => {
    try {
      const { error } = await supabase.from('blocked_ips').delete().eq('id', id);
      if (error) throw error;
      toast.success(`IP has been unblocked`);
      fetchData();
    } catch (error: any) {
      toast.error('Failed to unblock IP: ' + error.message);
    }
  };

  const handleAddGeoRule = async () => {
    if (!newCountryCode) {
      toast.error('Please select a country');
      return;
    }

    const country = COMMON_COUNTRIES.find(c => c.code === newCountryCode);

    try {
      const { error } = await supabase
        .from('geo_blocking_rules')
        .insert({
          country_code: newCountryCode,
          country_name: country?.name || newCountryCode,
          is_blocked: true,
          reason: newCountryReason || 'Manually blocked',
          created_by: user?.id,
        });

      if (error) throw error;

      toast.success(`${country?.name || newCountryCode} has been added to blocked list`);
      setShowGeoRuleDialog(false);
      setNewCountryCode('');
      setNewCountryReason('');
      fetchData();
    } catch (error: any) {
      toast.error('Failed to add geo rule: ' + error.message);
    }
  };

  const handleRemoveGeoRule = async (id: string) => {
    try {
      const { error } = await supabase.from('geo_blocking_rules').delete().eq('id', id);
      if (error) throw error;
      toast.success('Geo rule removed');
      fetchData();
    } catch (error: any) {
      toast.error('Failed to remove geo rule: ' + error.message);
    }
  };

  const handleUpdateRateLimitSetting = async (id: string, updates: Partial<RateLimitSetting>) => {
    try {
      const { error } = await supabase
        .from('ip_rate_limit_settings')
        .update({ 
          ...updates,
          updated_at: new Date().toISOString()
        } as any)
        .eq('id', id);

      if (error) throw error;
      toast.success('Rate limit setting updated');
      fetchData();
    } catch (error: any) {
      toast.error('Failed to update setting: ' + error.message);
    }
  };

  const handleAddRateLimitRule = async () => {
    if (!newRLEndpoint.trim()) {
      toast.error('Please enter an endpoint name');
      return;
    }

    try {
      const { error } = await supabase
        .from('ip_rate_limit_settings')
        .insert({
          setting_key: newRLEndpoint.trim().toLowerCase().replace(/\s+/g, '_'),
          endpoint: newRLEndpoint.trim(),
          max_requests: parseInt(newRLMaxRequests) || 100,
          time_window_seconds: parseInt(newRLTimeWindow) || 60,
          block_duration_seconds: parseInt(newRLBlockDuration) || 300,
          window_seconds: parseInt(newRLTimeWindow) || 60,
          is_enabled: true,
        });

      if (error) throw error;

      toast.success('Rate limit rule added');
      setShowAddRateLimitDialog(false);
      setNewRLEndpoint('');
      setNewRLMaxRequests('100');
      setNewRLTimeWindow('60');
      setNewRLBlockDuration('300');
      fetchData();
    } catch (error: any) {
      toast.error('Failed to add rate limit rule: ' + error.message);
    }
  };

  const handleDeleteRateLimitRule = async (id: string) => {
    try {
      const { error } = await supabase.from('ip_rate_limit_settings').delete().eq('id', id);
      if (error) throw error;
      toast.success('Rate limit rule deleted');
      fetchData();
    } catch (error: any) {
      toast.error('Failed to delete rule: ' + error.message);
    }
  };

  const handleBlockDevice = async () => {
    if (!newDeviceFingerprint.trim() && !newDeviceUserAgent.trim()) {
      toast.error('Please enter a device fingerprint or user agent');
      return;
    }

    try {
      const { error } = await supabase
        .from('blocked_devices')
        .insert({
          device_fingerprint: newDeviceFingerprint.trim() || null,
          device_name: newDeviceName.trim() || null,
          user_agent: newDeviceUserAgent.trim() || null,
          reason: newDeviceReason.trim() || 'Manually blocked',
          blocked_by: user?.id,
          is_permanent: newDevicePermanent,
          blocked_until: newDevicePermanent ? null : new Date(Date.now() + parseInt(newDeviceDuration) * 60 * 60 * 1000).toISOString(),
        });

      if (error) throw error;

      toast.success('Device has been blocked');
      setShowBlockDeviceDialog(false);
      setNewDeviceFingerprint('');
      setNewDeviceName('');
      setNewDeviceUserAgent('');
      setNewDeviceReason('');
      setNewDevicePermanent(true);
      setNewDeviceDuration('24');
      fetchData();
    } catch (error: any) {
      toast.error('Failed to block device: ' + error.message);
    }
  };

  const handleUnblockDevice = async (id: string) => {
    try {
      const { error } = await supabase.from('blocked_devices').delete().eq('id', id);
      if (error) throw error;
      toast.success('Device has been unblocked');
      fetchData();
    } catch (error: any) {
      toast.error('Failed to unblock device: ' + error.message);
    }
  };

  const isExpired = (blockedUntil: string | null, isPermanent: boolean) => {
    if (isPermanent || !blockedUntil) return false;
    return new Date(blockedUntil) < new Date();
  };

  const activeBlockedIPs = blockedIPs.filter(ip => 
    ip.is_permanent || !isExpired(ip.blocked_until, ip.is_permanent)
  );

  const activeBlockedDevices = blockedDevices.filter(d =>
    d.is_permanent || !isExpired(d.blocked_until, d.is_permanent)
  );

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 md:grid-cols-5">
        {[
          { label: "Blocked IPs", value: activeBlockedIPs.length, icon: Ban, iconBg: "bg-destructive/10 text-destructive", border: "border-l-destructive", cardBg: "bg-destructive/5 dark:bg-destructive/10" },
          { label: "Blocked Countries", value: geoRules.filter(r => r.is_blocked).length, icon: Globe, iconBg: "bg-primary/10 text-primary", border: "border-l-primary", cardBg: "bg-primary/5 dark:bg-primary/10" },
          { label: "Blocked Devices", value: activeBlockedDevices.length, icon: Smartphone, iconBg: "bg-orange-500/10 text-orange-500", border: "border-l-orange-500", cardBg: "bg-orange-500/5 dark:bg-orange-500/10" },
          { label: "Rate Limit Rules", value: rateLimitSettings.filter(r => r.is_enabled).length, icon: Clock, iconBg: "bg-warning/10 text-warning", border: "border-l-warning", cardBg: "bg-warning/5 dark:bg-warning/10" },
          { label: "Geo-Blocking", value: geoRules.filter(r => r.is_blocked).length > 0 ? 'ON' : 'OFF', icon: Activity, iconBg: "bg-success/10 text-success", border: "border-l-success", cardBg: "bg-success/5 dark:bg-success/10" },
        ].map((stat) => (
          <div
            key={stat.label}
            className={`rounded-xl border border-border/50 p-4 border-l-[3px] transition-all duration-300 hover:shadow-md hover:border-border hover:-translate-y-0.5 ${stat.border} ${stat.cardBg}`}
          >
            <div className="flex items-center gap-3">
              <div className={`flex h-9 w-9 items-center justify-center rounded-lg shrink-0 ${stat.iconBg}`}>
                <stat.icon className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xl font-bold tracking-tight text-foreground">{stat.value}</p>
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-accent" />
                IP Security, Device Blocking & Geo-Blocking
              </CardTitle>
              <CardDescription>
                Manage IP blocking, device blocking, rate limiting and geographic access restrictions
              </CardDescription>
            </div>
            <Button variant="outline" size="icon" onClick={fetchData}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="blocked-ips" className="gap-2">
                <Ban className="h-4 w-4" />
                <span className="hidden sm:inline">Blocked IPs</span>
                <span className="sm:hidden">IPs</span>
              </TabsTrigger>
              <TabsTrigger value="device-blocking" className="gap-2">
                <Smartphone className="h-4 w-4" />
                <span className="hidden sm:inline">Device Blocking</span>
                <span className="sm:hidden">Devices</span>
              </TabsTrigger>
              <TabsTrigger value="geo-blocking" className="gap-2">
                <Globe className="h-4 w-4" />
                <span className="hidden sm:inline">Geo-Blocking</span>
                <span className="sm:hidden">Geo</span>
              </TabsTrigger>
              <TabsTrigger value="rate-limits" className="gap-2">
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Rate Limits</span>
                <span className="sm:hidden">Limits</span>
              </TabsTrigger>
            </TabsList>

            {/* Blocked IPs Tab */}
            <TabsContent value="blocked-ips" className="space-y-4">
              <div className="flex justify-end">
                <Dialog open={showBlockIPDialog} onOpenChange={setShowBlockIPDialog}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Block IP
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Block IP Address</DialogTitle>
                      <DialogDescription>
                        Add an IP address to the block list
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="ip">IP Address</Label>
                        <Input
                          id="ip"
                          placeholder="192.168.1.1"
                          value={newIP}
                          onChange={(e) => setNewIP(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="reason">Reason (optional)</Label>
                        <Input
                          id="reason"
                          placeholder="Suspicious activity"
                          value={newIPReason}
                          onChange={(e) => setNewIPReason(e.target.value)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="permanent">Permanent Block</Label>
                        <Switch
                          id="permanent"
                          checked={newIPPermanent}
                          onCheckedChange={setNewIPPermanent}
                        />
                      </div>
                      {!newIPPermanent && (
                        <div className="space-y-2">
                          <Label>Block Duration</Label>
                          <Select value={newIPDuration} onValueChange={setNewIPDuration}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">1 hour</SelectItem>
                              <SelectItem value="6">6 hours</SelectItem>
                              <SelectItem value="24">24 hours</SelectItem>
                              <SelectItem value="72">3 days</SelectItem>
                              <SelectItem value="168">7 days</SelectItem>
                              <SelectItem value="720">30 days</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowBlockIPDialog(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleBlockIP}>Block IP</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>IP Address</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Blocked At</TableHead>
                      <TableHead>Expires</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {blockedIPs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          No blocked IPs
                        </TableCell>
                      </TableRow>
                    ) : (
                      blockedIPs.map((ip) => (
                        <TableRow key={ip.id}>
                          <TableCell className="font-mono font-medium">{ip.ip_address}</TableCell>
                          <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                            {ip.reason || 'No reason'}
                          </TableCell>
                          <TableCell>
                            {ip.is_permanent ? (
                              <Badge variant="destructive">Permanent</Badge>
                            ) : isExpired(ip.blocked_until, ip.is_permanent) ? (
                              <Badge variant="secondary">Expired</Badge>
                            ) : (
                              <Badge variant="default">Active</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatDistanceToNow(new Date(ip.created_at), { addSuffix: true })}
                          </TableCell>
                          <TableCell className="text-sm">
                            {ip.is_permanent ? (
                              <span className="text-destructive">Never</span>
                            ) : ip.blocked_until ? (
                              new Date(ip.blocked_until).toLocaleString()
                            ) : (
                              'N/A'
                            )}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUnblockIP(ip.id)}
                            >
                              <Check className="h-3 w-3 mr-1" />
                              Unblock
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            {/* Device Blocking Tab */}
            <TabsContent value="device-blocking" className="space-y-4">
              <div className="flex justify-end">
                <Dialog open={showBlockDeviceDialog} onOpenChange={setShowBlockDeviceDialog}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Block Device
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Block Device</DialogTitle>
                      <DialogDescription>
                        Block a device by fingerprint or user agent string
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="deviceName">Device Name (optional)</Label>
                        <Input
                          id="deviceName"
                          placeholder="e.g. Chrome on Windows"
                          value={newDeviceName}
                          onChange={(e) => setNewDeviceName(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="deviceFingerprint">Device Fingerprint</Label>
                        <Input
                          id="deviceFingerprint"
                          placeholder="Unique device identifier"
                          value={newDeviceFingerprint}
                          onChange={(e) => setNewDeviceFingerprint(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="deviceUA">User Agent</Label>
                        <Input
                          id="deviceUA"
                          placeholder="Mozilla/5.0..."
                          value={newDeviceUserAgent}
                          onChange={(e) => setNewDeviceUserAgent(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="deviceReason">Reason (optional)</Label>
                        <Input
                          id="deviceReason"
                          placeholder="Suspicious bot activity"
                          value={newDeviceReason}
                          onChange={(e) => setNewDeviceReason(e.target.value)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="devicePermanent">Permanent Block</Label>
                        <Switch
                          id="devicePermanent"
                          checked={newDevicePermanent}
                          onCheckedChange={setNewDevicePermanent}
                        />
                      </div>
                      {!newDevicePermanent && (
                        <div className="space-y-2">
                          <Label>Block Duration</Label>
                          <Select value={newDeviceDuration} onValueChange={setNewDeviceDuration}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">1 hour</SelectItem>
                              <SelectItem value="6">6 hours</SelectItem>
                              <SelectItem value="24">24 hours</SelectItem>
                              <SelectItem value="72">3 days</SelectItem>
                              <SelectItem value="168">7 days</SelectItem>
                              <SelectItem value="720">30 days</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowBlockDeviceDialog(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleBlockDevice}>Block Device</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Device</TableHead>
                      <TableHead>Fingerprint / User Agent</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Blocked At</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {blockedDevices.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          No blocked devices
                        </TableCell>
                      </TableRow>
                    ) : (
                      blockedDevices.map((device) => (
                        <TableRow key={device.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Monitor className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">{device.device_name || 'Unknown Device'}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate font-mono">
                            {device.device_fingerprint || device.user_agent || 'N/A'}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground max-w-[150px] truncate">
                            {device.reason || 'No reason'}
                          </TableCell>
                          <TableCell>
                            {device.is_permanent ? (
                              <Badge variant="destructive">Permanent</Badge>
                            ) : isExpired(device.blocked_until, device.is_permanent) ? (
                              <Badge variant="secondary">Expired</Badge>
                            ) : (
                              <Badge variant="default">Active</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatDistanceToNow(new Date(device.created_at), { addSuffix: true })}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUnblockDevice(device.id)}
                            >
                              <Check className="h-3 w-3 mr-1" />
                              Unblock
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            {/* Geo-Blocking Tab */}
            <TabsContent value="geo-blocking" className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Label>Geo-Blocking Rules</Label>
                </div>
                <Dialog open={showGeoRuleDialog} onOpenChange={setShowGeoRuleDialog}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Country
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Block Country</DialogTitle>
                      <DialogDescription>
                        Block access from a specific country
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>Country</Label>
                        <Select value={newCountryCode} onValueChange={setNewCountryCode}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a country" />
                          </SelectTrigger>
                          <SelectContent>
                            {COMMON_COUNTRIES.map(country => (
                              <SelectItem key={country.code} value={country.code}>
                                {country.name} ({country.code})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="geoReason">Reason (optional)</Label>
                        <Input
                          id="geoReason"
                          placeholder="High fraud rate"
                          value={newCountryReason}
                          onChange={(e) => setNewCountryReason(e.target.value)}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowGeoRuleDialog(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleAddGeoRule}>Block Country</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Country</TableHead>
                      <TableHead>Code</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Added</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {geoRules.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          No geo-blocking rules configured
                        </TableCell>
                      </TableRow>
                    ) : (
                      geoRules.map((rule) => (
                        <TableRow key={rule.id}>
                          <TableCell className="font-medium">{rule.country_name}</TableCell>
                          <TableCell className="font-mono">{rule.country_code}</TableCell>
                          <TableCell>
                            <Badge variant={rule.is_blocked ? "destructive" : "secondary"}>
                              {rule.is_blocked ? 'Blocked' : 'Allowed'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {rule.reason || 'No reason'}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatDistanceToNow(new Date(rule.created_at), { addSuffix: true })}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRemoveGeoRule(rule.id)}
                            >
                              <Trash2 className="h-3 w-3 mr-1" />
                              Remove
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            {/* Rate Limits Tab */}
            <TabsContent value="rate-limits" className="space-y-4">
              <div className="flex justify-end">
                <Dialog open={showAddRateLimitDialog} onOpenChange={setShowAddRateLimitDialog}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Rule
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Rate Limit Rule</DialogTitle>
                      <DialogDescription>
                        Configure a new rate limiting rule for an endpoint
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="rlEndpoint">Endpoint / Rule Name</Label>
                        <Input
                          id="rlEndpoint"
                          placeholder="e.g. Login, API, Checkout"
                          value={newRLEndpoint}
                          onChange={(e) => setNewRLEndpoint(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="rlMaxRequests">Max Requests</Label>
                        <Input
                          id="rlMaxRequests"
                          type="number"
                          placeholder="100"
                          value={newRLMaxRequests}
                          onChange={(e) => setNewRLMaxRequests(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="rlTimeWindow">Time Window (seconds)</Label>
                        <Input
                          id="rlTimeWindow"
                          type="number"
                          placeholder="60"
                          value={newRLTimeWindow}
                          onChange={(e) => setNewRLTimeWindow(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="rlBlockDuration">Block Duration (seconds)</Label>
                        <Input
                          id="rlBlockDuration"
                          type="number"
                          placeholder="300"
                          value={newRLBlockDuration}
                          onChange={(e) => setNewRLBlockDuration(e.target.value)}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowAddRateLimitDialog(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleAddRateLimitRule}>Add Rule</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="grid gap-4">
                {rateLimitSettings.length === 0 ? (
                  <Card>
                    <CardContent className="py-8 text-center text-muted-foreground">
                      No rate limit settings configured. Click "Add Rule" to create one.
                    </CardContent>
                  </Card>
                ) : (
                  rateLimitSettings.map((setting) => (
                    <Card key={setting.id}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            {setting.endpoint || setting.setting_key}
                          </CardTitle>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-2">
                              <Label className="text-xs">Enabled</Label>
                              <Switch
                                checked={setting.is_enabled}
                                onCheckedChange={(checked) => handleUpdateRateLimitSetting(setting.id, {
                                  is_enabled: checked
                                })}
                              />
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => handleDeleteRateLimitRule(setting.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-4 md:grid-cols-3">
                          <div className="space-y-2">
                            <Label>Max Requests</Label>
                            <Input
                              type="number"
                              value={setting.max_requests}
                              onChange={(e) => handleUpdateRateLimitSetting(setting.id, {
                                max_requests: parseInt(e.target.value) || 10
                              })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Time Window (seconds)</Label>
                            <Input
                              type="number"
                              value={setting.window_seconds || setting.time_window_seconds}
                              onChange={(e) => {
                                const val = parseInt(e.target.value) || 60;
                                handleUpdateRateLimitSetting(setting.id, {
                                  window_seconds: val,
                                  time_window_seconds: val,
                                });
                              }}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Block Duration (seconds)</Label>
                            <Input
                              type="number"
                              value={setting.block_duration_seconds}
                              onChange={(e) => handleUpdateRateLimitSetting(setting.id, {
                                block_duration_seconds: parseInt(e.target.value) || 300
                              })}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
