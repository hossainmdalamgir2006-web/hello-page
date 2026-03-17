import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { CheckCircle, Package, ArrowRight, MapPin, CreditCard, Copy, Check, Clock, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import { SEOHead } from "@/components/SEOHead";
import { useAuth } from "@/contexts/AuthContext";

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  image: string;
}

interface OrderState {
  orderNumber: string;
  paymentMethod?: {
    method_id: string;
    name: string;
    name_bn?: string | null;
    icon?: string | null;
    logo_url?: string | null;
    account_number?: string | null;
    account_type?: string | null;
  };
  transactionId?: string;
  total?: number;
  items?: OrderItem[];
  subtotal?: number;
  discount?: number;
  shippingCost?: number;
  codCharge?: number;
  deliveryEstimate?: string;
  shippingZone?: string;
}

export default function OrderConfirmation() {
  const location = useLocation();
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const orderState = location.state as OrderState | undefined;
  const orderNumber = orderState?.orderNumber || `ORD-${Date.now().toString().slice(-8)}`;
  const paymentMethod = orderState?.paymentMethod;
  const transactionId = orderState?.transactionId;
  const total = orderState?.total;
  const items = orderState?.items;
  const subtotal = orderState?.subtotal;
  const discount = orderState?.discount;
  const shippingCost = orderState?.shippingCost;
  const codCharge = orderState?.codCharge;
  const deliveryEstimate = orderState?.deliveryEstimate || '3-5 business days';

  const formatPrice = (price: number) => `৳${price.toLocaleString('en-BD')}`;

  const handleCopyOrderNumber = async () => {
    try {
      await navigator.clipboard.writeText(orderNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const getPaymentStatusMessage = () => {
    if (paymentMethod?.method_id === 'cod') return 'Payment will be collected upon delivery';
    if (['bkash', 'nagad', 'rocket', 'upay'].includes(paymentMethod?.method_id || '')) {
      return transactionId ? `TrxID: ${transactionId} - Payment verification pending` : 'Payment verification pending';
    }
    return 'Processing';
  };

  return (
    <>
      <SEOHead title="Order Confirmation" description="Your order has been placed successfully." noIndex={true} />
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
            Thank You for Your Order!
          </h1>
          <p className="text-muted-foreground mb-3">Your order has been placed successfully.</p>
          <div className="flex items-center justify-center gap-2">
            <p className="text-foreground font-medium">
              Order Number: <span className="text-store-primary font-mono">{orderNumber}</span>
            </p>
            <button onClick={handleCopyOrderNumber} className="inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-muted transition-colors" title="Copy order number">
              {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4 text-muted-foreground" />}
            </button>
          </div>
        </div>

        {/* Estimated Delivery */}
        <Card className="mb-4">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-store-primary flex-shrink-0" />
              <div>
                <p className="font-medium text-sm">Estimated Delivery</p>
                <p className="text-sm text-muted-foreground">{deliveryEstimate}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Order Items */}
        {items && items.length > 0 && (
          <Card className="mb-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <ShoppingBag className="h-4 w-4" /> Order Items ({items.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {items.map((item, idx) => (
                <div key={idx} className="flex gap-3 items-center">
                  <div className="w-14 h-14 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{formatPrice(item.price)} × {item.quantity}</p>
                  </div>
                  <p className="text-sm font-semibold flex-shrink-0">{formatPrice(item.price * item.quantity)}</p>
                </div>
              ))}

              {/* Total Breakdown */}
              <Separator className="my-3" />
              <div className="space-y-1.5">
                {subtotal !== undefined && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                )}
                {discount !== undefined && discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount</span>
                    <span>-{formatPrice(discount)}</span>
                  </div>
                )}
                {shippingCost !== undefined && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className={shippingCost === 0 ? 'text-green-600' : ''}>{shippingCost === 0 ? 'Free' : formatPrice(shippingCost)}</span>
                  </div>
                )}
                {codCharge !== undefined && codCharge > 0 && (
                  <div className="flex justify-between text-sm text-warning">
                    <span>COD Charge</span>
                    <span>+{formatPrice(codCharge)}</span>
                  </div>
                )}
                {total !== undefined && (
                  <>
                    <Separator className="my-2" />
                    <div className="flex justify-between font-semibold">
                      <span>Total</span>
                      <span>{formatPrice(total)}</span>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Payment Method Card */}
        {paymentMethod && (
          <Card className="mb-4">
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  {paymentMethod.logo_url ? (
                    <img src={paymentMethod.logo_url} alt={paymentMethod.name} className="h-12 w-12 object-contain rounded-lg border border-border p-1" />
                  ) : (
                    <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
                      {paymentMethod.icon ? <span className="text-2xl">{paymentMethod.icon}</span> : <CreditCard className="h-6 w-6 text-muted-foreground" />}
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">Payment Method</h3>
                  <p className="text-foreground font-medium mt-1">
                    {paymentMethod.name}
                    {paymentMethod.name_bn && <span className="text-muted-foreground ml-1">({paymentMethod.name_bn})</span>}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">{getPaymentStatusMessage()}</p>
                </div>
              </div>
              {['bkash', 'nagad', 'rocket', 'upay'].includes(paymentMethod.method_id) && paymentMethod.account_number && (
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-sm text-muted-foreground">We will notify you once your payment is verified.</p>
                  <div className="mt-2 p-3 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground">Sent to</p>
                    <p className="font-mono font-medium">{paymentMethod.account_number}</p>
                    {paymentMethod.account_type && <p className="text-xs text-muted-foreground capitalize">({paymentMethod.account_type} Account)</p>}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* What's Next */}
        <Card className="mb-8">
          <CardContent className="p-5">
            <div className="flex items-start gap-4">
              <Package className="h-6 w-6 text-store-primary flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold mb-1">What's Next?</h3>
                <ul className="text-sm text-muted-foreground space-y-1.5">
                  <li>• You will receive an order confirmation email shortly</li>
                  <li>• We'll notify you when your order ships</li>
                  <li>• Estimated delivery: {deliveryEstimate}</li>
                  <li>• Track your order in your account dashboard</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" className="bg-store-primary hover:bg-store-primary/90" asChild>
            <Link to={`/track/${orderNumber}`}><MapPin className="mr-2 h-4 w-4" /> Track Order</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link to="/products">Continue Shopping <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
        
        {user && (
          <p className="text-sm text-muted-foreground mt-6 text-center">
            You can also view all your orders in your{" "}
            <Link to="/myaccount" className="text-store-primary hover:underline">account dashboard</Link>.
          </p>
        )}
      </div>
    </>
  );
}