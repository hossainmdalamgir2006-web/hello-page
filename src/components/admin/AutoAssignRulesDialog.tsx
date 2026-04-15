import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useAutoAssignRules, type CreateRuleData } from "@/hooks/useAutoAssignRules";
import { useAgents } from "@/hooks/useAgents";
import { Settings2, Plus, Trash2, Loader2 } from "lucide-react";

export function AutoAssignRulesDialog() {
  const { rules, isLoading, createRule, deleteRule, toggleRule, isCreating } = useAutoAssignRules();
  const { agents } = useAgents();
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState<CreateRuleData>({
    name: "",
    rule_type: "keyword",
    conditions: { keywords: [] },
    assign_to: null,
    assign_to_email: null,
  });
  const [keywordInput, setKeywordInput] = useState("");

  const handleAddKeyword = () => {
    if (!keywordInput.trim()) return;
    const current = (form.conditions.keywords as string[]) || [];
    setForm({
      ...form,
      conditions: { ...form.conditions, keywords: [...current, keywordInput.trim()] },
    });
    setKeywordInput("");
  };

  const handleRemoveKeyword = (kw: string) => {
    const current = (form.conditions.keywords as string[]) || [];
    setForm({
      ...form,
      conditions: { ...form.conditions, keywords: current.filter((k) => k !== kw) },
    });
  };

  const handleSubmit = () => {
    if (!form.name || !form.assign_to) return;
    const selectedAgent = agents.find((a) => a.user_id === form.assign_to);
    createRule({
      ...form,
      assign_to_email: selectedAgent?.email || null,
    });
    setForm({ name: "", rule_type: "keyword", conditions: { keywords: [] }, assign_to: null, assign_to_email: null });
    setShowForm(false);
  };

  const ruleTypeLabels: Record<string, string> = {
    keyword: "Keyword Match",
    category: "Category",
    priority: "Priority Level",
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings2 className="h-4 w-4 mr-2" />
          Auto-Assign
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Auto-Assign Rules</SheetTitle>
          <SheetDescription>
            Automatically assign new chats and tickets to agents based on rules
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          <Button size="sm" onClick={() => setShowForm(!showForm)}>
            <Plus className="h-4 w-4 mr-2" />
            New Rule
          </Button>

          {showForm && (
            <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
              <div className="space-y-2">
                <Label>Rule Name</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g., Urgent to Senior Agent" />
              </div>

              <div className="space-y-2">
                <Label>Rule Type</Label>
                <Select value={form.rule_type} onValueChange={(v) => {
                  const conditions = v === "keyword" ? { keywords: [] } : v === "category" ? { category: "" } : { priority: "" };
                  setForm({ ...form, rule_type: v, conditions });
                }}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="keyword">Keyword Match</SelectItem>
                    <SelectItem value="category">Category</SelectItem>
                    <SelectItem value="priority">Priority Level</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Conditions */}
              {form.rule_type === "keyword" && (
                <div className="space-y-2">
                  <Label>Keywords</Label>
                  <div className="flex gap-2">
                    <Input
                      value={keywordInput}
                      onChange={(e) => setKeywordInput(e.target.value)}
                      placeholder="Add keyword..."
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddKeyword())}
                    />
                    <Button type="button" size="sm" onClick={handleAddKeyword}>Add</Button>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {((form.conditions.keywords as string[]) || []).map((kw) => (
                      <Badge key={kw} variant="secondary" className="cursor-pointer" onClick={() => handleRemoveKeyword(kw)}>
                        {kw} ×
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {form.rule_type === "category" && (
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={form.conditions.category || ""} onValueChange={(v) => setForm({ ...form, conditions: { category: v } })}>
                    <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                    <SelectContent>
                      {["billing", "technical", "general", "shipping", "returns", "product"].map((c) => (
                        <SelectItem key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {form.rule_type === "priority" && (
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select value={form.conditions.priority || ""} onValueChange={(v) => setForm({ ...form, conditions: { priority: v } })}>
                    <SelectTrigger><SelectValue placeholder="Select priority" /></SelectTrigger>
                    <SelectContent>
                      {["urgent", "high", "medium", "low"].map((p) => (
                        <SelectItem key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label>Assign To</Label>
                <Select value={form.assign_to || ""} onValueChange={(v) => setForm({ ...form, assign_to: v })}>
                  <SelectTrigger><SelectValue placeholder="Select agent" /></SelectTrigger>
                  <SelectContent>
                    {agents.map((agent) => (
                      <SelectItem key={agent.user_id} value={agent.user_id}>
                        {agent.full_name || agent.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2 justify-end">
                <Button variant="outline" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button size="sm" onClick={handleSubmit} disabled={isCreating || !form.name || !form.assign_to}>
                  {isCreating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Create Rule
                </Button>
              </div>
            </div>
          )}

          <Separator />

          <ScrollArea className="h-[400px]">
            {isLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
            ) : rules.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No rules created yet</p>
            ) : (
              <div className="space-y-3">
                {rules.map((rule) => {
                  const agent = agents.find((a) => a.user_id === rule.assign_to);
                  return (
                    <div key={rule.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm truncate">{rule.name}</p>
                          <Badge variant="outline" className="text-xs">{ruleTypeLabels[rule.rule_type] || rule.rule_type}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          → {agent?.full_name || agent?.email || rule.assign_to_email || "Unknown"}
                        </p>
                        {rule.rule_type === "keyword" && rule.conditions.keywords && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {(rule.conditions.keywords as string[]).slice(0, 3).map((kw) => (
                              <Badge key={kw} variant="secondary" className="text-[10px]">{kw}</Badge>
                            ))}
                            {(rule.conditions.keywords as string[]).length > 3 && (
                              <Badge variant="secondary" className="text-[10px]">+{(rule.conditions.keywords as string[]).length - 3}</Badge>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 ml-2">
                        <Switch
                          checked={rule.is_active}
                          onCheckedChange={(checked) => toggleRule({ id: rule.id, is_active: checked })}
                        />
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => deleteRule(rule.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
}
