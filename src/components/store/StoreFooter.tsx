import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin, Loader2, ShieldCheck, Truck, Headphones, ArrowUp, CreditCard } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { usePageContent } from "@/hooks/usePageContents";
import { useStoreSettingsCache } from "@/hooks/useStoreSettingsCache";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { toast } from "sonner";

const RATE_LIMIT_MS = 30_000;

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
        if (error.code === "23505") toast.info("You're already subscribed!");
        else throw error;
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
        className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus-visible:ring-store-accent"
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

const trustBadges = [
  { icon: ShieldCheck, label: "Secure Payment" },
  { icon: Truck, label: "Fast Delivery" },
  { icon: Headphones, label: "24/7 Support" },
  { icon: CreditCard, label: "Easy Returns" },
];

const paymentIcons = ["bKash", "Nagad", "Visa", "Mastercard", "COD"];

function FooterHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="font-display font-semibold text-[hsl(210,40%,98%)] mb-4 relative inline-block">
      {children}
      <span className="absolute -bottom-1 left-0 w-8 h-0.5 bg-store-accent rounded-full" />
    </h3>
  );
}

function SocialIcon({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="w-9 h-9 rounded-full bg-white/10 hover:bg-store-primary hover:shadow-[0_0_12px_hsl(var(--store-primary)/0.5)] flex items-center justify-center transition-all duration-300"
    >
      {children}
    </a>
  );
}

export function StoreFooter() {
  const { data: settings } = useStoreSettingsCache();
  const { data: footerContent } = usePageContent("footer");
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

  return (
    <footer className="bg-[hsl(222,47%,11%)] dark:bg-[hsl(224,30%,5%)] text-[hsl(210,40%,98%)]">
      {/* Main Footer Grid */}
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
                  {socialLinks.facebook && <SocialIcon href={socialLinks.facebook} label="Facebook"><Facebook className="h-4 w-4" /></SocialIcon>}
                  {socialLinks.instagram && <SocialIcon href={socialLinks.instagram} label="Instagram"><Instagram className="h-4 w-4" /></SocialIcon>}
                  {socialLinks.twitter && <SocialIcon href={socialLinks.twitter} label="Twitter"><Twitter className="h-4 w-4" /></SocialIcon>}
                  {socialLinks.youtube && <SocialIcon href={socialLinks.youtube} label="YouTube"><Youtube className="h-4 w-4" /></SocialIcon>}
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
            <FooterHeading>Shop</FooterHeading>
            <ul className="space-y-2 text-sm mt-2">
              {shopLinks.map((link: any, i: number) => (
                <li key={i}>
                  <Link to={link.url} className="group text-[hsl(215,16%,60%)] hover:text-store-accent transition-colors inline-flex items-center gap-1">
                    <span className="w-0 group-hover:w-2 overflow-hidden transition-all duration-200 text-store-accent">→</span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help Links */}
          <div>
            <FooterHeading>Help Center</FooterHeading>
            <ul className="space-y-2 text-sm mt-2">
              {helpLinks.map((link: any, i: number) => (
                <li key={i}>
                  <Link to={link.url} className="group text-[hsl(215,16%,60%)] hover:text-store-accent transition-colors inline-flex items-center gap-1">
                    <span className="w-0 group-hover:w-2 overflow-hidden transition-all duration-200 text-store-accent">→</span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <FooterHeading>Contact Us</FooterHeading>
            <ul className="space-y-3 text-sm mt-2">
              {storeAddress && (
                <li className="flex items-start gap-2 text-[hsl(215,16%,60%)]">
                  <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0 text-store-accent/60" aria-hidden="true" />
                  <span>{storeAddress}</span>
                </li>
              )}
              {storePhone && (
                <li className="flex items-center gap-2 text-[hsl(215,16%,60%)]">
                  <Phone className="h-4 w-4 flex-shrink-0 text-store-accent/60" aria-hidden="true" />
                  <span>{storePhone}</span>
                </li>
              )}
              {storeEmail && (
                <li className="flex items-center gap-2 text-[hsl(215,16%,60%)]">
                  <Mail className="h-4 w-4 flex-shrink-0 text-store-accent/60" aria-hidden="true" />
                  <span>{storeEmail}</span>
                </li>
              )}
            </ul>
          </div>
        </div>

        <Separator className="my-8 bg-white/10" />

        {/* Payment Methods */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
          <span className="text-xs text-[hsl(215,16%,50%)] mr-2">We Accept:</span>
          {paymentIcons.map((name) => (
            <span key={name} className="px-3 py-1.5 rounded-md bg-white/5 border border-white/10 text-xs font-medium text-[hsl(210,40%,80%)]">
              {name}
            </span>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-[hsl(215,16%,60%)]">
          <p>© {new Date().getFullYear()} {storeName}. {copyrightText}</p>
          <div className="flex items-center gap-6">
            <Link to="/privacy" className="hover:text-store-accent transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-store-accent transition-colors">Terms of Service</Link>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="hover:text-store-accent transition-colors inline-flex items-center gap-1"
            >
              <ArrowUp className="h-3.5 w-3.5" /> Back to Top
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
