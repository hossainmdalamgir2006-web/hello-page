
import { SEOHead } from "@/components/SEOHead";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, XCircle, RefreshCw, Package } from "lucide-react";
import { usePageContent } from "@/hooks/usePageContents";
import { useLanguage } from "@/contexts/LanguageContext";
import { Skeleton } from "@/components/ui/skeleton";

export default function Returns() {
  const { data, loading } = usePageContent("returns");
  const { t } = useLanguage();
  const title = data?.title || t('store.returnsTitle');
  const subtitle = data?.subtitle || t('store.returnsSubtitle');
  const c = (data?.content || {}) as any;

  if (loading) {
    return <div className="container mx-auto px-4 py-12"><Skeleton className="h-10 w-48 mx-auto" /></div>;
  }

  return (
    <>
      <SEOHead title="Returns & Exchange" description="Learn about our return and exchange policy. Easy returns within 7 days." canonicalPath="/returns" />
      <div className="container mx-auto px-4 py-12">
        <h1 className="font-display text-3xl md:text-4xl font-bold text-center mb-4">{title}</h1>
        <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">{subtitle}</p>

        <div className="max-w-4xl mx-auto space-y-8">
          <Card className="bg-store-primary/5 border-store-primary/20">
            <CardContent className="p-6">
              <h2 className="font-display text-xl font-bold mb-4">{c.policy_title || "7-Day Return Policy"}</h2>
              <p className="text-muted-foreground">{c.policy_text || ""}</p>
            </CardContent>
          </Card>

          <section>
            <h2 className="font-display text-2xl font-bold mb-4 flex items-center gap-2">
              <CheckCircle className="h-6 w-6 text-store-accent" /> Eligible for Return
            </h2>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              {(c.eligible || []).map((item: string, i: number) => <li key={i}>{item}</li>)}
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold mb-4 flex items-center gap-2">
              <XCircle className="h-6 w-6 text-destructive" /> Not Eligible for Return
            </h2>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              {(c.not_eligible || []).map((item: string, i: number) => <li key={i}>{item}</li>)}
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold mb-6 flex items-center gap-2">
              <RefreshCw className="h-6 w-6 text-store-primary" /> How to Return
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              {(c.steps || []).map((step: any, i: number) => (
                <Card key={i}>
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 rounded-full bg-store-primary text-store-primary-foreground flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                      {i + 1}
                    </div>
                    <h3 className="font-semibold mb-2">{step.title}</h3>
                    <p className="text-sm text-muted-foreground">{step.text}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold mb-4 flex items-center gap-2">
              <Package className="h-6 w-6 text-store-primary" /> Exchange Policy
            </h2>
            <p className="text-muted-foreground mb-4">{c.exchange_text || ""}</p>
          </section>

          <Card className="bg-muted/50">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-2">Refund Information</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                {(c.refund_info || []).map((item: string, i: number) => <li key={i}>• {item}</li>)}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
