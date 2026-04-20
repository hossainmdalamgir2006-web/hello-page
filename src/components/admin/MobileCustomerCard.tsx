import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Eye, Send, MoreVertical, CheckCircle2, Clock, Ban, ChevronRight, Flag } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Customer } from "@/hooks/useCustomersData";
import { formatPrice } from "@/lib/formatPrice";

const statusConfig = {
  active: { color: "bg-success/10 text-success border-success/20", icon: CheckCircle2, label: "Active" },
  inactive: { color: "bg-muted text-muted-foreground border-muted", icon: Clock, label: "Inactive" },
  blocked: { color: "bg-destructive/10 text-destructive border-destructive/20", icon: Ban, label: "Blocked" },
  flagged: { color: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20", icon: Flag, label: "Flagged" },
};

const getCustomerName = (customer: Customer): string => {
  return customer.full_name || customer.email?.split('@')[0] || 'Unknown';
};


interface MobileCustomerCardProps {
  customer: Customer;
  onViewDetails: (customer: Customer) => void;
  onSendEmail: (customer: Customer) => void;
}

export function MobileCustomerCard({ customer, onViewDetails, onSendEmail }: MobileCustomerCardProps) {
  const name = getCustomerName(customer);
  const status = (customer.status && customer.status in statusConfig) 
    ? customer.status as keyof typeof statusConfig 
    : 'active';
  const StatusIcon = statusConfig[status].icon;
  const customerTags = customer.tags || [];

  const getInitials = (n: string) => n.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <Card className="border-border">
      <CardContent className="p-4">
        {/* Top: Avatar, name, status, actions */}
        <div className="flex items-start gap-3 mb-3">
          <Avatar className="h-12 w-12">
            <AvatarFallback className="bg-primary/10 text-primary text-sm">
              {getInitials(name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <p className="font-semibold text-foreground truncate">{name}</p>
            </div>
            <p className="text-sm text-muted-foreground truncate">{customer.email || '-'}</p>
            <p className="text-xs text-muted-foreground">{customer.phone || '-'}</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-10 w-10 -mr-2 -mt-1">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-popover">
              <DropdownMenuItem onClick={() => onViewDetails(customer)} className="py-3">
                <Eye className="mr-3 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onSendEmail(customer)} className="py-3">
                <Send className="mr-3 h-4 w-4" />
                Send Email
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mb-3 rounded-lg bg-muted/50 p-3">
          <div className="text-center">
            <p className="text-lg font-bold text-foreground">{customer.total_orders}</p>
            <p className="text-xs text-muted-foreground">Orders</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-foreground">{formatPrice(customer.total_spent)}</p>
            <p className="text-xs text-muted-foreground">Spent</p>
          </div>
          <div className="text-center">
            <Badge variant="outline" className={cn("text-xs gap-1", statusConfig[status].color)}>
              <StatusIcon className="h-3 w-3" />
              {statusConfig[status].label}
            </Badge>
            <p className="text-xs text-muted-foreground mt-1">Status</p>
          </div>
        </div>

        {/* Tags */}
        {customerTags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {customerTags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {customerTags.length > 3 && (
              <Badge variant="outline" className="text-xs">+{customerTags.length - 3}</Badge>
            )}
          </div>
        )}

        {/* Bottom: Joined date and action */}
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">Joined {formatDate(customer.created_at)}</p>
          <Button
            size="sm"
            variant="ghost"
            className="h-9 text-xs gap-1"
            onClick={() => onViewDetails(customer)}
          >
            View
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}