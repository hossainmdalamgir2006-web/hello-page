import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { usePageContent } from "@/hooks/usePageContents";
import { useStoreSettingsCache } from "@/hooks/useStoreSettingsCache";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";

const RATE_LIMIT_MS = 30_000; // 30 seconds between submissions

function NewsletterForm({ buttonText }: { buttonText: string }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const lastSubmitRef = useRef(0);

  const handleSubscribe = async () => {
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    const now = Date.now();
    if (now - lastSubmitRef.current < RATE_LIMIT_MS) {
      toast.info("Please wait before subscribing again.");
      return;
    }

    setLoading(true);
    lastSubmitRef.current = now;
    try {
      const { error } = await supabase
        .from("newsletter_subscribers" as any)
        .insert({ email: email.trim().toLowerCase() } as any);
      if (error) {
        if (error.code === "23505") {
          toast.info("You're already subscribed!");
        } else {
          throw error;
        }
      } else {
        toast.success("Subscribed successfully! 🎉");
      }
      setEmail("");
    } catch {
      toast.error("Failed to subscribe. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
      <Input
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSubscribe()}
        className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
      />
      <Button
        className="bg-store-accent text-store-accent-foreground hover:bg-store-accent/90 font-semibold px-8"
        onClick={handleSubscribe}
        disabled={loading}
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : buttonText}
      </Button>
    </div>
  );
}

const defaultShopLinks = [
  { label: "All Products", url: "/products" },
  { label: "New Arrivals", url: "/products?filter=new" },
  { label: "Sale", url: "/products?filter=sale" },
];

const defaultHelpLinks = [
  { label: "Contact Us", url: "/contact" },
  { label: "Track Order", url: "/track-order" },
  { label: "FAQs", url: "/faq" },
  { label: "Shipping Info", url: "/shipping-info" },
  { label: "Returns & Exchange", url: "/returns" },
  { label: "Size Guide", url: "/size-guide" },
];

export function StoreFooter() {
  const { data: settings } = useStoreSettingsCache();
  const { data: footerContent } = usePageContent("footer");
  const { t } = useLanguage();
  const content = (footerContent?.content as any) || {};

  const storeName = settings?.STORE_NAME || "Your Store";
  const storeLogo = settings?.STORE_LOGO || null;
  const storeDescription = settings?.STORE_DESCRIPTION || "Quality products at affordable prices.";
  const storeEmail = settings?.STORE_EMAIL || "";
  const storePhone = settings?.STORE_PHONE || "";

  const addressParts = [settings?.STORE_ADDRESS, settings?.STORE_CITY, settings?.STORE_POSTAL_CODE].filter(Boolean);
  const storeAddress = addressParts.length > 0 ? addressParts.join(", ") : "";

  const socialLinks = {
    facebook: settings?.STORE_FACEBOOK_URL || "",
    instagram: settings?.STORE_INSTAGRAM_URL || "",
    twitter: settings?.STORE_TWITTER_URL || "",
    youtube: settings?.STORE_YOUTUBE_URL || "",
  };
  const hasSocial = socialLinks.facebook || socialLinks.instagram || socialLinks.twitter || socialLinks.youtube;

  const shopLinks = content.shop_links || defaultShopLinks;
  const helpLinks = content.help_links || defaultHelpLinks;
  const newsletterTitle = (content.newsletter_title || "Join the {storeName} Family").replace("{storeName}", storeName);
  const newsletterButton = content.newsletter_button || "Subscribe";
  const copyrightText = content.copyright_text || "All rights reserved.";

  const SocialIcon = ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-white/10 hover:bg-store-primary flex items-center justify-center transition-colors">
      {children}
    </a>
  );

  return (
    <footer className="bg-[hsl(222,47%,11%)] dark:bg-[hsl(224,30%,5%)] text-[hsl(210,40%,98%)]">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              {storeLogo ? (
                <OptimizedImage src={storeLogo} alt={storeName} className="w-10 h-10 rounded-full object-cover border-2 border-store-primary/20" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-store-primary to-store-secondary flex items-center justify-center">
                  <span className="text-store-primary-foreground font-display font-bold text-lg">
                    {storeName.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <span className="font-display font-bold text-xl text-[hsl(210,40%,98%)]">{storeName}</span>
            </Link>
            <p className="text-[hsl(215,16%,60%)] text-sm mb-4">{storeDescription}</p>
            <div className="flex gap-3">
              {hasSocial ? (
                <>
                  {socialLinks.facebook && <SocialIcon href={socialLinks.facebook}><Facebook className="h-4 w-4" /></SocialIcon>}
                  {socialLinks.instagram && <SocialIcon href={socialLinks.instagram}><Instagram className="h-4 w-4" /></SocialIcon>}
                  {socialLinks.twitter && <SocialIcon href={socialLinks.twitter}><Twitter className="h-4 w-4" /></SocialIcon>}
                  {socialLinks.youtube && <SocialIcon href={socialLinks.youtube}><Youtube className="h-4 w-4" /></SocialIcon>}
                </>
              ) : (
                <>
                  <span className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center"><Facebook className="h-4 w-4 opacity-50" /></span>
                  <span className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center"><Instagram className="h-4 w-4 opacity-50" /></span>
                  <span className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center"><Twitter className="h-4 w-4 opacity-50" /></span>
                  <span className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center"><Youtube className="h-4 w-4 opacity-50" /></span>
                </>
              )}
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h4 className="font-display font-semibold text-[hsl(210,40%,98%)] mb-4">Shop</h4>
            <ul className="space-y-2 text-sm">
              {shopLinks.map((link: any, i: number) => (
                <li key={i}>
                  <Link to={link.url} className="text-[hsl(215,16%,60%)] hover:text-store-accent transition-colors">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help Links */}
          <div>
            <h4 className="font-display font-semibold text-[hsl(210,40%,98%)] mb-4">Help</h4>
            <ul className="space-y-2 text-sm">
              {helpLinks.map((link: any, i: number) => (
                <li key={i}>
                  <Link to={link.url} className="text-[hsl(215,16%,60%)] hover:text-store-accent transition-colors">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display font-semibold text-[hsl(210,40%,98%)] mb-4">Contact</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2 text-[hsl(215,16%,60%)]">
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>{storeAddress}</span>
              </li>
              <li className="flex items-center gap-2 text-[hsl(215,16%,60%)]">
                <Phone className="h-4 w-4 flex-shrink-0" />
                <span>{storePhone}</span>
              </li>
              <li className="flex items-center gap-2 text-[hsl(215,16%,60%)]">
                <Mail className="h-4 w-4 flex-shrink-0" />
                <span>{storeEmail}</span>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="my-8 bg-white/10" />

        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-[hsl(215,16%,60%)]">
          <p>© {new Date().getFullYear()} {storeName}. {copyrightText}</p>
          <div className="flex gap-6">
            <Link to="/privacy" className="hover:text-store-accent transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-store-accent transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
