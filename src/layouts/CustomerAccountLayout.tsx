import { ReactNode, useState, useEffect } from "react";
import { useLocation, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { AccountSidebar } from "@/components/account/AccountSidebar";
import { AccountHeader } from "@/components/account/AccountHeader";
import { cn } from "@/lib/utils";

const ACCOUNT_SIDEBAR_KEY = "account-sidebar-collapsed";

const pageTitleKeys: Record<string, { titleKey: string; descKey: string }> = {
  "/myaccount": { titleKey: "account.dashboard", descKey: "account.dashboardDesc" },
  "/myaccount/orders": { titleKey: "account.ordersTitle", descKey: "account.ordersDesc" },
  "/myaccount/returns": { titleKey: "account.returnsTitle", descKey: "account.returnsDesc" },
  "/myaccount/wishlist": { titleKey: "account.wishlistTitle", descKey: "account.wishlistDesc" },
  "/myaccount/shopping": { titleKey: "account.shoppingTitle", descKey: "account.shoppingDesc" },
  "/myaccount/recently-viewed": { titleKey: "account.recentlyViewedTitle", descKey: "account.recentlyViewedDesc" },
  "/myaccount/reviews": { titleKey: "account.reviewsTitle", descKey: "account.reviewsDesc" },
  "/myaccount/addresses": { titleKey: "account.addressesTitle", descKey: "account.addressesDesc" },
  "/myaccount/payment-methods": { titleKey: "account.paymentTitle", descKey: "account.paymentDesc" },
  "/myaccount/security": { titleKey: "account.securityTitle", descKey: "account.securityDesc" },
  "/myaccount/support": { titleKey: "account.supportTitle", descKey: "account.supportDesc" },
  "/myaccount/chat": { titleKey: "account.chatTitle", descKey: "account.chatDesc" },
  "/myaccount/notifications": { titleKey: "account.notificationsTitle", descKey: "account.notificationsDesc" },
  "/myaccount/settings": { titleKey: "account.settingsTitle", descKey: "account.settingsDesc" },
};

interface CustomerAccountLayoutProps {
  children?: ReactNode;
}

export function CustomerAccountLayout({ children }: CustomerAccountLayoutProps) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem(ACCOUNT_SIDEBAR_KEY) === "true"; } catch { return false; }
  });

  const toggleCollapsed = () => setCollapsed(prev => {
    const next = !prev;
    try { localStorage.setItem(ACCOUNT_SIDEBAR_KEY, String(next)); } catch {}
    return next;
  });

  const [profile, setProfile] = useState<{ full_name?: string; avatar_url?: string } | null>(null);

  useEffect(() => {
    if (user) {
      supabase
        .from("profiles")
        .select("full_name, avatar_url")
        .eq("user_id", user.id)
        .single()
        .then(({ data }) => {
          if (data) setProfile(data);
        });
    }
  }, [user]);

  const keys = pageTitleKeys[location.pathname] || { titleKey: "store.myAccount", descKey: "" };
  const pageInfo = { title: t(keys.titleKey), description: keys.descKey ? t(keys.descKey) : "" };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm lg:hidden animate-fade-in"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed left-0 top-0 z-40 h-screen transition-all duration-300 lg:translate-x-0",
          collapsed ? "w-[68px]" : "w-64",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <AccountSidebar
          collapsed={collapsed}
          onToggleCollapse={toggleCollapsed}
          avatarUrl={profile?.avatar_url}
          fullName={profile?.full_name}
          email={user?.email}
          onCloseMobile={() => setSidebarOpen(false)}
        />
      </div>

      {/* Main content */}
      <div
        className={cn(
          "transition-all duration-300",
          collapsed ? "lg:ml-[68px]" : "lg:ml-64"
        )}
      >
        <AccountHeader
          onMenuClick={() => setSidebarOpen(true)}
          collapsed={collapsed}
          pageTitle={pageInfo.title}
          pageDescription={pageInfo.description}
        />
        <main className="p-4 sm:p-6 lg:p-8">
          <div key={location.pathname} className="mx-auto max-w-6xl animate-fade-in">
            {children || <Outlet />}
          </div>
        </main>
      </div>
    </div>
  );
}
