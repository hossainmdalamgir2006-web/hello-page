import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RolePermissionsOverview } from './RolePermissionsOverview';
import { RoleChangeHistory } from './RoleChangeHistory';
import { Shield, History } from 'lucide-react';

export function RoleDetailsCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Role Details</CardTitle>
        <CardDescription>View permissions matrix and role change history</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="permissions" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="permissions" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Permissions Matrix
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              Change History
            </TabsTrigger>
          </TabsList>
          <TabsContent value="permissions">
            <RolePermissionsOverview />
          </TabsContent>
          <TabsContent value="history">
            <RoleChangeHistory />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
