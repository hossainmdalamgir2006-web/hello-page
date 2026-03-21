
import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Phone, MapPin, Clock, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";
import { usePageContent } from "@/hooks/usePageContents";
import { useLanguage } from "@/contexts/LanguageContext";
import { Skeleton } from "@/components/ui/skeleton";

const contactFormSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(50),
  lastName: z.string().trim().min(1, "Last name is required").max(50),
  email: z.string().trim().email("Invalid email address").max(100),
  phone: z.string().trim().max(20).optional().or(z.literal("")),
  message: z.string().trim().min(10, "Message must be at least 10 characters").max(1000),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

const iconMap: Record<string, React.ElementType> = {
  "map-pin": MapPin, phone: Phone, mail: Mail, clock: Clock,
};

export default function Contact() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: pageData, loading: pageLoading } = usePageContent("contact");
  const { t } = useLanguage();
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: { firstName: "", lastName: "", email: "", phone: "", message: "" },
  });

  const onSubmit = async (data: ContactFormValues) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("contact_messages").insert({
        first_name: data.firstName, last_name: data.lastName, email: data.email,
        phone: data.phone || null, message: data.message,
      });
      if (error) throw error;
      toast.success("Message sent successfully! We'll get back to you soon.");
      form.reset();
    } catch (error) {
      console.error("Error submitting contact form:", error);
      toast.error("Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const title = pageData?.title || t('store.contactTitle');
  const subtitle = pageData?.subtitle || t('store.contactSubtitle');
  const formTitle = (pageData?.content as any)?.form_title || t('store.sendUsMessage');
  const cards = (pageData?.content as any)?.cards || [
    { icon: "map-pin", title: "Visit Us", text: "Update your address in admin settings" },
    { icon: "phone", title: "Call Us", text: "Update your phone in admin settings" },
    { icon: "mail", title: "Email Us", text: "Update your email in admin settings" },
    { icon: "clock", title: "Business Hours", text: "Update your hours in admin settings" },
  ];

  if (pageLoading) {
    return (
      <>
        <div className="container mx-auto px-4 py-12 space-y-4">
          <Skeleton className="h-10 w-48 mx-auto" />
          <Skeleton className="h-6 w-96 mx-auto" />
        </div>
      </>
    );
  }

  return (
    <>
      <SEOHead
        title={t('store.contactTitle')}
        description={subtitle}
        canonicalPath="/contact"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "ContactPage",
          name: title,
          description: subtitle,
        }}
      />
      <div className="container mx-auto px-4 py-12">
        <h1 className="font-display text-3xl md:text-4xl font-bold text-center mb-4">{title}</h1>
        <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">{subtitle}</p>

        <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
          <Card>
            <CardHeader><CardTitle>{formTitle}</CardTitle></CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="firstName" render={({ field }) => (
                      <FormItem><FormLabel>{t('store.firstName')}</FormLabel><FormControl><Input placeholder="John" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="lastName" render={({ field }) => (
                      <FormItem><FormLabel>{t('store.lastName')}</FormLabel><FormControl><Input placeholder="Doe" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                  </div>
                  <FormField control={form.control} name="email" render={({ field }) => (
                    <FormItem><FormLabel>{t('common.email')}</FormLabel><FormControl><Input type="email" placeholder="john@example.com" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="phone" render={({ field }) => (
                    <FormItem><FormLabel>{t('store.phoneOptional')}</FormLabel><FormControl><Input placeholder="+880 1XXX-XXXXXX" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="message" render={({ field }) => (
                    <FormItem><FormLabel>{t('store.message')}</FormLabel><FormControl><Textarea placeholder="How can we help you?" rows={5} {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <Button type="submit" className="w-full bg-store-primary hover:bg-store-primary/90" disabled={isSubmitting}>
                    {isSubmitting ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Sending...</>) : "Send Message"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          <div className="space-y-6">
            {cards.map((card: any, i: number) => {
              const IconComp = iconMap[card.icon] || MapPin;
              return (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-store-primary/10 flex items-center justify-center flex-shrink-0">
                        <IconComp className="h-6 w-6 text-store-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">{card.title}</h3>
                        <p className="text-muted-foreground whitespace-pre-line">{card.text}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
