import { useEffect, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, Clock, Flame } from "lucide-react";
import { useSLAConfig } from "@/hooks/useSLAConfig";
import { LiveChatConversation } from "@/hooks/useLiveChat";
import { SupportTicket } from "@/hooks/useSupportTickets";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SLABreachAlertProps {
  conversations: LiveChatConversation[];
  tickets: SupportTicket[];
}

export function SLABreachAlert({ conversations, tickets }: SLABreachAlertProps) {
  const { checkSLAStatus, config } = useSLAConfig();
  const notifiedIdsRef = useRef<Set<string>>(new Set());

  // Check for SLA breaches in conversations
  const breachedChats = conversations.filter(conv => {
    if (conv.status === "resolved" || conv.status === "closed") return false;
    const sla = checkSLAStatus(conv.created_at, null, null, "medium");
    return sla.breached;
  });

  // Check for SLA breaches in tickets
  const breachedTickets = tickets.filter(ticket => {
    if (ticket.status === "resolved" || ticket.status === "closed") return false;
    const sla = checkSLAStatus(
      ticket.created_at,
      ticket.first_response_at,
      ticket.response_time_seconds,
      ticket.priority
    );
    return sla.breached && !ticket.first_response_at;
  });

  const totalBreaches = breachedChats.length + breachedTickets.length;

  // Auto-notify agents on SLA breach
  useEffect(() => {
    if (!config.autoNotifyOnBreach || totalBreaches === 0) return;

    const sendBreachNotifications = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Notify for breached chats
      for (const conv of breachedChats) {
        const notifKey = `chat-${conv.id}`;
        if (notifiedIdsRef.current.has(notifKey)) continue;

        const targetUserId = conv.assigned_to || user.id;
        
        await supabase.from("notifications").insert({
          user_id: targetUserId,
          title: "⚠️ SLA Breach — Live Chat",
          message: `Chat from ${conv.customer_name || "Unknown"} has exceeded SLA response time`,
          type: "sla_breach",
          data: { conversation_id: conv.id, entity_type: "chat" } as any,
        });
        
        notifiedIdsRef.current.add(notifKey);
      }

      // Notify for breached tickets
      for (const ticket of breachedTickets) {
        const notifKey = `ticket-${ticket.id}`;
        if (notifiedIdsRef.current.has(notifKey)) continue;

        const targetUserId = ticket.assigned_to || user.id;
        
        await supabase.from("notifications").insert({
          user_id: targetUserId,
          title: "⚠️ SLA Breach — Support Ticket",
          message: `Ticket #${ticket.ticket_number || ticket.id.slice(0, 8)} (${ticket.priority}) has exceeded SLA response time`,
          type: "sla_breach",
          data: { ticket_id: ticket.id, entity_type: "ticket" } as any,
        });
        
        notifiedIdsRef.current.add(notifKey);
      }

      if (breachedChats.length + breachedTickets.length > 0) {
        const newBreaches = [...breachedChats, ...breachedTickets].filter(
          item => !notifiedIdsRef.current.has(`chat-${'customer_name' in item ? item.id : ''}`) &&
                  !notifiedIdsRef.current.has(`ticket-${'ticket_number' in item ? item.id : ''}`)
        );
        // Only toast if there were genuinely new breaches processed
      }
    };

    sendBreachNotifications();
  }, [totalBreaches, config.autoNotifyOnBreach]);

  if (totalBreaches === 0) return null;

  return (
    <Card className="border-destructive/50 bg-destructive/5 animate-pulse">
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-destructive/20">
            <Flame className="h-5 w-5 text-destructive" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-destructive text-sm">
                ⚠️ SLA Breach Alert
              </h4>
              <Badge variant="destructive" className="text-xs">
                {totalBreaches}
              </Badge>
              {config.autoNotifyOnBreach && (
                <Badge variant="outline" className="text-xs text-warning border-warning/30">
                  Auto-Notify ON
                </Badge>
              )}
            </div>
            <div className="flex flex-wrap gap-3 mt-1 text-xs text-muted-foreground">
              {breachedChats.length > 0 && (
                <span className="flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3 text-destructive" />
                  {breachedChats.length} chat(s) SLA missed
                </span>
              )}
              {breachedTickets.length > 0 && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3 text-destructive" />
                  {breachedTickets.length} ticket(s) SLA missed
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
