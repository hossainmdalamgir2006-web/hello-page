
import { SEOHead } from "@/components/SEOHead";
import { usePageContent } from "@/hooks/usePageContents";
import { useLanguage } from "@/contexts/LanguageContext";
import { Skeleton } from "@/components/ui/skeleton";

export default function Terms() {
  const { data, loading } = usePageContent("terms");
  const title = data?.title || "Terms of Service";
  const subtitle = data?.subtitle || "Last updated: January 2024";
  const sections = (data?.content as any)?.sections || [];

  if (loading) {
    return <div className="container mx-auto px-4 py-12"><Skeleton className="h-10 w-48 mx-auto" /></div>;
  }

  return (
    <>
      <SEOHead title="Terms of Service" description="Read our terms of service to understand the rules and regulations of using our store." canonicalPath="/terms" />
      <div className="container mx-auto px-4 py-12">
        <h1 className="font-display text-3xl md:text-4xl font-bold text-center mb-4">{title}</h1>
        <p className="text-muted-foreground text-center mb-12">{subtitle}</p>
        <div className="max-w-3xl mx-auto">
          {sections.map((sec: any, i: number) => (
            <section key={i} className="mb-8">
              <h2 className="font-display text-xl font-bold mb-4">{sec.heading}</h2>
              <p className="text-muted-foreground mb-2 whitespace-pre-line">{sec.body}</p>
              {sec.list && (
                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                  {sec.list.map((item: string, j: number) => <li key={j}>{item}</li>)}
                </ul>
              )}
              {sec.extra && <p className="text-muted-foreground mt-2">{sec.extra}</p>}
            </section>
          ))}
        </div>
      </div>
    </>
  );
}
