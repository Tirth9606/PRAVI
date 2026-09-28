import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getDict } from "@/lib/i18n/server";
import { DepartmentForm } from "@/features/admin/admin-forms";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/states";
import { formatDate } from "@/lib/utils";
import type { Department } from "@/types/models";

export const metadata = { title: "Departments" };
export const dynamic = "force-dynamic";

export default async function AdminDepartmentsPage() {
  const { dict } = await getDict();
  const sb = await createSupabaseServerClient();
  const { data } = await sb.from("departments").select("*").order("name");
  const rows = (data ?? []) as Department[];

  return (
    <div className="space-y-4">
      <PageHeader title={dict.nav.departments} description="Government departments owning road projects." actions={<DepartmentForm />} />
      <Card className="p-2">
        {rows.length === 0 ? (
          <div className="p-6"><EmptyState title={dict.common.noResults} /></div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Contact Email</TableHead>
                <TableHead>{dict.fields.date}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((d) => (
                <TableRow key={d.id}>
                  <TableCell className="font-medium">{d.name}</TableCell>
                  <TableCell className="text-muted-foreground">{d.code}</TableCell>
                  <TableCell className="text-muted-foreground">{d.contact_email ?? "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(d.created_at)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
