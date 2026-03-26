import { useState } from "react";
import { useCurrencySettings } from "@/hooks/useCurrencySettings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Star, Trash2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function CurrencySettings() {
  const { currencies, isLoading, updateCurrency, addCurrency, deleteCurrency, setDefault } = useCurrencySettings();
  const [showAdd, setShowAdd] = useState(false);
  const [newCode, setNewCode] = useState("");
  const [newSymbol, setNewSymbol] = useState("");
  const [newName, setNewName] = useState("");
  const [newRate, setNewRate] = useState("");

  const handleAdd = () => {
    if (!newCode || !newSymbol || !newName || !newRate) return;
    addCurrency.mutate(
      { code: newCode.toUpperCase(), symbol: newSymbol, name: newName, rate_to_bdt: parseFloat(newRate) },
      {
        onSuccess: () => {
          setNewCode(""); setNewSymbol(""); setNewName(""); setNewRate("");
          setShowAdd(false);
        },
      }
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader><Skeleton className="h-6 w-40" /></CardHeader>
        <CardContent><Skeleton className="h-40 w-full" /></CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Currency Settings</CardTitle>
          <CardDescription>Manage currencies and exchange rates. All prices stored in BDT.</CardDescription>
        </div>
        <Button size="sm" onClick={() => setShowAdd(!showAdd)}>
          <Plus className="h-4 w-4 mr-1" /> Add Currency
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {showAdd && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2 p-4 border rounded-lg bg-muted/30">
            <Input placeholder="Code (USD)" value={newCode} onChange={(e) => setNewCode(e.target.value)} />
            <Input placeholder="Symbol ($)" value={newSymbol} onChange={(e) => setNewSymbol(e.target.value)} />
            <Input placeholder="Name" value={newName} onChange={(e) => setNewName(e.target.value)} />
            <Input placeholder="Rate to BDT" type="number" value={newRate} onChange={(e) => setNewRate(e.target.value)} />
            <Button onClick={handleAdd} disabled={addCurrency.isPending}>Save</Button>
          </div>
        )}

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Symbol</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Rate (1 unit = ? BDT)</TableHead>
              <TableHead>Enabled</TableHead>
              <TableHead>Default</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currencies.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-mono font-medium">{c.code}</TableCell>
                <TableCell className="text-lg">{c.symbol}</TableCell>
                <TableCell>{c.name}</TableCell>
                <TableCell>
                  <Input
                    type="number"
                    className="w-28 h-8"
                    defaultValue={c.rate_to_bdt}
                    disabled={c.code === "BDT"}
                    onBlur={(e) => {
                      const val = parseFloat(e.target.value);
                      if (val && val !== c.rate_to_bdt) {
                        updateCurrency.mutate({ id: c.id, rate_to_bdt: val });
                      }
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Switch
                    checked={c.is_enabled}
                    disabled={c.is_default}
                    onCheckedChange={(checked) => updateCurrency.mutate({ id: c.id, is_enabled: checked })}
                  />
                </TableCell>
                <TableCell>
                  {c.is_default ? (
                    <Badge variant="default"><Star className="h-3 w-3 mr-1" /> Default</Badge>
                  ) : (
                    <Button variant="ghost" size="sm" onClick={() => setDefault.mutate(c.id)}>
                      Set Default
                    </Button>
                  )}
                </TableCell>
                <TableCell>
                  {!c.is_default && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive h-8 w-8"
                      onClick={() => deleteCurrency.mutate(c.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
