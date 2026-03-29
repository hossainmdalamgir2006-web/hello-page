import { ReactNode, useState, useEffect, Suspense } from "react";
import { useLocation, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

import { supabase } from "@/integrations/supabase/client";
import { AccountSidebar } from "@/components/account/AccountSidebar";
import { AccountHeader } from "@/components/account/AccountHeader";
import { cn } from "@/lib/utils";

const ACCOUNT_SIDEBAR_KEY = "account-sidebar-collapsed";

const pageTitles: Record<string, { title: string; description: string }> = {
  "/myaccount": { title: "Dashboard", description: "Overview of your account" },
  "/myaccount/orders": { title: "My Orders", description: "View and track your orders" },
  "/myaccount/returns": { title: "Returns", description: "Manage your return requests" },
  "/myaccount/wishlist": { title: "Wishlist", description: "Products you've saved" },
  "/myaccount/shopping": { title: "Shopping History", description: "Your purchase history" },
  "/myaccount/recently-viewed": { title: "Recently Viewed", description: "Products you've browsed" },
  "/myaccount/reviews": { title: "My Reviews", description: "Your product reviews" },
  "/myaccount/addresses": { title: "Addresses", description: "Manage your saved addresses" },
  "/myaccount/security": { title: "Security", description: "Manage your account security" },
  "/myaccount/support": { title: "Support", description: "Get help from our team" },
  "/myaccount/chat": { title: "Live Chat", description: "Chat with support" },
  "/myaccount/notification-preferences": { title: "Notification Preferences", description: "Manage your notification settings" },
  "/myaccount/personal-info": { title: "Settings", description: "Account preferences" },
  "/myaccount/password": { title: "Change Password", description: "Update your account password" },
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
    <div className="min-h-screen bg-background">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-foreground/20 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed left-0 top-0 z-40 h-screen transition-transform lg:translate-x-0",
        collapsed ? "w-[68px]" : "w-64",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
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
      <div className={cn(
        collapsed ? "lg:ml-[68px]" : "lg:ml-64"
      )}>
        <AccountHeader
          onMenuClick={() => setSidebarOpen(true)}
          collapsed={collapsed}
          pageTitle={pageInfo.title}
          pageDescription={pageInfo.description}
        />
        <main className="p-3 sm:p-4 md:p-6">
          <div key={location.pathname} className="mx-auto max-w-6xl animate-fade-in">
            {children || <Outlet />}
          </div>
        </main>
      </div>
    </div>
  );
}
