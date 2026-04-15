import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { subDays, format, parseISO, getHours } from "date-fns";

export function useMessageAnalytics() {
  const thirtyDaysAgo = subDays(new Date(), 30).toISOString();

  const { data: contactMessages = [] } = useQuery({
    queryKey: ["analytics-contact-messages"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contact_messages")
        .select("created_at, response_time_seconds, is_read, replied_at")
        .gte("created_at", thirtyDaysAgo)
        .is("deleted_at", null);
      if (error) throw error;
      return data || [];
    },
  });

  const { data: chatConversations = [] } = useQuery({
    queryKey: ["analytics-chat-conversations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("live_chat_conversations")
        .select("created_at, response_time_seconds, assigned_to, status")
        .gte("created_at", thirtyDaysAgo);
      if (error) throw error;
      return data || [];
    },
  });

  const { data: supportTickets = [] } = useQuery({
    queryKey: ["analytics-support-tickets"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("support_tickets")
        .select("created_at, response_time_seconds, assigned_to, status, first_response_at, priority")
        .gte("created_at", thirtyDaysAgo)
        .is("deleted_at", null);
      if (error) throw error;
      return data || [];
    },
  });

  // Response Time Trend (daily avg)
  const responseTimeTrend = (() => {
    const dailyMap: Record<string, { total: number; count: number }> = {};
    
    [...contactMessages, ...chatConversations, ...supportTickets].forEach((item: any) => {
      if (item.response_time_seconds) {
        const day = format(parseISO(item.created_at), "yyyy-MM-dd");
        if (!dailyMap[day]) dailyMap[day] = { total: 0, count: 0 };
        dailyMap[day].total += item.response_time_seconds;
        dailyMap[day].count += 1;
      }
    });

    return Object.entries(dailyMap)
      .map(([date, { total, count }]) => ({
        date: format(parseISO(date), "dd MMM"),
        avgMinutes: Math.round(total / count / 60),
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  })();

  // Message Volume (daily)
  const messageVolume = (() => {
    const dailyMap: Record<string, { contact: number; chat: number; ticket: number }> = {};

    contactMessages.forEach((m) => {
      const day = format(parseISO(m.created_at), "dd MMM");
      if (!dailyMap[day]) dailyMap[day] = { contact: 0, chat: 0, ticket: 0 };
      dailyMap[day].contact += 1;
    });

    chatConversations.forEach((m) => {
      const day = format(parseISO(m.created_at), "dd MMM");
      if (!dailyMap[day]) dailyMap[day] = { contact: 0, chat: 0, ticket: 0 };
      dailyMap[day].chat += 1;
    });

    supportTickets.forEach((m) => {
      const day = format(parseISO(m.created_at), "dd MMM");
      if (!dailyMap[day]) dailyMap[day] = { contact: 0, chat: 0, ticket: 0 };
      dailyMap[day].ticket += 1;
    });

    return Object.entries(dailyMap).map(([date, counts]) => ({ date, ...counts }));
  })();

  // Busiest Hours
  const busiestHours = (() => {
    const hourMap: Record<number, number> = {};
    for (let i = 0; i < 24; i++) hourMap[i] = 0;

    [...contactMessages, ...chatConversations, ...supportTickets].forEach((item: any) => {
      const hour = getHours(parseISO(item.created_at));
      hourMap[hour] += 1;
    });

    return Object.entries(hourMap).map(([hour, count]) => ({
      hour: `${hour}:00`,
      count,
    }));
  })();

  // Channel Breakdown
  const channelBreakdown = [
    { name: "Contact", value: contactMessages.length },
    { name: "Live Chat", value: chatConversations.length },
    { name: "Tickets", value: supportTickets.length },
  ];

  // Agent Performance
  const agentPerformance = (() => {
    const agentMap: Record<string, { totalResponseTime: number; count: number; total: number }> = {};

    [...chatConversations, ...supportTickets].forEach((item: any) => {
      if (item.assigned_to) {
        if (!agentMap[item.assigned_to]) {
          agentMap[item.assigned_to] = { totalResponseTime: 0, count: 0, total: 0 };
        }
        agentMap[item.assigned_to].total += 1;
        if (item.response_time_seconds) {
          agentMap[item.assigned_to].totalResponseTime += item.response_time_seconds;
          agentMap[item.assigned_to].count += 1;
        }
      }
    });

    return Object.entries(agentMap).map(([agentId, stats]) => ({
      agentId,
      totalHandled: stats.total,
      avgResponseMinutes: stats.count > 0 ? Math.round(stats.totalResponseTime / stats.count / 60) : 0,
    }));
  })();

  const totalMessages = contactMessages.length + chatConversations.length + supportTickets.length;
  const avgResponseTime = (() => {
    const items = [...contactMessages, ...chatConversations, ...supportTickets].filter(
      (i: any) => i.response_time_seconds
    );
    if (items.length === 0) return 0;
    return Math.round(
      items.reduce((sum, i: any) => sum + i.response_time_seconds, 0) / items.length / 60
    );
  })();

  return {
    responseTimeTrend,
    messageVolume,
    busiestHours,
    channelBreakdown,
    agentPerformance,
    totalMessages,
    avgResponseTime,
  };
}
