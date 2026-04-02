import {
  Layout, Megaphone, Truck, Grid3X3, Package, Star, Zap, Mail, Image,
  HelpCircle, Phone, Shield, Scale, Ruler, FileText, MessageSquare,
  type LucideIcon,
} from "lucide-react";

export interface SectionDef {
  key: string;
  label: string;
  icon: LucideIcon;
  defaultEnabled: boolean;
  defaultTitle?: string;
  defaultSubtitle?: string;
  defaultBadge?: string;
  defaultContent?: Record<string, any>;
  editableFields: ("title" | "subtitle" | "badge" | "image" | "content")[];
  contentSchema?: Record<string, "text" | "textarea" | "number" | "boolean" | "json">;
}

export interface PageDef {
  slug: string;
  label: string;
  icon: LucideIcon;
  storePath: string;
  sections: SectionDef[];
}

export const siteContentRegistry: PageDef[] = [
  {
    slug: "homepage",
    label: "Homepage",
    icon: Layout,
    storePath: "/",
    sections: [
      {
        key: "hero_carousel",
        label: "Hero Carousel",
        icon: Image,
        defaultEnabled: true,
        editableFields: ["content"],
        contentSchema: { autoplay: "boolean", autoplay_delay: "number", show_arrows: "boolean" },
        defaultContent: { autoplay: true, autoplay_delay: 5000, show_arrows: true },
      },
      {
        key: "feature_bar",
        label: "Feature Bar (Trust Badges)",
        icon: Truck,
        defaultEnabled: true,
        editableFields: ["content"],
        contentSchema: { features: "json" },
      },
      {
        key: "brand_marquee",
        label: "Brand Logos Marquee",
        icon: Star,
        defaultEnabled: true,
        editableFields: [],
      },
      {
        key: "categories_grid",
        label: "Categories Grid",
        icon: Grid3X3,
        defaultEnabled: true,
        defaultTitle: "Shop by Category",
        editableFields: ["title", "subtitle", "content"],
        contentSchema: { categories: "json" },
      },
      {
        key: "new_arrivals",
        label: "New Arrivals",
        icon: Package,
        defaultEnabled: true,
        defaultTitle: "New Arrivals",
        defaultBadge: "New",
        editableFields: ["title", "subtitle", "badge", "content"],
        contentSchema: { product_count: "number" },
        defaultContent: { product_count: 8 },
      },
      {
        key: "promo_banners",
        label: "Promo Banners",
        icon: Layout,
        defaultEnabled: true,
        editableFields: ["content"],
        contentSchema: { banners: "json" },
      },
      {
        key: "trending_products",
        label: "Trending Products",
        icon: Star,
        defaultEnabled: true,
        editableFields: ["content"],
        contentSchema: { count: "number" },
        defaultContent: { count: 4 },
      },
      {
        key: "best_sellers",
        label: "Best Sellers",
        icon: Star,
        defaultEnabled: true,
        defaultTitle: "Best Sellers",
        editableFields: ["title", "subtitle", "badge"],
      },
      {
        key: "flash_sale",
        label: "Flash Sale (Countdown)",
        icon: Zap,
        defaultEnabled: true,
        defaultTitle: "Flash Sale",
        defaultBadge: "⚡ Flash Sale",
        editableFields: ["title", "subtitle", "badge", "content"],
        contentSchema: { end_time: "text", product_count: "number" },
        defaultContent: { product_count: 4 },
      },
      {
        key: "testimonials",
        label: "Testimonials",
        icon: MessageSquare,
        defaultEnabled: true,
        defaultTitle: "What Customers Say",
        editableFields: ["title", "subtitle", "content"],
        contentSchema: { testimonials: "json" },
      },
      {
        key: "recently_viewed",
        label: "Recently Viewed",
        icon: Package,
        defaultEnabled: true,
        editableFields: [],
      },
      {
        key: "newsletter",
        label: "Newsletter",
        icon: Mail,
        defaultEnabled: true,
        defaultTitle: "Subscribe Newsletter",
        editableFields: ["title", "content"],
        contentSchema: { placeholder: "text", button_text: "text" },
      },
      {
        key: "announcement",
        label: "Announcement Bar",
        icon: Megaphone,
        defaultEnabled: false,
        editableFields: ["title", "content"],
        contentSchema: { link: "text", link_text: "text" },
      },
    ],
  },
  {
    slug: "faq",
    label: "FAQ Page",
    icon: HelpCircle,
    storePath: "/faq",
    sections: [
      {
        key: "main_content",
        label: "Page Content",
        icon: FileText,
        defaultEnabled: true,
        defaultTitle: "Frequently Asked Questions",
        editableFields: ["title", "subtitle", "content"],
        contentSchema: { hero_badge: "text" },
      },
    ],
  },
  {
    slug: "contact",
    label: "Contact Page",
    icon: Phone,
    storePath: "/contact",
    sections: [
      {
        key: "main_content",
        label: "Page Content",
        icon: FileText,
        defaultEnabled: true,
        defaultTitle: "Contact Us",
        editableFields: ["title", "subtitle", "content"],
        contentSchema: { phone: "text", email: "text", address: "text", business_hours: "text" },
      },
    ],
  },
  {
    slug: "privacy",
    label: "Privacy Policy",
    icon: Shield,
    storePath: "/privacy",
    sections: [
      {
        key: "main_content",
        label: "Page Content",
        icon: FileText,
        defaultEnabled: true,
        defaultTitle: "Privacy Policy",
        editableFields: ["title", "subtitle", "content"],
      },
    ],
  },
  {
    slug: "terms",
    label: "Terms & Conditions",
    icon: Scale,
    storePath: "/terms",
    sections: [
      {
        key: "main_content",
        label: "Page Content",
        icon: FileText,
        defaultEnabled: true,
        defaultTitle: "Terms & Conditions",
        editableFields: ["title", "subtitle", "content"],
      },
    ],
  },
  {
    slug: "returns",
    label: "Returns & Exchange",
    icon: Package,
    storePath: "/returns",
    sections: [
      {
        key: "main_content",
        label: "Page Content",
        icon: FileText,
        defaultEnabled: true,
        defaultTitle: "Returns & Exchange",
        editableFields: ["title", "subtitle", "content"],
      },
    ],
  },
  {
    slug: "shipping-info",
    label: "Shipping Info",
    icon: Truck,
    storePath: "/shipping-info",
    sections: [
      {
        key: "main_content",
        label: "Page Content",
        icon: FileText,
        defaultEnabled: true,
        defaultTitle: "Shipping Information",
        editableFields: ["title", "subtitle", "content"],
      },
    ],
  },
  {
    slug: "size-guide",
    label: "Size Guide",
    icon: Ruler,
    storePath: "/size-guide",
    sections: [
      {
        key: "main_content",
        label: "Page Content",
        icon: FileText,
        defaultEnabled: true,
        defaultTitle: "Size Guide",
        editableFields: ["title", "subtitle", "content"],
      },
    ],
  },
  {
    slug: "header",
    label: "Store Header",
    icon: Layout,
    storePath: "/",
    sections: [
      {
        key: "main_content",
        label: "Header Settings",
        icon: Layout,
        defaultEnabled: true,
        editableFields: ["content"],
        contentSchema: { announcement_text: "text", announcement_link: "text" },
      },
    ],
  },
  {
    slug: "footer",
    label: "Store Footer",
    icon: FileText,
    storePath: "/",
    sections: [
      {
        key: "main_content",
        label: "Footer Settings",
        icon: FileText,
        defaultEnabled: true,
        editableFields: ["content"],
        contentSchema: { shop_links: "json", help_links: "json", social_links: "json" },
      },
    ],
  },
];

export function getPageDef(slug: string): PageDef | undefined {
  return siteContentRegistry.find((p) => p.slug === slug);
}

export function getSectionDef(pageSlug: string, sectionKey: string): SectionDef | undefined {
  return getPageDef(pageSlug)?.sections.find((s) => s.key === sectionKey);
}
