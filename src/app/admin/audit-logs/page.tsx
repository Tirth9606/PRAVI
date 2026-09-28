import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getDict } from "@/lib/i18n/server";
import { enumLabel } from "@/locales/enum-labels";
import { AUDIT_ACTIONS } from "@/lib/domain/enums";
import { AuditLogFilter } from "@/features/admin/audit-filter";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination } from "@/components/ui/pagination";
import { EmptyState } from "@/components/ui/states";
import { formatDateTime } from "@/lib/utils";
import type { AuditLog, AppUser } from "@/types/models";

export const metadata = { title: "Audit Logs" };
export const dynamic = "force-dynamic";

const PAGE_SIZE = 30;

export default async function AuditLogsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const { locale, dict } = await getDict();
  const page = Math.max(1, sp.page ? Number(sp.page) : 1);
  const sb = await createSupabaseServerClient();

  let q = sb.from("audit_logs").select("*", { count: "exact" });
  if (sp.action) q = q.eq("action", sp.action);
  q = q.order("timestamp", { ascending: false }).range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
  const { data, count } = await q;
  const rows = (data ?? []) as AuditLog[];

  const { data: usersData } = await sb.from("users").select("id, name");
  const userMap = new Map<string, string>();
  for (const u of (usersData ?? []) as Pick<AppUser, "id" | "name">[]) userMap.set(u.id, u.name);

  return (
    <div className="space-y-4">
      <PageHeader title={dict.nav.auditLogs} description="Append-only record of every consequential action." />
      <AuditLogFilter actions={AUDIT_ACTIONS as unknown as string[]} />
      <Card className="p-2">
        {rows.length === 0 ? (
          <div className="p-6"><EmptyState title={dict.common.noResults} /></div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Entity</TableHead>
                  <TableHead>Change</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="whitespace-nowrap text-muted-foreground">{formatDateTime(r.timestamp)}</TableCell>
                    <TableCell>{r.user_id ? (userMap.get(r.user_id) ?? "—") : "system"}</TableCell>
                    <TableCell className="font-medium">{enumLabel(r.action, locale)}</TableCell>
                    <TableCell className="text-muted-foreground">{r.entity_type}</TableCell>
                    <TableCell className="max-w-xs truncate text-xs text-muted-foreground">
                      {r.new_value ? JSON.stringify(r.new_value) : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="px-2">
              <Pagination page={page} pageSize={PAGE_SIZE} total={count ?? 0} />
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
