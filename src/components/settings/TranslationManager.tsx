import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Search, Plus, Save, Languages } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface TranslationRow {
  id: string;
  key: string;
  language_code: string;
  value: string;
}

export function TranslationManager() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [langFilter, setLangFilter] = useState("all");
  const [editingCell, setEditingCell] = useState<{ key: string; lang: string } | null>(null);
  const [editValue, setEditValue] = useState("");
  const [newKeyOpen, setNewKeyOpen] = useState(false);
  const [newKey, setNewKey] = useState("");
  const [newValues, setNewValues] = useState<Record<string, string>>({});
  const [page, setPage] = useState(0);
  const pageSize = 50;

  // Fetch enabled languages
  const { data: languages = [] } = useQuery({
    queryKey: ["language-settings"],
    queryFn: async () => {
      const { data } = await supabase
        .from("language_settings")
        .select("language_code, language_name, flag_emoji")
        .eq("enabled", true)
        .order("sort_order");
      return (data || []) as Array<{ language_code: string; language_name: string; flag_emoji: string }>;
    },
  });

  // Fetch all translations
  const { data: allTranslations = [], isLoading } = useQuery({
    queryKey: ["admin-translations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("translations")
        .select("id, key, language_code, value")
        .order("key");
      if (error) throw error;
      return (data || []) as TranslationRow[];
    },
  });

  // Group translations by key
  const groupedKeys = useMemo(() => {
    const map = new Map<string, Record<string, { id: string; value: string }>>();
    for (const t of allTranslations) {
      if (!map.has(t.key)) map.set(t.key, {});
      map.get(t.key)![t.language_code] = { id: t.id, value: t.value };
    }
    return map;
  }, [allTranslations]);

  // Filter keys
  const filteredKeys = useMemo(() => {
    let keys = Array.from(groupedKeys.keys());
    if (search) {
      const s = search.toLowerCase();
      keys = keys.filter((key) => {
        if (key.toLowerCase().includes(s)) return true;
        const langs = groupedKeys.get(key)!;
        return Object.values(langs).some((v) => v.value.toLowerCase().includes(s));
      });
    }
    return keys;
  }, [groupedKeys, search]);

  const paginatedKeys = filteredKeys.slice(page * pageSize, (page + 1) * pageSize);
  const totalPages = Math.ceil(filteredKeys.length / pageSize);

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ key, lang, value }: { key: string; lang: string; value: string }) => {
      const existing = groupedKeys.get(key)?.[lang];
      if (existing) {
        const { error } = await supabase
          .from("translations")
          .update({ value, updated_at: new Date().toISOString() })
          .eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("translations")
          .insert({ key, language_code: lang, value });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-translations"] });
      queryClient.invalidateQueries({ queryKey: ["translations"] });
      toast.success("Translation updated");
      setEditingCell(null);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  // Add new key mutation
  const addKeyMutation = useMutation({
    mutationFn: async ({ key, values }: { key: string; values: Record<string, string> }) => {
      const rows = Object.entries(values)
        .filter(([, v]) => v.trim())
        .map(([lang, value]) => ({ key, language_code: lang, value }));
      if (rows.length === 0) throw new Error("Add at least one translation");
      const { error } = await supabase.from("translations").insert(rows);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-translations"] });
      queryClient.invalidateQueries({ queryKey: ["translations"] });
      toast.success("Translation key added");
      setNewKeyOpen(false);
      setNewKey("");
      setNewValues({});
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const startEdit = (key: string, lang: string, currentValue: string) => {
    setEditingCell({ key, lang });
    setEditValue(currentValue);
  };

  const saveEdit = () => {
    if (!editingCell) return;
    updateMutation.mutate({ key: editingCell.key, lang: editingCell.lang, value: editValue });
  };

  const visibleLangs = langFilter === "all"
    ? languages
    : languages.filter((l) => l.language_code === langFilter);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Languages className="h-5 w-5" />
                Translation Manager
              </CardTitle>
              <CardDescription>
                {filteredKeys.length} keys found • {allTranslations.length} total translations
              </CardDescription>
            </div>
            <Dialog open={newKeyOpen} onOpenChange={setNewKeyOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-1" /> Add Key
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Translation Key</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Key</Label>
                    <Input
                      placeholder="e.g. store.newFeature"
                      value={newKey}
                      onChange={(e) => setNewKey(e.target.value)}
                    />
                  </div>
                  {languages.map((lang) => (
                    <div key={lang.language_code}>
                      <Label>
                        {lang.flag_emoji} {lang.language_name}
                      </Label>
                      <Input
                        placeholder={`Translation in ${lang.language_name}`}
                        value={newValues[lang.language_code] || ""}
                        onChange={(e) =>
                          setNewValues((prev) => ({ ...prev, [lang.language_code]: e.target.value }))
                        }
                      />
                    </div>
                  ))}
                  <Button
                    onClick={() => addKeyMutation.mutate({ key: newKey, values: newValues })}
                    disabled={!newKey.trim() || addKeyMutation.isPending}
                    className="w-full"
                  >
                    Add Key
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by key or value..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                className="pl-9"
              />
            </div>
            <Select value={langFilter} onValueChange={setLangFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Languages</SelectItem>
                {languages.map((l) => (
                  <SelectItem key={l.language_code} value={l.language_code}>
                    {l.flag_emoji} {l.language_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading translations...</div>
          ) : (
            <>
              <div className="rounded-md border overflow-auto max-h-[600px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="sticky top-0 bg-background min-w-[200px]">Key</TableHead>
                      {visibleLangs.map((l) => (
                        <TableHead key={l.language_code} className="sticky top-0 bg-background min-w-[250px]">
                          {l.flag_emoji} {l.language_name}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedKeys.map((key) => {
                      const langs = groupedKeys.get(key)!;
                      return (
                        <TableRow key={key}>
                          <TableCell className="font-mono text-xs text-muted-foreground">{key}</TableCell>
                          {visibleLangs.map((l) => {
                            const cell = langs[l.language_code];
                            const isEditing =
                              editingCell?.key === key && editingCell?.lang === l.language_code;

                            return (
                              <TableCell key={l.language_code}>
                                {isEditing ? (
                                  <div className="flex gap-1">
                                    <Input
                                      value={editValue}
                                      onChange={(e) => setEditValue(e.target.value)}
                                      className="h-8 text-xs"
                                      autoFocus
                                      onKeyDown={(e) => {
                                        if (e.key === "Enter") saveEdit();
                                        if (e.key === "Escape") setEditingCell(null);
                                      }}
                                    />
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="h-8 w-8 shrink-0"
                                      onClick={saveEdit}
                                      disabled={updateMutation.isPending}
                                    >
                                      <Save className="h-3 w-3" />
                                    </Button>
                                  </div>
                                ) : (
                                  <div
                                    className="cursor-pointer hover:bg-muted/50 rounded px-1 py-0.5 text-sm truncate max-w-[300px]"
                                    title={cell?.value || "Click to add"}
                                    onClick={() => startEdit(key, l.language_code, cell?.value || "")}
                                  >
                                    {cell?.value || (
                                      <span className="text-muted-foreground italic text-xs">empty</span>
                                    )}
                                  </div>
                                )}
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Page {page + 1} of {totalPages}
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page === 0}
                      onClick={() => setPage((p) => p - 1)}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page >= totalPages - 1}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
