import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getDict } from "@/lib/i18n/server";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/states";
import { buttonVariants } from "@/components/ui/button";
import { formatINR } from "@/lib/utils";
import type { RoadProject } from "@/types/models";

export const metadata = { title: "Approvals" };
export const dynamic = "force-dynamic";

export default async function ApprovalsPage() {
  const { dict } = await getDict();
  const sb = await createSupabaseServerClient();
  const { data } = await sb
    .from("road_projects")
    .select("*")
    .in("status", ["SUBMITTED", "UNDER_REVIEW", "APPROVED", "UNDER_CONSTRUCTION", "COMPLETED"])
    .order("updated_at", { ascending: false });
  const rows = (data ?? []) as RoadProject[];

  const pending = rows.filter((r) => ["SUBMITTED", "UNDER_REVIEW"].includes(r.status));
  const nextStage = rows.filter((r) => ["APPROVED", "UNDER_CONSTRUCTION", "COMPLETED"].includes(r.status));

  return (
    <div className="space-y-4">
      <PageHeader title={dict.nav.approvals} description="Projects awaiting an officer decision." />

      <Card>
        <CardHeader>
          <CardTitle>{dict.dashboard.pendingApprovals}</CardTitle>
        </CardHeader>
        <CardContent>
          {pending.length === 0 ? (
            <EmptyState title={dict.common.noResults} description="No projects are awaiting review." />
          ) : (
            <ApprovalTable rows={pending} dict={dict} />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Awaiting next-stage action</CardTitle>
        </CardHeader>
        <CardContent>
          {nextStage.length === 0 ? (
            <EmptyState title={dict.common.noResults} />
          ) : (
            <ApprovalTable rows={nextStage} dict={dict} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ApprovalTable({
  rows,
  dict,
}: {
  rows: RoadProject[];
  dict: Awaited<ReturnType<typeof getDict>>["dict"];
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{dict.fields.projectCode}</TableHead>
          <TableHead>{dict.fields.projectName}</TableHead>
          <TableHead className="text-right">{dict.fields.estimatedCost}</TableHead>
          <TableHead>{dict.common.status}</TableHead>
          <TableHead className="text-right">{dict.common.actions}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((p) => (
          <TableRow key={p.id}>
            <TableCell className="font-medium">{p.project_code}</TableCell>
            <TableCell>{p.project_name}</TableCell>
            <TableCell className="text-right tabular-nums">{formatINR(p.estimated_cost, { compact: true })}</TableCell>
            <TableCell>
              <StatusBadge value={p.status} />
            </TableCell>
            <TableCell className="text-right">
              <Link href={`/officer/projects/${p.id}`} className={buttonVariants({ variant: "outline", size: "sm" })}>
                {dict.common.view}
              </Link>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
