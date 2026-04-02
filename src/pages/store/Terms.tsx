
import { SEOHead } from "@/components/SEOHead";
import { useSiteContent } from "@/hooks/useSiteContent";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Scale, UserCheck, CreditCard, Truck, RotateCcw, BookOpen,
  ChevronRight, Printer, MessageCircle, Calendar, ShieldCheck,
} from "lucide-react";

const iconMap: Record<string, React.ElementType> = {
  usercheck: UserCheck,
  creditcard: CreditCard,
  truck: Truck,
  rotateccw: RotateCcw,
  bookopen: BookOpen,
  shieldcheck: ShieldCheck,
  scale: Scale,
};

interface Section {
  heading: string;
  body: string;
  list?: string[];
  extra?: string;
  icon?: string;
}

const defaultSections: Section[] = [
  {
    heading: "Account Terms",
    body: "By creating an account on our platform, you agree to the following terms and conditions.",
    list: [
      "You must be at least 18 years old to create an account",
      "You are responsible for maintaining account security",
      "One account per person — duplicate accounts may be removed",
      "You must provide accurate and up-to-date information",
    ],
    icon: "usercheck",
  },
  {
    heading: "Orders & Payments",
    body: "All orders are subject to product availability and confirmation of the order price.",
    list: [
      "Prices are displayed in BDT and include applicable taxes",
      "We reserve the right to refuse or cancel any order",
      "Payment must be completed before order processing",
      "Digital payment transactions are processed through secure third-party providers",
    ],
    icon: "creditcard",
  },
  {
    heading: "Shipping & Delivery",
    body: "We strive to deliver your orders within the estimated delivery time, but delays may occasionally occur.",
    list: [
      "Delivery times are estimates, not guarantees",
      "Shipping costs are calculated at checkout based on location",
      "Risk of loss transfers to you upon delivery",
      "You must provide accurate delivery address information",
    ],
    icon: "truck",
  },
  {
    heading: "Returns & Refunds",
    body: "We want you to be completely satisfied with your purchase. Our return policy allows returns within the specified period.",
    list: [
      "Items must be returned within 7 days of delivery",
      "Products must be unused and in original packaging",
      "Refunds are processed within 5-7 business days",
      "Certain items (undergarments, customized products) are non-returnable",
    ],
    icon: "rotateccw",
  },
  {
    heading: "Intellectual Property",
    body: "All content on this website, including text, graphics, logos, and images, is the property of our company and protected by intellectual property laws.",
    list: [
      "Content may not be reproduced without written permission",
      "Our trademarks may not be used without authorization",
      "User-generated content grants us a non-exclusive license",
    ],
    icon: "bookopen",
  },
  {
    heading: "Limitation of Liability",
    body: "To the fullest extent permitted by law, we shall not be liable for any indirect, incidental, or consequential damages arising from your use of our services.",
    extra: "This limitation applies to damages of any kind, including but not limited to, loss of revenue, data, or profits.",
    icon: "shieldcheck",
  },
];

export default function Terms() {
  const { data, loading } = usePageContent("terms");
  const title = data?.title || "Terms of Service";
  const subtitle = data?.subtitle || "Please read these terms carefully before using our services.";
  const sections: Section[] = (data?.content as any)?.sections || defaultSections;
  const lastUpdated = "January 2024";

  const scrollToSection = (index: number) => {
    document.getElementById(`terms-section-${index}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 space-y-4">
        <Skeleton className="h-10 w-64 mx-auto" />
        <Skeleton className="h-6 w-96 mx-auto" />
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full max-w-3xl mx-auto" />
        ))}
      </div>
    );
  }

  return (
    <>
      <SEOHead title="Terms of Service" description="Read our terms of service to understand the rules and regulations of using our store." canonicalPath="/terms" />

      {/* Hero Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-accent/30 to-secondary/20 py-14 md:py-20">
        <div className="absolute top-6 left-10 w-48 h-48 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-4 right-16 w-64 h-64 bg-accent/15 rounded-full blur-3xl" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="container mx-auto px-4 text-center relative z-10"
        >
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-medium mb-4">
            <Scale className="h-4 w-4" />
            Legal Information
          </div>
          <h1 className="font-display text-3xl md:text-5xl font-bold mb-3">{title}</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-4">{subtitle}</p>
          <div className="inline-flex items-center gap-2 text-sm text-muted-foreground/70">
            <Calendar className="h-3.5 w-3.5" />
            Last updated: {lastUpdated}
          </div>
        </motion.div>
      </div>

      <div className="container mx-auto px-4 py-10">
        {/* Print Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="max-w-3xl mx-auto flex justify-end mb-4"
        >
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => window.print()}>
            <Printer className="h-4 w-4" />
            Print Terms
          </Button>
        </motion.div>

        {/* Table of Contents */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-3xl mx-auto mb-10"
        >
          <div className="border rounded-xl bg-card p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Quick Navigation</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {sections.map((sec, i) => (
                <button
                  key={i}
                  onClick={() => scrollToSection(i)}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors text-left px-2 py-1.5 rounded-lg hover:bg-accent/50"
                >
                  <ChevronRight className="h-3.5 w-3.5 flex-shrink-0" />
                  {sec.heading}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Sections */}
        <div className="max-w-3xl mx-auto space-y-5">
          {sections.map((sec, i) => {
            const Icon = iconMap[sec.icon || ""] || Scale;
            return (
              <motion.section
                key={i}
                id={`terms-section-${i}`}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.05 }}
                className="border rounded-xl bg-card p-6 shadow-sm hover:shadow-md transition-shadow scroll-mt-24"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="font-display text-lg font-bold mb-2">{sec.heading}</h2>
                    <p className="text-muted-foreground mb-3 whitespace-pre-line">{sec.body}</p>
                    {sec.list && (
                      <ul className="space-y-1.5 mb-3">
                        {sec.list.map((item, j) => (
                          <li key={j} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary/60 flex-shrink-0 mt-1.5" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    )}
                    {sec.extra && <p className="text-sm text-muted-foreground/80 italic">{sec.extra}</p>}
                  </div>
                </div>
              </motion.section>
            );
          })}
        </div>

        {/* Contact CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="max-w-3xl mx-auto mt-14 text-center"
        >
          <div className="bg-gradient-to-br from-primary/5 via-accent/10 to-secondary/5 rounded-2xl p-8 md:p-12 border border-border/50">
            <MessageCircle className="h-10 w-10 text-primary mx-auto mb-4" />
            <h2 className="text-xl md:text-2xl font-bold mb-2">Have questions about our terms?</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              If anything is unclear, our support team is happy to help.
            </p>
            <Button asChild size="lg" className="rounded-xl">
              <Link to="/contact">Contact Us</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </>
  );
}
