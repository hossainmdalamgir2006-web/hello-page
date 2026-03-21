
import { SEOHead } from "@/components/SEOHead";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { usePageContent } from "@/hooks/usePageContents";
import { useLanguage } from "@/contexts/LanguageContext";
import { Skeleton } from "@/components/ui/skeleton";

const defaultFaqs = [
  { question: "How do I track my order?", answer: "You can track your order by visiting our Track Order page and entering your order number." },
  { question: "What payment methods do you accept?", answer: "We accept bKash, Nagad, Rocket, bank transfers, and Cash on Delivery (COD)." },
];

export default function FAQ() {
  const { data, loading } = usePageContent("faq");
  const title = data?.title || "Frequently Asked Questions";
  const subtitle = data?.subtitle || "Find answers to common questions about our products, shipping, returns, and more.";
  const faqs = (data?.content as any)?.faqs || defaultFaqs;

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq: any) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };

  if (loading) {
    return (
      <>
        <div className="container mx-auto px-4 py-12 space-y-4">
          <Skeleton className="h-10 w-64 mx-auto" />
          <Skeleton className="h-6 w-96 mx-auto" />
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 w-full max-w-3xl mx-auto" />)}
        </div>
      </>
    );
  }

  return (
    <>
      <SEOHead
        title="FAQ"
        description={subtitle}
        canonicalPath="/faq"
        jsonLd={faqJsonLd}
      />
      <div className="container mx-auto px-4 py-12">
        <h1 className="font-display text-3xl md:text-4xl font-bold text-center mb-4">{title}</h1>
        <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">{subtitle}</p>
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq: any, index: number) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </>
  );
}
