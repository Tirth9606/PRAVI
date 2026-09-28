import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getDict } from "@/lib/i18n/server";
import { EditUserButton, InviteUserForm } from "@/features/admin/admin-forms";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/states";
import type { AppUser, Department } from "@/types/models";

export const metadata = { title: "Users" };
export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const { dict } = await getDict();
  const sb = await createSupabaseServerClient();
  const [{ data: users }, { data: departments }] = await Promise.all([
    sb.from("users").select("*").order("name"),
    sb.from("departments").select("*").order("name"),
  ]);
  const rows = (users ?? []) as AppUser[];
  const depts = (departments ?? []) as Department[];
  const deptName = (id: string | null) => depts.find((d) => d.id === id)?.name ?? "—";

  return (
    <div className="space-y-4">
      <PageHeader title={dict.nav.users} description="Manage user roles, status and department." actions={<InviteUserForm departments={depts} />} />
      <Card className="p-2">
        {rows.length === 0 ? (
          <div className="p-6"><EmptyState title={dict.common.noResults} /></div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>{dict.nav.departments}</TableHead>
                <TableHead>{dict.common.status}</TableHead>
                <TableHead className="text-right">{dict.common.actions}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.name}</TableCell>
                  <TableCell className="text-muted-foreground">{u.email}</TableCell>
                  <TableCell><StatusBadge value={u.role} /></TableCell>
                  <TableCell className="text-muted-foreground">{deptName(u.department_id)}</TableCell>
                  <TableCell><StatusBadge value={u.status} /></TableCell>
                  <TableCell className="text-right">
                    <EditUserButton user={u} departments={depts} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
