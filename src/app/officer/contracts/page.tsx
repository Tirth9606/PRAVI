import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getDict } from "@/lib/i18n/server";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/states";
import { formatINR, formatDate } from "@/lib/utils";

export const metadata = { title: "Contracts" };
export const dynamic = "force-dynamic";

export default async function ContractsPage() {
  const { dict } = await getDict();
  const sb = await createSupabaseServerClient();
  const { data } = await sb
    .from("contracts")
    .select("*, road_projects(id, project_code), contractors(name)")
    .order("created_at", { ascending: false });
  const rows = (data ?? []) as any[];

  return (
    <div className="space-y-4">
      <PageHeader title={dict.nav.contracts} description="Awarded contracts and work orders." />
      <Card className="p-2">
        {rows.length === 0 ? (
          <div className="p-6">
            <EmptyState title={dict.common.noResults} description="Contracts are created when a contractor is selected on a project." />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Contract No.</TableHead>
                <TableHead>{dict.nav.projects}</TableHead>
                <TableHead>{dict.fields.contractor}</TableHead>
                <TableHead className="text-right">{dict.fields.contractValue}</TableHead>
                <TableHead>Work Order</TableHead>
                <TableHead>{dict.common.status}</TableHead>
                <TableHead>Start</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.contract_number}</TableCell>
                  <TableCell>
                    {c.road_projects ? (
                      <Link href={`/officer/projects/${c.road_projects.id}`} className="hover:underline">
                        {c.road_projects.project_code}
                      </Link>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{c.contractors?.name ?? "—"}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatINR(c.contract_value, { compact: true })}</TableCell>
                  <TableCell className="text-muted-foreground">{c.work_order_number ?? "—"}</TableCell>
                  <TableCell>
                    <StatusBadge value={c.status} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(c.start_date)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
