import { useState, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  CheckCircle, Package, ArrowRight, MapPin, CreditCard, Copy, Check,
  Calendar, ShoppingBag, Shield, Mail, Phone, RotateCcw, Download, UserPlus,
} from "lucide-react";
import { motion } from "framer-motion";
import { format, addBusinessDays } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

import { SEOHead } from "@/components/SEOHead";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatPrice } from "@/lib/formatPrice";
import { ConfettiBurst } from "@/components/order/ConfettiBurst";
import { OrderTimeline } from "@/components/order/OrderTimeline";
import { ManualPaymentActionCard } from "@/components/order/ManualPaymentActionCard";
import { OrderSupportCard } from "@/components/order/OrderSupportCard";

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  image: string;
  variant?: string | null;
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
  customerEmail?: string;
}

const MANUAL_PAYMENT_METHODS = ['bkash', 'nagad', 'rocket', 'upay'];

export default function OrderConfirmation() {
  const location = useLocation();
  const { user } = useAuth();
  const { t } = useLanguage();
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
  const customerEmail = orderState?.customerEmail || user?.email;

  const isManualPayment = MANUAL_PAYMENT_METHODS.includes(paymentMethod?.method_id || '');
  const isCOD = paymentMethod?.method_id === 'cod';

  // Calculate actual delivery date range (3-5 business days)
  const { shipDateLabel, deliveryDateLabel, deliveryRange } = useMemo(() => {
    const now = new Date();
    const shipDate = addBusinessDays(now, 1);
    const minDelivery = addBusinessDays(now, 3);
    const maxDelivery = addBusinessDays(now, 5);
    return {
      shipDateLabel: format(shipDate, 'MMM dd'),
      deliveryDateLabel: format(maxDelivery, 'MMM dd'),
      deliveryRange: `${format(minDelivery, 'MMM dd')} - ${format(maxDelivery, 'MMM dd, yyyy')}`,
    };
  }, []);

  // Determine current timeline step
  const currentStep = isCOD ? 1 : (transactionId ? 0 : 0);

  const handleCopyOrderNumber = async () => {
    try {
      await navigator.clipboard.writeText(orderNumber);
      setCopied(true);
      toast.success(t('store.copied'));
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  const trustBadges = [
    { icon: Shield, label: t('store.secureOrder') },
    { icon: Mail, label: t('store.emailSent') },
    { icon: Phone, label: t('store.support247') },
    { icon: RotateCcw, label: t('store.easyReturns') },
  ];

  return (
    <>
      <SEOHead title={t('store.orderConfirmed')} description={t('store.orderPlacedSuccess')} noIndex={true} />

      {/* Hero with gradient */}
      <div className="relative overflow-hidden bg-gradient-to-br from-store-primary/15 via-background to-accent/10 border-b border-border">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-store-primary/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-accent/20 blur-3xl pointer-events-none" />

        <div className="container mx-auto px-4 py-12 md:py-16 max-w-3xl relative">
          <ConfettiBurst />

          <motion.div
            className="text-center"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, type: "spring" }}
          >
            <div className="w-24 h-24 mx-auto mb-5 rounded-full bg-success/15 flex items-center justify-center ring-8 ring-success/5 relative">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
              >
                <CheckCircle className="w-12 h-12 text-success" strokeWidth={2.5} />
              </motion.div>
            </div>

            <h1 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-3">
              {t('store.orderConfirmed')}
            </h1>
            <p className="text-muted-foreground text-base md:text-lg mb-5 max-w-md mx-auto">
              {customerEmail
                ? <>We've sent a confirmation to <span className="text-foreground font-medium">{customerEmail}</span></>
                : t('store.orderPlacedSuccess')
              }
            </p>

            {/* Order number pill */}
            <button
              onClick={handleCopyOrderNumber}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-background border-2 border-store-primary/30 hover:border-store-primary hover:bg-store-primary/5 transition-all shadow-sm group"
              title={t('store.copyOrderId')}
            >
              <span className="text-xs text-muted-foreground uppercase tracking-wider">
                {t('store.orderNumber')}
              </span>
              <span className="font-mono font-bold text-store-primary">{orderNumber}</span>
              {copied
                ? <Check className="h-4 w-4 text-success" />
                : <Copy className="h-4 w-4 text-muted-foreground group-hover:text-store-primary" />
              }
            </button>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-3xl pb-32 md:pb-12">
        {/* Manual payment action card — most urgent */}
        {isManualPayment && paymentMethod?.account_number && total && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <ManualPaymentActionCard
              amount={total}
              accountNumber={paymentMethod.account_number}
              accountType={paymentMethod.account_type}
              methodName={paymentMethod.name}
              methodLogo={paymentMethod.logo_url}
              transactionId={transactionId}
            />
          </motion.div>
        )}

        {/* Estimated Delivery */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="mb-4 border-store-primary/20 bg-store-primary/5">
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-store-primary/15 flex items-center justify-center shrink-0">
                  <Calendar className="h-6 w-6 text-store-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">
                    {t('store.estimatedDelivery')}
                  </p>
                  <p className="font-bold text-foreground text-lg">{deliveryRange}</p>
                </div>
                <Badge variant="secondary" className="hidden sm:inline-flex">3-5 days</Badge>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Order Timeline */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <Card className="mb-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Package className="h-4 w-4 text-store-primary" />
                {t('store.orderTimeline')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <OrderTimeline
                currentStep={currentStep}
                estimatedShipDate={shipDateLabel}
                estimatedDeliveryDate={deliveryDateLabel}
                isCOD={isCOD}
              />
            </CardContent>
          </Card>
        </motion.div>

        {/* Order Items */}
        {items && items.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="mb-4">
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4 text-store-primary" />
                  {t('store.orderItems')} ({items.length})
                </CardTitle>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 text-xs"
                  onClick={handlePrintReceipt}
                >
                  <Download className="h-3.5 w-3.5 mr-1" />
                  <span className="hidden sm:inline">{t('store.downloadReceipt')}</span>
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {items.map((item, idx) => (
                  <div key={idx} className="flex gap-3 items-center">
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0 border border-border">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      <span className="absolute -top-1 -right-1 bg-store-primary text-white text-xs font-bold rounded-full h-5 min-w-5 px-1 flex items-center justify-center shadow">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.name}</p>
                      {item.variant && (
                        <p className="text-xs text-muted-foreground">{item.variant}</p>
                      )}
                      <p className="text-xs text-muted-foreground">{formatPrice(item.price)} × {item.quantity}</p>
                    </div>
                    <p className="text-sm font-semibold flex-shrink-0">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                ))}

                <Separator className="my-3" />
                <div className="space-y-1.5">
                  {subtotal !== undefined && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t('store.subtotal')}</span>
                      <span>{formatPrice(subtotal)}</span>
                    </div>
                  )}
                  {discount !== undefined && discount > 0 && (
                    <div className="flex justify-between text-sm text-success">
                      <span>{t('store.discount')}</span>
                      <span>-{formatPrice(discount)}</span>
                    </div>
                  )}
                  {shippingCost !== undefined && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t('store.shipping')}</span>
                      <span className={shippingCost === 0 ? 'text-success font-medium' : ''}>
                        {shippingCost === 0 ? t('store.free') : formatPrice(shippingCost)}
                      </span>
                    </div>
                  )}
                  {codCharge !== undefined && codCharge > 0 && (
                    <div className="flex justify-between text-sm text-warning">
                      <span>{t('store.codCharge')}</span>
                      <span>+{formatPrice(codCharge)}</span>
                    </div>
                  )}
                  {total !== undefined && (
                    <>
                      <Separator className="my-2" />
                      <div className="flex justify-between font-bold text-base">
                        <span>{t('store.total')}</span>
                        <span className="text-store-primary">{formatPrice(total)}</span>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Payment Method (compact, only if not manual already shown above) */}
        {paymentMethod && !isManualPayment && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
            <Card className="mb-4">
              <CardContent className="p-5 flex items-center gap-4">
                {paymentMethod.logo_url ? (
                  <img src={paymentMethod.logo_url} alt={paymentMethod.name} className="h-12 w-12 object-contain rounded-lg border border-border p-1" />
                ) : (
                  <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
                    {paymentMethod.icon
                      ? <span className="text-2xl">{paymentMethod.icon}</span>
                      : <CreditCard className="h-6 w-6 text-muted-foreground" />
                    }
                  </div>
                )}
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">{t('store.paymentMethod')}</p>
                  <p className="font-semibold">{paymentMethod.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {isCOD ? t('store.paymentOnDelivery') : t('store.processing')}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Trust Strip */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="mb-4 bg-muted/30">
            <CardContent className="p-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {trustBadges.map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-2 justify-center sm:justify-start">
                    <Icon className="h-4 w-4 text-store-primary shrink-0" />
                    <span className="text-xs font-medium text-foreground">{label}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Support Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
          <OrderSupportCard />
        </motion.div>

        {/* Account creation nudge for guests */}
        {!user && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <Card className="mb-4 border-store-primary/30 bg-gradient-to-r from-store-primary/5 to-accent/5">
              <CardContent className="p-5 flex flex-col sm:flex-row items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-store-primary/15 flex items-center justify-center shrink-0">
                  <UserPlus className="h-6 w-6 text-store-primary" />
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <p className="font-semibold text-foreground">{t('store.createAccount')}</p>
                  <p className="text-sm text-muted-foreground">{t('store.createAccountDesc')}</p>
                </div>
                <Button asChild className="bg-store-primary hover:bg-store-primary/90 shrink-0">
                  <Link to="/login">{t('store.signUpNow')}</Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Desktop CTAs */}
        <motion.div
          className="hidden md:flex flex-col sm:flex-row gap-4 justify-center mt-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
        >
          <Button size="lg" className="bg-store-primary hover:bg-store-primary/90" asChild>
            <Link to={`/track-order?order=${orderNumber}`}>
              <MapPin className="mr-2 h-4 w-4" /> {t('store.trackOrder')}
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link to="/products">
              {t('store.continueShopping')} <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </motion.div>

        {user && (
          <motion.p
            className="text-sm text-muted-foreground mt-6 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            {t('store.viewAllOrders')}{" "}
            <Link to="/myaccount" className="text-store-primary hover:underline font-medium">
              {t('store.accountDashboard')}
            </Link>.
          </motion.p>
        )}
      </div>

      {/* Mobile sticky bottom bar */}
      <div className="md:hidden fixed bottom-0 inset-x-0 bg-background/95 backdrop-blur-md border-t border-border p-3 z-40 shadow-lg">
        <div className="flex gap-2 max-w-3xl mx-auto">
          <Button variant="outline" className="flex-1" asChild>
            <Link to="/products">
              <ShoppingBag className="mr-1.5 h-4 w-4" />
              Shop
            </Link>
          </Button>
          <Button className="flex-1 bg-store-primary hover:bg-store-primary/90" asChild>
            <Link to={`/track-order?order=${orderNumber}`}>
              <MapPin className="mr-1.5 h-4 w-4" />
              {t('store.trackOrder')}
            </Link>
          </Button>
        </div>
      </div>
    </>
  );
}
