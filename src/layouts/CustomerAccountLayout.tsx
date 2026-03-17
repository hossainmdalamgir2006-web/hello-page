import { ReactNode, useState, useEffect } from "react";
import { useLocation, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { AccountSidebar } from "@/components/account/AccountSidebar";
import { AccountHeader } from "@/components/account/AccountHeader";
import { cn } from "@/lib/utils";

const ACCOUNT_SIDEBAR_KEY = "account-sidebar-collapsed";

// Page title mapping
const pageTitles: Record<string, { title: string; description: string }> = {
  "/myaccount": { title: "Dashboard", description: "Overview of your account activity" },
  "/myaccount/orders": { title: "My Orders", description: "View and track your orders" },
  "/myaccount/returns": { title: "Returns & Refunds", description: "Submit return or refund requests" },
  "/myaccount/wishlist": { title: "Wishlist", description: "Products you've saved for later" },
  "/myaccount/shopping": { title: "Shopping", description: "Buy again, coupons & deals" },
  "/myaccount/recently-viewed": { title: "Recently Viewed", description: "Products you've browsed" },
  "/myaccount/reviews": { title: "My Reviews", description: "Your product reviews & ratings" },
  "/myaccount/addresses": { title: "Addresses", description: "Manage delivery addresses" },
  "/myaccount/payment-methods": { title: "Payment Methods", description: "Manage saved payment methods" },
  "/myaccount/security": { title: "Security", description: "Account protection settings" },
  "/myaccount/support": { title: "Support", description: "Get help from our team" },
  "/myaccount/chat": { title: "Live Chat", description: "Chat with our support team" },
  "/myaccount/notifications": { title: "Notifications", description: "All your notifications in one place" },
  "/myaccount/settings": { title: "Settings", description: "Profile & preferences" },
};

interface CustomerAccountLayoutProps {
  children?: ReactNode;
}

export function CustomerAccountLayout({ children }: CustomerAccountLayoutProps) {
  const { user } = useAuth();
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

  const pageInfo = pageTitles[location.pathname] || { title: "My Account", description: "" };

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
        <main className="p-3 sm:p-4 md:p-6">{children || <Outlet />}</main>
      </div>
    </div>
  );
}
