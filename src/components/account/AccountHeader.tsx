import { useState, useEffect } from "react";
import { Menu, LogOut, Settings, Store, ChevronRight, Home, Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/ThemeToggle";
import { GoogleTranslateWidget } from "@/components/GoogleTranslateWidget";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useRealtimeNotifications } from "@/hooks/useRealtimeNotifications";

interface AccountHeaderProps {
  onMenuClick?: () => void;
  collapsed?: boolean;
  pageTitle?: string;
  pageDescription?: string;
}

export function AccountHeader({ onMenuClick, pageTitle = "My Account", pageDescription }: AccountHeaderProps) {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const { unreadCount } = useRealtimeNotifications();

  useEffect(() => {
    if (user) {
      supabase
        .from("profiles")
        .select("avatar_url")
        .eq("user_id", user.id)
        .single()
        .then(({ data }) => {
          if (data?.avatar_url) setAvatarUrl(data.avatar_url);
        });
    }
  }, [user]);

  const handleLogout = async () => {
    await signOut();
    toast({ title: "Signed Out", description: "You have been signed out successfully." });
    navigate("/");
  };

  const getInitials = () => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);
    }
    return user?.email?.slice(0, 2).toUpperCase() || "U";
  };

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-card/80 backdrop-blur-sm shadow-sm">
      <div className="flex h-14 sm:h-16 items-center justify-between px-3 sm:px-6">
        {/* Left: Menu + Breadcrumb */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden h-9 w-9 text-muted-foreground"
            onClick={onMenuClick}
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Breadcrumb + Description */}
          <div className="hidden sm:block">
            <nav className="flex items-center gap-1.5 text-sm">
              <button
                onClick={() => navigate("/")}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Home className="h-3.5 w-3.5" />
              </button>
              <ChevronRight className="h-3 w-3 text-muted-foreground/40" />
              <button
                onClick={() => navigate("/myaccount")}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                My Account
              </button>
              {pageTitle !== "Dashboard" && (
                <>
                  <ChevronRight className="h-3 w-3 text-muted-foreground/40" />
                  <span className="font-semibold text-foreground">{pageTitle}</span>
                </>
              )}
            </nav>
            {pageDescription && (
              <p className="text-[11px] text-muted-foreground mt-0.5">{pageDescription}</p>
            )}
          </div>

          {/* Mobile title */}
          <div className="sm:hidden">
            <h2 className="text-base font-semibold text-foreground leading-tight">{pageTitle}</h2>
            {pageDescription && (
              <p className="text-[10px] text-muted-foreground">{pageDescription}</p>
            )}
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="hidden md:flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <Store className="h-4 w-4" />
            <span className="text-sm">Store</span>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/myaccount/notifications")}
            className="h-9 w-9 text-muted-foreground hover:text-foreground relative"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive text-destructive-foreground text-[9px] font-bold px-0.5">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Button>

          <GoogleTranslateWidget />
          <ThemeToggle />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 px-2 h-9">
                <Avatar className="h-7 w-7">
                  <AvatarImage src={avatarUrl || ""} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-[10px] font-semibold">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden lg:block text-left">
                  <p className="text-sm font-medium leading-none">
                    {user?.user_metadata?.full_name || "Customer"}
                  </p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel className="font-normal">
                <p className="text-sm font-medium">{user?.user_metadata?.full_name || "Customer"}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/myaccount/settings")}>
                <Settings className="mr-2 h-4 w-4" />Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/")}>
                <Store className="mr-2 h-4 w-4" />Go to Store
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                <LogOut className="mr-2 h-4 w-4" />Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
