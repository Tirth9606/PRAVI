import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getDict } from "@/lib/i18n/server";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/states";
import { formatINR, formatDate } from "@/lib/utils";

export const metadata = { title: "Tenders" };
export const dynamic = "force-dynamic";

export default async function TendersPage() {
  const { dict } = await getDict();
  const sb = await createSupabaseServerClient();
  const { data } = await sb
    .from("tenders")
    .select("*, road_projects(id, project_code)")
    .order("created_at", { ascending: false });
  const rows = (data ?? []) as any[];

  return (
    <div className="space-y-4">
      <PageHeader title={dict.nav.tenders} description="All tenders across the procurement pipeline." />
      <Card className="p-2">
        {rows.length === 0 ? (
          <div className="p-6">
            <EmptyState title={dict.common.noResults} description="Tenders are created within a budget-approved project's Tender tab." />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tender No.</TableHead>
                <TableHead>{dict.nav.projects}</TableHead>
                <TableHead className="text-right">{dict.fields.estimatedCost}</TableHead>
                <TableHead>Closing</TableHead>
                <TableHead>{dict.common.status}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="font-medium">{t.tender_number}</TableCell>
                  <TableCell>
                    {t.road_projects ? (
                      <Link href={`/officer/projects/${t.road_projects.id}`} className="hover:underline">
                        {t.road_projects.project_code}
                      </Link>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{formatINR(t.estimated_value, { compact: true })}</TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(t.closing_date)}</TableCell>
                  <TableCell>
                    <StatusBadge value={t.status} />
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
