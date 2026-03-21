import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Category {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  sort_order: number | null;
}

interface NavCategory {
  label: string;
  href: string;
  slug: string;
  subGroups: { group: string; slug: string; items: { name: string; href: string }[] }[];
}

function buildNavCategories(categories: Category[]): NavCategory[] {
  const topLevel = categories.filter((c) => !c.parent_id);
  return topLevel.map((parent) => {
    const children = categories.filter((c) => c.parent_id === parent.id);
    // Group children: if children have their own children, treat them as groups
    const grandchildren = children.filter((child) =>
      categories.some((c) => c.parent_id === child.id)
    );
    const leafChildren = children.filter(
      (child) => !categories.some((c) => c.parent_id === child.id)
    );

    const subGroups: NavCategory["subGroups"] = [];

    if (grandchildren.length > 0) {
      for (const group of grandchildren) {
        const items = categories
          .filter((c) => c.parent_id === group.id)
          .map((c) => ({ name: c.name, href: `/products?category=${parent.slug}&sub=${c.slug}` }));
        if (items.length > 0) {
          subGroups.push({ group: group.name, slug: group.slug, items });
        }
      }
    }

    // Add leaf children as a default group
    if (leafChildren.length > 0) {
      subGroups.push({
        group: leafChildren.length > 0 && grandchildren.length > 0 ? "Other" : parent.name,
        slug: parent.slug,
        items: leafChildren.map((c) => ({
          name: c.name,
          href: `/products?category=${parent.slug}&sub=${c.slug}`,
        })),
      });
    }

    return {
      label: parent.name,
      href: `/products?category=${parent.slug}`,
      slug: parent.slug,
      subGroups,
    };
  });
}

export function useDynamicCategories() {
  const [navCategories, setNavCategories] = useState<NavCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("id, name, slug, parent_id, sort_order")
        .eq("is_active", true)
        .is("deleted_at", null)
        .order("sort_order", { ascending: true })
        .order("name", { ascending: true });

      if (!error && data) {
        setNavCategories(buildNavCategories(data));
      }
      setLoading(false);
    };
    fetchCategories();
  }, []);

  return { navCategories, loading };
}

export function MegaMenuNav() {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { navCategories } = useDynamicCategories();

  const handleMouseEnter = (label: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setActiveMenu(label);
  };

  const handleMouseLeave = () => {
    timerRef.current = setTimeout(() => {
      setActiveMenu(null);
    }, 150);
  };

  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  const staticPages = [
    { label: "Contact Us", href: "/contact" },
    { label: "Track Order", href: "/track-order" },
    { label: "Shipping Info", href: "/shipping-info" },
  ];

  return (
    <nav className="flex items-center justify-center gap-1 py-1" ref={menuRef}>
      {navCategories.map((cat) => (
        <div
          key={cat.label}
          className="relative"
          onMouseEnter={() => handleMouseEnter(cat.label)}
          onMouseLeave={handleMouseLeave}
        >
          <Link
            to={cat.href}
            className={`flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeMenu === cat.label
                ? "text-store-primary bg-store-muted"
                : "text-foreground hover:text-store-primary hover:bg-store-muted"
            }`}
          >
            {cat.label}
            {cat.subGroups.length > 0 && (
              <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${activeMenu === cat.label ? "rotate-180" : ""}`} />
            )}
          </Link>

          {cat.subGroups.length > 0 && activeMenu === cat.label && (
            <div
              className="absolute top-full left-1/2 -translate-x-1/2 mt-1 z-50 bg-store-card border border-store-muted rounded-2xl shadow-2xl p-6 min-w-[480px] animate-fade-in"
              onMouseEnter={() => handleMouseEnter(cat.label)}
              onMouseLeave={handleMouseLeave}
            >
              <div className="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-2">
                {cat.subGroups.map((group) => (
                  <div key={group.group}>
                    <h4 className="font-semibold text-xs uppercase tracking-widest text-store-primary mb-2 pb-1 border-b border-store-muted">
                      {group.group}
                    </h4>
                    <ul className="space-y-1">
                      {group.items.map((item) => (
                        <li key={item.name}>
                          <Link
                            to={item.href}
                            className="flex items-center gap-1 text-sm text-foreground/70 hover:text-store-primary transition-colors py-0.5 group"
                            onClick={() => setActiveMenu(null)}
                          >
                            <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 text-store-primary -ml-1 transition-opacity" />
                            {item.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-3 border-t border-store-muted">
                <Link
                  to={cat.href}
                  className="text-sm font-semibold text-store-primary hover:underline flex items-center gap-1"
                  onClick={() => setActiveMenu(null)}
                >
                  View All {cat.label} <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Static Pages */}
      {staticPages.map((page) => (
        <Link
          key={page.label}
          to={page.href}
          className="px-3 py-2 text-sm font-medium rounded-lg transition-colors text-foreground hover:text-store-primary hover:bg-store-muted"
        >
          {page.label}
        </Link>
      ))}
    </nav>
  );
}

// Mobile accordion version
interface MobileMegaMenuProps {
  onClose: () => void;
}

export function MobileMegaMenu({ onClose }: MobileMegaMenuProps) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
  const { navCategories } = useDynamicCategories();

  return (
    <div className="flex flex-col gap-1">
      {navCategories.map((cat) => (
        <div key={cat.label} className="border-b border-store-muted last:border-0">
          <div className="flex items-center justify-between py-3">
            <Link
              to={cat.href}
              className="text-base font-medium text-foreground hover:text-store-primary transition-colors"
              onClick={onClose}
            >
              {cat.label}
            </Link>
            {cat.subGroups.length > 0 && (
              <button
                onClick={() => setExpanded(expanded === cat.label ? null : cat.label)}
                className="p-1 text-muted-foreground hover:text-store-primary"
              >
                <ChevronDown className={`h-4 w-4 transition-transform ${expanded === cat.label ? "rotate-180" : ""}`} />
              </button>
            )}
          </div>

          {cat.subGroups.length > 0 && expanded === cat.label && (
            <div className="pb-3 pl-3 space-y-2">
              {cat.subGroups.map((group) => (
                <div key={group.group}>
                  <button
                    onClick={() => setExpandedGroup(expandedGroup === group.group ? null : group.group)}
                    className="flex items-center justify-between w-full text-sm font-semibold text-store-primary uppercase tracking-wider py-1"
                  >
                    {group.group}
                    <ChevronDown className={`h-3 w-3 transition-transform ${expandedGroup === group.group ? "rotate-180" : ""}`} />
                  </button>
                  {expandedGroup === group.group && (
                    <div className="pl-3 pt-1 space-y-1">
                      {group.items.map((item) => (
                        <Link
                          key={item.name}
                          to={item.href}
                          className="block text-sm text-foreground/70 hover:text-store-primary py-1 transition-colors"
                          onClick={onClose}
                        >
                          {item.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      {/* Static Pages */}
      <div className="border-t border-store-muted mt-2 pt-2">
        {[
          { label: "Contact Us", href: "/contact" },
          { label: "Track Order", href: "/track-order" },
          { label: "Shipping Info", href: "/shipping-info" },
        ].map((page) => (
          <Link
            key={page.label}
            to={page.href}
            className="block py-3 text-base font-medium text-foreground hover:text-store-primary transition-colors"
            onClick={onClose}
          >
            {page.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
