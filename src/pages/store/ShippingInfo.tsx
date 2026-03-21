
import { SEOHead } from "@/components/SEOHead";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Truck, Clock, MapPin, Package } from "lucide-react";
import { usePageContent } from "@/hooks/usePageContents";
import { useLanguage } from "@/contexts/LanguageContext";
import { Skeleton } from "@/components/ui/skeleton";

export default function ShippingInfo() {
  const { data, loading } = usePageContent("shipping-info");
  const { t } = useLanguage();
  const title = data?.title || t('store.shippingInfoTitle');
  const subtitle = data?.subtitle || t('store.shippingInfoSubtitle');
  const c = (data?.content || {}) as any;

  if (loading) {
    return <div className="container mx-auto px-4 py-12"><Skeleton className="h-10 w-48 mx-auto" /></div>;
  }

  return (
    <>
      <SEOHead title="Shipping Information" description="Learn about our shipping options, delivery times and costs across Bangladesh." canonicalPath="/shipping-info" />
      <div className="container mx-auto px-4 py-12">
        <h1 className="font-display text-3xl md:text-4xl font-bold text-center mb-4">{title}</h1>
        <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">{subtitle}</p>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-12">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-store-primary/10 flex items-center justify-center">
                  <Truck className="h-5 w-5 text-store-primary" />
                </div>
                <CardTitle>Delivery Options</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {(c.delivery_options || []).map((opt: any, i: number) => (
                <div key={i} className={i < (c.delivery_options || []).length - 1 ? "border-b pb-3" : ""}>
                  <h4 className="font-semibold">{opt.title}</h4>
                  <p className="text-sm text-muted-foreground">{opt.text}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-store-primary/10 flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-store-primary" />
                </div>
                <CardTitle>Delivery Areas</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {(c.delivery_areas || []).map((area: any, i: number) => (
                <div key={i} className={i < (c.delivery_areas || []).length - 1 ? "border-b pb-3" : ""}>
                  <h4 className="font-semibold">{area.title}</h4>
                  <p className="text-sm text-muted-foreground">{area.text}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          <section>
            <h2 className="font-display text-2xl font-bold mb-4 flex items-center gap-2">
              <Clock className="h-6 w-6 text-store-primary" /> Processing Time
            </h2>
            <p className="text-muted-foreground">{c.processing_text || ""}</p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold mb-4 flex items-center gap-2">
              <Package className="h-6 w-6 text-store-primary" /> Order Tracking
            </h2>
            <p className="text-muted-foreground">{c.tracking_text || ""}</p>
          </section>

          {(c.notes || []).length > 0 && (
            <section className="bg-store-primary/5 rounded-lg p-6">
              <h3 className="font-semibold mb-2">Important Notes</h3>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                {c.notes.map((note: string, i: number) => <li key={i}>{note}</li>)}
              </ul>
            </section>
          )}
        </div>
      </div>
    </>
  );
}
