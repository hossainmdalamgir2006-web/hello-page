import { useState, useEffect } from "react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useOrdersData } from "@/hooks/useOrdersData";
import { useShippingData } from "@/hooks/useShippingData";
import { useShipmentsData } from "@/hooks/useShipmentsData";
import { SteadfastTab } from "@/components/shipping/SteadfastTab";
import { PathaoTab } from "@/components/shipping/PathaoTab";
import { RedXTab } from "@/components/shipping/RedXTab";
import { PaperflyTab } from "@/components/shipping/PaperflyTab";

import { Loader2 } from "lucide-react";
import { 
  MapPin, 
  Truck, 
  Package, 
  Plus, 
  Edit, 
  Trash2, 
  Globe,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  Navigation,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import { formatPrice } from "@/lib/formatPrice";
import { DeleteConfirmModal } from "@/components/ui/DeleteConfirmModal";


const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: "Pending", color: "bg-yellow-100 text-yellow-800", icon: Clock },
  picked_up: { label: "Picked Up", color: "bg-blue-100 text-blue-800", icon: Package },
  in_transit: { label: "In Transit", color: "bg-purple-100 text-purple-800", icon: Truck },
  out_for_delivery: { label: "Out for Delivery", color: "bg-indigo-100 text-indigo-800", icon: Navigation },
  delivered: { label: "Delivered", color: "bg-green-100 text-green-800", icon: CheckCircle },
  returned: { label: "Returned", color: "bg-red-100 text-red-800", icon: XCircle },
};

export default function Shipping() {
  // Database hooks
  const shippingData = useShippingData();
  const { zonesWithRates, loading: shippingLoading, addZone, toggleZone, deleteZone, addRate, updateRate, deleteRate, toggleRate } = shippingData;
  const { shipments, stats: shipmentStats, loading: shipmentsLoading } = useShipmentsData();
  
  
  const [zoneDialogOpen, setZoneDialogOpen] = useState(false);
  const [rateDialogOpen, setRateDialogOpen] = useState(false);
  const [editRateDialogOpen, setEditRateDialogOpen] = useState(false);
  const [selectedZone, setSelectedZone] = useState<{ id: string; name: string } | null>(null);
  const [trackingSearch, setTrackingSearch] = useState("");

  const [newZone, setNewZone] = useState({ name: "", regions: "" });
  const [newRate, setNewRate] = useState({
    name: "",
    shipping_method: "Standard" as string,
    rate: 0,
    min_weight: null as number | null,
    max_weight: null as number | null,
    min_order_amount: null as number | null,
    max_order_amount: null as number | null,
    min_days: 1,
    max_days: 3,
  });
  const [editingRate, setEditingRate] = useState<{
    id: string;
    name: string;
    shipping_method: string | null;
    rate: number;
    min_weight: number | null;
    max_weight: number | null;
    min_order_amount: number | null;
    max_order_amount: number | null;
    min_days: number;
    max_days: number;
    is_active: boolean;
  } | null>(null);
  const [zoneMethodsDialog, setZoneMethodsDialog] = useState<{ id: string; name: string; methods: string[] } | null>(null);
  const [methodInput, setMethodInput] = useState("");
  // Calculator state
  const [calcZoneId, setCalcZoneId] = useState<string>("");
  const [calcRegion, setCalcRegion] = useState<string>("");
  const [calcWeight, setCalcWeight] = useState<string>("");
  const [calcOrderAmount, setCalcOrderAmount] = useState<string>("");
  const [deleteZoneItem, setDeleteZoneItem] = useState<{ id: string; name: string } | null>(null);
  const [deleteRateItem, setDeleteRateItem] = useState<{ id: string; name: string } | null>(null);

  const { orders } = useOrdersData();

  // Filter pending orders for shipping
  const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'processing');

  const stats = {
    totalZones: zonesWithRates.length,
    activeZones: zonesWithRates.filter(z => z.is_active).length,
    activeCouriers: 5, // Steadfast, Pathao, RedX, Paperfly, eCourier
    ...shipmentStats,
  };

  const handleAddZone = async () => {
    if (!newZone.name || !newZone.regions) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      await addZone(newZone.name, newZone.regions.split(",").map(r => r.trim()));
      setNewZone({ name: "", regions: "" });
      setZoneDialogOpen(false);
    } catch (error) {
      // Error handled in hook
    }
  };

  const validateRate = (r: { rate: number; min_weight: number | null; max_weight: number | null; min_days: number; max_days: number; min_order_amount: number | null; max_order_amount: number | null; }): string | null => {
    if (r.rate < 0) return "Base rate must be 0 or greater";
    if (r.min_weight != null && r.min_weight < 0) return "Min weight cannot be negative";
    if (r.max_weight != null && r.max_weight < 0) return "Max weight cannot be negative";
    if (r.min_weight != null && r.max_weight != null && r.min_weight > r.max_weight) return "Min weight must be ≤ max weight";
    if (r.min_days < 0 || r.max_days < 0) return "Delivery days cannot be negative";
    if (r.min_days > r.max_days) return "Min days must be ≤ max days";
    if (r.min_order_amount != null && r.max_order_amount != null && r.min_order_amount > r.max_order_amount) return "Min order amount must be ≤ max order amount";
    return null;
  };

  const handleAddRate = async () => {
    if (!selectedZone || !newRate.name || !newRate.rate) {
      toast.error("Please fill in all required fields");
      return;
    }
    const err = validateRate(newRate);
    if (err) { toast.error(err); return; }

    try {
      await addRate({
        zone_id: selectedZone.id,
        name: newRate.name,
        shipping_method: newRate.shipping_method || null,
        rate: newRate.rate,
        min_weight: newRate.min_weight,
        max_weight: newRate.max_weight,
        min_order_amount: newRate.min_order_amount,
        max_order_amount: newRate.max_order_amount,
        min_days: newRate.min_days,
        max_days: newRate.max_days,
        is_active: true
      });
      setNewRate({ name: "", shipping_method: "Standard", rate: 0, min_weight: null, max_weight: null, min_order_amount: null, max_order_amount: null, min_days: 1, max_days: 3 });
      setRateDialogOpen(false);
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleEditRate = async () => {
    if (!editingRate) return;
    const err = validateRate(editingRate);
    if (err) { toast.error(err); return; }
    try {
      await updateRate(editingRate.id, {
        name: editingRate.name,
        shipping_method: editingRate.shipping_method,
        rate: editingRate.rate,
        min_weight: editingRate.min_weight,
        max_weight: editingRate.max_weight,
        min_order_amount: editingRate.min_order_amount,
        max_order_amount: editingRate.max_order_amount,
        min_days: editingRate.min_days,
        max_days: editingRate.max_days,
      });
      setEditingRate(null);
      setEditRateDialogOpen(false);
    } catch (error) {
      // Error handled in hook
    }
  };

  const openEditRateDialog = (rate: any) => {
    setEditingRate({
      id: rate.id,
      name: rate.name,
      shipping_method: rate.shipping_method ?? null,
      rate: rate.rate,
      min_weight: rate.min_weight,
      max_weight: rate.max_weight,
      min_order_amount: rate.min_order_amount,
      max_order_amount: rate.max_order_amount,
      min_days: rate.min_days ?? 1,
      max_days: rate.max_days ?? 3,
      is_active: rate.is_active,
    });
    setEditRateDialogOpen(true);
  };

  const saveZoneMethods = async () => {
    if (!zoneMethodsDialog) return;
    try {
      await shippingData.updateZone(zoneMethodsDialog.id, { shipping_methods: zoneMethodsDialog.methods } as any);
      setZoneMethodsDialog(null);
      setMethodInput("");
    } catch (error) {
      // handled in hook
    }
  };

  // Calculator: match zone by region OR explicit selection
  const calcZone = zonesWithRates.find(z => {
    if (calcZoneId) return z.id === calcZoneId;
    if (!calcRegion.trim()) return false;
    return z.regions?.some(r => r.toLowerCase().includes(calcRegion.trim().toLowerCase()));
  });
  const calcWeightNum = calcWeight ? Number(calcWeight) : null;
  const calcOrderNum = calcOrderAmount ? Number(calcOrderAmount) : 0;

  // Calculator validation errors
  const calcErrors: string[] = [];
  const hasAnyInput = !!(calcZoneId || calcRegion.trim() || calcWeight || calcOrderAmount);
  if (calcRegion.trim() && calcRegion.trim().length < 2) calcErrors.push("Region must be at least 2 characters.");
  if (calcWeight !== "" && (isNaN(Number(calcWeight)) || Number(calcWeight) < 0)) calcErrors.push("Package weight must be a positive number.");
  if (calcOrderAmount !== "" && (isNaN(Number(calcOrderAmount)) || Number(calcOrderAmount) < 0)) calcErrors.push("Order amount must be a positive number.");
  if (!calcZoneId && calcRegion.trim() && calcRegion.trim().length >= 2 && !calcZone) {
    calcErrors.push(`No shipping zone covers "${calcRegion.trim()}". Try a different region or pick a zone manually.`);
  }
  if (!calcZoneId && !calcRegion.trim() && hasAnyInput) {
    calcErrors.push("Enter a region/city or pick a shipping zone to match a rate.");
  }
  if (calcZone && !calcZone.is_active) calcErrors.push(`Zone "${calcZone.name}" is currently inactive.`);

  const calcMatchingRates = (calcZone?.rates || []).filter(r => {
    if (!r.is_active) return false;
    if (r.shipping_method && calcZone?.shipping_methods && !calcZone.shipping_methods.includes(r.shipping_method)) return false;
    if (calcWeightNum != null) {
      if (r.min_weight != null && calcWeightNum < r.min_weight) return false;
      if (r.max_weight != null && calcWeightNum > r.max_weight) return false;
    }
    if (r.min_order_amount != null && calcOrderNum < r.min_order_amount) return false;
    return true;
  });




  const filteredShipments = shipments.filter(s => 
    s.tracking_number?.toLowerCase().includes(trackingSearch.toLowerCase()) ||
    s.order_number?.toLowerCase().includes(trackingSearch.toLowerCase()) ||
    s.recipient_name?.toLowerCase().includes(trackingSearch.toLowerCase())
  );

  return (
    <>
      <div className="space-y-6">
        <AdminPageHeader
          title="Shipping Management"
          description="Manage shipping zones, rates and courier integrations"
        />

        {/* Stats */}
        <div className="grid gap-3 sm:gap-4 grid-cols-2 md:grid-cols-5">
          {[
            { label: "Total Zones", value: stats.totalZones.toString(), icon: Globe, color: "primary" },
            { label: "Pending Shipments", value: stats.pending.toString(), icon: Clock, color: "warning" },
            { label: "In Transit", value: stats.inTransit.toString(), icon: Truck, color: "accent" },
            { label: "Delivered", value: stats.delivered.toString(), icon: CheckCircle, color: "success" },
            { label: "Returned", value: stats.returned.toString(), icon: XCircle, color: "warning" },
          ].map((card) => {
            const IconComp = card.icon;
            const bgMap: Record<string,string> = { primary: "bg-primary/10 text-primary", accent: "bg-accent/10 text-accent", success: "bg-success/10 text-success", warning: "bg-warning/10 text-warning" };
            const borderMap: Record<string,string> = { primary: "border-l-primary", accent: "border-l-accent", success: "border-l-success", warning: "border-l-warning" };
            const cardBgMap: Record<string,string> = { primary: "bg-primary/5 dark:bg-primary/10", accent: "bg-accent/5 dark:bg-accent/10", success: "bg-success/5 dark:bg-success/10", warning: "bg-warning/5 dark:bg-warning/10" };
            return (
              <div key={card.label} className={`group relative rounded-xl border border-border/50 p-4 sm:p-5 transition-all duration-300 hover:shadow-md hover:border-border hover:-translate-y-0.5 border-l-[3px] ${borderMap[card.color]} ${cardBgMap[card.color]} animate-fade-in`}>
                <div className="flex items-center gap-3">
                  <div className={`rounded-lg p-2 ${bgMap[card.color]}`}>
                    <IconComp className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                </div>
                <div className="mt-3">
                  <h3 className="text-lg sm:text-xl font-bold text-foreground truncate tracking-tight">{card.value}</h3>
                  <p className="mt-0.5 text-[11px] sm:text-xs text-muted-foreground font-medium uppercase tracking-wider truncate">{card.label}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="steadfast" className="space-y-4">
          <TabsList className="flex flex-wrap h-auto gap-1">
            <TabsTrigger value="steadfast" className="gap-1.5"><img src="/logos/steadfast.svg" alt="Steadfast" className="h-5 w-auto object-contain" /> Steadfast</TabsTrigger>
            <TabsTrigger value="pathao" className="gap-1.5"><img src="/logos/pathao.svg" alt="Pathao" className="h-5 w-auto object-contain" /> Pathao</TabsTrigger>
            <TabsTrigger value="redx" className="gap-1.5"><img src="/logos/redx.svg" alt="RedX" className="h-5 w-auto object-contain" /> RedX</TabsTrigger>
            <TabsTrigger value="paperfly" className="gap-1.5"><img src="/logos/paperfly.svg" alt="Paperfly" className="h-5 w-auto object-contain" /> Paperfly</TabsTrigger>
            
            <TabsTrigger value="zones">Shipping Zones</TabsTrigger>
            <TabsTrigger value="rates">Rate Config</TabsTrigger>
            <TabsTrigger value="calculator">Calculator</TabsTrigger>
            <TabsTrigger value="tracking">Tracking</TabsTrigger>
          </TabsList>

          {/* Steadfast Tab */}
          <TabsContent value="steadfast" className="space-y-4">
            <SteadfastTab pendingOrders={pendingOrders} />
          </TabsContent>

          {/* Pathao Tab */}
          <TabsContent value="pathao" className="space-y-4">
            <PathaoTab pendingOrders={pendingOrders} />
          </TabsContent>

          {/* RedX Tab */}
          <TabsContent value="redx" className="space-y-4">
            <RedXTab pendingOrders={pendingOrders} />
          </TabsContent>

          {/* Paperfly Tab */}
          <TabsContent value="paperfly" className="space-y-4">
            <PaperflyTab pendingOrders={pendingOrders} />
          </TabsContent>


          {/* Shipping Zones Tab */}
          <TabsContent value="zones" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Shipping Zones</h2>
              <Button onClick={() => setZoneDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                New Zone
              </Button>
            </div>

            {shippingLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {zonesWithRates.map((zone) => (
                  <Card key={zone.id} className={!zone.is_active ? "opacity-60" : ""}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{zone.name}</CardTitle>
                        <Switch 
                          checked={zone.is_active} 
                          onCheckedChange={() => toggleZone(zone.id)}
                        />
                      </div>
                      <CardDescription>
                        {zone.regions.join(", ")}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div>
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">Shipping Methods</p>
                          <div className="flex flex-wrap gap-1.5">
                            {(zone.shipping_methods?.length ? zone.shipping_methods : ["—"]).map((m) => (
                              <Badge key={m} variant="secondary" className="text-xs">{m}</Badge>
                            ))}
                          </div>
                        </div>
                        <p className="text-sm font-medium pt-2">Shipping Rates ({zone.rates?.length || 0})</p>
                        {zone.rates?.slice(0, 2).map((rate) => (
                          <div key={rate.id} className="flex justify-between text-sm">
                            <span className="text-muted-foreground">{rate.name}{rate.shipping_method ? ` · ${rate.shipping_method}` : ""}</span>
                            <span>{formatPrice(rate.rate)}</span>
                          </div>
                        ))}
                        {(zone.rates?.length || 0) > 2 && (
                          <p className="text-xs text-muted-foreground">
                            +{(zone.rates?.length || 0) - 2} more rates
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => {
                            setSelectedZone({ id: zone.id, name: zone.name });
                            setRateDialogOpen(true);
                          }}
                        >
                          <DollarSign className="h-4 w-4 mr-1" />
                          Add Rate
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setZoneMethodsDialog({ id: zone.id, name: zone.name, methods: [...(zone.shipping_methods || [])] })}
                        >
                          <Truck className="h-4 w-4 mr-1" /> Methods
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteZoneItem({ id: zone.id, name: zone.name })}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Rates Configuration Tab */}
          <TabsContent value="rates" className="space-y-4">
            <h2 className="text-xl font-semibold">Rate Configuration</h2>
            
            {shippingLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              zonesWithRates.map((zone) => (
                <Card key={zone.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{zone.name}</CardTitle>
                      <Badge variant={zone.is_active ? "default" : "secondary"}>
                        {zone.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Rate Name</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Rate</TableHead>
                          <TableHead>Weight Range</TableHead>
                          <TableHead>Delivery Time</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {zone.rates?.map((rate) => (
                          <TableRow key={rate.id}>
                            <TableCell className="font-medium">{rate.name}</TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {rate.min_weight || rate.max_weight ? 'Weight Based' : 
                                 rate.min_order_amount || rate.max_order_amount ? 'Order Based' : 'Flat Rate'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {formatPrice(rate.rate)}
                              {rate.min_order_amount && <span className="text-xs text-muted-foreground"> (Min: {formatPrice(rate.min_order_amount)})</span>}
                              {rate.max_order_amount && <span className="text-xs text-green-600"> (Free above {formatPrice(rate.max_order_amount)})</span>}
                            </TableCell>
                            <TableCell>
                              {rate.min_weight ? `${rate.min_weight}kg` : '0'}-{rate.max_weight ? `${rate.max_weight}kg` : '∞'}
                            </TableCell>
                            <TableCell>
                              <span className="text-sm text-muted-foreground">
                                {rate.min_days ?? 1}-{rate.max_days ?? 3} days
                              </span>
                            </TableCell>
                            <TableCell>
                              <Badge variant={rate.is_active ? "default" : "secondary"}>
                                {rate.is_active ? "Active" : "Inactive"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="icon" onClick={() => openEditRateDialog(rate)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => setDeleteRateItem({ id: rate.id, name: rate.name })}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                        {(!zone.rates || zone.rates.length === 0) && (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                              No rates configured
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Calculator Tab */}
          <TabsContent value="calculator" className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold">Shipping Cost Calculator</h2>
              <p className="text-sm text-muted-foreground">Preview the matching zone, methods, and rates for a test address.</p>
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Test Address</CardTitle>
                  <CardDescription>Pick a zone or type a region name; add weight & order amount.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Shipping Zone (optional)</Label>
                    <Select value={calcZoneId || "auto"} onValueChange={(v) => setCalcZoneId(v === "auto" ? "" : v)}>
                      <SelectTrigger><SelectValue placeholder="Auto-detect from region" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="auto">Auto-detect from region</SelectItem>
                        {zonesWithRates.map(z => (
                          <SelectItem key={z.id} value={z.id}>{z.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Region / City</Label>
                    <Input
                      placeholder="e.g. Dhaka, Chattogram"
                      value={calcRegion}
                      onChange={(e) => setCalcRegion(e.target.value)}
                      disabled={!!calcZoneId}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Package Weight (kg)</Label>
                      <Input type="number" min="0" step="0.1" placeholder="e.g. 1.5" value={calcWeight} onChange={(e) => setCalcWeight(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Order Amount (৳)</Label>
                      <Input type="number" min="0" placeholder="e.g. 2500" value={calcOrderAmount} onChange={(e) => setCalcOrderAmount(e.target.value)} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Matched Zone & Rates</CardTitle>
                  <CardDescription>Live preview based on test input.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {calcErrors.length > 0 && (
                    <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-3 space-y-1">
                      <p className="text-xs font-semibold text-destructive uppercase tracking-wide flex items-center gap-1.5"><XCircle className="h-3.5 w-3.5" /> Validation errors</p>
                      <ul className="text-xs text-destructive list-disc pl-5 space-y-0.5">
                        {calcErrors.map((e, i) => <li key={i}>{e}</li>)}
                      </ul>
                    </div>
                  )}
                  {!calcZone ? (
                    <p className="text-sm text-muted-foreground">Enter a region or pick a zone to preview.</p>
                  ) : (
                    <>
                      <div className="rounded-lg border p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">{calcZone.name}</p>
                          <Badge variant={calcZone.is_active ? "default" : "secondary"}>{calcZone.is_active ? "Active" : "Inactive"}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">Regions: {calcZone.regions.join(", ") || "—"}</p>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {(calcZone.shipping_methods || []).map((m) => <Badge key={m} variant="outline" className="text-xs">{m}</Badge>)}
                        </div>
                      </div>

                      {calcMatchingRates.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No matching rates for the given input.</p>
                      ) : (
                        <div className="space-y-2">
                          {calcMatchingRates.map((rate) => {
                            const isFree = rate.max_order_amount && calcOrderNum >= rate.max_order_amount;
                            return (
                              <div key={rate.id} className="flex items-center justify-between rounded-lg border p-3">
                                <div>
                                  <p className="font-medium text-sm">{rate.name}{rate.shipping_method ? ` · ${rate.shipping_method}` : ""}</p>
                                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Clock className="h-3 w-3" /> {rate.min_days ?? 1}-{rate.max_days ?? 3} days
                                    {rate.min_weight != null || rate.max_weight != null ? ` • ${rate.min_weight ?? 0}-${rate.max_weight ?? "∞"}kg` : ""}
                                  </p>
                                </div>
                                <div className="text-right">
                                  {isFree ? <span className="text-green-600 font-medium text-sm">FREE</span> : <span className="font-semibold">{formatPrice(rate.rate)}</span>}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>


          {/* All Shipments Tracking Tab */}
          <TabsContent value="tracking" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">All Shipment Tracking</h2>
              <div className="flex gap-2">
                <Input 
                  placeholder="Search tracking code or order number..."
                  value={trackingSearch}
                  onChange={(e) => setTrackingSearch(e.target.value)}
                  className="w-64"
                />
              </div>
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Courier</TableHead>
                      <TableHead>Tracking Code</TableHead>
                      <TableHead>Order Number</TableHead>
                      <TableHead>Recipient</TableHead>
                      <TableHead>COD</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredShipments.map((shipment) => {
                      const status = statusConfig[shipment.status] || statusConfig.pending;
                      const StatusIcon = status.icon;
                      return (
                        <TableRow key={shipment.id}>
                          <TableCell>
                            <Badge variant="outline">
                              {shipment.courier === 'steadfast' ? '📦 Steadfast'
                                : shipment.courier === 'pathao' ? '🚴 Pathao'
                                : shipment.courier === 'redx' ? '🔴 RedX'
                                : shipment.courier === 'paperfly' ? '🦋 Paperfly'
                                : '📬 eCourier'}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-mono text-sm">{shipment.tracking_number || shipment.consignment_id || '-'}</TableCell>
                          <TableCell className="font-mono text-sm">{shipment.order_number || '-'}</TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium text-sm">{shipment.recipient_name || '-'}</p>
                              <p className="text-xs text-muted-foreground">{shipment.recipient_phone || '-'}</p>
                            </div>
                          </TableCell>
                          <TableCell>{formatPrice((shipment.cod_amount || 0))}</TableCell>
                          <TableCell>
                            <Badge className={status.color}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {status.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(shipment.sent_at || shipment.created_at).toLocaleDateString('en-US')}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" asChild>
                              <a 
                                href={shipment.courier === 'steadfast' ? 'https://portal.packzy.com'
                                  : shipment.courier === 'pathao' ? 'https://merchant.pathao.com'
                                  : shipment.courier === 'redx' ? 'https://merchant.redx.com.bd'
                                  : shipment.courier === 'paperfly' ? 'https://merchant.paperfly.com.bd'
                                  : '#'} 
                                target="_blank" 
                                rel="noopener noreferrer"
                              >
                                <ExternalLink className="h-4 w-4 mr-1" />
                                Track
                              </a>
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {filteredShipments.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                          {shipmentsLoading ? (
                            <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                          ) : (
                            'No shipments found'
                          )}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Add Zone Dialog */}
      <Dialog open={zoneDialogOpen} onOpenChange={setZoneDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Shipping Zone</DialogTitle>
            <DialogDescription>
              Create a new shipping zone
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Zone Name</Label>
              <Input 
                placeholder="e.g. Dhaka City"
                value={newZone.name}
                onChange={(e) => setNewZone({ ...newZone, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Regions (comma separated)</Label>
              <Input 
                placeholder="e.g. Dhaka North, Dhaka South"
                value={newZone.regions}
                onChange={(e) => setNewZone({ ...newZone, regions: e.target.value })}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setZoneDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddZone}>Add Zone</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Rate Dialog */}
      <Dialog open={rateDialogOpen} onOpenChange={setRateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>New Shipping Rate</DialogTitle>
            <DialogDescription>
              Add a new rate to {selectedZone?.name} zone
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Rate Name</Label>
              <Input 
                placeholder="e.g. Standard Delivery"
                value={newRate.name}
                onChange={(e) => setNewRate({ ...newRate, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Shipping Method</Label>
              <Select
                value={newRate.shipping_method}
                onValueChange={(v) => setNewRate({ ...newRate, shipping_method: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  {(zonesWithRates.find(z => z.id === selectedZone?.id)?.shipping_methods || ["Standard","Express","Cash on Delivery"]).map((m) => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">Must match a method enabled on this zone for it to show at checkout.</p>
            </div>
            <div className="space-y-2">
              <Label>Base Rate (৳)</Label>
              <Input 
                type="number"
                placeholder="0"
                className="w-32"
                value={newRate.rate || ""}
                onChange={(e) => setNewRate({ ...newRate, rate: Number(e.target.value) })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Min Weight (kg)</Label>
                <Input
                  type="number" min="0" step="0.1"
                  placeholder="Optional"
                  value={newRate.min_weight ?? ""}
                  onChange={(e) => setNewRate({ ...newRate, min_weight: e.target.value ? Number(e.target.value) : null })}
                />
              </div>
              <div className="space-y-2">
                <Label>Max Weight (kg)</Label>
                <Input
                  type="number" min="0" step="0.1"
                  placeholder="Optional"
                  value={newRate.max_weight ?? ""}
                  onChange={(e) => setNewRate({ ...newRate, max_weight: e.target.value ? Number(e.target.value) : null })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Min Days</Label>
                <Input
                  type="number" min="0"
                  placeholder="1"
                  value={newRate.min_days}
                  onChange={(e) => setNewRate({ ...newRate, min_days: Number(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label>Max Days</Label>
                <Input
                  type="number" min="0"
                  placeholder="3"
                  value={newRate.max_days}
                  onChange={(e) => setNewRate({ ...newRate, max_days: Number(e.target.value) || 0 })}
                />
              </div>
            </div>
            {(() => { const err = validateRate(newRate); return err ? <p className="text-xs text-destructive">{err}</p> : null; })()}
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setRateDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddRate} disabled={!newRate.name || !newRate.rate}>
              Add Rate
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Rate Dialog */}
      <Dialog open={editRateDialogOpen} onOpenChange={setEditRateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Shipping Rate</DialogTitle>
            <DialogDescription>
              Update the shipping rate details
            </DialogDescription>
          </DialogHeader>
          {editingRate && (
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>Rate Name</Label>
                <Input 
                  placeholder="e.g. Standard Delivery"
                  value={editingRate.name}
                  onChange={(e) => setEditingRate({ ...editingRate, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Shipping Method</Label>
                <Select
                  value={editingRate.shipping_method ?? ""}
                  onValueChange={(v) => setEditingRate({ ...editingRate, shipping_method: v })}
                >
                  <SelectTrigger><SelectValue placeholder="Select method" /></SelectTrigger>
                  <SelectContent>
                    {(zonesWithRates.find(z => z.rates?.some(r => r.id === editingRate.id))?.shipping_methods || ["Standard","Express","Cash on Delivery"]).map((m) => (
                      <SelectItem key={m} value={m}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Base Rate (৳)</Label>
                <Input
                  type="number" min="0"
                  placeholder="0"
                  className="w-32"
                  value={editingRate.rate || ""}
                  onChange={(e) => setEditingRate({ ...editingRate, rate: Number(e.target.value) })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Min Weight (kg)</Label>
                  <Input
                    type="number" min="0" step="0.1"
                    placeholder="Optional"
                    value={editingRate.min_weight ?? ""}
                    onChange={(e) => setEditingRate({ ...editingRate, min_weight: e.target.value ? Number(e.target.value) : null })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Max Weight (kg)</Label>
                  <Input
                    type="number" min="0" step="0.1"
                    placeholder="Optional"
                    value={editingRate.max_weight ?? ""}
                    onChange={(e) => setEditingRate({ ...editingRate, max_weight: e.target.value ? Number(e.target.value) : null })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Min Days</Label>
                  <Input
                    type="number" min="0"
                    placeholder="1"
                    value={editingRate.min_days}
                    onChange={(e) => setEditingRate({ ...editingRate, min_days: Number(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Max Days</Label>
                  <Input
                    type="number" min="0"
                    placeholder="3"
                    value={editingRate.max_days}
                    onChange={(e) => setEditingRate({ ...editingRate, max_days: Number(e.target.value) || 0 })}
                  />
                </div>
              </div>
              {(() => { const err = validateRate(editingRate); return err ? <p className="text-xs text-destructive">{err}</p> : null; })()}
            </div>
          )}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setEditRateDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleEditRate} disabled={!editingRate?.name || !editingRate?.rate}>
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Zone Shipping Methods Dialog */}
      <Dialog open={!!zoneMethodsDialog} onOpenChange={(o) => { if (!o) { setZoneMethodsDialog(null); setMethodInput(""); } }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Shipping Methods · {zoneMethodsDialog?.name}</DialogTitle>
            <DialogDescription>
              Choose which methods are offered in this zone. Only rates tagged with an enabled method will appear at checkout.
            </DialogDescription>
          </DialogHeader>
          {zoneMethodsDialog && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Enabled Methods</Label>
                <div className="flex flex-wrap gap-1.5 min-h-[2rem]">
                  {zoneMethodsDialog.methods.length === 0 && (
                    <p className="text-xs text-muted-foreground">No methods enabled.</p>
                  )}
                  {zoneMethodsDialog.methods.map((m) => (
                    <Badge key={m} variant="secondary" className="gap-1">
                      {m}
                      <button
                        type="button"
                        className="ml-1 text-muted-foreground hover:text-destructive"
                        onClick={() => setZoneMethodsDialog({ ...zoneMethodsDialog, methods: zoneMethodsDialog.methods.filter(x => x !== m) })}
                        aria-label={`Remove ${m}`}
                      >×</button>
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Quick Add</Label>
                <div className="flex flex-wrap gap-1.5">
                  {["Standard","Express","Cash on Delivery","Same-Day","Pickup"].filter(p => !zoneMethodsDialog.methods.includes(p)).map(p => (
                    <Button key={p} variant="outline" size="sm" onClick={() => setZoneMethodsDialog({ ...zoneMethodsDialog, methods: [...zoneMethodsDialog.methods, p] })}>
                      + {p}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Custom Method</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g. Drone Delivery"
                    value={methodInput}
                    onChange={(e) => setMethodInput(e.target.value)}
                  />
                  <Button
                    type="button"
                    onClick={() => {
                      const v = methodInput.trim();
                      if (!v) return;
                      if (zoneMethodsDialog.methods.includes(v)) { toast.error("Already added"); return; }
                      setZoneMethodsDialog({ ...zoneMethodsDialog, methods: [...zoneMethodsDialog.methods, v] });
                      setMethodInput("");
                    }}
                  >Add</Button>
                </div>
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => { setZoneMethodsDialog(null); setMethodInput(""); }}>Cancel</Button>
            <Button onClick={saveZoneMethods}>Save</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
