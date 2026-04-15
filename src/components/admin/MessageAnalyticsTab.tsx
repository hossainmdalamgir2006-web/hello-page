import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMessageAnalytics } from "@/hooks/useMessageAnalytics";
import { useAgents } from "@/hooks/useAgents";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { Clock, MessageSquare, TrendingUp, Users } from "lucide-react";

const COLORS = ["hsl(var(--primary))", "hsl(var(--accent))", "hsl(var(--warning))"];

export function MessageAnalyticsTab() {
  const {
    responseTimeTrend,
    messageVolume,
    busiestHours,
    channelBreakdown,
    agentPerformance,
    totalMessages,
    avgResponseTime,
  } = useMessageAnalytics();
  const { agents } = useAgents();

  const getAgentName = (agentId: string) => {
    const agent = agents.find((a) => a.user_id === agentId);
    return agent?.full_name || agent?.email || agentId.slice(0, 8);
  };

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Messages (30d)", value: totalMessages, icon: MessageSquare, color: "primary" },
          { label: "Avg Response Time", value: `${avgResponseTime}m`, icon: Clock, color: "accent" },
          { label: "Active Channels", value: channelBreakdown.filter((c) => c.value > 0).length, icon: TrendingUp, color: "success" },
          { label: "Active Agents", value: agentPerformance.length, icon: Users, color: "warning" },
        ].map((stat) => {
          const IconComp = stat.icon;
          const bgMap: Record<string, string> = { primary: "bg-primary/10 text-primary", accent: "bg-accent/10 text-accent", success: "bg-success/10 text-success", warning: "bg-warning/10 text-warning" };
          const borderMap: Record<string, string> = { primary: "border-l-primary", accent: "border-l-accent", success: "border-l-success", warning: "border-l-warning" };
          const cardBgMap: Record<string, string> = { primary: "bg-primary/5 dark:bg-primary/10", accent: "bg-accent/5 dark:bg-accent/10", success: "bg-success/5 dark:bg-success/10", warning: "bg-warning/5 dark:bg-warning/10" };
          return (
            <div key={stat.label} className={`rounded-xl border border-border/50 p-4 border-l-[3px] ${borderMap[stat.color]} ${cardBgMap[stat.color]}`}>
              <div className="flex items-center gap-3">
                <div className={`rounded-lg p-2 ${bgMap[stat.color]}`}>
                  <IconComp className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">{stat.label}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Response Time Trend */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Response Time Trend (30 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            {responseTimeTrend.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-12">No response time data available</p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={responseTimeTrend}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} label={{ value: "Minutes", angle: -90, position: "insideLeft", fontSize: 11 }} />
                  <Tooltip formatter={(value: number) => [`${value} min`, "Avg Response"]} />
                  <Line type="monotone" dataKey="avgMinutes" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Message Volume */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Message Volume by Channel</CardTitle>
          </CardHeader>
          <CardContent>
            {messageVolume.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-12">No data available</p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={messageVolume}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="contact" name="Contact" fill="hsl(var(--primary))" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="chat" name="Chat" fill="hsl(var(--accent))" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="ticket" name="Ticket" fill="hsl(var(--warning))" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Busiest Hours */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Busiest Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={busiestHours}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="hour" tick={{ fontSize: 10 }} interval={2} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" name="Messages" fill="hsl(var(--primary))" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Channel Breakdown */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Channel Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {channelBreakdown.every((c) => c.value === 0) ? (
              <p className="text-sm text-muted-foreground text-center py-12">No data available</p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={channelBreakdown.filter((c) => c.value > 0)}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {channelBreakdown.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Agent Performance */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Agent Performance</CardTitle>
        </CardHeader>
        <CardContent>
          {agentPerformance.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No agent data available</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-medium text-muted-foreground">Agent</th>
                    <th className="text-right p-3 font-medium text-muted-foreground">Total Handled</th>
                    <th className="text-right p-3 font-medium text-muted-foreground">Avg Response Time</th>
                  </tr>
                </thead>
                <tbody>
                  {agentPerformance.map((agent) => (
                    <tr key={agent.agentId} className="border-b last:border-0 hover:bg-muted/50">
                      <td className="p-3 font-medium">{getAgentName(agent.agentId)}</td>
                      <td className="p-3 text-right">{agent.totalHandled}</td>
                      <td className="p-3 text-right">{agent.avgResponseMinutes > 0 ? `${agent.avgResponseMinutes} min` : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
