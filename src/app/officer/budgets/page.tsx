import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getDict } from "@/lib/i18n/server";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/states";
import { formatINR, formatDate } from "@/lib/utils";

export const metadata = { title: "Budgets" };
export const dynamic = "force-dynamic";

export default async function BudgetsPage() {
  const { dict } = await getDict();
  const sb = await createSupabaseServerClient();
  const { data } = await sb
    .from("budgets")
    .select("*, road_projects(id, project_code, project_name)")
    .order("created_at", { ascending: false });
  const rows = (data ?? []) as any[];

  return (
    <div className="space-y-4">
      <PageHeader title={dict.nav.budgets} description="Budget allocations across all projects." />
      <Card className="p-2">
        {rows.length === 0 ? (
          <div className="p-6">
            <EmptyState title={dict.common.noResults} description="Budgets are created within a project's Budget tab." />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{dict.nav.projects}</TableHead>
                <TableHead className="text-right">{dict.fields.estimatedCost}</TableHead>
                <TableHead className="text-right">{dict.fields.approvedCost}</TableHead>
                <TableHead>{dict.fields.fundingSource}</TableHead>
                <TableHead>{dict.common.status}</TableHead>
                <TableHead>{dict.fields.date}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((b) => (
                <TableRow key={b.id}>
                  <TableCell>
                    {b.road_projects ? (
                      <Link href={`/officer/projects/${b.road_projects.id}`} className="font-medium hover:underline">
                        {b.road_projects.project_code}
                      </Link>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{formatINR(b.estimated_amount, { compact: true })}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatINR(b.approved_amount, { compact: true })}</TableCell>
                  <TableCell className="text-muted-foreground">{b.funding_source}</TableCell>
                  <TableCell>
                    <StatusBadge value={b.status} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(b.approval_date ?? b.created_at)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
