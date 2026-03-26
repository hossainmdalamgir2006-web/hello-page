
import { SEOHead } from "@/components/SEOHead";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Ruler, Info } from "lucide-react";
import { usePageContent } from "@/hooks/usePageContents";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/contexts/LanguageContext";

export default function SizeGuide() {
  const { data, loading } = usePageContent("size-guide");
  const title = data?.title || "Size Guide";
  const subtitle = data?.subtitle || "Find your perfect fit with our comprehensive size guide. All measurements are in inches.";
  const c = (data?.content || {}) as any;

  const mensSizes = c.mens_sizes || [];
  const womensSizes = c.womens_sizes || [];
  const howToMeasure = c.how_to_measure || [];
  const tips = c.tips || [];

  if (loading) {
    return <div className="container mx-auto px-4 py-12"><Skeleton className="h-10 w-48 mx-auto" /></div>;
  }

  return (
    <>
      <SEOHead title="Size Guide" description="Find your perfect fit with our size chart for men and women. Measurement guide included." canonicalPath="/size-guide" />
      <div className="container mx-auto px-4 py-12">
        <h1 className="font-display text-3xl md:text-4xl font-bold text-center mb-4">{title}</h1>
        <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">{subtitle}</p>

        <div className="max-w-4xl mx-auto">
          <Tabs defaultValue="men" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="men">Men's Sizes</TabsTrigger>
              <TabsTrigger value="women">Women's Sizes</TabsTrigger>
            </TabsList>

            <TabsContent value="men">
              <Card>
                <CardContent className="p-6">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Size</TableHead>
                        <TableHead>Chest (inches)</TableHead>
                        <TableHead>Waist (inches)</TableHead>
                        <TableHead>Hip (inches)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mensSizes.map((row: any) => (
                        <TableRow key={row.size}>
                          <TableCell className="font-medium">{row.size}</TableCell>
                          <TableCell>{row.chest}</TableCell>
                          <TableCell>{row.waist}</TableCell>
                          <TableCell>{row.hip}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="women">
              <Card>
                <CardContent className="p-6">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Size</TableHead>
                        <TableHead>Bust (inches)</TableHead>
                        <TableHead>Waist (inches)</TableHead>
                        <TableHead>Hip (inches)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {womensSizes.map((row: any) => (
                        <TableRow key={row.size}>
                          <TableCell className="font-medium">{row.size}</TableCell>
                          <TableCell>{row.bust}</TableCell>
                          <TableCell>{row.waist}</TableCell>
                          <TableCell>{row.hip}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {howToMeasure.length > 0 && (
            <div className="mt-12">
              <h2 className="font-display text-2xl font-bold mb-6 flex items-center gap-2">
                <Ruler className="h-6 w-6 text-store-primary" /> How to Measure
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                {howToMeasure.map((item: any, i: number) => (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <h3 className="font-semibold mb-2">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.text}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {tips.length > 0 && (
            <Card className="mt-8 bg-store-primary/5 border-store-primary/20">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Info className="h-5 w-5 text-store-primary" /> Sizing Tips
                </h3>
                <ul className="text-sm text-muted-foreground space-y-2">
                  {tips.map((tip: string, i: number) => <li key={i}>• {tip}</li>)}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
