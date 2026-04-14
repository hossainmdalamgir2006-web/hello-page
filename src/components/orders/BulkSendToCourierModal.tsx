import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Truck, Package, Loader2, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { useSteadfastCourier, type SteadfastOrder } from "@/hooks/useSteadfastCourier";
import { usePathaoCourier, type PathaoOrder, type PathaoCity, type PathaoZone } from "@/hooks/usePathaoCourier";
import { useRedXCourier, type RedXParcel } from "@/hooks/useRedXCourier";
import { usePaperflyCourier, type PaperflyParcel } from "@/hooks/usePaperflyCourier";
import { useShipmentsData } from "@/hooks/useShipmentsData";
import { toast } from "sonner";
import { formatPrice } from "@/lib/formatPrice";

interface OrderData {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  shipping_address: any;
  total: number;
  items: Array<{
    product_name: string;
    quantity: number;
  }>;
}

interface BulkSendToCourierModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orders: OrderData[];
  onSuccess?: (successfulOrderIds: string[]) => void;
}

type CourierType = "steadfast" | "pathao" | "redx" | "paperfly";

interface OrderResult {
  orderId: string;
  orderNumber: string;
  status: "pending" | "success" | "error";
  message?: string;
}

const courierOptions: { value: CourierType; label: string; desc: string; logo: string }[] = [
  { value: "steadfast", label: "Steadfast", desc: "Fast & Reliable", logo: "/logos/steadfast.svg" },
  { value: "pathao", label: "Pathao", desc: "Wide Coverage", logo: "/logos/pathao.svg" },
  { value: "redx", label: "RedX", desc: "Express Delivery", logo: "/logos/redx.svg" },
  { value: "paperfly", label: "Paperfly", desc: "Nationwide", logo: "/logos/paperfly.svg" },
];

const getAddressString = (address: any): string => {
  if (!address) return "";
  if (typeof address === "string") return address;
  if (typeof address === "object") {
    const parts = [address.street, address.area, address.city].filter(Boolean);
    return parts.join(", ");
  }
  return "";
};

export function BulkSendToCourierModal({
  open,
  onOpenChange,
  orders,
  onSuccess,
}: BulkSendToCourierModalProps) {
  const [selectedCourier, setSelectedCourier] = useState<CourierType>("steadfast");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [results, setResults] = useState<OrderResult[]>([]);
  const [progress, setProgress] = useState(0);

  // Pathao location state
  const [cities, setCities] = useState<PathaoCity[]>([]);
  const [zones, setZones] = useState<PathaoZone[]>([]);
  const [selectedCity, setSelectedCity] = useState<number | null>(null);
  const [selectedZone, setSelectedZone] = useState<number | null>(null);

  const steadfastCourier = useSteadfastCourier();
  const pathaoCourier = usePathaoCourier();
  const redxCourier = useRedXCourier();
  const paperflyCourier = usePaperflyCourier();
  const { addShipment, shipments, getShipmentByOrderId } = useShipmentsData();

  const pendingOrders = orders.filter((order) => !getShipmentByOrderId(order.id));
  const alreadySentOrders = orders.filter((order) => getShipmentByOrderId(order.id));

  useEffect(() => {
    if (open) {
      setResults([]);
      setProgress(0);
      setSelectedCity(null);
      setSelectedZone(null);
    }
  }, [open]);

  useEffect(() => {
    if (selectedCourier === "pathao" && cities.length === 0) {
      pathaoCourier.getCities().then(setCities).catch(console.error);
    }
  }, [selectedCourier]);

  useEffect(() => {
    if (selectedCity) {
      pathaoCourier.getZones(selectedCity).then(setZones).catch(console.error);
      setSelectedZone(null);
    }
  }, [selectedCity]);

  const handleSubmit = async () => {
    if (pendingOrders.length === 0) {
      toast.error("No orders available to send");
      return;
    }

    if (selectedCourier === "pathao" && (!selectedCity || !selectedZone)) {
      toast.error("Please select a city and zone for Pathao");
      return;
    }

    setIsSubmitting(true);
    setResults([]);
    const successfulIds: string[] = [];

    for (let i = 0; i < pendingOrders.length; i++) {
      const order = pendingOrders[i];
      setProgress(((i + 1) / pendingOrders.length) * 100);

      setResults((prev) => [
        ...prev.filter((r) => r.orderId !== order.id),
        { orderId: order.id, orderNumber: order.order_number, status: "pending" },
      ]);

      try {
        let consignmentId = "";
        let trackingCode = "";
        const address = getAddressString(order.shipping_address);
        const itemDescription = order.items
          ?.map((i) => `${i.product_name} x${i.quantity}`)
          .join(", ");

        if (selectedCourier === "steadfast") {
          const steadfastOrder: SteadfastOrder = {
            invoice: order.order_number,
            recipient_name: order.customer_name,
            recipient_phone: order.customer_phone,
            recipient_address: address,
            cod_amount: order.total,
            item_description: itemDescription,
          };

          const result = await steadfastCourier.createOrder(steadfastOrder);
          if (result?.consignment) {
            consignmentId = result.consignment.consignment_id?.toString() || "";
            trackingCode = result.consignment.tracking_code || "";
          }
        } else if (selectedCourier === "pathao") {
          const pathaoOrder: PathaoOrder = {
            merchant_order_id: order.order_number,
            recipient_name: order.customer_name,
            recipient_phone: order.customer_phone,
            recipient_address: address,
            recipient_city: selectedCity!,
            recipient_zone: selectedZone!,
            amount_to_collect: order.total,
            item_description: itemDescription,
            item_quantity: order.items?.length || 1,
          };

          const result = await pathaoCourier.createOrder(pathaoOrder);
          if (result?.data) {
            consignmentId = result.data.consignment_id || "";
            trackingCode = result.data.tracking_code || "";
          }
        } else if (selectedCourier === "redx") {
          const redxParcel: RedXParcel = {
            customer_name: order.customer_name,
            customer_phone: order.customer_phone,
            delivery_area: address,
            customer_address: address,
            merchant_invoice_id: order.order_number,
            cash_collection_amount: order.total,
            parcel_weight: 0.5,
          };

          const result = await redxCourier.createParcel(redxParcel);
          trackingCode = result?.result?.tracking_id || result?.tracking_id || "";
          consignmentId = trackingCode;
        } else if (selectedCourier === "paperfly") {
          const paperflyParcel: PaperflyParcel = {
            customer_name: order.customer_name,
            customer_mobile: order.customer_phone,
            customer_address: address,
            customer_invoice: order.order_number,
            cash_collection: order.total,
            parcel_weight: 0.5,
          };

          const result = await paperflyCourier.createParcel(paperflyParcel);
          trackingCode = result?.tracking_code || result?.data?.tracking_code || "";
          consignmentId = trackingCode;
        }

        await addShipment({
          order_id: order.id,
          courier: selectedCourier,
          consignment_id: consignmentId,
          tracking_number: trackingCode,
          status: "pending",
          courier_response: {
            recipient_name: order.customer_name,
            recipient_phone: order.customer_phone,
            recipient_address: address,
            cod_amount: order.total,
          },
        });

        successfulIds.push(order.id);
        setResults((prev) =>
          prev.map((r) =>
            r.orderId === order.id
              ? { ...r, status: "success", message: `Tracking: ${trackingCode || consignmentId}` }
              : r
          )
        );
      } catch (error: any) {
        console.error(`Error sending order ${order.order_number}:`, error);
        setResults((prev) =>
          prev.map((r) =>
            r.orderId === order.id
              ? { ...r, status: "error", message: error.message || "Failed" }
              : r
          )
        );
      }

      if (i < pendingOrders.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }

    setIsSubmitting(false);
    
    const successCount = successfulIds.length;
    const failCount = pendingOrders.length - successCount;
    
    if (successCount > 0) {
      toast.success(`${successCount} order(s) sent successfully`);
      onSuccess?.(successfulIds);
    }
    if (failCount > 0) {
      toast.error(`${failCount} order(s) failed to send`);
    }
  };

  const successCount = results.filter((r) => r.status === "success").length;
  const errorCount = results.filter((r) => r.status === "error").length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-card max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-primary" />
            Bulk Courier - {orders.length} Orders
          </DialogTitle>
          <DialogDescription>
            Send multiple orders to courier service at once
          </DialogDescription>
        </DialogHeader>

        {alreadySentOrders.length > 0 && (
          <Card className="border-warning/50 bg-warning/10">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 text-warning">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm font-medium">
                  {alreadySentOrders.length} order(s) already sent (will be skipped)
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="bg-muted/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Package className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">{pendingOrders.length} order(s) will be sent</p>
                  <p className="text-xs text-muted-foreground">
                    Total COD: {formatPrice(pendingOrders.reduce((sum, o) => sum + o.total, 0))}
                  </p>
                </div>
              </div>
              <Badge variant="secondary">{pendingOrders.length} Orders</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Courier Selection */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Select Courier</Label>
          <RadioGroup
            value={selectedCourier}
            onValueChange={(value) => setSelectedCourier(value as CourierType)}
            className="grid grid-cols-2 sm:grid-cols-4 gap-3"
            disabled={isSubmitting}
          >
            {courierOptions.map((courier) => (
              <Label
                key={courier.value}
                htmlFor={`bulk-${courier.value}`}
                className={`flex flex-col items-center gap-2 p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedCourier === courier.value
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                } ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <RadioGroupItem value={courier.value} id={`bulk-${courier.value}`} className="sr-only" />
                <img src={courier.logo} alt={courier.label} className="h-6 w-auto object-contain" />
                <div className="text-center">
                  <p className="font-medium text-sm">{courier.label}</p>
                  <p className="text-[10px] text-muted-foreground">{courier.desc}</p>
                </div>
              </Label>
            ))}
          </RadioGroup>
        </div>

        {/* Pathao Location */}
        {selectedCourier === "pathao" && (
          <div className="space-y-3">
            <Label className="text-sm font-medium text-muted-foreground">
              Same location will be used for all orders
            </Label>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>City *</Label>
                <Select
                  value={selectedCity?.toString() || ""}
                  onValueChange={(value) => setSelectedCity(parseInt(value))}
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select city" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover max-h-60">
                    {cities.map((city) => (
                      <SelectItem key={city.city_id} value={city.city_id.toString()}>
                        {city.city_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Zone *</Label>
                <Select
                  value={selectedZone?.toString() || ""}
                  onValueChange={(value) => setSelectedZone(parseInt(value))}
                  disabled={!selectedCity || isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select zone" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover max-h-60">
                    {zones.map((zone) => (
                      <SelectItem key={zone.zone_id} value={zone.zone_id.toString()}>
                        {zone.zone_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}

        {/* Progress & Results */}
        {(isSubmitting || results.length > 0) && (
          <div className="space-y-3">
            {isSubmitting && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Progress</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} />
              </div>
            )}

            {results.length > 0 && (
              <>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1 text-success">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Success: {successCount}</span>
                  </div>
                  <div className="flex items-center gap-1 text-destructive">
                    <XCircle className="h-4 w-4" />
                    <span>Failed: {errorCount}</span>
                  </div>
                </div>

                <ScrollArea className="h-48 border rounded-lg">
                  <div className="p-3 space-y-2">
                    {results.map((result) => (
                      <div
                        key={result.orderId}
                        className={`flex items-center justify-between p-2 rounded-md text-sm ${
                          result.status === "success"
                            ? "bg-success/10"
                            : result.status === "error"
                            ? "bg-destructive/10"
                            : "bg-muted"
                        }`}
                      >
                        <span className="font-medium">{result.orderNumber}</span>
                        <div className="flex items-center gap-2">
                          {result.status === "pending" && (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          )}
                          {result.status === "success" && (
                            <CheckCircle2 className="h-4 w-4 text-success" />
                          )}
                          {result.status === "error" && (
                            <XCircle className="h-4 w-4 text-destructive" />
                          )}
                          <span className="text-xs text-muted-foreground truncate max-w-[150px]">
                            {result.message}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </>
            )}
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            {results.length > 0 && !isSubmitting ? "Close" : "Cancel"}
          </Button>
          {(!results.length || isSubmitting) && (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || pendingOrders.length === 0}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Truck className="mr-2 h-4 w-4" />
                  Send {pendingOrders.length} Orders
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
