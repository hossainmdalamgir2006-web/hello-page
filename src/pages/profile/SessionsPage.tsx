import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SessionManagement } from '@/components/profile/SessionManagement';
import { LoginActivity } from '@/components/profile/LoginActivity';
import { Monitor, History } from 'lucide-react';

export default function SessionsPage() {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="sessions" className="w-full">
        <TabsList className="w-full justify-start gap-1 h-auto flex-wrap">
          <TabsTrigger value="sessions" className="gap-2">
            <Monitor className="h-4 w-4" />
            Active Sessions
          </TabsTrigger>
          <TabsTrigger value="activity" className="gap-2">
            <History className="h-4 w-4" />
            Login Activity
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sessions" className="mt-6">
          <SessionManagement />
        </TabsContent>

        <TabsContent value="activity" className="mt-6">
          <LoginActivity />
        </TabsContent>
      </Tabs>
    </div>
  );
}
