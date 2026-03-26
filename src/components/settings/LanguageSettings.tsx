import { useState } from "react";
import { useLanguageSettings, LanguageSetting } from "@/hooks/useLanguageSettings";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, Star, Loader2, Globe } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function LanguageSettings() {
  const { t } = useLanguage();
  const { languages, isLoading, toggleLanguage, setDefault, addLanguage, deleteLanguage } = useLanguageSettings();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ language_code: "", language_name: "", native_name: "", flag_emoji: "" });

  const handleAdd = () => {
    if (!form.language_code || !form.language_name || !form.native_name) return;
    addLanguage.mutate(form, {
      onSuccess: () => {
        setForm({ language_code: "", language_name: "", native_name: "", flag_emoji: "" });
        setDialogOpen(false);
      },
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader><Skeleton className="h-6 w-40" /></CardHeader>
        <CardContent className="space-y-3">
          {[1, 2].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Language Management
          </CardTitle>
          <CardDescription>Enable/disable languages and set default language for your store</CardDescription>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2"><Plus className="h-4 w-4" /> Add Language</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add New Language</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Language Code</Label>
                  <Input placeholder="e.g. hi, ar, es" value={form.language_code} onChange={(e) => setForm((p) => ({ ...p, language_code: e.target.value.toLowerCase() }))} maxLength={5} />
                </div>
                <div className="space-y-2">
                  <Label>Flag Emoji</Label>
                  <Input placeholder="e.g. 🇮🇳" value={form.flag_emoji} onChange={(e) => setForm((p) => ({ ...p, flag_emoji: e.target.value }))} maxLength={4} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Language Name (English)</Label>
                <Input placeholder="e.g. Hindi" value={form.language_name} onChange={(e) => setForm((p) => ({ ...p, language_name: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Native Name</Label>
                <Input placeholder="e.g. हिन्दी" value={form.native_name} onChange={(e) => setForm((p) => ({ ...p, native_name: e.target.value }))} />
              </div>
              <Button onClick={handleAdd} disabled={addLanguage.isPending || !form.language_code || !form.language_name || !form.native_name} className="w-full">
                {addLanguage.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Add Language
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Flag</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Native Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Default</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {languages.map((lang) => (
              <TableRow key={lang.id}>
                <TableCell className="text-xl">{lang.flag_emoji}</TableCell>
                <TableCell><code className="bg-muted px-1.5 py-0.5 rounded text-xs">{lang.language_code}</code></TableCell>
                <TableCell>{lang.language_name}</TableCell>
                <TableCell>{lang.native_name}</TableCell>
                <TableCell>
                  <Switch
                    checked={lang.enabled}
                    disabled={lang.is_default || toggleLanguage.isPending}
                    onCheckedChange={(checked) => toggleLanguage.mutate({ id: lang.id, enabled: checked })}
                  />
                </TableCell>
                <TableCell>
                  {lang.is_default ? (
                    <Badge className="gap-1"><Star className="h-3 w-3" /> Default</Badge>
                  ) : (
                    <Button variant="ghost" size="sm" onClick={() => setDefault.mutate(lang.id)} disabled={setDefault.isPending}>
                      Set Default
                    </Button>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {!lang.is_default && (
                    <Button variant="ghost" size="icon" onClick={() => deleteLanguage.mutate(lang.id)} disabled={deleteLanguage.isPending}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <p className="text-xs text-muted-foreground mt-4">
          Note: Adding a new language here enables it in the language toggle. Translations for new languages need to be added separately in the codebase.
        </p>
      </CardContent>
    </Card>
  );
}
