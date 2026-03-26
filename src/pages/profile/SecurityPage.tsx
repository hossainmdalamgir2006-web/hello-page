import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TwoFactorSetup } from '@/components/profile/TwoFactorSetup';
import { RecoveryCodes } from '@/components/profile/RecoveryCodes';
import { TrustedDevices } from '@/components/profile/TrustedDevices';
import { ShieldCheck, KeyRound, Smartphone } from 'lucide-react';

export default function SecurityPage() {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="2fa" className="w-full">
        <TabsList className="w-full justify-start gap-1 h-auto flex-wrap">
          <TabsTrigger value="2fa" className="gap-2">
            <ShieldCheck className="h-4 w-4" />
            Two-Factor Auth
          </TabsTrigger>
          <TabsTrigger value="recovery" className="gap-2">
            <KeyRound className="h-4 w-4" />
            Recovery Codes
          </TabsTrigger>
          <TabsTrigger value="devices" className="gap-2">
            <Smartphone className="h-4 w-4" />
            Trusted Devices
          </TabsTrigger>
        </TabsList>

        <TabsContent value="2fa" className="mt-6">
          <TwoFactorSetup />
        </TabsContent>

        <TabsContent value="recovery" className="mt-6">
          <RecoveryCodes />
        </TabsContent>

        <TabsContent value="devices" className="mt-6">
          <TrustedDevices />
        </TabsContent>
      </Tabs>
    </div>
  );
}
