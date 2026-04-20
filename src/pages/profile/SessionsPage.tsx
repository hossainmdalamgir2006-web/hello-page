import { SessionManagement } from '@/components/profile/SessionManagement';
import { LoginActivity } from '@/components/profile/LoginActivity';

export default function SessionsPage() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-6">
        <SessionManagement />
      </div>
      <div className="space-y-6">
        <LoginActivity />
      </div>
    </div>
  );
}
