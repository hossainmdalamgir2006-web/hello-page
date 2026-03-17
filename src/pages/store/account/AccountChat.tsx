import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Send, MessageCircle, Plus } from "lucide-react";
import { DelayedLoader } from "@/components/ui/DelayedLoader";
import { ChatSkeleton } from "@/components/skeletons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { format } from "date-fns";

export default function AccountChat() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConv, setActiveConv] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMsg, setNewMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchConversations = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("live_chat_conversations")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });
    setConversations(data || []);
    setLoading(false);
  };

  const fetchMessages = async (convId: string) => {
    const { data } = await supabase
      .from("live_chat_messages")
      .select("*")
      .eq("conversation_id", convId)
      .order("created_at", { ascending: true });
    setMessages(data || []);
    setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  useEffect(() => { fetchConversations(); }, [user]);

  useEffect(() => {
    if (!activeConv) return;
    fetchMessages(activeConv);

    const channel = supabase
      .channel(`chat-${activeConv}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "live_chat_messages", filter: `conversation_id=eq.${activeConv}` }, () => {
        fetchMessages(activeConv);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [activeConv]);

  const startNewChat = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("live_chat_conversations")
      .insert({
        user_id: user.id,
        customer_name: user.user_metadata?.full_name || user.email,
        customer_email: user.email,
        status: "open",
        subject: "New Support Chat",
      })
      .select()
      .single();
    if (data) {
      setActiveConv(data.id);
      fetchConversations();
    }
  };

  const sendMessage = async () => {
    if (!newMsg.trim() || !activeConv) return;
    setSending(true);
    const { error } = await supabase.from("live_chat_messages").insert({
      conversation_id: activeConv,
      content: newMsg.trim(),
      sender_type: "customer",
      sender_id: user!.id,
      sender_name: user!.user_metadata?.full_name || user!.email,
    });
    if (!error) setNewMsg("");
    else toast.error("Failed to send");
    setSending(false);
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[calc(100vh-14rem)]">
      {/* Conversations list */}
      <Card className="md:col-span-1 flex flex-col">
        <CardHeader className="pb-2 flex-row items-center justify-between">
          <CardTitle className="text-sm">Chats</CardTitle>
          <Button size="sm" variant="ghost" onClick={startNewChat}>
            <Plus className="h-4 w-4" />
          </Button>
        </CardHeader>
        <ScrollArea className="flex-1">
          <div className="px-3 pb-3 space-y-1">
            {conversations.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-6">No conversations yet</p>
            ) : (
              conversations.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setActiveConv(c.id)}
                  className={cn(
                    "w-full text-left px-3 py-2.5 rounded-lg transition-colors text-sm",
                    activeConv === c.id ? "bg-primary text-primary-foreground" : "hover:bg-accent"
                  )}
                >
                  <p className="font-medium truncate">{c.subject || "Support Chat"}</p>
                  <p className={cn("text-xs mt-0.5", activeConv === c.id ? "text-primary-foreground/70" : "text-muted-foreground")}>
                    {format(new Date(c.updated_at), "MMM dd, HH:mm")}
                  </p>
                </button>
              ))
            )}
          </div>
        </ScrollArea>
      </Card>

      {/* Messages */}
      <Card className="md:col-span-2 flex flex-col">
        {activeConv ? (
          <>
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-3">
                {messages.map((m) => (
                  <div key={m.id} className={cn("flex", m.sender_type === "customer" ? "justify-end" : "justify-start")}>
                    <div className={cn(
                      "max-w-[75%] rounded-xl px-3.5 py-2.5 text-sm",
                      m.sender_type === "customer"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground"
                    )}>
                      <p>{m.content}</p>
                      <p className={cn("text-[10px] mt-1", m.sender_type === "customer" ? "text-primary-foreground/60" : "text-muted-foreground")}>
                        {format(new Date(m.created_at), "HH:mm")}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={scrollRef} />
              </div>
            </ScrollArea>
            <div className="border-t border-border p-3 flex gap-2">
              <Input
                value={newMsg}
                onChange={(e) => setNewMsg(e.target.value)}
                placeholder="Type a message..."
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
              />
              <Button onClick={sendMessage} disabled={sending || !newMsg.trim()} size="icon">
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
          </>
        ) : (
          <CardContent className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-40" />
              <p className="text-sm">Select a chat or start a new one</p>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
