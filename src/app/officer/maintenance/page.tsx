import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getDict } from "@/lib/i18n/server";
import { MaintenanceActions } from "@/features/roads/road-forms";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/states";
import { formatINR } from "@/lib/utils";
import type { MaintenanceStatus } from "@/lib/domain/enums";

export const metadata = { title: "Maintenance" };
export const dynamic = "force-dynamic";

export default async function MaintenancePage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const { dict } = await getDict();
  const sb = await createSupabaseServerClient();
  let q = sb.from("maintenance").select("*, roads(id, road_code, road_name)").order("created_at", { ascending: false });
  if (sp.status) q = q.eq("status", sp.status);
  const { data } = await q;
  const rows = (data ?? []) as any[];

  return (
    <div className="space-y-4">
      <PageHeader title={dict.nav.maintenance} description="Maintenance workflow: PENDING → APPROVED → IN_PROGRESS → COMPLETED." />
      <Card className="p-2">
        {rows.length === 0 ? (
          <div className="p-6">
            <EmptyState title={dict.common.noResults} description="Maintenance tasks are raised from a road's Maintenance tab." />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{dict.fields.road}</TableHead>
                <TableHead>{dict.fields.workType}</TableHead>
                <TableHead>{dict.fields.priority}</TableHead>
                <TableHead className="text-right">Est. Cost</TableHead>
                <TableHead>{dict.common.status}</TableHead>
                <TableHead className="text-right">{dict.common.actions}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((m) => (
                <TableRow key={m.id}>
                  <TableCell>
                    {m.roads ? (
                      <Link href={`/officer/roads/${m.roads.id}`} className="font-medium hover:underline">
                        {m.roads.road_code}
                      </Link>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell>{m.work_type}</TableCell>
                  <TableCell><StatusBadge value={m.priority} /></TableCell>
                  <TableCell className="text-right tabular-nums">{formatINR(m.estimated_cost, { compact: true })}</TableCell>
                  <TableCell><StatusBadge value={m.status} /></TableCell>
                  <TableCell className="text-right">
                    <MaintenanceActions id={m.id} status={m.status as MaintenanceStatus} />
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
