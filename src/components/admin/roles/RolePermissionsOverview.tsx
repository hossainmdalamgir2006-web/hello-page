import { Check, X } from 'lucide-react';

const permissions = [
  { name: 'View Store', user: true, support: true, manager: true, admin: true },
  { name: 'Place Orders', user: true, support: true, manager: true, admin: true },
  { name: 'View Dashboard', user: false, support: true, manager: true, admin: true },
  { name: 'Manage Support Tickets', user: false, support: true, manager: true, admin: true },
  { name: 'Manage Live Chat', user: false, support: true, manager: true, admin: true },
  { name: 'Manage Orders', user: false, support: false, manager: true, admin: true },
  { name: 'Manage Products', user: false, support: false, manager: true, admin: true },
  { name: 'Manage Customers', user: false, support: false, manager: true, admin: true },
  { name: 'View Reports', user: false, support: false, manager: true, admin: true },
  { name: 'Manage Coupons', user: false, support: false, manager: true, admin: true },
  { name: 'System Settings', user: false, support: false, manager: false, admin: true },
  { name: 'Manage Roles', user: false, support: false, manager: false, admin: true },
  { name: 'Audit Logs', user: false, support: false, manager: false, admin: true },
  { name: 'Database Backups', user: false, support: false, manager: false, admin: true },
];

const roles = ['user', 'support', 'manager', 'admin'] as const;
const roleLabels: Record<string, string> = { user: 'User', support: 'Support', manager: 'Manager', admin: 'Admin' };

export function RolePermissionsOverview() {
  return (
    <div className="rounded-md border overflow-x-auto mt-2">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="text-left p-3 font-medium">Permission</th>
            {roles.map((r) => (
              <th key={r} className="text-center p-3 font-medium min-w-[80px]">{roleLabels[r]}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {permissions.map((perm) => (
            <tr key={perm.name} className="border-b last:border-0 hover:bg-muted/30">
              <td className="p-3 text-muted-foreground">{perm.name}</td>
              {roles.map((r) => (
                <td key={r} className="text-center p-3">
                  {perm[r] ? (
                    <Check className="h-4 w-4 text-emerald-500 mx-auto" />
                  ) : (
                    <X className="h-4 w-4 text-muted-foreground/40 mx-auto" />
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
